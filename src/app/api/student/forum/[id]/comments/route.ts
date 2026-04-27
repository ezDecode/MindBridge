import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ANIMALS = [
  'Panda', 'Owl', 'Fox', 'Tiger', 'Dolphin', 'Hawk', 'Wolf', 'Deer',
  'Rabbit', 'Koala', 'Penguin', 'Eagle', 'Bear', 'Otter', 'Lynx', 'Falcon',
]
const ADJECTIVES = [
  'Anonymous', 'Silent', 'Hidden', 'Gentle', 'Calm', 'Quiet', 'Brave',
  'Kind', 'Wise', 'Peaceful', 'Wandering', 'Thoughtful',
]

function generateAnonAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adj} ${animal}`
}

// POST /api/student/forum/[id]/comments — add a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: postId } = await params
  const body = await request.json()
  const { content } = body as { content?: string }

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Verify post exists
  const { data: post } = await supabase
    .from('forum_posts')
    .select('id, author_id')
    .eq('id', postId)
    .single()

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const { data: comment, error } = await supabase
    .from('forum_comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
      anon_alias: generateAnonAlias(),
    })
    .select('id, content, anon_alias, created_at')
    .single()

  if (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }

  // Send notification to post author (if not commenting on own post)
  if (post.author_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: post.author_id,
      message: `Someone replied to your post`,
      type: 'forum_reply',
      metadata: { post_id: postId },
    })
  }

  return NextResponse.json({ comment })
}
