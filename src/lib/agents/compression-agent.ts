import { createServiceClient } from '@/lib/supabase/server'
import { nim } from '@/lib/nvidia-nim'

/**
 * Compression Agent (Phase 3)
 *
 * Periodically compresses a user's chat history into a single rolling
 * `summary_text` stored on `user_core_memories`. The chat route reads this
 * summary instead of streaming back the entire transcript on every turn.
 *
 * Failures are caught and logged — the chat path must keep working even if
 * compression fails.
 */

export const COMPRESSION_THRESHOLD = 30 // compress when uncompressed messages >= 30
export const COMPRESSION_BATCH = 25 // include this many newest uncompressed messages

export interface CoreMemory {
  summary_text: string
  last_compressed_message_at: string | null
}

export async function getCoreMemory(
  userId: string
): Promise<CoreMemory | null> {
  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('user_core_memories')
      .select('summary_text, last_compressed_message_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('getCoreMemory error:', error)
      return null
    }
    return data ?? null
  } catch (error) {
    console.error('getCoreMemory exception:', error)
    return null
  }
}

export async function maybeCompressMemory(
  userId: string
): Promise<{ compressed: boolean; reason: string }> {
  try {
    const supabase = await createServiceClient()

    const { data: existing } = await supabase
      .from('user_core_memories')
      .select('last_compressed_message_at')
      .eq('user_id', userId)
      .maybeSingle()

    const cutoff = existing?.last_compressed_message_at ?? null

    let countQuery = supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (cutoff) {
      countQuery = countQuery.gt('sent_at', cutoff)
    }

    const { count, error: countErr } = await countQuery
    if (countErr) {
      console.error('maybeCompressMemory count error:', countErr)
      return { compressed: false, reason: 'count_failed' }
    }

    const uncompressed = count ?? 0
    if (uncompressed < COMPRESSION_THRESHOLD) {
      return {
        compressed: false,
        reason: `below_threshold (${uncompressed}/${COMPRESSION_THRESHOLD})`,
      }
    }

    const result = await compressMemory(userId)
    return {
      compressed: true,
      reason: `compressed ${result.addedMessages} new messages`,
    }
  } catch (error) {
    console.error('maybeCompressMemory exception:', error)
    return { compressed: false, reason: 'exception' }
  }
}

export async function compressMemory(
  userId: string
): Promise<{ summary: string; addedMessages: number }> {
  try {
    const supabase = await createServiceClient()

    const { data: existing } = await supabase
      .from('user_core_memories')
      .select('summary_text, message_count, last_compressed_message_at')
      .eq('user_id', userId)
      .maybeSingle()

    const previousSummary = existing?.summary_text ?? ''
    const previousCount = existing?.message_count ?? 0
    const cutoff = existing?.last_compressed_message_at ?? null

    let msgQuery = supabase
      .from('chat_messages')
      .select('role, content, sent_at')
      .eq('user_id', userId)

    if (cutoff) {
      msgQuery = msgQuery.gt('sent_at', cutoff)
    }

    const { data: newestRows, error: msgErr } = await msgQuery
      .order('sent_at', { ascending: false })
      .limit(COMPRESSION_BATCH)

    if (msgErr) {
      console.error('compressMemory message fetch error:', msgErr)
      return { summary: previousSummary, addedMessages: 0 }
    }

    const newMessages = (newestRows ?? []).slice().reverse()
    if (newMessages.length === 0) {
      return { summary: previousSummary, addedMessages: 0 }
    }

    const transcript = newMessages
      .map((m) => `${m.role === 'user' ? 'STUDENT' : 'COMPANION'}: ${m.content}`)
      .join('\n')

    const completion = await nim.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      temperature: 0.2,
      max_tokens: 350,
      messages: [
        {
          role: 'system',
          content: `You maintain a rolling third-person profile of a mental-health companion app's user.
Merge the PRIOR PROFILE with the NEW CONVERSATION SNIPPETS into a single concise profile (~200 words, third person).
Preserve durable facts: recurring themes, ongoing concerns, coping styles, relationships, support network, communication preferences, important goals, and any safety signals.
Drop transient small-talk. Do NOT invent details. If something is unclear, omit it.
Output ONLY the new profile text, no preamble.`,
        },
        {
          role: 'user',
          content: `PRIOR PROFILE:\n${previousSummary || '(none yet)'}\n\nNEW CONVERSATION SNIPPETS:\n${transcript}`,
        },
      ],
    })

    const newSummary =
      completion.choices[0]?.message?.content?.trim() || previousSummary

    const lastSentAt = newMessages[newMessages.length - 1].sent_at

    const { error: upsertErr } = await supabase
      .from('user_core_memories')
      .upsert(
        {
          user_id: userId,
          summary_text: newSummary,
          message_count: previousCount + newMessages.length,
          last_compressed_at: new Date().toISOString(),
          last_compressed_message_at: lastSentAt,
        },
        { onConflict: 'user_id' }
      )

    if (upsertErr) {
      console.error('compressMemory upsert error:', upsertErr)
    }

    return { summary: newSummary, addedMessages: newMessages.length }
  } catch (error) {
    console.error('compressMemory exception:', error)
    return { summary: '', addedMessages: 0 }
  }
}
