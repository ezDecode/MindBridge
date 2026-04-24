'use client'

import { useEffect, useState } from 'react'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { Icon } from "@iconify/react"
import { cn } from '@/lib/utils'
import { Button, Text } from "@/components/ui"

interface Profile {
  id: string
  name: string | null
  role: string
  institution: string | null
}



export default function AdminDashboardPage() {
  const [students, setStudents] = useState<Profile[]>([])
  const [counselors, setCounselors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        const profiles = data.profiles || []
        setStudents(profiles.filter((p: any) => p.role === 'student'))
        setCounselors(profiles.filter((p: any) => p.role === 'counselor'))
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
      < 
        }
        
        className="size-12 rounded-full border-4 border-primary/20 border-t-primary"
      />
      <p className="text-text-muted font-medium animate-pulse font-sans">Synthesizing campus analytics...</p>
    </div>
  )

  return (
    <div className="w-full pb-20">
      < 
        
        
        
        className="mx-auto max-w-7xl space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <>
            <Text as="h2" variant="h1" weight="semibold" className="mb-4 text-balance">
              Campus <span className="text-primary">Intelligence</span>
            </Text>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-md shadow-sm">
                <Icon icon="tabler:school" className="text-primary h-4 w-4" />
                <Text as="span" variant="small" weight="medium">Jammu University</Text>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md shadow-sm">
                <Icon icon="tabler:shield-check" className="text-text-muted h-4 w-4" />
                <Text as="span" variant="small" weight="medium" color="secondary">Anonymized Data</Text>
              </div>
            </div>
          </>
          
          <  className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-surface border border-border px-4 py-2 rounded-md text-xs font-semibold text-text-muted hover:border-white/20 transition-all outline-none pr-10 cursor-pointer">
                <option>Spring 2025</option>
                <option>Fall 2024</option>
              </select>
              <Icon icon="tabler:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
            </div>
            <Button size="md" className="gap-2">
              <Icon icon="tabler:download" className="text-lg" />
              <span className="hidden sm:inline">Export intelligence</span>
            </Button>
          </>
        </div>

        {/* Main Stats Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Campus Mood Avg', value: '3.6', sub: '↑ +0.2 this month', icon: 'tabler:mood-smile', color: 'text-primary' },
            { label: 'Enrolled Students', value: students.length, sub: 'Active in cohort', icon: 'tabler:users', color: 'text-secondary' },
            { label: 'MindBot Sessions', value: '1,240', sub: '↑ +18% this month', icon: 'tabler:robot', color: 'text-warning' },
            { label: 'Crisis Alerts', value: '12', sub: 'All resolved', icon: 'tabler:alert-circle', color: 'text-danger', isCritical: true }
          ].map((stat, i) => (
            < 
              key={i}
              
              className="card-raised p-6 group hover:border-white/20 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 mb-6">
                <Icon icon={stat.icon} className={cn("text-xl transition-transform", stat.color)} />
              </div>
              <div className="text-3xl font-semibold tabular-nums text-white leading-none mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</div>
              <div className={cn("mt-6 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", stat.isCritical ? "text-danger" : "text-success")}>
                {stat.sub}
                {stat.isCritical && <Icon icon="tabler:check" className="text-success h-3 w-3" />}
              </div>
            </>
          ))}
        </div>

        {/* Mid Section Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Mood Trend Chart */}
          <  className="card lg:col-span-8 p-8 group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Text as="h3" weight="semibold">Campus Sentiment</Text>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">30-day stability trend</p>
              </div>
              <div className="flex gap-2">
                <span className="badge badge-outline">Peak: 3.9</span>
                <span className="badge badge-outline border-warning/20 text-warning">Low: 3.1</span>
              </div>
            </div>
            
            <div className="h-44 flex items-end gap-2 px-2 relative">
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/5 pointer-events-none" />
              {Array.from({ length: 20 }).map((_, i) => {
                // Use a deterministic pseudo-random height based on index to avoid hydration mismatch
                const h = 40 + ((i * 13) % 50);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    < 
                      }
                      %` }}
                      
                      className={cn(
                        "w-full rounded-sm transition-all duration-300",
                        h> 70 ? "bg-primary" : h> 50 ? "bg-primary/60" : "bg-primary/30"
                      )}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-6 px-2 text-[9px] font-bold text-text-dim uppercase tracking-widest">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </>

          {/* Department Moods */}
          <  className="card lg:col-span-4 p-8">
            <Text as="h3" weight="semibold" className="mb-10">Departmental Wellness</Text>
            <div className="space-y-6">
              {[
                { name: 'CSE', score: 3.5, width: '70%', color: 'bg-primary' },
                { name: 'ECE', score: 3.8, width: '76%', color: 'bg-primary/80' },
                { name: 'Science', score: 3.3, width: '66%', color: 'bg-primary/60' },
                { name: 'Management', score: 3.0, width: '60%', color: 'bg-warning/60' },
                { name: 'Arts', score: 4.2, width: '84%', color: 'bg-secondary' }
              ].map((dept, i) => (
                <div key={i} className="space-y-3 group">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-text-muted tracking-wide uppercase">{dept.name}</span>
                    <span className="text-xs font-bold tabular-nums text-white">{dept.score}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    < 
                      }
                      }
                      
                      className={cn("h-full rounded-full transition-all duration-500", dept.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </>

          {/* PHQ-9 Donut (Simulated with SVG) */}
          <  className="card lg:col-span-4 p-8 flex flex-col items-center justify-center text-center">
            <Text as="h3" weight="semibold" className="mb-10 self-start">Severity Scan</Text>
            <div className="relative size-40 mb-10">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                < 
                  cx="50" cy="50" r="40" fill="transparent" 
                  stroke="var(--primary)" strokeWidth="8" 
                  strokeDasharray="251.2" 
                  }
                  }
                  
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tabular-nums text-white">{students.length}</span>
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
          </>

          {/* Staff Overview */}
          <  className="card lg:col-span-4 p-8">
            <Text as="h3" weight="semibold" className="mb-8">Staff on Duty</Text>
            <div className="space-y-3">
              {counselors.map((c) => (
                < 
                  key={c.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {c.name?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-none mb-1">{resolveProfileDisplayName({ profileName: c.name }) || 'Staff'}</p>
                      <p className="text-[9px] font-bold text-text-dim uppercase tracking-wider">Counselor</p>
                    </div>
                  </div>
                  <div className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                </>
              ))}
              {counselors.length === 0 && (
                <div className="p-8 text-center text-text-dim border border-dashed border-white/5 rounded-md">
                  <Icon icon="tabler:users-off" className="text-2xl mx-auto mb-2 opacity-10" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">No active staff</p>
                </div>
              )}
            </div>
          </>

          {/* Top Resources */}
          <  className="card lg:col-span-4 p-8">
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
            <button className="btn btn-secondary w-full mt-10 text-[10px] uppercase tracking-widest font-bold">
              Analytics Report
            </button>
          </>
        </div>

        {/* Heatmap Elevation */}
        <  className="card p-10">
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
                 < 
                    key={i} 
                    }
                    }
                    
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
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 badge badge-outline border-warning/20 text-warning text-[9px]">
                <Icon icon="tabler:pin" />
                Internal Exams
              </div>
              <div className="flex items-center gap-2 badge badge-outline border-danger/20 text-danger text-[9px]">
                <Icon icon="tabler:alert-triangle" />
                Finals Week
              </div>
            </div>
          </div>
        </>
      </>
    </div>
  )
}
