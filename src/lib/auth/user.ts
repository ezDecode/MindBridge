import { createClient } from '@/lib/supabase/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "./demo-users"

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Check profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return { 
      id: user.id, 
      role: profile?.role || 'student', 
      isDemo: false 
    }
  }

  const cookieStore = await cookies()
  const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
  const demoUser = DEMO_USERS[role]
  
  return demoUser ? { 
    id: demoUser.id, 
    role: demoUser.role, 
    isDemo: true 
  } : null
}
