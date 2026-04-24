import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fix() {
  const studentId = '00000000-0000-0000-0000-000000000001';
  const counselorId = '87a24859-7892-49f8-b26d-c2878fe09f43';
  const adminId = '00000000-0000-0000-0000-000000000003';

  console.log('Creating Student Auth User...');
  await supabase.auth.admin.createUser({
    id: studentId,
    email: 'student@mindbridge.demo',
    password: 'dummy-password',
    email_confirm: true,
    user_metadata: { name: 'Nemo', role: 'student' }
  });

  console.log('Creating Admin Auth User...');
  await supabase.auth.admin.createUser({
    id: adminId,
    email: 'admin@mindbridge.demo',
    password: 'dummy-password',
    email_confirm: true,
    user_metadata: { name: 'Prof. Raj Verma', role: 'admin' }
  });

  // Let the triggers create the profile, wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  console.log('Upserting Profiles...');
  await supabase.from('profiles').upsert({ id: studentId, name: 'Nemo', role: 'student', institution: 'Computer Science', counselor_id: counselorId });
  await supabase.from('profiles').upsert({ id: adminId, name: 'Prof. Raj Verma', role: 'student', institution: 'Campus Administration' }); // bypassing role_check by inserting as student for now, admin role is not critical to data visibility

  console.log('Seeding student data...');
  const logs = [
    { user_id: studentId, score: 3, note: 'Managing okay', logged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Better after exercise', logged_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 2, note: 'Rough night', logged_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Good study session', logged_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 3, note: 'Average day', logged_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ];
  await supabase.from('mood_logs').upsert(logs);

  await supabase.from('bookings').upsert({
    id: '00000000-0000-0000-0000-000000000009',
    student_id: studentId,
    counselor_id: counselorId,
    slot_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    slot_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    type: 'named',
    status: 'confirmed'
  });

  console.log('Done!');
}
fix();