'use client'

import { motion } from 'motion/react'
import { FiCalendar, FiBook, FiX, FiCheck } from 'react-icons/fi'
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      <Card
        variant="elevated"
        padding="md"
        className="rounded-[calc(var(--radius-xl)*var(--brm))] squircle border-2 border-[var(--color-primary)]/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
            <FiCalendar className="h-5 w-5 text-[var(--color-primary)]" />
          </div>

          <div className="flex-1">
            <Text as="p" variant="h6" weight="bold">
              Booking Suggestion
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-1">
              I found a slot with <strong>{counselorName}</strong> — {slotTime}
            </Text>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="warm"
                size="sm"
                onClick={onConfirm}
                disabled={isLoading}
              >
                <FiCheck className="h-4 w-4" />
                Yes, confirm it
              </Button>
              <Button
                variant="warm"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                <FiX className="h-4 w-4" />
                Not right now
              </Button>
            </div>
          </div>
        </div>
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      <Card
        variant="elevated"
        padding="md"
        className="rounded-[calc(var(--radius-xl)*var(--brm))] squircle border-2 border-[var(--color-success)]/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/10">
            <FiBook className="h-5 w-5 text-[var(--color-success)]" />
          </div>

          <div className="flex-1">
            <Text as="p" variant="h6" weight="bold">
              Resource Available
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-1">
              Want me to pull up {resourceType}?
            </Text>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="warm" size="sm" onClick={onShow}>
                <FiCheck className="h-4 w-4" />
                Show me
              </Button>
              <Button variant="warm" size="sm" onClick={onDismiss}>
                <FiX className="h-4 w-4" />
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
