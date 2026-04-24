import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
 const cookieStore = await cookies()

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
 const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

 if (!supabaseUrl || !supabaseKey) {
   throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
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

 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
 const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

 if (!supabaseUrl || !serviceKey) {
   throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
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
