'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react';

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  className?: string
}

export function SuggestionChips({
  suggestions,
  onSelect,
  className = '',
}: SuggestionChipsProps) {
  if (!suggestions.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={`${suggestion}-${index}`}
          type="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.2, 
            delay: index * 0.05,
            ease: [0.16, 1, 0.3, 1] 
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(suggestion)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/10 active:scale-[0.96]"
        >
          <Icon icon="tabler:message-circle" className="h-4 w-4 text-primary/80" />
          <span>{suggestion}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}

