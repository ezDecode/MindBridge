import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { resolveProfileDisplayName } from '@/lib/profile-name'

// Lazy initialization to prevent build-time errors
let _resend: Resend | null = null

function getResendClient(): Resend {
 if (!_resend) {
 if (!process.env.RESEND_API_KEY) {
 console.warn('RESEND_API_KEY not set, email notifications will be disabled')
 // Return a mock client that does nothing
 return {
 emails: {
 send: async () => ({ data: null, error: null }),
 },
 } as unknown as Resend
 }
 _resend = new Resend(process.env.RESEND_API_KEY)
 }
 return _resend
}

/**
 * Crisis Alert System
 * 
 * When the Companion Agent detects crisis signals, this system:
 * 1. Writes to crisis_logs (triggers Supabase Realtime for counselor dashboard)
 * 2. Sends backup email to counselor
 * 
 * Privacy note: No message content is stored in crisis_logs — only metadata.
 */

export async function triggerCrisisAlert(studentId: string) {
 const supabase = await createServiceClient()

 try {
 // 1. Get student's assigned counselor
 const { data: student } = await supabase
 .from('profiles')
 .select('counselor_id, institution, name')
 .eq('id', studentId)
 .single()

 if (!student?.counselor_id) {
 console.error('No counselor assigned for student:', studentId)
 // Still log the crisis even without a counselor
 await logCrisisWithoutCounselor(supabase, studentId)
 return
 }

 // 2. Write crisis log (no PII, no message content)
 // This INSERT triggers Supabase Realtime — counselor dashboard auto-updates
 const { error: logError } = await supabase.from('crisis_logs').insert({
 student_id: studentId,
 counselor_id: student.counselor_id,
 severity: 'high',
 triggered_at: new Date().toISOString(),
 })

 if (logError) {
 console.error('Failed to create crisis log:', logError)
 }

 // 3. Send backup email to counselor
  const { data: studentAuthResult } = await supabase.auth.admin.getUserById(studentId)
  const resolvedStudentName = resolveProfileDisplayName({
  profileName: student.name,
  email: studentAuthResult.user?.email,
  metadata: (studentAuthResult.user?.user_metadata as Record<string, unknown> | null) ?? null,
  })

  if (resolvedStudentName && resolvedStudentName !== student.name) {
  await supabase.from('profiles').update({ name: resolvedStudentName }).eq('id', studentId)
  }

  await sendCrisisEmail(student.counselor_id, studentId, resolvedStudentName)

 } catch (error) {
 console.error('Crisis alert failed:', error)
 // Don't throw — we don't want to break the chat flow
 }
}

async function logCrisisWithoutCounselor(
 supabase: Awaited<ReturnType<typeof createServiceClient>>,
 studentId: string
) {
 // Get institution's default counselor or log without assignment
 const { data: student } = await supabase
 .from('profiles')
 .select('institution')
 .eq('id', studentId)
 .single()

 // Try to find any counselor at the same institution
 const { data: counselor } = await supabase
 .from('profiles')
 .select('id')
 .eq('role', 'counselor')
 .eq('institution', student?.institution ?? '')
 .limit(1)
 .single()

 if (counselor) {
 await supabase.from('crisis_logs').insert({
 student_id: studentId,
 counselor_id: counselor.id,
 severity: 'high',
 triggered_at: new Date().toISOString(),
 })
 }
}

async function sendCrisisEmail(
 counselorId: string,
 studentId: string,
 studentName: string | null
) {
 const supabase = await createServiceClient()

 // Get counselor's email
 const { data: counselor } = await supabase
 .from('profiles')
  .select('name')
  .eq('id', counselorId)
  .single()

 // Get counselor's auth email
 const { data: counselorAuthResult } = await supabase.auth.admin.getUserById(counselorId)
 const counselorEmail = counselorAuthResult.user?.email
 const counselorName = resolveProfileDisplayName({
 profileName: counselor?.name,
 email: counselorAuthResult.user?.email,
 metadata: (counselorAuthResult.user?.user_metadata as Record<string, unknown> | null) ?? null,
 })

 if (counselorName && counselorName !== counselor?.name) {
 await supabase.from('profiles').update({ name: counselorName }).eq('id', counselorId)
 }

 if (!counselorEmail) {
 console.error('Could not find counselor email')
 return
 }

 try {
 const resend = getResendClient()
 await resend.emails.send({
 from: 'MindBridge Alerts <alerts@mindbridge.app>',
 to: counselorEmail,
 subject: '🚨 Crisis Alert - Student Needs Support',
 html: `
 <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
 <div style="background: #F47D4B; padding: 20px; border-radius: 12px 12px 0 0;">
 <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Crisis Alert</h1>
 </div>
 <div style="background: #fff; padding: 24px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
 <p style="font-size: 16px; color: #333; margin: 0 0 16px;">
  Hi ${counselorName ?? 'Counselor'},
  </p>
 <p style="font-size: 16px; color: #333; margin: 0 0 16px;">
 A student requires immediate attention. Crisis signals were detected during their MindBridge conversation.
 </p>
 <div style="background: #FFF5F5; border-left: 4px solid #E53E3E; padding: 16px; margin: 16px 0; border-radius: 4px;">
 <p style="margin: 0; font-weight: 600; color: #C53030;">
 Student: ${studentName ?? 'Anonymous'}
 </p>
 <p style="margin: 8px 0 0; font-size: 14px; color: #718096;">
 Triggered at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
 </p>
 </div>
 <p style="font-size: 16px; color: #333; margin: 16px 0;">
 Please check your MindBridge dashboard for more details and to acknowledge this alert.
 </p>
 <a href="${process.env.NEXT_PUBLIC_APP_URL}/counselor/dashboard" 
 style="display: inline-block; background: #F47D4B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
 Open Dashboard
 </a>
 <p style="font-size: 14px; color: #718096; margin: 24px 0 0;">
 This is an automated alert from MindBridge. No message content is shared for privacy.
 </p>
 </div>
 </div>
 `,
 })
 } catch (error) {
 console.error('Failed to send crisis email:', error)
 // Don't throw — email is backup, Realtime is primary
 }
}

/**
 * Acknowledge a crisis alert (called from counselor dashboard)
 */
export async function acknowledgeCrisisAlert(alertId: string, counselorId: string) {
 const supabase = await createServiceClient()

 const { error } = await supabase
 .from('crisis_logs')
 .update({ acknowledged: true })
 .eq('id', alertId)
 .eq('counselor_id', counselorId)

 if (error) {
 throw new Error('Failed to acknowledge alert')
 }
}
