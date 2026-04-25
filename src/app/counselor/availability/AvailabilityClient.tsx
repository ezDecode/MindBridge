'use client'

import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

type Slot = { id: string, slot_start: string, slot_end: string, available: boolean }
type Booking = { id: string, slot_id: string | null, status: string, type: string, profiles: { name: string | null } | null }

export default function AvailabilityClient({ counselorId, initialSlots, initialBookings }: { counselorId: string, initialSlots: Slot[], initialBookings: Booking[] }) {
  const { showToast } = useToast()
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [isAdding, setIsAdding] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')

  const handleAddSlot = async () => {
    if (!newDate || !newTime) return
    setIsAdding(true)

    const start = new Date(`${newDate}T${newTime}`)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    try {
      const res = await fetch('/api/counselor/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slots: [{ start: start.toISOString(), end: end.toISOString() }]
        })
      })

      if (res.ok) {
        showToast('Slot added successfully', 'success')
        // Optimistic UI update
        const newSlot: Slot = {
          id: Math.random().toString(), // fake ID until refresh
          slot_start: start.toISOString(),
          slot_end: end.toISOString(),
          available: true
        }
        setSlots(prev => [...prev, newSlot].sort((a,b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()))
      } else {
        showToast('Failed to add slot', 'error')
      }
    } catch (err) {
      showToast('Error adding slot', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  // Group slots by Date for calendar view
  const groupedSlots = useMemo(() => {
    const grouped: Record<string, { date: Date, slots: Slot[] }> = {}
    slots.forEach(slot => {
      const d = new Date(slot.slot_start)
      const dateKey = d.toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: d, slots: [] }
      }
      grouped[dateKey].slots.push(slot)
    })
    return Object.values(grouped).sort((a,b) => a.date.getTime() - b.date.getTime())
  }, [slots])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Text as="h2" variant="h2" weight="semibold" className="text-white tracking-tight">Availability</Text>
          <Text variant="small" className="text-text-dim font-medium mt-1">Manage your weekly schedule slots</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Add Slot Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="lg" className="bg-surface border-border shadow-premium sticky top-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Icon icon="tabler:clock-plus" className="text-xl" />
              </div>
              <div>
                <Text variant="h4" weight="semibold">New Availability</Text>
                <Text variant="small" className="text-text-dim text-[10px] font-medium">Create 1hr blocks</Text>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-2">Select Date</label>
                <input 
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted mb-2">Start Time</label>
                <input 
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <Button 
                onClick={handleAddSlot} 
                disabled={isAdding || !newDate || !newTime} 
                className="w-full mt-2" 
                size="lg"
              >
                {isAdding ? 'Adding...' : 'Add Slot to Calendar'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Schedule Grid View */}
        <div className="lg:col-span-8">
          {groupedSlots.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] text-text-dim">
              <Icon icon="tabler:calendar-cancel" className="text-4xl mb-4 opacity-50" />
              <Text>Your schedule is completely empty.</Text>
              <Text variant="small" className="mt-1">Add slots from the sidebar to accept bookings.</Text>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedSlots.map(({ date, slots }) => (
                <div key={date.toISOString()} className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl bg-surface border border-white/5 shadow-sm">
                  <div className="sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0 sm:pr-4 flex flex-col sm:items-end sm:text-right pt-1">
                    <Text variant="h4" weight="semibold" className="text-white leading-none mb-1">{date.getDate()}</Text>
                    <Text variant="small" className="text-text-muted text-xs font-medium ">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' })}</Text>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {slots.map(slot => {
                      const booking = initialBookings.find(b => b.slot_id === slot.id)
                      const isBooked = !slot.available || booking
                      
                      return (
                        <div 
                          key={slot.id}
                          className={cn(
                            "relative p-3 rounded-lg border text-left transition-all",
                            isBooked 
                              ? "bg-primary/10 border-primary/20" 
                              : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                          )}
                        >
                          <Text variant="small" weight="semibold" className={cn("text-xs mb-1 block", isBooked ? "text-primary" : "text-white")}>
                            {new Date(slot.slot_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                          {isBooked ? (
                            <>
                              <Text variant="small" className="text-[10px] font-medium text-text-dim block truncate">
                                {booking?.profiles?.name || 'Booked'}
                              </Text>
                              <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            </>
                          ) : (
                            <Text variant="small" className="text-[10px] font-medium text-text-dim block opacity-50">
                              Open
                            </Text>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
