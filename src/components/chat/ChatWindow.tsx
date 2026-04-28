'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'

import { Text } from '@/components/ui'
import { cleanMessageContent, type Message } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import { MessageActions } from './MessageActions'
import { SuggestionChips } from './SuggestionChips'
import { SlotCarousel } from './SlotCarousel'
import { BookingSuccessCard } from './BookingSuccessCard'

interface ChatWindowProps {
  messages: Message[]
  isLoading?: boolean
  onSuggestionSelect?: (suggestion: string) => void
  onActionSelect?: (action: 'book_counselor' | 'show_resources' | 'send_crisis_alert') => void
  onStartChat?: (partnerId: string) => void
}

export function ChatWindow({
  messages,
  isLoading,
  onSuggestionSelect,
  onActionSelect,
  onStartChat,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [dismissedMessageIds, setDismissedMessageIds] = useState<string[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isLoading])

  const dismissMessageEnhancements = (messageId: string) => {
    setDismissedMessageIds((current) =>
      current.includes(messageId) ? current : [...current, messageId]
    )
  }

  return (
    <div
      className="relative flex h-full flex-col overflow-y-auto no-scrollbar py-2"
      role="log"
      aria-label="Chat conversation"
    >
      {messages.some(m => m.crisis) && (
        <div className="absolute top-0 left-0 w-full flex items-center justify-center pointer-events-none z-10 p-2">
          <div className="bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Icon icon="tabler:alert-triangle-filled" className="size-3.5" />
            Support Activated
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 pb-6">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message, index) => {
            const isFirst = index === 0 || messages[index - 1]?.role !== message.role

            return (
              <MessageBubble
                key={message.id || index}
                message={message}
                isFirst={isFirst}
                previousRole={index > 0 ? messages[index - 1]?.role : null}
                dismissed={dismissedMessageIds.includes(message.id)}
                onSuggestionSelect={(suggestion) => {
                  dismissMessageEnhancements(message.id)
                  onSuggestionSelect?.(suggestion)
                }}
                onActionSelect={(action) => {
                  dismissMessageEnhancements(message.id)
                  onActionSelect?.(action)
                }}
                onDismiss={() => dismissMessageEnhancements(message.id)}
                onStartChat={onStartChat}
              />
            )
          })}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 px-1"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-primary border border-white/5">
              <Icon icon="tabler:message-circle" className="size-3.5" />
            </div>
            <div className="rounded-xl rounded-tl-none border border-white/5 bg-white/[0.02] px-3 py-2">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>
    </div>
  )
}

