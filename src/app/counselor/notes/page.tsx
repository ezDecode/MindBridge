import { createClient } from '@/lib/supabase/server'
import { getCurrentDemoUserServer } from '@/lib/auth/demo-cookie'
import NotesClient from './NotesClient'

export default async function NotesPage() {
  const user = await getCurrentDemoUserServer()
  const supabase = await createClient()

  // Fetch past bookings or completed bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, slot_start, type, notes_encrypted, profiles!bookings_student_id_fkey(id, name)')
    .eq('counselor_id', user.id)
    .lt('slot_start', new Date().toISOString())
    .order('slot_start', { ascending: false })

  return <NotesClient initialBookings={bookings || []} />
}
