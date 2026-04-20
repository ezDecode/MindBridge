import { NextResponse } from 'next/server'

import { getQuestionSession } from '@/lib/question-bank'

export async function GET(request: Request) {
 try {
 const { searchParams } = new URL(request.url)
 const count = Number.parseInt(searchParams.get('count') || '8', 10)

 const session = await getQuestionSession(Number.isNaN(count) ? 8 : Math.min(Math.max(count, 5), 10))

 return NextResponse.json({
 sessionId: crypto.randomUUID(),
 ...session,
 })
 } catch (error) {
 console.error('Question session API error:', error)

 return NextResponse.json(
 { error: 'Failed to prepare question session' },
 { status: 500 }
 )
 }
}
