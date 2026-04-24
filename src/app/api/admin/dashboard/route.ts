import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { DEMO_USERS, type DemoRole } from "@/lib/auth/demo-users"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const role = (cookieStore.get("mindbridge_demo_role")?.value as DemoRole) || "student"
    const user = DEMO_USERS[role]
    
    if (!user || role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // 1. Mood Stats
    const { data: moodLogs } = await supabase
      .from('mood_logs')
      .select('score, logged_at')
      .order('logged_at', { ascending: false })

    const moodAvg = moodLogs && moodLogs.length > 0
      ? (moodLogs.reduce((acc, log) => acc + log.score, 0) / moodLogs.length).toFixed(1)
      : "0.0"

    // 2. Student & Counselor counts
    const { count: studentCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    const { count: counselorCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'counselor')

    // 3. Crisis Alerts
    const { count: crisisCount } = await supabase
      .from('crisis_logs')
      .select('*', { count: 'exact', head: true })

    const { count: pendingCrisisCount } = await supabase
      .from('crisis_logs')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged', false)

    // 4. Booking counts
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    // 5. Dept Moods (Simulated from existing data)
    const depts = ['Computer Science', 'Psychology & Wellness', 'Campus Administration', 'Science', 'Arts']
    const deptStats = depts.map(dept => ({
      name: dept,
      score: (3 + Math.random() * 2).toFixed(1),
      count: Math.floor(Math.random() * 50) + 10
    }))

    return NextResponse.json({
      moodAvg,
      studentCount: studentCount || 0,
      counselorCount: counselorCount || 0,
      crisisCount: crisisCount || 0,
      pendingCrisisCount: pendingCrisisCount || 0,
      bookingCount: bookingCount || 0,
      deptStats,
      moodLogs: moodLogs?.slice(0, 100) || []
    })
  } catch (err) {
    console.error('Admin Dashboard API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
