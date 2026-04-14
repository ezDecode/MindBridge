import { createClient } from '@/lib/supabase/server'
import { nim, DEFAULT_CHAT_PARAMS, parseCompanionResponse } from '@/lib/nvidia-nim'
import { buildMemoryContext, getStudentName } from '@/lib/agents/memory-agent'
import { buildSystemPrompt } from '@/lib/agents/companion-agent'
import { triggerCrisisAlert } from '@/lib/crisis'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Demo fail-safe: warm responses if AI times out
const DEMO_TIMEOUT_MS = 8000 // 8 seconds
const FALLBACK_RESPONSES = [
  "I hear you. Let's take this one step at a time. What feels most pressing right now?",
  "That sounds really challenging. I'm here with you. Would you like to talk more about it?",
  "Thanks for sharing that with me. How are you feeling in this moment?",
  "I appreciate you opening up. Sometimes just naming what we're feeling helps. What comes to mind?",
  "That makes sense. It's okay to feel that way. What would feel supportive right now?",
]

function getRandomFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
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

    // 1. Build memory context (runs in parallel with other prep)
    const [memoryContext, studentName, historyResult] = await Promise.all([
      buildMemoryContext(user.id),
      getStudentName(user.id),
      // Get conversation history for this session
      supabase
        .from('chat_messages')
        .select('role, content')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true })
        .limit(20),
    ])

    const history = historyResult.data ?? []

    // 2. Build the system prompt with memory context
    const systemPrompt = buildSystemPrompt(memoryContext, studentName)

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
          // If we're using fallback, simulate streaming
          if (usesFallback) {
            const fallbackText = getRandomFallbackResponse()
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

          // 9. Send final metadata
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
