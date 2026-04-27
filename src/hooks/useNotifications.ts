'use client'

import { useState, useEffect, useCallback } from 'react'

interface Notification {
  id: string
  message: string
  type: 'dm' | 'booking' | 'forum_reply' | 'crisis' | 'level_up' | 'system'
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      console.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (ids?: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      // Optimistic update
      if (ids) {
        setNotifications(prev =>
          prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - ids.length))
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch {
      console.error('Failed to mark notifications as read')
    }
  }

  const markAllRead = () => markAsRead()

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllRead,
    refresh: fetchNotifications,
  }
}
