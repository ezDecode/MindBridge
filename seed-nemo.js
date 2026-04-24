const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createUser(id, email, name, role) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      email: email,
      password: 'dummy-password123!',
      email_confirm: true,
      user_metadata: { name, role }
    })
  });
  if (!res.ok) {
    const error = await res.text();
    if (!error.includes('duplicate')) {
      console.error('Create User Error:', error);
    }
  } else {
    console.log('Created auth user:', email);
  }
}

async function query(table, method, body = null) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    console.error(`Query ${table} Error:`, await res.text());
  } else {
    console.log(`Query ${table} OK`);
  }
}

async function seed() {
  const studentId = '00000000-0000-0000-0000-000000000001';
  const counselorId = '87a24859-7892-49f8-b26d-c2878fe09f43';
  const adminId = '00000000-0000-0000-0000-000000000003';

  console.log('Creating Student Auth User...');
  await createUser(studentId, 'student@mindbridge.demo', 'Nemo', 'student');

  console.log('Creating Admin Auth User...');
  await createUser(adminId, 'admin@mindbridge.demo', 'Prof. Raj Verma', 'admin');

  console.log('Waiting for triggers...');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Upserting Admin Profile...');
  await query('profiles?id=eq.' + adminId, 'PATCH', { role: 'admin', institution: 'Campus Administration' });

  const logs = [
    { user_id: studentId, score: 3, note: 'Managing okay', logged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Better after exercise', logged_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 2, note: 'Rough night', logged_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Good study session', logged_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 3, note: 'Average day', logged_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ];
  
  console.log('Upserting Moods...');
  await query('mood_logs', 'POST', logs);

  console.log('Upserting Booking...');
  await query('bookings', 'POST', {
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

seed();