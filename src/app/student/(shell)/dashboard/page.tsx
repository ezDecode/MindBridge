'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { generateWeekMoodHistory, formatSessionTime } from './_components/types'
import type { DashboardData } from './_components/types'
import Link from 'next/link'
import { motion } from 'motion/react'

import { Icon } from '@iconify/react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { Button, Text } from "@/components/ui"

import { getCurrentDemoUser } from '@/lib/auth/demo-session'

const container = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, duration: 0.6, bounce: 0 } }
}

export default function StudentDashboardPage() {
    return <StudentDashboardPageContent />
}

function StudentDashboardPageContent() {
    const { showToast } = useToast()
    const router = useRouter()
    const [initError, setInitError] = useState<string | null>(null)
    const [data, setData] = useState<DashboardData | null>(null)
    const [userName, setUserName] = useState('')
    const [selectedMood, setSelectedMood] = useState<number>(0)
    const [isLogging, setIsLogging] = useState(false)

    useEffect(() => {
        const init = async () => {
            try {
                const user = getCurrentDemoUser()
                
                if (!user || !user.id) {
                    throw new Error("User not available")
                }

                setUserName(user.name?.split(' ')[0] || 'there')

                let moodHistory: { day: string; score: number }[] = generateWeekMoodHistory([])
                let streak = 0
                let nextSession: string | null = null
                let activeChats = 0
                let latestAssessment: DashboardData['latestAssessment'] = null

                // Fetch mood data
                try {
                    const moodResponse = await fetch('/api/mood?days=7')
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json()
                        streak = moodData.streak || 0
                        moodHistory = Array.isArray(moodData.moods) ? generateWeekMoodHistory(moodData.moods) : generateWeekMoodHistory([])
                    }
                } catch (e) {
                    console.error('Mood fetch failed:', e)
                }

                // Fetch dashboard core data via secure API (bypasses RLS issues for demo)
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

                // Always set data — never leave the page stuck on loading
                setData({
                    streak,
                    nextSession,
                    activeChats,
                    moodHistory,
                    proactiveMessage: null,
                    latestAssessment,
                })
            } catch (err) {
                console.error("Dashboard error:", err)
                setInitError("Failed to load data")
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
                showToast("Mood logged! +10 XP", "success")
                const moodResponse = await fetch('/api/mood?days=7')
                if (moodResponse.ok) {
                    const moodData = await moodResponse.json()
                    setData(prev => prev ? { ...prev, streak: moodData.streak, moodHistory: generateWeekMoodHistory(moodData.moods) } : null)
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
                <Icon icon="tabler:alert-triangle" className="text-4xl mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Failed to load dashboard</h3>
                <p className="text-sm font-mono break-all">{initError}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-500 text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors">Reload Page</button>
            </div>
        </div>
    )

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="size-12 rounded-full border-4 border-primary/20 border-t-primary"
            />
            <p className="text-text-muted font-medium animate-pulse">Setting the scene for your wellness...</p>
        </div>
    )

    const scored = data.moodHistory.filter((m) => m.score > 0)
    const averageMood = scored.length ? scored.reduce((acc, curr) => acc + curr.score, 0) / scored.length : 0

    return (
        <div className="w-full pb-20">
            <motion.div 
                variants={container}
                initial="initial"
                animate="animate"
                className="mx-auto max-w-7xl space-y-12"
            >
                {/* Hero Header */}
                <motion.div 
                    variants={container}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <motion.div variants={item}>
                        <Text as="h2" variant="h1" weight="semibold" className="mb-4">
                            Good morning, <span className="text-primary">{userName}</span>
                        </Text>
                        <div className="flex items-center gap-4">
                            <p className="text-text-muted text-sm font-medium flex items-center gap-2" suppressHydrationWarning>
                                <Icon icon="tabler:calendar-heart" className="text-primary" />
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        variants={item}
                        className="flex items-center gap-3 px-4 py-2 rounded-md bg-surface border border-border shadow-sm"
                    >
                        <Icon icon="tabler:flame" className="text-xl text-primary animate-pulse" />
                        <Text as="span" variant="small" weight="semibold">{data.streak} day streak</Text>
                    </motion.div>
                </motion.div>

                {/* Main Dashboard Grid */}
                <motion.div 
                    variants={container}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    
                    {/* Left Column: Mood & Stats */}
                    <motion.div variants={container} className="lg:col-span-8 space-y-8">
                        {/* Mood Logger */}
                        <motion.div variants={item} className="card relative overflow-hidden group p-8 bg-surface-raised">
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <Text as="h3" variant="h4" weight="semibold">How&apos;s your mind today?</Text>
                                    <span className={cn(
                                        "badge",
                                        scored.some(m => new Date().getDay() === ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(m.day)) 
                                            ? "badge-primary" : "badge-outline"
                                    )}>
                                        {scored.some(m => new Date().getDay() === ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(m.day)) ? 'Logged' : 'Pending'}
                                    </span>
                                </div>
                                <Text color="secondary" className="mb-10 text-sm">Checking in daily helps track your progress and reveals patterns in your wellbeing.</Text>
                                
                                <motion.div 
                                    variants={container}
                                    className="flex justify-between items-center gap-3 mb-10 overflow-x-auto no-scrollbar pb-2"
                                >
                                    {[
                                        { val: 1, label: 'Low', icon: 'tabler:mood-sad', color: 'text-rose-500' },
                                        { val: 2, label: 'Down', icon: 'tabler:mood-neutral', color: 'text-orange-400' },
                                        { val: 3, label: 'Okay', icon: 'tabler:mood-smile', color: 'text-amber-400' },
                                        { val: 4, label: 'Good', icon: 'tabler:mood-happy', color: 'text-emerald-400' },
                                        { val: 5, label: 'Great', icon: 'tabler:mood-star', color: 'text-primary' }
                                    ].map((mood) => (
                                        <motion.button 
                                            key={mood.val}
                                            variants={item}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedMood(mood.val)}
                                            className={cn(
                                                "flex flex-col items-center gap-3 p-4 min-w-[80px] rounded-lg border transition-all duration-150",
                                                selectedMood === mood.val 
                                                    ? "bg-white/5 border-white/20 shadow-md ring-1 ring-white/10" 
                                                    : "border-transparent hover:bg-white/5 hover:border-border"
                                            )}
                                        >
                                            <Icon icon={mood.icon} className={cn("text-3xl", mood.color)} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{mood.label}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>

                                <div className="mt-auto">
                                    <Button 
                                        onClick={logMood}
                                        disabled={!selectedMood || isLogging}
                                        size="lg"
                                        className="w-full"
                                    >
                                        {isLogging ? 'Saving...' : 'Log Mood +10 XP'}
                                        <Icon icon="tabler:arrow-right" className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mood Trends Visualization */}
                        <motion.div variants={item} className="card p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <Text as="h3" weight="semibold">Mood Trends</Text>
                                    <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">Weekly stability overview</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 rounded bg-white/5 text-white text-[10px] font-bold border border-white/10 transition-colors hover:bg-white/10">Week</button>
                                    <button className="px-3 py-1 rounded text-text-dim text-[10px] font-bold hover:text-white transition-colors">Month</button>
                                </div>
                            </div>
                            
                            <div className="h-44 flex items-end gap-3 px-2">
                                {data.moodHistory.map((entry, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(entry.score / 5) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                            className={cn(
                                                "w-full rounded-sm relative transition-all duration-150",
                                                entry.score > 0 
                                                    ? "bg-primary/40 group-hover:bg-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                                                    : "bg-white/[0.02] border border-dashed border-white/5 h-1!"
                                            )}
                                        >
                                            {entry.score > 0 && (
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                    <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded font-bold shadow-xl">{entry.score}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-tighter tabular-nums">{entry.day}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Stats & Actions */}
                    <motion.div variants={container} className="lg:col-span-4 space-y-8">
                        {/* Quick Stats Grid */}
                        <motion.div variants={container} className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Weekly Avg', value: averageMood.toFixed(1), icon: 'tabler:chart-line', color: 'text-primary', sub: 'Improved 12%' },
                                { label: 'Wellness XP', value: '240', icon: 'tabler:bolt', color: 'text-warning', sub: 'Level 4' },
                                { label: 'Assessments', value: data.latestAssessment ? '1' : '0', icon: 'tabler:clipboard-text', color: 'text-secondary', sub: 'Next: July 24' },
                                { label: 'Milestones', value: '4', icon: 'tabler:confetti', color: 'text-primary', sub: 'Rising Star' }
                            ].map((stat, i) => (
                                <motion.div key={i} variants={item} className="card-raised p-5 flex flex-col gap-1 group hover:border-white/20 transition-colors">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 mb-4">
                                        <Icon icon={stat.icon} className={cn("text-xl", stat.color)} />
                                    </div>
                                    <div className="text-2xl font-semibold tabular-nums text-white leading-none">{stat.value}</div>
                                    <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Upcoming Support */}
                        <motion.div variants={item} className="card p-8 bg-surface">
                            <Text as="h3" weight="semibold" className="mb-8">Upcoming Support</Text>
                            
                            {data.nextSession ? (
                                <div className="rounded-lg p-5 bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all mb-6 cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center size-14 rounded bg-surface-raised border border-border shadow-sm group-hover:bg-surface-hover transition-colors shrink-0">
                                            <span className="text-[9px] font-bold uppercase text-text-dim">{data.nextSession.replace(',', '').split(' ')[0]}</span>
                                            <span className="text-xl font-bold text-white leading-tight tabular-nums">{data.nextSession.replace(',', '').split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm mb-1 text-white truncate">Campus Counselor</h4>
                                            <div className="flex flex-col gap-1 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><Icon icon="tabler:clock" className="text-primary" /> {data.nextSession.replace(',', '').split(' ').slice(1).join(' ')}</span>
                                                <span className="flex items-center gap-1.5"><Icon icon="tabler:video" className="text-secondary" /> Video Call</span>
                                            </div>
                                        </div>
                                        <div className="size-10 rounded-md bg-white text-black flex items-center justify-center shrink-0">
                                            <Icon icon="tabler:video" className="text-xl" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-text-dim border border-dashed border-border rounded-lg mb-8 bg-white/[0.01]">
                                    <Icon icon="tabler:calendar-cancel" className="text-3xl mx-auto mb-4 opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No sessions scheduled</p>
                                    <Link href="/student/book" className="text-primary text-[10px] font-bold hover:text-primary-hover mt-3 inline-block uppercase tracking-[0.2em]">Book a slot →</Link>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/student/chat" className="flex items-center justify-center gap-3 bg-surface-raised border border-border rounded-md px-4 py-3 hover:bg-surface-hover hover:border-white/20 transition-all group">
                                    <Icon icon="tabler:robot" className="text-lg text-primary" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">MindBot</span>
                                </Link>
                                <Link href="/student/screening" className="flex items-center justify-center gap-3 bg-surface-raised border border-border rounded-md px-4 py-3 hover:bg-surface-hover hover:border-white/20 transition-all group">
                                    <Icon icon="tabler:clipboard-check" className="text-lg text-secondary" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Assess</span>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Bottom Section: Resources */}
                <motion.div variants={container} className="pt-8 border-t border-white/5 pb-20">
                    <motion.div variants={item} className="flex items-end justify-between mb-10 px-1">
                        <div>
                            <Text as="h3" variant="h3" weight="semibold">Curated for You</Text>
                            <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mt-1">Personalized wellness recommendations</p>
                        </div>
                        <Link href="/student/resources" className="text-[10px] font-bold text-text-dim hover:text-white transition-colors flex items-center gap-2 group uppercase tracking-widest">
                            Explore All <Icon icon="tabler:arrow-up-right" />
                        </Link>
                    </motion.div>

                    <motion.div 
                        variants={container}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            { 
                                title: '5-Minute Stress Relief', 
                                type: 'Audio', 
                                time: '5 min', 
                                icon: 'tabler:headphones',
                                color: 'text-primary'
                            },
                            { 
                                title: 'Academic Pressure Guide', 
                                type: 'Article', 
                                time: '8 min', 
                                icon: 'tabler:books',
                                color: 'text-warning'
                            },
                            { 
                                title: 'Hostel Sleep Hygiene', 
                                type: 'Guide', 
                                time: '6 min', 
                                icon: 'tabler:bed',
                                color: 'text-secondary'
                            }
                        ].map((res, i) => (
                            <motion.div 
                                key={i}
                                variants={item}
                                className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-white/20 transition-all duration-150 flex flex-col"
                            >
                                <div className="h-40 bg-white/[0.02] border-b border-white/5 flex items-center justify-center relative overflow-hidden shrink-0">
                                    <Icon icon={res.icon} className={cn("text-6xl opacity-5 transition-transform duration-500", res.color)} />
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2 py-0.5 rounded bg-white/5 text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                                            {res.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h4 className="text-sm font-semibold mb-6 leading-snug group-hover:text-primary transition-colors text-white flex-1">{res.title}</h4>
                                    <div className="flex items-center gap-4 text-[9px] font-bold text-text-dim uppercase tracking-[0.15em]">
                                        <span className="flex items-center gap-1.5"><Icon icon="tabler:clock" /> {res.time}</span>
                                        <span className="flex items-center gap-1.5"><Icon icon="tabler:world" /> Bilingual</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    )
}
