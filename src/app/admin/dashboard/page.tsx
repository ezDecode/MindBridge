'use client'

import { useEffect, useState } from 'react'
import { Icon } from "@iconify/react"
import { cn } from '@/lib/utils'
import { Button, Text } from "@/components/ui"

type AdminDashboardData = {
  moodAvg?: string | number
  studentCount?: number
  bookingCount?: number
  pendingCrisisCount?: number
  crisisCount?: number
  moodLogs?: Array<{ score?: number }>
  deptStats?: Array<{ name: string; score: number }>
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
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
      <Text color="secondary" weight="medium" className="animate-pulse">Synthesizing campus analytics...</Text>
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
            <Text variant="h1" className="mb-4 text-balance">
              Campus <span className="text-primary">Intelligence</span>
            </Text>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-md shadow-sm">
                <Icon icon="tabler:school" className="text-primary h-4 w-4" />
                <Text variant="small" weight="medium">Lovely Professional University</Text>
                </div>            </div>
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
              <Text variant="metric" className="tabular-nums mb-2">{stat.value}</Text>
              <Text variant="small" color="secondary" weight="medium">{stat.label}</Text>
              <Text 
                variant="small" 
                weight="medium" 
                color={stat.isCritical ? "danger" : "success"}
                className={cn("mt-6 flex items-center gap-1.5", stat.isCritical && "animate-pulse")}
              >
                {stat.sub}
              </Text>
            </div>
          ))}
        </div>

        {/* Mid Section Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Mood Trend Chart */}
          <div className="card lg:col-span-8 p-8 group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Text variant="h3">Campus Sentiment</Text>
                <Text color="secondary" weight="medium" className="mt-1">Stability trend</Text>
              </div>
            </div>
            
            <div className="h-44 flex items-end gap-2 px-2 relative">
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/5 pointer-events-none" />
              {(data?.moodLogs || Array.from({ length: 20 })).slice(0, 30).reverse().map((log: { score?: number }, i: number) => {
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
            <div className="flex justify-between mt-6 px-2">
              <Text variant="small" color="muted" weight="medium">Past Period</Text>
              <Text variant="small" color="muted" weight="medium">Present</Text>
            </div>
          </div>

          {/* Department Moods */}
          <div className="card lg:col-span-4 p-8">
            <Text variant="h3" className="mb-10">Departmental Wellness</Text>
            <div className="space-y-6">
              {(data?.deptStats || []).map((dept: { name: string; score: number }, i: number) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <Text color="secondary" weight="medium" className="tracking-wide truncate max-w-[150px]">{dept.name}</Text>
                    <Text weight="bold" className="tabular-nums">{dept.score}</Text>
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
            <Text variant="h3" className="mb-10 self-start">Severity Scan</Text>
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
                <Text variant="h1" className="tabular-nums">{data?.studentCount || 0}</Text>
                <Text variant="caption" color="muted" className="mt-1">Assessed</Text>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 w-full">
              {[
                { label: '45% Minimal', color: 'bg-primary' },
                { label: '25% Mild', color: 'bg-secondary' },
                { label: '18% Moderate', color: 'bg-warning' },
                { label: '12% Severe', color: 'bg-danger' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("size-1.5 rounded-full", item.color)} />
                  <Text variant="small" color="secondary" weight="medium">{item.label}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Overview */}
          <div className="card lg:col-span-4 p-8">
            <Text variant="h3" className="mb-8">Staff on Duty</Text>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">D</div>
                  <div>
                    <Text variant="small" weight="semibold" className="leading-none mb-1">Dr. Radha Sharma</Text>
                    <Text variant="caption" color="muted" weight="medium">Counselor</Text>
                  </div>
                </div>
                <div className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
            </div>
          </div>

          {/* Top Resources */}
          <div className="card lg:col-span-4 p-8">
            <Text variant="h3" className="mb-8">Content Engagement</Text>
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
                    <Text color="secondary" weight="medium" className="group-hover:text-white transition-colors">{res.title}</Text>
                  </div>
                  <div className="text-right">
                    <Text weight="bold" className="tabular-nums">{res.count}</Text>
                    <Text variant="caption" color="muted">Hits</Text>
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
              <Text variant="h3">Campus Stress Pulse</Text>
              <Text variant="subtitle" color="secondary" className="mt-2">Daily aggregate analysis over the last semester</Text>
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
            <div className="flex items-center gap-3">
              <Text variant="small" color="muted" weight="medium">Low Intensity</Text>
              <div className="flex gap-1">
                <div className="size-2.5 rounded-[1px] bg-white/5" />
                <div className="size-2.5 rounded-[1px] bg-primary/20" />
                <div className="size-2.5 rounded-[1px] bg-primary/40" />
                <div className="size-2.5 rounded-[1px] bg-primary/70" />
                <div className="size-2.5 rounded-[1px] bg-primary" />
              </div>
              <Text variant="small" color="muted" weight="medium">High Intensity</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
