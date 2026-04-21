'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Text, Input, Skeleton } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

export function SettingsForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  
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
        const trimmedName = name.trim()
        const { error } = await supabase
          .from('profiles')
          .update({ name: trimmedName, institution })
          .eq('id', user.id)

        if (error) throw error

        await supabase.auth.updateUser({
          data: {
            name: trimmedName,
            full_name: trimmedName,
            display_name: trimmedName,
          },
        })

        setMessage({ text: 'Settings saved successfully.', type: 'success' })
        if (onSuccess) setTimeout(onSuccess, 1500)
      }
    } catch (err: unknown) {
      console.error(err)
      const error = err as Error;
      setMessage({ text: error.message || 'Failed to save settings.', type: 'error' })
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
      <div className="space-y-6 p-4">
        <Skeleton className="w-full h-12 rounded-2xl" />
        <Skeleton className="w-full h-12 rounded-2xl" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1">
      <section className="space-y-4">
        <div className="space-y-2">
          <Text variant="small" weight="bold" className="uppercase tracking-widest text-[var(--text-muted)] text-[10px]">
            Display Name
          </Text>
          <Input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="How should we call you?"
            disabled={saving}
            className="rounded-2xl py-6"
          />
        </div>

        <div className="space-y-2">
          <Text variant="small" weight="bold" className="uppercase tracking-widest text-[var(--text-muted)] text-[10px]">
            Institution
          </Text>
          <Input 
            type="text" 
            value={institution}
            onChange={e => setInstitution(e.target.value)}
            placeholder="Your University or School"
            disabled={saving}
            className="rounded-2xl py-6"
          />
        </div>
      </section>

      <div className="flex items-center justify-between pt-4">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm font-bold text-[var(--status-error)] hover:opacity-80 transition-opacity"
        >
          <Icon icon="tabler:logout-2" className="h-5 w-5" />
          Sign Out
        </button>
        
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-2xl px-8"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
              message.type === 'success' 
              ? 'bg-[var(--status-success-light)] text-[var(--status-success)]' 
              : 'bg-[var(--status-error-light)] text-[var(--status-error)]'
            }`}
          >
            <Icon icon={message.type === 'success' ? 'tabler:circle-check' : 'tabler:alert-circle'} className="h-5 w-5" />
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
