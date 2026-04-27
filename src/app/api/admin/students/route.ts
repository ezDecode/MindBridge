import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/admin/students — list all students with wellness indicators
export async function GET() {
  const user = await getAuthUser()
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Fetch all students
  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, name, institution, created_at, counselor_id')
    .eq('role', 'student')
    .order('name')

  if (error) {
    console.error('Failed to fetch students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }

  // For each student, get latest mood + assessment for stability indicators
  const enriched = await Promise.all(
    (students ?? []).map(async (student) => {
      const [moodResult, assessmentResult] = await Promise.all([
        supabase
          .from('mood_logs')
          .select('score')
          .eq('user_id', student.id)
          .order('logged_at', { ascending: false })
          .limit(3),
        supabase
          .from('assessments')
          .select('severity')
          .eq('user_id', student.id)
          .order('assessed_at', { ascending: false })
          .limit(1)
          .single(),
      ])

      const moods = moodResult.data ?? []
      const avgMood = moods.length > 0
        ? Math.round((moods.reduce((s, m) => s + m.score, 0) / moods.length) * 10) / 10
        : null
      const severity = assessmentResult.data?.severity ?? 'none'

      // Stability indicator
      let stability: 'stable' | 'watch' | 'at-risk' = 'stable'
      if (severity === 'severe' || (avgMood !== null && avgMood <= 2)) {
        stability = 'at-risk'
      } else if (severity === 'moderate' || (avgMood !== null && avgMood <= 3)) {
        stability = 'watch'
      }

      return {
        ...student,
        avgMood,
        severity,
        stability,
      }
    })
  )

  return NextResponse.json({ students: enriched })
}
