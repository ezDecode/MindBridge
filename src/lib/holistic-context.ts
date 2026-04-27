import { createServiceClient } from '@/lib/supabase/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

/**
 * Holistic Context Builder — The "Soul Snapshot"
 * 
 * Aggregates cross-platform user data into a unified context block
 * for the Omniscient Companion AI. This replaces simple-context.ts
 * with deeper longitudinal awareness.
 * 
 * Data sources:
 *  1. Mood Pulse — last 7 mood entries → trend trajectory
 *  2. Journal Semantic Themes — last 3 ai_insight fields
 *  3. Forum Footprint — last 3 topics engaged with
 *  4. UI Telemetry — current page & active module
 *  5. Wellness Progress — XP, level, streak
 *  6. Assessment — severity & criteria
 *  7. Chat Topics — keyword extraction from recent messages
 * 
 * Privacy mandate: The AI uses this knowledge to inform tone
 * and suggestions but MUST NOT state "I saw your private journal."
 * 
 * Robustness: Uses Promise.allSettled so a single failing query
 * does not zero out all context. Uses createServiceClient for
 * proper service-role access across all tables.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface HolisticContext {
  name: string
  moodPulse: {
    trend: 'Stable' | 'Declining' | 'Improving' | 'Unknown'
    lastScore: number | null
    label: string
    recentNote: string | null
    avgScore: number | null
  }
  journalThemes: string[]        // last 3 ai_insight summaries
  forumFootprint: string[]       // last 3 topic tags engaged
  assessment: {
    severity: 'none' | 'mild' | 'moderate' | 'severe'
    criteria: string[]
    assessedAt: string | null
  }
  uiTelemetry: {
    currentPage: string | null
    activeModule: string | null
    idleSeconds: number | null
  }
  recentChatTopics: string[]
  lastChatAt: string | null
  daysSinceLastChat: number | null
  isNewUser: boolean
  streak: number
  level: number
  xp: number
  freshness: {
    moodStale: boolean      // last mood log > 7 days ago
    journalStale: boolean   // last journal > 14 days ago
    assessmentStale: boolean // last assessment > 30 days ago
  }
}

/** Data presence summary for debugging */
export interface ContextDataPresence {
  moodLogs: { present: boolean; count: number }
  journals: { present: boolean; count: number }
  forum: { present: boolean; count: number }
  assessment: { present: boolean; severity: string }
  wellness: { present: boolean; level: number; xp: number }
  chatHistory: { present: boolean; topicCount: number }
  freshness: HolisticContext['freshness']
}

// ─── Helpers ─────────────────────────────────────────────────────

function getScoreLabel(score: number): string {
  const labels: Record<number, string> = {
    1: 'really low',
    2: 'low',
    3: 'okay',
    4: 'good',
    5: 'great',
  }
  return labels[score] ?? 'unknown'
}

function calculateMoodTrend(
  scores: { score: number }[]
): 'Stable' | 'Declining' | 'Improving' | 'Unknown' {
  if (scores.length < 3) return 'Unknown'

  const recentSlice = scores.slice(0, 3)
  const olderSlice = scores.slice(3, 7)

  if (olderSlice.length === 0) return 'Unknown'

  const recentAvg = recentSlice.reduce((s, m) => s + m.score, 0) / recentSlice.length
  const olderAvg = olderSlice.reduce((s, m) => s + m.score, 0) / olderSlice.length
  const diff = recentAvg - olderAvg

  if (diff > 0.5) return 'Improving'
  if (diff < -0.5) return 'Declining'
  return 'Stable'
}

