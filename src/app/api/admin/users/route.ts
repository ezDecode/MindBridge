import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
 const supabase = await createClient()

 // First verify user is authenticated
 const { data: { user } } = await supabase.auth.getUser()
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 // Use the service role to bypass RLS in an admin context
 const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
 const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
 
 if (!supabaseUrl || !supabaseServiceKey) {
 return NextResponse.json({ error: 'Service role configuration missing' }, { status: 500 })
 }

 const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey)
 const { data: profiles, error } = await adminClient
 .from('profiles')
 .select('*')
 .order('created_at', { ascending: false })

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 500 })
 }

 return NextResponse.json({ profiles })
}