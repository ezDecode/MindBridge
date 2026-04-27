import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/student/wellness — fetch user's wellness progress
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('wellness_progress')
    .select('xp, level, streak, last_activity')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch wellness:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }

  // Return defaults if no record exists yet
  return NextResponse.json({
    progress: data ?? { xp: 0, level: 1, streak: 0, last_activity: null },
  })
}

// POST /api/student/wellness — award XP on activity completion
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { activity, xpAmount } = body as { activity: string; xpAmount: number }

  if (!activity || typeof xpAmount !== 'number' || xpAmount <= 0 || xpAmount > 100) {
    return NextResponse.json({ error: 'Invalid activity or XP amount' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Fetch current progress (or create default)
  const { data: current } = await supabase
    .from('wellness_progress')
    .select('xp, level, streak, last_activity')
    .eq('user_id', user.id)
    .single()

  const now = new Date()
  let xp = (current?.xp ?? 0) + xpAmount
  let level = current?.level ?? 1
  let streak = current?.streak ?? 0
  let leveledUp = false

  // Streak logic: if last activity was yesterday, increment. If today, keep. Otherwise reset.
  if (current?.last_activity) {
    const lastDate = new Date(current.last_activity)
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff === 1) {
      streak += 1
    } else if (daysDiff > 1) {
      streak = 1 // Reset streak
    }
    // daysDiff === 0 means same day, keep streak
  } else {
    streak = 1 // First activity ever
  }

  // Level-up logic: XP >= Level * 100
  while (xp >= level * 100) {
    xp -= level * 100
    level += 1
    leveledUp = true
  }

  // Upsert progress
  const { error: upsertError } = await supabase
    .from('wellness_progress')
    .upsert({
      user_id: user.id,
      xp,
      level,
      streak,
      last_activity: now.toISOString(),
    })

  if (upsertError) {
    console.error('Failed to update wellness:', upsertError)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }

  // Fire level-up notification if applicable
  if (leveledUp) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      message: `🎉 Level Up! You reached Level ${level}!`,
      type: 'level_up',
      metadata: { level, activity },
    })
  }

  return NextResponse.json({
    progress: { xp, level, streak, last_activity: now.toISOString() },
    leveledUp,
    xpAwarded: xpAmount,
  })
}