export function DirectChatView({
  messages,
  isLoading,
  currentUserId,
  partnerName,
}: {
  messages: Array<{
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
  }>
  isLoading: boolean
  currentUserId: string
  partnerName: string
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Icon icon="tabler:user" className="size-4" />
        </div>
        <div>
          <Text variant="small" weight="bold" className="text-white">{partnerName}</Text>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-status-success animate-pulse" />
            <Text variant="caption" className="text-status-success font-bold text-[10px]">Active Session</Text>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-4">
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2 rounded-xl text-[0.9375rem] font-medium leading-snug",
                  isMe 
                    ? "bg-primary text-black rounded-tr-none font-bold shadow-lg shadow-primary/10" 
                    : "bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
              <Text variant="caption" className="mt-1 text-white/20 text-[9px] font-bold px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </motion.div>
          )
        })}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white/[0.03] px-3.5 py-2 rounded-xl rounded-tl-none border border-white/5">
                <TypingIndicator />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  isFirst,
  dismissed,
  onSuggestionSelect,
  onActionSelect,
  onDismiss,
  onStartChat,
}: {
  message: Message
  isFirst: boolean
  previousRole: 'user' | 'assistant' | null
  dismissed: boolean
  onSuggestionSelect: (suggestion: string) => void
  onActionSelect: (action: 'book_counselor' | 'show_resources' | 'send_crisis_alert') => void
  onDismiss: () => void
  onStartChat?: (partnerId: string) => void
}) {
  const [confirmedBooking, setConfirmedBooking] = useState<{
    counselorName: string
    slotTime: string
    slotStart?: string
    slotEnd?: string
  } | null>(message.bookingConfirmed || null)
  const [isConfirmingSlot, setIsConfirmingSlot] = useState(false)

  const isUser = message.role === 'user'
  const displayContent = cleanMessageContent(message.content)
  const showSuggestions =
    !dismissed &&
    message.role === 'assistant' &&
    !message.isStreaming &&
    Boolean(message.suggestions?.length)
  const showActions =
    !dismissed && message.role === 'assistant' && !message.isStreaming && Boolean(message.action)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        'group flex w-full items-start gap-2.5 px-1',
        isUser && 'flex-row-reverse'
      )}
    >
      {!isUser && isFirst ? (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] text-primary border border-white/5 transition-transform group-hover:scale-105">
          <Icon icon="tabler:robot" className="size-3.5" />
        </div>
      ) : (
        <div className="size-7 shrink-0" />
      )}

      <div className={cn('flex max-w-[88%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative overflow-hidden px-3.5 py-2 transition-all duration-200',
            isUser
              ? 'rounded-xl rounded-tr-none bg-primary text-black font-semibold'
              : 'rounded-xl rounded-tl-none border border-white/5 bg-white/[0.02] text-white/90',
            !isFirst && (isUser ? 'rounded-tr-xl' : 'rounded-tl-xl')
          )}
        >
          <Text
            as="div"
            className={cn(
              'whitespace-pre-wrap text-[0.9375rem] leading-snug',
              isUser ? 'font-bold' : 'font-medium'
            )}
          >
            {displayContent || (message.isStreaming ? <TypingIndicator /> : '')}
            {message.isStreaming && displayContent && <TypingCursor />}
          </Text>
        </div>

        {!isUser && (showSuggestions || showActions || message.bookingSlots || confirmedBooking) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 w-full"
          >
            {showSuggestions && message.suggestions && (
              <SuggestionChips suggestions={message.suggestions} onSelect={onSuggestionSelect} />
            )}

            {confirmedBooking ? (
              <BookingSuccessCard
                counselorName={confirmedBooking.counselorName}
                slotTime={confirmedBooking.slotTime}
                slotStart={confirmedBooking.slotStart}
                slotEnd={confirmedBooking.slotEnd}
                onStartChat={() => onStartChat?.(message.actionContext || '')}
              />
            ) : message.bookingSlots && message.bookingSlots.length > 0 ? (
              <SlotCarousel
                slots={message.bookingSlots}
                isLoading={isConfirmingSlot}
                onSelectSlot={async (slot) => {
                  setIsConfirmingSlot(true)
                  try {
                    const res = await fetch('/api/bookings/confirm-slot', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ slotId: slot.id })
                    })
                    const data = await res.json()
                    if (data.success) {
                      setConfirmedBooking({
                        counselorName: slot.counselorName,
                        slotTime: slot.slotTime,
                        slotStart: slot.slotStart,
                        slotEnd: slot.slotEnd
                      })
                      onDismiss()
                    }
                  } catch (e) {
                    console.error('Failed to confirm slot', e)
                  } finally {
                    setIsConfirmingSlot(false)
                  }
                }}
                onCancel={onDismiss}
              />
            ) : showActions && message.action ? (
              <div className="mt-2">
                <MessageActions
                  action={message.action}
                  onAction={onActionSelect}
                  onDismiss={onDismiss}
                />
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function TypingCursor() {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      className="ml-1 inline-block h-4 w-1 rounded-full bg-primary/80"
      aria-hidden="true"
    />
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          className="size-1.5 rounded-full bg-primary/40"
        />
      ))}
    </div>
  )
}
