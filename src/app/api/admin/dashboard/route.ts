import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
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

    // 5. Dept Moods (Real data)
    const { data: moodWithProfiles } = await supabase
      .from('mood_logs')
      .select('score, user_id, profiles(institution)')

    const deptMap = new Map<string, { totalScore: number, count: number }>()

    if (moodWithProfiles) {
      moodWithProfiles.forEach((log) => {
        // Supabase join might return an array or a single object depending on the query
        const profilesData = log.profiles as unknown
        const profiles = Array.isArray(profilesData) 
          ? (profilesData[0] as { institution: string | null } | undefined)
          : (profilesData as { institution: string | null } | null)
          
        const inst = profiles?.institution || 'General'
        const existing = deptMap.get(inst) || { totalScore: 0, count: 0 }
        deptMap.set(inst, {
          totalScore: existing.totalScore + log.score,
          count: existing.count + 1
        })
      })
    }

    const deptStats = Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      score: Number((data.totalScore / data.count).toFixed(1)),
      count: data.count
    })).sort((a, b) => b.count - a.count)

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
