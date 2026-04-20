'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react';
import { Text } from '@/components/ui'
import { cleanMessageContent, type Message } from '@/hooks/useChat'
import { MessageActions } from './MessageActions'
import { SuggestionChips } from './SuggestionChips'

interface ChatWindowProps {
 messages: Message[]
 isLoading?: boolean
 onSuggestionSelect?: (suggestion: string) => void
 onActionSelect?: (action: 'book_counselor' | 'show_resources' | 'send_crisis_alert') => void
}

export function ChatWindow({
 messages,
 isLoading,
 onSuggestionSelect,
 onActionSelect,
}: ChatWindowProps) {
 const messagesEndRef = useRef<HTMLDivElement>(null)
 const [dismissedMessageIds, setDismissedMessageIds] = useState<string[]>([])

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ 
 behavior: 'smooth',
 block: 'end'
 })
 }, [messages, isLoading])

 const dismissMessageEnhancements = (messageId: string) => {
 setDismissedMessageIds((current) =>
 current.includes(messageId) ? current : [...current, messageId]
 )
 }

 return (
 <div 
 className="relative flex h-full flex-col overflow-y-auto py-2"
 role="log" 
 aria-label="Chat conversation"
 style={{
 maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
 WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 100%)'
 }}
 >
 <div className="flex flex-col gap-1.5 pb-4 pt-6">
 <AnimatePresence initial={false} mode="popLayout">
 {messages.map((message, index) => {
 const isFirst = index === 0 || messages[index - 1]?.role !== message.role
 const isLast = index === messages.length - 1 || messages[index + 1]?.role !== message.role
 
 return (
 <MessageBubble 
 key={message.id} 
 message={message}
 isFirst={isFirst}
 isLast={isLast}
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
 />
 )
 })}
 </AnimatePresence>

 {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.2 }}
 className="mt-6 flex items-end gap-2.5"
 >
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] bg-[var(--color-primary-light)] text-[var(--color-primary)] ring-1 ring-black/5">
 <Icon icon="tabler:message-circle" className="h-3.5 w-3.5" />
 </div>
 <div className="rounded-md rounded-bl-[0.45rem] border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-4 py-2.5 shadow-sm">
 <TypingIndicator />
 </div>
 </motion.div>
 )}

 <div ref={messagesEndRef} className="h-2" />
 </div>
 </div>
 )
}

function MessageBubble({
 message,
 isFirst,
 isLast,
 previousRole,
 dismissed,
 onSuggestionSelect,
 onActionSelect,
 onDismiss,
}: {
 message: Message
 isFirst: boolean
 isLast: boolean
 previousRole: 'user' | 'assistant' | null
 dismissed: boolean
 onSuggestionSelect: (suggestion: string) => void
 onActionSelect: (action: 'book_counselor' | 'show_resources' | 'send_crisis_alert') => void
 onDismiss: () => void
}) {
 const isUser = message.role === 'user'
 const displayContent = cleanMessageContent(message.content)
 const showSuggestions = !dismissed && message.role === 'assistant' && !message.isStreaming && Boolean(message.suggestions?.length)
 const showActions = !dismissed && message.role === 'assistant' && !message.isStreaming && Boolean(message.action)
 
 const needsSpacing = !isFirst && previousRole === message.role

 return (
 <motion.div
 initial={{ opacity: 0, y: 8, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -4, scale: 0.98 }}
 transition={{ 
 duration: 0.2,
 ease: [0.16, 1, 0.3, 1]
 }}
 className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''} ${needsSpacing ? 'mt-1' : isFirst ? 'mt-6' : 'mt-5'}`}
 >
 <div className="flex h-8 w-8 shrink-0 items-end">
 {isLast && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
 className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] shadow-sm ${
 isUser
 ? 'bg-[var(--color-primary)] text-white'
 : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] ring-1 ring-black/5'
 }`}
 >
 {isUser ? (
 <Icon icon="tabler:user" className="h-3.5 w-3.5" />
 ) : (
 <Icon icon="tabler:message-circle" className="h-3.5 w-3.5" />
 )}
 </motion.div>
 )}
 </div>

 <motion.div className={`max-w-[min(42rem,85%)] ${isUser ? 'items-end' : 'items-start'}`}>
 <div
 className={`relative rounded-md px-4 py-2.5 shadow-sm transition-colors duration-200 sm:px-4.5 ${
 isUser
 ? 'rounded-br-[0.45rem] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary),white_6%)_0%,var(--color-primary-dark)_100%)] text-white'
 : 'rounded-bl-[0.45rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-surface-warm)_100%)] text-[var(--color-text-primary)]'
 }`}
 >
 <Text 
 as="p" 
 variant="body" 
 className={`whitespace-pre-wrap text-[0.95rem] leading-6 ${isUser ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}
 >
 {displayContent || (message.isStreaming ? <TypingIndicator /> : '')}
 {message.isStreaming && displayContent && <TypingCursor />}
 </Text>
 </div>

 {!isUser && (showSuggestions || showActions) ? (
 <div className="mt-2.5 pl-0.5">
 {showSuggestions && message.suggestions ? (
 <SuggestionChips
 suggestions={message.suggestions}
 onSelect={onSuggestionSelect}
 />
 ) : null}

 {showActions && message.action ? (
 <MessageActions
 action={message.action}
 onAction={onActionSelect}
 onDismiss={onDismiss}
 />
 ) : null}
 </div>
 ) : null}
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
 <span className="inline-flex h-5 items-center gap-1">
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

