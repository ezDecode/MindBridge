'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, Text, Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { motion } from 'motion/react'

interface ForumPost {
  id: string
  title: string
  content: string
  tags: string[]
  anon_alias: string
  likes: number
  is_flagged: boolean
  created_at: string
  isOwn: boolean
}

interface Comment {
  id: string
  content: string
  anon_alias: string
  created_at: string
  isOwn: boolean
}

export default function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/forum/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data.post)
        setComments(data.comments ?? [])
      } else {
        router.push('/student/forum')
      }
    } catch {
      router.push('/student/forum')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchThread()
  }, [fetchThread])

  const handleComment = async () => {
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/student/forum/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setComments(prev => [...prev, { ...data.comment, isOwn: true }])
        setNewComment('')
        showToast("Reply posted!", "success")
      }
    } catch {
      showToast("Failed to post reply", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <Text variant="small" className="text-text-dim">Loading thread...</Text>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <button
        onClick={() => router.push('/student/forum')}
        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-[1.0625rem] font-medium"
      >
        <Icon icon="tabler:arrow-left" className="text-lg" />
        Back to Forum
      </button>

      {/* Post */}
      <Card padding="lg" className="bg-surface border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon icon="tabler:user-ghost" className="text-base text-text-dim" />
          </div>
          <Text weight="medium" className="text-text-muted">{post.anon_alias}</Text>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <Text variant="small" className="text-text-dim font-medium">{timeAgo(post.created_at)}</Text>
          {post.isOwn && (
            <span className="badge badge-outline border-primary/30 text-primary text-xs">Your post</span>
          )}
        </div>

        <Text as="h1" variant="h4" weight="semibold" className="text-white mb-4">{post.title}</Text>
        <Text color="secondary" className="text-[1.0625rem] leading-relaxed whitespace-pre-wrap">{post.content}</Text>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/5">
            {post.tags.map(tag => (
              <span key={tag} className="badge badge-outline border-white/5 bg-white/5 text-base font-medium px-2 py-0.5 text-text-dim">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5 text-text-dim">
          <span className="flex items-center gap-1.5 text-base font-medium">
            <Icon icon="tabler:heart" className="text-lg" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1.5 text-base font-medium">
            <Icon icon="tabler:message-circle" className="text-lg" />
            {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
          </span>
        </div>
      </Card>

      {/* Comment Input */}
      <Card padding="md" className="bg-surface border-border">
        <div className="flex gap-3">
          <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
            <Icon icon="tabler:user" className="text-sm text-primary" />
          </div>
          <div className="flex-1">
            <textarea
              className="w-full min-h-[80px] bg-background border border-border rounded-md px-3 py-2 text-[1.0625rem] text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none resize-none leading-relaxed"
              placeholder="Write a supportive reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <Button size="sm" onClick={handleComment} disabled={submitting || !newComment.trim()} className="gap-2">
                {submitting ? "Posting..." : "Reply"}
                <Icon icon="tabler:send" className="text-sm" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <Text variant="small" weight="medium" className="text-text-dim uppercase px-1">
            {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
          </Text>
          {comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card padding="md" className="bg-white/2 border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon icon="tabler:user-ghost" className="text-xs text-text-dim" />
                  </div>
                  <Text variant="small" className="text-text-muted font-medium">{comment.anon_alias}</Text>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <Text variant="small" className="text-text-dim font-medium">{timeAgo(comment.created_at)}</Text>
                  {comment.isOwn && (
                    <span className="badge badge-outline border-primary/30 text-primary text-xs">You</span>
                  )}
                </div>
                <Text className="text-[1.0625rem] text-text-muted leading-relaxed">{comment.content}</Text>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
