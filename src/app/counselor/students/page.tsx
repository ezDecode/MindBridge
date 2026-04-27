import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'
import { redirect } from 'next/navigation'
import StudentsClient from './StudentsClient'

export default async function StudentsPage() {
  const user = await getAuthUser()
  
  if (!user || user.role !== 'counselor') {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch only students assigned to this counselor
  const { data: students } = await supabase
    .from('profiles')
    .select('id, name, institution')
    .eq('role', 'student')
    .eq('counselor_id', user.id)

  // Fetch crisis logs for these students
  const studentIds = (students || []).map(s => s.id)
  
  const { data: crisisLogs } = await supabase
    .from('crisis_logs')
    .select('*')
    .in('student_id', studentIds)
    .eq('acknowledged', false)

  // Fetch recent mood logs for these students
  const { data: moodLogs } = await supabase
    .from('mood_logs')
    .select('*')
    .in('user_id', studentIds)
    .order('logged_at', { ascending: false })
    .limit(200)

  return (
    <StudentsClient 
      initialStudents={students || []} 
      initialCrisisLogs={crisisLogs || []}
      initialMoodLogs={moodLogs || []}
    />
  )
}
