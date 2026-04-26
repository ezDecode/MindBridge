-- Set Dr. Radha Sharma as the default counselor for all students
-- ID from DEMO_USERS: 87a24859-7892-49f8-b26d-c2878fe09f43

-- 1. Ensure all existing students are assigned to Dr. Radha Sharma
UPDATE profiles 
SET counselor_id = '87a24859-7892-49f8-b26d-c2878fe09f43'
WHERE role = 'student' AND counselor_id IS NULL;

-- 2. Update the trigger function to automatically assign her to new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, xp, counselor_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    NULL, -- Set role to NULL initially for Google users
    0,
    '87a24859-7892-49f8-b26d-c2878fe09f43' -- Default Counselor: Dr. Radha Sharma
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
