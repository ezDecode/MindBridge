import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'
import { createServiceClient } from '@/lib/supabase/server'
import {
  buildHolisticContext,
  holisticContextToPrompt,
} from '@/lib/holistic-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/debug/context
 * 
 * Diagnostic endpoint restricted to admin users and enabled via ENABLE_DEBUG_ENDPOINT env var.
 * Returns the full SUPERVISOR_CONTEXT block exactly as the AI sees it.
 */
export async function GET() {
  // 1. Check env var guard (default disabled)
  if (process.env.ENABLE_DEBUG_ENDPOINT !== 'true') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    )
  }

  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check admin role
  const supabase = await createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    )
  }

  try {
    const startMs = Date.now()

    const ctx = await buildHolisticContext(user.id, {
      currentPage: '/student/chat',  // simulate being on chat page
      idleSeconds: 0,
    })

    const prompt = holisticContextToPrompt(ctx)
    const elapsedMs = Date.now() - startMs

    return NextResponse.json({
      userId: user.id,
      role: user.role,
      raw: ctx,
      prompt,
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
