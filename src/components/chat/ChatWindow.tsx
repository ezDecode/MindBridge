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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]/10 text-[var(--color-primary)] ring-1 ring-black/5">
              <FiMessageCircle className="h-4 w-4" />
            </div>
            <div className="rounded-tr-2xl rounded-tl-2xl rounded-br-2xl rounded-bl-md bg-[var(--color-primary)]/5 backdrop-blur-md px-4 py-3 border border-[var(--color-primary)]/10 squircle shadow-sm">
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
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
              isUser
                ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white'
                : 'bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]/10 text-[var(--color-primary)] ring-1 ring-black/5'
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
          className={`relative px-4 py-2.5 shadow-sm squircle transition-colors duration-200 ${
            isUser
              ? `bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white ${
                  isLast && isFirst ? 'rounded-2xl rounded-br-md' : isLast ? 'rounded-2xl rounded-br-md rounded-tr-md' : isFirst ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-tr-md rounded-br-md'
                }`
              : `bg-[var(--color-primary)]/5 backdrop-blur-md text-[var(--color-text-primary)] border border-[var(--color-primary)]/10 ${
                  isLast && isFirst ? 'rounded-2xl rounded-bl-md' : isLast ? 'rounded-2xl rounded-bl-md rounded-tl-md' : isFirst ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-tl-md rounded-bl-md'
                }`
          }`}
          style={
            isUser && !isLast && !isFirst ? { borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem', borderRadius: '1rem' } :
            isUser && isLast && !isFirst ? { borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem', borderBottomLeftRadius: '1rem', borderTopLeftRadius: '1rem' } :
            !isUser && !isLast && !isFirst ? { borderTopLeftRadius: '0.375rem', borderBottomLeftRadius: '0.375rem', borderRadius: '1rem' } :
            !isUser && isLast && !isFirst ? { borderTopLeftRadius: '0.375rem', borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '1rem', borderTopRightRadius: '1rem' } :
            {}
          }
        >
          <Text 
            as="p" 
            variant="body" 
            className="whitespace-pre-wrap leading-relaxed"
            style={{ color: isUser ? 'inherit' : 'var(--color-text-secondary)' }}
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