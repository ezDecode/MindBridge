'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react';

interface MessageActionsProps {
  action: 'book_counselor' | 'show_resources' | 'send_crisis_alert' | null
  onAction: (action: 'book_counselor' | 'show_resources' | 'send_crisis_alert') => void
  onDismiss: () => void
}

export function MessageActions({
  action,
  onAction,
  onDismiss,
}: MessageActionsProps) {
  if (!action || action === 'send_crisis_alert') return null

  const primaryLabel = action === 'book_counselor' ? 'Book session' : 'View resources'
  const primaryIconName = action === 'book_counselor' ? 'tabler:calendar' : 'tabler:book'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mt-4 flex flex-wrap items-center gap-3"
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAction(action)}
        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.96]"
      >
        <Icon icon={primaryIconName} className="h-4.5 w-4.5" />
        <span>{primaryLabel}</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDismiss}
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.04] px-4 text-sm font-semibold text-text-dim transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
      >
        <span>Not now</span>
        <Icon icon="tabler:arrow-right" className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}

