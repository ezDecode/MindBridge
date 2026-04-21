/**
 * Crisis Simulation Route
 * 
 * Demo endpoint for testing the crisis escalation flow.
 * Simulates a crisis alert without requiring actual chat interaction.
 * 
 * POST /api/crisis/simulate
 * - Triggers crisis alert for authenticated user
 * - For demo purposes only — restricted to development
 */

import { createClient } from '@/lib/supabase/server'
import { triggerCrisisAlert } from '@/lib/crisis'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
 // Only allow in development
 if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_CRISIS_SIMULATION) {
 return NextResponse.json(
 { error: 'Crisis simulation is disabled in production' },
 { status: 403 }
 )
 }

 try {
 const supabase = await createClient()
 
 // Get authenticated user
 const { data: { user }, error: authError } = await supabase.auth.getUser()
 
 if (authError || !user) {
 return NextResponse.json(
 { error: 'Unauthorized — must be logged in to simulate crisis' },
 { status: 401 }
 )
 }

 // Get optional context from request body
 const body = await request.json().catch(() => ({}))
 const context = body.context || 'Demo crisis simulation triggered'

 // Log simulation attempt
 console.log(`[Crisis Simulation] Triggered by user ${user.id}`)
 console.log(`[Crisis Simulation] Context: ${context}`)

 // Trigger the actual crisis flow
 await triggerCrisisAlert(user.id)

 // Also create a demo chat message showing what would happen
 const sessionId = crypto.randomUUID()
 await supabase
 .from('chat_messages')
 .insert([
 {
 user_id: user.id,
 session_id: sessionId,
 role: 'user',
 content: '[SIMULATION] Crisis scenario triggered for demo',
 sent_at: new Date().toISOString(),
 },
 {
 user_id: user.id,
 session_id: sessionId,
 role: 'assistant',
 content: "I hear you, and I'm really glad you're reaching out. You don't have to carry this alone. If things feel overwhelming right now, please talk to someone who can help — iCall is available 24/7 at 9152987821. I've also notified a counselor who will reach out to you soon.",
 crisis_flag: true,
 sent_at: new Date(Date.now() + 1).toISOString(),
 },
 ])

 return NextResponse.json({
 success: true,
 message: 'Crisis simulation completed',
 details: {
 userId: user.id,
 alertSent: true,
 counselorNotified: true,
 emailSent: process.env.RESEND_API_KEY ? true : false,
 sessionId,
 },
 })
 } catch (error) {
 console.error('Crisis simulation error:', error)
 return NextResponse.json(
 { error: 'Failed to simulate crisis', details: String(error) },
 { status: 500 }
 )
 }
}

// GET endpoint to check simulation status
export async function GET() {
 const isDev = process.env.NODE_ENV !== 'production'
 const isAllowed = isDev || process.env.ALLOW_CRISIS_SIMULATION === 'true'
 
 return NextResponse.json({
 endpoint: '/api/crisis/simulate',
 method: 'POST',
 enabled: isAllowed,
 environment: process.env.NODE_ENV,
 description: 'Simulates a crisis alert for testing the escalation flow',
 usage: {
 authentication: 'Required — user must be logged in',
 body: {
 context: '(optional) String describing the simulation scenario',
 },
 },
 whatItDoes: [
 '1. Creates a crisis_log entry in the database',
 '2. Sends email notification to assigned counselor (if RESEND_API_KEY set)',
 '3. Creates demo chat messages showing the crisis response',
 '4. Triggers Supabase Realtime event for counselor dashboard',
 ],
 })
}
