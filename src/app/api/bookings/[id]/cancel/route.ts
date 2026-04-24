import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"

// POST: Cancel a booking (student or counselor)
export async function POST(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const supabase = await createServiceClient()
 const { id } = await params
 
 // Get demo user from cookie
 const cookieStore = await cookies()
 const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
 const user = DEMO_USERS[role]
 
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 // Get the booking
 const { data: booking, error: fetchError } = await supabase
 .from('bookings')
 .select('id, student_id, counselor_id, slot_id, status')
 .eq('id', id)
 .single()

 if (fetchError || !booking) {
 return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
 }

 // Verify user can cancel this booking
 if (booking.student_id !== user.id && booking.counselor_id !== user.id) {
 return NextResponse.json({ error: 'Not authorized to cancel this booking' }, { status: 403 })
 }

 // Update booking status
 const { data: updated, error: updateError } = await supabase
 .from('bookings')
 .update({ status: 'cancelled' })
 .eq('id', id)
 .select('id, slot_start, slot_end, type, status')
 .single()

 if (updateError) {
 return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
 }

 // If there was a slot, make it available again
 if (booking.slot_id) {
 await supabase
 .from('counselor_slots')
 .update({ available: true })
 .eq('id', booking.slot_id)
 }

 return NextResponse.json({ success: true, booking: updated })
 } catch (error) {
 console.error('Cancel booking error:', error)
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 }
}
