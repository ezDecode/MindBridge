import { NextResponse } from 'next/server'
import { triggerCrisisAlert } from '@/lib/crisis'

export async function POST(request: Request) {
 try {
 const { studentId } = await request.json()
 if (!studentId) {
 return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
 }

 // Call the crisis lib
 await triggerCrisisAlert(studentId)

 return NextResponse.json({ success: true, message: 'Alert triggered' })
 } catch (err: unknown) {
   const error = err as Error;
   console.error('Trigger crisis failed:', error.message)
   return NextResponse.json({ error: error.message }, { status: 500 })
 }
}
