import { createClient } from '@/lib/supabase/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "./demo-users"

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const cookieStore = await cookies()
  const demoRole = cookieStore.get("mindbridge_demo_role")?.value as DemoRole
  
  let userId: string | undefined
  let isDemo = false

  if (user) {
    userId = user.id
    isDemo = false
  } else if (demoRole && DEMO_USERS[demoRole]) {
    userId = DEMO_USERS[demoRole].id
    isDemo = true
  }

  if (!userId) return null

  // Fetch full profile from DB to ensure data sync
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    // If demo user doesn't exist in DB yet, return the hardcoded one
    // but in a real app we should ensure they are seeded.
    if (isDemo && demoRole) {
      return { ...DEMO_USERS[demoRole], isDemo: true }
    }
    return null
  }

  return {
    id: profile.id,
    email: profile.id === user?.id ? user.email : (isDemo && demoRole ? DEMO_USERS[demoRole].email : ''),
    role: profile.role as DemoRole,
    name: profile.name,
    institution: profile.institution,
    isDemo
  }
}
