'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { motion } from 'motion/react'
import { Icon } from "@iconify/react"
import { cn } from '@/lib/utils'
import { Text } from "@/components/ui"
import { getCurrentDemoUser } from '@/lib/auth/demo-session'

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

const container = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.6, bounce: 0 } }
}

export default function CounselorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    activeAlerts: 0,
    pendingBookings: 0,
    todaySessions: 0,
  })

  const supabase = useMemo(() => createClient(), [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const user = getCurrentDemoUser()
      
      if (!user || !user.id) {
          throw new Error("User not available")
      }

      let fetchedAlerts: CrisisAlert[] = []
      let fetchedTodayCount = 0

      try {
        const dashRes = await fetch(`/api/counselor/dashboard?_t=${Date.now()}`, { cache: 'no-store' })
        if (dashRes.ok) {
          const dashData = await dashRes.json()
          fetchedTodayCount = dashData.todayCount || 0
          
          if (Array.isArray(dashData.alerts)) {
            fetchedAlerts = dashData.alerts.map((a: any) => ({
              id: a.id,
              created_at: a.triggered_at,
              severity: a.severity,
              student_id: a.student_id,
              relativeTime: "Active",
            }))
            setCrisisAlerts(fetchedAlerts)
          }
        }
      } catch (err) {
        console.error("Dashboard core fetch error:", err)
      }

      let nextBookings: Booking[] = []
      try {
        const res = await fetch('/api/counselor/slots')
        if (res.ok) {
          const data = await res.json()
          nextBookings = Array.isArray(data.bookings) ? data.bookings : []
          setBookings(nextBookings)
        }
      } catch (err) { console.error("Fetch slots error:", err) }

      setMetrics({
        activeAlerts: fetchedAlerts.length,
        pendingBookings: Array.isArray(nextBookings) ? nextBookings.filter(b => b.status === 'pending_confirmation').length : 0,
        todaySessions: fetchedTodayCount || 0,
      })
    } catch (err: any) {
      console.error("Dashboard error:", err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await fetchData()
    }
    init()
  }, [fetchData])

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, { method: 'POST' })
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b))
        setMetrics(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1, todaySessions: prev.todaySessions + 1 }))
      }
    } catch (err) { console.error(err) }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="size-12 rounded-full border-4 border-primary/20 border-t-primary"
      />
      <p className="text-text-muted font-medium animate-pulse font-sans">Opening your professional portal...</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <Icon icon="tabler:alert-triangle" className="text-4xl text-danger mb-2" />
      <Text as="h3" variant="h4" weight="semibold">Unable to Load Dashboard</Text>
      <p className="text-text-muted font-medium max-w-md mb-4">{error}</p>
      <button 
        onClick={() => fetchData()}
        className="px-4 py-2 bg-primary text-white rounded-md text-sm font-bold hover:bg-primary-hover transition-colors"
      >
        Retry Connection
      </button>
    </div>
  )

  const confirmedSessions = bookings.filter(b => b.status === 'confirmed')
  const pendingSessions = bookings.filter(b => b.status === 'pending_confirmation')

  return (
    <div className="w-full pb-20">
      <motion.div 
        variants={container}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-7xl space-y-12"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div variants={item}>
            <Text as="h2" variant="h1" weight="semibold" className="mb-4 text-balance">
              Support <span className="text-primary">Command</span>
            </Text>
            <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
              <Icon icon="tabler:calendar-heart" className="text-primary h-4 w-4" />
              Welcome back. You have <span className="text-white font-bold tabular-nums">{metrics.todaySessions}</span> sessions today.
            </div>
          </motion.div>
          
          <motion.div 
            variants={item}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-md border shadow-sm transition-all",
              metrics.activeAlerts > 0 
                ? "bg-danger/10 border-danger/20 text-danger animate-pulse" 
                : "bg-success/10 border-success/20 text-success"
            )}
          >
            <Icon icon={metrics.activeAlerts > 0 ? "tabler:alert-triangle" : "tabler:shield-check"} className="text-lg" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {metrics.activeAlerts > 0 ? `${metrics.activeAlerts} ACTIVE CRISIS` : 'Systems Clear'}
            </span>
          </motion.div>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Today's Load", value: metrics.todaySessions, icon: "tabler:calendar-event", color: "text-primary" },
            { label: "Confirmed Slots", value: confirmedSessions.length, icon: "tabler:check", color: "text-secondary" },
            { label: "Pending Approvals", value: metrics.pendingBookings, icon: "tabler:clock-pause", color: "text-warning" },
            { label: "Satisfaction Rate", value: "4.9", icon: "tabler:star", color: "text-warning" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={item}
              className="card-raised p-6 group hover:border-white/20 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 mb-6">
                <Icon icon={stat.icon} className={cn("text-xl transition-transform", stat.color)} />
              </div>
              <div className="text-3xl font-semibold tabular-nums text-white leading-none mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mid Section Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Today's Schedule - Large Block */}
          <motion.div variants={item} className="card lg:col-span-8 p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Text as="h3" weight="semibold">Today&apos;s Schedule</Text>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">Confirmed appointments</p>
              </div>
              <button className="text-[10px] font-bold text-text-muted hover:text-white transition-colors uppercase tracking-widest">Full View</button>
            </div>
            
            <div className="space-y-3">
              {confirmedSessions.map((booking) => (
                <motion.div 
                  key={booking.id} 
                  className="flex items-center gap-6 p-4 rounded-lg bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all"
                >
                  <div className="flex flex-col items-center justify-center size-14 rounded bg-surface-raised border border-border shadow-sm">
                    <span className="text-[9px] font-bold uppercase text-text-muted">{formatTime(booking.slot_start).split(' ')[1]}</span>
                    <span className="text-xl font-bold text-white leading-tight">{formatTime(booking.slot_start).split(' ')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        {resolveProfileDisplayName({ profileName: booking.student?.name }) || 'Student'}
                      </span>
                      <span className="badge badge-primary text-[8px]">Active</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Icon icon="tabler:video" className="text-secondary" /> {booking.type}</span>
                      <span className="flex items-center gap-1.5"><Icon icon="tabler:clock" className="text-primary" /> 45 Mins</span>
                    </div>
                  </div>
                  <button className="size-8 rounded bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon icon="tabler:external-link" className="text-lg" />
                  </button>
                </motion.div>
              ))}
              {confirmedSessions.length === 0 && (
                <div className="p-16 text-center text-text-dim border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                  <Icon icon="tabler:calendar-cancel" className="text-4xl mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium italic opacity-60">A quiet day ahead.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2">No sessions scheduled</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pending & Crisis Side Bento */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Pending Confirmations */}
            <motion.div variants={item} className="card p-8 group">
              <div className="flex items-center justify-between mb-8">
                <Text as="h3" weight="semibold">Pending Requests</Text>
                <span className="badge badge-outline">{metrics.pendingBookings}</span>
              </div>
              <div className="space-y-3">
                {pendingSessions.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white mb-1">{resolveProfileDisplayName({ profileName: booking.student?.name }) || 'Student'}</div>
                      <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest">
                        {new Date(booking.slot_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {formatTime(booking.slot_start)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleConfirmBooking(booking.id)}
                        className="size-7 rounded bg-success/10 text-success flex items-center justify-center border border-success/20 hover:bg-success/20 transition-all"
                      >
                        <Icon icon="tabler:check" className="text-base" />
                      </button>
                      <button className="size-7 rounded bg-white/5 text-text-muted flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
                        <Icon icon="tabler:x" className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
                {metrics.pendingBookings === 0 && (
                  <p className="text-center text-text-dim text-[10px] font-bold uppercase tracking-widest py-10 opacity-40 italic">All caught up</p>
                )}
              </div>
            </motion.div>

            {/* Crisis Alerts Elevation */}
            <motion.div variants={item} className={cn(
              "card p-8 transition-all duration-300",
              crisisAlerts.length > 0 ? "border-danger/40 bg-danger/[0.02]" : "opacity-40 grayscale"
            )}>
              <div className="flex items-center justify-between mb-8">
                <Text as="h3" weight="semibold" className="flex items-center gap-2">
                  <Icon icon="tabler:alert-triangle" className={crisisAlerts.length > 0 ? "text-danger" : "text-text-dim"} />
                  Critical Alerts
                </Text>
                <span className={cn("badge", crisisAlerts.length > 0 ? "bg-danger text-white border-none" : "badge-outline")}>
                  {crisisAlerts.length}
                </span>
              </div>
              <div className="space-y-4">
                {crisisAlerts.map((alert) => (
                  <motion.div 
                    key={alert.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-lg bg-danger/10 border border-danger/20"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-9 rounded bg-danger text-white flex items-center justify-center shadow-lg shadow-danger/20">
                        <Icon icon="tabler:user-exclamation" className="text-xl" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-none mb-1">Student ID: {alert.student_id.split('-')[0]}</div>
                        <div className="text-[9px] font-bold text-danger uppercase tracking-widest opacity-80">
                          {new Date(alert.created_at).toLocaleTimeString()} · {alert.severity}
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-danger text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-danger-hover transition-colors">
                      Respond now
                    </button>
                  </motion.div>
                ))}
                {crisisAlerts.length === 0 && (
                  <div className="p-10 text-center bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                    <Icon icon="tabler:mood-heart" className="text-3xl mx-auto mb-2 opacity-5" />
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest opacity-40">Wellbeing Stable</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
