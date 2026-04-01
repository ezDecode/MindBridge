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
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ 
        duration: 0.4, 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      style={{ overflow: 'hidden' }}
    >
      <Card
        variant="elevated"
        padding="md"
        className="rounded-[calc(var(--radius-xl)*var(--brm))] squircle border-2 border-[var(--color-primary)]/20"
      >
        <motion.div 
          className="flex items-start gap-4"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.div 
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
          >
            <FiCalendar className="h-5 w-5 text-[var(--color-primary)]" />
          </motion.div>

          <div className="flex-1">
            <Text as="p" variant="h6" weight="bold">
              Booking Suggestion
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-1">
              I found a slot with <strong>{counselorName}</strong> — {slotTime}
            </Text>

            <motion.div 
              className="mt-4 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="warm"
                  size="sm"
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  <FiCheck className="h-4 w-4" />
                  Yes, confirm it
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="warm"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  <FiX className="h-4 w-4" />
                  Not right now
                </Button>
              </motion.div>
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
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ 
        duration: 0.4, 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      style={{ overflow: 'hidden' }}
    >
      <Card
        variant="elevated"
        padding="md"
        className="rounded-[calc(var(--radius-xl)*var(--brm))] squircle border-2 border-[var(--color-success)]/20"
      >
        <motion.div 
          className="flex items-start gap-4"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.div 
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
          >
            <FiBook className="h-5 w-5 text-[var(--color-success)]" />
          </motion.div>

          <div className="flex-1">
            <Text as="p" variant="h6" weight="bold">
              Resource Available
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-1">
              Want me to pull up {resourceType}?
            </Text>

            <motion.div 
              className="mt-4 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="warm" size="sm" onClick={onShow}>
                  <FiCheck className="h-4 w-4" />
                  Show me
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="warm" size="sm" onClick={onDismiss}>
                  <FiX className="h-4 w-4" />
                  Maybe later
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  )
}
