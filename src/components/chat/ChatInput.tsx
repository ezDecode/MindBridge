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
      className={`relative flex items-end gap-2 rounded-[2rem] border bg-[var(--color-surface)]/80 backdrop-blur-md p-1.5 transition-all duration-300 mx-auto w-full max-w-3xl ${
        isFocused 
          ? 'border-[var(--color-primary)]/50 ring-4 ring-[var(--color-primary)]/10 shadow-lg' 
          : 'border-[var(--color-border)] shadow-md hover:shadow-lg hover:border-[var(--color-border-strong)]'
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
          className="max-h-[150px] min-h-[44px] w-full flex-1 resize-none bg-transparent py-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
          aria-label="Message input"
        />
      </div>

      <div className="relative z-10 flex items-center gap-1.5 shrink-0 pr-1 pb-1">
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
                className="h-10 w-10 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors duration-200"
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
                className={`h-10 w-10 rounded-full transition-all duration-200 ease-out ${
                  input.trim() 
                    ? 'bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-dark)] hover:shadow-md' 
                    : 'bg-[var(--color-surface-strong)] text-[var(--color-text-muted)]'
                }`}
                aria-label="Send message"
              >
                <FiSend className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  )
}
