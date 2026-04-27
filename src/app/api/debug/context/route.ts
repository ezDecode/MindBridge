import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'
import {
  buildHolisticContext,
  holisticContextToPrompt,
  getDataPresence,
  getContextQualityScore,
} from '@/lib/holistic-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/debug/context
 * 
 * Diagnostic endpoint that returns the full SUPERVISOR_CONTEXT block
 * exactly as the AI sees it. Use this to verify the Omniscient Context
 * Engine is working end-to-end.
 * 
 * Returns:
 *  - raw: The full HolisticContext object
 *  - prompt: The serialized [SUPERVISOR_CONTEXT] prompt string
 *  - dataPresence: Which data sources populated vs empty
 *  - qualityScore: "strong" | "partial" | "minimal"
 *  - tokenEstimate: Rough token count (chars / 4)
 */
export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startMs = Date.now()

    const ctx = await buildHolisticContext(user.id, {
      currentPage: '/student/chat',  // simulate being on chat page
      idleSeconds: 0,
    })

    const prompt = holisticContextToPrompt(ctx)
    const dataPresence = getDataPresence(ctx)
    const qualityScore = getContextQualityScore(ctx)
    const elapsedMs = Date.now() - startMs

    return NextResponse.json({
      userId: user.id,
      role: user.role,
      raw: ctx,
      prompt,
      dataPresence,
      qualityScore,
      tokenEstimate: Math.ceil(prompt.length / 4),
      promptLength: prompt.length,
      buildTimeMs: elapsedMs,
    })
  } catch (error) {
    console.error('[DEBUG/CONTEXT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to build context', details: String(error) },
      { status: 500 }
    )
  }
}
