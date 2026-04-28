'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react'
import { Text } from '@/components/ui'

interface BookingSuccessCardProps {
  counselorName: string
  slotTime: string
  slotStart?: string
  slotEnd?: string
}

export function BookingSuccessCard({
  counselorName,
  slotTime,
  slotStart,
  slotEnd,
}: BookingSuccessCardProps) {

  const handleAddToCalendar = () => {
    if (!slotStart || !slotEnd) return;
    
    // Create ICS file content
    const startDate = new Date(slotStart).toISOString().replace(/-|:|\.\d+/g, '')
    const endDate = new Date(slotEnd).toISOString().replace(/-|:|\.\d+/g, '')
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:MindBridge Counseling Session
DESCRIPTION:Session with ${counselorName}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'mindbridge-session.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 mb-1 w-full"
    >
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success)]/10 p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--status-success)]/20 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--status-success)] text-white shadow-md shadow-[var(--status-success)]/20">
            <Icon icon="tabler:check" className="size-6" />
          </div>
          <div>
            <Text variant="subtitle" weight="bold" className="text-[var(--text-primary)] mb-0.5">
              Session Confirmed
            </Text>
            <Text variant="small" className="text-[var(--text-secondary)]">
              Your appointment with {counselorName} is set for {slotTime}.
            </Text>
          </div>
        </div>

        {slotStart && slotEnd && (
          <div className="flex justify-end gap-2 mt-2 relative z-10">
            {onStartChat && (
              <button
                type="button"
                onClick={onStartChat}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--action-primary)] text-white hover:opacity-90 transition-opacity text-sm font-semibold"
              >
                <Icon icon="tabler:message-2" className="size-4" />
                Message Counselor
              </button>
            )}
            <button
              type="button"
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[var(--status-success)]/30 bg-white/5 text-[var(--text-primary)] hover:bg-[var(--status-success)]/20 transition-colors text-sm font-semibold"
            >
              <Icon icon="tabler:calendar-plus" className="size-4 text-[var(--status-success)]" />
              Add to Calendar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
