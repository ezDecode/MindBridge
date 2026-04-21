'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Text, Sheet } from "@/components/ui"
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { StudentDetailView } from '../_components/StudentDetailView'

interface Profile {
  id: string
  name: string | null
  role: string
  institution: string | null
  created_at: string
  email?: string
}

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'students' | 'counselors'>('students')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.profiles || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const students = useMemo(() => profiles.filter((p) => p.role === 'student'), [profiles])
  const counselors = useMemo(() => profiles.filter((p) => p.role === 'counselor'), [profiles])

  // Simulated "At Risk" logic for UI demonstration
  const atRiskStudents = useMemo(() => {
    return students.slice(0, 3).map((s, i) => ({
      ...s,
      reason: i === 0 ? 'Multiple low mood logs' : i === 1 ? 'Sudden activity drop' : 'Crisis signal detected',
      severity: i === 2 ? 'high' : 'medium'
    }))
  }, [students])

  const getDisplayName = useCallback(
    (profile: Profile) =>
      resolveProfileDisplayName({ profileName: profile.name, email: profile.email }) ||
      (profile.role === 'counselor' ? 'Counselor' : 'Student'),
    []
  )

  const filteredList = useMemo(() => {
    const list = activeTab === 'students' ? students : counselors
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (p) =>
        getDisplayName(p).toLowerCase().includes(q) ||
        (p.institution || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    )
  }, [activeTab, students, counselors, searchQuery, getDisplayName])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-12 animate-pulse">
        <div className="h-24 w-3/4 bg-[var(--surface-strong)] rounded-xl" />
        <div className="h-12 w-1/2 bg-[var(--surface-strong)] rounded-xl" />
        <div className="space-y-4">
          <div className="h-16 bg-[var(--surface-strong)] rounded-xl" />
          <div className="h-16 bg-[var(--surface-strong)] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-24 pt-12 px-6 sm:px-12 md:px-16">
      
      {/* Editorial Header - Replaces standard hero metric cards */}
      <header className="mb-20 md:mb-32 max-w-5xl">
        <Text as="h1" className="text-[clamp(2.5rem,6vw,4.5rem)] font-black tracking-tight leading-[1.05] mb-8 text-[var(--text-primary)]">
          System Overview
        </Text>
        <p className="text-[clamp(1.25rem,3vw,1.75rem)] text-[var(--text-secondary)] leading-snug font-medium max-w-4xl">
          Monitoring <span className="text-[var(--text-primary)] font-bold">{students.length}</span> active students across the network, supported by <span className="text-[var(--text-primary)] font-bold">{counselors.length}</span> counselors. The platform is currently operating <span className="text-[var(--status-success)]">smoothly</span>, with {atRiskStudents.length} situations requiring intervention.
        </p>
      </header>

      {/* Attention Required Section - Linear, hierarchical list instead of repetitive cards */}
      <section className="mb-24">
        <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-[var(--border-default)]">
          <Text as="h2" className="text-2xl md:text-3xl font-bold tracking-tight">Requires Attention</Text>
          <Text className="text-xs font-bold uppercase tracking-widest text-[var(--status-error)] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-error)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-error)]"></span>
            </span>
            {atRiskStudents.length} Active Flags
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          {atRiskStudents.map((s) => (
            <button 
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className="group text-left w-full flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-6 md:p-8 rounded-[2rem] bg-[var(--surface-default)] hover:bg-[var(--surface-soft)] transition-colors"
            >
              <div className="flex items-center gap-5 md:w-1/3 shrink-0">
                <div className="h-12 w-12 rounded-full bg-[var(--status-error)]/10 text-[var(--status-error)] flex items-center justify-center font-bold text-xl shrink-0">
                  {getDisplayName(s).charAt(0)}
                </div>
                <div>
                  <Text weight="bold" className="text-lg md:text-xl truncate">{getDisplayName(s)}</Text>
                  <Text className="text-xs font-bold uppercase tracking-widest text-[var(--status-error)] mt-1 opacity-80">
                    {s.severity} Severity
                  </Text>
                </div>
              </div>
              
              <div className="flex-1 md:border-l md:border-[var(--border-default)] md:pl-8">
                <Text className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
                  &quot;{s.reason}&quot;
                </Text>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-left md:text-right mt-4 md:mt-0">
                <Text className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                  Last active: 2h ago
                </Text>
                <div className="h-10 w-10 rounded-full bg-[var(--surface-strong)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--surface-default)] transition-colors">
                  <Icon icon="tabler:arrow-right" className="h-5 w-5" />
                </div>
              </div>
            </button>
          ))}
          {atRiskStudents.length === 0 && (
            <div className="p-12 text-center text-[var(--text-muted)] italic">
              No active flags requiring attention.
            </div>
          )}
        </div>
      </section>

      {/* User Directory - Fluid grid without hero cards */}
      <section>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 pb-6 border-b border-[var(--border-default)]">
          <Text as="h2" className="text-2xl md:text-3xl font-bold tracking-tight">Network Directory</Text>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`text-sm font-bold uppercase tracking-widest transition-colors pb-1 border-b-2 ${
                  activeTab === 'students' 
                  ? 'text-[var(--text-primary)] border-[var(--text-primary)]' 
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                }`}
              >
                Students ({students.length})
              </button>
              <button
                onClick={() => setActiveTab('counselors')}
                className={`text-sm font-bold uppercase tracking-widest transition-colors pb-1 border-b-2 ${
                  activeTab === 'counselors' 
                  ? 'text-[var(--text-primary)] border-[var(--text-primary)]' 
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                }`}
              >
                Counselors ({counselors.length})
              </button>
            </div>

            <div className="relative group w-full sm:w-64">
              <Icon icon="tabler:search" className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--text-primary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or ID..."
                className="w-full bg-transparent py-2 pl-8 pr-0 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-b border-[var(--border-default)] focus:outline-none focus:border-[var(--text-primary)] transition-colors rounded-none"
              />
            </div>
          </div>
        </div>

        <div 
          className="grid gap-x-8 gap-y-12"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredList.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                {p.role === 'student' ? (
                  <button
                    onClick={() => setSelectedStudentId(p.id)}
                    className="group w-full text-left flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-[1.25rem] flex items-center justify-center font-bold text-xl text-white bg-[var(--text-primary)] transition-transform group-hover:scale-105 duration-300">
                        {getDisplayName(p).charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text weight="bold" className="text-lg truncate group-hover:underline underline-offset-4 decoration-2">{getDisplayName(p)}</Text>
                        <Text className="text-sm text-[var(--text-muted)] truncate mt-1">
                          {p.email || p.institution || 'Independent'}
                        </Text>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="w-full flex flex-col gap-4 opacity-80 cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-[1.25rem] flex items-center justify-center font-bold text-xl text-[var(--text-primary)] border-2 border-[var(--border-strong)] bg-transparent">
                        {getDisplayName(p).charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Text weight="bold" className="text-lg truncate">{getDisplayName(p)}</Text>
                          <Icon icon="tabler:circle-check-filled" className="h-4 w-4 text-[var(--status-info)]" />
                        </div>
                        <Text className="text-sm text-[var(--text-muted)] truncate mt-1">
                          {p.email || p.institution || 'Licensed Professional'}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredList.length === 0 && (
          <div className="py-32 text-center">
            <Text className="text-xl md:text-2xl font-medium text-[var(--text-muted)]">No profiles matched your search.</Text>
          </div>
        )}

        {/* User Detail Sheet */}
        <Sheet
          isOpen={!!selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          title="Student Insights"
        >
          {selectedStudentId && (
            <StudentDetailView 
              studentId={selectedStudentId} 
            />
          )}
        </Sheet>
      </section>
    </div>
  )
}
