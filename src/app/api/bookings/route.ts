import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceClient()

    // Fetch student's bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        counselor:profiles!counselor_id(name, institution)
      `)
      .eq('student_id', user.id)
      .order('slot_start', { ascending: true })

    if (error) throw error

    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { counselor_id, slot_id, slot_start, slot_end, type } = body

    if (!counselor_id || !slot_start || !slot_end || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        student_id: user.id,
        counselor_id,
        slot_id: slot_id || null,
        slot_start,
        slot_end,
        type,
        status: 'pending_confirmation'
      })
      .select()
      .single()

    if (error) throw error

    // If there was a slot_id, mark it as not available
    if (slot_id) {
      await supabase
        .from('counselor_slots')
        .update({ available: false })
        .eq('id', slot_id)
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Bookings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
