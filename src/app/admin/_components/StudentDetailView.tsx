'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Card, Text } from "@/components/ui"
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { resolveProfileDisplayName } from '@/lib/profile-name'

interface Profile {
  id: string
  name: string | null
  role: string
  institution: string | null
  created_at: string
}

interface MoodLog {
  id: string
  score: number
  note: string | null
  logged_at: string
}

interface WeeklyReport {
  title: string
  dateRange: string
  logsCount: number
  averageMoodScore: number
  insights: string[]
}

interface StudentDetailViewProps {
  studentId: string
}

export function StudentDetailView({ studentId }: StudentDetailViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [triggeringHelp, setTriggeringHelp] = useState(false)
  const [helpMessage, setHelpMessage] = useState('')
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setMoodLogs(data.moodLogs || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    if (studentId) {
      fetchData()
    }
  }, [studentId, fetchData])

  const handleCriticalHelp = async () => {
    setTriggeringHelp(true)
    setHelpMessage('')
    try {
      const res = await fetch('/api/admin/crisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      if (res.ok) {
        setHelpMessage('Critical help provided: Alert logged and counselor notified.')
      } else {
        setHelpMessage('Failed to trigger critical help.')
      }
    } catch (err) {
      console.error(err)
      setHelpMessage('A network error occurred.')
    }
    setTriggeringHelp(false)
  }

  const handleGenerateReport = async () => {
    setLoadingReport(true)
    try {
      const res = await fetch(`/api/reports/weekly?studentId=${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data.report)
      }
    } catch (err) {
      console.error(err)
    }
    setLoadingReport(false)
  }

  const avgMood = useMemo(() => {
    if (moodLogs.length === 0) return 0
    return moodLogs.reduce((acc, log) => acc + log.score, 0) / moodLogs.length
  }, [moodLogs])

  const status = useMemo(() => {
    if (avgMood < 2 && moodLogs.length > 0) return { label: 'At Risk', color: 'var(--status-error)', icon: 'tabler:alert-triangle' }
    if (avgMood < 3.5 && moodLogs.length > 0) return { label: 'Needs Support', color: '#f59e0b', icon: 'tabler:alert-circle' }
    return { label: 'Stable', color: 'var(--status-success)', icon: 'tabler:circle-check' }
  }, [avgMood, moodLogs])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--surface-strong)] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg bg-[var(--surface-strong)] animate-pulse" />
            <div className="h-4 w-32 rounded-lg bg-[var(--surface-strong)] animate-pulse" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-3xl bg-[var(--surface-strong)] animate-pulse" />
          <div className="h-96 rounded-3xl bg-[var(--surface-strong)] animate-pulse" />
        </div>
      </div>
    )
  }

  if (!profile) return (
    <div className="py-20 text-center">
      <Text variant="h3">User not found</Text>
    </div>
  )

  const profileDisplayName = resolveProfileDisplayName({ profileName: profile.name }) || 'Student'

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Text as="h1" variant="h3" weight="bold">{profileDisplayName}</Text>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-strong)] border border-[var(--border-default)]">
              <Icon icon={status.icon} className="h-3.5 w-3.5" style={{ color: status.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: status.color }}>{status.label}</span>
            </div>
          </div>
          <Text className="text-sm text-[var(--text-muted)] mt-1">ID: {profile.id}</Text>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="warm" 
            size="sm"
            onClick={handleCriticalHelp} 
            disabled={triggeringHelp}
            className="rounded-xl shadow-lg shadow-orange-500/10"
          >
            <Icon icon="tabler:alert-octagon" className="mr-2 h-4 w-4" />
            {triggeringHelp ? 'Triggering...' : 'Flag Critical'}
          </Button>
          <Button 
            variant="warm" 
            size="sm"
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="rounded-xl"
          >
            <Icon icon="tabler:file-analytics" className="mr-2 h-4 w-4" />
            {loadingReport ? 'Analyzing...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {helpMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-[var(--status-success-light)] border border-[var(--status-success)] flex items-center gap-3"
          >
            <Icon icon="tabler:circle-check" className="h-5 w-5 text-[var(--status-success)]" />
            <Text weight="medium" className="text-[var(--status-success)]">{helpMessage}</Text>
            <button onClick={() => setHelpMessage('')} className="ml-auto text-[var(--status-success)] opacity-60 hover:opacity-100">
              <Icon icon="tabler:x" className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8">
        {/* Mood Trend Visualization */}
        <Card className="p-6 sm:p-8 rounded-[2rem] border-none bg-gradient-to-br from-[var(--surface-strong)] to-[var(--surface-soft)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Text variant="h4" weight="bold">Mood Resilience Trend</Text>
              <Text className="text-sm text-[var(--text-muted)] mt-1">Visualizing the last {moodLogs.length} logs</Text>
            </div>
            <div className="text-right">
              <Text className="text-3xl font-black text-[var(--action-primary)]">{avgMood.toFixed(1)}</Text>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Avg Score</Text>
            </div>
          </div>
          
          <div className="flex items-end gap-2 h-32 px-2">
            {moodLogs.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-[var(--border-default)] rounded-2xl">
                <Text className="text-[var(--text-muted)] italic">No data points yet</Text>
              </div>
            ) : (
              [...moodLogs].reverse().map((log, i) => (
                <motion.div 
                  key={log.id}
                  initial={{ height: 0 }}
                  animate={{ height: `${(log.score / 5) * 100}%` }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
                  className="flex-1 group relative"
                >
                  <div 
                    className="w-full h-full rounded-t-lg transition-all group-hover:brightness-110"
                    style={{ 
                      backgroundColor: log.score >= 4 ? 'var(--status-success)' : log.score >= 2 ? '#f59e0b' : 'var(--status-error)',
                      opacity: 0.6 + (log.score / 5) * 0.4
                    }}
                  />
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* AI Insights */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-[var(--action-primary-light)] bg-[var(--action-primary-light)]/10 p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Icon icon="tabler:brain" className="h-5 w-5 text-[var(--action-primary)]" />
                <Text variant="h4" weight="bold" className="text-[var(--action-primary)]">AI Insights</Text>
              </div>
              <ul className="space-y-2">
                {report.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--action-primary)]" />
                    <Text>{insight}</Text>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Icon icon="tabler:list-details" className="h-5 w-5 text-[var(--text-muted)]" />
            <Text variant="body" weight="bold">Recent Logs</Text>
          </div>
          {moodLogs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border-default)]">
              <Text className="text-[var(--text-muted)]">No mood logs recorded yet.</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {moodLogs.map((log, i) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex gap-4 p-5 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-default)] hover:border-[var(--border-strong)] transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold text-xl text-white shadow-md"
                    style={{ backgroundColor: log.score >= 4 ? 'var(--status-success)' : log.score >= 2 ? '#f59e0b' : 'var(--status-error)' }}>
                    {log.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text weight="bold" className="text-[15px]">Score: {log.score}/5</Text>
                      <Text className="text-[11px] text-[var(--text-muted)] uppercase font-medium">
                        {new Date(log.logged_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </Text>
                    </div>
                    {log.note && <Text className="text-sm text-[var(--text-secondary)] leading-relaxed italic">&quot;{log.note}&quot;</Text>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