// Extended keyword map — includes Hinglish terms common to Indian college students
const TOPIC_KEYWORDS: Record<string, string> = {
  // English
  sleep: 'sleep issues',
  tired: 'sleep issues',
  insomnia: 'sleep issues',
  exam: 'exam stress',
  test: 'exam stress',
  assignment: 'academic pressure',
  placement: 'placement anxiety',
  college: 'academic pressure',
  anxious: 'anxiety',
  nervous: 'anxiety',
  panic: 'panic',
  stress: 'stress',
  overload: 'burnout',
  burnout: 'burnout',
  sad: 'low mood',
  heavy: 'emotional weight',
  down: 'low mood',
  hopeless: 'hopelessness',
  lonely: 'loneliness',
  alone: 'loneliness',
  family: 'family concerns',
  parents: 'family concerns',
  friend: 'friendship issues',
  breakup: 'relationship grief',
  relationship: 'relationship grief',
  worthless: 'self-worth struggles',
  useless: 'self-worth struggles',
  roommate: 'roommate friction',
  internship: 'career anxiety',

  // Hinglish / Indian college context
  tension: 'stress',
  pareshan: 'anxiety',
  ghar: 'homesickness',
  hostel: 'hostel life stress',
  ragging: 'ragging/bullying',
  backlog: 'academic backlog',
  cgpa: 'academic pressure',
  viva: 'exam stress',
  mess: 'hostel life stress',
  warden: 'hostel life stress',
  attend: 'attendance anxiety',
  attendance: 'attendance anxiety',
  proxy: 'academic pressure',
  semester: 'exam stress',
  topper: 'comparison anxiety',
  peer: 'peer pressure',
}

function extractTopicsFromMessages(messages: { content: string }[]): string[] {
  const topics = new Set<string>()
  for (const msg of messages) {
    const lower = msg.content.toLowerCase()
    for (const [keyword, topic] of Object.entries(TOPIC_KEYWORDS)) {
      if (lower.includes(keyword)) {
        topics.add(topic)
      }
    }
  }
  return Array.from(topics).slice(0, 5)
}

function resolveActiveModule(page: string | null): string | null {
  if (!page) return null
  if (page.includes('/journal')) return 'Journaling'
  if (page.includes('/wellness')) return 'Wellness Activities'
  if (page.includes('/breathing')) return '4-7-8 Breathing Guide'
  if (page.includes('/chat')) return 'AI Chat'
  if (page.includes('/forum')) return 'Peer Forum'
  if (page.includes('/book')) return 'Counselor Booking'
  if (page.includes('/screening')) return 'Mental Health Screening'
  if (page.includes('/resources')) return 'Resource Hub'
  if (page.includes('/check-in')) return 'Mood Check-in'
  if (page.includes('/mood-history')) return 'Mood History'
  if (page.includes('/dashboard')) return 'Dashboard'
  return null
}

