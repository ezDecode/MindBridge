import { createClient } from '@/lib/supabase/server'
import { nim, DEFAULT_CHAT_PARAMS, parseCompanionResponse } from '@/lib/nvidia-nim'
import { buildQuickContext, contextToPrompt } from '@/lib/simple-context'
import { buildSystemPrompt } from '@/lib/agents/companion-agent'
import { triggerCrisisAlert } from '@/lib/crisis'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Increased timeout for better response quality
const DEMO_TIMEOUT_MS = 12000 // 12 seconds

// Contextual fallbacks based on mood
const FALLBACK_RESPONSES_BY_MOOD: Record<string, string[]> = {
 low: [
 "I'm here with you. Take your time — what's on your mind?",
 "That sounds really heavy. Want to just talk it through?",
 "I'm listening. Whatever's going on, you've got space here.",
 ],
 medium: [
 "Thanks for sharing that. How are you feeling about all this?",
 "I hear you. What's the hardest part right now?",
 "That makes sense. Want to unpack it a bit more?",
 ],
 good: [
 "That's great to hear! What's been helping lately?",
 "Nice! So what's been making things better?",
 "I love that for you. What's contributing to this?",
 ],
 unknown: [
 "I'm here. Take your time — what's going on?",
 "Hey, thanks for reaching out. What's on your mind?",
 "What's feeling most pressing right now?",
 ],
}

// Generic fallbacks for when we don't know their mood
const GENERIC_FALLBACKS = [
 "I'm here with you. Take your time — what's on your mind?",
 "That sounds really challenging. Want to talk more about it?",
 "Thanks for sharing that. How are you feeling right now?",
 "I appreciate you opening up. What's the heaviest part?",
]

interface MoodContext {
 trend: string
 lastScore: number | null
}

async function getMoodContext(userId: string): Promise<MoodContext> {
 const supabase = await createClient()
 
 const { data } = await supabase
 .from('mood_logs')
 .select('score')
 .eq('user_id', userId)
 .order('logged_at', { ascending: false })
 .limit(7)
 .single()

 if (!data) return { trend: 'unknown', lastScore: null }

 const avgScore = data.score
 let trend = 'unknown'
 if (avgScore >= 4) trend = 'good'
 else if (avgScore >= 3) trend = 'medium'
 else trend = 'low'

 return { trend, lastScore: data.score }
}

function getContextualFallback(moodContext: MoodContext, userMessage: string): string {
 const lower = userMessage.toLowerCase()
 
 // Topic-specific fallbacks
 if (/sleep|tired|exhausted|rest/.test(lower)) {
 return moodContext.trend === 'low' 
 ? "Sleep issues when you're already drained is the worst. Have you been able to rest at all?"
 : "Exhaustion hits different. Want to talk about what's draining you?"
 }
 
 if (/sad|heavy|down|hopeless|alone|lonely/.test(lower)) {
 return "That sounds really lonely. I'm here — want to talk about what's making it heavy?"
 }
 
 if (/anxi|panic|overwhelm|stress|nervous/.test(lower)) {
 return "That overwhelm is real. Before everything spirals — what's the biggest thing right now?"
 }
 
 if (/exam|test|assignment|college|university|placement/.test(lower)) {
 return "Academic pressure hits hard. What's worrying you most — the marks or something else?"
 }

 // Mood-based selection
 const moodResponses = FALLBACK_RESPONSES_BY_MOOD[moodContext.trend] || GENERIC_FALLBACKS
 return moodResponses[Math.floor(Math.random() * moodResponses.length)]
}

