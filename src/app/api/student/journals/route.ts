import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'
import { nim, MEMORY_PARAMS } from '@/lib/nvidia-nim'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/student/journals — fetch user's journal entries
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('journals')
    .select('id, title, content, ai_insight, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Failed to fetch journals:', error)
    return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 })
  }

  return NextResponse.json({ journals: data })
}

// POST /api/student/journals — create a new journal entry
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, content } = body as { title?: string; content?: string }

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // 1. Insert journal entry
  const { data: journal, error: insertError } = await supabase
    .from('journals')
    .insert({
      user_id: user.id,
      title: title?.trim() || '',
      content: content.trim(),
    })
    .select('id, title, content, created_at')
    .single()

  if (insertError) {
    console.error('Failed to create journal:', insertError)
    return NextResponse.json({ error: 'Failed to save journal' }, { status: 500 })
  }

  // 2. Fire-and-forget: generate AI insight in background
  void generateAiInsight(supabase, journal.id, content.trim()).catch(console.error)

  return NextResponse.json({ journal })
}

// Background LLM call to generate a one-sentence ai_insight
async function generateAiInsight(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  journalId: string,
  content: string
) {
  try {
    // Truncate to first 500 chars for efficiency
    const snippet = content.slice(0, 500)

    const response = await nim.chat.completions.create({
      ...MEMORY_PARAMS,
      messages: [
        {
          role: 'system',
          content: `You are a journal analysis engine. Given a journal entry, produce a ONE-SENTENCE summary of the emotional theme. Examples:
- "Expressed severe burnout regarding placements"
- "Feeling grateful for small victories this week"
- "Struggling with loneliness in hostel life"
- "Processing anxiety about upcoming exams"
Return ONLY the one sentence. No quotes, no prefix, no explanation.`,
        },
        { role: 'user', content: snippet },
      ],
    })

    const insight = response.choices[0]?.message?.content?.trim()
    if (insight) {
      await supabase
        .from('journals')
        .update({ ai_insight: insight })
        .eq('id', journalId)
    }
  } catch (error) {
    console.error('AI insight generation failed:', error)
    // Fallback: keyword-based insight
    const fallbackInsight = generateFallbackInsight(content)
    if (fallbackInsight) {
      await supabase
        .from('journals')
        .update({ ai_insight: fallbackInsight })
        .eq('id', journalId)
    }
  }
}

// Lightweight keyword fallback when NIM is unavailable
function generateFallbackInsight(content: string): string {
  const lower = content.toLowerCase()
  const themes: string[] = []

  if (/exam|test|assignment|grade|marks/.test(lower)) themes.push('academic pressure')
  if (/stress|overwhelm|burnout|drain/.test(lower)) themes.push('stress and burnout')
  if (/lonely|alone|isolat|miss home/.test(lower)) themes.push('loneliness')
  if (/sad|heavy|down|hopeless|empty/.test(lower)) themes.push('low mood')
  if (/anxious|nervous|panic|worry/.test(lower)) themes.push('anxiety')
  if (/sleep|tired|exhausted|rest/.test(lower)) themes.push('sleep difficulties')
  if (/grateful|thankful|happy|good/.test(lower)) themes.push('gratitude')
  if (/relationship|breakup|family|friend/.test(lower)) themes.push('relationship concerns')
  if (/placement|interview|job|career/.test(lower)) themes.push('career anxiety')

  if (themes.length === 0) return 'General emotional processing'
  return `Reflecting on ${themes.slice(0, 2).join(' and ')}`
}
