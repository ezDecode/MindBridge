import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ error: 'Direct messaging is disabled. Use broadcasts instead.' }, { status: 403 })
}

export async function POST() {
  return NextResponse.json({ error: 'Direct messaging is disabled. Use broadcasts instead.' }, { status: 403 })
}
