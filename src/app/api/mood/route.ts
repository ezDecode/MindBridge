import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export async function POST(request: Request) {
 try {
 const user = await getAuthUser()
 
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { score, note } = await request.json()

 if (!score || score < 1 || score > 5) {
 return NextResponse.json(
 { error: 'Score must be between 1 and 5' },
 { status: 400 }
 )
 }

 const supabase = await createServiceClient()

 // Insert mood log
 const { data, error } = await supabase
 .from('mood_logs')
 .insert({
 user_id: user.id,
 score,
 note: note || null,
 })
 .select()
 .single()

 if (error) {
 console.error('Failed to save mood:', error)
 return NextResponse.json(
 { error: 'Failed to save mood' },
 { status: 500 }
 )
 }

 // Check if user already logged mood today to avoid double XP
 const today = new Date()
 today.setHours(0, 0, 0, 0)
 
 const { count } = await supabase
   .from('mood_logs')
   .select('*', { count: 'exact', head: true })
   .eq('user_id', user.id)
   .gte('logged_at', today.toISOString())
   .lt('logged_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

 // Award XP only if this is the first log of the day
 if (count && count <= 1) {
   // Increment XP in profile
   const { error: xpError } = await supabase.rpc('increment_xp', { 
     user_id: user.id, 
     amount: 10 
   })

   if (xpError) {
     console.warn('Increment XP RPC failed, trying manual update:', xpError)
     const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
     await supabase.from('profiles').update({ xp: (profile?.xp || 0) + 10 }).eq('id', user.id)
   }
 }

 return NextResponse.json({ success: true, data, xpAwarded: count && count <= 1 })
 } catch (error) {
 console.error('Mood API error:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}

export async function GET(request: Request) {
 try {
 const user = await getAuthUser()
 
 if (!user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const supabase = await createServiceClient()
 const { searchParams } = new URL(request.url)
 const days = parseInt(searchParams.get('days') || '30')

 // Calculate date range
 const startDate = new Date()
 startDate.setDate(startDate.getDate() - days)

 // Fetch mood logs and profile XP
 const [moodsRes, profileRes] = await Promise.all([
   supabase
     .from('mood_logs')
     .select('score, note, logged_at')
     .eq('user_id', user.id)
     .gte('logged_at', startDate.toISOString())
     .order('logged_at', { ascending: false }),
   supabase
     .from('profiles')
     .select('xp')
     .eq('id', user.id)
     .single()
 ])

 if (moodsRes.error) {
 console.error('Failed to fetch moods:', moodsRes.error)
 return NextResponse.json(
 { error: 'Failed to fetch moods' },
 { status: 500 }
 )
 }

 // Calculate streak
 const streak = calculateStreak(moodsRes.data || [])

 return NextResponse.json({
 moods: moodsRes.data || [],
 streak,
 xp: profileRes.data?.xp || 0,
 average: moodsRes.data?.length 
 ? (moodsRes.data.reduce((sum, m) => sum + m.score, 0) / moodsRes.data.length).toFixed(1)
 : null,
 })
 } catch (error) {
 console.error('Mood API error:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}

function calculateStreak(moods: { logged_at: string }[]): number {
 if (moods.length === 0) return 0

 let streak = 0
 const today = new Date()
 today.setHours(0, 0, 0, 0)

 // Group moods by date
 const moodDates = new Set(
 moods.map(m => {
 const date = new Date(m.logged_at)
 date.setHours(0, 0, 0, 0)
 return date.toISOString()
 })
 )

 // Count consecutive days backwards from today
 for (let i = 0; i <= moods.length; i++) {
 const checkDate = new Date(today)
 checkDate.setDate(checkDate.getDate() - i)
 checkDate.setHours(0, 0, 0, 0)

 if (moodDates.has(checkDate.toISOString())) {
 streak++
 } else if (i > 0) {
 // Allow for checking today even if not logged yet
 break
 }
 }

 return streak
}
