'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, Text, Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface ForumPost {
  id: string
  title: string
  content: string
  tags: string[]
  anon_alias: string
  likes: number
  replies: number
  is_flagged: boolean
  created_at: string
  isOwn: boolean
}

const POPULAR_TAGS = ['Exams', 'Anxiety', 'Loneliness', 'Placements', 'Hostel', 'Sleep', 'Relationships', 'Burnout', 'Self-care']

export default function ForumPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'mine'>('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('tag', searchQuery)
      const res = await fetch(`/api/student/forum?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts ?? [])
      }
    } catch {
      console.error('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      showToast("Title and content are required", "info")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/student/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: selectedTags,
        }),
      })

      if (res.ok) {
        showToast("Post created!", "success")
        setNewTitle('')
        setNewContent('')
        setSelectedTags([])
        setShowNewPost(false)
        fetchPosts()
      } else {
        throw new Error()
      }
    } catch {
      showToast("Failed to create post", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 5 ? [...prev, tag] : prev
    )
  }

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'mine') return post.isOwn
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false
    }
    return true
  })

  const sortedPosts = activeTab === 'trending'
    ? [...filteredPosts].sort((a, b) => b.likes + b.replies - (a.likes + a.replies))
    : filteredPosts

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="tracking-tight text-white mb-1">Peer Forum</Text>
          <Text variant="small" className="text-text-dim font-medium">Safe, anonymous community support</Text>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-lg" />
            <input 
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[1.0625rem] focus:border-white/20 transition-all text-white placeholder:text-text-dim outline-none"
            />
          </div>
          <Button size="md" className="gap-2 shrink-0" onClick={() => setShowNewPost(true)}>
            <Icon icon="tabler:pencil-plus" className="text-lg" />
            <span className="hidden sm:inline">New Post</span>
          </Button>
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card padding="lg" className="bg-surface border-primary/30 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <Text as="h3" variant="body" weight="semibold" className="text-white">Create a Post</Text>
                <button onClick={() => setShowNewPost(false)} className="text-text-dim hover:text-white transition-colors">
                  <Icon icon="tabler:x" className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="What's on your mind? (title)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-background/50 border-white/5 focus:border-white/10"
                />
                <textarea
                  className="w-full min-h-[120px] bg-background border border-border rounded-md px-4 py-3 typo-subtitle text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none resize-none leading-relaxed"
                  placeholder="Share your thoughts... This will be posted anonymously."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <div>
                  <Text variant="small" weight="medium" className="text-text-dim mb-2 block">Tags (up to 5):</Text>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-base font-medium border transition-all",
                          selectedTags.includes(tag)
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-white/5 bg-white/2 text-text-muted hover:text-white hover:border-white/20"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="ghost" size="md" onClick={() => setShowNewPost(false)}>Cancel</Button>
                  <Button size="md" onClick={handleCreatePost} disabled={submitting} className="gap-2">
                    {submitting ? "Posting..." : "Post Anonymously"}
                    <Icon icon="tabler:send" className="text-lg" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 border-b border-border pb-px">
        {([
          { id: 'trending', label: 'Trending', icon: 'tabler:flame' },
          { id: 'recent', label: 'Recent', icon: 'tabler:clock' },
          { id: 'mine', label: 'My Posts', icon: 'tabler:user' }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[1.0625rem] font-medium transition-all relative",
              activeTab === tab.id ? "text-white" : "text-text-muted hover:text-white"
            )}
          >
            <Icon icon={tab.icon} className={cn("text-lg", activeTab === tab.id ? "text-primary" : "opacity-70")} />
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <Text variant="small" className="text-text-dim">Loading discussions...</Text>
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="py-20 text-center text-text-dim border border-dashed border-border rounded-lg bg-white/1">
              <Icon icon="tabler:messages-off" className="text-2xl mx-auto mb-4 opacity-20" />
              <p className="text-[1.0625rem] font-medium italic opacity-60">
                {activeTab === 'mine' ? "You haven't posted yet. Share something!" : "No discussions found."}
              </p>
            </div>
          ) : (
            sortedPosts.map(post => (
              <Card
                key={post.id}
                padding="lg"
                className="bg-surface border-border hover:border-white/20 transition-all group cursor-pointer"
                onClick={() => router.push(`/student/forum/${post.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon icon="tabler:user-ghost" className="text-base text-text-dim" />
                  </div>
                  <Text variant="small" className="text-base font-medium text-text-muted">{post.anon_alias}</Text>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <Text variant="small" className="text-base font-medium text-text-dim">{timeAgo(post.created_at)}</Text>
                  {post.isOwn && (
                    <span className="badge badge-outline border-primary/30 text-primary text-xs">You</span>
                  )}
                </div>
                
                <Text as="h3" weight="semibold" className="text-white text-base leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</Text>
                <Text color="secondary" className="text-[1.0625rem] leading-relaxed mb-4 line-clamp-2">{post.content}</Text>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="badge badge-outline border-white/5 bg-white/5 text-base font-medium px-2 py-0.5 text-text-dim">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-text-dim">
                  <span className="flex items-center gap-1.5 text-base font-medium">
                    <Icon icon="tabler:heart" className="text-lg" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5 text-base font-medium">
                    <Icon icon="tabler:message-circle" className="text-lg" />
                    {post.replies} Replies
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="lg" className="bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Icon icon="tabler:shield-check" className="text-lg" />
              </div>
              <Text weight="semibold" className="text-white text-[1.0625rem]">Community Guidelines</Text>
            </div>
            <ul className="space-y-3 text-[1.0625rem] text-text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Be Kind:</strong> Treat everyone with empathy and respect.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Stay Anonymous:</strong> Do not share personal identifying information.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Trigger Warnings:</strong> Use appropriate tags for sensitive content.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Not Clinical Help:</strong> This is peer support. Use the Book Counselor feature for professional help.</span>
              </li>
            </ul>
          </Card>

          <Card padding="md" className="bg-surface border-border">
            <Text variant="small" weight="medium" className="text-text-dim uppercase mb-4 block">Popular Topics</Text>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map(tag => (
                <button key={tag} onClick={() => setSearchQuery(tag)} className="px-3 py-1.5 rounded-md text-base font-medium border border-white/5 bg-white/2 text-text-muted hover:text-white hover:border-white/20 transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
