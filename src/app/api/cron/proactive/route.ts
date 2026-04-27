import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { firstNameOrFallback, resolveProfileDisplayName } from '@/lib/profile-name'
import { DEMO_USERS } from '@/lib/auth/demo-users'
import { nim, DEFAULT_CHAT_PARAMS } from '@/lib/nvidia-nim'
import { buildHolisticContext, holisticContextToPrompt } from '@/lib/holistic-context'

// We run this as a system process, so we use the Service Role Key to bypass Row Level Security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    // 1. Authenticate the Cron request
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Get all active students
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')

    if (studentsError) throw studentsError

    const demoUsers = Object.values(DEMO_USERS)
    const demoUserById = new Map(demoUsers.map((u) => [u.id, u]))

    let triggeredCount = 0

    // 3. Analyze each student
    for (const student of students || []) {
      let triggerReason = ''

      try {
        const holisticContext = await buildHolisticContext(student.id)

        if (holisticContext.daysSinceLastChat !== null && holisticContext.daysSinceLastChat >= 3) {
          triggerReason = "Haven't checked in for a few days."
        } else if (holisticContext.moodPulse.lastScore !== null && holisticContext.moodPulse.lastScore <= 2) {
          triggerReason = "Recent mood check-in was low."
        } else if (holisticContext.moodPulse.trend === 'Declining') {
          triggerReason = "Emotional trend is declining."
        }

        if (triggerReason) {
          const contextString = holisticContextToPrompt(holisticContext)
          const demoUser = demoUserById.get(student.id)
          const resolvedName = resolveProfileDisplayName({
            profileName: student.name,
            email: demoUser?.email,
          })

          // 4. Use NIM to craft a natural opening message
          const completion = await nim.chat.completions.create({
            ...DEFAULT_CHAT_PARAMS,
            messages: [
              {
                role: 'system',
                content: `You're MindBridge checking in on ${firstNameOrFallback(resolvedName)} proactively.
                
                CONTEXT:
                ${contextString}
                
                TRIGGER REASON: ${triggerReason}
                
                TASK:
                Write a single, natural opening message (1-2 sentences max). 
                Don't mention the app or say "I noticed". Just open conversation naturally.
                Sound like a friend texting, not a bot.
                
                GOOD EXAMPLES:
                - "Hey, rough few days — how's today treating you?"
                - "Haven't heard from you in a bit. What's going on?"
                - "Exams are close — how are you holding up?"
                
                Return just the message text, no JSON, no quotes.`
              }
            ],
            max_tokens: 60,
          })

          const openingMessage = completion.choices[0].message.content?.trim().replace(/^["']|["']$/g, '') || `Hey ${firstNameOrFallback(resolvedName)}, how's your day going?`

          // 5. Ensure a chat session exists
          let sessionId: string | null = null
          const { data: recentSessions } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_id', student.id)
            .order('last_message_at', { ascending: false })
            .limit(1)

          if (recentSessions && recentSessions.length > 0) {
            sessionId = recentSessions[0].id
          } else {
            const { data: newSession } = await supabase
              .from('chat_sessions')
              .insert({ user_id: student.id, title: 'Checking in' })
              .select().single()
            if (newSession) sessionId = newSession.id
          }

          if (sessionId) {
            // 6. Send message from Assistant
            await supabase.from('chat_messages').insert({
              session_id: sessionId,
              user_id: student.id,
              role: 'assistant',
              is_proactive: true,
              content: openingMessage,
            })

            // 7. Log to proactive_outreach_logs
            await supabase.from('proactive_outreach_logs').insert({
              student_id: student.id,
              urgency: 'low',
              reason: triggerReason,
              message_sent: openingMessage,
              session_id: sessionId,
            })

            triggeredCount++
          }
        }
      } catch (err) {
        console.error('Error processing proactive for student', student.id, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Proactive agent ran. Triggered messages for ${triggeredCount} student(s).`
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
