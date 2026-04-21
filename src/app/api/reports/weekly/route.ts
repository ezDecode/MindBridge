import { NextResponse } from 'next/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

export async function GET(request: Request) {
 const url = new URL(request.url)
 const studentId = url.searchParams.get('studentId')

 if (!studentId) {
 return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
 }

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
 const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

 if (!supabaseUrl || !supabaseServiceKey) {
 return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
 }

 const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
 const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)

 // Fetch recent mood logs for the last 7 days
 const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

 const { data: moodLogs, error: moodErr } = await adminClient
 .from('mood_logs')
 .select('score, note, logged_at')
 .eq('user_id', studentId)
 .gte('logged_at', sevenDaysAgo)
 .order('logged_at', { ascending: false })

 if (moodErr) {
 return NextResponse.json({ error: moodErr.message }, { status: 500 })
 }

  const { data: profile, error: profileErr } = await adminClient
  .from('profiles')
  .select('name')
  .eq('id', studentId)
  .single()

  if (profileErr) {
  return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  const { data: authResult } = await adminClient.auth.admin.getUserById(studentId)
  const authUser = authResult.user
  const resolvedName = resolveProfileDisplayName({
  profileName: profile?.name,
  email: authUser?.email,
  metadata: (authUser?.user_metadata as Record<string, unknown> | null) ?? null,
  })
  const reportName = resolvedName || 'Student'

  if (resolvedName && resolvedName !== profile?.name) {
  await adminClient.from('profiles').update({ name: resolvedName }).eq('id', studentId)
  }

 // Generate a simple report
 const logsCount = moodLogs?.length || 0
 const avgScore = logsCount > 0 
 ? (moodLogs.reduce((acc, curr) => acc + curr.score, 0) / logsCount).toFixed(1) 
 : 'N/A'

  const report = {
  title: `Weekly Mood Report for ${reportName}`,
 dateRange: `${new Date(sevenDaysAgo).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
 logsCount,
 averageMoodScore: avgScore,
 insights: logsCount === 0 
 ? ['No mood logs recorded this week. Student might need a check-in reminder.']
 : [
 `Logged mood ${logsCount} time(s).`,
 `Average score is ${avgScore}/5.`,
 ],
 rawLogs: moodLogs
 }

 return NextResponse.json({ report })
}
