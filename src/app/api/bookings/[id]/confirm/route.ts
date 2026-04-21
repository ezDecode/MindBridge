import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: Confirm a booking (counselor action)
export async function POST(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const supabase = await createClient()
 const { id } = await params
 
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
 return NextResponse.json({ error: 'Only counselors can confirm bookings' }, { status: 403 })
 }

 // Update booking status
 const { data: booking, error: updateError } = await supabase
 .from('bookings')
 .update({ status: 'confirmed' })
 .eq('id', id)
 .eq('counselor_id', user.id)
 .select('id, slot_start, slot_end, type, status')
 .single()

 if (updateError || !booking) {
 return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
 }

 return NextResponse.json({ success: true, booking })
 } catch (error) {
 console.error('Confirm booking error:', error)
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
 }
}
