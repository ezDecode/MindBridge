-- Allow authenticated users to view counselor profiles
-- This is necessary for students to browse and select counselors for booking.

create policy "Anyone can view counselor profiles"
  on public.profiles
  for select
  using (
    role = 'counselor'
  );

-- Also ensure students can see the counselors in the join on slots
-- (Already covered by the above policy on profiles table)