function buildSuggestions({
 message,
 action,
 crisis,
}: {
 message: string
 action: 'book_counselor' | 'show_resources' | 'send_crisis_alert' | null
 crisis: boolean
}) {
 if (crisis) {
 return [
 'Stay with me for a minute',
 'Help me contact support',
 'What should I do right now?',
 ]
 }

 if (action === 'book_counselor') {
 return [
 'Book a session',
 'What should I say in counseling?',
 'Can we talk a little more first?',
 ]
 }

 if (action === 'show_resources') {
 return [
 'Show me resources',
 'Give me a grounding exercise',
 'What can help tonight?',
 ]
 }

 const lower = message.toLowerCase()

 if (/sleep|rest|tired|exhausted/.test(lower)) {
 return [
 'How can I sleep better tonight?',
 'Give me a short wind-down plan',
 'What if my mind will not slow down?',
 ]
 }

 if (/anx|panic|overwhelm|stress|nervous/.test(lower)) {
 return [
 'Help me calm down right now',
 'Give me a 2-minute grounding exercise',
 'What should I do next today?',
 ]
 }

 if (/sad|heavy|down|hopeless|alone|lonely/.test(lower)) {
 return [
 'Can we unpack that a bit more?',
 'What is one gentle next step?',
 'Help me name what I am feeling',
 ]
 }

 return []
}

interface ChatRequest {
 message: string
 sessionId: string
}

export async function POST(request: Request) {
 try {
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const { message, sessionId }: ChatRequest = await request.json()

 if (!message || !sessionId) {
 return NextResponse.json(
 { error: 'Message and sessionId are required' },
 { status: 400 }
 )
 }

 // 1. Build quick context (simple, no LLM call)
 const [quickContext, historyResult] = await Promise.all([
 buildQuickContext(user.id),
 supabase
 .from('chat_messages')
 .select('role, content')
 .eq('user_id', user.id)
 .eq('session_id', sessionId)
 .order('sent_at', { ascending: true })
 .limit(20),
 ])

 const history = historyResult.data ?? []
 const contextString = contextToPrompt(quickContext)

 // 2. Build system prompt with simple context
 const systemPrompt = buildSystemPrompt(contextString)

 // 3. Create the streaming response from NIM with timeout protection
 let stream: AsyncIterable<unknown>
 let usesFallback = false
 
 try {
 // Race between NIM call and timeout
 const nimPromise = nim.chat.completions.create({
 ...DEFAULT_CHAT_PARAMS,
 messages: [
 { role: 'system', content: systemPrompt },
 ...history.map(msg => ({
 role: msg.role as 'user' | 'assistant',
 content: msg.content,
 })),
 { role: 'user', content: message },
 ],
 stream: true,
 })
 
 const timeoutPromise = new Promise<never>((_, reject) => {
 setTimeout(() => reject(new Error('DEMO_TIMEOUT')), DEMO_TIMEOUT_MS)
 })
 
 stream = await Promise.race([nimPromise, timeoutPromise])
 } catch (error) {
 if (error instanceof Error && error.message === 'DEMO_TIMEOUT') {
 console.warn('[Demo Fail-safe] NIM timeout, using fallback response')
 usesFallback = true
 } else {
 throw error // Re-throw non-timeout errors
 }
 }

 // 4. Create a readable stream to send to the client
 const encoder = new TextEncoder()
 const readable = new ReadableStream({
 async start(controller) {
 let fullResponse = ''

 try {
 // If we're using fallback, simulate streaming with contextual response
 if (usesFallback) {
 const moodCtx = await getMoodContext(user.id)
 const fallbackText = getContextualFallback(moodCtx, message)
 fullResponse = fallbackText
 
 // Simulate natural typing by sending character by character
 for (const char of fallbackText) {
 controller.enqueue(
 encoder.encode(`data: ${JSON.stringify({ text: char })}\n\n`)
 )
 // Small delay between characters for natural feel
 await new Promise(resolve => setTimeout(resolve, 25))
 }
 } else {
 // Normal NIM streaming
 for await (const chunk of stream!) {
 const text = (chunk as { choices: Array<{ delta?: { content?: string } }> }).choices[0]?.delta?.content ?? ''
 fullResponse += text
 
 // Send each chunk as SSE
 controller.enqueue(
 encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
 )
 }
 }

 // 5. Parse the complete response
 const parsed = parseCompanionResponse(fullResponse)
 
 // 6. Save messages to database
 await saveMessages(
 supabase,
 user.id,
 sessionId,
 message,
 parsed?.message ?? fullResponse,
 parsed?.crisis ?? false
 )

 // 7. Handle crisis
 if (parsed?.crisis) {
 await triggerCrisisAlert(user.id)
 }

 // 8. Update assessment if new signals found
 if (parsed?.assessment_update?.criteria_flagged && parsed.assessment_update.criteria_flagged.length > 0) {
 await updateAssessment(supabase, user.id, parsed.assessment_update)
 }

 // 9. Send final metadata with smart suggestions
 // 9. Send final metadata with simple suggestions (no extra LLM call)
 const suggestions = parsed?.suggestions?.length
 ? parsed.suggestions.slice(0, 3)
 : buildSuggestions({
 message: parsed?.message ?? fullResponse,
 action: parsed?.suggested_action ?? null,
 crisis: parsed?.crisis ?? false,
 })

 controller.enqueue(
 encoder.encode(
 `data: ${JSON.stringify({
 done: true,
 action: parsed?.suggested_action ?? null,
 actionContext: parsed?.action_context ?? null,
 suggestions,
 crisis: parsed?.crisis ?? false,
 })}\n\n`
 )
 )
 } catch (error) {
 console.error('Stream processing error:', error)
 controller.enqueue(
 encoder.encode(
 `data: ${JSON.stringify({ error: 'Stream processing failed' })}\n\n`
 )
 )
 }

 controller.close()
 },
 })

 return new Response(readable, {
 headers: {
 'Content-Type': 'text/event-stream',
 'Cache-Control': 'no-cache, no-transform',
 'Connection': 'keep-alive',
 },
 })
 } catch (error) {
 console.error('Chat API error:', error)
 return NextResponse.json(
 { error: 'Failed to process chat request' },
 { status: 500 }
 )
 }
}

