/**
 * Proactive Agent - Supabase Edge Function
 * 
 * Runs on a schedule (daily at 8 AM IST) to send personalized morning check-ins.
 * Uses the Observer Agent's insights to determine who needs outreach and what to say.
 * 
 * Deployment: supabase functions deploy proactive-agent
 * Schedule: Set up via Supabase Dashboard → Database → Webhooks (cron)
 * 
 * Cron expression for 8 AM IST: 30 2 * * * (2:30 UTC = 8:00 IST)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types
interface StudentInsight {
  userId: string
  name: string
  urgency: 'low' | 'medium' | 'high'
  reason: string
  message: string
}

interface MoodLog {
  score: number
  logged_at: string
}

interface ChatMessage {
  sent_at: string
  crisis_flag: boolean
}

interface Assessment {
  criteria_flagged: string[]
  severity: string
}

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper: Get date X days ago
function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

// Analyze a single student's patterns
async function analyzeStudent(studentId: string, studentName: string): Promise<StudentInsight | null> {
  // Fetch student data
  const [moodsRes, chatsRes, assessmentsRes] = await Promise.all([
    supabase
      .from('mood_logs')
      .select('score, logged_at')
      .eq('user_id', studentId)
      .gte('logged_at', daysAgo(14))
      .order('logged_at', { ascending: true }),
    
    supabase
      .from('chat_messages')
      .select('sent_at, crisis_flag')
      .eq('user_id', studentId)
      .eq('role', 'user')
      .gte('sent_at', daysAgo(14))
      .order('sent_at', { descending: true }),
    
    supabase
      .from('assessments')
      .select('criteria_flagged, severity')
      .eq('user_id', studentId)
      .order('assessed_at', { ascending: false })
      .limit(1),
  ])

  const moods = (moodsRes.data || []) as MoodLog[]
  const chats = (chatsRes.data || []) as ChatMessage[]
  const assessment = (assessmentsRes.data?.[0] || null) as Assessment | null
  const name = studentName || 'there'

  // Check for high-priority signals
  
  // 1. Self-harm or severe assessment
  if (assessment?.criteria_flagged?.includes('self_harm') || assessment?.severity === 'severe') {
    return {
      userId: studentId,
      name,
      urgency: 'high',
      reason: 'Severe assessment or self-harm flagged',
      message: `Hey ${name}, just checking in. How are you feeling today? I'm here if you want to talk.`,
    }
  }

  // 2. Recent crisis flag
  const recentCrisis = chats.some(c => c.crisis_flag)
  if (recentCrisis) {
    return {
      userId: studentId,
      name,
      urgency: 'high',
      reason: 'Recent crisis flag in chat',
      message: `Good morning ${name}. I wanted to check in after our last conversation. How are things today?`,
    }
  }

  // 3. Consistently low moods (more than half below 3)
  const recentMoods = moods.filter(m => new Date(m.logged_at) >= new Date(daysAgo(7)))
  const lowMoodCount = recentMoods.filter(m => m.score <= 2).length
  if (recentMoods.length >= 3 && lowMoodCount > recentMoods.length / 2) {
    return {
      userId: studentId,
      name,
      urgency: 'medium',
      reason: 'Consistently low mood scores',
      message: `Hey ${name}, how's today looking? I noticed the last few days have been tough. Want to talk?`,
    }
  }

  // 4. Was active but went silent (had chats 7-14 days ago, none in last 7 days)
  const chatsLastWeek = chats.filter(c => new Date(c.sent_at) >= new Date(daysAgo(7)))
  const chatsPreviousWeek = chats.filter(c => 
    new Date(c.sent_at) < new Date(daysAgo(7)) && 
    new Date(c.sent_at) >= new Date(daysAgo(14))
  )
  if (chatsPreviousWeek.length >= 3 && chatsLastWeek.length === 0) {
    return {
      userId: studentId,
      name,
      urgency: 'medium',
      reason: 'User went silent after being active',
      message: `Hey ${name}, haven't heard from you in a bit. Just checking in — hope you're doing okay.`,
    }
  }

  // 5. Regular check-in (no chat in 3+ days but has been active before)
  if (chats.length > 0) {
    const lastChatDate = new Date(chats[0].sent_at)
    const daysSinceChat = Math.floor((Date.now() - lastChatDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceChat >= 3) {
      return {
        userId: studentId,
        name,
        urgency: 'low',
        reason: 'Regular check-in due',
        message: `Morning ${name}! Quick mood check — how are you feeling today?`,
      }
    }
  }

  // No outreach needed
  return null
}

// Send check-in message to a student
async function sendCheckIn(insight: StudentInsight): Promise<boolean> {
  try {
    // Create a new proactive chat session
    const sessionId = crypto.randomUUID()
    
    // Insert the proactive message
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: insight.userId,
        session_id: sessionId,
        role: 'assistant',
        content: insight.message,
        is_proactive: true,
        sent_at: new Date().toISOString(),
      })

    if (error) {
      console.error(`Failed to send check-in to ${insight.userId}:`, error)
      return false
    }

    // Log the outreach
    await supabase
      .from('proactive_outreach_logs')
      .insert({
        student_id: insight.userId,
        urgency: insight.urgency,
        reason: insight.reason,
        message_sent: insight.message,
        session_id: sessionId,
      })

    console.log(`✓ Sent ${insight.urgency} priority check-in to ${insight.name}`)
    return true
  } catch (error) {
    console.error(`Error sending check-in to ${insight.userId}:`, error)
    return false
  }
}

// Main handler
Deno.serve(async (req) => {
  // Verify this is a scheduled call or has proper auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  console.log('🌅 Proactive Agent starting morning check-ins...')

  try {
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'student')

    if (studentsError || !students) {
      throw new Error('Failed to fetch students')
    }

    console.log(`Analyzing ${students.length} students...`)

    // Analyze each student
    const insights: StudentInsight[] = []
    
    for (const student of students) {
      const insight = await analyzeStudent(student.id, student.name)
      if (insight) {
        insights.push(insight)
      }
    }

    // Sort by urgency (high first)
    const urgencyOrder = { high: 0, medium: 1, low: 2 }
    insights.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

    console.log(`Found ${insights.length} students needing outreach`)

    // Send check-ins
    let sent = 0
    let failed = 0

    for (const insight of insights) {
      const success = await sendCheckIn(insight)
      if (success) sent++
      else failed++
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const summary = {
      analyzed: students.length,
      needingOutreach: insights.length,
      sent,
      failed,
      breakdown: {
        high: insights.filter(i => i.urgency === 'high').length,
        medium: insights.filter(i => i.urgency === 'medium').length,
        low: insights.filter(i => i.urgency === 'low').length,
      },
    }

    console.log('✅ Proactive Agent completed:', summary)

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Proactive Agent error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
