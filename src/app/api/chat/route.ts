import { createServiceClient } from '@/lib/supabase/server'
import { nim, DEFAULT_CHAT_PARAMS, parseCompanionResponse } from '@/lib/nvidia-nim'
import { buildQuickContext, contextToPrompt } from '@/lib/simple-context'
import { buildSystemPrompt } from '@/lib/agents/companion-agent'
import { buildFastMemoryContext, snapshotToPrompt } from '@/lib/agents/memory-agent'
import { getCoreMemory, maybeCompressMemory } from '@/lib/agents/compression-agent'
import { triggerCrisisAlert } from '@/lib/crisis'
import { executeBooking } from '@/lib/agents/action-agent'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

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
 const supabase = await createServiceClient()
 
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
 clientContext?: {
  currentPage?: string
  idleSeconds?: number
 }
}

interface SanitizedClientContext {
 currentPage: string | null
 idleSeconds: number | null
}

function sanitizeClientContext(
 raw: ChatRequest['clientContext']
): SanitizedClientContext {
 const result: SanitizedClientContext = { currentPage: null, idleSeconds: null }
 if (!raw || typeof raw !== 'object') return result

 if (typeof raw.currentPage === 'string') {
  // ASCII-only, trimmed, capped at 200 chars. Drop control chars.
  const ascii = raw.currentPage.replace(/[^\x20-\x7E]/g, '').trim()
  if (ascii.length > 0) {
   result.currentPage = ascii.slice(0, 200)
  }
 }

 if (raw.idleSeconds !== undefined && raw.idleSeconds !== null) {
  const n = Number(raw.idleSeconds)
  if (Number.isFinite(n)) {
   result.idleSeconds = Math.max(0, Math.min(86400, n | 0))
  }
 }

 return result
}

function clientContextToPrompt(ctx: SanitizedClientContext): string {
 if (ctx.currentPage === null && ctx.idleSeconds === null) return ''
 const lines = ['CURRENT SESSION:']
 if (ctx.currentPage !== null) lines.push(`- page: ${ctx.currentPage}`)
 if (ctx.idleSeconds !== null) lines.push(`- idle: ${ctx.idleSeconds}s`)
 return lines.join('\n')
}

export async function POST(request: Request) {
 try {
 const user = await getAuthUser()
 
 if (!user) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const supabase = await createServiceClient()
 const body: ChatRequest = await request.json()
 const { message, sessionId } = body

 if (!message || !sessionId) {
 return NextResponse.json(
 { error: 'Message and sessionId are required' },
 { status: 400 }
 )
 }

 const sanitizedClientContext = sanitizeClientContext(body.clientContext)

 // 1. Build Context (parallel: quick + fast snapshot + core memory)
 const [quickContext, snapshot, coreMemory] = await Promise.all([
  buildQuickContext(user.id),
  buildFastMemoryContext(user.id),
  getCoreMemory(user.id),
 ])

 // 2. Fetch chat history. If we have a compressed summary, only pull the
 // last 5 messages of this session. Otherwise fall back to last 20 so the
 // chat keeps working before any compression has run.
 const hasSummary = !!coreMemory?.summary_text?.trim()
 const historyLimit = hasSummary ? 5 : 20

 const historyResult = await supabase
  .from('chat_messages')
  .select('role, content, sent_at')
  .eq('user_id', user.id)
  .eq('session_id', sessionId)
  .order('sent_at', { ascending: false })
  .limit(historyLimit)

 const history = (historyResult.data ?? []).slice().reverse()

 // 3. Assemble context string
 const parts: string[] = [contextToPrompt(quickContext), snapshotToPrompt(snapshot)]
 if (hasSummary) {
  parts.push(`LONG-TERM MEMORY (compressed):\n${coreMemory!.summary_text.trim()}`)
 }
 const clientCtxBlock = clientContextToPrompt(sanitizedClientContext)
 if (clientCtxBlock) parts.push(clientCtxBlock)

 const contextString = parts.join('\n\n')

 // 4. Build system prompt
 const systemPrompt = buildSystemPrompt(contextString)

 // 5. Create the streaming response from NIM with timeout protection
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

 // 6. Create a readable stream to send to the client
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

          // 7. Parse the complete response
          const parsed = parseCompanionResponse(fullResponse)
          
          // 8. Save messages to database
          await saveMessages(
            supabase,
            user.id,
            sessionId,
            message,
            parsed?.message ?? fullResponse,
            parsed?.crisis ?? false
          )

          // 9. Fire-and-forget compression check
          void maybeCompressMemory(user.id).catch(console.error)

          // 10. Handle actions
          let actionContext = parsed?.action_context || null
          if (parsed?.suggested_action === 'book_counselor') {
            const result = await executeBooking(user.id)
            if (result.success) {
              actionContext = result.message
            }
          }

          // 11. Handle crisis
          if (parsed?.crisis) {
            await triggerCrisisAlert(user.id)
          }

          // 12. Update assessment if new signals found
          if (parsed?.assessment_update?.criteria_flagged && parsed.assessment_update.criteria_flagged.length > 0) {
            await updateAssessment(supabase, user.id, parsed.assessment_update)
          }

          // 13. Send final metadata with smart suggestions
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
                actionContext: actionContext,
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
 supabase: Awaited<ReturnType<typeof createServiceClient>>,
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
 supabase: Awaited<ReturnType<typeof createServiceClient>>,
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
