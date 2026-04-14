'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { FiActivity, FiCalendar, FiMessageSquare, FiTrendingUp } from 'react-icons/fi'
import { Button, Text } from '@/components/ui'
import { useChat } from '@/hooks/useChat'
import { getClient } from '@/lib/supabase/client'

import { MindTab } from './_components/MindTab'
import { BridgeTab } from './_components/BridgeTab'
import { QuestionSessionSheet } from './_components/QuestionSessionSheet'
import { generateSessionId, generateWeekMoodHistory, generateEmptyWeek, formatSessionTime } from './_components/types'
import type { DashboardData, TabId } from './_components/types'

function getInitialDashboardView(): {
  activeTab: TabId
  pendingCheckInOpen: boolean
  pendingQuestionnaireOpen: boolean
  showQuestionnaire: boolean
} {
  if (typeof window === 'undefined') {
    return {
      activeTab: 'mind' as TabId,
      pendingCheckInOpen: false,
      pendingQuestionnaireOpen: false,
      showQuestionnaire: false,
    }
  }

  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  const open = params.get('open')

  return {
    activeTab: tab === 'bridge' ? 'bridge' : 'mind',
    pendingCheckInOpen: open === 'check-in',
    pendingQuestionnaireOpen: open === 'questions',
    showQuestionnaire: open === 'questions',
  }
}

