-- Fix infinite recursion in RLS policies
-- Migration: 003_fix_rls_recursion

-- Drop and recreate the problematic policy on profiles
drop policy if exists "Counselors can view assigned students" on profiles;

create policy "Counselors can view assigned students"
  on profiles for select using (counselor_id = auth.uid());

-- Drop and recreate the problematic policy on proactive_outreach_logs
drop policy if exists "Counselors view student outreach logs" on proactive_outreach_logs;

create policy "Counselors view student outreach logs"
  on proactive_outreach_logs for select using (
    exists (
      select 1 from profiles s 
      where s.id = proactive_outreach_logs.student_id 
      and s.counselor_id = auth.uid()
    )
  );

-- Fix counselor_slots policy - use simple OR without self-referential exists
drop policy if exists "Students read available slots" on counselor_slots;

create policy "Students read available slots"
  on counselor_slots for select using (available = true);
