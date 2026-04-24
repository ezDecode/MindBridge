-- Fix profiles role check to include admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'counselor', 'admin'));

-- Fix bookings type check to include online and inperson
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_type_check CHECK (type IN ('anonymous', 'named', 'crisis', 'online', 'inperson'));
