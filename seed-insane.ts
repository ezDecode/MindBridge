import { createClient } from '@supabase/supabase-js'
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

async function seedInsane() {
  console.log('🚀 Starting INSANE SEEDING...')

  // 0. Create Auth Users
  console.log('🔐 Creating auth users...')
  const users = [
    { id: studentId, email: 'student@mindbridge.demo', name: 'Nemo', role: 'student' },
    { id: counselorId, email: 'counselor@mindbridge.demo', name: 'Dr. Radha Sharma', role: 'counselor' },
    { id: adminId, email: 'admin@mindbridge.demo', name: 'Prof. Raj Verma', role: 'admin' }
  ]
  for (const u of users) {
    const { error } = await supabase.auth.admin.createUser({
      id: u.id,
      email: u.email,
      password: 'dummy-password',
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role }
    })
    // Ignore error if user already exists
    if (error && !error.message.includes('already exists')) {
      console.error(`Failed to create auth user ${u.email}:`, error)
    }
  }

  // 1. Sync Profiles
  console.log('👥 Syncing profiles...')
  const profiles = [
    { id: studentId, name: 'Nemo', role: 'student', institution: 'Computer Science', counselor_id: counselorId },
    { id: counselorId, name: 'Dr. Radha Sharma', role: 'counselor', institution: 'Psychology & Wellness' },
    { id: adminId, name: 'Prof. Raj Verma', role: 'counselor', institution: 'Campus Administration' }
  ]
  for (const p of profiles) {
    const { error } = await supabase.from('profiles').upsert(p)
    if (error) console.error(`Failed to upsert profile ${p.name}:`, error)
  }

  // 2. Generate 60 days of mood logs for Nemo
  console.log('📈 Generating 60 days of mood logs...')
  const moodLogs = []
  const now = new Date()
  for (let i = 0; i < 60; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    // Random score 1-5, but biased towards 3-4
    const score = Math.floor(Math.random() * 3) + 2 + (i % 2 === 0 ? 1 : 0)
    moodLogs.push({
      user_id: studentId,
      score: Math.min(score, 5),
      note: `Feeling ${score > 3 ? 'great' : 'okay'} on day ${i}`,
      logged_at: date.toISOString()
    })
  }
  const { error: moodErr } = await supabase.from('mood_logs').upsert(moodLogs)
  if (moodErr) console.error('Failed to insert mood logs:', moodErr)

  // 3. Generate Counselor Slots for Dr. Radha Sharma
  console.log('📅 Generating counselor slots...')
  const slots = []
  for (let i = -2; i < 10; i++) { // From 2 days ago to 10 days ahead
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    date.setHours(10, 0, 0, 0) // 10 AM

    // Add 3 slots per day
    for (let j = 0; j < 3; j++) {
      const start = new Date(date.getTime() + j * 2 * 60 * 60 * 1000) // Every 2 hours
      const end = new Date(start.getTime() + 1 * 60 * 60 * 1000) // 1 hour duration
      slots.push({
        counselor_id: counselorId,
        slot_start: start.toISOString(),
        slot_end: end.toISOString(),
        available: i >= 0 // Past slots unavailable
      })
    }
  }
  const { error: slotErr } = await supabase.from('counselor_slots').upsert(slots)
  if (slotErr) console.error('Failed to insert slots:', slotErr)

  // 4. Generate Bookings
  console.log('🎟️ Generating bookings...')
  const bookings = [
    // One confirmed for today
    {
      student_id: studentId,
      counselor_id: counselorId,
      slot_start: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      slot_end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      type: 'named',
      status: 'confirmed'
    },
    // One pending for tomorrow
    {
      student_id: studentId,
      counselor_id: counselorId,
      slot_start: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(),
      slot_end: new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString(),
      type: 'named',
      status: 'pending_confirmation'
    },
    // Historical confirmed
    {
      student_id: studentId,
      counselor_id: counselorId,
      slot_start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      slot_end: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
      type: 'named',
      status: 'confirmed'
    }
  ]
  const { error: bookingErr } = await supabase.from('bookings').upsert(bookings)
  if (bookingErr) console.error('Failed to insert bookings:', bookingErr)

  // 5. Generate Crisis Logs
  console.log('🚨 Generating crisis logs...')
  const crisisLogs = [
    { student_id: studentId, counselor_id: counselorId, severity: 'high', acknowledged: false, triggered_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString() },
    { student_id: studentId, counselor_id: counselorId, severity: 'severe', acknowledged: true, triggered_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString() },
    { student_id: studentId, counselor_id: counselorId, severity: 'moderate', acknowledged: true, triggered_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString() }
  ]
  const { error: crisisErr } = await supabase.from('crisis_logs').upsert(crisisLogs)
  if (crisisErr) console.error('Failed to insert crisis logs:', crisisErr)

  console.log('✅ INSANE SEEDING COMPLETE!')
}

seedInsane()
