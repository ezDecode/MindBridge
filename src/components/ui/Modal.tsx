'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
}

import { Text } from "./Text";

export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  // Prevent scroll when modal is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-lg bg-surface shadow-2xl border border-white/10",
              sizes[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02]">
                <Text as="h2" variant="body" weight="semibold" className="text-white tracking-tight">{title}</Text>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-text-dim hover:text-white transition-all active:scale-[0.92] hover:bg-white/10 border border-white/5"
                >
                  <Icon icon="tabler:x" className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="max-h-[85vh] overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
