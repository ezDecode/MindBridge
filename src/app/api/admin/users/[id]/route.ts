import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
 const { id } = await context.params

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
 const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
 
 if (!supabaseUrl || !supabaseServiceKey) {
 return NextResponse.json({ error: 'Service role config missing' }, { status: 500 })
 }

 const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)

 // Fetch the profile
 const { data: profile, error: profileErr } = await adminClient
 .from('profiles')
 .select('*')
 .eq('id', id)
 .single()

 if (profileErr) {
 return NextResponse.json({ error: profileErr.message }, { status: 404 })
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
