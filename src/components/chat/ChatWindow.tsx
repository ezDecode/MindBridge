'use client'

import { useRef, useEffect } from 'react'
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [messages, isLoading])

  return (
    <div 
      className="relative flex flex-col py-2 h-full overflow-y-auto" 
      role="log" 
      aria-label="Chat conversation"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 100%)'
      }}
    >
      <div className="flex flex-col gap-1 pb-4 pt-6">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message, index) => {
            const isFirst = index === 0 || messages[index - 1]?.role !== message.role;
            const isLast = index === messages.length - 1 || messages[index + 1]?.role !== message.role;
            
            return (
              <MessageBubble 
                key={message.id} 
                message={message}
                isFirst={isFirst}
                isLast={isLast}
              />
            )
          })}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex items-end gap-2 mt-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] ring-1 ring-black/5">
              <FiMessageCircle className="h-4 w-4" />
            </div>
            <div className="rounded-lg rounded-bl-sm border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-4 py-3 shadow-sm">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>
    </div>
  )
}

function MessageBubble({ message, isFirst, isLast }: { message: Message; isFirst: boolean; isLast: boolean }) {
  const isUser = message.role === 'user'
  const displayContent = cleanMessageContent(message.content)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.25,
        ease: "easeOut"
      }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''} ${isFirst ? 'mt-4' : 'mt-1'}`}
    >
      {/* Avatar Container */}
      <div className="flex h-8 w-8 shrink-0 items-end">
        {isLast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm ${
              isUser
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] ring-1 ring-black/5'
            }`}
          >
            {isUser ? (
              <FiUser className="h-4 w-4" />
            ) : (
              <FiMessageCircle className="h-4 w-4" />
            )}
          </motion.div>
        )}
      </div>

      {/* Message Bubble */}
      <motion.div
        className={`max-w-[85%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`relative rounded-lg px-4 py-2.5 shadow-sm transition-colors duration-200 ${
            isUser
              ? 'rounded-br-sm bg-[var(--color-primary)] text-white'
              : 'rounded-bl-sm border border-[var(--color-border)] bg-[var(--color-surface-warm)] text-[var(--color-text-primary)]'
          }`}
        >
          <Text 
            as="p" 
            variant="body" 
            className={`whitespace-pre-wrap leading-relaxed ${isUser ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}
          >
            {displayContent || (message.isStreaming ? <TypingIndicator /> : '')}
            {message.isStreaming && displayContent && <TypingCursor />}
          </Text>
        </div>
      </motion.div>
    </motion.div>
  )
}

function TypingCursor() {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      className="ml-0.5 inline-block h-4 w-0.5 align-middle rounded-sm bg-[var(--color-primary)]"
      aria-hidden="true"
    />
  )
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 h-5">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ 
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            delay,
            ease: "easeInOut"
          }}
          className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)]"
        />
      ))}
    </span>
  )
}
