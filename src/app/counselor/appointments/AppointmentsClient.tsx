'use client'

import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { resolveProfileDisplayName } from '@/lib/profile-name'

type Booking = { 
  id: string
  slot_start: string
  slot_end: string
  status: string
  type: string
  profiles: { id: string, name: string | null, institution: string | null } | null
}

export default function AppointmentsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const { showToast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [filter, setFilter] = useState<'upcoming' | 'pending' | 'past'>('upcoming')

  const filteredBookings = useMemo(() => {
    const now = new Date().getTime()
    return bookings.filter(b => {
      const isPast = new Date(b.slot_start).getTime() < now
      if (filter === 'past') return isPast
      if (filter === 'pending') return !isPast && b.status === 'pending_confirmation'
      if (filter === 'upcoming') return !isPast && b.status === 'confirmed'
      return true
    })
  }, [bookings, filter])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // In demo we might just want to update UI optimistically since we might not have the correct RLS for update
      const res = await fetch(`/api/bookings/${id}/${newStatus === 'confirmed' ? 'confirm' : 'cancel'}`, {
        method: 'POST'
      })
      if (res.ok) {
        showToast(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'}`, 'success')
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
      } else {
        showToast('Action failed', 'error')
      }
    } catch (err) {
      showToast('Action failed', 'error')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Text as="h2" variant="h2" weight="semibold" className="text-white tracking-tight">Appointments</Text>
          <Text variant="small" className="text-text-dim font-medium mt-1">Manage your sessions</Text>
        </div>
        
        <div className="flex p-1 bg-surface-raised rounded-lg border border-border">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'pending', label: 'Pending' },
            { id: 'past', label: 'Past' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={cn(
                "px-4 py-1.5 rounded-md text-base font-medium transition-all",
                filter === t.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-text-muted hover:text-white hover:bg-white/5"
              )}
            >
              {t.label}
              {t.id === 'pending' && bookings.some(b => b.status === 'pending_confirmation' && new Date(b.slot_start).getTime() > Date.now()) && (
                <span className="ml-2 inline-flex size-1.5 rounded-full bg-warning" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-dim border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            <Icon icon="tabler:calendar-cancel" className="text-2xl mb-4 opacity-50" />
            <Text>No appointments found.</Text>
          </div>
        ) : (
          filteredBookings.map(booking => {
            const studentName = booking.type === 'anonymous' ? 'Anonymous Student' : (resolveProfileDisplayName({ profileName: booking.profiles?.name }) || 'Student')
            const date = new Date(booking.slot_start)
            
            return (
              <Card key={booking.id} padding="lg" className="bg-surface hover:border-white/20 transition-all flex flex-col md:flex-row items-center gap-6 group">
                <div className="flex flex-col items-center justify-center size-16 rounded bg-surface-raised border border-border shadow-sm shrink-0 group-hover:bg-surface-hover transition-colors">
                  <span className="text-base font-medium text-text-muted">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-xl font-bold text-white leading-tight tabular-nums">{date.getDate()}</span>
                  <span className="text-base font-medium text-text-dim ">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <Text weight="semibold" className="text-white text-base">{studentName}</Text>
                    {booking.type === 'crisis' && <span className="badge bg-danger/10 text-danger border-danger/20 text-base">CRISIS</span>}
                    {booking.type === 'anonymous' && <span className="badge badge-outline text-base">ANON</span>}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-base font-medium text-text-dim tabular-nums">
                    <span className="flex items-center gap-1.5">
                      <Icon icon="tabler:clock" className="text-primary text-base" /> 
                      {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon icon="tabler:video" className="text-secondary text-base" /> Online
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon icon="tabler:school" className="text-warning text-base" /> {booking.profiles?.institution || 'Campus'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <span className={cn(
                    "badge text-base w-full sm:w-auto text-center justify-center",
                    booking.status === 'confirmed' ? "bg-success/10 text-success border-success/20" :
                    booking.status === 'pending_confirmation' ? "bg-warning/10 text-warning border-warning/20" :
                    "bg-white/5 text-text-dim border-white/10"
                  )}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  
                  {filter === 'pending' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button size="sm" onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="flex-1 sm:flex-none">Confirm</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="flex-1 sm:flex-none border border-white/10">Decline</Button>
                    </div>
                  )}
                  {filter === 'upcoming' && (
                    <Button size="sm" className="w-full sm:w-auto bg-white text-black hover:bg-white/90">Join Call</Button>
                  )}
                  {filter === 'past' && (
                    <Button size="sm" variant="ghost" className="w-full sm:w-auto border border-white/10" href={`/counselor/notes?booking=${booking.id}`}>
                      View Notes
                    </Button>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
