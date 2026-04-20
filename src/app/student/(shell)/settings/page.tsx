'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { PageIntro } from "@/components/site"
import { Button, Card, Text, Input, Skeleton } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

export default function UserSettingsDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  
  // Settings form states
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')

  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
        setName(data.name || '')
        setInstitution(data.institution || '')
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ name, institution })
          .eq('id', user.id)

        if (error) throw error

        setMessage({ text: 'Settings saved successfully.', type: 'success' })
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err: any) {
      console.error(err)
      setMessage({ text: err.message || 'Failed to save settings.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <Skeleton className="w-1/3 h-8 rounded-lg" />
        <Skeleton className="w-full h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl space-y-8 pb-12">
      <PageIntro 
        title="Settings" 
        description="Manage your profile, preferences, and account operations securely." 
      />

      <Card variant="elevated" padding="lg" className="rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <Icon icon="solar:user-circle-linear" className="h-5 w-5" />
          </span>
          <div>
            <Text as="h3" variant="h5" weight="bold">Profile Details</Text>
            <Text as="p" variant="small" color="secondary">
              Update how you appear in MindBridge
            </Text>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Text as="label" variant="label" weight="medium" className="block text-[var(--color-text-secondary)]">
              Display Name
            </Text>
            <Input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              disabled={saving}
            />
            <Text as="p" variant="small" color="muted" className="mt-1">
              Your name helps counselors build rapport. You can change this at any time.
            </Text>
          </div>

          <div className="space-y-2">
            <Text as="label" variant="label" weight="medium" className="block text-[var(--color-text-secondary)]">
              Institution / Campus
            </Text>
            <Input 
              type="text" 
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              placeholder="e.g. University of Technology"
              disabled={saving}
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--color-border)] mt-6">
            <Button type="submit" variant="warm" size="md" disabled={saving}>
              {saving ? (
                <>
                  <Icon icon="solar:restart-circle-linear" className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
            
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-[var(--color-success)]' 
                      : 'bg-red-50 text-[var(--color-danger)]'
                  }`}
                >
                  <Icon icon={message.type === 'success' ? 'solar:check-circle-linear' : 'solar:danger-circle-linear'} className="h-4 w-4" />
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </Card>

      <Card variant="subtle" padding="lg" className="rounded-2xl border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tinted)] text-[var(--color-text-primary)]">
            <Icon icon="solar:shield-keyhole-linear" className="h-5 w-5" />
          </span>
          <div>
            <Text as="h3" variant="h5" weight="bold">Account Operations</Text>
            <Text as="p" variant="small" color="secondary">
              Sign out or manage your session safely
            </Text>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button variant="secondary" size="md" onClick={handleSignOut} className="w-full sm:w-auto">
            <Icon icon="solar:logout-2-linear" className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}
