import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
 try {
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { score, note } = await request.json()

 if (!score || score < 1 || score > 5) {
 return NextResponse.json(
 { error: 'Score must be between 1 and 5' },
 { status: 400 }
 )
 }

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

 return NextResponse.json({ success: true, data })
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
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { searchParams } = new URL(request.url)
 const days = parseInt(searchParams.get('days') || '30')

 // Calculate date range
 const startDate = new Date()
 startDate.setDate(startDate.getDate() - days)

 // Fetch mood logs
 const { data, error } = await supabase
 .from('mood_logs')
 .select('score, note, logged_at')
 .eq('user_id', user.id)
 .gte('logged_at', startDate.toISOString())
 .order('logged_at', { ascending: false })

 if (error) {
 console.error('Failed to fetch moods:', error)
 return NextResponse.json(
 { error: 'Failed to fetch moods' },
 { status: 500 }
 )
 }

 // Calculate streak
 const streak = calculateStreak(data || [])

 return NextResponse.json({
 moods: data || [],
 streak,
 average: data?.length 
 ? (data.reduce((sum, m) => sum + m.score, 0) / data.length).toFixed(1)
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
