'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Text, Skeleton } from "@/components/ui"
import { Icon } from '@iconify/react'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { cn } from "@/lib/utils"

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
    if (avgMood < 2 && moodLogs.length > 0) return { label: 'Priority Escalation', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' }
    if (avgMood < 3.5 && moodLogs.length > 0) return { label: 'Active Monitoring', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' }
    return { label: 'Stable Index', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' }
  }, [avgMood, moodLogs])

  if (loading) {
    return (
      <div className="space-y-8 p-1">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      </div>
    )
  }

  if (!profile) return (
    <div className="py-20 text-center opacity-30">
      <Icon icon="tabler:lock-access" className="h-10 w-10 mx-auto mb-4" />
      <Text className="text-[10px] font-medium ">Restricted Record</Text>
    </div>
  )

  const profileDisplayName = resolveProfileDisplayName({ profileName: profile.name }) || 'User'

  return (
    <div 
      
      
      
      className="space-y-12"
    >
      
      {/* ── Diagnostic Header ── */}
      <div  className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded bg-surface-raised text-white flex items-center justify-center font-medium text-xl border border-border shadow-sm ">
            {profileDisplayName.charAt(0)}
          </div>
          <div>
            <Text weight="semibold" className="text-lg text-white leading-none">{profileDisplayName}</Text>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn("badge px-2 py-0.5 text-[9px]", status.bg, status.border, status.color)}>
                {status.label}
              </span>
              <Text variant="small" className="text-[9px] text-text-dim font-medium tracking-[0.2em] tabular-nums">REF: {profile.id.split('-')[0]}</Text>
            </div>
          </div>
        </div>
        <Button 
          variant="danger" 
          size="sm"
          onClick={handleCriticalHelp} 
          disabled={triggeringHelp}
          className=" text-[10px] font-medium h-8 px-4"
        >
          <Icon icon="tabler:alert-octagon" className="mr-2 h-3.5 w-3.5" />
          Escalate
        </Button>
      </div>

      
        {helpMessage && (
          <div
            
            
            
            className="p-3 rounded-md bg-success/10 border border-success/20 flex items-center gap-3 text-success font-medium text-[11px] "
          >
            <Icon icon="tabler:check" className="h-4 w-4" />
            {helpMessage}
          </div>
        )}
      

      {/* ── Resilience Analysis ── */}
      <div  className="card p-8 bg-surface-raised">
        <div className="flex items-center justify-between mb-10 px-1">
          <Text variant="small" weight="medium" className="text-[10px] font-medium tracking-[0.2em] text-text-dim">Resilience Analysis</Text>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <Text className="text-3xl font-bold text-white tracking-tight tabular-nums leading-none">{avgMood.toFixed(1)}</Text>
              <Text variant="small" className="text-xs font-medium text-text-dim ">/ 5.0</Text>
            </div>
          </div>
        </div>
        
        <div className="flex items-end gap-1.5 h-24 px-1">
          {moodLogs.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded opacity-20">
              <Text className="text-[9px] font-medium text-text-dim">Baseline Pending</Text>
            </div>
          ) : (
            [...moodLogs].reverse().slice(-20).map((log, i) => (
              <div key={log.id} className="flex-1 group relative h-full flex items-end">
                <div 
                  
                  
                  
                  className={cn(
                    "w-full rounded-t-sm transition-all cursor-help origin-bottom",
                    log.score >= 4 ? "bg-success" : log.score >= 2 ? "bg-warning" : "bg-danger"
                  )}
                  style={{ opacity: 0.3 + (log.score / 5) * 0.5 }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                  <div className="bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xl tabular-nums">
                    {log.score}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Intelligence Feed ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <Text variant="small" weight="medium" className="text-[10px] font-medium tracking-[0.2em] text-text-dim">Diagnostic Narrative</Text>
          <button 
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="text-[9px] font-medium text-primary hover:text-primary-hover disabled:opacity-30 transition-all flex items-center gap-2 active:scale-95"
          >
            {loadingReport && <Icon icon="tabler:loader-2" className="h-3 w-3 animate-spin" />}
            {loadingReport ? 'Analyzing...' : 'Refresh AI Analysis'}
          </button>
        </div>

        {report && (
          <div 
            
            
            className="p-6 rounded-lg bg-primary/5 border border-primary/20 space-y-6"
          >
            <div className="flex items-center gap-2">
              <Icon icon="tabler:sparkles" className="h-4 w-4 text-primary" />
              <Text variant="small" weight="medium" className="text-[10px] font-medium text-primary">AI Clinical Insights</Text>
            </div>
            <div className="space-y-4">
              {report.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                  <Text className="text-sm text-text-muted leading-relaxed tracking-tight group-hover:text-white transition-colors">{insight}</Text>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {moodLogs.slice(0, 10).map((log) => (
            <div 
              key={log.id} 
              
              className="flex gap-5 p-4 rounded-md bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div 
                className={cn(
                  "h-10 w-10 shrink-0 rounded flex items-center justify-center font-bold text-xs text-black tabular-nums transition-all opacity-80",
                  log.score >= 4 ? "bg-success" : log.score >= 2 ? "bg-warning" : "bg-danger"
                )}
              >
                {log.score}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <Text variant="small" className="text-[9px] font-medium text-text-dim tabular-nums">
                    {new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(log.logged_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
                <Text className="text-sm text-text-muted leading-relaxed italic group-hover:text-white transition-colors">
                  &ldquo;{log.note || 'No narrative provided.'}&rdquo;
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
