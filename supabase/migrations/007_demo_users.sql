-- ============================================
-- DEMO USERS MIGRATION
-- Adds 'admin' role support + seeds 3 demo users
-- ============================================

-- 1. Allow 'admin' role in profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'counselor', 'admin'));

-- 2. Insert demo Student (Nemo) into auth.users + profiles
INSERT INTO auth.users (id, role, email, encrypted_password, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'student@mindbridge.demo',
  'dummy',
  '{"name": "Nemo", "role": "student"}'
) ON CONFLICT (id) DO NOTHING;

-- The trigger on_auth_user_created will create the profile, but upsert to be safe:
INSERT INTO public.profiles (id, name, role, institution, counselor_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Nemo',
  'student',
  'Computer Science',
  (SELECT id FROM public.profiles WHERE name = 'Dr. Radha Sharma' AND role = 'counselor' LIMIT 1)
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  institution = EXCLUDED.institution,
  counselor_id = EXCLUDED.counselor_id;

-- 3. Insert demo Admin (Prof. Raj Verma)
INSERT INTO auth.users (id, role, email, encrypted_password, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'authenticated',
  'admin@mindbridge.demo',
  'dummy',
  '{"name": "Prof. Raj Verma", "role": "admin"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, name, role, institution)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Prof. Raj Verma',
  'admin',
  'Campus Administration'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'admin',
  institution = EXCLUDED.institution;

-- 4. Seed mood logs for Nemo so the dashboard has data
INSERT INTO public.mood_logs (user_id, score, note, logged_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 3, 'Managing okay', now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000001', 4, 'Better after exercise', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 2, 'Rough night', now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000001', 4, 'Good study session', now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 3, 'Average day', now() - interval '5 days');

-- 5. Seed a booking for Nemo with Dr. Radha Sharma
INSERT INTO public.bookings (student_id, counselor_id, slot_start, slot_end, type, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.profiles WHERE name = 'Dr. Radha Sharma' AND role = 'counselor' LIMIT 1),
  now() + interval '2 days',
  now() + interval '2 days 1 hour',
  'named',
  'confirmed'
);
