'use client'

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react'
import { motion } from 'motion/react'
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

  // Auto-resize textarea
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
      // Reset textarea height
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
      animate={{
        boxShadow: isFocused 
          ? '0 0 0 2px var(--color-primary), 0 0 20px 0 rgba(var(--color-primary-rgb, 99 102 241) / 0.15)'
          : '0 0 0 1px var(--color-border), 0 0 0 0 transparent'
      }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-3 rounded-[calc(var(--radius-xl)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
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
        className="max-h-[150px] min-h-[44px] flex-1 resize-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:opacity-50"
        aria-label="Message input"
      />

      {isLoading ? (
        <Button
          type="button"
          variant="warm"
          size="sm"
          onClick={onStop}
          className="shrink-0"
          aria-label="Stop generating"
        >
          <FiSquare className="h-4 w-4" />
        </Button>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="submit"
            variant="warm"
            size="sm"
            disabled={!input.trim() || disabled}
            className="shrink-0"
            aria-label="Send message"
          >
            <FiSend className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.form>
  )
}
