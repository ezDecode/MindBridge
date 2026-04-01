import { createClient } from '@/lib/supabase/server'
import { nim, DEFAULT_CHAT_PARAMS, parseCompanionResponse } from '@/lib/nvidia-nim'
import { buildMemoryContext, getStudentName } from '@/lib/agents/memory-agent'
import { buildSystemPrompt } from '@/lib/agents/companion-agent'
import { triggerCrisisAlert } from '@/lib/crisis'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // 3. Create the streaming response from NIM
    const stream = await nim.chat.completions.create({
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

    // 4. Create a readable stream to send to the client
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = ''

        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            fullResponse += text
            
            // Send each chunk as SSE
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            )
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
          if (parsed?.assessment_update?.criteria_flagged?.length > 0) {
            await updateAssessment(supabase, user.id, parsed.assessment_update)
          }

          // 9. Send final metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                action: parsed?.suggested_action ?? null,
                actionContext: parsed?.action_context ?? null,
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

  await supabase.from('assessments').insert({
    user_id: userId,
    criteria_flagged: mergedCriteria,
    severity: update.severity,
  })
}
