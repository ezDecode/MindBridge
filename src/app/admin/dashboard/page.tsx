'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Text, SkeletonText } from "@/components/ui"
import { motion } from 'motion/react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { resolveProfileDisplayName } from '@/lib/profile-name'

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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.profiles || [])
      } else {
        console.error('Failed to fetch admin users')
      }
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const students = useMemo(
    () => profiles.filter((profile) => profile.role === 'student'),
    [profiles]
  )
  const counselors = useMemo(
    () => profiles.filter((profile) => profile.role === 'counselor'),
    [profiles]
  )
  const getCardDisplayName = useCallback(
    (profile: Profile) =>
      resolveProfileDisplayName({ profileName: profile.name, email: profile.email }) ||
      (profile.role === 'counselor' ? 'Counselor' : 'Student'),
    []
  )

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const q = searchQuery.toLowerCase()
    return students.filter(
      (p) =>
        getCardDisplayName(p).toLowerCase().includes(q) ||
        (p.institution || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    )
  }, [students, searchQuery, getCardDisplayName])

  const filteredCounselors = useMemo(() => {
    if (!searchQuery.trim()) return counselors
    const q = searchQuery.toLowerCase()
    return counselors.filter(
      (p) =>
        getCardDisplayName(p).toLowerCase().includes(q) ||
        (p.institution || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    )
  }, [counselors, searchQuery, getCardDisplayName])

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <SkeletonText lines={1} className="w-1/4 h-8" />
        <div className="grid gap-4 grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--surface-strong)] animate-pulse" />
          ))}
        </div>
        <SkeletonText lines={5} />
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Users',
      value: profiles.length,
      icon: 'tabler:users-group',
      color: 'var(--action-primary)',
      bg: 'var(--action-primary-light)',
    },
    {
      label: 'Students',
      value: students.length,
      icon: 'tabler:school',
      color: '#B58863',
      bg: '#B5886318',
    },
    {
      label: 'Counselors',
      value: counselors.length,
      icon: 'tabler:stethoscope',
      color: '#0ea5e9',
      bg: '#0ea5e918',
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--surface-strong)] p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Administration
            </Text>
            <Text as="h1" variant="h3" weight="bold" className="mt-2 tracking-tight text-[var(--text-primary)]">
              Control Panel
            </Text>
            <Text as="p" variant="body" className="mt-2 max-w-xl text-[var(--text-secondary)]">
              Manage system users, review activity, and monitor platform health.
            </Text>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--action-primary)] text-[var(--text-inverse)]">
            <Icon icon="tabler:shield-check" className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 transition-all duration-200 hover:shadow-md hover:border-[var(--border-strong)]">
              <div className="flex items-center justify-between">
                <Text as="p" variant="small" weight="medium" className="text-[var(--text-muted)]">
                  {metric.label}
                </Text>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: metric.bg, color: metric.color }}
                >
                  <Icon icon={metric.icon} className="h-5 w-5" />
                </div>
              </div>
              <Text as="p" variant="h3" weight="bold" className="mt-3 text-[var(--text-primary)]">
                {metric.value}
              </Text>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Icon icon="tabler:search" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or institution..."
          className="no-focus-ring w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:border-[var(--border-strong)]"
        />
      </div>

      {/* Users Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: '#B5886318', color: '#B58863' }}>
                <Icon icon="tabler:school" className="h-4 w-4" />
              </div>
              <Text as="h2" variant="body" weight="bold" className="text-[var(--text-primary)]">
                Students
              </Text>
            </div>
            <span className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)]">
              {filteredStudents.length}
            </span>
          </div>

          <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-default)] px-4 py-8 text-center">
                <Icon icon="tabler:user-off" className="mx-auto h-8 w-8 text-[var(--text-muted)] opacity-40" />
                <Text className="mt-2 text-[var(--text-muted)]">
                  {searchQuery ? 'No students match your search.' : 'No student accounts found.'}
                </Text>
              </div>
            ) : (
              filteredStudents.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Link
                    href={`/admin/student/${profile.id}`}
                    className="group flex items-center gap-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--action-primary)] to-[var(--action-primary-hover)] text-[var(--text-inverse)] text-sm font-bold shadow-sm">
                      {getCardDisplayName(profile).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text variant="body" weight="bold" className="text-[var(--text-primary)] truncate leading-tight">
                        {getCardDisplayName(profile)}
                      </Text>
                      <Text className="mt-0.5 text-[12px] text-[var(--text-muted)] truncate">
                        {profile.email || profile.institution || 'No details'}
                      </Text>
                    </div>
                    <Icon
                      icon="tabler:chevron-right"
                      className="h-4 w-4 shrink-0 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                    />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Counselors Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: '#0ea5e918', color: '#0ea5e9' }}>
                <Icon icon="tabler:stethoscope" className="h-4 w-4" />
              </div>
              <Text as="h2" variant="body" weight="bold" className="text-[var(--text-primary)]">
                Counselors
              </Text>
            </div>
            <span className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)]">
              {filteredCounselors.length}
            </span>
          </div>

          <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {filteredCounselors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-default)] px-4 py-8 text-center">
                <Icon icon="tabler:user-off" className="mx-auto h-8 w-8 text-[var(--text-muted)] opacity-40" />
                <Text className="mt-2 text-[var(--text-muted)]">
                  {searchQuery ? 'No counselors match your search.' : 'No counselor accounts found.'}
                </Text>
              </div>
            ) : (
              filteredCounselors.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <div className="flex items-center gap-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white' }}>
                      {getCardDisplayName(profile).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Text variant="body" weight="bold" className="text-[var(--text-primary)] truncate leading-tight">
                          {getCardDisplayName(profile)}
                        </Text>
                        <span className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: '#0ea5e915', color: '#0ea5e9' }}>
                          Counselor
                        </span>
                      </div>
                      <Text className="mt-0.5 text-[12px] text-[var(--text-muted)] truncate">
                        {profile.email || profile.institution || 'No details'}
                      </Text>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
