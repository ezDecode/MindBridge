'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { resolveProfileDisplayName } from '@/lib/profile-name'

import { Icon } from "@iconify/react"
import { cn } from '@/lib/utils'
import { Text } from "@/components/ui"
import { getCurrentDemoUser } from '@/lib/auth/demo-session'

interface CrisisAlert {
  id: string
  created_at: string
  severity: string
  student_id: string
  student_name: string
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

interface DashboardAlertPayload {
  id: string
  triggered_at: string
  severity: string
  student_id: string
  student_name?: string
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
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
          const dashData: { todayCount?: number; alerts?: DashboardAlertPayload[] } = await dashRes.json()
          fetchedTodayCount = dashData.todayCount || 0

          if (Array.isArray(dashData.alerts)) {
            fetchedAlerts = dashData.alerts.map((a) => ({
              id: a.id,
              created_at: a.triggered_at,
              severity: a.severity,
              student_id: a.student_id,
              student_name: a.student_name || 'Student',
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
        pendingBookings: nextBookings.filter(b => b.status === 'pending_confirmation').length,
        todaySessions: fetchedTodayCount,
      })
    } catch (err) {
      console.error("Dashboard error:", err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, { method: 'POST' })
      if (res.ok) {
        const booking = bookings.find(b => b.id === bookingId)
        const countsTowardToday = booking ? isToday(booking.slot_start) : false
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b))
        setMetrics(prev => ({
          ...prev,
          pendingBookings: Math.max(0, prev.pendingBookings - 1),
          todaySessions: countsTowardToday ? prev.todaySessions + 1 : prev.todaySessions,
        }))
      }
    } catch (err) { console.error(err) }
  }

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' })
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== bookingId))
        setMetrics(prev => ({
          ...prev,
          pendingBookings: Math.max(0, prev.pendingBookings - 1),
        }))
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
      <div
        className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
      />
      <Text color="secondary" weight="medium" className="animate-pulse">Opening your professional portal...</Text>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <Icon icon="tabler:alert-triangle" className="text-2xl text-danger mb-2" />
      <Text variant="h3">Unable to Load Dashboard</Text>
      <Text color="secondary" weight="medium" className="max-w-md mb-4">{error}</Text>
      <button
        onClick={() => fetchData()}
        className="px-4 py-2 bg-primary text-white rounded-md text-[14px] font-bold hover:bg-primary-hover transition-colors"
      >
        Retry Connection
      </button>
    </div>
  )

  const confirmedSessions = bookings.filter(b => b.status === 'confirmed' && isToday(b.slot_start))
  const pendingSessions = bookings.filter(b => b.status === 'pending_confirmation')

  return (
    <div className="w-full pb-20">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <Text variant="h1" className="mb-4 text-balance">
              Support <span className="text-primary">Command</span>
            </Text>
            <div className="flex items-center gap-2">
              <Icon icon="tabler:calendar-heart" className="text-primary h-4 w-4" />
              <Text color="secondary" weight="medium">
                Welcome back. You have <Text as="span" weight="bold" className="tabular-nums"> {metrics.todaySessions} </Text> sessions today.
              </Text>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-md border shadow-sm transition-all",
              metrics.activeAlerts > 0
                ? "bg-danger/10 border-danger/20 text-danger animate-pulse"
                : "bg-success/10 border-success/20 text-success"
            )}
          >
            <Icon icon={metrics.activeAlerts > 0 ? "tabler:alert-triangle" : "tabler:shield-check"} className="text-lg" />
            <Text variant="small" weight="medium" className="text-inherit">
              {metrics.activeAlerts > 0 ? `${metrics.activeAlerts} ACTIVE CRISIS` : 'Systems Clear'}
            </Text>
          </div>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { label: "Today's Load", value: metrics.todaySessions, icon: "tabler:calendar-event", color: "text-primary" },
            { label: "Confirmed Today", value: confirmedSessions.length, icon: "tabler:check", color: "text-secondary" },
            { label: "Pending Approvals", value: metrics.pendingBookings, icon: "tabler:clock-pause", color: "text-warning" },
          ].map((stat, i) => (
            <div
              key={i}
              className="card-raised p-6 group hover:border-white/20 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 mb-6">
                <Icon icon={stat.icon} className={cn("text-xl transition-transform", stat.color)} />
              </div>
              <Text variant="metric" className="tabular-nums mb-2">{stat.value}</Text>
              <Text variant="small" color="secondary" weight="medium">{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Mid Section Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Today's Schedule - Large Block */}
          <div className="card lg:col-span-8 p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Text variant="h3">Today&apos;s Schedule</Text>
                <Text color="secondary" weight="medium" className="mt-1">Confirmed appointments</Text>
              </div>
              <Link
                href="/counselor/appointments"
                className="text-[14px] font-medium text-text-muted hover:text-white transition-colors"
              >
                Full View
              </Link>
            </div>

            <div className="space-y-3">
              {confirmedSessions.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-6 p-4 rounded-lg bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all"
                >
                  <div className="flex flex-col items-center justify-center size-14 rounded bg-surface-raised border border-border shadow-sm">
                    <Text variant="caption" color="muted">{formatTime(booking.slot_start).split(' ')[1]}</Text>
                    <Text variant="h3" className="leading-tight tabular-nums">{formatTime(booking.slot_start).split(' ')[0]}</Text>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Text variant="subtitle" weight="semibold" className="group-hover:text-primary transition-colors">
                        {resolveProfileDisplayName({ profileName: booking.student?.name }) || 'Student'}
                      </Text>
                      <span className="badge badge-primary text-[10px]">Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Text variant="small" color="muted" weight="medium" className="flex items-center gap-1.5"><Icon icon="tabler:video" className="text-secondary" /> {booking.type}</Text>
                      <Text variant="small" color="muted" weight="medium" className="flex items-center gap-1.5"><Icon icon="tabler:clock" className="text-primary" /> 45 Mins</Text>
                    </div>
                  </div>
                  <Link
                    href="/counselor/appointments"
                    aria-label="Open in appointments"
                    className="size-8 rounded bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon icon="tabler:external-link" className="text-lg" />
                  </Link>
                </div>
              ))}
              {confirmedSessions.length === 0 && (
                <div className="p-16 text-center text-text-dim border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                  <Icon icon="tabler:calendar-cancel" className="text-2xl mx-auto mb-4 opacity-10" />
                  <Text variant="subtitle" color="muted" className="italic opacity-60">A quiet day ahead.</Text>
                  <Text variant="small" color="muted" weight="medium" className="mt-2">No sessions scheduled</Text>
                </div>
              )}
            </div>
          </div>

          {/* Pending & Crisis Side Bento */}
          <div className="lg:col-span-4 space-y-8">

            {/* Pending Confirmations */}
            <div className="card p-8 group">
              <div className="flex items-center justify-between mb-8">
                <Text variant="h3">Pending Requests</Text>
                <span className="badge badge-outline">{metrics.pendingBookings}</span>
              </div>
              <div className="space-y-3">
                {pendingSessions.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex-1">
                      <Text variant="small" weight="semibold" className="mb-1">{resolveProfileDisplayName({ profileName: booking.student?.name }) || 'Student'}</Text>
                      <Text variant="caption" color="muted" weight="medium">
                        {new Date(booking.slot_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {formatTime(booking.slot_start)}
                      </Text>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmBooking(booking.id)}
                        aria-label="Confirm booking"
                        className="size-7 rounded bg-success/10 text-success flex items-center justify-center border border-success/20 hover:bg-success/20 transition-all"
                      >
                        <Icon icon="tabler:check" className="text-base" />
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        aria-label="Reject booking"
                        className="size-7 rounded bg-white/5 text-text-muted flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <Icon icon="tabler:x" className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
                {metrics.pendingBookings === 0 && (
                  <Text variant="small" color="muted" weight="medium" className="text-center py-10 opacity-40 italic">All caught up</Text>
                )}
              </div>
            </div>

            {/* Crisis Alerts Elevation */}
            <div className={cn(
              "card p-8 transition-all duration-300",
              crisisAlerts.length > 0 ? "border-danger/40 bg-danger/[0.02]" : "opacity-40 grayscale"
            )}>
              <div className="flex items-center justify-between mb-8">
                <Text variant="h3" className="flex items-center gap-2">
                  <Icon icon="tabler:alert-triangle" className={crisisAlerts.length > 0 ? "text-danger" : "text-text-dim"} />
                  Critical Alerts
                </Text>
                <span className={cn("badge", crisisAlerts.length > 0 ? "bg-danger text-white border-none" : "badge-outline")}>
                  {crisisAlerts.length}
                </span>
              </div>
              <div className="space-y-4">
                {crisisAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg bg-danger/10 border border-danger/20"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-9 rounded bg-danger text-white flex items-center justify-center shadow-lg shadow-danger/20">
                        <Icon icon="tabler:user-exclamation" className="text-xl" />
                      </div>
                      <div>
                        <Text variant="small" weight="bold" className="leading-none mb-1">{alert.student_name}</Text>
                        <Text variant="caption" color="danger" weight="medium" className="opacity-80">
                          {new Date(alert.created_at).toLocaleTimeString()} · {alert.severity}
                        </Text>
                      </div>
                    </div>
                    <Link href="/counselor/students" className="w-full py-2 bg-danger text-white text-[14px] font-bold rounded hover:bg-danger-hover transition-colors flex items-center justify-center">
                      Respond now
                    </Link>
                  </div>
                ))}
                {crisisAlerts.length === 0 && (
                  <div className="p-10 text-center bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                    <Icon icon="tabler:mood-heart" className="text-2xl mx-auto mb-2 opacity-5" />
                    <Text variant="small" color="muted" weight="medium" className="opacity-40">Wellbeing Stable</Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
