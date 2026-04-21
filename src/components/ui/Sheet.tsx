'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  side?: 'right' | 'left'
}

export function Sheet({ isOpen, onClose, title, children, className, side = 'right' }: SheetProps) {
  // Prevent scroll when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const variants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />
          <motion.div
            initial={variants[side].initial}
            animate={variants[side].animate}
            exit={variants[side].exit}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "relative ml-auto flex h-full w-full max-w-2xl flex-col bg-[var(--surface-default)] shadow-2xl border-l border-[var(--border-default)] sm:rounded-l-[3rem]",
              className
            )}
          >
            <div className="flex items-center justify-between px-8 py-8">
              {title ? (
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icon icon="tabler:x" className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-12">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
