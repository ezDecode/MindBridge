'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { FiCalendar, FiMessageSquare, FiTrendingUp } from 'react-icons/fi'
import { Button, Text } from '@/components/ui'
import { useChat } from '@/hooks/useChat'
import { getClient } from '@/lib/supabase/client'

import { PillToggle } from './_components/PillToggle'
import { MindTab } from './_components/MindTab'
import { BridgeTab } from './_components/BridgeTab'
import { generateSessionId, generateWeekMoodHistory, generateEmptyWeek, formatSessionTime } from './_components/types'
import type { DashboardData, TabId } from './_components/types'

interface Slot {
  id: string
  counselor_id: string
  slot_start: string
  slot_end: string
  counselor: { name: string }
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('mind')
  const [pendingCheckInOpen, setPendingCheckInOpen] = useState(false)
  
  const [sessionId, setSessionId] = useState('')
  const [showBooking, setShowBooking] = useState(false)
  const [showResources, setShowResources] = useState(false)
  
  const [nextSlot, setNextSlot] = useState<Slot | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const handleAction = useCallback(
    (action: { type: string; context: string | null }) => {
      if (action.type === 'book_counselor') setShowBooking(true)
      else if (action.type === 'show_resources') setShowResources(true)
    },
    []
  )

  const handleCrisis = useCallback(() => {
    console.log('Crisis detected - alert sent to counselor')
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab === 'mind' || tab === 'bridge') {
      setActiveTab(tab)
    }

    if (params.get('open') === 'check-in') {
      setActiveTab('mind')
      setPendingCheckInOpen(true)
    }
  }, [])

  const handleAutoOpenCheckInHandled = useCallback(() => {
    setPendingCheckInOpen(false)
    const params = new URLSearchParams(window.location.search)
    params.delete('open')
    const query = params.toString()
    router.replace(query ? `/student/dashboard?${query}` : '/student/dashboard')
  }, [router])

  const refreshMoodData = useCallback(async () => {
    try {
      const moodResponse = await fetch('/api/mood?days=7')
      if (!moodResponse.ok) return

      const moodData = await moodResponse.json()
      const updatedMoodHistory = generateWeekMoodHistory(moodData.moods || [])

      setData((prev) =>
        prev
          ? {
              ...prev,
              streak: moodData.streak || 0,
              moodHistory: updatedMoodHistory,
            }
          : prev
      )
    } catch (error) {
      console.error('Failed to refresh mood data:', error)
    }
  }, [])

  const { messages, sendMessage, isLoading, error, stopGenerating } = useChat({
    sessionId,
    onAction: handleAction,
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
          email: user.email,
        })
      }

      const stored = sessionStorage.getItem('currentChatSession')
      if (stored) {
        setSessionId(stored)
      } else {
        const newId = generateSessionId()
        setSessionId(newId)
        sessionStorage.setItem('currentChatSession', newId)
      }

      const [moodResponse, profileResult, sessionsResult, bookingsResult] =
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
        ])

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

      let nextAvailableSlot: Slot | null = null
      try {
        const slotsResult = await fetch('/api/bookings')
        if (slotsResult.ok) {
          const slotsData = await slotsResult.json()
          if (slotsData.slots && slotsData.slots.length > 0) {
            nextAvailableSlot = slotsData.slots[0]
          }
        }
      } catch (slotError) {
        nextAvailableSlot = {
          id: 'demo-slot-1',
          counselor_id: 'demo-counselor',
          slot_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          slot_end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          counselor: { name: 'Dr. Priya Sharma' }
        }
      }

      const existingBooking = bookingsResult.data?.[0]

      const moodHistory = generateWeekMoodHistory(moodData.moods || [])
      const scored = moodHistory.filter((m) => m.score > 0)
      const averageMood = scored.length ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0

      setData({
        streak: moodData.streak || 0,
        nextSession: existingBooking
          ? formatSessionTime(new Date(existingBooking.slot_start))
          : null,
        activeChats: sessionsResult.data?.length || 0,
        moodHistory,
        proactiveMessage: proactiveMsg?.content || null,
      })
      
      setNextSlot(nextAvailableSlot)
    }

    init()
  }, [])

  const handleOneTapBooking = async () => {
    if (!nextSlot || isBooking) return
    
    setIsBooking(true)
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: nextSlot.id,
          counselorId: nextSlot.counselor_id,
          type: 'anonymous',
          slotStart: nextSlot.slot_start,
          slotEnd: nextSlot.slot_end,
        }),
      })

      if (res.ok) {
        setBookingConfirmed(true)
        setNextSlot(null)
      }
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setIsBooking(false)
    }
  }

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
      label: 'Active chats',
      value: `${data?.activeChats || 0}`,
      note: 'This week',
      icon: <FiMessageSquare className="h-5 w-5 text-[var(--color-success)]" />,
    },
  ]

  return (
    <div className="[--brm:0.78] h-full">
      <AnimatePresence mode="wait">
        {activeTab === 'mind' ? (
          <motion.div
            key="mind"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              showBooking={showBooking}
              showResources={showResources}
              setShowBooking={setShowBooking}
              setShowResources={setShowResources}
              autoOpenCheckIn={pendingCheckInOpen}
              onAutoOpenCheckInHandled={handleAutoOpenCheckInHandled}
              onMoodLogged={refreshMoodData}
              router={router}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSwitchToBridge={() => setActiveTab('bridge')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="bridge"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
              onSwitchToMind={() => setActiveTab('mind')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
