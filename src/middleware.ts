import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { type Database } from '@/types/database'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const demoRole = request.cookies.get('mindbridge_demo_role')?.value
  const pathname = request.nextUrl.pathname

  // Public paths
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/auth/callback')) {
    if ((user || demoRole) && pathname === '/login') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    return response
  }

  // Protected paths
  const isProtected =
    pathname.startsWith('/student') ||
    pathname.startsWith('/counselor') ||
    pathname.startsWith('/admin')

  if (!user && !demoRole && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle role-based access for real users
  if (user && !demoRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role && pathname !== '/auth/select-role') {
      return NextResponse.redirect(new URL('/auth/select-role', request.url))
    }

    if (profile?.role) {
      const role = profile.role
      if (pathname.startsWith('/student') && role !== 'student') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }
      if (pathname.startsWith('/counselor') && role !== 'counselor') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }
    }
  }

  // Handle role-based access for demo users
  if (demoRole) {
    if (pathname.startsWith('/student') && demoRole !== 'student') {
      return NextResponse.redirect(new URL(`/${demoRole}/dashboard`, request.url))
    }
    if (pathname.startsWith('/counselor') && demoRole !== 'counselor') {
      return NextResponse.redirect(new URL(`/${demoRole}/dashboard`, request.url))
    }
    if (pathname.startsWith('/admin') && demoRole !== 'admin') {
      return NextResponse.redirect(new URL(`/${demoRole}/dashboard`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
