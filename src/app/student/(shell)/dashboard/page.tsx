'use client'

import { useState, useEffect } from 'react'
import { generateWeekMoodHistory, formatSessionTime, type MoodRecord } from './_components/types'
import type { DashboardData } from './_components/types'
import Link from 'next/link'


import { Icon } from '@iconify/react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { Button, Text } from "@/components/ui"

import { getProfile } from '@/lib/auth/actions'

const MOOD_MAP = [
    { val: 1, label: 'Low', icon: 'tabler:mood-sad', color: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' },
    { val: 2, label: 'Down', icon: 'tabler:mood-neutral', color: 'text-orange-400', bg: 'bg-orange-400/10', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.15)]' },
    { val: 3, label: 'Okay', icon: 'tabler:mood-smile', color: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]' },
    { val: 4, label: 'Good', icon: 'tabler:mood-happy', color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]' },
    { val: 5, label: 'Great', icon: 'tabler:mood-smile-beam', color: 'text-primary', bg: 'bg-primary/10', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]' }
]

export default function StudentDashboardPage() {
    return <StudentDashboardPageContent />
}

function StudentDashboardPageContent() {
    const { showToast } = useToast()
    const [initError, setInitError] = useState<string | null>(null)
    const [data, setData] = useState<DashboardData & { recentMoods: MoodRecord[] } | null>(null)
    const [xp, setXp] = useState(0)
    const [userName, setUserName] = useState('')
    const [selectedMood, setSelectedMood] = useState<number>(0)
    const [isLogging, setIsLogging] = useState(false)

    useEffect(() => {
        const init = async () => {
            try {
                const user = await getProfile()
                
                if (!user || !user.id) {
                    throw new Error("User not available")
                }

                setUserName(user.name?.split(' ')[0] || 'there')

                let moodHistory: { day: string; score: number }[] = generateWeekMoodHistory([])
                let streak = 0
                let currentXp = 0
                let nextSession: string | null = null
                let activeChats = 0
                let latestAssessment: DashboardData['latestAssessment'] = null
                let recentMoods: MoodRecord[] = []

                // Fetch mood data
                try {
                    const moodResponse = await fetch('/api/mood?days=30')
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json()
                        streak = moodData.streak || 0
                        currentXp = moodData.xp || 0
                        recentMoods = (moodData.moods || []).slice(0, 4)
                        setXp(currentXp)
                        moodHistory = Array.isArray(moodData.moods) ? generateWeekMoodHistory(moodData.moods) : generateWeekMoodHistory([])
                    }
                } catch (e) {
                    console.error('Mood fetch failed:', e)
                }

                // Fetch dashboard core data
                try {
                    const dashRes = await fetch(`/api/student/dashboard?_t=${Date.now()}`, { cache: 'no-store' })
                    if (dashRes.ok) {
                        const dashData = await dashRes.json()
                        
                        if (Array.isArray(dashData.sessions)) {
                            activeChats = dashData.sessions.length
                        }
                        
                        if (Array.isArray(dashData.bookings) && dashData.bookings.length > 0) {
                            const existingBooking = dashData.bookings[0]
                            if (existingBooking && existingBooking.slot_start) {
                                nextSession = formatSessionTime(new Date(existingBooking.slot_start))
                            }
                        }
                        
                        if (Array.isArray(dashData.assessments) && dashData.assessments.length > 0) {
                            const latest = dashData.assessments[0]
                            if (latest) {
                                latestAssessment = {
                                    severity: latest.severity,
                                    criteriaFlagged: Array.isArray(latest.criteria_flagged) ? latest.criteria_flagged : [],
                                    assessedAt: latest.assessed_at,
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Dashboard core fetch failed:', e)
                }

                setData({
                    streak,
                    nextSession,
                    activeChats,
                    moodHistory,
                    proactiveMessage: null,
                    latestAssessment,
                    recentMoods
                })
            } catch (err) {
                console.error("Dashboard error:", err)
                setInitError("Failed to load dashboard")
            }
        }

        init()
    }, [])

    const logMood = async () => {
        if (!selectedMood || isLogging) return;
        setIsLogging(true)
        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: selectedMood, note: 'Logged from dashboard' })
            })
            if (res.ok) {
                const responseData = await res.json()
                showToast(responseData.xpAwarded ? "Mood logged! +10 XP" : "Mood logged! (Daily XP already earned)", "success")
                
                const moodResponse = await fetch('/api/mood?days=30')
                if (moodResponse.ok) {
                    const moodData = await moodResponse.json()
                    setXp(moodData.xp || 0)
                    setData(prev => prev ? { 
                        ...prev, 
                        streak: moodData.streak, 
                        moodHistory: generateWeekMoodHistory(moodData.moods),
                        recentMoods: (moodData.moods || []).slice(0, 4)
                    } : null)
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLogging(false)
        }
    }

    if (initError) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-8 border border-red-500 bg-red-500/10 text-red-500 rounded-lg max-w-lg w-full text-center">
                <Icon icon="tabler:alert-triangle" className="text-2xl mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Failed to load dashboard</h3>
                <p className="text-[1.0625rem] font-mono break-all">{initError}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-500 text-white rounded font-medium typo-base hover:bg-red-600 transition-colors">Reload Page</button>
            </div>
        </div>
    )

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-text-muted font-medium animate-pulse">Setting the scene for your wellness...</p>
        </div>
    )

    const scored = data.moodHistory.filter((m) => m.score > 0)
    const averageMood = scored.length ? scored.reduce((acc, curr) => acc + curr.score, 0) / scored.length : 0
    const isLoggedToday = scored.some(m => {
        const d = new Date();
        const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return m.day === days[d.getDay()] && m.score > 0;
    })

    return (
        <div className="w-full pb-20">
            <div className="mx-auto max-w-7xl space-y-10">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Text variant="h1" className="mb-2">
                            Good morning, <span className="text-primary">{userName}</span>
                        </Text>
                        <div className="flex items-center gap-4">
                            <Text color="muted" weight="medium" className="flex items-center gap-2" suppressHydrationWarning>
                                <Icon icon="tabler:calendar-heart" className="text-primary/60" />
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Text>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface border border-border/50 shadow-sm">
                            <Icon icon="tabler:flame" className="text-xl text-primary animate-pulse" />
                            <Text variant="small" weight="semibold">{data.streak} day streak</Text>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Wellness Pulse Hub - Unified Mood & Analytics */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="card-raised overflow-hidden bg-surface-raised border-white/[0.03]">
                            {/* Header & Quick Log */}
                            <div className="p-8 border-b border-white/[0.04] bg-white/[0.01]">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Icon icon="tabler:heart-rate-monitor" className="text-xl text-primary" />
                                        </div>
                                        <div>
                                            <Text variant="h3">Wellness Pulse</Text>
                                            <Text variant="small" color="muted">Your mental rhythm at a glance</Text>
                                        </div>
                                    </div>
                                    {isLoggedToday && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <Icon icon="tabler:check" className="text-emerald-400" />
                                            <Text variant="caption" weight="bold" className="text-emerald-400 uppercase tracking-wider">Day Complete</Text>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <Text weight="semibold" className="text-white/90">How is your mind today?</Text>
                                        <div className="flex gap-2">
                                            {MOOD_MAP.map((mood) => (
                                                <button 
                                                    key={mood.val}
                                                    onClick={() => setSelectedMood(mood.val)}
                                                    className={cn(
                                                        "size-12 flex items-center justify-center rounded-xl border transition-all duration-300",
                                                        selectedMood === mood.val 
                                                            ? `${mood.bg} border-white/20 ${mood.glow} scale-110` 
                                                            : "border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                                    )}
                                                    title={mood.label}
                                                >
                                                    <Icon icon={mood.icon} className={cn("text-2xl", selectedMood === mood.val ? mood.color : "text-text-dim")} />
                                                </button>
                                            ))}
                                        </div>
                                        <Button 
                                            onClick={logMood}
                                            disabled={!selectedMood || isLogging}
                                            variant="primary"
                                            className="h-12 px-8 shadow-lg shadow-primary/10"
                                        >
                                            {isLogging ? 'Saving...' : 'Log Check-in'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Two-Column Analytics Section */}
                            <div className="grid grid-cols-1 md:grid-cols-12">
                                {/* Left: Trends Graph */}
                                <div className="md:col-span-7 p-8 border-r border-white/[0.04]">
                                    <div className="flex items-center justify-between mb-8">
                                        <Text variant="small" weight="bold" className="uppercase tracking-widest text-text-dim">Weekly Stability</Text>
                                        <div className="flex bg-white/5 rounded-lg p-1">
                                            <button className="px-3 py-1 rounded-md bg-white/10 text-xs font-bold text-white shadow-sm">Week</button>
                                            <button className="px-3 py-1 rounded-md text-xs font-bold text-text-dim hover:text-white transition-colors">Month</button>
                                        </div>
                                    </div>

                                    <div className="h-48 flex items-end gap-3 px-2 relative">
                                        {/* Grid Markers */}
                                        <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none opacity-20">
                                            {[5,4,3,2,1].map(v => <div key={v} className="w-full border-t border-dashed border-white/20" />)}
                                        </div>

                                        {data.moodHistory.map((entry, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group z-10">
                                                <div 
                                                    className={cn(
                                                        "w-full rounded-md relative transition-all duration-500",
                                                        entry.score > 0 
                                                            ? "bg-primary/40 group-hover:bg-primary/60 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                                                            : "bg-white/[0.02] border border-dashed border-white/5 h-1!"
                                                    )}
                                                    style={entry.score > 0 ? { height: `${(entry.score / 5) * 100}%` } : {}}
                                                >
                                                    {entry.score > 0 && (
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap z-20 pointer-events-none">
                                                            <div className="bg-white text-black px-2.5 py-1 rounded-lg shadow-2xl font-bold text-[11px] flex items-center gap-1.5">
                                                                <Icon icon={MOOD_MAP.find(m => m.val === entry.score)?.icon || ''} className="text-sm" />
                                                                {entry.score}
                                                            </div>
                                                            <div className="w-2 h-2 bg-white rotate-45 mx-auto -mt-1 shadow-2xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <Text variant="small" color="muted" weight="bold" className="text-[10px] uppercase tracking-tighter">{entry.day}</Text>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Recent Feed */}
                                <div className="md:col-span-5 p-8 bg-white/[0.01]">
                                    <Text variant="small" weight="bold" className="uppercase tracking-widest text-text-dim mb-8 block">Recent Feed</Text>
                                    <div className="space-y-5">
                                        {data.recentMoods.length > 0 ? (
                                            data.recentMoods.map((log: MoodRecord, i: number) => {
                                                const mood = MOOD_MAP.find(m => m.val === log.score);
                                                return (
                                                    <div key={i} className="flex items-center gap-4 group">
                                                        <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", mood?.bg)}>
                                                            <Icon icon={mood?.icon || ''} className={cn("text-lg", mood?.color)} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <Text variant="small" weight="bold" className="text-white/90">{mood?.label}</Text>
                                                                <Text variant="small" className="text-[10px] text-text-dim font-bold uppercase">
                                                                    {new Date(log.logged_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                </Text>
                                                            </div>
                                                            <Text variant="small" color="muted" className="truncate text-[11px] italic">
                                                                {log.note || 'No notes'}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="py-10 text-center opacity-30">
                                                <Icon icon="tabler:mood-empty" className="text-2xl mx-auto mb-2" />
                                                <Text variant="small">No logs yet</Text>
                                            </div>
                                        )}
                                    </div>
                                    <Link href="/student/resources" className="mt-8 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                                        <Text variant="small" weight="bold" className="text-text-dim group-hover:text-white transition-colors">View All Logs</Text>
                                        <Icon icon="tabler:chevron-right" className="text-text-dim group-hover:text-white" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Grid: Bot & Screening */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href="/student/chat" className="group relative p-8 rounded-2xl bg-[#0c0f14] border border-white/[0.05] overflow-hidden hover:border-primary/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon icon="tabler:robot" className="text-8xl text-primary" />
                                </div>
                                <Text variant="h4" className="mb-2">Continue with MindBot</Text>
                                <Text variant="small" color="muted" className="mb-6 block max-w-[200px]">Private AI companion to untangle heavy thoughts.</Text>
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                    Open Chat <Icon icon="tabler:arrow-right" />
                                </div>
                            </Link>

                            <Link href="/student/screening" className="group relative p-8 rounded-2xl bg-[#0c0f14] border border-white/[0.05] overflow-hidden hover:border-secondary/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon icon="tabler:clipboard-check" className="text-8xl text-secondary" />
                                </div>
                                <Text variant="h4" className="mb-2">Quick Screening</Text>
                                <Text variant="small" color="muted" className="mb-6 block max-w-[200px]">Self-assessment to track your clinical trends over time.</Text>
                                <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest">
                                    Start Assessment <Icon icon="tabler:arrow-right" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Key Stats & Support */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* High Impact Stats */}
                        <div className="space-y-4">
                            {[
                                { label: 'Wellness XP', value: xp.toString(), sub: `Level ${Math.floor(xp / 100) + 1}`, icon: 'tabler:bolt', color: 'text-amber-400', bg: 'bg-amber-400/5' },
                                { label: 'Assessments', value: data.latestAssessment ? '1' : '0', sub: 'Last: ' + (data.latestAssessment ? new Date(data.latestAssessment.assessedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'None'), icon: 'tabler:clipboard-text', color: 'text-indigo-400', bg: 'bg-indigo-400/5' },
                                { label: 'Weekly Avg', value: averageMood.toFixed(1), sub: 'Stable', icon: 'tabler:chart-line', color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                            ].map((stat, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-surface-raised border border-white/[0.03] flex items-center gap-5 group hover:border-white/[0.08] transition-colors">
                                    <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                                        <Icon icon={stat.icon} className={cn("text-2xl", stat.color)} />
                                    </div>
                                    <div className="flex-1">
                                        <Text variant="small" weight="bold" className="uppercase tracking-widest text-text-dim text-[10px] mb-1 block">{stat.label}</Text>
                                        <div className="flex items-baseline gap-2">
                                            <Text variant="h3" className="tabular-nums">{stat.value}</Text>
                                            <Text variant="caption" color="muted" weight="bold">{stat.sub}</Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Support Card */}
                        <div className="card p-8 bg-surface-raised border-primary/5">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Icon icon="tabler:calendar-event" className="text-primary" />
                                </div>
                                <Text variant="h4">Next Session</Text>
                            </div>
                            
                            {data.nextSession ? (
                                <div className="rounded-xl p-5 bg-primary/5 border border-primary/10 mb-6 group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center size-14 rounded-lg bg-surface border border-white/5 shadow-sm shrink-0">
                                            <Text variant="caption" color="muted" weight="bold">{data.nextSession.replace(',', '').split(' ')[0].toUpperCase()}</Text>
                                            <Text variant="h3" className="leading-tight tabular-nums">{data.nextSession.replace(',', '').split(' ')[1]}</Text>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Text variant="small" weight="bold" className="mb-0.5 truncate block">Campus Counselor</Text>
                                            <Text variant="small" color="secondary" className="flex items-center gap-1.5"><Icon icon="tabler:video" className="text-primary" /> Video Call</Text>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-text-dim border border-dashed border-border rounded-xl mb-8 bg-white/[0.01]">
                                    <Text variant="small" color="muted" className="mb-4 block italic font-medium">No sessions scheduled</Text>
                                    <Link href="/student/book" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-primary text-[13px] font-bold transition-all">
                                        BOOK A SLOT <Icon icon="tabler:arrow-right" />
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Link href="/student/forum" className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Icon icon="tabler:messages" className="text-indigo-400" />
                                        <Text variant="small" weight="semibold">Peer Forum</Text>
                                    </div>
                                    <Icon icon="tabler:chevron-right" className="text-text-dim group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/student/journal" className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Icon icon="tabler:notebook" className="text-amber-400" />
                                        <Text variant="small" weight="semibold">Gratitude Journal</Text>
                                    </div>
                                    <Icon icon="tabler:chevron-right" className="text-text-dim group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
