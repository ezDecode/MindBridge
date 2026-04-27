import { createServiceClient } from '@/lib/supabase/server'
import { nim, DEFAULT_CHAT_PARAMS, parseCompanionResponse } from '@/lib/nvidia-nim'
import { buildHolisticContext, holisticContextToPrompt } from '@/lib/holistic-context'
import { buildSystemPrompt } from '@/lib/agents/companion-agent'
import { getCoreMemory, maybeCompressMemory } from '@/lib/agents/compression-agent'
import { triggerCrisisAlert } from '@/lib/crisis'
import { executeBooking, type SlotOption } from '@/lib/agents/action-agent'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Increased timeout for better response quality
const DEMO_TIMEOUT_MS = 12000 // 12 seconds
const FALLBACK_MODEL = 'meta/llama-3.1-8b-instruct'
const FALLBACK_MAX_TOKENS = 150
const SUGGESTION_MAX_TOKENS = 100

// Helper: Generate suggestions via fallback model if AI returns empty
async function generateFallbackSuggestions(
  systemPrompt: string,
  userMessage: string,
  assistantMessage: string
): Promise<string[]> {
  try {
    const completion = await nim.chat.completions.create({
      model: FALLBACK_MODEL,
      messages: [
        { role: 'system', content: `${systemPrompt}\n\nReturn ONLY a JSON array of 3 short follow-up suggestions (10 words max each), no other text.` },
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage },
        { role: 'user', content: 'Generate 3 relevant follow-up suggestions based on our conversation.' },
      ],
      max_tokens: SUGGESTION_MAX_TOKENS,
      temperature: 0.3,
      stream: false,
    })
    const content = completion.choices[0]?.message?.content?.trim() || ''
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch (error) {
    console.error('Failed to generate fallback suggestions:', error)
    return []
  }
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

    // 1. Build Unified Holistic Context (parallel: omniscient + core memory)
    const [holisticContext, coreMemory] = await Promise.all([
      buildHolisticContext(user.id, {
        currentPage: sanitizedClientContext.currentPage,
        idleSeconds: sanitizedClientContext.idleSeconds,
      }),
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

    // 3. Assemble holistic context string with SUPERVISOR_CONTEXT block
    const parts: string[] = [holisticContextToPrompt(holisticContext)]
    if (hasSummary) {
      parts.push(`LONG-TERM MEMORY (compressed):\n${coreMemory!.summary_text.trim()}`)
    }

    const contextString = parts.join('\n\n')

    // [CONTEXT LOG] — structured log for deployment audit
    console.log(
      `[CONTEXT] user=${user.id.slice(0, 8)} | mood=${holisticContext.moodPulse.trend}(${holisticContext.moodPulse.avgScore ?? '?'}/5) | journals=${holisticContext.journalThemes.length} | forum=${holisticContext.forumFootprint.length} | assessment=${holisticContext.assessment.severity} | wellness=L${holisticContext.level} | topics=${holisticContext.recentChatTopics.join(',') || 'none'} | tokens≈${Math.ceil(contextString.length / 4)} | days_away=${holisticContext.daysSinceLastChat ?? 'first'}`
    )

    // 4. Build system prompt
    const systemPrompt = buildSystemPrompt(contextString)

    // 5. Create the streaming response from NIM with timeout protection
    let stream: AsyncIterable<unknown>
    let usesFallback = false

    let fallbackText: string | null = null
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
        console.warn('[Demo Fail-safe] NIM timeout, attempting fallback model')
        usesFallback = true
        try {
          // Use smaller, faster model for fallback
          const fallbackCompletion = await nim.chat.completions.create({
            model: FALLBACK_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
              })),
              { role: 'user', content: message },
            ],
            max_tokens: FALLBACK_MAX_TOKENS,
            temperature: 0.3,
            stream: false,
          })
          fallbackText = fallbackCompletion.choices[0]?.message?.content?.trim() || null
        } catch (fallbackError) {
          console.error('[Demo Fail-safe] Fallback model failed:', fallbackError)
        }
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
          // If we're using fallback, simulate streaming with AI-generated response
          if (usesFallback) {
            const text = fallbackText || "I'm here. Take your time — what's on your mind?"
            fullResponse = text

            // Simulate natural typing by sending character by character
            for (const char of text) {
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

            // 8. Enforce crisis logic (manifesto §7): override AI if clear signals
            if (
              holisticContext.moodPulse.trend === 'Declining' &&
              holisticContext.assessment.severity === 'severe' &&
              holisticContext.journalThemes.some(t =>
                /hopeless|suicide|end it all|want to die|kill myself/i.test(t)
              )
            ) {
              if (parsed) parsed.crisis = true
              await triggerCrisisAlert(user.id)
              console.warn(`[Crisis Enforced] User ${user.id.slice(0,8)}: Declining mood + severe assessment + hopeless themes`)
            }

            // 9. Save messages to database
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
          let availableSlots: SlotOption[] | undefined = undefined
          if (parsed?.suggested_action === 'book_counselor') {
            const result = await executeBooking(user.id)
            if (result.success) {
              actionContext = result.message
              availableSlots = result.availableSlots
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

          // 13. Send final metadata with AI-generated suggestions
          let suggestions = parsed?.suggestions?.length
            ? parsed.suggestions.slice(0, 3)
            : await generateFallbackSuggestions(
              systemPrompt,
              message,
              parsed?.message ?? fullResponse
            )
          // Final safety: ensure at least 1 suggestion
          if (!suggestions.length) {
            suggestions = ["What's on your mind now?"]
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                action: parsed?.suggested_action ?? null,
                actionContext: actionContext,
                suggestions,
                crisis: parsed?.crisis ?? false,
                bookingSlots: availableSlots,
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
