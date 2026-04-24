import { createServiceClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"
import { resolveProfileDisplayName } from '@/lib/profile-name'

// GET: List counselor's slots
export async function GET() {
 try {
 const supabase = await createServiceClient()
 
 // Get demo user from cookie
 const cookieStore = await cookies()
 const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
 const user = DEMO_USERS[role]
 
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 // Get counselor's slots
 const { data: slots, error: slotsError } = await supabase
 .from('counselor_slots')
 .select('*')
 .eq('counselor_id', user.id)
 .gte('slot_start', new Date().toISOString())
 .order('slot_start', { ascending: true })

 if (slotsError) {
 return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
 }

 // Get pending bookings
 const { data: bookings } = await supabase
 .from('bookings')
 .select(`
 id,
 slot_start,
 slot_end,
 type,
 status,
 student:profiles!student_id(id, name)
 `)
 .eq('counselor_id', user.id)
 .in('status', ['pending_confirmation', 'confirmed'])
 .gte('slot_start', new Date().toISOString())
 .order('slot_start', { ascending: true })

 // Resolve student names
 // In demo system, we can still use authEmailMap if we want, but let's keep it simple for now
 let authEmailMap = new Map<string, string>()
 const studentIds = (bookings || [])
  .map((b) => {
   const s = b.student as { id: string } | null
   return s?.id
  })
  .filter((id): id is string => Boolean(id))

 if (studentIds.length > 0) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (supabaseUrl && supabaseServiceKey) {
   try {
    const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)
    const { data: authData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (authData?.users) {
     authEmailMap = new Map(authData.users.map((u) => [u.id, u.email || '']))
    }
   } catch {
    // Fallback to profile name only
   }
  }
 }

 const normalizedBookings = (bookings || []).map((booking) => {
  const student = booking.student as { id: string; name: string | null } | null
  return {
   ...booking,
   student: student
    ? {
     ...student,
     name: resolveProfileDisplayName({
      profileName: student.name,
      email: authEmailMap.get(student.id),
     }) || 'Student',
    }
    : booking.student,
  }
 })

 return NextResponse.json({
  slots: slots || [],
  bookings: normalizedBookings,
 })
 } catch (error) {
 console.error('Counselor slots error:', error)
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 }
}

// POST: Create new slots (bulk)
export async function POST(request: Request) {
 try {
 const supabase = await createServiceClient()
 
 // Get demo user from cookie
 const cookieStore = await cookies()
 const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
 const user = DEMO_USERS[role]
 
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { slots } = await request.json()

 if (!Array.isArray(slots) || slots.length === 0) {
 return NextResponse.json({ error: 'No slots provided' }, { status: 400 })
 }

 // Insert slots
 const slotsToInsert = slots.map((slot: { start: string; end: string }) => ({
 counselor_id: user.id,
 slot_start: slot.start,
 slot_end: slot.end,
 available: true,
 }))

 const { data: created, error: insertError } = await supabase
 .from('counselor_slots')
 .insert(slotsToInsert)
 .select()

 if (insertError) {
 console.error('Failed to create slots:', insertError)
 return NextResponse.json({ error: 'Failed to create slots' }, { status: 500 })
 }

 return NextResponse.json({ success: true, slots: created })
 } catch (error) {
 console.error('Create slots error:', error)
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 }
}
