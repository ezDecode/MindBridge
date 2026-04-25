import { createClient } from '@/lib/supabase/server'
import BookCounselorClient from './BookCounselorClient'

export default async function BookCounselorPage() {
  const supabase = await createClient()

  // Fetch counselors
  const { data: counselors } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'counselor')

  // Fetch all available slots from now onwards
  const { data: slots } = await supabase
    .from('counselor_slots')
    .select('id, counselor_id, slot_start, slot_end, available, profiles:counselor_id(name)')
    .gte('slot_start', new Date().toISOString())
    .eq('available', true)
    .order('slot_start', { ascending: true })

  return <BookCounselorClient initialCounselors={counselors || []} initialSlots={slots || []} />
}
