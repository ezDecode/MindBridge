import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Anonymous animal aliases for forum posts
const ANIMALS = [
  'Panda', 'Owl', 'Fox', 'Tiger', 'Dolphin', 'Hawk', 'Wolf', 'Deer',
  'Rabbit', 'Koala', 'Penguin', 'Eagle', 'Bear', 'Otter', 'Lynx', 'Falcon',
  'Swan', 'Heron', 'Crane', 'Dove', 'Sparrow', 'Finch'
]
const ADJECTIVES = [
  'Anonymous', 'Silent', 'Hidden', 'Gentle', 'Calm', 'Quiet', 'Brave',
  'Kind', 'Wise', 'Peaceful', 'Wandering', 'Thoughtful'
]

function generateAnonAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adj} ${animal}`
}

// GET /api/student/forum — list forum posts
export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tag = searchParams.get('tag')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createServiceClient()

  let query = supabase
    .from('forum_posts')
    .select('id, title, content, tags, anon_alias, likes, is_flagged, created_at, author_id', { count: 'exact' })
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Failed to fetch forum posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }

  // Fetch comment counts for each post
  const postIds = (data ?? []).map(p => p.id)
  const { data: commentCounts } = await supabase
    .from('forum_comments')
    .select('post_id')
    .in('post_id', postIds)

  const countMap: Record<string, number> = {}
  for (const c of commentCounts ?? []) {
    countMap[c.post_id] = (countMap[c.post_id] ?? 0) + 1
  }

  const posts = (data ?? []).map(post => ({
    ...post,
    replies: countMap[post.id] ?? 0,
    isOwn: post.author_id === user.id,
  }))

  return NextResponse.json({ posts, total: count ?? 0, page, limit })
}

// POST /api/student/forum — create a new forum post
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, content, tags } = body as {
    title?: string
    content?: string
    tags?: string[]
  }

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: post, error } = await supabase
    .from('forum_posts')
    .insert({
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      tags: (tags ?? []).slice(0, 5),
      anon_alias: generateAnonAlias(),
    })
    .select('id, title, content, tags, anon_alias, likes, created_at')
    .single()

  if (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }

  return NextResponse.json({ post })
}
