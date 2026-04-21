'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'
import { Button, Text, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

interface SettingsModalProps {
 open: boolean
 onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
 const [name, setName] = useState('')
 const [institution, setInstitution] = useState('')
 const [email, setEmail] = useState('')

 const supabase = useMemo(() => createClient(), [])

 const fetchProfile = useCallback(async () => {
 setLoading(true)
 const { data: { user } } = await supabase.auth.getUser()
 if (user) {
 setEmail(user.email || '')
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
 if (open) fetchProfile()
 }, [open, fetchProfile])

 // Lock body scroll when open
 useEffect(() => {
 if (open) {
 document.body.style.overflow = 'hidden'
 } else {
 document.body.style.overflow = ''
 }
 return () => { document.body.style.overflow = '' }
 }, [open])

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
 setTimeout(() => setMessage(null), 3000)
 }
 } catch (err: unknown) {
 const errorMessage = err instanceof Error ? err.message : 'Failed to save settings.'
 setMessage({ text: errorMessage, type: 'error' })
 } finally {
 setSaving(false)
 }
 }

 const handleSignOut = async () => {
 await supabase.auth.signOut()
 window.location.href = '/login'
 }

 return (
 <AnimatePresence>
 {open && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
 onClick={onClose}
 />

 {/* Panel */}
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
 className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl"
 >
 {/* Header */}
 <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-5">
  <div className="flex items-center gap-3">
  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-strong)]">
   <Icon icon="tabler:settings" className="h-5 w-5 text-[var(--text-secondary)]" />
  </div>
  <div>
   <Text as="h2" variant="body" weight="bold" className="text-[var(--text-primary)]">Settings</Text>
   <Text as="p" variant="small" className="text-[var(--text-muted)]">Manage your account</Text>
  </div>
  </div>
  <button
  type="button"
  onClick={onClose}
  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]"
  >
  <Icon icon="tabler:x" className="h-5 w-5" />
  </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto">
  {loading ? (
  <div className="flex items-center justify-center py-20">
   <Icon icon="tabler:loader" className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
  </div>
  ) : (
  <form onSubmit={handleSave} className="flex flex-col gap-0">
   {/* Profile Section */}
   <div className="px-6 pt-6 pb-2">
   <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
    Profile
   </Text>
   </div>

   <div className="space-y-1 px-6">
   {/* Display Name */}
   <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-colors hover:border-[var(--border-strong)]">
    <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--action-primary-light)] text-[var(--action-primary)]">
     <Icon icon="tabler:user" className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
     <Text as="label" variant="small" weight="bold" className="block text-[var(--text-primary)]">
     Display Name
     </Text>
     <input
     type="text"
     value={name}
     onChange={(e) => setName(e.target.value)}
     placeholder="e.g. Alex"
     disabled={saving}
     className="no-focus-ring mt-1 w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
     />
    </div>
    </div>
   </div>

   {/* Institution */}
   <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-colors hover:border-[var(--border-strong)]">
    <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--action-primary-light)] text-[var(--action-primary)]">
     <Icon icon="tabler:building" className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
     <Text as="label" variant="small" weight="bold" className="block text-[var(--text-primary)]">
     Institution / Campus
     </Text>
     <input
     type="text"
     value={institution}
     onChange={(e) => setInstitution(e.target.value)}
     placeholder="e.g. University of Tech"
     disabled={saving}
     className="no-focus-ring mt-1 w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
     />
    </div>
    </div>
   </div>

   {/* Email (read only) */}
   <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 opacity-70">
    <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-strong)] text-[var(--text-muted)]">
     <Icon icon="tabler:mail" className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
     <Text as="p" variant="small" weight="bold" className="text-[var(--text-secondary)]">
     Email
     </Text>
     <Text as="p" variant="small" className="mt-0.5 text-[var(--text-muted)] truncate">
     {email || 'Not available'}
     </Text>
    </div>
    <span className="shrink-0 rounded-md bg-[var(--surface-strong)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
     Read only
    </span>
    </div>
   </div>
   </div>

   {/* Save button + status */}
   <div className="px-6 pt-4">
   <div className="flex items-center justify-between gap-3">
    <AnimatePresence mode="wait">
    {message && (
     <motion.div
     key={message.text}
     initial={{ opacity: 0, y: 4 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -4 }}
     className={`flex items-center gap-1.5 text-[13px] font-medium ${
      message.type === 'success' ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
     }`}
     >
     <Icon icon={message.type === 'success' ? 'tabler:circle-check' : 'tabler:alert-circle'} className="h-4 w-4" />
     {message.text}
     </motion.div>
    )}
    </AnimatePresence>
    <Button
    type="submit"
    variant="primary"
    size="sm"
    disabled={saving}
    className="ml-auto shrink-0 rounded-xl px-5"
    >
    {saving ? (
     <><Icon icon="tabler:loader" className="h-4 w-4 animate-spin" /> Saving...</>
    ) : (
     'Save changes'
    )}
    </Button>
   </div>
   </div>

   {/* Account Section */}
   <div className="px-6 pt-8 pb-2">
   <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
    Account
   </Text>
   </div>

   <div className="px-6 pb-6">
   <button
    type="button"
    onClick={handleSignOut}
    className="group flex w-full items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-all duration-200 hover:border-[var(--status-error)]/30 hover:bg-[var(--status-error)]/5"
   >
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-error)]/10 text-[var(--status-error)]">
    <Icon icon="tabler:logout-2" className="h-4 w-4" />
    </div>
    <div className="text-left">
    <Text as="p" variant="small" weight="bold" className="text-[var(--status-error)]">
     Log out
    </Text>
    <Text as="p" variant="small" className="text-[var(--text-muted)]">
     End your current session safely.
    </Text>
    </div>
    <Icon icon="tabler:chevron-right" className="ml-auto h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
   </button>
   </div>
  </form>
  )}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 )
}
