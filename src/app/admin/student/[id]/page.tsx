'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { PageIntro } from "@/components/site"
import { Button, Card, Text, SkeletonText } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

interface Profile {
  id: string
  name: string
  role: string
  institution: string | null
}

interface MoodLog {
  id: string
  score: number
  note: string | null
  logged_at: string
}

export default function AdminStudentDetailsPage() {
  const params = useParams()
  const studentId = params?.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [triggeringHelp, setTriggeringHelp] = useState(false)
  const [helpMessage, setHelpMessage] = useState('')
  const [report, setReport] = useState<any>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setMoodLogs(data.moodLogs || [])
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }, [studentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
      } else {
        console.error('Failed to generate report')
      }
    } catch (err) {
      console.error(err)
    }
    setLoadingReport(false)
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <SkeletonText lines={1} className="w-1/4 h-8" />
        <SkeletonText lines={3} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <Text>User not found.</Text>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <PageIntro 
        title={`User Details: ${profile.name || 'Unnamed'}`} 
        description="View user information, recent mood logs, and trigger necessary interventions." 
      />

      <Card className="p-6 bg-[var(--color-surface-soft)]">
        <Text variant="h3" className="mb-4">Profile Information</Text>
        <div className="space-y-2">
          <Text><strong>ID:</strong> {profile.id}</Text>
          <Text><strong>Role:</strong> {profile.role}</Text>
          <Text><strong>Institution:</strong> {profile.institution || 'None provided'}</Text>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <Text variant="h4" className="mb-2 text-[var(--color-accent)]">Emergency Action</Text>
          <Text className="text-sm text-[var(--color-text-secondary)] mb-4">
            If this user is showing severe warning signs, you can flag them for critical intervention manually.
          </Text>
          <div className="flex items-center gap-4">
            <Button 
              variant="warm" 
              onClick={handleCriticalHelp} 
              disabled={triggeringHelp}
            >
              {triggeringHelp ? 'Triggering...' : 'Provide Critical Help'}
            </Button>
            {helpMessage && (
              <Text className="text-sm text-[var(--color-success)]">{helpMessage}</Text>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[var(--color-surface-soft)]">
        <div className="flex justify-between items-center mb-4">
          <Text variant="h3">Weekly Report</Text>
          <Button variant="ghost" onClick={handleGenerateReport} disabled={loadingReport}>
            {loadingReport ? 'Generating...' : 'Generate Weekly Report'}
          </Button>
        </div>

        {report && (
          <div className="space-y-4 p-4 border border-[var(--color-border)] rounded-xl bg-white">
            <Text variant="h4">{report.title}</Text>
            <Text className="text-sm text-[var(--color-text-secondary)]">{report.dateRange}</Text>
            <div>
              <Text><strong>Logs Count:</strong> {report.logsCount}</Text>
              <Text><strong>Average Score:</strong> {report.averageMoodScore}</Text>
            </div>
            <div>
              <Text><strong>Insights:</strong></Text>
              <ul className="list-disc pl-5">
                {report.insights.map((insight: string, idx: number) => (
                  <li key={idx}><Text>{insight}</Text></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <Text variant="h3" className="mb-4">Recent Mood Logs</Text>
        {moodLogs.length === 0 ? (
          <Text className="text-[var(--color-text-muted)]">No recent mood entries found.</Text>
        ) : (
          <ul className="space-y-3">
            {moodLogs.map((log) => (
              <motion.li 
                key={log.id} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="p-4 border border-[var(--color-border)] rounded-xl flex justify-between"
              >
                <div>
                  <Text className="font-semibold text-lg">Score: {log.score}/5</Text>
                  {log.note && <Text className="text-sm italic">"{log.note}"</Text>}
                </div>
                <Text className="text-xs text-[var(--color-text-secondary)]">
                  {new Date(log.logged_at).toLocaleString()}
                </Text>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
