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
 <div className="relative mx-auto w-full max-w-[580px]">
 <form
 onSubmit={handleSubmit}
 className={cn(
 "relative flex w-full flex-col overflow-hidden rounded-2xl border bg-[var(--surface-default)] transition-all duration-200",
 isFocused
 ? "border-[var(--action-primary)] ring-2 ring-[var(--action-primary-glow)] shadow-none"
 : "border-[var(--border-default)] shadow-none"
 )}
 >
 <div className="flex flex-row items-end px-3 pt-3 pb-2">
 <div className="relative z-10 flex flex-1 items-center px-1">
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
 className="max-h-[150px] min-h-[44px] w-full flex-1 resize-none bg-transparent py-3 text-sm leading-6 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
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
 variant="ghost"
 size="sm"
 onClick={onStop}
 className="h-10 w-10 shrink-0 rounded-lg bg-transparent text-[var(--text-icon)] hover:text-[var(--text-primary)] transition-colors duration-200"
 aria-label="Stop generating"
 >
 <Icon icon="tabler:player-stop" className="h-5 w-5" />
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
 variant="ghost"
 size="sm"
 disabled={!input.trim() || disabled}
 className={`h-10 w-10 shrink-0 rounded-lg transition-colors duration-200 ease-out bg-transparent ${
 input.trim() 
 ? 'text-[var(--action-primary)] hover:text-[var(--action-primary-hover)]' 
 : 'text-[var(--text-icon)]'
 }`}
 aria-label="Send message"
 >
 <Icon icon="tabler:send" className="h-5 w-5" />
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
 className="overflow-hidden"
 >
 <div className="flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--surface-default)] px-4 py-3">
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
 className="flex items-center gap-1.5 rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--action-primary)] hover:text-[var(--text-primary)]"
 aria-label={action.prompt}
 >
 <Icon icon={action.icon} className="h-4 w-4" />
 <span>{action.title}</span>
 </button>
 ))}
 </div>
 <div className="ml-4 flex shrink-0 items-center hidden">
 <div className="mr-2 h-4 w-px bg-[var(--border-default)]" />
 <button
 type="button"
 onClick={() => setShowTools(false)}
 className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
 aria-label="Dismiss quick actions"
 >
 <Icon icon="tabler:x" className="h-4 w-4" />
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </form>
 
 </div>
 )
}
