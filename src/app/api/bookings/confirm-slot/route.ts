import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'
import { confirmSlotBooking } from '@/lib/agents/action-agent'

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slotId } = body

    if (!slotId) {
      return NextResponse.json({ error: 'Missing slotId' }, { status: 400 })
    }

    const result = await confirmSlotBooking(user.id, slotId)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Confirm slot API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
