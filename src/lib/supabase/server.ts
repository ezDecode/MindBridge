import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
 const cookieStore = await cookies()

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
 const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

 if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
   console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Using placeholders.')
 }

 return createServerClient<Database>(
 supabaseUrl,
 supabaseKey,
 {
 cookies: {
 getAll() {
 return cookieStore.getAll()
 },
 setAll(cookiesToSet) {
 try {
 cookiesToSet.forEach(({ name, value, options }) =>
 cookieStore.set(name, value, options)
 )
 } catch {
 // setAll called from Server Component — ignore
 // Middleware will handle refresh
 }
 },
 },
 }
 )
}

// For Route Handlers - creates client with service role for admin operations
export async function createServiceClient() {
 const cookieStore = await cookies()

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
 const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

 if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
   console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Using placeholders.')
 }

  return createServerClient<Database>(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Ignore
        },
      },
    }
  )
}
