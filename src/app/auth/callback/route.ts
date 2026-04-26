import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if user has a role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile?.role) {
        return NextResponse.redirect(`${origin}/auth/select-role`)
      }

      const targets: Record<string, string> = {
        student: '/student/dashboard',
        counselor: '/counselor/dashboard',
        admin: '/admin/dashboard',
      }
      
      return NextResponse.redirect(`${origin}${targets[profile.role] || '/student/dashboard'}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
