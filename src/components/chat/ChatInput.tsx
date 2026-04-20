'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui'

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
 const [isFocused, setIsFocused] = useState(false)
 const [showTools, setShowTools] = useState(true)
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

 return (
 <div className="relative mx-auto w-full max-w-[52rem]">
 <motion.form
 onSubmit={handleSubmit}
 className={cn(
 "relative flex w-full flex-col overflow-hidden rounded-[22px] border bg-[var(--color-surface)] transition-all duration-300",
 isFocused
 ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary-light)] shadow-[0_18px_42px_rgba(244,125,75,0.14)]"
 : "border-[var(--color-border)] shadow-[0_14px_34px_rgba(45,41,38,0.08)] hover:border-[var(--color-border-strong)]"
 )}
 >
 <div className="flex flex-row items-end px-3 pt-3 pb-2">
 <div className="relative z-10 flex flex-1 items-center px-2.5">
 <textarea
 ref={textareaRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 placeholder={placeholder}
 disabled={disabled || isLoading}
 rows={1}
 className="max-h-[150px] min-h-[44px] w-full flex-1 resize-none bg-transparent py-3 text-[0.98rem] leading-7 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
 aria-label="Message input"
 />
 </div>

 <div className="relative z-10 flex shrink-0 items-center gap-2 pb-1 pr-1">
 <AnimatePresence mode="wait">
 {isLoading ? (
 <motion.div
 key="stop"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 <Button
 type="button"
 variant="warm"
 size="sm"
 onClick={onStop}
 className="h-10 w-10 rounded-md border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] text-[var(--color-danger)] transition-colors duration-200 hover:bg-[var(--color-danger-soft)]"
 aria-label="Stop generating"
 >
 <Icon icon="tabler:player-stop" className="h-4 w-4" />
 </Button>
 </motion.div>
 ) : (
 <motion.div
 key="send"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.15 }}
 >
 <Button
 type="submit"
 variant="warm"
 size="sm"
 disabled={!input.trim() || disabled}
 className={`h-10 w-10 rounded-md border transition-all duration-200 ease-out ${
 input.trim() 
 ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_12px_22px_rgba(244,125,75,0.24)] hover:bg-[var(--color-primary-dark)] hover:border-[var(--color-primary-dark)]' 
 : 'border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text-muted)]'
 }`}
 aria-label="Send message"
 >
 <Icon icon="tabler:send" className="h-4 w-4" />
 </Button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 <AnimatePresence>
 {showTools && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden lg:hidden"
 >
 <div className="flex items-center justify-between border-t border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 py-3">
 <div className="flex flex-wrap items-center gap-2">
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
 className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-primary)] active:translate-y-0"
 aria-label={action.prompt}
 >
 <Icon icon={action.icon} className="h-4 w-4" />
 <span>{action.title}</span>
 </button>
 ))}
 </div>
 <div className="ml-4 flex shrink-0 items-center">
 <div className="mr-2 h-4 w-px bg-[var(--color-border)]" />
 <button
 type="button"
 onClick={() => setShowTools(false)}
 className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
 aria-label="Dismiss quick actions"
 >
 <Icon icon="tabler:x" className="h-[1.125rem] w-[1.125rem]" />
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.form>
 
 <div className="pointer-events-none absolute -bottom-6 inset-x-2 hidden items-center justify-between px-2 text-[11px] font-medium tracking-[0.02em] text-[var(--color-text-muted)] sm:flex">
 <span>Press Enter to send</span>
 <span>Shift + Enter for a new line</span>
 </div>
 </div>
 )
}
