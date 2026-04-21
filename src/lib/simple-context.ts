import { createClient } from '@/lib/supabase/server'
import { resolveProfileDisplayName } from '@/lib/profile-name'

/**
 * Simple Context Builder
 * 
 * Provides personalized context using DIRECT database queries.
 * NO LLM calls - just fast, structured data access.
 * 
 * This replaces the Memory Agent complexity.
 */

export interface QuickContext {
 name: string
 mood: {
 score: number
 label: string
 note: string | null
 trend: 'up' | 'down' | 'stable' | 'unknown'
 loggedAt: string | null
 }
 assessment: {
 severity: 'none' | 'mild' | 'moderate' | 'severe'
 criteria: string[]
 assessedAt: string | null
 }
 recentTopics: string[]
 lastChatAt: string | null
 isNewUser: boolean
}

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

function calculateTrend(scores: { score: number }[]): 'up' | 'down' | 'stable' | 'unknown' {
 if (scores.length < 2) return 'unknown'
 
 const recent = scores.slice(0, 3).reduce((s, m) => s + m.score, 0) / Math.min(scores.length, 3)
 const older = scores.slice(3, 7).reduce((s, m) => s + m.score, 0) / Math.min(scores.length - 3, 4)
 
 if (scores.length < 4) return 'unknown'
 
 const diff = recent - older
 if (diff > 0.5) return 'up'
 if (diff < -0.5) return 'down'
 return 'stable'
}

const TOPIC_KEYWORDS: Record<string, string> = {
 sleep: 'sleep',
 tired: 'sleep',
 exam: 'academics',
 test: 'academics',
 assignment: 'academics',
 placement: 'academics',
 college: 'academics',
 anxious: 'anxiety',
 nervous: 'anxiety',
 panic: 'anxiety',
 stress: 'stress',
 overload: 'stress',
 sad: 'mood',
 heavy: 'mood',
 down: 'mood',
 hopeless: 'mood',
 lonely: 'loneliness',
 alone: 'loneliness',
 family: 'family',
 parents: 'family',
 friend: 'friends',
 breakup: 'relationships',
 relationship: 'relationships',
 'not worth': 'self-worth',
 worthless: 'self-worth',
 useless: 'self-worth',
}

function extractTopics(messages: { content: string }[]): string[] {
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

export async function buildQuickContext(userId: string): Promise<QuickContext> {
 const supabase = await createClient()

 const [profileResult, moodResult, assessmentResult, chatResult] = await Promise.all([
 supabase.from('profiles').select('name').eq('id', userId).single(),
 supabase.from('mood_logs').select('score, note, logged_at').eq('user_id', userId).order('logged_at', { ascending: false }).limit(7),
 supabase.from('assessments').select('severity, criteria_flagged, assessed_at').eq('user_id', userId).order('assessed_at', { ascending: false }).limit(1).single(),
 supabase.from('chat_messages').select('content, sent_at').eq('user_id', userId).order('sent_at', { ascending: false }).limit(5),
 ])

 const moods = moodResult.data ?? []
 const assessment = assessmentResult.data
 const chats = chatResult.data ?? []

 const isNewUser = moods.length === 0 && chats.length === 0

 const lastMood = moods[0]
 const lastAssessment = assessment
 const displayName = resolveProfileDisplayName({ profileName: profileResult.data?.name ?? null })

 return {
  name: displayName ?? 'there',
 mood: {
 score: lastMood?.score ?? 3,
 label: getScoreLabel(lastMood?.score ?? 3),
 note: lastMood?.note ?? null,
 trend: calculateTrend(moods),
 loggedAt: lastMood?.logged_at ?? null,
 },
 assessment: {
 severity: (lastAssessment?.severity as 'none' | 'mild' | 'moderate' | 'severe') ?? 'none',
 criteria: lastAssessment?.criteria_flagged ?? [],
 assessedAt: lastAssessment?.assessed_at ?? null,
 },
 recentTopics: extractTopics(chats),
 lastChatAt: chats[0]?.sent_at ?? null,
 isNewUser,
 }
}

export function contextToPrompt(ctx: QuickContext): string {
 if (ctx.isNewUser) {
 return `This is a new conversation. Be warm and friendly. Introduce yourself casually like you'd text a new friend. Keep it short (2-3 sentences). Ask what they'd like to talk about.`
 }

 let context = `ABOUT THEM:\n`
 context += `- Name: ${ctx.name}\n`
 context += `- Last mood: ${ctx.mood.score}/5 (${ctx.mood.label})${ctx.mood.note ? ` - "${ctx.mood.note}"` : ''}\n`
 context += `- Mood trend: ${ctx.mood.trend}\n`
 
 if (ctx.assessment.severity !== 'none') {
 context += `- Assessment: ${ctx.assessment.severity} (${ctx.assessment.criteria.slice(0, 3).join(', ')})\n`
 }
 
 if (ctx.recentTopics.length > 0) {
 context += `- Recent topics: ${ctx.recentTopics.join(', ')}\n`
 }

 return context
}
