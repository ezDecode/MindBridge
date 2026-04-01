'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FiUser, FiMessageCircle } from 'react-icons/fi'
import { Text } from '@/components/ui'
import { cleanMessageContent } from '@/hooks/useChat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatWindowProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-3 overflow-y-auto py-4" role="log" aria-label="Chat conversation">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </AnimatePresence>

      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
            <FiMessageCircle className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <div className="rounded-[calc(var(--radius-lg)*var(--brm))] squircle bg-[var(--color-surface)] px-4 py-3">
            <TypingIndicator />
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const displayContent = cleanMessageContent(message.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
        }`}
      >
        {isUser ? (
          <FiUser className="h-4 w-4" />
        ) : (
          <FiMessageCircle className="h-4 w-4" />
        )}
      </div>

      <div
        className={`max-w-[85%] rounded-[calc(var(--radius-lg)*var(--brm))] squircle px-4 py-3 ${
          isUser
            ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
        }`}
      >
        <Text as="p" variant="body" className="whitespace-pre-wrap">
          {displayContent || (message.isStreaming ? <TypingIndicator /> : '')}
          {message.isStreaming && displayContent && <TypingCursor />}
        </Text>
      </div>
    </motion.div>
  )
}

// Premium typing cursor - blinking caret that shows AI is "thinking"
function TypingCursor() {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block w-0.5 h-4 ml-0.5 bg-[var(--color-primary)] align-middle"
      aria-hidden="true"
    />
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]"
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]"
      />
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]"
      />
    </div>
  )
}