async function saveMessages(
 supabase: Awaited<ReturnType<typeof createClient>>,
 userId: string,
 sessionId: string,
 userMessage: string,
 assistantMessage: string,
 crisisFlag: boolean
) {
 const now = new Date().toISOString()
 
 await supabase.from('chat_messages').insert([
 {
 user_id: userId,
 session_id: sessionId,
 role: 'user',
 content: userMessage,
 sent_at: now,
 },
 {
 user_id: userId,
 session_id: sessionId,
 role: 'assistant',
 content: assistantMessage,
 crisis_flag: crisisFlag,
 sent_at: new Date(Date.now() + 1).toISOString(), // Ensure ordering
 },
 ])

 // Update session's last_message_at
 await supabase
 .from('chat_sessions')
 .upsert({
 id: sessionId,
 user_id: userId,
 last_message_at: now,
 })
}

async function updateAssessment(
 supabase: Awaited<ReturnType<typeof createClient>>,
 userId: string,
 update: { criteria_flagged: string[]; severity: string }
) {
 // Get existing assessment or create new
 const { data: existing } = await supabase
 .from('assessments')
 .select('criteria_flagged')
 .eq('user_id', userId)
 .order('assessed_at', { ascending: false })
 .limit(1)
 .single()

 // Merge criteria (don't lose previously flagged ones)
 const existingCriteria = existing?.criteria_flagged ?? []
 const mergedCriteria = [...new Set([...existingCriteria, ...update.criteria_flagged])]

 // Validate severity matches enum
 const validSeverity = ['none', 'mild', 'moderate', 'severe'].includes(update.severity)
 ? update.severity as 'none' | 'mild' | 'moderate' | 'severe'
 : 'mild'

 await supabase.from('assessments').insert({
 user_id: userId,
 criteria_flagged: mergedCriteria,
 severity: validSeverity,
 })
}
