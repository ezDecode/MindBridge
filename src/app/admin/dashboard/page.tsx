'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Text, Sheet, Button, Skeleton } from "@/components/ui"
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

const ITEMS_PER_PAGE = 10

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
}

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'students' | 'counselors'>('students')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  const priorityStudents = useMemo(() => {
    return students.slice(0, 4).map((s, i) => ({
      ...s,
      reason: i === 0 ? 'Low mood logs' : i === 1 ? 'Sudden activity drop' : i === 2 ? 'Crisis signal' : 'Proactive check-in',
      severity: i === 2 ? 'high' : 'medium',
      time: i === 0 ? '12m' : i === 1 ? '45m' : i === 2 ? '2h' : '5h'
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

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE)
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredList.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredList, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  if (loading) {
    return (
      <div className="w-full space-y-8 p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl bg-surface-strong/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-4 h-[500px] rounded-2xl bg-surface-strong/30" />
          <Skeleton className="lg:col-span-8 h-[500px] rounded-2xl bg-surface-strong/30" />
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full space-y-10 pb-20"
    >
      <header className="flex flex-col gap-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-action-primary">System Overview</Text>
        <Text className="text-2xl font-bold tracking-tight">Institutional Dashboard</Text>
      </header>
      
      {/* ── Key Indicators ── */}
      <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon="tabler:users" 
          label="Total Cohort" 
          value={students.length.toString()} 
          accent="primary"
        />
        <MetricCard 
          icon="tabler:alert-triangle" 
          label="Risk Metrics" 
          value={priorityStudents.length.toString()} 
          accent="error"
        />
        <MetricCard 
          icon="tabler:activity" 
          label="Engagement" 
          value="92%" 
          accent="success"
        />
        <MetricCard 
          icon="tabler:shield-check" 
          label="Verified Staff" 
          value={counselors.length.toString()} 
          accent="info"
        />
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Priority Feed ── */}
        <motion.aside variants={itemVariants} className="lg:col-span-4 space-y-6">
          <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Triage Queue</Text>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-status-error animate-pulse shadow-[0_0_8px_var(--status-error)]" />
            </div>
            
            <div className="divide-y divide-border-default/50">
              <AnimatePresence mode="popLayout" initial={false}>
                {priorityStudents.map((s, idx) => (
                  <motion.button 
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedStudentId(s.id)}
                    className="w-full text-left px-5 py-4 hover:bg-surface-strong/40 transition-colors group flex items-start gap-4 active:scale-[0.98]"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-full bg-surface-strong text-text-primary flex items-center justify-center font-bold text-sm border border-border-default transition-colors group-hover:bg-action-primary group-hover:text-text-inverse">
                      {getDisplayName(s).charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <Text className="text-[14px] font-semibold truncate tracking-tight">{getDisplayName(s)}</Text>
                        <Text className="text-[10px] text-text-muted font-medium tabular-nums">{s.time}</Text>
                      </div>
                      <Text className="text-[12px] text-text-secondary line-clamp-1 italic opacity-80">
                        {s.reason}
                      </Text>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
              {priorityStudents.length === 0 && (
                <div className="p-12 text-center opacity-30">
                  <Icon icon="tabler:shield-check" className="h-8 w-8 mx-auto mb-3" />
                  <Text className="text-[10px] font-bold uppercase tracking-widest">Queue Clear</Text>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* ── User Registry ── */}
        <motion.main variants={itemVariants} className="lg:col-span-8">
          <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
            
            <div className="px-6 py-4 border-b border-border-default flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex p-1 bg-surface-strong/40 rounded-lg border border-border-default/50">
                <TabButton 
                  active={activeTab === 'students'} 
                  onClick={() => setActiveTab('students')}
                  label="Students"
                />
                <TabButton 
                  active={activeTab === 'counselors'} 
                  onClick={() => setActiveTab('counselors')}
                  label="Counselors"
                />
              </div>

              <div className="relative group w-full sm:w-[260px]">
                <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-colors group-focus-within:text-action-primary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find identities..."
                  className="w-full h-9 bg-surface-strong/30 pl-9 pr-4 text-[13px] font-medium rounded-lg border border-transparent focus:bg-surface-default focus:border-action-primary/30 focus:outline-none transition-all placeholder:text-text-muted/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-strong/20 border-b border-border-default/50">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-text-muted">Identity</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-text-muted">Organization</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/30">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {paginatedList.map((p, idx) => (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group cursor-pointer hover:bg-surface-strong/20 transition-colors"
                        onClick={() => p.role === 'student' && setSelectedStudentId(p.id)}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors ${
                              p.role === 'student' 
                                ? 'bg-surface-strong border-border-default text-text-primary group-hover:bg-action-primary/10 group-hover:text-action-primary' 
                                : 'bg-action-primary text-text-inverse border-transparent'
                            }`}>
                              {getDisplayName(p).charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Text className="text-[13.5px] font-semibold truncate tracking-tight group-hover:text-action-primary transition-colors">{getDisplayName(p)}</Text>
                                {p.role === 'counselor' && (
                                  <Icon icon="tabler:shield-check" className="h-3.5 w-3.5 text-action-primary" />
                                )}
                              </div>
                              <Text className="text-[11px] text-text-muted truncate font-medium opacity-60 tabular-nums">{p.email || 'Anonymized'}</Text>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Text className="text-[13px] text-text-secondary font-medium tracking-tight">{p.institution || 'Independent'}</Text>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {p.role === 'student' ? (
                            <Icon icon="tabler:arrow-right" className="h-4 w-4 ml-auto text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-action-primary bg-action-primary/10 px-2 py-1 rounded">Staff</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredList.length === 0 && (
                <div className="py-32 text-center opacity-30">
                  <Icon icon="tabler:database-search" className="h-10 w-10 mx-auto mb-4" />
                  <Text className="text-[11px] font-bold uppercase tracking-widest">No results</Text>
                </div>
              )}
            </div>

            {/* ── Pagination Footer ── */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-default flex items-center justify-between bg-surface-strong/10">
                <Text className="text-[10px] font-medium text-text-muted tabular-nums">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} of {filteredList.length} identities
                </Text>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg border border-border-default flex items-center justify-center bg-surface-default hover:bg-surface-strong disabled:opacity-30 transition-colors active:scale-95"
                  >
                    <Icon icon="tabler:chevron-left" className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg border border-border-default flex items-center justify-center bg-surface-default hover:bg-surface-strong disabled:opacity-30 transition-colors active:scale-95"
                  >
                    <Icon icon="tabler:chevron-right" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.main>
      </div>

      <Sheet
        isOpen={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        title="Student Diagnostic"
      >
        {selectedStudentId && (
          <div className="px-4 pb-20">
            <StudentDetailView studentId={selectedStudentId} />
          </div>
        )}
      </Sheet>
    </motion.div>
  )
}

function MetricCard({ icon, label, value, accent }: { icon: string, label: string, value: string, accent: 'primary' | 'error' | 'success' | 'info' }) {
  const accentColors = {
    primary: 'text-action-primary border-action-primary/20 bg-action-primary/5',
    error: 'text-status-error border-status-error/20 bg-status-error/5',
    success: 'text-status-success border-status-success/20 bg-status-success/5',
    info: 'text-status-info border-status-info/20 bg-status-info/5',
  }

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-surface-default border border-border-default p-5 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${accentColors[accent]} transition-transform duration-500 group-hover:scale-110`}>
          <Icon icon={icon} className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <Text className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 opacity-70">{label}</Text>
        <Text className="text-3xl font-bold text-text-primary tracking-tight tabular-nums leading-none" style={{ fontFamily: 'var(--font-mindbridge)' }}>{value}</Text>
      </div>
    </motion.div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all active:scale-[0.96] ${
        active 
          ? 'bg-surface-default text-action-primary shadow-sm border border-border-default' 
          : 'text-text-muted hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  )
}