export default function StudentDashboardPage() {
  const initialView = getInitialDashboardView()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>(initialView.activeTab)
  const [pendingCheckInOpen, setPendingCheckInOpen] = useState(initialView.pendingCheckInOpen)
  const [pendingQuestionnaireOpen, setPendingQuestionnaireOpen] = useState(initialView.pendingQuestionnaireOpen)
  const [showQuestionnaire, setShowQuestionnaire] = useState(initialView.showQuestionnaire)
  const [sessionId, setSessionId] = useState('')

  const handleCrisis = useCallback(() => {
    console.log('Crisis detected - alert sent to counselor')
  }, [])

  const handleAutoOpenCheckInHandled = useCallback(() => {
    setPendingCheckInOpen(false)
    const params = new URLSearchParams(window.location.search)
    params.delete('open')
    const query = params.toString()
    router.replace(query ? `/student/dashboard?${query}` : '/student/dashboard')
  }, [router])

  const closeQuestionnaire = useCallback(() => {
    setShowQuestionnaire(false)

    if (!pendingQuestionnaireOpen) return

    setPendingQuestionnaireOpen(false)
    const params = new URLSearchParams(window.location.search)
    params.delete('open')
    const query = params.toString()
    router.replace(query ? `/student/dashboard?${query}` : '/student/dashboard')
  }, [pendingQuestionnaireOpen, router])

  const refreshDashboardInsights = useCallback(async () => {
    try {
      const supabase = getClient()
      const moodResponse = await fetch('/api/mood?days=7')
      const assessmentResult = await supabase
        .from('assessments')
        .select('severity, criteria_flagged, assessed_at')
        .order('assessed_at', { ascending: false })
        .limit(1)

      if (!moodResponse.ok) return

      const moodData = await moodResponse.json()
      const updatedMoodHistory = generateWeekMoodHistory(moodData.moods || [])
      const latestAssessment = assessmentResult.data?.[0]

      setData((prev) =>
        prev
          ? {
              ...prev,
              streak: moodData.streak || 0,
              moodHistory: updatedMoodHistory,
              latestAssessment: latestAssessment
                ? {
                    severity: latestAssessment.severity,
                    criteriaFlagged: latestAssessment.criteria_flagged || [],
                    assessedAt: latestAssessment.assessed_at,
                  }
                : prev.latestAssessment,
            }
          : prev
      )
    } catch (error) {
      console.error('Failed to refresh mood data:', error)
    }
  }, [])

  const { messages, sendMessage, isLoading, error, stopGenerating } = useChat({
    sessionId,
    onCrisis: handleCrisis,
  })

  const startNewSession = () => {
    const newId = generateSessionId()
    setSessionId(newId)
    sessionStorage.setItem('currentChatSession', newId)
    window.location.reload()
  }

  useEffect(() => {
    const init = async () => {
      const supabase = getClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        return
      }

      setIsAuthenticated(true)

      const stored = sessionStorage.getItem('currentChatSession')
      if (stored) {
        setSessionId(stored)
      } else {
        const newId = generateSessionId()
        setSessionId(newId)
        sessionStorage.setItem('currentChatSession', newId)
      }

      const [moodResponse, profileResult, sessionsResult, bookingsResult, assessmentResult] =
        await Promise.all([
          fetch('/api/mood?days=7'),
          supabase.from('profiles').select('name').eq('id', user.id).single(),
          supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_id', user.id)
            .gte('last_message_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from('bookings')
            .select('slot_start, type, status, counselor:profiles!counselor_id(name)')
            .eq('student_id', user.id)
            .in('status', ['pending_confirmation', 'confirmed'])
            .gte('slot_start', new Date().toISOString())
            .order('slot_start', { ascending: true })
            .limit(1),
          supabase
            .from('assessments')
            .select('severity, criteria_flagged, assessed_at')
            .eq('user_id', user.id)
            .order('assessed_at', { ascending: false })
            .limit(1),
        ])

      let generatedName = profileResult.data?.name
      if (!generatedName && user.email) {
        const randomAdjectives = ['Calm', 'Bright', 'Gentle', 'Warm', 'Peaceful', 'Serene', 'Kind', 'Happy', 'Mellow', 'Quiet']
        const randomNouns = ['Mind', 'Heart', 'Soul', 'Spirit', 'Wave', 'Leaf', 'Star', 'Moon', 'Cloud', 'River']
        const adj = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)]
        const noun = randomNouns[Math.floor(Math.random() * randomNouns.length)]
        generatedName = `${adj}${noun}`
        
        await supabase.from('profiles').upsert({
          id: user.id,
          name: generatedName,
          role: 'student',
        })
      }

      let moodData = { moods: [], streak: 0, average: null }
      if (moodResponse.ok) moodData = await moodResponse.json()

      const { data: proactiveMsg } = await supabase
        .from('chat_messages')
        .select('content')
        .eq('user_id', user.id)
        .eq('proactive', true)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single()

      setUserName(generatedName || 'there')

      const existingBooking = bookingsResult.data?.[0]
      const latestAssessment = assessmentResult.data?.[0]

      const moodHistory = generateWeekMoodHistory(moodData.moods || [])

      setData({
        streak: moodData.streak || 0,
        nextSession: existingBooking
          ? formatSessionTime(new Date(existingBooking.slot_start))
          : null,
        activeChats: sessionsResult.data?.length || 0,
        moodHistory,
        proactiveMessage: proactiveMsg?.content || null,
        latestAssessment: latestAssessment
          ? {
              severity: latestAssessment.severity,
              criteriaFlagged: latestAssessment.criteria_flagged || [],
              assessedAt: latestAssessment.assessed_at,
            }
          : null,
      })
    }

    init()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <Text as="p" variant="body" color="secondary" className="mt-4">Loading...</Text>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Text as="h1" variant="h2" weight="bold">Sign in to continue</Text>
        <Text as="p" variant="body" color="secondary" className="mt-3 max-w-md">
          Track your mood, chat with MindBridge, and book counselor sessions.
        </Text>
        <div className="mt-6 flex gap-3">
          <Button href="/login">Sign in</Button>
          <Button href="/student/resources" variant="warm">Browse resources</Button>
        </div>
      </div>
    )
  }

  const moodHistory = data?.moodHistory || generateEmptyWeek()
  const scored = moodHistory.filter((m) => m.score > 0)
  const averageMood = scored.length ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0
  const bestDay = scored.length ? scored.reduce((a, b) => (b.score > a.score ? b : a)) : null
  const worstDay = scored.length ? scored.reduce((a, b) => (b.score < a.score ? b : a)) : null

  const trendDirection = (() => {
    if (scored.length < 2) return 'steady'
    const half = Math.ceil(scored.length / 2)
    const avgFirst = scored.slice(0, half).reduce((a, b) => a + b.score, 0) / half
    const avgSecond = scored.slice(half).reduce((a, b) => a + b.score, 0) / scored.slice(half).length
    if (avgSecond - avgFirst > 0.3) return 'improving'
    if (avgFirst - avgSecond > 0.3) return 'declining'
    return 'steady'
  })()

  const latestAssessmentLabel = data?.latestAssessment
    ? data.latestAssessment.severity === 'none'
      ? 'Stable'
      : data.latestAssessment.severity[0].toUpperCase() + data.latestAssessment.severity.slice(1)
    : 'Pending'

  const latestAssessmentNote = data?.latestAssessment
    ? data.latestAssessment.criteriaFlagged.length
      ? data.latestAssessment.criteriaFlagged
          .slice(0, 2)
          .map((item) => item.replaceAll('_', ' '))
          .join(' • ')
      : 'No urgent flags'
    : 'Run a guided check-in'

  const metrics = [
    {
      label: 'Check-in streak',
      value: `${data?.streak || 0} days`,
      note: data?.streak ? 'Keep it going! 🔥' : 'Start your streak today',
      icon: <FiTrendingUp className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      label: 'Next session',
      value: data?.nextSession || 'None',
      note: data?.nextSession ? 'Upcoming booking' : 'Book when ready',
      icon: <FiCalendar className="h-5 w-5 text-[var(--color-info)]" />,
    },
    {
      label: 'Latest scan',
      value: latestAssessmentLabel,
      note: latestAssessmentNote,
      icon: <FiActivity className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      label: 'Active chats',
      value: `${data?.activeChats || 0}`,
      note: 'This week',
      icon: <FiMessageSquare className="h-5 w-5 text-[var(--color-success)]" />,
    },
  ]

  return (
    <div className="[--brm:0.78] h-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === "mind" ? (
          <motion.div
            key="mind"
            initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <MindTab
              userName={userName}
              data={data}
              messages={messages}
              sendMessage={sendMessage}
              isLoading={isLoading}
              error={error}
              stopGenerating={stopGenerating}
              startNewSession={startNewSession}
              autoOpenCheckIn={pendingCheckInOpen}
              onAutoOpenCheckInHandled={handleAutoOpenCheckInHandled}
              onMoodLogged={refreshDashboardInsights}
              onOpenQuestionnaire={() => setShowQuestionnaire(true)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSwitchToBridge={() => setActiveTab("bridge")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="bridge"
            initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <BridgeTab
              data={data}
              userName={userName}
              metrics={metrics}
              moodHistory={moodHistory}
              averageMood={averageMood}
              bestDay={bestDay}
              worstDay={worstDay}
              trendDirection={trendDirection}
              completedDays={scored.length}
              onOpenQuestionnaire={() => setShowQuestionnaire(true)}
              onSwitchToMind={() => setActiveTab("mind")}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <QuestionSessionSheet
        isOpen={showQuestionnaire}
        onClose={closeQuestionnaire}
        onComplete={refreshDashboardInsights}
        onChatRequested={() => setActiveTab('mind')}
      />
    </div>
  )
}
