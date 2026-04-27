-- ============================================
-- MIGRATION 013: FULL SYNC — Omniscient Ascension
-- Adds: counselor_profiles, journals, wellness_progress,
--        forum_posts, forum_comments, notifications,
--        announcements, direct_messages
-- Modifies: profiles (add 'admin' role)
-- NOTE: Fully idempotent — safe to re-run without data loss
-- ============================================

-- ============================================
-- 1. EXTEND PROFILES: Add 'admin' role
-- ============================================
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('student', 'counselor', 'admin'));

-- ============================================
-- 2. COUNSELOR PROFILES (extended bio/rating)
-- ============================================
create table if not exists counselor_profiles (
  id            uuid references profiles(id) on delete cascade primary key,
  bio           text default '',
  specialties   text[] default '{}',
  rating        numeric(2,1) default 0.0 check (rating >= 0 and rating <= 5),
  created_at    timestamptz default now()
);

alter table counselor_profiles enable row level security;

-- Everyone can read counselor profiles
drop policy if exists "Anyone can view counselor profiles" on counselor_profiles;
create policy "Anyone can view counselor profiles"
  on counselor_profiles for select using (true);

-- Only the counselor themselves can update their profile
drop policy if exists "Counselors can update own profile" on counselor_profiles;
create policy "Counselors can update own profile"
  on counselor_profiles for update using (auth.uid() = id);

drop policy if exists "Counselors can insert own profile" on counselor_profiles;
create policy "Counselors can insert own profile"
  on counselor_profiles for insert with check (auth.uid() = id);

-- ============================================
-- 3. JOURNALS (Private to user)
-- ============================================
create table if not exists journals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade not null,
  title         text default '',
  content       text not null,
  ai_insight    text,          -- one-sentence LLM summary, fuel for Omniscient Engine
  created_at    timestamptz default now()
);

alter table journals enable row level security;

-- Strictly private: user can only see/manage their own journals
drop policy if exists "Users own their journals" on journals;
create policy "Users own their journals"
  on journals for all using (auth.uid() = user_id);

create index if not exists idx_journals_user_time on journals(user_id, created_at desc);

-- ============================================
-- 4. WELLNESS PROGRESS (Gamified XP/Level/Streak)
-- ============================================
create table if not exists wellness_progress (
  user_id       uuid references profiles(id) on delete cascade primary key,
  xp            int default 0,
  level         int default 1,
  streak        int default 0,
  last_activity timestamptz default now()
);

alter table wellness_progress enable row level security;

-- Strictly private
drop policy if exists "Users own their wellness progress" on wellness_progress;
create policy "Users own their wellness progress"
  on wellness_progress for all using (auth.uid() = user_id);

-- ============================================
-- 5. FORUM POSTS
-- ============================================
create table if not exists forum_posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid references profiles(id) on delete cascade not null,
  title         text not null,
  content       text not null,
  tags          text[] default '{}',
  anon_alias    text,          -- anonymous display name like "Anonymous Panda"
  likes         int default 0,
  is_flagged    boolean default false,
  created_at    timestamptz default now()
);

alter table forum_posts enable row level security;

-- Everyone can read non-flagged posts
drop policy if exists "Anyone can view non-flagged posts" on forum_posts;
create policy "Anyone can view non-flagged posts"
  on forum_posts for select using (is_flagged = false or auth.uid() = author_id);

-- Users can create their own posts
drop policy if exists "Users can create posts" on forum_posts;
create policy "Users can create posts"
  on forum_posts for insert with check (auth.uid() = author_id);

-- Users can update their own posts
drop policy if exists "Users can update own posts" on forum_posts;
create policy "Users can update own posts"
  on forum_posts for update using (auth.uid() = author_id);

-- Users can delete their own posts
drop policy if exists "Users can delete own posts" on forum_posts;
create policy "Users can delete own posts"
  on forum_posts for delete using (auth.uid() = author_id);

-- Counselors and admins can flag/moderate any post
drop policy if exists "Moderators can update any post" on forum_posts;
create policy "Moderators can update any post"
  on forum_posts for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('counselor', 'admin')
    )
  );

