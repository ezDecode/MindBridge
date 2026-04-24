import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Nemo...');
  
  const studentId = '00000000-0000-0000-0000-000000000001';
  const counselorId = '87a24859-7892-49f8-b26d-c2878fe09f43';
  const adminId = '00000000-0000-0000-0000-000000000003';

  // 1. Insert Nemo into profiles
  let res = await supabase.from('profiles').upsert({
    id: studentId,
    name: 'Nemo',
    role: 'student',
    institution: 'Computer Science',
    counselor_id: counselorId
  });
  console.log('Profile Nemo:', res.error ? res.error.message : 'OK');

  // 2. Insert Admin into profiles
  res = await supabase.from('profiles').upsert({
    id: adminId,
    name: 'Prof. Raj Verma',
    role: 'admin',
    institution: 'Campus Administration'
  });
  console.log('Profile Admin:', res.error ? res.error.message : 'OK');

  // 3. Seed mood logs for Nemo
  const logs = [
    { user_id: studentId, score: 3, note: 'Managing okay', logged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Better after exercise', logged_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 2, note: 'Rough night', logged_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Good study session', logged_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 3, note: 'Average day', logged_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ];
  
  res = await supabase.from('mood_logs').upsert(logs);
  console.log('Mood Logs:', res.error ? res.error.message : 'OK');

  // 4. Seed booking
  res = await supabase.from('bookings').upsert({
    id: '00000000-0000-0000-0000-000000000009',
    student_id: studentId,
    counselor_id: counselorId,
    slot_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    slot_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    type: 'named',
    status: 'confirmed'
  });
  console.log('Booking:', res.error ? res.error.message : 'OK');

  console.log('Done!');
}

seed();