function daysBetween(dateStr: string, now: number): number {
  return Math.floor((now - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

/** Safe extractor for Promise.allSettled results */
function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null
}

// ─── Main Builder ────────────────────────────────────────────────

export async function buildHolisticContext(
  userId: string,
  clientContext?: { currentPage?: string | null; idleSeconds?: number | null }
): Promise<HolisticContext> {
  const supabase = await createServiceClient()
  const now = Date.now()

  // Parallel fetch — all lightweight queries, capped rows
  // Uses Promise.allSettled so one failing query doesn't kill all context
  const results = await Promise.allSettled([
    supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single(),

    supabase
      .from('mood_logs')
      .select('score, note, logged_at')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(7),

    supabase
      .from('assessments')
      .select('severity, criteria_flagged, assessed_at')
      .eq('user_id', userId)
      .order('assessed_at', { ascending: false })
      .limit(1)
      .single(),

    supabase
      .from('chat_messages')
      .select('content, sent_at')
      .eq('user_id', userId)
      .eq('role', 'user')
      .order('sent_at', { ascending: false })
      .limit(5),

    // Journal Semantic Themes: last 3 ai_insights
    supabase
      .from('journals')
      .select('ai_insight, created_at')
      .eq('user_id', userId)
      .not('ai_insight', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3),

    // Forum Footprint: last 3 posts/tags the user engaged with
    supabase
      .from('forum_posts')
      .select('tags')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),

    // Wellness progress
    supabase
      .from('wellness_progress')
      .select('xp, level, streak')
      .eq('user_id', userId)
      .single(),
  ])

  // Extract results safely — a failed query returns null, not an error
  const profileResult = settled(results[0])
  const moodResult = settled(results[1])
  const assessmentResult = settled(results[2])
  const chatResult = settled(results[3])
  const journalResult = settled(results[4])
  const forumResult = settled(results[5])
  const wellnessResult = settled(results[6])

  const moods = moodResult?.data ?? []
  const chats = chatResult?.data ?? []
  const journalRows = journalResult?.data ?? []
  const journalInsights = journalRows
    .map(j => j.ai_insight)
    .filter(Boolean) as string[]
  const forumTags = (forumResult?.data ?? [])
    .flatMap(p => p.tags ?? [])
  const uniqueForumTags = [...new Set(forumTags)].slice(0, 5)
  const assessment = assessmentResult?.data
  const wellness = wellnessResult?.data

  const lastMood = moods[0]
  const displayName = resolveProfileDisplayName({
    profileName: profileResult?.data?.name ?? null,
  })

  const isNewUser = moods.length === 0 && chats.length === 0

  // Calculate avg score
  const avgScore = moods.length > 0
    ? moods.reduce((sum, m) => sum + m.score, 0) / moods.length
    : null

  // Days since last chat
  const lastChatAt = chats[0]?.sent_at ?? null
  const daysSinceLastChat = lastChatAt ? daysBetween(lastChatAt, now) : null

  // Freshness checks
  const lastMoodAt = lastMood?.logged_at
  const lastJournalAt = journalRows[0]?.created_at
  const lastAssessmentAt = assessment?.assessed_at

  const freshness = {
    moodStale: lastMoodAt ? daysBetween(lastMoodAt, now) > 7 : true,
    journalStale: lastJournalAt ? daysBetween(lastJournalAt, now) > 14 : true,
    assessmentStale: lastAssessmentAt ? daysBetween(lastAssessmentAt, now) > 30 : true,
  }

  return {
    name: displayName ?? 'there',
    moodPulse: {
      trend: calculateMoodTrend(moods),
      lastScore: lastMood?.score ?? null,
      label: getScoreLabel(lastMood?.score ?? 3),
      recentNote: lastMood?.note ?? null,
      avgScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
    },
    journalThemes: journalInsights,
    forumFootprint: uniqueForumTags,
    assessment: {
      severity: (assessment?.severity as HolisticContext['assessment']['severity']) ?? 'none',
      criteria: assessment?.criteria_flagged ?? [],
      assessedAt: assessment?.assessed_at ?? null,
    },
    uiTelemetry: {
      currentPage: clientContext?.currentPage ?? null,
      activeModule: resolveActiveModule(clientContext?.currentPage ?? null),
      idleSeconds: clientContext?.idleSeconds ?? null,
    },
    recentChatTopics: extractTopicsFromMessages(chats),
    lastChatAt,
    daysSinceLastChat,
    isNewUser,
    streak: wellness?.streak ?? 0,
    level: wellness?.level ?? 1,
    xp: wellness?.xp ?? 0,
    freshness,
  }
}

// ─── Data Presence (for debug endpoint) ──────────────────────────

export function getDataPresence(ctx: HolisticContext): ContextDataPresence {
  return {
    moodLogs: {
      present: ctx.moodPulse.lastScore !== null,
      count: ctx.moodPulse.avgScore !== null ? 1 : 0, // simplified
    },
    journals: { present: ctx.journalThemes.length > 0, count: ctx.journalThemes.length },
    forum: { present: ctx.forumFootprint.length > 0, count: ctx.forumFootprint.length },
    assessment: { present: ctx.assessment.severity !== 'none', severity: ctx.assessment.severity },
    wellness: { present: ctx.level > 1 || ctx.xp > 0, level: ctx.level, xp: ctx.xp },
    chatHistory: { present: ctx.recentChatTopics.length > 0, topicCount: ctx.recentChatTopics.length },
    freshness: ctx.freshness,
  }
}

export function getContextQualityScore(ctx: HolisticContext): 'strong' | 'partial' | 'minimal' {
  let score = 0
  if (ctx.moodPulse.lastScore !== null) score++
  if (ctx.journalThemes.length > 0) score++
  if (ctx.forumFootprint.length > 0) score++
  if (ctx.assessment.severity !== 'none') score++
  if (ctx.recentChatTopics.length > 0) score++
  if (ctx.level > 1 || ctx.xp > 0) score++

  if (score >= 4) return 'strong'
  if (score >= 2) return 'partial'
  return 'minimal'
}

// ─── Prompt Serializer ───────────────────────────────────────────

/** Hard cap to prevent token overflow */
const MAX_CONTEXT_CHARS = 2000

export function holisticContextToPrompt(ctx: HolisticContext): string {
  if (ctx.isNewUser) {
    return `This is a brand new user. Be warm, introduce yourself casually. Ask what they'd like to talk about. Keep it to 2-3 sentences.`
  }

  const lines: string[] = ['[SUPERVISOR_CONTEXT]']

  // Identity
  lines.push(`Name: ${ctx.name}`)

  // Re-engagement awareness
  if (ctx.daysSinceLastChat !== null && ctx.daysSinceLastChat >= 3) {
    lines.push(`\nRE-ENGAGEMENT: User hasn't chatted in ${ctx.daysSinceLastChat} days. Welcome them back warmly before diving into topics.`)
  }

  // Mood Pulse
  lines.push(`\nMOOD PULSE:`)
  if (ctx.moodPulse.lastScore !== null) {
    lines.push(`- Last score: ${ctx.moodPulse.lastScore}/5 (${ctx.moodPulse.label})`)
  }
  lines.push(`- Trend: ${ctx.moodPulse.trend}`)
  if (ctx.moodPulse.avgScore !== null) {
    lines.push(`- 7-day average: ${ctx.moodPulse.avgScore}/5`)
  }
  if (ctx.moodPulse.recentNote && !ctx.freshness.moodStale) {
    // Only include mood note if data is fresh
    lines.push(`- Recent mood note: "${ctx.moodPulse.recentNote.slice(0, 100)}"`)
  }

  // Journal Themes (truncate each insight to prevent bloat)
  if (ctx.journalThemes.length > 0 && !ctx.freshness.journalStale) {
    lines.push(`\nJOURNAL THEMES (recent private reflections):`)
    ctx.journalThemes.forEach((theme, i) => {
      lines.push(`- ${i + 1}. ${theme.slice(0, 80)}`)
    })
  }

  // Forum Footprint
  if (ctx.forumFootprint.length > 0) {
    lines.push(`\nFORUM ACTIVITY (topics they engage with publicly):`)
    lines.push(`- Topics: ${ctx.forumFootprint.join(', ')}`)
  }

  // Assessment
  if (ctx.assessment.severity !== 'none' && !ctx.freshness.assessmentStale) {
    lines.push(`\nASSESSMENT:`)
    lines.push(`- Severity: ${ctx.assessment.severity}`)
    if (ctx.assessment.criteria.length > 0) {
      lines.push(`- Signals: ${ctx.assessment.criteria.slice(0, 3).join(', ')}`)
    }
  }

  // Chat Topics
  if (ctx.recentChatTopics.length > 0) {
    lines.push(`\nRECENT CHAT TOPICS: ${ctx.recentChatTopics.join(', ')}`)
  }

  // UI Telemetry
  if (ctx.uiTelemetry.currentPage || ctx.uiTelemetry.activeModule) {
    lines.push(`\nCURRENT SESSION:`)
    if (ctx.uiTelemetry.activeModule) {
      lines.push(`- Currently using: ${ctx.uiTelemetry.activeModule}`)
    }
    if (ctx.uiTelemetry.idleSeconds != null && ctx.uiTelemetry.idleSeconds > 60) {
      lines.push(`- Idle for: ${Math.round(ctx.uiTelemetry.idleSeconds / 60)} minutes`)
    }
  }

  // Wellness
  if (ctx.level > 1 || ctx.xp > 0) {
    lines.push(`\nWELLNESS: Level ${ctx.level} · ${ctx.xp} XP · ${ctx.streak}-day streak`)
  }

  // Stale data warning
  const staleWarnings: string[] = []
  if (ctx.freshness.moodStale && ctx.moodPulse.lastScore !== null) staleWarnings.push('mood (>7d old)')
  if (ctx.freshness.journalStale && ctx.journalThemes.length > 0) staleWarnings.push('journals (>14d old)')
  if (ctx.freshness.assessmentStale && ctx.assessment.severity !== 'none') staleWarnings.push('assessment (>30d old)')
  if (staleWarnings.length > 0) {
    lines.push(`\n⚠ STALE DATA: ${staleWarnings.join(', ')} — avoid referencing as "recent"`)
  }

  lines.push(`[/SUPERVISOR_CONTEXT]`)

  // Hard cap — progressively trim if too long
  let prompt = lines.join('\n')
  if (prompt.length > MAX_CONTEXT_CHARS) {
    // Remove forum footprint first (least critical)
    const forumIdx = lines.findIndex(l => l.includes('FORUM ACTIVITY'))
    if (forumIdx !== -1) {
      const nextSectionIdx = lines.findIndex((l, i) => i > forumIdx && l.startsWith('\n'))
      lines.splice(forumIdx, (nextSectionIdx !== -1 ? nextSectionIdx : forumIdx + 2) - forumIdx)
    }
    prompt = lines.join('\n')
  }

  return prompt
}
