import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"

export async function GET(request: Request) {
  try {
    const supabase = await createServiceClient()
    
    const cookieStore = await cookies()
    const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
    const user = DEMO_USERS[role]
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch chat sessions
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .gte('last_message_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Fetch bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('slot_start, type, status, counselor:profiles!counselor_id(name)')
      .eq('student_id', user.id)
      .in('status', ['pending_confirmation', 'confirmed'])
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true })
      .limit(1)

    // Fetch assessments
    const { data: assessments } = await supabase
      .from('assessments')
      .select('severity, criteria_flagged, assessed_at')
      .eq('user_id', user.id)
      .order('assessed_at', { ascending: false })
      .limit(1)

    return NextResponse.json({
      sessions: sessions || [],
      bookings: bookings || [],
      assessments: assessments || []
    })
  } catch (error) {
    console.error('Student Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
