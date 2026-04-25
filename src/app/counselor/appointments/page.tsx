import { createClient } from '@/lib/supabase/server'
import { getCurrentDemoUserServer } from '@/lib/auth/demo-cookie'
import AppointmentsClient from './AppointmentsClient'

export default async function AppointmentsPage() {
  const user = await getCurrentDemoUserServer()
  const supabase = await createClient()

  // Fetch all bookings for this counselor
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, slot_start, slot_end, status, type, profiles!bookings_student_id_fkey(id, name, institution)')
    .eq('counselor_id', user.id)
    .order('slot_start', { ascending: true })

  return <AppointmentsClient initialBookings={bookings || []} />
}
