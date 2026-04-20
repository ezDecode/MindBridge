import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
 .select('role')
 .eq('id', user.id)
 .single()

 const redirectTo = profile?.role === 'counselor' 
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
