'use client'

import { useEffect, useState } from 'react'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { Icon } from "@iconify/react"
import { cn } from '@/lib/utils'
import { Button, Text } from "@/components/ui"

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-text-muted font-medium animate-pulse font-sans">Synthesizing campus analytics...</p>
    </div>
  )

  const stats = [
    { label: 'Campus Mood Avg', value: data?.moodAvg || '0.0', sub: '↑ +0.2 this month', icon: 'tabler:mood-smile', color: 'text-primary' },
    { label: 'Enrolled Students', value: data?.studentCount || 0, sub: 'Active in cohort', icon: 'tabler:users', color: 'text-secondary' },
    { label: 'Support Sessions', value: data?.bookingCount || 0, sub: 'Total interactions', icon: 'tabler:calendar-event', color: 'text-warning' },
    { label: 'Crisis Alerts', value: data?.pendingCrisisCount || 0, sub: `${data?.crisisCount || 0} Total logged`, icon: 'tabler:alert-circle', color: 'text-danger', isCritical: (data?.pendingCrisisCount || 0) > 0 }
  ]

  return (
    <div className="w-full pb-20">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <Text as="h2" variant="h1" weight="semibold" className="mb-4 text-balance">
              Campus <span className="text-primary">Intelligence</span>
            </Text>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-md shadow-sm">
                <Icon icon="tabler:school" className="text-primary h-4 w-4" />
                <Text as="span" variant="small" weight="medium">Jammu University</Text>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button size="md" className="gap-2">
              <Icon icon="tabler:download" className="text-lg" />
              <span className="hidden sm:inline">Export intelligence</span>
            </Button>
          </div>
        </div>

        {/* Main Stats Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="card-raised p-6 group hover:border-white/20 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 mb-6">
                <Icon icon={stat.icon} className={cn("text-xl transition-transform", stat.color)} />
              </div>
              <div className="text-3xl font-semibold tabular-nums text-white leading-none mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</div>
              <div className={cn("mt-6 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", stat.isCritical ? "text-danger animate-pulse" : "text-success")}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Mid Section Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Mood Trend Chart */}
          <div className="card lg:col-span-8 p-8 group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Text as="h3" weight="semibold">Campus Sentiment</Text>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">Stability trend</p>
              </div>
            </div>
            
            <div className="h-44 flex items-end gap-2 px-2 relative">
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/5 pointer-events-none" />
              {(data?.moodLogs || Array.from({ length: 20 })).slice(0, 30).reverse().map((log: any, i: number) => {
                const score = log?.score || (3 + Math.random() * 2)
                const h = (score / 5) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    <div 
                      style={{ height: `${h}%` }}
                      className={cn(
                        "w-full rounded-sm transition-all duration-300",
                        score >= 4 ? "bg-primary" : score >= 3 ? "bg-primary/60" : "bg-primary/30"
                      )}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-6 px-2 text-[9px] font-bold text-text-dim uppercase tracking-widest">
              <span>Past Period</span>
              <span>Present</span>
            </div>
          </div>

          {/* Department Moods */}
          <div className="card lg:col-span-4 p-8">
            <Text as="h3" weight="semibold" className="mb-10">Departmental Wellness</Text>
            <div className="space-y-6">
              {(data?.deptStats || []).map((dept: any, i: number) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-text-muted tracking-wide uppercase truncate max-w-[150px]">{dept.name}</span>
                    <span className="text-xs font-bold tabular-nums text-white">{dept.score}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(dept.score / 5) * 100}%` }}
                      className="h-full rounded-full transition-all duration-500 bg-primary" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PHQ-9 Donut (Simulated with SVG) */}
          <div className="card lg:col-span-4 p-8 flex flex-col items-center justify-center text-center">
            <Text as="h3" weight="semibold" className="mb-10 self-start">Severity Scan</Text>
            <div className="relative size-40 mb-10">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="40" fill="transparent" 
                  stroke="var(--primary)" strokeWidth="8" 
                  strokeDasharray="251.2" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tabular-nums text-white">{data?.studentCount || 0}</span>
                <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest mt-1">Assessed</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 w-full">
              <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                <div className="size-1.5 rounded-full bg-primary" /> 45% Minimal
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                <div className="size-1.5 rounded-full bg-secondary" /> 25% Mild
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                <div className="size-1.5 rounded-full bg-warning" /> 18% Moderate
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                <div className="size-1.5 rounded-full bg-danger" /> 12% Severe
              </div>
            </div>
          </div>

          {/* Staff Overview */}
          <div className="card lg:col-span-4 p-8">
            <Text as="h3" weight="semibold" className="mb-8">Staff on Duty</Text>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">D</div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-none mb-1">Dr. Radha Sharma</p>
                    <p className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Counselor</p>
                  </div>
                </div>
                <div className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
            </div>
          </div>

          {/* Top Resources */}
          <div className="card lg:col-span-4 p-8">
            <Text as="h3" weight="semibold" className="mb-8">Content Engagement</Text>
            <div className="space-y-5">
              {[
                { title: 'Exam Stress Relief', count: 892, icon: 'tabler:yoga' },
                { title: 'Placement Anxiety', count: 741, icon: 'tabler:briefcase' },
                { title: 'Sleep Hygiene Guide', count: 634, icon: 'tabler:bed' }
              ].map((res, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-9 rounded bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Icon icon={res.icon} className="text-lg text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-text-muted group-hover:text-white transition-colors">{res.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums text-white">{res.count}</p>
                    <p className="text-[8px] font-bold uppercase text-text-dim tracking-tighter">Hits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Elevation */}
        <div className="card p-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <Text as="h3" variant="h3" weight="semibold">Campus Stress Pulse</Text>
              <p className="text-text-muted text-sm mt-2">Daily aggregate analysis over the last semester</p>
            </div>
            <span className="badge badge-outline px-4 py-1.5">Academic Year 2024-25</span>
          </div>

          <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] sm:grid-cols-[repeat(20,minmax(0,1fr))] md:grid-cols-[repeat(30,minmax(0,1fr))] lg:grid-cols-[repeat(40,minmax(0,1fr))] gap-1">
            {Array.from({ length: 120 }).map((_, i) => {
               const lvl = [0, 1, 2, 3, 4][(i * 7 + 3) % 5];
               return (
                 <div 
                    key={i} 
                    className={cn(
                      "aspect-square rounded-[1px] transition-all hover:ring-1 hover:ring-white/40 cursor-help",
                      lvl === 0 ? "bg-white/[0.02]" : 
                      lvl === 1 ? "bg-primary/20" : 
                      lvl === 2 ? "bg-primary/40" : 
                      lvl === 3 ? "bg-primary/70" : "bg-primary"
                    )} 
                 />
               )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 text-[9px] font-bold text-text-dim uppercase tracking-widest">
              <span>Low Intensity</span>
              <div className="flex gap-1">
                <div className="size-2.5 rounded-[1px] bg-white/5" />
                <div className="size-2.5 rounded-[1px] bg-primary/20" />
                <div className="size-2.5 rounded-[1px] bg-primary/40" />
                <div className="size-2.5 rounded-[1px] bg-primary/70" />
                <div className="size-2.5 rounded-[1px] bg-primary" />
              </div>
              <span>High Intensity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
