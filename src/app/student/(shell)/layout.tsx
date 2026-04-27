import { getDemoRoleCookie } from "@/lib/auth/demo-cookie"
import { createClient } from "@/lib/supabase/server"
import { StudentShellClient } from "./shell-client"

/**
 * Server Component wrapper for the student shell.
 * Resolves role server-side to fix the production HttpOnly cookie
 * issue where the bot becomes invisible (§6 of the manifesto).
 */
export default async function StudentShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolve role server-side — no client-side cookie reading needed
  let isStudent = false

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isStudent = profile?.role === 'student'
  } else {
    // Demo mode — resolve from HttpOnly cookie server-side
    const demoRole = await getDemoRoleCookie()
    isStudent = demoRole === 'student'
  }

  return (
    <StudentShellClient isStudent={isStudent}>
      {children}
    </StudentShellClient>
  )
}
