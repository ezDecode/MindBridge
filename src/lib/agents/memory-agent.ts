import { nim, MEMORY_PARAMS } from '@/lib/nvidia-nim'
import { createClient } from '@/lib/supabase/server'

/**
 * Memory Agent
 * 
 * Runs before every chat response. Reads the student's entire history
 * (moods, chats, assessments) and compresses it into a rich context summary.
 * This summary becomes part of the companion agent's system prompt.
 * 
 * This is what makes MindBridge feel like it "knows" you.
 */

export interface StudentHistory {
  moods: {
    score: number
    note: string | null
    logged_at: string
  }[]
  chats: {
    role: 'user' | 'assistant'
    content: string
    crisis_flag: boolean
    sent_at: string
  }[]
  assessments: {
    criteria_flagged: string[]
    severity: string
    assessed_at: string
  }[]
  profile: {
    name: string | null
    institution: string | null
  } | null
}

/**
 * Fetch raw history data from Supabase
 */
export async function fetchStudentHistory(userId: string): Promise<StudentHistory> {
  const supabase = await createClient()

  const [moodsResult, chatsResult, assessmentsResult, profileResult] = await Promise.all([
    // Last 30 mood logs
    supabase
      .from('mood_logs')
      .select('score, note, logged_at')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(30),

    // Last 50 chat messages
    supabase
      .from('chat_messages')
      .select('role, content, crisis_flag, sent_at')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(50),

    // Last 5 assessments
    supabase
      .from('assessments')
      .select('criteria_flagged, severity, assessed_at')
      .eq('user_id', userId)
      .order('assessed_at', { ascending: false })
      .limit(5),

    // Profile
    supabase
      .from('profiles')
      .select('name, institution')
      .eq('id', userId)
      .single(),
  ])

  return {
    moods: moodsResult.data ?? [],
    chats: chatsResult.data ?? [],
    assessments: assessmentsResult.data ?? [],
    profile: profileResult.data,
  }
}

/**
 * Build memory context using NIM to summarize history
 * Returns a natural language summary that the companion agent uses
 */
export async function buildMemoryContext(userId: string): Promise<string> {
  const history = await fetchStudentHistory(userId)
  
  // If no history, return minimal context
  if (history.moods.length === 0 && history.chats.length === 0) {
    return `This is a new student. No previous interactions yet. Be warm and welcoming.`
  }

  // Calculate some quick stats for the prompt
  const moodTrend = calculateMoodTrend(history.moods)
  const recentCrisis = history.chats.some(c => c.crisis_flag)
  const latestAssessment = history.assessments[0]

  const prompt = `You are a memory system for a mental health companion. Given this student's history, write a brief context summary (max 200 words) that will help a companion AI understand who this person is right now.

Include:
- Emotional trend over recent days
- Key themes they've discussed
- Any concerns to be aware of
- Their communication style


Student name: ${history.profile?.name || 'Unknown'}
Institution: ${history.profile?.institution || 'Unknown'}

Mood history (last 30 days, 1=very low, 5=good):
${JSON.stringify(history.moods.slice(0, 10))}

Mood trend: ${moodTrend}

Recent conversations (most recent first):
${formatChatsForContext(history.chats.slice(0, 20))}

${recentCrisis ? '⚠️ IMPORTANT: Recent crisis flag detected in conversation history.' : ''}

Mental health indicators from past assessments:
${latestAssessment ? `Severity: ${latestAssessment.severity}, Flagged: ${latestAssessment.criteria_flagged.join(', ')}` : 'No assessments yet'}

Write as if briefing a counselor before a session. Be specific, not generic. Focus on what would help the companion respond appropriately right now.`

  try {
    const response = await nim.chat.completions.create({
      ...MEMORY_PARAMS,
      messages: [{ role: 'user', content: prompt }],
    })

    return response.choices[0]?.message?.content ?? getDefaultContext(history)
  } catch (error) {
    console.error('Memory agent error:', error)
    return getDefaultContext(history)
  }
}

/**
 * Quick rule-based fallback if NIM fails
 */
function getDefaultContext(history: StudentHistory): string {
  const moodTrend = calculateMoodTrend(history.moods)
  const recentCrisis = history.chats.some(c => c.crisis_flag)
  
  let context = `Student: ${history.profile?.name || 'Student'}\n`
  context += `Recent mood trend: ${moodTrend}\n`
  context += `Chat history: ${history.chats.length} messages\n`
  
  if (recentCrisis) {
    context += `⚠️ Recent crisis flag detected - approach with extra care\n`
  }
  
  return context
}

/**
 * Calculate mood trend description
 */
function calculateMoodTrend(moods: { score: number; logged_at: string }[]): string {
  if (moods.length === 0) return 'No mood data'
  if (moods.length === 1) return `Single check-in: ${describeMood(moods[0].score)}`
  
  const recent = moods.slice(0, 7)
  const avgRecent = recent.reduce((sum, m) => sum + m.score, 0) / recent.length
  
  // Compare to older if available
  if (moods.length > 7) {
    const older = moods.slice(7, 14)
    const avgOlder = older.reduce((sum, m) => sum + m.score, 0) / older.length
    
    const diff = avgRecent - avgOlder
    if (diff > 0.5) return `Improving (avg ${avgRecent.toFixed(1)}, up from ${avgOlder.toFixed(1)})`
    if (diff < -0.5) return `Declining (avg ${avgRecent.toFixed(1)}, down from ${avgOlder.toFixed(1)})`
    return `Stable around ${avgRecent.toFixed(1)}`
  }
  
  return `Recent average: ${avgRecent.toFixed(1)} (${describeMood(Math.round(avgRecent))})`
}

function describeMood(score: number): string {
  const descriptions: Record<number, string> = {
    1: 'very low',
    2: 'low',
    3: 'okay',
    4: 'good',
    5: 'great',
  }
  return descriptions[score] ?? 'unknown'
}

/**
 * Format chat messages for context (condensed)
 */
function formatChatsForContext(chats: StudentHistory['chats']): string {
  if (chats.length === 0) return 'No conversation history yet.'
  
  return chats
    .map(c => {
      const role = c.role === 'user' ? 'Student' : 'AI'
      const flag = c.crisis_flag ? ' [CRISIS]' : ''
      // Truncate long messages
      const content = c.content.length > 100 
        ? c.content.slice(0, 100) + '...' 
        : c.content
      return `${role}${flag}: ${content}`
    })
    .join('\n')
}

/**
 * Get just the student name for greetings
 */
export async function getStudentName(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()
  
  return data?.name || 'there'
}
