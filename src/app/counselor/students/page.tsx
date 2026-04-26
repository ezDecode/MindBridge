import { createClient } from '@/lib/supabase/server'
import StudentsClient from './StudentsClient'

export default async function StudentsPage() {
  const supabase = await createClient()

  // In demo we fetch all students to populate UI
  const { data: students } = await supabase
    .from('profiles')
    .select('id, name, institution')
    .eq('role', 'student')

  // Fetch active crisis logs
  const { data: crisisLogs } = await supabase
    .from('crisis_logs')
    .select('*')
    .eq('acknowledged', false)

  // Fetch recent mood logs to show trends
  const { data: moodLogs } = await supabase
    .from('mood_logs')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(500)

  return (
    <StudentsClient 
      initialStudents={students || []} 
      initialCrisisLogs={crisisLogs || []}
      initialMoodLogs={moodLogs || []}
    />
  )
}
