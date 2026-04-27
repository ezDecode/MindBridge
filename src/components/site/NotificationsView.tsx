'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { Card, Text, Button } from '@/components/ui'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const getNotificationTitle = (type: string) => {
  switch(type) {
    case 'booking': return 'Appointment Alert'
    case 'level_up': return 'Level Up!'
    case 'forum_reply': return 'Forum Reply'
    case 'dm': return 'Direct Message'
    case 'crisis': return 'Crisis Alert'
    case 'system': return 'System Notice'
    default: return 'Notification'
  }
}

const getNotificationIcon = (type: string) => {
  switch(type) {
    case 'booking': return 'tabler:calendar-event'
    case 'level_up': return 'tabler:arrow-up-circle'
    case 'forum_reply': return 'tabler:messages'
    case 'dm': return 'tabler:message-circle'
    case 'crisis': return 'tabler:alert-triangle'
    case 'system': return 'tabler:info-circle'
    default: return 'tabler:bell'
  }
}

export function NotificationsView() {
  const { notifications, unreadCount, markAsRead, markAllRead, loading } = useNotifications()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="text-white mb-1">Notifications</Text>
          <Text variant="small" className="text-text-dim font-medium">Stay updated on your activity and alerts</Text>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" className="gap-2 text-primary hover:text-primary-hover" onClick={() => markAllRead()}>
            <Icon icon="tabler:checks" className="text-lg" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card padding="none" className="bg-surface border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Icon icon="tabler:bell-off" className="text-3xl text-text-dim opacity-50" />
            </div>
            <Text weight="medium" className="text-white mb-1">You&apos;re all caught up</Text>
            <Text variant="small" className="text-text-dim">No new notifications at the moment.</Text>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead([notif.id])
                }}
                className={cn(
                  "p-6 flex items-start gap-4 transition-all",
                  notif.is_read 
                    ? "opacity-70 hover:opacity-100 bg-transparent hover:bg-white/2" 
                    : "bg-white/5 hover:bg-white/10 cursor-pointer"
                )}
              >
                <div className={cn(
                  "size-10 rounded-full flex items-center justify-center shrink-0",
                  notif.is_read ? "bg-white/5 text-text-muted" : "bg-primary/10 text-primary border border-primary/20"
                )}>
                  <Icon icon={getNotificationIcon(notif.type)} className="text-xl" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Text weight="semibold" className="text-white">{getNotificationTitle(notif.type)}</Text>
                      {!notif.is_read && <span className="size-2 rounded-full bg-primary" />}
                    </div>
                    <Text variant="small" className="text-text-dim whitespace-nowrap text-xs">{formatTimeAgo(notif.created_at)}</Text>
                  </div>
                  <Text className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">{notif.message}</Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
