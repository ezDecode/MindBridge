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
 transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
 className="mt-2.5 flex flex-wrap items-center gap-2.5"
 >
 <motion.button
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => onAction(action)}
 className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-dark)] hover:shadow-md"
 >
 <Icon icon={primaryIconName} className="h-4 w-4" />
 <span>{primaryLabel}</span>
 </motion.button>

 <motion.button
 type="button"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={onDismiss}
 className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-medium text-[var(--color-text-muted)] shadow-sm transition-all duration-150 hover:bg-white hover:text-[var(--color-text-secondary)]"
 >
 <span>Not now</span>
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5" />
 </motion.button>
 </motion.div>
 )
}

