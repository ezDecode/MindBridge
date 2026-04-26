import { createServiceClient } from '@/lib/supabase/server'
import { nim } from '@/lib/nvidia-nim'

/**
 * Memory Agent
 * 
 * Synthesizes student history into a rich context block for the Companion Agent.
 * This is the "brain" that allows MindBridge to remember and understand the student.
 */

export async function buildMemoryContext(userId: string): Promise<string> {
  const supabase = await createServiceClient()

  try {
    // 1. Collect raw history
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
      return "This is a new student. No previous history available."
    }

    // 2. Ask NIM to summarize all of this into a context block
    const completion = await nim.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{
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
        
        Be specific and empathetic. Speak in the third person about the student.`
      }],
      max_tokens: 250,
      temperature: 0.3, // Keep it factual
    })

    return completion.choices[0].message.content || "History summary unavailable."
  } catch (error) {
    console.error('Memory Agent Error:', error)
    return "History summary unavailable due to a technical error."
  }
}
