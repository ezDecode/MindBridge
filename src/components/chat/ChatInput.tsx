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
 <div className="relative mx-auto w-full max-w-[640px]">
 <form
 onSubmit={handleSubmit}
 className={cn(
 "relative flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl transition-all duration-300 group-focus-within:border-white/20"
 )}
 >
 {/* Input Row */}
 <div className="flex flex-row items-end gap-3 px-4 pt-4 pb-3">
 <div className="relative z-10 flex flex-1 items-center">
 <textarea
 ref={textareaRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder={placeholder}
 disabled={disabled || isLoading}
 rows={1}
 className="no-focus-ring max-h-[160px] min-h-[44px] w-full flex-1 resize-none bg-transparent py-2.5 text-sm leading-relaxed text-white placeholder:text-text-dim focus:outline-none disabled:opacity-50 font-medium"
 aria-label="Message input"
 />
 </div>

 {/* Send / Stop Button */}
 <div className="relative z-10 flex shrink-0 items-center pb-1">
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
 className="flex h-9 w-9 items-center justify-center rounded-md bg-danger/10 text-danger border border-danger/20 transition-all hover:bg-danger/20"
 aria-label="Stop generating"
 >
 <Icon icon="tabler:player-stop-filled" className="h-4 w-4" />
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
 "flex h-9 w-9 items-center justify-center rounded-md transition-all duration-150",
 hasInput
 ? "bg-white text-black shadow-md hover:bg-white/90 active:scale-[0.96]"
 : "bg-white/5 text-text-dim cursor-default border border-white/5"
 )}
 aria-label="Send message"
 >
 <Icon icon="tabler:arrow-up" className="h-4.5 w-4.5" strokeWidth={3} />
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
 <div className="flex items-center border-t border-white/5 px-3 py-2 bg-white/[0.01]">
 <div className="flex flex-wrap items-center gap-1">
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
 className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-medium text-text-dim transition-all duration-150 hover:bg-white/5 hover:text-white active:scale-[0.98]"
 aria-label={action.prompt}
 >
 <Icon icon={action.icon} className="h-3.5 w-3.5 text-primary" />
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
