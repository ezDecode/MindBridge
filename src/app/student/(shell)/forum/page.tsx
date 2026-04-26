'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type Post = {
  id: string
  title: string
  content: string
  author: string
  timeAgo: string
  likes: number
  replies: number
  tags: string[]
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'How do you handle exam season anxiety without burning out?',
    content: 'I find myself staring at the wall for hours when I should be studying. The pressure is getting to me. Does anyone have techniques that actually work without feeling like a machine?',
    author: 'Anonymous Panda',
    timeAgo: '2h ago',
    likes: 24,
    replies: 8,
    tags: ['Exams', 'Anxiety', 'Burnout']
  },
  {
    id: '2',
    title: 'Hostel life is incredibly isolating sometimes',
    content: 'Surrounded by hundreds of people but still feeling completely alone. I miss home food and just having a quiet space to decompress. How do you all cope?',
    author: 'Hidden Owl',
    timeAgo: '5h ago',
    likes: 42,
    replies: 15,
    tags: ['Hostel', 'Loneliness']
  },
  {
    id: '3',
    title: 'Reminder: It is okay to take a day off',
    content: 'Just wanted to drop this here. You don\'t have to be productive 100% of the time. Taking a nap is productive if your body needs it.',
    author: 'Silent Fox',
    timeAgo: '1d ago',
    likes: 89,
    replies: 4,
    tags: ['Self-care', 'Positivity']
  },
  {
    id: '4',
    title: 'Struggling to balance placements and final year project',
    content: 'The expectations are insane. If I focus on interviews, my project guide yells at me. If I focus on the project, I bomb the technical rounds. Is anyone else in the same boat?',
    author: 'Anonymous Tiger',
    timeAgo: '1d ago',
    likes: 56,
    replies: 22,
    tags: ['Placements', 'Academic Pressure']
  }
]

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'mine'>('trending')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = MOCK_POSTS.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          <Button size="md" className="gap-2 shrink-0">
            <Icon icon="tabler:pencil-plus" className="text-lg" />
            <span className="hidden sm:inline">New Post</span>
          </Button>
        </div>
      </div>

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
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-text-dim border border-dashed border-border rounded-lg bg-white/[0.01]">
              <Icon icon="tabler:messages-off" className="text-2xl mx-auto mb-4 opacity-20" />
              <p className="text-[1.0625rem] font-medium italic opacity-60">No discussions found matching your search.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <Card key={post.id} padding="lg" className="bg-surface border-border hover:border-white/20 transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon icon="tabler:user-ghost" className="text-base text-text-dim" />
                  </div>
                  <Text variant="small" className="text-base font-medium text-text-muted">{post.author}</Text>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <Text variant="small" className="text-base font-medium text-text-dim">{post.timeAgo}</Text>
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
                  <button className="flex items-center gap-1.5 text-base font-medium hover:text-primary transition-colors">
                    <Icon icon="tabler:heart" className="text-lg" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-base font-medium hover:text-white transition-colors">
                    <Icon icon="tabler:message-circle" className="text-lg" />
                    {post.replies} Replies
                  </button>
                  <button className="flex items-center gap-1.5 text-base font-medium hover:text-white transition-colors ml-auto">
                    <Icon icon="tabler:share" className="text-lg" />
                    Share
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar guidelines */}
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
              {['Exams', 'Anxiety', 'Loneliness', 'Placements', 'Hostel', 'Sleep', 'Relationships'].map(tag => (
                <button key={tag} onClick={() => setSearchQuery(tag)} className="px-3 py-1.5 rounded-md text-base font-medium border border-white/5 bg-white/[0.02] text-text-muted hover:text-white hover:border-white/20 transition-all">
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
