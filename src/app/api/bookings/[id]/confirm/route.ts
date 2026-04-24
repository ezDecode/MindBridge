import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"

// POST: Confirm a booking (counselor action)
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
