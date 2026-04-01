'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageIntro } from "@/components/site"
import { Button, Card, SelectionCard, Stepper, Text, SkeletonText } from "@/components/ui"
import { bookingTypes as defaultBookingTypes } from "@/content/mindbridge"
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'

interface Counselor {
  id: string
  name: string
  institution?: string
}

interface Slot {
  id: string
  counselor_id: string
  slot_start: string
  slot_end: string
  available: boolean
  counselor: { name: string }
}

interface ExistingBooking {
  id: string
  slot_start: string
  slot_end: string
  status: string
  type: string
  counselor: { name: string }
}

type BookingType = 'anonymous' | 'named' | 'crisis'

export default function StudentBookPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Booking state
  const [step, setStep] = useState(1)
  const [bookingType, setBookingType] = useState<BookingType>('anonymous')
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([])
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch booking data
        try {
          const res = await fetch('/api/bookings')
          if (res.ok) {
            const data = await res.json()
            setCounselors(data.counselors || [])
            setSlots(data.slots || [])
            setExistingBookings(data.existingBookings || [])
          }
        } catch (err) {
          console.error('Failed to fetch booking data:', err)
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  // Group slots by counselor
  const slotsByCounselor = useMemo(() => {
    const grouped: Record<string, Slot[]> = {}
    slots.forEach(slot => {
      if (!grouped[slot.counselor_id]) {
        grouped[slot.counselor_id] = []
      }
      grouped[slot.counselor_id].push(slot)
    })
    return grouped
  }, [slots])

  // Filter slots for selected counselor
  const availableSlots = useMemo(() => {
    if (!selectedCounselor) return slots.slice(0, 8)
    return slotsByCounselor[selectedCounselor] || []
  }, [selectedCounselor, slots, slotsByCounselor])

  const formatSlotTime = useCallback((slot: Slot) => {
    const start = new Date(slot.slot_start)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = dayNames[start.getDay()]
    const time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${day} · ${time}`
  }, [])

  const handleSubmit = async () => {
    if (!selectedSlot || !user) return
    
    setSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          counselorId: selectedSlot.counselor_id,
          type: bookingType,
          slotStart: selectedSlot.slot_start,
          slotEnd: selectedSlot.slot_end,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create booking')
      }
      
      setSuccess(true)
      setTimeout(() => router.push('/student/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const currentStep = useMemo(() => {
    if (selectedSlot) return 3
    if (selectedCounselor || step >= 2) return 2
    return 1
  }, [selectedCounselor, selectedSlot, step])

  const canSubmit = selectedSlot && bookingType && user

  if (success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Text as="h2" variant="h3" className="mb-2">Booking Confirmed!</Text>
          <Text as="p" color="secondary">Redirecting to your dashboard...</Text>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <PageIntro
        eyebrow="Counselor booking"
        title="A booking flow that respects both urgency and privacy."
        description="Stay anonymous, share your name, or mark it urgent. Short and slot-based — never paperwork."
        actions={
          <>
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'Confirming...' : 'Confirm booking'}
            </Button>
            <Button href="/student/chat" variant="warm">
              Talk first
            </Button>
          </>
        }
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {existingBookings.length > 0 && (
        <Card variant="warm" padding="md" className="mb-4">
          <Text as="p" variant="small" weight="medium">Your upcoming sessions</Text>
          <div className="mt-2 space-y-2">
            {existingBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between text-span">
                <span>{booking.counselor?.name || 'Counselor'}</span>
                <span className="text-[var(--color-text-secondary)]">
                  {new Date(booking.slot_start).toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="grid gap-4">
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between">
              <Text as="p" variant="small" weight="medium">
                Step 1 · Booking type
              </Text>
              <Stepper totalSteps={3} currentStep={currentStep} />
            </div>
            <div className="mt-5 grid gap-3">
              {defaultBookingTypes.map((type) => (
                <SelectionCard
                  key={type.label}
                  selected={bookingType === (type.label.toLowerCase().split(' ')[0] as BookingType)}
                  label={type.label}
                  sublabel={type.note}
                  onClick={() => {
                    const typeKey = type.label.toLowerCase().split(' ')[0] as BookingType
                    setBookingType(typeKey)
                    setStep(Math.max(step, 2))
                  }}
                />
              ))}
            </div>
          </Card>

          <Card variant="subtle" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Step 2 · Choose a counselor
            </Text>
            <div className="mt-5 grid gap-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                      <SkeletonText lines={2} />
                    </div>
                  ))}
                </div>
              ) : counselors.length > 0 ? (
                counselors.map((counselor) => (
                  <motion.button
                    key={counselor.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCounselor(counselor.id)
                      setSelectedSlot(null)
                    }}
                    className={`rounded-[calc(var(--radius-lg)*var(--brm))] squircle border p-4 text-left transition-colors ${
                      selectedCounselor === counselor.id
                        ? "border-[var(--color-primary)] bg-[var(--color-surface-strong)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <Text as="p" variant="small" weight="medium">
                      {counselor.name}
                    </Text>
                    {counselor.institution && (
                      <Text as="p" variant="small" color="secondary" className="mt-1">
                        {counselor.institution}
                      </Text>
                    )}
                    <Text as="p" variant="small" color="muted" className="mt-2">
                      {(slotsByCounselor[counselor.id]?.length || 0)} slots available
                    </Text>
                  </motion.button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
                  <Text as="p" color="muted">
                    No counselors available at the moment.
                    {!user && ' Sign in to see available slots.'}
                  </Text>
                  {!user && (
                    <Button href="/login" variant="link" className="mt-2">
                      Sign in
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Step 3 · Pick a slot
            </Text>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--color-surface)]" />
                  ))
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSlot(slot)}
                      className={`interactive-panel rounded-[calc(var(--radius-md)*var(--brm))] squircle px-4 py-3 text-left text-span focus-visible:outline-none transition-colors ${
                        selectedSlot?.id === slot.id
                          ? "text-[var(--color-text-primary)] border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                      aria-pressed={selectedSlot?.id === slot.id}
                    >
                      {formatSlotTime(slot)}
                    </motion.button>
                  ))
                ) : (
                  <div className="col-span-2 rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
                    <Text as="p" color="muted">
                      {selectedCounselor ? 'No slots available for this counselor.' : 'Select a counselor to see available slots.'}
                    </Text>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Booking summary
            </Text>
            <div className="mt-5 space-y-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between">
                <Text as="span" variant="small" color="secondary">
                  Type
                </Text>
                <Text as="span" variant="small" weight="medium">
                  {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text as="span" variant="small" color="secondary">
                  Counselor
                </Text>
                <Text as="span" variant="small" weight="medium">
                  {selectedSlot?.counselor?.name || 
                   counselors.find(c => c.id === selectedCounselor)?.name || 
                   'Not selected'}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text as="span" variant="small" color="secondary">
                  Slot
                </Text>
                <Text as="span" variant="small" weight="medium">
                  {selectedSlot ? formatSlotTime(selectedSlot) : 'Not selected'}
                </Text>
              </div>
            </div>

            <Text as="p" variant="small" color="secondary" className="mt-4">
              {bookingType === 'crisis' 
                ? 'Crisis bookings alert the counselor immediately. They will reach out to you as soon as possible.'
                : 'Confirmation email and 24h reminder sent automatically.'}
            </Text>

            {!user && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Please <Button href="/login" variant="link" className="px-1">sign in</Button> to complete your booking.
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
