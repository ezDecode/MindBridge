/**
 * Observer Agent
 * 
 * Runs periodically (or on-demand) to analyze a student's patterns over time.
 * Looks at mood trends, chat frequency, time-of-day patterns, and assessment history.
 * 
 * This powers the Proactive Agent's personalized check-ins.
 * Unlike the Memory Agent (which runs per-request), Observer runs async on a schedule.
 */

import { createServiceClient } from '@/lib/supabase/server'

export interface ObserverInsights {
  moodTrend: 'improving' | 'stable' | 'declining' | 'volatile' | 'insufficient_data'
  avgMood: number | null
  moodChange: number | null  // Change over last 7 days
  
  chatPatterns: {
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' | null
    frequency: 'daily' | 'regular' | 'occasional' | 'rare'
    lastChatDaysAgo: number | null
  }
  
  riskIndicators: string[]  // Active risk signals
  
  suggestedOutreach: {
    shouldReach: boolean
    reason: string | null
    urgency: 'low' | 'medium' | 'high'
    suggestedMessage: string | null
  }
}

/**
 * Analyze patterns for a specific student
 */
export async function analyzeStudentPatterns(userId: string): Promise<ObserverInsights> {
  const supabase = await createServiceClient()
  
  // Fetch all data in parallel
  const [moodsResult, chatsResult, assessmentsResult, profileResult] = await Promise.all([
    // Last 30 days of moods
    supabase
      .from('mood_logs')
      .select('score, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', daysAgo(30))
      .order('logged_at', { ascending: true }),
    
    // Last 30 days of chats
    supabase
      .from('chat_messages')
      .select('role, sent_at, crisis_flag')
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('sent_at', daysAgo(30))
      .order('sent_at', { ascending: true }),
    
    // Recent assessments
    supabase
      .from('assessments')
      .select('criteria_flagged, severity, assessed_at')
      .eq('user_id', userId)
      .order('assessed_at', { ascending: false })
      .limit(5),
    
    // Profile for name
    supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single(),
  ])

  const moods = moodsResult.data || []
  const chats = chatsResult.data || []
  const assessments = assessmentsResult.data || []
  const studentName = profileResult.data?.name || 'there'

  // Analyze mood trends
  const moodAnalysis = analyzeMoodTrend(moods)
  
  // Analyze chat patterns
  const chatAnalysis = analyzeChatPatterns(chats)
  
  // Identify risk indicators
  const riskIndicators = identifyRiskIndicators(moods, chats, assessments)
  
  // Determine if outreach is needed
  const suggestedOutreach = determineSuggestedOutreach(
    moodAnalysis,
    chatAnalysis,
    riskIndicators,
    studentName
  )

  return {
    moodTrend: moodAnalysis.trend,
    avgMood: moodAnalysis.average,
    moodChange: moodAnalysis.change,
    chatPatterns: chatAnalysis,
    riskIndicators,
    suggestedOutreach,
  }
}

/**
 * Analyze mood trend from mood logs
 */
function analyzeMoodTrend(moods: { score: number; logged_at: string }[]): {
  trend: ObserverInsights['moodTrend']
  average: number | null
  change: number | null
} {
  if (moods.length < 3) {
    return { trend: 'insufficient_data', average: null, change: null }
  }

  // Calculate overall average
  const average = moods.reduce((sum, m) => sum + m.score, 0) / moods.length
  
  // Split into recent (last 7 days) vs earlier
  const sevenDaysAgo = new Date(daysAgo(7))
  const recent = moods.filter(m => new Date(m.logged_at) >= sevenDaysAgo)
  const earlier = moods.filter(m => new Date(m.logged_at) < sevenDaysAgo)
  
  if (recent.length < 2 || earlier.length < 2) {
    return { trend: 'insufficient_data', average: Math.round(average * 10) / 10, change: null }
  }
  
  const recentAvg = recent.reduce((sum, m) => sum + m.score, 0) / recent.length
  const earlierAvg = earlier.reduce((sum, m) => sum + m.score, 0) / earlier.length
  const change = recentAvg - earlierAvg
  
  // Check volatility (standard deviation)
  const variance = moods.reduce((sum, m) => sum + Math.pow(m.score - average, 2), 0) / moods.length
  const stdDev = Math.sqrt(variance)
  
  let trend: ObserverInsights['moodTrend']
  
  if (stdDev > 1.2) {
    trend = 'volatile'
  } else if (change > 0.5) {
    trend = 'improving'
  } else if (change < -0.5) {
    trend = 'declining'
  } else {
    trend = 'stable'
  }
  
  return {
    trend,
    average: Math.round(average * 10) / 10,
    change: Math.round(change * 10) / 10,
  }
}

