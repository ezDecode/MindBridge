'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FiSend, FiSquare } from 'react-icons/fi'
import { Button } from '@/components/ui'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  onStop?: () => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({
  onSend,
  isLoading,
  onStop,
  placeholder = "Type a message...",
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
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
    <motion.form
      onSubmit={handleSubmit}
      className={`relative mx-auto flex w-full max-w-[52rem] items-end gap-2 rounded-[1.4rem] border bg-[linear-gradient(180deg,var(--color-surface)_0%,color-mix(in_srgb,var(--color-surface-warm),white_36%)_100%)] px-2 pb-7 pt-2 transition-all duration-300 ${
        isFocused 
          ? 'border-[var(--color-primary)]/45 ring-2 ring-[var(--color-primary)]/10 shadow-[0_20px_40px_rgba(45,41,38,0.1)]' 
          : 'border-[var(--color-border)] shadow-[0_14px_30px_rgba(45,41,38,0.07)] hover:border-[var(--color-border-strong)]'
      }`}
    >
      <div className="relative z-10 flex flex-1 items-center px-3">
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
                className="h-10 w-10 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] text-[var(--color-danger)] transition-colors duration-200 hover:bg-[var(--color-danger-soft)]"
                aria-label="Stop generating"
              >
                <FiSquare className="h-4 w-4" />
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
                className={`h-10 w-10 rounded-full border transition-all duration-200 ease-out ${
                  input.trim() 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_12px_22px_rgba(244,125,75,0.24)] hover:bg-[var(--color-primary-dark)]' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text-muted)]'
                }`}
                aria-label="Send message"
              >
                <FiSend className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-1 flex items-center justify-between px-2 text-[11px] font-medium tracking-[0.02em] text-[var(--color-text-muted)]">
        <span>Press Enter to send</span>
        <span>Shift + Enter for a new line</span>
      </div>
    </motion.form>
  )
}
