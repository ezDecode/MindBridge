import { createServiceClient } from '@/lib/supabase/server'
import { nim } from '@/lib/nvidia-nim'

/**
 * Memory Agent
 *
 * Phase 2: Fast, SQL-only context retrieval. The previous behaviour
 * (`buildMemoryContext`) is preserved for any callers that still rely on a
 * synthesized natural-language briefing, but the chat hot-path now uses
 * `buildFastMemoryContext` / `snapshotToPrompt` to avoid an LLM round-trip on
 * every user turn.
 */

export interface ContextSnapshot {
  mood_avg_7d: number | null
  mood_avg_30d: number | null
  mood_count_7d: number
  mood_trend: 'improving' | 'declining' | 'stable' | 'unknown'
  latest_screening: { severity: string; criteria: string[]; assessed_at: string } | null
  total_chat_messages: number
  last_chat_at: string | null
  recent_crisis_flag: boolean // any crisis in last 7d
}

const EMPTY_SNAPSHOT: ContextSnapshot = {
  mood_avg_7d: null,
  mood_avg_30d: null,
  mood_count_7d: 0,
  mood_trend: 'unknown',
  latest_screening: null,
  total_chat_messages: 0,
  last_chat_at: null,
  recent_crisis_flag: false,
}

function average(scores: number[]): number | null {
  if (!scores.length) return null
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round((sum / scores.length) * 100) / 100
}

function computeTrend(
  avg7: number | null,
  avg30: number | null
): ContextSnapshot['mood_trend'] {
  if (avg7 === null || avg30 === null) return 'unknown'
  const diff = avg7 - avg30
  if (diff > 0.4) return 'improving'
  if (diff < -0.4) return 'declining'
  return 'stable'
}

export async function buildFastMemoryContext(
  userId: string
): Promise<ContextSnapshot> {
  try {
    const supabase = await createServiceClient()
    const now = Date.now()
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      moods30Result,
      latestAssessmentResult,
      chatCountResult,
      lastChatResult,
      crisisResult,
    ] = await Promise.all([
      supabase
        .from('mood_logs')
        .select('score, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', thirtyDaysAgo)
        .order('logged_at', { ascending: false }),

      supabase
        .from('assessments')
        .select('severity, criteria_flagged, assessed_at')
        .eq('user_id', userId)
        .order('assessed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('chat_messages')
        .select('sent_at')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('crisis_flag', true)
        .gte('sent_at', sevenDaysAgo),
    ])

    const moods30 = moods30Result.data ?? []
    const moods7 = moods30.filter((m) => m.logged_at >= sevenDaysAgo)

    const mood_avg_7d = average(moods7.map((m) => m.score))
    const mood_avg_30d = average(moods30.map((m) => m.score))

    const screening = latestAssessmentResult.data
    const latest_screening = screening
      ? {
          severity: screening.severity,
          criteria: screening.criteria_flagged ?? [],
          assessed_at: screening.assessed_at,
        }
      : null

    return {
      mood_avg_7d,
      mood_avg_30d,
      mood_count_7d: moods7.length,
      mood_trend: computeTrend(mood_avg_7d, mood_avg_30d),
      latest_screening,
      total_chat_messages: chatCountResult.count ?? 0,
      last_chat_at: lastChatResult.data?.sent_at ?? null,
      recent_crisis_flag: (crisisResult.count ?? 0) > 0,
    }
  } catch (error) {
    console.error('buildFastMemoryContext error:', error)
    return { ...EMPTY_SNAPSHOT }
  }
}

export function snapshotToPrompt(snap: ContextSnapshot): string {
  const lines: string[] = ['LONG-TERM SIGNALS:']

  if (snap.mood_avg_7d !== null) {
    lines.push(
      `- Mood avg: ${snap.mood_avg_7d}/5 (7d, ${snap.mood_count_7d} logs) vs ${snap.mood_avg_30d ?? 'n/a'}/5 (30d) — trend ${snap.mood_trend}`
    )
  } else {
    lines.push('- Mood: no recent logs')
  }

  if (snap.latest_screening) {
    const crit = snap.latest_screening.criteria.slice(0, 4).join(', ') || 'none'
    lines.push(
      `- Latest screening: ${snap.latest_screening.severity} (${crit})`
    )
  } else {
    lines.push('- Screening: none on file')
  }

  lines.push(
    `- Chat history: ${snap.total_chat_messages} messages${snap.last_chat_at ? `, last on ${snap.last_chat_at.slice(0, 10)}` : ''}`
  )

  if (snap.recent_crisis_flag) {
    lines.push('- ⚠ Crisis signal flagged in the last 7 days')
  }

  return lines.join('\n')
}

/**
 * @deprecated Use {@link buildFastMemoryContext} + {@link snapshotToPrompt} for
 * hot-path context. Kept for the dedicated `/student/chat` page which may still
 * rely on a natural-language briefing. Performs an LLM round-trip.
 */
export async function buildMemoryContext(userId: string): Promise<string> {
  const supabase = await createServiceClient()

  try {
    const [moods, chats, assessments] = await Promise.all([
      supabase
        .from('mood_logs')
        .select('score, note, logged_at')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(30),

      supabase
        .from('chat_messages')
        .select('role, content, sent_at')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(20),

      supabase
        .from('assessments')
        .select('criteria_flagged, severity, assessed_at')
        .eq('user_id', userId)
        .order('assessed_at', { ascending: false })
        .limit(3),
    ])

    if (!moods.data?.length && !chats.data?.length) {
      return 'This is a new student. No previous history available.'
    }

    const completion = await nim.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        {
          role: 'system',
          content: `You are a memory system for MindBridge, a mental health companion app. 
        Your job is to summarize a student's recent history into a concise context block (max 150 words).
        
        DATA:
        Mood logs: ${JSON.stringify(moods.data)}
        Recent chat: ${JSON.stringify(chats.data)}
        Assessments: ${JSON.stringify(assessments.data)}
        
        OUTPUT:
        Write a brief briefing for a companion AI. Include:
        - Current emotional state/trend.
        - Key themes or topics they've been talking about.
        - Any specific concerns (insomnia, exam stress, etc.)
        - Their communication style.
        
        Be specific and empathetic. Speak in the third person about the student.`,
        },
      ],
      max_tokens: 250,
      temperature: 0.3,
    })

    return (
      completion.choices[0].message.content || 'History summary unavailable.'
    )
  } catch (error) {
    console.error('Memory Agent Error:', error)
    return 'History summary unavailable due to a technical error.'
  }
}
