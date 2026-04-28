'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Icon } from '@iconify/react'
import { Text, Modal, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface SlotOption {
  id: string
  counselorName: string
  slotTime: string
  slotStart: string
  slotEnd: string
  specializations?: string[]
  rating?: number
  reviews?: Array<{
    id: string
    author: string
    rating: number
    comment: string
    date: string
  }>
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
  const [selectedProfile, setSelectedProfile] = useState<SlotOption | null>(null)

  return (
    <>
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
          
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
            {slots.map((slot) => (
              <div 
                key={slot.id} 
                className="flex-shrink-0 w-64 snap-start rounded-lg border border-[var(--border-default)] bg-[var(--surface-default)] p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="tabler:calendar-time" className="h-4 w-4 text-[var(--action-primary)]" />
                    <Text variant="small" weight="bold" className="text-[var(--text-primary)] truncate max-w-[120px]">
                      {slot.counselorName}
                    </Text>
                  </div>
                  {slot.rating && (
                    <div className="flex items-center gap-1 bg-warning/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-warning">
                      <Icon icon="tabler:star-filled" className="h-2.5 w-2.5" />
                      {slot.rating}
                    </div>
                  )}
                </div>
                
                <Text variant="caption" className="block text-[var(--text-secondary)] mb-4 h-8">
                  {slot.slotTime}
                </Text>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1.5 h-9 rounded-md bg-[var(--action-primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Book Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(slot)}
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md bg-white/5 text-[var(--text-secondary)] font-medium text-xs hover:bg-white/10 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
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

      <Modal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title="Counselor Profile"
        size="md"
      >
        {selectedProfile && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[var(--action-primary)]/10 flex items-center justify-center text-[var(--action-primary)] border border-[var(--action-primary)]/20">
                  <Icon icon="tabler:user" className="h-8 w-8" />
                </div>
                <div>
                  <Text variant="h3" className="text-white">{selectedProfile.counselorName}</Text>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-warning">
                      <Icon icon="tabler:star-filled" className="h-3.5 w-3.5" />
                      <Text variant="small" weight="bold" className="text-warning">
                        {selectedProfile.rating || '5.0'}
                      </Text>
                    </div>
                    <Text variant="caption" className="text-[var(--text-dim)]">
                      ({selectedProfile.reviews?.length || 0} reviews)
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Text variant="small" weight="bold" className="text-white uppercase tracking-wider">Specializations</Text>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.specializations?.map((spec, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs text-[var(--text-secondary)] font-medium">
                    {spec}
                  </span>
                )) || <Text variant="caption" color="muted">General Counseling</Text>}
              </div>
            </div>

            <div className="space-y-4">
              <Text variant="small" weight="bold" className="text-white uppercase tracking-wider">Patient Reviews</Text>
              <div className="space-y-4">
                {selectedProfile.reviews?.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Text variant="caption" weight="bold" className="text-white">{review.author}</Text>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon 
                            key={i} 
                            icon="tabler:star-filled" 
                            className={cn(
                              "h-3 w-3",
                              i < review.rating ? "text-warning" : "text-white/10"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    <Text variant="small" className="text-[var(--text-secondary)] italic leading-relaxed">
                      &quot;{review.comment}&quot;
                    </Text>
                    <Text variant="caption" className="text-[var(--text-dim)] block pt-1" suppressHydrationWarning>
                      {new Date(review.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </Text>
                  </div>
                )) || (
                  <div className="py-4 text-center border border-dashed border-white/10 rounded-lg">
                    <Text variant="caption" color="muted">No reviews yet</Text>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
              <Button variant="ghost" onClick={() => setSelectedProfile(null)}>Close</Button>
              <Button onClick={() => {
                onSelectSlot(selectedProfile)
                setSelectedProfile(null)
              }}>
                Book Session
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
