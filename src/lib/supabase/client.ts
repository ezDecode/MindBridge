import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Safely get env vars with fallbacks for build-time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null

export function getClient() {
  if (typeof window === 'undefined') {
    throw new Error('getClient() should only be called on the client side')
  }
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
