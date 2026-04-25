import { createClient } from '@/lib/supabase/server'
import { getCurrentDemoUserServer } from '@/lib/auth/demo-cookie'
import MoodHistoryClient from './MoodHistoryClient'

export default async function MoodHistoryPage() {
  const user = await getCurrentDemoUserServer()
  const supabase = await createClient()

  // Fetch all time data initially, we will filter in the client
  const { data: logs } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })

  return <MoodHistoryClient initialLogs={logs || []} />
}
