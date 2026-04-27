import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/student/forum/[id] — get a single post with comments
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createServiceClient()

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from('forum_posts')
    .select('id, title, content, tags, anon_alias, likes, is_flagged, created_at, author_id')
    .eq('id', id)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from('forum_comments')
    .select('id, content, anon_alias, created_at, author_id')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    post: { ...post, isOwn: post.author_id === user.id },
    comments: (comments ?? []).map(c => ({
      ...c,
      isOwn: c.author_id === user.id,
    })),
  })
}
