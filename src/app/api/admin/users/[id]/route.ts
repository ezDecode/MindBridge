import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
 const { id } = await context.params

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
 const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
 
 if (!supabaseUrl || !supabaseServiceKey) {
 return NextResponse.json({ profile: null, moodLogs: [], error: 'Service role config missing' }, { status: 200 })
 }

 const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)

 // Fetch the profile
 const { data: profile, error: profileErr } = await adminClient
 .from('profiles')
 .select('*')
 .eq('id', id)
 .single()

  if (profileErr) {
  return NextResponse.json({ profile: null, moodLogs: [], error: profileErr.message }, { status: 200 })
  }

  const { data: authResult } = await adminClient.auth.admin.getUserById(id)
  const authUser = authResult.user
  const resolvedName = resolveProfileDisplayName({
  profileName: profile.name,
  email: authUser?.email,
  metadata: (authUser?.user_metadata as Record<string, unknown> | null) ?? null,
  })

  if (resolvedName && resolvedName !== profile.name) {
  await adminClient.from('profiles').update({ name: resolvedName }).eq('id', id)
  profile.name = resolvedName
  }

  // Fetch recent mood logs
  const { data: moodLogs, error: moodErr } = await adminClient
  .from('mood_logs')
 .select('*')
 .eq('user_id', id)
 .order('logged_at', { ascending: false })
 .limit(10)

 return NextResponse.json({
 profile,
 moodLogs: moodErr ? [] : moodLogs
 })
}
