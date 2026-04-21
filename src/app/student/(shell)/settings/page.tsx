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
  const trimmedName = name.trim()
  const { error } = await supabase
  .from('profiles')
  .update({ name: trimmedName, institution })
  .eq('id', user.id)

  if (error) throw error

  const { error: authUpdateError } = await supabase.auth.updateUser({
  data: {
  name: trimmedName,
  full_name: trimmedName,
  display_name: trimmedName,
  },
  })

  if (authUpdateError) throw authUpdateError

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
 <div className="w-full max-w-3xl space-y-6">
 <Skeleton className="w-1/3 h-8 rounded-md" />
 <Skeleton className="w-full h-32 rounded-md" />
 </div>
 )
 }

 return (
 <div className="w-full max-w-3xl mx-auto space-y-12 pb-12 pt-6">
 <div>
 <Text as="h1" variant="h3" weight="bold" className="tracking-tight text-[var(--text-primary)]">Settings</Text>
 <Text as="p" className="text-[var(--text-muted)] mt-2">Manage your profile, preferences, and account securely.</Text>
 </div>

 <div className="space-y-8">
 <section>
 <Text as="h2" variant="label" weight="bold" className="uppercase tracking-wider text-[var(--text-muted)] text-[11px] mb-4">Profile Details</Text>
 <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface-default)] divide-y divide-[var(--border-default)] overflow-hidden">
 <div className="p-5 sm:p-6 transition-colors">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="flex-1">
 <Text as="label" variant="label" weight="medium" className="block text-[var(--text-primary)]">
 Display Name
 </Text>
 <Text as="p" className="text-[13px] text-[var(--text-muted)] mt-1">
 Your name helps counselors build rapport.
 </Text>
 </div>
 <div className="sm:w-64 shrink-0">
 <Input 
 type="text" 
 value={name}
 onChange={e => setName(e.target.value)}
 placeholder="e.g. Alex"
 disabled={saving}
 className="h-10 text-sm rounded-md"
 />
 </div>
 </div>
 </div>

 <div className="p-5 sm:p-6 transition-colors">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="flex-1">
 <Text as="label" variant="label" weight="medium" className="block text-[var(--text-primary)]">
 Institution / Campus
 </Text>
 <Text as="p" className="text-[13px] text-[var(--text-muted)] mt-1">
 For campus-specific emergency protocols.
 </Text>
 </div>
 <div className="sm:w-64 shrink-0">
 <Input 
 type="text" 
 value={institution}
 onChange={e => setInstitution(e.target.value)}
 placeholder="e.g. University of Tech"
 disabled={saving}
 className="h-10 text-sm rounded-md"
 />
 </div>
 </div>
 </div>

 <div className="bg-[var(--bg-hover)] p-4 flex items-center justify-between">
 <AnimatePresence mode="wait">
 <div className="min-h-[24px]">
 {message && (
 <motion.div 
 key={message.text}
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 className={`flex items-center gap-2 text-[13px] font-medium ${
 message.type === 'success' 
 ? 'text-[var(--status-success)]' 
 : 'text-[var(--status-error)]'
 }`}
 >
 <Icon icon={message.type === 'success' ? 'tabler:circle-check' : 'tabler:alert-circle'} className="h-4 w-4" />
 {message.text}
 </motion.div>
 )}
 </div>
 </AnimatePresence>
 <Button onClick={handleSave} variant="primary" size="sm" className="rounded-md h-9 px-5 bg-[var(--surface-default)] text-[var(--text-primary)] hover:bg-[var(--bg-page)]" disabled={saving}>
 {saving ? 'Saving...' : 'Save Profile'}
 </Button>
 </div>
 </div>
 </section>

 <section>
 <Text as="h2" variant="label" weight="bold" className="uppercase tracking-wider text-[var(--text-muted)] text-[11px] mb-4">Account</Text>
 <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface-default)] overflow-hidden">
 <div className="p-5 sm:p-6 transition-colors hover:bg-[var(--bg-hover)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={handleSignOut}>
 <div>
 <Text as="p" variant="label" weight="medium" className="text-[var(--status-error)]">
 Log out of MindBridge
 </Text>
 <Text as="p" className="text-[13px] text-[var(--text-muted)] mt-1">
 End your current session safely.
 </Text>
 </div>
 <Icon icon="tabler:logout-2" className="h-5 w-5 text-[var(--status-error)]" />
 </div>
 </div>
 </section>
 </div>
 </div>
 )
}
