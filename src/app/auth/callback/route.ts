import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

export async function GET(request: Request) {
 const { searchParams, origin } = new URL(request.url)
 const code = searchParams.get('code')
 const next = searchParams.get('next') ?? '/student/dashboard'

 if (code) {
 const supabase = await createClient()
 const { error } = await supabase.auth.exchangeCodeForSession(code)
 
 if (!error) {
 // Check user role and redirect accordingly
 const { data: { user } } = await supabase.auth.getUser()
 
 if (user) {
  const { data: profile } = await supabase
  .from('profiles')
  .select('role, name')
  .eq('id', user.id)
  .maybeSingle()

  const resolvedName = resolveProfileDisplayName({
  profileName: profile?.name ?? null,
  email: user.email,
  metadata: (user.user_metadata as Record<string, unknown> | null) ?? null,
  })
  const normalizedRole =
  profile?.role === 'counselor' ||
  (typeof user.user_metadata?.role === 'string' && user.user_metadata.role === 'counselor')
  ? 'counselor'
  : 'student'

  if (!profile || (resolvedName && resolvedName !== profile.name)) {
  await supabase.from('profiles').upsert({
  id: user.id,
  role: normalizedRole,
  name: resolvedName,
  })
  }

  const redirectTo = normalizedRole === 'counselor' 
  ? '/counselor/dashboard' 
  : '/student/dashboard'

 return NextResponse.redirect(`${origin}${redirectTo}`)
 }
 
 return NextResponse.redirect(`${origin}${next}`)
 }
 }

 // Return error page if code exchange fails
 return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
