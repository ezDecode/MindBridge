import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
 let supabaseResponse = NextResponse.next({
 request,
 })

 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 getAll() {
 return request.cookies.getAll()
 },
 setAll(cookiesToSet) {
 cookiesToSet.forEach(({ name, value }) =>
 request.cookies.set(name, value)
 )
 supabaseResponse = NextResponse.next({
 request,
 })
 cookiesToSet.forEach(({ name, value, options }) =>
 supabaseResponse.cookies.set(name, value, options)
 )
 },
 },
 }
 )

 // Refresh session if expired
 const {
 data: { user },
 } = await supabase.auth.getUser()

 const url = request.nextUrl.clone()
 const pathname = url.pathname

 // Protected routes
 const studentRoutes = pathname.startsWith('/student')
 const counselorRoutes = pathname.startsWith('/counselor')
 const adminRoutes = pathname.startsWith('/admin')

 // Hardcoded Admin Auth override
 const hasAdminCookie = request.cookies.get('mindbridge_admin')?.value === 'true'

 if (adminRoutes && pathname !== '/admin/login' && !hasAdminCookie) {
 url.pathname = '/admin/login'
 return NextResponse.redirect(url)
 }

 if (hasAdminCookie && pathname === '/admin/login') {
 url.pathname = '/admin/dashboard'
 return NextResponse.redirect(url)
 }

 if (!user && (studentRoutes || counselorRoutes)) {
 // Redirect unauthenticated users to login
 url.pathname = '/login'
 return NextResponse.redirect(url)
 }

 if (user && (pathname === '/login' || pathname === '/verify')) {
 // Get user profile to determine role
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single()

 if (profile?.role === 'counselor') {
 url.pathname = '/counselor/dashboard'
 } else {
 url.pathname = '/student/dashboard'
 }
 return NextResponse.redirect(url)
 }

 // Role-based access control
 if (user && studentRoutes) {
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single()

 if (profile?.role === 'counselor') {
 url.pathname = '/counselor/dashboard'
 return NextResponse.redirect(url)
 }
 }

 if (user && counselorRoutes) {
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single()

 if (profile?.role === 'student') {
 url.pathname = '/student/dashboard'
 return NextResponse.redirect(url)
 }
 }

 return supabaseResponse
}
