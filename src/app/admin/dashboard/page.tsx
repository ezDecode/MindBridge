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
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <PageIntro 
        title="Admin Panel" 
        description="View and manage all users in MindBridge." 
      />

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Text variant="h3">All Users</Text>
        </div>

        {profiles.length === 0 ? (
          <Text className="text-[var(--color-text-muted)]">No users found or permission denied.</Text>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => (
              <motion.div 
                key={profile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-soft)]"
              >
                <div>
                  <Text variant="h4" className="font-semibold">{profile.name || 'Unnamed User'}</Text>
                  <Text className="text-sm text-[var(--color-text-secondary)]">Role: {profile.role} | Institution: {profile.institution || 'N/A'}</Text>
                </div>
                <Link href={`/admin/student/${profile.id}`}>
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
