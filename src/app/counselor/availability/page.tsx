'use client'

import { useState, useEffect } from 'react'
import { Icon } from "@iconify/react"
import { Button, Text, Card } from "@/components/ui"
import { useToast } from "@/components/ui/Toast"

export default function CounselorAvailabilityPage() {
  const { showToast } = useToast()
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/counselor/slots')
      if (res.ok) {
        const data = await res.json()
        setSlots(data.slots || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const handleAddSlot = async () => {
    if (!newDate || !newTime) return

    const start = new Date(`${newDate}T${newTime}`)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour

    try {
      const res = await fetch('/api/counselor/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slots: [{ start: start.toISOString(), end: end.toISOString() }]
        })
      })

      if (res.ok) {
        showToast("Slot added successfully", "success")
        fetchSlots()
      } else {
        showToast("Failed to add slot", "error")
      }
    } catch (err) {
      showToast("Error adding slot", "error")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <Text as="h2" variant="h3" weight="semibold">Manage Availability</Text>
        <p className="text-text-dim text-xs font-bold uppercase tracking-widest mt-1">Set your open hours</p>
      </div>

      <Card padding="lg" className="bg-surface border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Text variant="small" weight="bold" className="uppercase tracking-widest text-[10px] text-text-dim">Date</Text>
            <input 
              type="date" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="small" weight="bold" className="uppercase tracking-widest text-[10px] text-text-dim">Time</Text>
            <input 
              type="time" 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
            />
          </div>
          <Button onClick={handleAddSlot}>Add Slot</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((slot, i) => (
          <div key={slot.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <Text weight="semibold" className="text-sm">
                {new Date(slot.slot_start).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              <Text variant="small" className="text-text-dim tabular-nums">
                {new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </div>
            <span className={cn(
              "badge text-[9px] uppercase tracking-widest",
              slot.available ? "badge-primary" : "bg-white/5 text-text-dim border-white/10"
            )}>
              {slot.available ? "Available" : "Booked"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'
