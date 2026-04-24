'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Button, Text, Input, Skeleton } from "@/components/ui"
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'
import { cn } from "@/lib/utils"
import { getCurrentDemoUser, clearDemoSession } from '@/lib/auth/demo-session'

export function SettingsForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')

  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const user = getCurrentDemoUser()
      if (!user || !user.id) {
        throw new Error("User not available")
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error("Supabase error:", error)
      } else if (data) {
        setName(data.name || '')
        setInstitution(data.institution || '')
      }
    } catch (err) {
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const user = getCurrentDemoUser()
      if (user) {
        const trimmedName = name.trim()
        const { error } = await supabase
          .from('profiles')
          .update({ name: trimmedName, institution })
          .eq('id', user.id)

        if (error) throw error

        // No-op for auth.updateUser as we are using demo system
        
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
    clearDemoSession()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
        <div className="flex justify-between pt-4">
          <Skeleton className="w-24 h-8 rounded-md" />
          <Skeleton className="w-32 h-8 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1">
      <section className="space-y-6">
        <div className="space-y-2">
          <Text variant="small" weight="bold" className="uppercase tracking-widest text-text-dim text-[10px]">
            Display Name
          </Text>
          <Input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="How should we call you?"
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Text variant="small" weight="bold" className="uppercase tracking-widest text-text-dim text-[10px]">
            Institution
          </Text>
          <Input 
            type="text" 
            value={institution}
            onChange={e => setInstitution(e.target.value)}
            placeholder="Your University or School"
            disabled={saving}
          />
        </div>
      </section>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs font-bold text-danger hover:opacity-80 transition-opacity uppercase tracking-widest"
        >
          <Icon icon="tabler:logout-2" className="h-4 w-4" />
          Sign Out
        </button>
        
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="md"
          className="px-8"
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
            className={cn(
              "p-4 rounded-md flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest border",
              message.type === 'success' 
              ? "bg-success/5 text-success border-success/20" 
              : "bg-danger/5 text-danger border-danger/20"
            )}
          >
            <Icon icon={message.type === 'success' ? 'tabler:circle-check' : 'tabler:alert-circle'} className="h-4 w-4" />
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
