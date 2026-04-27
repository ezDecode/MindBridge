'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface Announcement {
  id: string
  title: string
  content: string
  target: string
  created_at: string
}

export default function CounselorMessagesPage() {
  const { showToast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Announcement modal state
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [target, setTarget] = useState<'all' | 'student'>('student')
  const [sending, setSending] = useState(false)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/counselor/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements ?? [])
      }
    } catch {
      console.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const activeAnnouncement = announcements.find(a => a.id === activeId)

  const sendAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      showToast("Title and content required", "info")
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/counselor/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          target,
        }),
      })
      if (res.ok) {
        showToast("Announcement broadcast!", "success")
        setTitle('')
        setContent('')
        setShowModal(false)
        fetchAnnouncements() // Refresh list
      }
    } catch {
      showToast("Failed to send announcement", "error")
    } finally {
      setSending(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="text-white mb-1">Broadcast Center</Text>
          <Text variant="small" className="text-text-dim font-medium">Send updates and announcements to your cohort</Text>
        </div>
        <Button size="md" className="gap-2" onClick={() => setShowModal(true)}>
          <Icon icon="tabler:speakerphone" className="text-lg" />
          New Broadcast
        </Button>
      </div>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card padding="lg" className="bg-surface border-primary/30 shadow-xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <Text as="h3" weight="semibold" className="text-white">New Announcement</Text>
                <button onClick={() => setShowModal(false)} className="text-text-dim hover:text-white transition-colors">
                  <Icon icon="tabler:x" className="text-xl" />
                </button>
              </div>
              <div className="space-y-4">
                <Input 
                  placeholder="Announcement title..." 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
                <textarea
                  className="w-full min-h-[150px] bg-background border border-border rounded-md px-4 py-3 text-white placeholder:text-text-dim focus:border-white/20 outline-none resize-none transition-all"
                  placeholder="Write your announcement content here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <Text variant="small" className="text-text-dim">Target Audience:</Text>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTarget('student')}
                      className={cn("px-4 py-1.5 rounded-md text-sm font-medium border transition-all",
                        target === 'student' ? "bg-primary/10 border-primary/30 text-primary" : "border-white/10 text-text-muted hover:border-white/20"
                      )}
                    >Students Only</button>
                    <button
                      onClick={() => setTarget('all')}
                      className={cn("px-4 py-1.5 rounded-md text-sm font-medium border transition-all",
                        target === 'all' ? "bg-primary/10 border-primary/30 text-primary" : "border-white/10 text-text-muted hover:border-white/20"
                      )}
                    >Everyone</button>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button variant="ghost" size="md" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button size="md" onClick={sendAnnouncement} disabled={sending || !title.trim() || !content.trim()}>
                    {sending ? "Sending..." : "Send Broadcast"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcasts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* History List */}
        <div className="lg:col-span-4 space-y-2">
          <Text variant="small" weight="medium" className="text-text-dim uppercase px-2 mb-3 block tracking-wider">Broadcast History</Text>
          {loading ? (
            <div className="py-12 text-center">
              <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            </div>
          ) : announcements.length === 0 ? (
            <Card padding="md" className="bg-white/2 border-dashed border-border text-center py-12">
              <Icon icon="tabler:speakerphone-off" className="text-3xl text-text-dim mx-auto mb-3 opacity-20" />
              <Text variant="small" className="text-text-dim px-4">No broadcasts sent yet. Start by sending one to your students.</Text>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <button
                  key={ann.id}
                  onClick={() => setActiveId(ann.id)}
                  className={cn(
                    "w-full p-5 rounded-xl border text-left transition-all group",
                    activeId === ann.id
                      ? "bg-white/5 border-primary/40 ring-1 ring-primary/20"
                      : "bg-surface border-border hover:border-white/10 hover:bg-white/2"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                      ann.target === 'all' ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                    )}>
                      {ann.target}
                    </span>
                    <Text variant="small" className="text-text-dim text-[10px]">{timeAgo(ann.created_at)}</Text>
                  </div>
                  <Text weight="semibold" className="text-white text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">{ann.title}</Text>
                  <Text variant="small" className="text-text-dim line-clamp-1 text-xs">{ann.content}</Text>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8">
          {activeAnnouncement ? (
            <Card padding="lg" className="bg-surface border-border h-full flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl">
                    <Icon icon="tabler:speakerphone" />
                  </div>
                  <div>
                    <Text as="h3" variant="h4" weight="bold" className="text-white mb-0.5">{activeAnnouncement.title}</Text>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-dim">Sent {new Date(activeAnnouncement.created_at).toLocaleString()}</span>
                      <span className="size-1 rounded-full bg-white/20" />
                      <span className="text-[11px] text-primary font-medium uppercase tracking-wider">Target: {activeAnnouncement.target}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="prose prose-invert max-w-none">
                  <Text className="text-text-muted leading-relaxed whitespace-pre-wrap text-lg">
                    {activeAnnouncement.content}
                  </Text>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-text-dim">
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:info-circle" className="text-lg" />
                  <Text variant="small" className="text-xs">Broadcasts are read-only for students.</Text>
                </div>
                <Button variant="ghost" size="sm" className="text-xs hover:text-red-400" onClick={() => {
                  // In a real app, we might add delete functionality here
                  showToast("Delete functionality not implemented in this view", "info")
                }}>
                  Archive Broadcast
                </Button>
              </div>
            </Card>
          ) : (
            <Card padding="lg" className="bg-surface border-border border-dashed h-full flex items-center justify-center opacity-60">
              <div className="text-center max-w-xs">
                <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="tabler:click" className="text-3xl text-text-dim animate-pulse" />
                </div>
                <Text weight="semibold" className="text-white mb-2">View Broadcast Details</Text>
                <Text variant="small" className="text-text-dim">Select an announcement from the history to view its full content and audience details.</Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
