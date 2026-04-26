'use client'

import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text } from '@/components/ui'
import { cn } from '@/lib/utils'

type MoodLog = {
  id: string
  score: number
  note: string | null
  logged_at: string
}

export default function MoodHistoryClient({ initialLogs }: { initialLogs: MoodLog[] }) {
  const [timeframe, setTimeframe] = useState<'7' | '30' | 'all'>('30')

  const filteredLogs = useMemo(() => {
    const now = new Date()
    return initialLogs.filter(log => {
      if (timeframe === 'all') return true
      const days = timeframe === '7' ? 7 : 30
      const logDate = new Date(log.logged_at)
      const diffTime = Math.abs(now.getTime() - logDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= days
    })
  }, [initialLogs, timeframe])

  // Simple SVG Chart data preparation
  const chartData = useMemo(() => {
    if (filteredLogs.length === 0) return []
    
    // Normalize data points to a 0-100 X grid and 0-50 Y grid
    const start = new Date(filteredLogs[0].logged_at).getTime()
    const end = new Date(filteredLogs[filteredLogs.length - 1].logged_at).getTime()
    const range = end - start || 1
    
    return filteredLogs.map((log) => {
      const x = ((new Date(log.logged_at).getTime() - start) / range) * 100
      const y = 50 - (log.score * 10) // Score 1-5 maps to 40-0
      return { ...log, x, y }
    })
  }, [filteredLogs])

  const smoothPathD = chartData.length > 0
    ? chartData.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point.x},${point.y}`
        // Simple cubic bezier curve approximation for smooth lines
        const prev = a[i - 1]
        const cp1x = prev.x + (point.x - prev.x) / 2
        const cp1y = prev.y
        const cp2x = prev.x + (point.x - prev.x) / 2
        const cp2y = point.y
        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`
      }, '')
    : ''

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 pt-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Text as="h2" variant="h2" weight="semibold" className="tracking-tight text-white mb-2">Mood History</Text>
          <Text variant="small" className="text-text-dim font-medium">Analytics & Trends</Text>
        </div>
        
        <div className="flex p-1 bg-surface-raised rounded-lg border border-border">
          {([
            { id: '7', label: '7 Days' },
            { id: '30', label: '30 Days' },
            { id: 'all', label: 'All Time' }
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={cn(
                "px-4 py-1.5 rounded-md text-base font-medium transition-all",
                timeframe === t.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-text-muted hover:text-white hover:bg-white/5"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Card padding="lg" className="bg-surface border-border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <Text variant="h4" weight="semibold">Emotional Trajectory</Text>
            <Text variant="small" className="text-text-dim mt-1">Scores over selected timeframe</Text>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary" />
              <span className="text-base font-medium text-text-muted ">Score</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 w-full relative z-10 group">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-dim border border-dashed border-white/10 rounded-lg">
              <Icon icon="tabler:chart-line-slash" className="text-2xl mb-2 opacity-50" />
              <span className="text-base font-medium">No data available</span>
            </div>
          ) : (
            <div className="w-full h-full relative">
              {/* Y Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[5, 4, 3, 2, 1].map(score => (
                  <div key={score} className="border-b border-white/5 w-full flex-1 relative flex items-start">
                    <span className="absolute -left-6 -top-2 text-base text-text-dim font-mono">{score}</span>
                  </div>
                ))}
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 -5 100 60" preserveAspectRatio="none">
                {/* Gradient Fill under the line */}
                <defs>
                  <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Filled Area */}
                <path 
                  d={`${smoothPathD} L 100,50 L 0,50 Z`} 
                  fill="url(#line-gradient)" 
                  className="transition-all duration-500 ease-in-out"
                />

                {/* Stroke Line */}
                <path 
                  d={smoothPathD} 
                  fill="none" 
                  stroke="var(--color-primary)" 
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-500 ease-in-out"
                />

                {/* Data Points */}
                {chartData.map((p, i) => (
                  <g key={i} className="group/point cursor-crosshair">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="2" 
                      fill="var(--color-surface)" 
                      stroke="var(--color-primary)" 
                      strokeWidth="1"
                      className="transition-all duration-200 group-hover/point:r-3"
                    />
                    <circle cx={p.x} cy={p.y} r="6" fill="transparent" />
                    {/* Tooltip on hover */}
                    <g className="opacity-0 group-hover/point:opacity-100 transition-opacity">
                      <rect x={p.x - 20} y={p.y - 20} width="40" height="16" rx="4" fill="white" />
                      <text x={p.x} y={p.y - 9} fontSize="8" fill="black" textAnchor="middle" fontWeight="bold">
                        {p.score}/5
                      </text>
                    </g>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        <Text variant="h4" weight="semibold" className="mb-6">Recent Logs</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLogs.slice().reverse().map(log => (
            <Card key={log.id} padding="md" className="flex items-start gap-4 hover:border-white/20 transition-all bg-surface">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Text variant="h4" className={cn(
                  "font-bold",
                  log.score >= 4 ? "text-primary" : log.score === 3 ? "text-warning" : "text-danger"
                )}>
                  {log.score}
                </Text>
              </div>
              <div>
                <Text weight="semibold" className="text-white text-[1.0625rem]">
                  {new Date(log.logged_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(log.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {log.note && (
                  <Text variant="small" className="text-text-muted mt-2 leading-relaxed">
                    &quot;{log.note}&quot;
                  </Text>
                )}
              </div>
            </Card>
          ))}
          {filteredLogs.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-dim border border-dashed border-border rounded-lg">
              No logs found for this timeframe.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
