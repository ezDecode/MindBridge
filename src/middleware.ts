import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const role = request.cookies.get('mindbridge_demo_role')?.value
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  const isProtected =
    pathname.startsWith('/student') ||
    pathname.startsWith('/counselor') ||
    pathname.startsWith('/admin')

  // No cookie + protected route → login
  if (!role && isProtected) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Has cookie + on login page → redirect to their dashboard
  if (role && pathname === '/login') {
    const targets: Record<string, string> = {
      student: '/student/dashboard',
      counselor: '/counselor/dashboard',
      admin: '/admin/dashboard',
    }
    url.pathname = targets[role] || '/student/dashboard'
    return NextResponse.redirect(url)
  }

  // Role mismatch protection (student trying to access /admin, etc.)
  if (role) {
    if (pathname.startsWith('/student') && role !== 'student') {
      url.pathname = role === 'counselor' ? '/counselor/dashboard' : '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/counselor') && role !== 'counselor') {
      url.pathname = role === 'student' ? '/student/dashboard' : '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = role === 'student' ? '/student/dashboard' : '/counselor/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}
