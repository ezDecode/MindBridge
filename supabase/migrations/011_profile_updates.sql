-- Add XP column and make role nullable (for initial Google login)
-- Also allow 'admin' role in the check constraint

-- 1. Drop the existing role check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add 'admin' to the roles and make role nullable
ALTER TABLE profiles 
  ALTER COLUMN role DROP NOT NULL,
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'counselor', 'admin'));

-- 3. Add XP column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- 4. Update the trigger function to handle Google login metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, xp)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    NULL, -- Set role to NULL initially for Google users
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add increment_xp RPC function
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET xp = COALESCE(xp, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
