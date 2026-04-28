'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DirectMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export function useDirectChat(partnerId: string | null) {
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()

  // Fetch message history
  const fetchHistory = useCallback(async () => {
    if (!partnerId) return
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [partnerId, supabase])

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!partnerId || !content.trim()) return
    setIsSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          content: content.trim()
        })

      if (error) throw error
      // Note: Message will be added to state via Realtime subscription
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    } finally {
      setIsSending(false)
    }
  }

  // Subscribe to real-time updates
  useEffect(() => {
    if (!partnerId) return

    fetchHistory()

    const channel = supabase
      .channel(`direct_chat:${partnerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages'
      }, (payload) => {
        const newMessage = payload.new as DirectMessage
        // Only add if it belongs to this conversation
        setMessages((prev) => {
          if (prev.some(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partnerId, supabase, fetchHistory])

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    refreshHistory: fetchHistory
  }
}
