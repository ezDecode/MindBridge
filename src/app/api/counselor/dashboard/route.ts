import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'
import { resolveProfileDisplayName } from '@/lib/profile-name'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user || user.role !== 'counselor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceClient()

    // Fetch crisis logs from the last 24h
    const { data: alerts } = await supabase
      .from('crisis_logs')
      .select('id, triggered_at, severity, student_id')
      .gte('triggered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('triggered_at', { ascending: false })

    // Resolve student display names for the alerts
    const studentIds = Array.from(new Set((alerts || []).map((a) => a.student_id).filter(Boolean)))
    const nameById = new Map<string, string>()
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', studentIds)
      for (const p of profiles || []) {
        const resolved = resolveProfileDisplayName({ profileName: p.name }) || 'Student'
        nameById.set(p.id, resolved)
      }
    }

    const alertsWithNames = (alerts || []).map((a) => ({
      ...a,
      student_name: nameById.get(a.student_id) || 'Student',
    }))

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
      alerts: alertsWithNames,
      todayCount: todayCount || 0,
    })
  } catch (error) {
    console.error('Counselor Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
