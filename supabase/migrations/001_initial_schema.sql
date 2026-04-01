-- ============================================
-- MINDBRIDGE DATABASE SCHEMA
-- Version: 1.0
-- ============================================

-- ============================================
-- PROFILES (extends Supabase Auth)
-- ============================================
create table if not exists profiles (
  id              uuid references auth.users on delete cascade primary key,
  name            text,
  role            text check (role in ('student', 'counselor')) not null,
  institution     text,
  counselor_id    uuid references profiles(id), -- student's assigned counselor
  created_at      timestamptz default now()
);

-- RLS: Users read/write only their own profile
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Counselors can view their assigned students
create policy "Counselors can view assigned students"
  on profiles for select using (
    exists (
      select 1 from profiles p 
      where p.id = auth.uid() 
      and p.role = 'counselor'
    )
    and counselor_id = auth.uid()
  );

-- ============================================
-- MOOD LOGS
-- ============================================
create table if not exists mood_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  score       int check (score between 1 and 5) not null,
  note        text,
  logged_at   timestamptz default now()
);

alter table mood_logs enable row level security;

create policy "Students own their mood logs"
  on mood_logs for all using (auth.uid() = user_id);

-- Index for efficient history queries
create index idx_mood_logs_user_time on mood_logs(user_id, logged_at desc);

-- ============================================
-- CHAT SESSIONS
-- ============================================
create table if not exists chat_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id) on delete cascade not null,
  title            text,
  created_at       timestamptz default now(),
  last_message_at  timestamptz default now()
);

alter table chat_sessions enable row level security;

create policy "Students own their sessions"
  on chat_sessions for all using (auth.uid() = user_id);

create index idx_chat_sessions_user_time on chat_sessions(user_id, last_message_at desc);

-- ============================================
-- CHAT MESSAGES
-- ============================================
create table if not exists chat_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade not null,
  session_id   uuid references chat_sessions(id) on delete cascade not null,
  role         text check (role in ('user', 'assistant')) not null,
  content      text not null,
  crisis_flag  boolean default false,
  proactive    boolean default false, -- true if AI initiated
  sent_at      timestamptz default now()
);

alter table chat_messages enable row level security;

create policy "Students own their messages"
  on chat_messages for all using (auth.uid() = user_id);

-- Index for efficient session/history queries
create index idx_chat_messages_user_session on chat_messages(user_id, session_id, sent_at desc);
create index idx_chat_messages_user_time on chat_messages(user_id, sent_at desc);

-- ============================================
-- ASSESSMENTS (implicit PHQ-9/GAD-7 from chat)
-- ============================================
create table if not exists assessments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade not null,
  criteria_flagged  text[] default '{}', -- ['low_mood', 'sleep_issues', 'anhedonia']
  severity          text check (severity in ('none', 'mild', 'moderate', 'severe')) default 'none',
  assessed_at       timestamptz default now()
);

alter table assessments enable row level security;

create policy "Students own their assessments"
  on assessments for all using (auth.uid() = user_id);

-- Index for history queries
create index idx_assessments_user_time on assessments(user_id, assessed_at desc);

-- ============================================
-- COUNSELOR SLOTS
-- ============================================
create table if not exists counselor_slots (
  id             uuid primary key default gen_random_uuid(),
  counselor_id   uuid references profiles(id) on delete cascade not null,
  slot_start     timestamptz not null,
  slot_end       timestamptz not null,
  available      boolean default true,
  held_until     timestamptz -- temporary hold during booking flow
);

alter table counselor_slots enable row level security;

-- Counselors manage their own slots
create policy "Counselors own their slots"
  on counselor_slots for all using (auth.uid() = counselor_id);

-- Students can read available slots
create policy "Students read available slots"
  on counselor_slots for select using (
    available = true 
    or exists (
      select 1 from profiles p 
      where p.id = auth.uid() 
      and p.role = 'student'
    )
  );

-- Index for finding available slots
create index idx_counselor_slots_available on counselor_slots(available, slot_start) 
  where available = true;

-- ============================================
-- BOOKINGS
-- ============================================
create table if not exists bookings (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid references profiles(id) not null,
  counselor_id        uuid references profiles(id) not null,
  slot_id             uuid references counselor_slots(id),
  slot_start          timestamptz not null,
  slot_end            timestamptz not null,
  type                text check (type in ('anonymous', 'named', 'crisis')) not null,
  status              text check (status in ('pending_confirmation', 'confirmed', 'cancelled', 'completed')) default 'pending_confirmation',
  notes_encrypted     text, -- AES-256, counselor-only
  created_at          timestamptz default now()
);

alter table bookings enable row level security;

create policy "Students see their bookings"
  on bookings for select using (auth.uid() = student_id);

create policy "Students can create bookings"
  on bookings for insert with check (auth.uid() = student_id);

create policy "Students can update their pending bookings"
  on bookings for update using (
    auth.uid() = student_id 
    and status = 'pending_confirmation'
  );

create policy "Counselors manage their bookings"
  on bookings for all using (auth.uid() = counselor_id);

-- Index for counselor dashboard
create index idx_bookings_counselor_status on bookings(counselor_id, status, slot_start);
create index idx_bookings_student on bookings(student_id, created_at desc);

-- ============================================
-- CRISIS LOGS (no message content stored)
-- ============================================
create table if not exists crisis_logs (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references profiles(id) not null,
  counselor_id   uuid references profiles(id) not null,
  severity       text default 'high',
  acknowledged   boolean default false,
  triggered_at   timestamptz default now()
);

alter table crisis_logs enable row level security;

-- Counselors see their own crisis alerts (Realtime subscribes to this)
create policy "Counselors see their crisis alerts"
  on crisis_logs for select using (auth.uid() = counselor_id);

create policy "Counselors can acknowledge alerts"
  on crisis_logs for update using (auth.uid() = counselor_id);

-- System can insert crisis logs (via service role)
-- Note: Insert policy for service role is handled by bypassing RLS

-- Index for realtime and dashboard queries
create index idx_crisis_logs_counselor on crisis_logs(counselor_id, acknowledged, triggered_at desc);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call function on new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Function to release expired slot holds
create or replace function release_expired_holds()
returns void as $$
begin
  update counselor_slots
  set available = true, held_until = null
  where held_until is not null and held_until < now();
end;
$$ language plpgsql security definer;

-- Function to get student's latest assessment
create or replace function get_latest_assessment(p_user_id uuid)
returns table (
  criteria_flagged text[],
  severity text,
  assessed_at timestamptz
) as $$
begin
  return query
  select a.criteria_flagged, a.severity, a.assessed_at
  from assessments a
  where a.user_id = p_user_id
  order by a.assessed_at desc
  limit 1;
end;
$$ language plpgsql security definer;

-- ============================================
-- ENABLE REALTIME
-- ============================================
-- Enable realtime for crisis_logs (counselor alerts)
alter publication supabase_realtime add table crisis_logs;

-- Enable realtime for bookings (counselor dashboard updates)
alter publication supabase_realtime add table bookings;

-- Enable realtime for chat_messages (for proactive messages)
alter publication supabase_realtime add table chat_messages;
