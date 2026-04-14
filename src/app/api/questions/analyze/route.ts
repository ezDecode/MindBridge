import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import {
  analyzeQuestionResponses,
  formatAssessmentNote,
  type QuestionResponseInput,
} from '@/lib/question-bank'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const responses = Array.isArray(body?.responses) ? (body.responses as QuestionResponseInput[]) : []

    if (!responses.length) {
      return NextResponse.json(
        { error: 'At least one answer is required' },
        { status: 400 }
      )
    }

    const summary = await analyzeQuestionResponses(responses)

    const { error: assessmentError } = await supabase.from('assessments').insert({
      user_id: user.id,
      severity: summary.severity,
      criteria_flagged: summary.criteriaFlagged,
    })

    if (assessmentError) {
      console.error('Failed to save guided assessment:', assessmentError)

      return NextResponse.json(
        { error: 'Failed to save the assessment result' },
        { status: 500 }
      )
    }

    const { error: moodLogError } = await supabase.from('mood_logs').insert({
      user_id: user.id,
      score: summary.derivedMoodScore,
      note: formatAssessmentNote(summary),
    })

    if (moodLogError) {
      console.error('Failed to save guided mood log:', moodLogError)
    }

    return NextResponse.json({
      success: true,
      summary,
      moodLogged: !moodLogError,
    })
  } catch (error) {
    console.error('Question analysis API error:', error)

    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
