-- ============================================
-- PROACTIVE OUTREACH LOGS
-- Migration: 002_proactive_outreach
-- ============================================

-- Table to track proactive check-in messages sent by the system
create table if not exists proactive_outreach_logs (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references profiles(id) on delete cascade not null,
  urgency        text check (urgency in ('low', 'medium', 'high')) not null,
  reason         text not null, -- Why outreach was triggered
  message_sent   text not null, -- The actual message sent
  session_id     uuid, -- Reference to the chat session created
  responded      boolean default false, -- Did student reply?
  created_at     timestamptz default now()
);

alter table proactive_outreach_logs enable row level security;

-- Students can view outreach logs about themselves
create policy "Students view own outreach logs"
  on proactive_outreach_logs for select using (auth.uid() = student_id);

-- Counselors can view outreach logs for their students
create policy "Counselors view student outreach logs"
  on proactive_outreach_logs for select using (
    exists (
      select 1 from profiles p 
      where p.id = auth.uid() 
      and p.role = 'counselor'
      and exists (
        select 1 from profiles s 
        where s.id = proactive_outreach_logs.student_id 
        and s.counselor_id = auth.uid()
      )
    )
  );

-- Index for querying by student and time
create index idx_proactive_outreach_student on proactive_outreach_logs(student_id, created_at desc);

-- ============================================
-- Add is_proactive column to chat_messages if not exists
-- (in case initial schema doesn't have it)
-- ============================================
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'chat_messages' and column_name = 'is_proactive'
  ) then
    alter table chat_messages add column is_proactive boolean default false;
  end if;
end $$;

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for crisis logs and outreach
-- ============================================

