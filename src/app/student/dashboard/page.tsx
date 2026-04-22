'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react';
import { Button, Text, Modal } from '@/components/ui'
import { useChat } from '@/hooks/useChat'
import { getClient } from '@/lib/supabase/client'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { SettingsForm } from '@/components/settings/SettingsForm'

import { getAssessmentLabel } from '@/lib/question-bank'

import { MindTab } from './_components/MindTab'
import { BridgeTab } from './_components/BridgeTab'
import { QuestionSessionSheet } from './_components/QuestionSessionSheet'
import { DashboardSidebar } from './_components/DashboardSidebar'
import { CheckInModal } from './_components/CheckInModal'
import { BookingModal } from './_components/BookingModal'
import { AnalyticsModal } from './_components/AnalyticsModal'
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
    const [activeTab, setActiveTabState] = useState<TabId>(initialView.activeTab)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    const setActiveTab = useCallback((newTab: TabId) => {
        setActiveTabState(newTab)
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('tab', newTab)
            router.replace(url.pathname + url.search, { scroll: false })
        }
    }, [router])
    const [pendingCheckInOpen, setPendingCheckInOpen] = useState(initialView.pendingCheckInOpen)
    const [pendingQuestionnaireOpen, setPendingQuestionnaireOpen] = useState(initialView.pendingQuestionnaireOpen)
    const [showQuestionnaire, setShowQuestionnaire] = useState(initialView.showQuestionnaire)
    const [sessionId, setSessionId] = useState('')
    const [showCheckIn, setShowCheckIn] = useState(false)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
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
        const handleOpenSettings = () => setIsSettingsOpen(true);
        window.addEventListener('open-settings', handleOpenSettings);
        return () => window.removeEventListener('open-settings', handleOpenSettings);
    }, []);

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

            const resolvedProfileName = resolveProfileDisplayName({
                profileName: profileResult.data?.name ?? null,
                email: user.email,
                metadata: (user.user_metadata as Record<string, unknown> | null) ?? null,
            })

            if (resolvedProfileName && resolvedProfileName !== profileResult.data?.name) {
                const userRole =
                    typeof user.user_metadata?.role === 'string' && user.user_metadata.role === 'counselor'
                        ? 'counselor'
                        : 'student'
                await supabase.from('profiles').upsert({
                    id: user.id,
                    name: resolvedProfileName,
                    role: userRole,
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

            setUserName(resolvedProfileName || 'there')

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
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--action-primary)] border-t-transparent" />
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
        ? getAssessmentLabel(data.latestAssessment.severity)
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
            icon: <Icon icon="tabler:trending-up" className="h-5 w-5 text-[var(--action-primary)]" />,
        },
        {
            label: 'Next session',
            value: data?.nextSession || 'None',
            note: data?.nextSession ? 'Upcoming booking' : 'Book when ready',
            icon: <Icon icon="tabler:calendar" className="h-5 w-5 text-[var(--status-info)]" />,
        },
        {
            label: 'Latest scan',
            value: latestAssessmentLabel,
            note: latestAssessmentNote,
            icon: <Icon icon="tabler:activity-heartbeat" className="h-5 w-5 text-[var(--action-primary)]" />,
        },
        {
            label: 'Active chats',
            value: `${data?.activeChats || 0}`,
            note: 'This week',
            icon: <Icon icon="tabler:message-circle" className="h-5 w-5 text-[var(--status-success)]" />,
        },
    ]

    return (
        <div className="[--brm:0.78] flex h-full overflow-hidden bg-[var(--surface-tinted)] lg:bg-[var(--bg-page)]">
            <DashboardSidebar
                userName={userName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSwitchToBridge={() => setActiveTab("bridge")}
                onSwitchToMind={() => setActiveTab("mind")}
                startNewSession={startNewSession}
                onOpenQuestionnaire={() => setShowQuestionnaire(true)}
                setShowCheckIn={setShowCheckIn}
                setShowBookingModal={setShowBookingModal}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="relative flex flex-1 flex-col overflow-hidden bg-[var(--surface-tinted)] lg:bg-[var(--bg-page)]">
                {/* Global View Switcher Pill */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[30] flex items-center p-1 rounded-full bg-[var(--surface-strong)] backdrop-blur-md shadow-md">
                    <button
                        onClick={() => setActiveTab('mind')}
                        className={`relative flex items-center justify-center rounded-full px-5 py-2 text-[14px] font-bold transition-[background-color,color,transform] duration-200 active:scale-[0.96] border-none outline-none ${
                            activeTab === 'mind'
                                ? 'bg-[var(--surface-default)] text-[var(--action-primary)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        Mind Space
                    </button>
                    <button
                        onClick={() => setActiveTab('bridge')}
                        className={`relative flex items-center justify-center rounded-full px-5 py-2 text-[14px] font-bold transition-[background-color,color,transform] duration-200 active:scale-[0.96] border-none outline-none ${
                            activeTab === 'bridge'
                                ? 'bg-[var(--surface-default)] text-[var(--action-primary)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        Dashboard
                    </button>
                </div>

                <div className={`h-full w-full ${activeTab === 'mind' ? 'block' : 'hidden'}`}>
                    <MindTab
                        messages={messages}
                        sendMessage={sendMessage}
                        isLoading={isLoading}
                        error={error}
                        stopGenerating={stopGenerating}
                        onOpenQuestionnaire={() => setShowQuestionnaire(true)}
                        onOpenSidebar={() => setSidebarOpen(true)}
                        onOpenCheckIn={() => setShowCheckIn(true)}
                        onOpenBooking={() => setShowBookingModal(true)}
                        onOpenAnalytics={() => setShowAnalyticsModal(true)}
                    />
                </div>
                <div className={`h-full w-full ${activeTab === 'bridge' ? 'block' : 'hidden'}`}>
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
                        onOpenSidebar={() => setSidebarOpen(true)}
                        onOpenBooking={() => setShowBookingModal(true)}
                    />
                </div>
            </div>

            <CheckInModal isOpen={showCheckIn || pendingCheckInOpen} onClose={() => { setShowCheckIn(false); handleAutoOpenCheckInHandled(); }} onComplete={refreshDashboardInsights} />
            <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
            <AnalyticsModal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)} onGoToDashboard={() => setActiveTab('bridge')} />

            <QuestionSessionSheet
                isOpen={showQuestionnaire}
                onClose={closeQuestionnaire}
                onComplete={refreshDashboardInsights}
                onChatRequested={() => setActiveTab('mind')}
            />

            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Account Settings"
                size="md"
            >
                <div className="px-8 pb-10 pt-4">
                    <SettingsForm onSuccess={() => setIsSettingsOpen(false)} />
                </div>
            </Modal>
        </div>
    )
}
