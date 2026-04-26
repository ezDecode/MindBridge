import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export async function POST(request: Request) {
 try {
  const user = await getAuthUser()
  
  if (!user || user.role !== 'student') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { answers } = await request.json()
  const supabase = await createServiceClient()

  // 1. Calculate severity and flagged criteria
  const flagged = []
  let score = 0

  for (const ans of answers) {
   score += ans.score
   if (ans.score >= 2) flagged.push(ans.category)
  }

  const uniqueFlagged = [...new Set(flagged)]
  let severity: 'none' | 'mild' | 'moderate' | 'severe' = 'none'

  if (score >= 15) severity = 'severe'
  else if (score >= 10) severity = 'moderate'
  else if (score >= 5) severity = 'mild'

  // 2. Save assessment
  const { data, error } = await supabase
  .from('assessments')
  .insert({
   user_id: user.id,
   criteria_flagged: uniqueFlagged,
   severity
  })
  .select()
  .single()

  if (error) throw error

  return NextResponse.json({ success: true, data })
 } catch (error) {
  console.error('Question analysis error:', error)
  return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
  )
 }
}
