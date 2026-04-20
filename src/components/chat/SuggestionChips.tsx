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
 transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
 className={`flex flex-wrap gap-2 ${className}`}
 >
 {suggestions.map((suggestion, index) => (
 <motion.button
 key={`${suggestion}-${index}`}
 type="button"
 initial={{ opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ 
 duration: 0.15, 
 delay: index * 0.03,
 ease: [0.16, 1, 0.3, 1] 
 }}
 
 
 onClick={() => onSelect(suggestion)}
 className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm transition-all duration-150 hover:bg-white hover:text-[var(--color-text-primary)] hover:shadow-md"
 >
 <Icon icon="tabler:message-circle" className="h-3.5 w-3.5 text-[var(--color-primary)]" />
 <span>{suggestion}</span>
 </motion.button>
 ))}
 </motion.div>
 )
}

