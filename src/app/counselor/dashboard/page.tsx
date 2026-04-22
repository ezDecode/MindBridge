'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button, Text } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'
import { resolveProfileDisplayName } from '@/lib/profile-name'

interface CrisisAlert {
  id: string
  created_at: string
  severity: string
  student_id: string
  relativeTime: string
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

function formatRelativeTime(date: string, referenceNow: number) {
  const diff = referenceNow - new Date(date).getTime()
  const minutes = Math.max(0, Math.floor(diff / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
}

export default function CounselorDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
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

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'counselor') {
      setLoading(false)
      return
    }

    setIsCounselor(true)
    const referenceNow = Date.now()

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
        relativeTime: formatRelativeTime(a.triggered_at, referenceNow),
      })))
    }

    let nextBookings: Booking[] = []
    try {
      const res = await fetch('/api/counselor/slots')
      if (res.ok) {
        const data = await res.json()
        nextBookings = data.bookings || []
        setBookings(nextBookings)
      }
    } catch (err) { console.error(err) }

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
      pendingBookings: nextBookings.filter(b => b.status === 'pending_confirmation').length,
      todaySessions: todayCount || 0,
    })

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
    const channel = supabase.channel('crisis-alerts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crisis_logs' }, (payload) => {
      const newAlertPayload = payload.new as any
      const newAlert: CrisisAlert = {
        id: newAlertPayload.id,
        created_at: newAlertPayload.triggered_at,
        severity: newAlertPayload.severity,
        student_id: newAlertPayload.student_id,
        relativeTime: 'Just now',
      }
      setCrisisAlerts(prev => [newAlert, ...prev])
      setMetrics(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }))
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchData, supabase])

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, { method: 'POST' })
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b))
      }
    } catch (err) { console.error(err) }
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

  if (loading) {
    return (
      <div className="w-full space-y-8 p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 bg-surface-strong/30 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <Skeleton className="xl:col-span-5 h-[400px] bg-surface-strong/20 rounded-2xl" />
          <Skeleton className="xl:col-span-7 h-[400px] bg-surface-strong/20 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10 pb-20">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-action-primary">Clinical Command</Text>
          <Text className="text-2xl font-bold tracking-tight">Triage & Intake Portal</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="warm" size="sm" className="rounded-lg h-9 px-4 font-bold text-[12px] active:scale-[0.96]">
            <Icon icon="tabler:calendar-event" className="mr-2 h-4 w-4" />
            Set Availability
          </Button>
        </div>
      </header>

      <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard 
          icon="tabler:alert-octagon" 
          label="Active Crisis" 
          value={metrics.activeAlerts.toString()} 
          accent={metrics.activeAlerts > 0 ? "error" : "primary"}
        />
        <MetricCard 
          icon="tabler:calendar-time" 
          label="Pending Intake" 
          value={metrics.pendingBookings.toString()} 
          accent="info"
        />
        <MetricCard 
          icon="tabler:users" 
          label="Today's Caseload" 
          value={metrics.todaySessions.toString()} 
          accent="success"
        />
      </motion.section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <motion.div variants={itemVariants} className="xl:col-span-5 space-y-6">
          <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
            <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Live Escalation</Text>
              </div>
              <div className={`h-1.5 w-1.5 rounded-full ${metrics.activeAlerts > 0 ? 'bg-status-error animate-pulse shadow-[0_0_8px_var(--status-error)]' : 'bg-status-success'}`} />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {crisisAlerts.map((alert, idx) => (
                  <motion.div 
                    key={alert.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl border transition-all ${idx === 0 ? "bg-status-error/5 border-status-error/20" : "bg-surface-strong/20 border-border-default/50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${alert.severity === 'critical' ? 'bg-status-error text-white border-transparent' : 'bg-status-warning text-white border-transparent'}`}>
                          <Icon icon={alert.severity === 'critical' ? 'tabler:alert-octagon' : 'tabler:alert-triangle'} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Text className="text-[13px] font-semibold text-text-primary truncate">Diagnostic Signal</Text>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Text className="text-[11px] font-medium text-text-muted">Ref: {alert.student_id.split('-')[0]}</Text>
                            <span className="h-1 w-1 rounded-full bg-border-strong opacity-30" />
                            <Text className="text-[11px] font-bold tabular-nums text-text-muted">{alert.relativeTime}</Text>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setCrisisAlerts(p => p.filter(a => a.id !== alert.id))} 
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors border border-transparent hover:border-border-default text-text-muted hover:text-status-success active:scale-95"
                      >
                        <Icon icon="tabler:check" className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!crisisAlerts.length && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                  <Icon icon="tabler:shield-check" className="h-8 w-8 text-status-success mb-3" />
                  <Text className="text-[10px] font-bold uppercase tracking-widest">Triage Clear</Text>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon="tabler:files" label="Notes" />
            <QuickAction icon="tabler:report-analytics" label="Reports" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-7">
          <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Upcoming Engagements</Text>
              </div>
              <div className="h-8 w-8 rounded-lg bg-surface-strong/50 flex items-center justify-center text-text-muted border border-border-default/50">
                <Icon icon="tabler:calendar" className="h-4 w-4" />
              </div>
            </div>

            <div className="divide-y divide-border-default/30">
              <AnimatePresence mode="popLayout" initial={false}>
                {bookings.map((booking) => (
                  <motion.div 
                    key={booking.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-surface-strong/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-surface-strong border border-border-default text-text-primary flex items-center justify-center font-bold text-sm transition-colors group-hover:bg-action-primary group-hover:text-text-inverse group-hover:border-transparent">
                          {booking.student?.name?.charAt(0) || 'S'}
                        </div>
                        {booking.type === 'crisis' && (
                          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-status-error text-white rounded-full flex items-center justify-center shadow-sm">
                            <Icon icon="tabler:alert-small" className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Text className="text-[14px] font-semibold text-text-primary tracking-tight">
                            {resolveProfileDisplayName({ profileName: booking.student?.name }) || 'Student Record'}
                          </Text>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border ${
                            booking.type === 'crisis' ? 'bg-status-error/5 border-status-error/20 text-status-error' : 'bg-surface-strong/50 border-border-default text-text-muted'
                          }`}>
                            {booking.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-medium text-text-muted tabular-nums">
                          <span className="flex items-center gap-1">
                            <Icon icon="tabler:clock" className="h-3.5 w-3.5 text-action-primary/60" />
                            {formatTime(booking.slot_start)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {booking.status === 'pending_confirmation' ? (
                        <Button variant="primary" size="sm" onClick={() => handleConfirmBooking(booking.id)} className="h-8 px-4 rounded-lg font-bold text-[11px] active:scale-95 shadow-sm">
                          Authorize
                        </Button>
                      ) : (
                        <div className="h-8 px-3 rounded-lg bg-status-success/5 border border-status-success/20 flex items-center gap-1.5 text-[10px] font-bold text-status-success">
                          <Icon icon="tabler:shield-check" className="h-3.5 w-3.5" />
                          Confirmed
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!bookings.length && (
                <div className="flex flex-col items-center justify-center p-20 text-center opacity-30">
                  <Icon icon="tabler:calendar-off" className="h-8 w-8 mb-3" />
                  <Text className="text-[10px] font-bold uppercase tracking-widest">No sessions</Text>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function MetricCard({ icon, label, value, accent }: { icon: string, label: string, value: string, accent: 'primary' | 'error' | 'success' | 'info' }) {
  const accentColors = {
    primary: 'text-action-primary border-action-primary/20 bg-action-primary/5',
    error: 'text-status-error border-status-error/20 bg-status-error/5',
    success: 'text-status-success border-status-success/20 bg-status-success/5',
    info: 'text-status-info border-status-info/20 bg-status-info/5',
  }

  return (
    <motion.div 
      variants={itemVariants} 
      className="bg-surface-default border border-border-default p-5 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${accentColors[accent]} transition-transform duration-500 group-hover:scale-110`}>
          <Icon icon={icon} className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="relative z-10">
        <Text className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 opacity-70">{label}</Text>
        <Text className="text-3xl font-bold text-text-primary tracking-tight tabular-nums leading-none" style={{ fontFamily: 'var(--font-mindbridge)' }}>{value}</Text>
      </div>
    </motion.div>
  )
}

function QuickAction({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-surface-strong/10 border border-border-default/50 hover:bg-surface-strong/20 hover:border-action-primary/30 transition-all active:scale-[0.96] group">
      <Icon icon={icon} className="h-5 w-5 text-text-muted group-hover:text-action-primary transition-colors" />
      <Text className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60 group-hover:text-text-primary transition-colors">{label}</Text>
    </button>
  )
}
