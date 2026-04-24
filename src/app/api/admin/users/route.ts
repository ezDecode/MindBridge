import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"
import { resolveProfileDisplayName } from '@/lib/profile-name'

export async function GET() {
 // Get demo user from cookie
 const cookieStore = await cookies()
 const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
 const user = DEMO_USERS[role]
 
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 // Use the service role to bypass RLS in an admin context
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
 const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
 
 if (!supabaseUrl || !supabaseServiceKey) {
 return NextResponse.json({ error: 'Service role configuration missing' }, { status: 500 })
 }

 const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)
 const { data: profiles, error } = await adminClient
 .from('profiles')
 .select('*')
 .order('created_at', { ascending: false })

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 })
 }

 const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
 page: 1,
 perPage: 1000,
 })

 if (authError) {
 console.error('Failed to fetch auth users for admin list:', authError.message)
 return NextResponse.json({ profiles })
 }

 const authUserById = new Map((authData.users || []).map((authUser) => [authUser.id, authUser]))

 const profileNameUpdates: Array<{ id: string; name: string }> = []
 const enrichedProfiles = (profiles || []).map((profile) => {
 const authUser = authUserById.get(profile.id)
 const resolvedName = resolveProfileDisplayName({
 profileName: profile.name,
 email: authUser?.email,
 metadata: (authUser?.user_metadata as Record<string, unknown> | null) ?? null,
 })

 if (resolvedName && resolvedName !== profile.name) {
 profileNameUpdates.push({ id: profile.id, name: resolvedName })
 }

 return {
 ...profile,
 name: resolvedName,
 email: authUser?.email,
 }
 })

 if (profileNameUpdates.length > 0) {
 await Promise.all(
 profileNameUpdates.map(({ id, name }) =>
 adminClient.from('profiles').update({ name }).eq('id', id)
 )
 )
 }

 return NextResponse.json({ profiles: enrichedProfiles })
}
