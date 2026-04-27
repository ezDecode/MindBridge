'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react'
import { Text } from '@/components/ui'

interface SlotOption {
  id: string
  counselorName: string
  slotTime: string
  slotStart: string
  slotEnd: string
}

interface SlotCarouselProps {
  slots: SlotOption[]
  onSelectSlot: (slot: SlotOption) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SlotCarousel({
  slots,
  onSelectSlot,
  onCancel,
  isLoading,
}: SlotCarouselProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="mt-3 mb-1 w-full"
    >
      <div className="flex flex-col gap-2 rounded-md border border-[var(--action-primary)]/20 bg-[var(--action-primary)]/5 p-3 shadow-sm">
        <Text variant="small" weight="semibold" className="text-[var(--text-primary)] mb-1">
          Available upcoming sessions:
        </Text>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
          {slots.map((slot) => (
            <div 
              key={slot.id} 
              className="flex-shrink-0 w-64 snap-start rounded-lg border border-[var(--border-default)] bg-[var(--surface-default)] p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="tabler:calendar-time" className="h-4 w-4 text-[var(--action-primary)]" />
                <Text variant="small" weight="bold" className="text-[var(--text-primary)] truncate">
                  {slot.counselorName}
                </Text>
              </div>
              <Text variant="caption" className="block text-[var(--text-secondary)] mb-3 h-8">
                {slot.slotTime}
              </Text>
              <button
                type="button"
                onClick={() => onSelectSlot(slot)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md bg-[var(--action-primary)]/10 text-[var(--action-primary)] font-bold text-sm hover:bg-[var(--action-primary)]/20 transition-colors disabled:opacity-50"
              >
                Choose Slot
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="self-end mt-1 inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
        >
          Not now
        </button>
      </div>
    </motion.div>
  )
}
