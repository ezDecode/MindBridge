import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'counselor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceClient()

    const { data: slots, error: slotsError } = await supabase
      .from('counselor_slots')
      .select('*')
      .eq('counselor_id', user.id)
      .order('slot_start', { ascending: true })

    if (slotsError) throw slotsError

    // Fetch pending bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*, student:profiles(name)')
      .eq('counselor_id', user.id)
      .eq('status', 'pending_confirmation')
      .order('slot_start', { ascending: true })

    if (bookingsError) throw bookingsError

    return NextResponse.json({
      slots: slots || [],
      bookings: bookings || []
    })
  } catch (error) {
    console.error('Slots API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'counselor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slot_start, slot_end } = body

    if (!slot_start || !slot_end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data: slot, error } = await supabase
      .from('counselor_slots')
      .insert({
        counselor_id: user.id,
        slot_start,
        slot_end,
        available: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Slots POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
