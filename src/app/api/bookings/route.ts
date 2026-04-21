import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

// GET: List available slots and counselors
export async function GET(request: Request) {
 try {
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { searchParams } = new URL(request.url)
 const counselorId = searchParams.get('counselor_id')

 // Get counselors
 const { data: counselors } = await supabase
 .from('profiles')
 .select('id, name, institution')
 .eq('role', 'counselor')

 // Get available slots
 let slotsQuery = supabase
 .from('counselor_slots')
 .select(`
 id,
 counselor_id,
 slot_start,
 slot_end,
 available,
 counselor:profiles!counselor_id(name)
 `)
 .eq('available', true)
 .gte('slot_start', new Date().toISOString())
 .order('slot_start', { ascending: true })
 .limit(20)

 if (counselorId) {
 slotsQuery = slotsQuery.eq('counselor_id', counselorId)
 }

 const { data: slots, error: slotsError } = await slotsQuery

 if (slotsError) {
 console.error('Failed to fetch slots:', slotsError)
 return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
 }

 // Get user's existing bookings
 const { data: existingBookings } = await supabase
 .from('bookings')
 .select('id, slot_start, slot_end, status, type, counselor:profiles!counselor_id(name)')
 .eq('student_id', user.id)
 .in('status', ['pending_confirmation', 'confirmed'])
 .gte('slot_start', new Date().toISOString())
 .order('slot_start', { ascending: true })

  const normalizedCounselors = (counselors || []).map((counselor) => ({
  ...counselor,
  name: resolveProfileDisplayName({ profileName: counselor.name }) || 'Counselor',
  }))

  const normalizedSlots = (slots || []).map((slot) => ({
  ...slot,
  counselor: slot.counselor
  ? {
  ...slot.counselor,
  name: resolveProfileDisplayName({ profileName: slot.counselor.name }) || 'Counselor',
  }
  : slot.counselor,
  }))

  const normalizedExistingBookings = (existingBookings || []).map((booking) => ({
  ...booking,
  counselor: booking.counselor
  ? {
  ...booking.counselor,
  name: resolveProfileDisplayName({ profileName: booking.counselor.name }) || 'Counselor',
  }
  : booking.counselor,
  }))

  return NextResponse.json({
  counselors: normalizedCounselors,
  slots: normalizedSlots,
  existingBookings: normalizedExistingBookings,
  })
 } catch (error) {
 console.error('Bookings API error:', error)
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 }
}

// POST: Create a new booking
export async function POST(request: Request) {
 try {
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { slotId, counselorId, type, slotStart, slotEnd } = await request.json()

 if (!counselorId || !type || !slotStart || !slotEnd) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
 }

 // If slotId provided, verify slot is still available
 if (slotId) {
 const { data: slot, error: slotError } = await supabase
 .from('counselor_slots')
 .select('available')
 .eq('id', slotId)
 .single()

 if (slotError || !slot?.available) {
 return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 })
 }
 }

 // Create booking
 const { data: booking, error: bookingError } = await supabase
 .from('bookings')
 .insert({
 student_id: user.id,
 counselor_id: counselorId,
 slot_id: slotId || null,
 slot_start: slotStart,
 slot_end: slotEnd,
 type,
 status: 'pending_confirmation',
 })
 .select(`
 id,
 slot_start,
 slot_end,
 type,
 status,
 counselor:profiles!counselor_id(name)
 `)
 .single()

 if (bookingError) {
 console.error('Failed to create booking:', bookingError)
 return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
 }

 // If slot exists, mark it as unavailable
 if (slotId) {
 await supabase
 .from('counselor_slots')
 .update({ available: false })
 .eq('id', slotId)
 }

  const normalizedBooking = booking
  ? {
  ...booking,
  counselor: booking.counselor
  ? {
  ...booking.counselor,
  name: resolveProfileDisplayName({ profileName: booking.counselor.name }) || 'Counselor',
  }
  : booking.counselor,
  }
  : booking

  return NextResponse.json({ success: true, booking: normalizedBooking })
 } catch (error) {
 console.error('Bookings API error:', error)
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 }
}
