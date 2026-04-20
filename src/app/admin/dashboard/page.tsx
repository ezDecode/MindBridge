'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { PageIntro } from "@/components/site"
import { Button, Card, Text, SkeletonText } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Profile {
 id: string
 name: string
 role: string
 institution: string | null
 created_at: string
}

export default function AdminDashboardPage() {
 const [user, setUser] = useState<User | null>(null)
 const [profiles, setProfiles] = useState<Profile[]>([])
 const [loading, setLoading] = useState(true)

 const supabase = useMemo(() => createClient(), [])

 const fetchData = useCallback(async () => {
 const { data: { user } } = await supabase.auth.getUser()
 setUser(user)
 
 if (!user) {
 setLoading(false)
 return
 }

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
 }, [supabase])

 useEffect(() => {
 fetchData()
 }, [fetchData])

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
 <Text as="h1" variant="h3" weight="bold" className="tracking-tight text-[var(--color-text-primary)]">Admin Control Panel</Text>
 <Text as="p" className="text-[var(--color-text-secondary)] mt-2">Manage all system users, review activity logs, and monitor metrics securely.</Text>
 </div>

 <section>
 <div className="flex justify-between items-end mb-4">
 <Text as="h2" variant="label" weight="bold" className="uppercase tracking-wider text-[var(--color-text-muted)] text-[11px]">All Registered Users</Text>
 <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{profiles.length} total users</span>
 </div>

 <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden divide-y divide-[var(--color-border)]">
 {profiles.length === 0 ? (
 <div className="p-8 text-center">
 <Text className="text-[var(--color-text-muted)]">No users found or permission denied.</Text>
 </div>
 ) : (
 profiles.map((profile) => (
 <motion.div 
 key={profile.id}
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-surface-tinted)] transition-colors"
 role="article"
 >
 <div>
 <div className="flex items-center gap-3">
 <Text variant="h6" className="font-bold text-[var(--color-text-primary)] leading-none">{profile.name || 'Unnamed User'}</Text>
 <span className="px-2 py-0.5 rounded bg-[var(--color-surface-strong)] text-[10px] uppercase font-bold text-[var(--color-text-secondary)] tracking-widest">{profile.role}</span>
 </div>
 <Text className="text-[13px] text-[var(--color-text-secondary)] mt-1.5 flex items-center gap-2">
 <span className="opacity-70">{profile.id.split('-')[0]}</span>
 <span>&bull;</span>
 <span>Institution: {profile.institution || 'N/A'}</span>
 </Text>
 </div>
 <Link href={`/admin/student/${profile.id}`} className="shrink-0">
 <Button variant="ghost" size="sm" className="h-9 px-4 rounded-md bg-[var(--color-surface-strong)] text-[var(--color-text-primary)] transition-colors hover:bg-white hover:text-black">
 View Profile
 </Button>
 </Link>
 </motion.div>
 ))
 )}
 </div>
 </section>
 </div>
 )
}

