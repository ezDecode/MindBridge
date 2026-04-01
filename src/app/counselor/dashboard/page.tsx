'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageIntro } from "@/components/site"
import { Button, Card, Text, SkeletonText } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'

interface CrisisAlert {
  id: string
  created_at: string
  severity: string
  student_id: string
}

interface Booking {
  id: string
  slot_start: string
  slot_end: string
  type: string
  status: string
  student: { id: string; name: string | null }
}

interface Metrics {
  activeAlerts: number
  pendingBookings: number
  todaySessions: number
}

export default function CounselorDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCounselor, setIsCounselor] = useState(false)
  
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    activeAlerts: 0,
    pendingBookings: 0,
    todaySessions: 0,
  })

  const supabase = useMemo(() => createClient(), [])

  // Fetch data
  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (!user) {
      setLoading(false)
      return
    }

    // Check if user is counselor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'counselor') {
      setLoading(false)
      return
    }
    
    setIsCounselor(true)

    // Fetch crisis alerts (last 24h)
    const { data: alerts } = await supabase
      .from('crisis_logs')
      .select('id, triggered_at, severity, student_id')
      .gte('triggered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('triggered_at', { ascending: false })
      .limit(10)

    if (alerts) {
      setCrisisAlerts(alerts.map(a => ({
        id: a.id,
        created_at: a.triggered_at,
        severity: a.severity,
        student_id: a.student_id,
      })))
    }

    // Fetch bookings from slots API
    try {
      const res = await fetch('/api/counselor/slots')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    }

    // Calculate metrics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count: todayCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('counselor_id', user.id)
      .eq('status', 'confirmed')
      .gte('slot_start', today.toISOString())
      .lt('slot_start', tomorrow.toISOString())

    setMetrics({
      activeAlerts: alerts?.length || 0,
      pendingBookings: bookings.filter(b => b.status === 'pending_confirmation').length,
      todaySessions: todayCount || 0,
    })

    setLoading(false)
  }, [supabase])

  // Setup realtime subscription for crisis alerts
  useEffect(() => {
    fetchData()

    // Subscribe to new crisis alerts
    const channel = supabase
      .channel('crisis-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crisis_logs',
        },
        (payload) => {
          const newAlert = payload.new as CrisisAlert
          setCrisisAlerts(prev => [newAlert, ...prev])
          setMetrics(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }))
          
          // Play notification sound (if available)
          if (typeof Audio !== 'undefined') {
            const audio = new Audio('/alert.mp3')
            audio.play().catch(() => {})
          }
        }
      )
      .subscribe()

    // Subscribe to new bookings
    const bookingChannel = supabase
      .channel('counselor-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          // Refresh bookings on any change
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(bookingChannel)
    }
  }, [fetchData, supabase])

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, { method: 'POST' })
      if (res.ok) {
        setBookings(prev => 
          prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
        )
      }
    } catch (err) {
      console.error('Failed to confirm booking:', err)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    setCrisisAlerts(prev => prev.filter(a => a.id !== alertId))
    setMetrics(prev => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }))
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getTimeSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!loading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Text as="h2" variant="h3" className="mb-2">Sign in required</Text>
          <Text as="p" color="secondary" className="mb-4">Please sign in to access the counselor dashboard.</Text>
          <Button href="/login">Sign in</Button>
        </div>
      </div>
    )
  }

  if (!loading && !isCounselor) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Text as="h2" variant="h3" className="mb-2">Access denied</Text>
          <Text as="p" color="secondary" className="mb-4">This dashboard is only accessible to counselors.</Text>
          <Button href="/student/dashboard">Go to student dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageIntro
        eyebrow="Counselor dashboard"
        title="Triage first, context second, admin noise never."
        description="Next urgent signal, next booking, notes that need attention. Deliberately simple."
        actions={
          <>
            <Button href="/student/book">Preview student booking</Button>
            <Button href="/" variant="warm">
              Back to home
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card variant={metrics.activeAlerts > 0 ? "warm" : "default"} padding="md">
          <Text as="p" variant="small" color="secondary">
            Active alerts
          </Text>
          <Text as="p" variant="h3" weight="bold" className={`mt-3 ${metrics.activeAlerts > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'}`}>
            {loading ? '-' : metrics.activeAlerts}
          </Text>
        </Card>
        <Card variant="default" padding="md">
          <Text as="p" variant="small" color="secondary">
            Pending bookings
          </Text>
          <Text as="p" variant="h3" weight="bold" className="mt-3 text-[var(--color-primary)]">
            {loading ? '-' : metrics.pendingBookings}
          </Text>
        </Card>
        <Card variant="default" padding="md">
          <Text as="p" variant="small" color="secondary">
            Today's sessions
          </Text>
          <Text as="p" variant="h3" weight="bold" className="mt-3 text-[var(--color-primary)]">
            {loading ? '-' : metrics.todaySessions}
          </Text>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Card variant="subtle" padding="lg">
          <div className="flex items-center justify-between">
            <Text as="p" variant="small" weight="medium">
              Realtime crisis alerts
            </Text>
            {crisisAlerts.length > 0 && (
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="rounded-lg border border-[var(--color-border)] p-4">
                    <SkeletonText lines={2} />
                  </div>
                ))}
              </div>
            ) : crisisAlerts.length > 0 ? (
              <AnimatePresence>
                {crisisAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ 
                      opacity: 0, 
                      x: -20, 
                      scale: 1.08,
                      backgroundColor: "rgba(239, 68, 68, 0.3)"
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      backgroundColor: index === 0 
                        ? "var(--color-danger-soft)" 
                        : "var(--color-surface)"
                    }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      scale: { type: "spring", stiffness: 300, damping: 20 },
                      backgroundColor: { duration: 0.3, delay: 0.3 }
                    }}
                    className={`rounded-[calc(var(--radius-lg)*var(--brm))] squircle border p-4 ${
                      index === 0
                        ? "border-[var(--color-danger)]/30"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Text as="p" variant="small" weight="medium">
                            {alert.severity === 'critical' ? '🚨 Crisis Alert' : '⚠️ Warning'}
                          </Text>
                          {index === 0 && (
                            <motion.span
                              className="h-2 w-2 rounded-full bg-red-500"
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                        <Text as="p" variant="small" color="secondary" className="mt-1">
                          Student requires immediate attention
                        </Text>
                        <Text as="p" variant="small" color="muted" className="mt-2">
                          {getTimeSince(alert.created_at)}
                        </Text>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="shrink-0"
                        >
                          Acknowledge
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
                <Text as="p" color="muted">
                  No active alerts. All students are safe.
                </Text>
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Upcoming bookings
            </Text>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-lg border border-[var(--color-border)] p-4">
                      <SkeletonText lines={2} />
                    </div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                  >
                    <div>
                      <Text as="p" variant="small" weight="medium">
                        {booking.type === 'anonymous' ? 'Anonymous Student' : booking.student?.name || 'Student'}
                      </Text>
                      <Text as="p" variant="small" color="secondary" className="mt-1">
                        {formatTime(booking.slot_start)}
                      </Text>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-span ${
                      booking.type === 'crisis'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)]'
                    }`}>
                      {booking.type}
                    </span>
                    {booking.status === 'pending_confirmation' ? (
                      <Button
                        variant="warm"
                        onClick={() => handleConfirmBooking(booking.id)}
                      >
                        Confirm
                      </Button>
                    ) : (
                      <span className="status-pill">{booking.status}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
                  <Text as="p" color="muted">
                    No upcoming bookings.
                  </Text>
                </div>
              )}
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Notes and slots
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-3">
              Session notes stay private. Availability managed through a simple weekly slot form.
            </Text>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" className="flex-1">
                Manage slots
              </Button>
              <Button variant="ghost" className="flex-1">
                View notes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
