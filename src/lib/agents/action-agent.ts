import { createServiceClient } from '@/lib/supabase/server'

export interface BookingResult {
  success: boolean
  message: string
  booking?: unknown
  counselorName?: string
  slotTime?: string
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
  bookingType: 'anonymous' | 'named' | 'crisis' = 'named'
): Promise<BookingResult> {
  const supabase = await createServiceClient()

  try {
    // 1. Find earliest available counselor slot
    // In a real app, we'd filter by counselor specialty etc.
    const { data: slot, error: slotError } = await supabase
      .from('counselor_slots')
      .select('*, counselor:profiles(name)')
      .eq('available', true)
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true })
      .limit(1)
      .single()

    if (slotError || !slot) {
      return { 
        success: false, 
        message: 'I checked for available slots but couldn\'t find any for this week. Would you like me to notify a counselor to reach out to you instead?' 
      }
    }

    // 2. Create a PENDING booking
    // This allows the student to confirm before it's final
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        student_id: studentId,
        counselor_id: slot.counselor_id,
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

    // 3. Mark slot as tentatively held (optional, depends on schema)
    // For the demo, we just return the success
    
    const startTime = new Date(slot.slot_start)
    const formattedTime = formatBookingDate(startTime)

    return {
      success: true,
      message: `I found an available slot with ${slot.counselor?.name || 'a counselor'} on ${formattedTime}.`,
      booking: booking,
      counselorName: slot.counselor?.name ?? undefined,
      slotTime: formattedTime
    }
  } catch (error) {
    console.error('Action agent execution error:', error)
    return { success: false, message: 'I couldn\'t complete the booking process right now.' }
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