create index if not exists idx_forum_posts_time on forum_posts(created_at desc);
create index if not exists idx_forum_posts_author on forum_posts(author_id);

-- ============================================
-- 6. FORUM COMMENTS
-- ============================================
create table if not exists forum_comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid references forum_posts(id) on delete cascade not null,
  author_id     uuid references profiles(id) on delete cascade not null,
  content       text not null,
  anon_alias    text,
  created_at    timestamptz default now()
);

alter table forum_comments enable row level security;

-- Everyone can read comments on non-flagged posts
drop policy if exists "Anyone can view comments" on forum_comments;
create policy "Anyone can view comments"
  on forum_comments for select using (true);

drop policy if exists "Users can create comments" on forum_comments;
create policy "Users can create comments"
  on forum_comments for insert with check (auth.uid() = author_id);

drop policy if exists "Users can update own comments" on forum_comments;
create policy "Users can update own comments"
  on forum_comments for update using (auth.uid() = author_id);

drop policy if exists "Users can delete own comments" on forum_comments;
create policy "Users can delete own comments"
  on forum_comments for delete using (auth.uid() = author_id);

create index if not exists idx_forum_comments_post on forum_comments(post_id, created_at asc);

-- ============================================
-- 7. NOTIFICATIONS
-- ============================================
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade not null,
  message       text not null,
  type          text check (type in ('dm', 'booking', 'forum_reply', 'crisis', 'level_up', 'system')) not null,
  is_read       boolean default false,
  metadata      jsonb default '{}',   -- flexible payload (e.g., link, post_id)
  created_at    timestamptz default now()
);

alter table notifications enable row level security;

-- Strictly private
drop policy if exists "Users own their notifications" on notifications;
create policy "Users own their notifications"
  on notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on notifications;
create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

create index if not exists idx_notifications_user_unread on notifications(user_id, is_read, created_at desc);

-- ============================================
-- 8. ANNOUNCEMENTS (Role-targeted broadcasts)
-- ============================================
create table if not exists announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text not null,
  target        text check (target in ('all', 'student', 'counselor', 'admin')) not null default 'all',
  created_by    uuid references profiles(id) not null,
  created_at    timestamptz default now()
);

alter table announcements enable row level security;

-- Role-based read: users see announcements targeted to their role or 'all'
drop policy if exists "Users can view targeted announcements" on announcements;
create policy "Users can view targeted announcements"
  on announcements for select using (
    target = 'all'
    or target = (select role from profiles where id = auth.uid())
  );

-- Only counselors and admins can create announcements
drop policy if exists "Staff can create announcements" on announcements;
create policy "Staff can create announcements"
  on announcements for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('counselor', 'admin')
    )
  );

create index if not exists idx_announcements_target_time on announcements(target, created_at desc);

-- ============================================
-- 9. DIRECT MESSAGES
-- ============================================
create table if not exists direct_messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid references profiles(id) on delete cascade not null,
  receiver_id   uuid references profiles(id) on delete cascade not null,
  content       text not null,
  is_read       boolean default false,
  created_at    timestamptz default now()
);

alter table direct_messages enable row level security;

-- Only participants can see their messages
drop policy if exists "Participants can view their messages" on direct_messages;
create policy "Participants can view their messages"
  on direct_messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

-- Users can send messages
drop policy if exists "Users can send messages" on direct_messages;
create policy "Users can send messages"
  on direct_messages for insert with check (auth.uid() = sender_id);

-- Receiver can mark as read
drop policy if exists "Receiver can update read status" on direct_messages;
create policy "Receiver can update read status"
  on direct_messages for update using (auth.uid() = receiver_id);

create index if not exists idx_dm_participants on direct_messages(sender_id, receiver_id, created_at desc);
create index if not exists idx_dm_receiver on direct_messages(receiver_id, is_read, created_at desc);

-- ============================================
-- 10. ENABLE REALTIME for new tables
-- ============================================
do $$ begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table direct_messages;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table forum_comments;
exception when duplicate_object then null;
end $$;
