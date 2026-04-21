'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

type QuickActionId = 'guided_checkin' | 'quick_mood_log' | 'book_session' | 'view_dashboard'

const QUICK_ACTIONS = [
 { id: 'guided_checkin' as QuickActionId, icon: 'tabler:bolt', title: 'Guided check-in', prompt: 'I would like a guided check-in.' },
 { id: 'quick_mood_log' as QuickActionId, icon: 'tabler:mood-smile', title: 'Quick mood log', prompt: 'I am ready to log my mood.' },
 { id: 'book_session' as QuickActionId, icon: 'tabler:calendar-plus', title: 'Book session', prompt: 'I would like to book a new session.' },
 { id: 'view_dashboard' as QuickActionId, icon: 'tabler:chart-bar', title: 'View dashboard', prompt: 'Show me my dashboard insights.' },
]

interface ChatInputProps {
 onSend: (message: string) => void
 isLoading?: boolean
 onStop?: () => void
 placeholder?: string
 disabled?: boolean
 onBookSession?: () => void
 onViewAnalytics?: () => void
 onQuickMoodLog?: () => void
 onGuidedQuestions?: () => void
}

export function ChatInput({
 onSend,
 isLoading,
 onStop,
 placeholder = "Type your ideas here...",
 disabled,
 onBookSession,
 onViewAnalytics,
 onQuickMoodLog,
 onGuidedQuestions,
}: ChatInputProps) {
 const [input, setInput] = useState('')
 const showTools = true;
 const textareaRef = useRef<HTMLTextAreaElement>(null)

 useEffect(() => {
 const textarea = textareaRef.current
 if (textarea) {
 textarea.style.height = 'auto'
 textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
 }
 }, [input])

 const handleSubmit = (e: FormEvent) => {
 e.preventDefault()
 if (input.trim() && !isLoading && !disabled) {
 onSend(input)
 setInput('')
 if (textareaRef.current) {
 textareaRef.current.style.height = 'auto'
 }
 }
 }

 const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 handleSubmit(e)
 }
 }

 const hasInput = input.trim().length > 0

 return (
 <div className="relative mx-auto w-full max-w-[580px]">
 <form
 onSubmit={handleSubmit}
 className={cn(
 "relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-default)] shadow-sm transition-all duration-300"
 )}
 >
 {/* Input Row */}
 <div className="flex flex-row items-end gap-2 px-4 pt-3 pb-2">
 <div className="relative z-10 flex flex-1 items-center">
 <textarea
 ref={textareaRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder={placeholder}
 disabled={disabled || isLoading}
 rows={1}
 className="no-focus-ring max-h-[150px] min-h-[44px] w-full flex-1 resize-none bg-transparent py-3 text-[15px] leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
 aria-label="Message input"
 />
 </div>

 {/* Send / Stop Button */}
 <div className="relative z-10 flex shrink-0 items-center pb-1.5">
 <AnimatePresence mode="wait">
 {isLoading ? (
 <motion.button
 key="stop"
 type="button"
 onClick={onStop}
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 transition={{ duration: 0.15 }}
 className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-error-soft)] text-[var(--status-error)] transition-colors duration-200 hover:bg-[var(--status-error)]/20"
 aria-label="Stop generating"
 >
 <Icon icon="tabler:player-stop-filled" className="h-5 w-5" />
 </motion.button>
 ) : (
 <motion.button
 key="send"
 type="submit"
 disabled={!hasInput || disabled}
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 transition={{ duration: 0.15 }}
 className={cn(
 "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
 hasInput
 ? "bg-[var(--action-primary)] text-[var(--text-inverse)] shadow-sm hover:bg-[var(--action-primary-hover)] hover:shadow-md active:scale-95"
 : "bg-[var(--surface-strong)] text-[var(--text-muted)] cursor-default"
 )}
 aria-label="Send message"
 >
 <Icon icon="tabler:arrow-up" className="h-5 w-5" strokeWidth={2.5} />
 </motion.button>
 )}
 </AnimatePresence>
 </div>
 </div>

 {/* Quick Actions Bar */}
 <AnimatePresence>
 {showTools && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="flex items-center border-t border-[var(--border-light)] px-4 py-2.5">
 <div className="flex flex-wrap items-center gap-1.5">
 {QUICK_ACTIONS.map((action, i) => (
 <button
 key={i}
 type="button"
 onClick={() => {
 onSend(action.prompt)
 if (action.id === 'book_session' && onBookSession) {
 onBookSession()
 } else if (action.id === 'view_dashboard' && onViewAnalytics) {
 onViewAnalytics()
 } else if (action.id === 'quick_mood_log' && onQuickMoodLog) {
 onQuickMoodLog()
 } else if (action.id === 'guided_checkin' && onGuidedQuestions) {
 onGuidedQuestions()
 }
 }}
 title={action.prompt}
 className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-all duration-200 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
 aria-label={action.prompt}
 >
 <Icon icon={action.icon} className="h-3.5 w-3.5" />
 <span>{action.title}</span>
 </button>
 ))}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </form>
 
 </div>
 )
}
