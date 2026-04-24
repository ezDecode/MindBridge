import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const studentId = '00000000-0000-0000-0000-000000000001'
const counselorId = '87a24859-7892-49f8-b26d-c2878fe09f43'
const adminId = '00000000-0000-0000-0000-000000000003'

async function seedData() {
  console.log('Seeding data...')
  
  // Ensure profile name and counselor relation is set for the student
  await supabase.from('profiles').upsert({
    id: studentId,
    name: 'Nemo',
    role: 'student',
    institution: 'Computer Science',
    counselor_id: counselorId
  }, { onConflict: 'id' }).then(res => console.log('Upsert student profile:', res.error || 'Success'))

  // Ensure counselor profile is set
  await supabase.from('profiles').upsert({
    id: counselorId,
    name: 'Dr. Radha Sharma',
    role: 'counselor',
    institution: 'Psychology & Wellness',
  }, { onConflict: 'id' }).then(res => console.log('Upsert counselor profile:', res.error || 'Success'))

  // Ensure admin profile is set
  await supabase.from('profiles').upsert({
    id: adminId,
    name: 'Prof. Raj Verma',
    role: 'admin',
    institution: 'Campus Administration',
  }, { onConflict: 'id' }).then(res => console.log('Upsert admin profile:', res.error || 'Success'))

  // Create mood logs for Nemo
  const logs = [
    { user_id: studentId, score: 3, note: 'Managing okay', logged_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Better after exercise', logged_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 2, note: 'Rough night', logged_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 4, note: 'Good study session', logged_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { user_id: studentId, score: 3, note: 'Average day', logged_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ]
  await supabase.from('mood_logs').upsert(logs).then(res => console.log('Insert mood logs:', res.error || 'Success'))

  // Create bookings
  const bookings = [
    {
      student_id: studentId,
      counselor_id: counselorId,
      slot_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      slot_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
      type: 'named',
      status: 'confirmed'
    },
    {
      student_id: studentId,
      counselor_id: counselorId,
      slot_start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      slot_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
      type: 'named',
      status: 'pending_confirmation'
    }
  ]
  await supabase.from('bookings').insert(bookings).then(res => console.log('Insert bookings:', res.error || 'Success'))

  // Create crisis alerts
  const alerts = [
    { student_id: studentId, counselor_id: counselorId, severity: 'high', acknowledged: false, triggered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { student_id: studentId, counselor_id: counselorId, severity: 'severe', acknowledged: true, triggered_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
  ]
  await supabase.from('crisis_logs').insert(alerts).then(res => console.log('Insert crisis alerts:', res.error || 'Success'))

  console.log('Seeding complete')
}

seedData()
