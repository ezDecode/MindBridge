'use client'

import { motion } from 'motion/react'
import { FiCalendar, FiBook, FiX, FiCheck, FiArrowRight } from 'react-icons/fi'
import { Button, Card, Text } from '@/components/ui'

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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className="overflow-hidden mt-2 mb-1 px-4"
    >
      <Card
        variant="elevated"
        padding="md"
        className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 shadow-sm"
      >
        <motion.div 
          className="flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]/20 text-[var(--color-primary)]">
            <FiCalendar className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <Text as="p" variant="label" weight="bold" color="brand">
              Session Available
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-0.5 text-sm">
              Found a slot with <span className="font-semibold text-[var(--color-text-primary)]">{counselorName}</span> — {slotTime}
            </Text>

            <motion.div 
              className="mt-3 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                variant="warm"
                size="sm"
                onClick={onConfirm}
                disabled={isLoading}
                className="gap-1.5 rounded-md"
              >
                <FiCheck className="h-4 w-4" />
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-md text-[var(--color-text-muted)]"
              >
                <FiX className="h-4 w-4" />
                Not now
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Card>
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
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className="overflow-hidden mt-2 mb-1 px-4"
    >
      <Card
        variant="elevated"
        padding="md"
        className="rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 shadow-sm"
      >
        <motion.div 
          className="flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-success-soft)] to-[var(--color-success)]/20 text-[var(--color-success)]">
            <FiBook className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <Text as="p" variant="label" weight="bold" color="success">
              Resource Found
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-0.5 text-sm">
              Want me to show {resourceType}?
            </Text>

            <motion.div 
              className="mt-3 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                variant="warm"
                size="sm"
                onClick={onShow}
                className="gap-1.5 rounded-md"
              >
                <FiArrowRight className="h-4 w-4" />
                Show me
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="rounded-md text-[var(--color-text-muted)]"
              >
                <FiX className="h-4 w-4" />
                Maybe later
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  )
}
