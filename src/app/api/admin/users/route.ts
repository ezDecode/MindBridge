import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"
import { resolveProfileDisplayName } from '@/lib/profile-name'

export async function GET() {
  try {
    // Get demo user from cookie
    const cookieStore = await cookies()
    const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
    const user = DEMO_USERS[role]
    
    if (!user || role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the service role to bypass RLS in an admin context
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase service role configuration missing');
      return NextResponse.json({ profiles: [], error: 'Service role configuration missing' }, { status: 200 })
    }

    const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)
    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch profiles for admin:', error.message)
      return NextResponse.json({ profiles: [], error: error.message }, { status: 200 })
    }

    // Attempt to fetch auth users, but don't fail if it's not possible (e.g. key permissions)
    let enrichedProfiles = profiles || []
    try {
      const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })

      if (!authError && authData?.users) {
        const authUserById = new Map((authData.users || []).map((authUser) => [authUser.id, authUser]))

        const profileNameUpdates: Array<{ id: string; name: string }> = []
        enrichedProfiles = (profiles || []).map((profile) => {
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
          // Fire and forget updates to avoid slowing down the response
          Promise.all(
            profileNameUpdates.map(({ id, name }) =>
              adminClient.from('profiles').update({ name }).eq('id', id)
            )
          ).catch(e => console.error('Failed to update profile names:', e))
        }
      }
    } catch (authErr) {
      console.warn('Auth users fetch skipped:', authErr)
    }

    return NextResponse.json({ profiles: enrichedProfiles })
  } catch (err) {
    console.error('Admin API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
