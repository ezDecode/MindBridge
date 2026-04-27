import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/counselor/announcements — fetch past broadcasts
export async function GET() {
  const user = await getAuthUser()
  if (!user || (user.role !== 'counselor' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, content, target, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }

  return NextResponse.json({ announcements: data ?? [] })
}

// POST /api/counselor/announcements — broadcast to cohort
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user || (user.role !== 'counselor' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, target } = body as {
    title?: string
    content?: string
    target?: 'all' | 'student' | 'counselor' | 'admin'
  }

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      title: title.trim(),
      content: content.trim(),
      target: target ?? 'all',
      created_by: user.id,
    })
    .select('id, title, content, target, created_at')
    .single()

  if (error) {
    console.error('Failed to create announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }

  // Create notifications for targeted users
  const targetRole = target === 'all' ? undefined : target
  let profileQuery = supabase.from('profiles').select('id').neq('id', user.id)
  if (targetRole) {
    profileQuery = profileQuery.eq('role', targetRole)
  }
  const { data: targets } = await profileQuery

  if (targets && targets.length > 0) {
    const notifications = targets.map(t => ({
      user_id: t.id,
      message: `📢 ${title.trim()}`,
      type: 'system' as const,
      metadata: { announcement_id: announcement.id },
    }))

    // Batch insert (Supabase handles this efficiently)
    await supabase.from('notifications').insert(notifications)
  }

  return NextResponse.json({ announcement })
}
