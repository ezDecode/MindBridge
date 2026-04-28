'use client'

import { useState, useMemo } from 'react'
import { Card, Text, Button, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

type Counselor = { 
  id: string; 
  name: string | null;
  specializations?: string[];
  rating?: number;
  reviews?: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}
type Slot = { 
  id: string
  counselor_id: string
  slot_start: string
  slot_end: string
  available: boolean | null
  profiles: { name: string | null } | { name: string | null }[] | null
}

interface Booking {
  id: string;
  status: string;
  slot_start: string;
  type: string;
}

export default function BookCounselorClient({ initialCounselors, initialSlots }: { initialCounselors: Counselor[], initialSlots: Slot[] }) {
  const DEFAULT_ID = "87a24859-7892-49f8-b26d-c2878fe09f43" // Dr. Radha Sharma
  const { showToast } = useToast()
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(() => {
    return initialCounselors.find(c => c.id === DEFAULT_ID) ? DEFAULT_ID : (initialCounselors[0]?.id || null)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null)
  const [, setCheckingExisting] = useState(true)
  const [profileToShow, setProfileToShow] = useState<Counselor | null>(null)
  const [isClient, setIsClient] = useState(false)

  useState(() => {
    setIsClient(true)
  })

  // Check for existing upcoming bookings on mount
  useState(() => {
    const checkBookings = async () => {
      try {
        const res = await fetch('/api/bookings')
        if (res.ok) {
          const bookings = await res.json()
          const active = (bookings as Booking[]).find((b) => 
            (b.status === 'pending_confirmation' || b.status === 'confirmed') && 
            new Date(b.slot_start) > new Date() &&
            b.type !== 'crisis'
          )
          if (active) setExistingBooking(active)
        }
      } catch (err) {
        console.error('Failed to check existing bookings:', err)
      } finally {
        setCheckingExisting(false)
      }
    }
    checkBookings()
  })

  // Group slots by counselor
  const slotsByCounselor = useMemo(() => {
    const counselorId = selectedCounselor
    if (!counselorId) return []
    return initialSlots.filter(s => s.counselor_id === counselorId)
  }, [initialSlots, selectedCounselor])

  // Get unique dates for the selected counselor
  const availableDates = useMemo(() => {
    const dates = slotsByCounselor.map(s => new Date(s.slot_start).toISOString().split('T')[0])
    return Array.from(new Set(dates)).sort()
  }, [slotsByCounselor])

  // Select first available date by default
  if (!selectedDate && availableDates.length > 0) {
    setSelectedDate(availableDates[0])
  }

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return []
    return slotsByCounselor.filter(s => s.slot_start.startsWith(selectedDate))
  }, [slotsByCounselor, selectedDate])

  const handleBook = async () => {
    if (!selectedSlot || existingBooking) return
    setIsBooking(true)
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          counselorId: selectedSlot.counselor_id,
          type: 'named', // Changed to 'named' as per schema
          slotStart: selectedSlot.slot_start,
          slotEnd: selectedSlot.slot_end,
          note: ''
        })
      })

      if (res.ok) {
        showToast('Session booked successfully!', 'success')
        setSelectedSlot(null)
        // Refresh existing booking state
        const bookingsRes = await fetch('/api/bookings')
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json()
          const active = (bookings as Booking[]).find((b) => 
            (b.status === 'pending_confirmation' || b.status === 'confirmed') && 
            new Date(b.slot_start) > new Date() &&
            b.type !== 'crisis'
          )
          setExistingBooking(active || null)
        }
      } else {
        const data = await res.json()
        if (res.status === 409 && data.code === 'REDUNDANT_BOOKING') {
          showToast(data.error, 'error')
          setExistingBooking(data.existingBooking)
        } else {
          showToast(data.error || 'Failed to book session', 'error')
        }
      }
    } catch {
      showToast('Error booking session', 'error')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="mb-4 md:mb-0">
          <Text as="h2" variant="h2" weight="semibold" className="text-white tracking-tight">Book a Session</Text>
          <Text variant="small" className="text-text-dim font-medium mt-1">Schedule time with a counselor</Text>
        </div>
        
        {existingBooking && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 animate-in fade-in slide-in-from-top-2">
            <Icon icon="tabler:alert-triangle" className="text-xl shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Active Booking:</span> You have a session on{' '}
              <span className="font-bold">
                {new Date(existingBooking.slot_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8", existingBooking && "opacity-75 grayscale-[0.5] pointer-events-none")}>
        {/* Counselors Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Text variant="small" weight="medium" className="text-text-muted ">Select Professional</Text>
          <div className="space-y-3">
            {initialCounselors.map(c => (
              <button
                key={c.id}
                disabled={!!existingBooking}
                onClick={() => { setSelectedCounselor(c.id); setSelectedDate(null); setSelectedSlot(null); }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                  (selectedCounselor === c.id || (!selectedCounselor && c.id === initialCounselors[0]?.id))
                    ? "bg-surface-raised border-primary shadow-[0_0_0_1px_rgba(99,102,241,0.5)]"
                    : "bg-surface border-border hover:border-white/20 hover:bg-surface-hover",
                  existingBooking && "cursor-not-allowed"
                )}
              >
                <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                  {(c.name || 'C').split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Text weight="semibold" className="text-[1.0625rem] text-white group-hover:text-primary transition-colors truncate">{c.name || 'Counselor'}</Text>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileToShow(c);
                      }}
                      className="size-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-dim hover:text-white transition-all shrink-0"
                    >
                      <Icon icon="tabler:info-circle" className="text-sm" />
                    </button>
                  </div>
                  <Text variant="small" className="text-text-dim text-base mt-1">Therapist</Text>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar & Slots */}
        <div className="lg:col-span-8">
          <Card padding="lg" className="bg-surface border-border shadow-premium relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Text variant="small" weight="medium" className="text-text-muted">Select Date & Time</Text>
              {existingBooking && (
                <div className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                  LIMIT: 1 ACTIVE SESSION
                </div>
              )}
            </div>
            
            {availableDates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-dim">
                <Icon icon="tabler:calendar-cancel" className="text-2xl mb-4 opacity-50" />
                <p className="text-[1.0625rem]">No availability for this professional.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8 flex-1">
                {/* Date Picker (Horizontal Scroll) */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {availableDates.map(dateStr => {
                    const d = new Date(dateStr)
                    const isSelected = selectedDate === dateStr
                    return (
                      <button
                        key={dateStr}
                        disabled={!!existingBooking}
                        onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border min-w-[72px] transition-all",
                          isSelected
                            ? "bg-primary/20 border-primary shadow-sm"
                            : "bg-surface-raised border-border hover:border-white/20 hover:bg-surface-hover",
                          existingBooking && "cursor-not-allowed"
                        )}
                      >
                        <span className={cn("text-base font-medium mb-1", isSelected ? "text-primary" : "text-text-muted")}>
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={cn("text-xl font-bold leading-none", isSelected ? "text-white" : "text-white/80")}>
                          {d.getDate()}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Time Slots Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slotsForDate.map(slot => {
                      const d = new Date(slot.slot_start)
                      const isSelected = selectedSlot?.id === slot.id
                      return (
                        <button
                          key={slot.id}
                          disabled={!!existingBooking}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "py-3 px-2 rounded-md border transition-all text-[1.0625rem] font-semibold tabular-nums text-center",
                            isSelected
                              ? "bg-white text-black border-white shadow-md scale-[1.02]"
                              : "bg-surface-raised border-border text-white/90 hover:border-white/30 hover:bg-surface-hover",
                            existingBooking && "cursor-not-allowed"
                          )}
                        >
                          {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div>
                    {selectedSlot ? (
                      <div className="text-[1.0625rem]">
                        <span className="text-text-muted">Selected: </span>
                        <span className="text-white font-bold">
                          {new Date(selectedSlot.slot_start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[1.0625rem] text-text-dim">
                        {existingBooking ? 'Please complete your existing session first' : 'Select a time to continue'}
                      </span>
                    )}
                  </div>
                  <Button 
                    size="lg" 
                    disabled={!selectedSlot || isBooking || !!existingBooking} 
                    onClick={handleBook}
                    className="min-w-[140px]"
                  >
                    {isBooking ? 'Confirming...' : existingBooking ? 'Locked' : 'Confirm'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ProfileModal 
        profile={profileToShow}
        isOpen={!!profileToShow}
        onClose={() => setProfileToShow(null)}
        isClient={isClient}
        onSelect={(id) => {
          setSelectedCounselor(id);
          setSelectedDate(null);
          setSelectedSlot(null);
        }}
      />
    </div>
  )
}

function ProfileModal({ profile, isOpen, onClose, isClient, onSelect }: { profile: Counselor | null, isOpen: boolean, onClose: () => void, isClient: boolean, onSelect: (id: string) => void }) {
  if (!profile) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Counselor Profile"
      size="md"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-bold text-xl">
              {(profile.name || 'C').split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <Text variant="h3" className="text-white">{profile.name}</Text>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-warning">
                  <Icon icon="tabler:star-filled" className="h-3.5 w-3.5" />
                  <Text variant="small" weight="bold" className="text-warning">
                    {profile.rating || '4.8'}
                  </Text>
                </div>
                <Text variant="caption" className="text-text-dim">
                  ({profile.reviews?.length || 12} reviews)
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Text variant="small" weight="bold" className="text-white uppercase tracking-wider">Specializations</Text>
          <div className="flex flex-wrap gap-2">
            {(profile.specializations || ['Anxiety', 'Depression', 'Academic Stress', 'CBT']).map((spec, i) => (
              <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs text-text-secondary font-medium">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Text variant="small" weight="bold" className="text-white uppercase tracking-wider">Patient Reviews</Text>
          <div className="space-y-4">
            {(profile.reviews || [
              { id: '1', author: 'Anonymous Student', rating: 5, comment: "Really helped me manage my workload and anxiety during exams.", date: '2024-03-10' },
              { id: '2', author: 'Anonymous Student', rating: 4, comment: "Great listener and provided practical coping strategies.", date: '2024-02-25' }
            ]).map((review) => (
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
                <Text variant="small" className="text-text-secondary italic leading-relaxed">
                  &quot;{review.comment}&quot;
                </Text>
                <Text variant="caption" className="text-text-dim block pt-1">
                  {isClient && new Date(review.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={() => {
            onSelect(profile.id);
            onClose();
          }}>
            Select Counselor
          </Button>
        </div>
      </div>
    </Modal>
  );
}
