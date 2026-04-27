'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface StudentRow {
  id: string
  name: string | null
  institution: string | null
  created_at: string
  counselor_id: string | null
  avgMood: number | null
  severity: string
  stability: 'stable' | 'watch' | 'at-risk'
}

export default function AdminStudentsPage() {
  const { showToast } = useToast()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStability, setFilterStability] = useState<string>('all')

  // Delegate booking state
  const [showBooking, setShowBooking] = useState(false)
  const [bookingStudentId, setBookingStudentId] = useState<string | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [submittingBooking, setSubmittingBooking] = useState(false)

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students ?? [])
      }
    } catch {
      console.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery ||
      (s.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.institution?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = filterStability === 'all' || s.stability === filterStability
    return matchesSearch && matchesFilter
  })

  const handleDelegateBooking = async () => {
    if (!bookingStudentId || !bookingDate || !bookingTime) {
      showToast("Please fill all booking fields", "info")
      return
    }

    setSubmittingBooking(true)
    try {
      const slotStart = new Date(`${bookingDate}T${bookingTime}`).toISOString()
      const slotEnd = new Date(new Date(`${bookingDate}T${bookingTime}`).getTime() + 60 * 60 * 1000).toISOString()

      const student = students.find(s => s.id === bookingStudentId)

      const res = await fetch('/api/admin/delegate-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: bookingStudentId,
          counselorId: student?.counselor_id || bookingStudentId, // fallback
          slotStart,
          slotEnd,
        }),
      })

      if (res.ok) {
        showToast("Session booked & notification sent!", "success")
        setShowBooking(false)
        setBookingStudentId(null)
        setBookingDate('')
        setBookingTime('')
      }
    } catch {
      showToast("Failed to create booking", "error")
    } finally {
      setSubmittingBooking(false)
    }
  }

  const stabilityConfig = {
    'stable': { label: 'Stable', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: 'tabler:shield-check' },
    'watch': { label: 'Watch', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', icon: 'tabler:alert-triangle' },
    'at-risk': { label: 'At Risk', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: 'tabler:alert-octagon' },
  }

  const counts = {
    total: students.length,
    stable: students.filter(s => s.stability === 'stable').length,
    watch: students.filter(s => s.stability === 'watch').length,
    atRisk: students.filter(s => s.stability === 'at-risk').length,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="text-white mb-1">Student Directory</Text>
          <Text variant="small" className="text-text-dim font-medium">{counts.total} students enrolled</Text>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="bg-success/5 border-success/20">
          <div className="flex items-center gap-3">
            <Icon icon="tabler:shield-check" className="text-success text-xl" />
            <div>
              <Text weight="bold" className="text-white tabular-nums">{counts.stable}</Text>
              <Text variant="small" className="text-success font-medium">Stable</Text>
            </div>
          </div>
        </Card>
        <Card padding="md" className="bg-warning/5 border-warning/20">
          <div className="flex items-center gap-3">
            <Icon icon="tabler:alert-triangle" className="text-warning text-xl" />
            <div>
              <Text weight="bold" className="text-white tabular-nums">{counts.watch}</Text>
              <Text variant="small" className="text-warning font-medium">Watch</Text>
            </div>
          </div>
        </Card>
        <Card padding="md" className="bg-danger/5 border-danger/20">
          <div className="flex items-center gap-3">
            <Icon icon="tabler:alert-octagon" className="text-danger text-xl" />
            <div>
              <Text weight="bold" className="text-white tabular-nums">{counts.atRisk}</Text>
              <Text variant="small" className="text-danger font-medium">At Risk</Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-lg" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-white placeholder:text-text-dim focus:border-white/20 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'stable', 'watch', 'at-risk'].map(filter => (
            <button
              key={filter}
              onClick={() => setFilterStability(filter)}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium border transition-all capitalize",
                filterStability === filter
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/5 text-text-muted hover:border-white/10"
              )}
            >
              {filter === 'at-risk' ? 'At Risk' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Delegate Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card padding="lg" className="bg-surface border-primary/30 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <Text as="h3" weight="semibold" className="text-white">Schedule Counselor Session</Text>
                <button onClick={() => setShowBooking(false)} className="text-text-dim hover:text-white">
                  <Icon icon="tabler:x" className="text-xl" />
                </button>
              </div>
              <Text variant="small" className="text-text-dim mb-4 block">
                Booking for: <strong className="text-white">{students.find(s => s.id === bookingStudentId)?.name ?? 'Student'}</strong>
              </Text>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Text variant="small" className="text-text-dim mb-1 block">Date</Text>
                  <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                </div>
                <div>
                  <Text variant="small" className="text-text-dim mb-1 block">Time</Text>
                  <Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" size="md" onClick={() => setShowBooking(false)}>Cancel</Button>
                <Button size="md" onClick={handleDelegateBooking} disabled={submittingBooking}>
                  {submittingBooking ? "Booking..." : "Confirm & Notify"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Table */}
      <Card padding="none" className="bg-surface border-border overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <Text variant="small" className="text-text-dim">Loading students...</Text>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <Icon icon="tabler:users-minus" className="text-3xl text-text-dim mx-auto mb-3 opacity-20" />
            <Text className="text-text-dim">No students found</Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-dim">Student</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-dim">Mood Avg</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-dim">Stability</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-dim">Severity</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-text-dim">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const config = stabilityConfig[student.stability]
                  return (
                    <tr key={student.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Icon icon="tabler:user" className="text-sm text-text-dim" />
                          </div>
                          <div>
                            <Text weight="medium" className="text-white text-sm">{student.name ?? 'Unknown'}</Text>
                            <Text variant="small" className="text-text-dim text-xs">{student.institution ?? 'N/A'}</Text>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Text className={cn("text-sm tabular-nums", student.avgMood === null ? "text-text-dim" : student.avgMood >= 4 ? "text-success" : student.avgMood >= 3 ? "text-warning" : "text-danger")}>
                          {student.avgMood !== null ? `${student.avgMood}/5` : '—'}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border", config.bg, config.color, config.border)}>
                          <Icon icon={config.icon} className="text-sm" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Text className="text-sm text-text-muted capitalize">{student.severity}</Text>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-white/5 gap-1.5 text-xs"
                          onClick={() => {
                            setBookingStudentId(student.id)
                            setShowBooking(true)
                          }}
                        >
                          <Icon icon="tabler:calendar-plus" className="text-sm" />
                          Book Session
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
