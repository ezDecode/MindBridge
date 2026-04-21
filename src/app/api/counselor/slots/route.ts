import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

// GET: List counselor's slots
export async function GET() {
 try {
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 // Verify user is a counselor
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single()

 if (profile?.role !== 'counselor') {
 return NextResponse.json({ error: 'Access denied' }, { status: 403 })
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

  const normalizedBookings = (bookings || []).map((booking) => ({
  ...booking,
  student: booking.student
  ? {
  ...booking.student,
  name: resolveProfileDisplayName({ profileName: booking.student.name }) || 'Student',
  }
  : booking.student,
  }))

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
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 // Verify user is a counselor
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single()

 if (profile?.role !== 'counselor') {
 return NextResponse.json({ error: 'Access denied' }, { status: 403 })
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
