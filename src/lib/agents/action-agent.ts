import { createServiceClient } from '@/lib/supabase/server'

export interface SlotOption {
  id: string
  counselorName: string
  slotTime: string
  slotStart: string
  slotEnd: string
}

export interface BookingResult {
  success: boolean
  message: string
  booking?: unknown
  counselorName?: string
  slotTime?: string
  availableSlots?: SlotOption[]
}

function ordinalDay(day: number) {
  const remainder = day % 100
  if (remainder >= 11 && remainder <= 13) return `${day}th`

  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

function formatBookingDate(date: Date) {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)

  return `${weekday}, ${month} ${ordinalDay(date.getDate())} at ${time}`
}

/**
 * Action Agent - Handles specific tool calls like booking slots
 */

export async function executeBooking(
  studentId: string,
  _bookingType: 'anonymous' | 'named' | 'crisis' = 'named'
): Promise<BookingResult> {
  const supabase = await createServiceClient()

  try {
    // 1. Find earliest available counselor slots
    // In a real app, we'd filter by counselor specialty etc.
    const { data: slots, error: slotsError } = await supabase
      .from('counselor_slots')
      .select('*, counselor:profiles(name)')
      .eq('available', true)
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true })
      .limit(3)

    if (slotsError || !slots || slots.length === 0) {
      return { 
        success: false, 
        message: 'I checked for available slots but couldn\'t find any for this week. Would you like me to notify a counselor to reach out to you instead?' 
      }
    }

    const availableSlots: SlotOption[] = slots.map(slot => {
      const startTime = new Date(slot.slot_start)
      return {
        id: slot.id,
        counselorName: slot.counselor?.name || 'a counselor',
        slotTime: formatBookingDate(startTime),
        slotStart: slot.slot_start,
        slotEnd: slot.slot_end
      }
    })

    return {
      success: true,
      message: `I found a few available slots. Which one works best for you?`,
      availableSlots
    }
  } catch (error) {
    console.error('Action agent execution error:', error)
    return { success: false, message: 'I couldn\'t complete the booking process right now.' }
  }
}

export async function confirmSlotBooking(
  studentId: string,
  slotId: string,
  bookingType: 'anonymous' | 'named' | 'crisis' = 'named'
): Promise<BookingResult> {
  const supabase = await createServiceClient()

  try {
    // Get the slot
    const { data: slot, error: slotError } = await supabase
      .from('counselor_slots')
      .select('*, counselor:profiles(name)')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return { success: false, message: 'That slot is no longer available.' }
    }

    // Create a PENDING booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        student_id: studentId,
        counselor_id: slot.counselor_id,
        slot_id: slot.id,
        slot_start: slot.slot_start,
        slot_end: slot.slot_end,
        type: bookingType,
        status: 'pending_confirmation',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return { success: false, message: 'I ran into a technical snag while trying to hold that slot. Can we try again in a moment?' }
    }

    // Mark slot as unavailable
    await supabase.from('counselor_slots').update({ available: false }).eq('id', slotId)

    const startTime = new Date(slot.slot_start)
    const formattedTime = formatBookingDate(startTime)

    return {
      success: true,
      message: `Your session with ${slot.counselor?.name || 'a counselor'} on ${formattedTime} has been requested.`,
      booking: booking,
      counselorName: slot.counselor?.name ?? undefined,
      slotTime: formattedTime
    }
  } catch (error) {
    console.error('Booking confirmation error:', error)
    return { success: false, message: 'I couldn\'t confirm the booking right now.' }
  }
}

/**
 * Formats a slot time for natural conversation
 */
export function formatSlot(isoString: string): string {
  const date = new Date(isoString)
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)

  return `${weekday} at ${time}`
}
