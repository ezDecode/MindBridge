import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/admin/delegate-booking — admin books a counselor session for a student
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { studentId, counselorId, slotStart, slotEnd } = body as {
    studentId?: string
    counselorId?: string
    slotStart?: string
    slotEnd?: string
  }

  if (!studentId || !counselorId || !slotStart || !slotEnd) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Create the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      student_id: studentId,
      counselor_id: counselorId,
      slot_start: slotStart,
      slot_end: slotEnd,
      type: 'named',
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create delegate booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Fire high-priority notification to student
  await supabase.from('notifications').insert({
    user_id: studentId,
    message: '🔴 A counselor session has been scheduled for you by admin',
    type: 'booking',
    metadata: { booking_id: booking.id, priority: 'high' },
  })

  // Notify counselor too
  await supabase.from('notifications').insert({
    user_id: counselorId,
    message: '📋 Admin has booked a session with a student for you',
    type: 'booking',
    metadata: { booking_id: booking.id },
  })

  return NextResponse.json({ booking })
}
