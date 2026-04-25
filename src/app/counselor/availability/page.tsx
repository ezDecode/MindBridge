import { createClient } from '@/lib/supabase/server'
import { getCurrentDemoUserServer } from '@/lib/auth/demo-cookie'
import AvailabilityClient from './AvailabilityClient'

export default async function AvailabilityPage() {
  const user = await getCurrentDemoUserServer()
  const supabase = await createClient()

  // Ensure slots are correctly filtered for counselor_id
  const { data: slots } = await supabase
    .from('counselor_slots')
    .select('*')
    .eq('counselor_id', user.id)
    .gte('slot_start', new Date(new Date().setHours(0,0,0,0)).toISOString()) // From today onwards
    .order('slot_start', { ascending: true })

  // Fetch bookings linked to these slots or counselor
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, slot_id, status, type, profiles!bookings_student_id_fkey(name)')
    .eq('counselor_id', user.id)
    .gte('slot_start', new Date(new Date().setHours(0,0,0,0)).toISOString())

  return (
    <AvailabilityClient 
      counselorId={user.id}
      initialSlots={slots || []} 
      initialBookings={bookings || []}
    />
  )
}
