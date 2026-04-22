'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Text, Skeleton } from "@/components/ui"
import { motion, AnimatePresence } from 'motion/react'
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const slideIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
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
        setHelpMessage('Clinical intervention requested.')
      }
    } catch (err) {
      console.error(err)
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
    if (avgMood < 2 && moodLogs.length > 0) return { label: 'Priority Escalation', color: 'text-status-error', bg: 'bg-status-error/5', border: 'border-status-error/20' }
    if (avgMood < 3.5 && moodLogs.length > 0) return { label: 'Active Monitoring', color: 'text-status-warning', bg: 'bg-status-warning/5', border: 'border-status-warning/20' }
    return { label: 'Stable Index', color: 'text-action-primary', bg: 'bg-action-primary/5', border: 'border-action-primary/20' }
  }, [avgMood, moodLogs])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-24 bg-surface-strong/30 rounded-xl" />
        <Skeleton className="h-48 bg-surface-strong/20 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 bg-surface-strong/10 rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (!profile) return (
    <div className="py-20 text-center opacity-30">
      <Icon icon="tabler:lock-access" className="h-10 w-10 mx-auto mb-4" />
      <Text className="text-[10px] font-bold uppercase tracking-widest">Restricted Record</Text>
    </div>
  )

  const profileDisplayName = resolveProfileDisplayName({ profileName: profile.name }) || 'User'

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-10"
    >
      
      {/* ── Diagnostic Header ── */}
      <motion.div variants={slideIn} className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-full bg-surface-strong text-text-primary flex items-center justify-center font-bold text-xl border border-border-default shadow-sm">
            {profileDisplayName.charAt(0)}
          </div>
          <div>
            <Text className="text-xl font-bold tracking-tight">{profileDisplayName}</Text>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${status.bg} ${status.border} ${status.color}`}>
                {status.label}
              </span>
              <Text className="text-[10px] text-text-muted font-medium tabular-nums opacity-60">REF: {profile.id.split('-')[0]}</Text>
            </div>
          </div>
        </div>
        <Button 
          variant="danger" 
          size="sm"
          onClick={handleCriticalHelp} 
          disabled={triggeringHelp}
          className="rounded-lg h-9 px-4 active:scale-[0.96] transition-transform"
        >
          <Icon icon="tabler:alert-octagon" className="mr-2 h-4 w-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Escalate</span>
        </Button>
      </motion.div>

      <AnimatePresence initial={false}>
        {helpMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-lg bg-status-success/5 border border-status-success/20 flex items-center gap-3 text-status-success font-bold text-[13px]"
          >
            <Icon icon="tabler:check" className="h-4 w-4" />
            {helpMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resilience Analysis ── */}
      <motion.div variants={slideIn} className="bg-surface-default border border-border-default rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted opacity-60">Resilience Analysis</Text>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <Text className="text-3xl font-bold text-text-primary tracking-tight tabular-nums">{avgMood.toFixed(1)}</Text>
              <Text className="text-sm font-medium text-text-muted/40">/ 5.0</Text>
            </div>
          </div>
        </div>
        
        <div className="flex items-end gap-1.5 h-24 px-1">
          {moodLogs.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-border-default rounded-lg opacity-20">
              <Text className="text-[10px] font-bold uppercase tracking-widest">Baseline Pending</Text>
            </div>
          ) : (
            [...moodLogs].reverse().slice(-20).map((log, i) => (
              <div key={log.id} className="flex-1 group relative h-full flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(log.score / 5) * 100}%` }}
                  transition={{ delay: i * 0.02, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full rounded-t-[2px] transition-colors cursor-help origin-bottom"
                  style={{ 
                    backgroundColor: log.score >= 4 ? 'var(--status-success)' : log.score >= 2 ? 'var(--status-warning)' : 'var(--status-error)',
                    opacity: 0.5 + (log.score / 5) * 0.5
                  }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <div className="bg-text-primary text-text-inverse text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xl tabular-nums">
                    {log.score}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Intelligence Feed ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-default/50 pb-3">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted opacity-60">Diagnostic Narrative</Text>
          <button 
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="text-[10px] font-bold uppercase tracking-wider text-action-primary hover:opacity-70 disabled:opacity-30 transition-all flex items-center gap-2 active:scale-95"
          >
            {loadingReport && <Icon icon="tabler:loader-2" className="h-3 w-3 animate-spin" />}
            {loadingReport ? 'Analyzing...' : 'Refresh AI Analysis'}
          </button>
        </div>

        {report && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-action-primary/5 border border-action-primary/10 space-y-4"
          >
            <div className="flex items-center gap-2 opacity-60">
              <Icon icon="tabler:sparkles" className="h-3.5 w-3.5 text-action-primary" />
              <Text className="text-[10px] font-bold uppercase tracking-wider text-action-primary">AI Clinical Insights</Text>
            </div>
            <div className="space-y-3">
              {report.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-3 group">
                  <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-action-primary/40" />
                  <Text className="text-[13.5px] text-text-secondary leading-relaxed font-medium tracking-tight group-hover:text-text-primary transition-colors">{insight}</Text>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {moodLogs.slice(0, 10).map((log) => (
            <motion.div 
              key={log.id} 
              variants={slideIn}
              className="flex gap-4 p-4 rounded-xl bg-surface-default border border-border-default/50 hover:border-action-primary/20 transition-colors group"
            >
              <div 
                className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm text-text-inverse tabular-nums shadow-sm"
                style={{ backgroundColor: log.score >= 4 ? 'var(--status-success)' : log.score >= 2 ? 'var(--status-warning)' : 'var(--status-error)', opacity: 0.8 }}
              >
                {log.score}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted/60">
                    {new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(log.logged_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
                <Text className="text-[13px] text-text-secondary leading-relaxed italic font-medium tracking-tight">
                  {log.note || 'No narrative provided.'}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