/**
 * Analyze chat patterns
 */
function analyzeChatPatterns(chats: { role: string; sent_at: string; crisis_flag: boolean }[]): ObserverInsights['chatPatterns'] {
  if (chats.length === 0) {
    return {
      preferredTime: null,
      frequency: 'rare',
      lastChatDaysAgo: null,
    }
  }

  // Time of day analysis
  const hourCounts: Record<string, number> = {
    morning: 0,   // 5-11
    afternoon: 0, // 12-16
    evening: 0,   // 17-21
    night: 0,     // 22-4
  }
  
  chats.forEach(chat => {
    const hour = new Date(chat.sent_at).getHours()
    if (hour >= 5 && hour < 12) hourCounts.morning++
    else if (hour >= 12 && hour < 17) hourCounts.afternoon++
    else if (hour >= 17 && hour < 22) hourCounts.evening++
    else hourCounts.night++
  })
  
  const maxTime = Object.entries(hourCounts).reduce((max, [time, count]) => 
    count > max.count ? { time, count } : max,
    { time: 'evening', count: 0 }
  )
  
  // Frequency analysis
  const uniqueDays = new Set(chats.map(c => new Date(c.sent_at).toDateString())).size
  const daySpan = Math.max(1, Math.ceil(
    (Date.now() - new Date(chats[0].sent_at).getTime()) / (1000 * 60 * 60 * 24)
  ))
  const chatsPerDay = uniqueDays / daySpan
  
  let frequency: 'daily' | 'regular' | 'occasional' | 'rare'
  if (chatsPerDay >= 0.8) frequency = 'daily'
  else if (chatsPerDay >= 0.4) frequency = 'regular'
  else if (chatsPerDay >= 0.15) frequency = 'occasional'
  else frequency = 'rare'
  
  // Last chat
  const lastChat = chats[chats.length - 1]
  const lastChatDaysAgo = Math.floor(
    (Date.now() - new Date(lastChat.sent_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    preferredTime: maxTime.time as 'morning' | 'afternoon' | 'evening' | 'night',
    frequency,
    lastChatDaysAgo,
  }
}

/**
 * Identify active risk indicators
 */
function identifyRiskIndicators(
  moods: { score: number; logged_at: string }[],
  chats: { role: string; sent_at: string; crisis_flag: boolean }[],
  assessments: { criteria_flagged: string[]; severity: string; assessed_at: string }[]
): string[] {
  const indicators: string[] = []
  
  // Check for recent crisis flags
  const recentCrisis = chats.some(c => 
    c.crisis_flag && 
    new Date(c.sent_at) >= new Date(daysAgo(7))
  )
  if (recentCrisis) {
    indicators.push('recent_crisis_flag')
  }
  
  // Check for consistently low moods
  const recentMoods = moods.filter(m => new Date(m.logged_at) >= new Date(daysAgo(7)))
  const lowMoodCount = recentMoods.filter(m => m.score <= 2).length
  if (recentMoods.length >= 3 && lowMoodCount >= Math.ceil(recentMoods.length * 0.6)) {
    indicators.push('consistently_low_mood')
  }
  
  // Check for severe assessment
  const latestAssessment = assessments[0]
  if (latestAssessment?.severity === 'severe') {
    indicators.push('severe_assessment')
  }
  
  // Check for self-harm criteria
  if (latestAssessment?.criteria_flagged?.includes('self_harm')) {
    indicators.push('self_harm_flagged')
  }
  
  // Check for sudden drop in mood
  if (moods.length >= 5) {
    const lastFive = moods.slice(-5)
    const first = lastFive.slice(0, 2)
    const last = lastFive.slice(-2)
    const firstAvg = first.reduce((s, m) => s + m.score, 0) / first.length
    const lastAvg = last.reduce((s, m) => s + m.score, 0) / last.length
    if (firstAvg - lastAvg >= 2) {
      indicators.push('sudden_mood_drop')
    }
  }
  
  // Check for late night chatting pattern (potential sleep issues)
  const nightChats = chats.filter(c => {
    const hour = new Date(c.sent_at).getHours()
    return hour >= 0 && hour < 5
  })
  if (nightChats.length >= 3) {
    indicators.push('late_night_pattern')
  }
  
  // Check for inactivity (was active, now silent)
  const recentChats = chats.filter(c => new Date(c.sent_at) >= new Date(daysAgo(7)))
  const olderChats = chats.filter(c => 
    new Date(c.sent_at) < new Date(daysAgo(7)) && 
    new Date(c.sent_at) >= new Date(daysAgo(21))
  )
  if (olderChats.length >= 5 && recentChats.length === 0) {
    indicators.push('sudden_inactivity')
  }
  
  return indicators
}

/**
 * Determine if proactive outreach is needed
 */
function determineSuggestedOutreach(
  moodAnalysis: { trend: string; average: number | null; change: number | null },
  chatPatterns: ObserverInsights['chatPatterns'],
  riskIndicators: string[],
  studentName: string
): ObserverInsights['suggestedOutreach'] {
  // High urgency scenarios
  if (riskIndicators.includes('self_harm_flagged') || riskIndicators.includes('recent_crisis_flag')) {
    return {
      shouldReach: true,
      reason: 'Crisis indicator detected',
      urgency: 'high',
      suggestedMessage: `Hey ${studentName}, just checking in. How are you feeling today? I'm here if you want to talk.`,
    }
  }
  
  if (riskIndicators.includes('severe_assessment')) {
    return {
      shouldReach: true,
      reason: 'Recent severe assessment',
      urgency: 'high',
      suggestedMessage: `Good morning ${studentName}. I noticed things have been heavy lately. Want to talk about what's on your mind?`,
    }
  }
  
  // Medium urgency
  if (riskIndicators.includes('consistently_low_mood') || riskIndicators.includes('sudden_mood_drop')) {
    return {
      shouldReach: true,
      reason: 'Mood decline detected',
      urgency: 'medium',
      suggestedMessage: `Hey ${studentName}, how's today looking? I noticed the last few days have been tough.`,
    }
  }
  
  if (riskIndicators.includes('sudden_inactivity')) {
    return {
      shouldReach: true,
      reason: 'User went silent after being active',
      urgency: 'medium',
      suggestedMessage: `Hey ${studentName}, haven't heard from you in a bit. Just wanted to check in — hope you're doing okay.`,
    }
  }
  
  // Low urgency / wellness checks
  if (chatPatterns.lastChatDaysAgo && chatPatterns.lastChatDaysAgo >= 3) {
    return {
      shouldReach: true,
      reason: 'Regular check-in due',
      urgency: 'low',
      suggestedMessage: `Morning ${studentName}! Quick mood check — how are you feeling today on a scale of 1-5?`,
    }
  }
  
  if (moodAnalysis.trend === 'improving') {
    return {
      shouldReach: false,
      reason: 'Mood improving, no intervention needed',
      urgency: 'low',
      suggestedMessage: null,
    }
  }
  
  return {
    shouldReach: false,
    reason: 'No immediate outreach needed',
    urgency: 'low',
    suggestedMessage: null,
  }
}

// ============================================
// Batch Analysis (for scheduled jobs)
// ============================================

/**
 * Analyze all students who need check-ins
 * Called by the proactive agent edge function
 */
export async function getStudentsNeedingOutreach(): Promise<Array<{
  userId: string
  name: string
  insights: ObserverInsights
}>> {
  const supabase = await createServiceClient()
  
  // Get all students who have been active in last 30 days
  const { data: activeStudents } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'student')

  if (!activeStudents || activeStudents.length === 0) {
    return []
  }

  // Analyze each student (in batches to avoid rate limits)
  const results: Array<{ userId: string; name: string; insights: ObserverInsights }> = []
  
  for (const student of activeStudents) {
    try {
      const insights = await analyzeStudentPatterns(student.id)
      
      if (insights.suggestedOutreach.shouldReach) {
        results.push({
          userId: student.id,
          name: student.name || 'Student',
          insights,
        })
      }
    } catch (error) {
      console.error(`Failed to analyze student ${student.id}:`, error)
    }
  }

  // Sort by urgency
  const urgencyOrder = { high: 0, medium: 1, low: 2 }
  results.sort((a, b) => 
    urgencyOrder[a.insights.suggestedOutreach.urgency] - 
    urgencyOrder[b.insights.suggestedOutreach.urgency]
  )

  return results
}

// ============================================
// Utility Functions
// ============================================

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}
