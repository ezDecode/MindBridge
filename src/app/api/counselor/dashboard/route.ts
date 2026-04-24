import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"

export async function GET(request: Request) {
  try {
    const supabase = await createServiceClient()
    
    const cookieStore = await cookies()
    const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "counselor"
    const user = DEMO_USERS[role]
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch crisis logs
    const { data: alerts } = await supabase
      .from('crisis_logs')
      .select('id, triggered_at, severity, student_id')
      .gte('triggered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('triggered_at', { ascending: false })

    // Fetch today's confirmed bookings count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count: todayCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('counselor_id', user.id)
      .eq('status', 'confirmed')
      .gte('slot_start', today.toISOString())
      .lt('slot_start', tomorrow.toISOString())

    return NextResponse.json({
      alerts: alerts || [],
      todayCount: todayCount || 0
    })
  } catch (error) {
    console.error('Counselor Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
