'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Text, SkeletonText } from "@/components/ui"
import { motion } from 'framer-motion'
import Link from 'next/link'
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

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <SkeletonText lines={1} className="w-1/4 h-8" />
        <SkeletonText lines={3} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-12 pt-6">
      <div>
        <Text as="h1" variant="h3" weight="bold" className="tracking-tight text-[var(--text-primary)]">Admin Control Panel</Text>
        <Text as="p" color="secondary" className="mt-2">Manage all system users, review activity logs, and monitor metrics securely.</Text>
      </div>

      <section>
        <div className="flex justify-between items-end mb-4">
          <Text as="h2" variant="label" weight="bold" className="uppercase tracking-wider text-[var(--text-muted)] text-[11px]">Registered Users</Text>
          <span className="text-[12px] font-medium text-[var(--text-muted)]">{profiles.length} total users</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-3 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between px-2 pb-3">
              <Text as="h3" variant="h6" weight="bold" className="text-[var(--text-primary)]">Students</Text>
              <span className="rounded-full bg-[var(--chip-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">{students.length}</span>
            </div>
            <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {students.length === 0 ? (
                <div className="rounded-lg bg-[var(--surface-default)] px-4 py-6 text-center">
                  <Text className="text-[var(--text-muted)]">No student accounts found.</Text>
                </div>
              ) : (
                students.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-default)] p-4 sm:flex-row sm:items-center sm:justify-between"
                    role="article"
                  >
                    <div>
                      <Text variant="h6" className="font-bold text-[var(--text-primary)] leading-none">{getCardDisplayName(profile)}</Text>
                      <Text className="mt-1.5 text-[13px] text-[var(--text-muted)]">Institution: {profile.institution || 'N/A'}</Text>
                    </div>
                    <Link href={`/admin/student/${profile.id}`} className="shrink-0">
                      <Button variant="ghost" size="sm" className="h-9 rounded-md bg-[var(--bg-hover)] px-4 text-[var(--text-primary)] hover:bg-[var(--surface-default)]">
                        View Profile
                      </Button>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-3 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between px-2 pb-3">
              <Text as="h3" variant="h6" weight="bold" className="text-[var(--text-primary)]">Counselors</Text>
              <span className="rounded-full bg-[var(--chip-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">{counselors.length}</span>
            </div>
            <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {counselors.length === 0 ? (
                <div className="rounded-lg bg-[var(--surface-default)] px-4 py-6 text-center">
                  <Text className="text-[var(--text-muted)]">No counselor accounts found.</Text>
                </div>
              ) : (
                counselors.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-default)] p-4"
                    role="article"
                  >
                    <div className="flex items-center gap-2">
                      <Text variant="h6" className="font-bold text-[var(--text-primary)] leading-none">{getCardDisplayName(profile)}</Text>
                      <span className="rounded bg-[var(--chip-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Counselor</span>
                    </div>
                    <Text className="mt-1.5 text-[13px] text-[var(--text-muted)]">Institution: {profile.institution || 'N/A'}</Text>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

