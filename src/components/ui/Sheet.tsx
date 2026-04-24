'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
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

import { Text } from "./Text";

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
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={variants[side].initial}
            animate={variants[side].animate}
            exit={variants[side].exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "relative ml-auto flex h-full w-full max-w-2xl flex-col bg-surface shadow-2xl border-l border-white/10",
              className
            )}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              {title ? (
                <Text as="h2" variant="h4" weight="semibold" className="text-white tracking-tight">{title}</Text>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-text-dim hover:text-white transition-all active:scale-[0.92] hover:bg-white/10 border border-white/5"
              >
                <Icon icon="tabler:x" className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
