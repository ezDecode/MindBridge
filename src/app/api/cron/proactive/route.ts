import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { firstNameOrFallback, resolveProfileDisplayName } from '@/lib/profile-name'

// We run this as a system process, so we use the Service Role Key to bypass Row Level Security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
 try {
 // 1. Authenticate the Cron request (You don't want anyone triggering this endpoint)
 const authHeader = req.headers.get('authorization')
 if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 return new NextResponse('Unauthorized', { status: 401 })
 }

 // 2. Get all active students
 const { data: students, error: studentsError } = await supabase
 .from('profiles')
 .select('*')
 .eq('role', 'student')

 if (studentsError) throw studentsError

 const { data: authData, error: authUsersError } = await supabase.auth.admin.listUsers({
 page: 1,
 perPage: 1000,
 })

 if (authUsersError) {
 throw authUsersError
 }

 const authUserById = new Map((authData.users || []).map((authUser) => [authUser.id, authUser]))

 let triggeredCount = 0
 const profileNameUpdates: Array<{ id: string; name: string }> = []
 
 // 3. Analyze each student
 for (const student of students || []) {
 let triggerProactiveMessage = false
 
 try {
 const { data: recentLogs } = await supabase
 .from('mood_logs')
 .select('*')
 .eq('user_id', student.id)
 .order('logged_at', { ascending: false })
 .limit(1)

 const hasRecentLog = recentLogs && recentLogs.length > 0
 
 // Simple trigger: haven't logged recently, or last log was a poor mood score
 triggerProactiveMessage = !hasRecentLog || (recentLogs[0].score <= 2)
 } catch (err) {
 console.error('Error fetching logs for student', student.id, err)
 }

 if (triggerProactiveMessage) {
  const authUser = authUserById.get(student.id)
  const resolvedName = resolveProfileDisplayName({
  profileName: student.name,
  email: authUser?.email,
  metadata: (authUser?.user_metadata as Record<string, unknown> | null) ?? null,
  })
  if (resolvedName && resolvedName !== student.name) {
  profileNameUpdates.push({ id: student.id, name: resolvedName })
  }

  // Send an initial outreach message from the AI Assistant
  await supabase.from('chat_messages').insert({
  session_id: null, // Depending on how you structured your default session
  user_id: student.id,
  role: 'assistant',
  proactive: true,
  content: `Hey ${firstNameOrFallback(resolvedName)}, haven't heard from you in a bit or noticed you were feeling down. How's today treating you?`,
  })
 
 // Log that we took action
 // *Ensure 'proactive_outreach' table exists or change this to the proper log table
 try {
 await supabase.from('proactive_outreach').insert({
 user_id: student.id,
 reason: 'System check-in based on recent mood logs and activity.',
 })
 } catch {
  console.log("Could not log to proactive_outreach table") 
 }

 triggeredCount++
 }
 }

  if (profileNameUpdates.length > 0) {
  await Promise.all(
  profileNameUpdates.map(({ id, name }) =>
  supabase.from('profiles').update({ name }).eq('id', id)
  )
  )
  }

 return NextResponse.json({ 
 success: true, 
 message: `Proactive agent ran successfully. Triggered messages for ${triggeredCount} student(s).` 
 }, { status: 200 })

 } catch (err: unknown) {
  const error = err as Error;
  console.error('Proactive Cron Error:', error)
  return NextResponse.json({ error: error.message }, { status: 500 })
 }
}
