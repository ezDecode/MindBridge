'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react';
import { Text } from '@/components/ui'

interface BookingSuggestionProps {
 counselorName?: string
 slotTime?: string
 onConfirm: () => void
 onCancel: () => void
 isLoading?: boolean
}

export function BookingSuggestion({
 counselorName = 'Dr. Priya Sharma',
 slotTime = 'Thursday, 3:00 PM',
 onConfirm,
 onCancel,
 isLoading,
}: BookingSuggestionProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -4 }}
 transition={{ 
 duration: 0.24,
 ease: [0.16, 1, 0.3, 1]
 }}
 className="mt-2.5 mb-1"
 >
 <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--action-primary)]/20 bg-[var(--action-primary)]/5 p-2 pr-3.5 shadow-sm">
 <div className="flex h-10 items-center gap-2.5 rounded-full bg-[var(--surface-default)] px-3.5 py-1.5 shadow-sm">
 <Icon icon="tabler:calendar" className="h-4 w-4 text-[var(--action-primary)]" />
 <Text as="span" variant="small" weight="bold" className="whitespace-nowrap text-[var(--text-primary)]">
 Slot with {counselorName} • {slotTime}
 </Text>
 </div>

 <div className="flex items-center gap-1.5 ml-auto">
 <button
 type="button"
 onClick={onConfirm}
 disabled={isLoading}
 className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--action-primary)] px-4 py-2 text-xs font-bold text-[var(--text-inverse)] transition-all hover:bg-[var(--action-primary-hover)] disabled:opacity-50"
 >
 <Icon icon="tabler:circle-check" className="h-3.5 w-3.5" />
 Confirm
 </button>
 <button
 type="button"
 onClick={onCancel}
 disabled={isLoading}
 className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] px-3 text-xs font-bold text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-warm)] disabled:opacity-50"
 >
 Not now
 </button>
 </div>
 </div>
 </motion.div>
 )
}

interface ResourceSuggestionProps {
 resourceType?: string
 onShow: () => void
 onDismiss: () => void
}

export function ResourceSuggestion({
 resourceType = 'a 5-minute breathing exercise',
 onShow,
 onDismiss,
}: ResourceSuggestionProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -4 }}
 transition={{ 
 duration: 0.24,
 ease: [0.16, 1, 0.3, 1]
 }}
 className="mt-2.5 mb-1"
 >
 <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--status-success)]/20 bg-[var(--status-success)]/5 p-2 pr-3.5 shadow-sm">
 <div className="flex h-10 items-center gap-2.5 rounded-full bg-[var(--surface-default)] px-3.5 py-1.5 shadow-sm">
 <Icon icon="tabler:book" className="h-4 w-4 text-[var(--status-success)]" />
 <Text as="span" variant="small" weight="bold" className="whitespace-nowrap text-[var(--text-primary)]">
 Suggested: {resourceType}
 </Text>
 </div>

 <div className="flex items-center gap-1.5 ml-auto">
 <button
 type="button"
 onClick={onShow}
 className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--status-success)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--status-success-dark)] "
 >
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5" />
 Show me
 </button>
 <button
 type="button"
 onClick={onDismiss}
 className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--surface-default)] px-3 text-xs font-bold text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-warm)] "
 >
 Maybe later
 </button>
 </div>
 </div>
 </motion.div>
 )
}

