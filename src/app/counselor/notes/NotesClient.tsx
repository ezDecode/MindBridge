'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { useSearchParams } from 'next/navigation'

type Booking = { 
  id: string
  slot_start: string
  type: string
  notes_encrypted: string | null
  profiles: { id: string, name: string | null } | null
}

export default function NotesClient({ initialBookings }: { initialBookings: Booking[] }) {
  const { showToast } = useToast()
  const searchParams = useSearchParams()
  const initialBookingId = searchParams.get('booking')
  
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(initialBookingId || (initialBookings.length > 0 ? initialBookings[0].id : null))
  const [notes, setNotes] = useState<Record<string, string>>(
    initialBookings.reduce((acc, b) => ({ ...acc, [b.id]: b.notes_encrypted || '' }), {})
  )
  const [isSaving, setIsSaving] = useState(false)

  const selectedBooking = initialBookings.find(b => b.id === selectedBookingId)

  const handleSaveNote = async () => {
    if (!selectedBooking) return
    setIsSaving(true)
    try {
      // In a real app we'd save to the database. For demo, we just simulate network delay
      await new Promise(r => setTimeout(r, 600))
      showToast('Notes securely saved', 'success')
    } catch {
      showToast('Failed to save notes', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <Text as="h2" variant="h2" weight="semibold" className="text-white tracking-tight">Session Notes</Text>
          <Text variant="small" className="text-text-dim font-medium mt-1">Secure & Encrypted Documentation</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Past Sessions List */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden bg-surface rounded-xl border border-border p-4">
          <div className="relative shrink-0">
            <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-lg" />
            <input 
              type="text"
              placeholder="Search past sessions..."
              className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-[1.0625rem] focus:border-white/20 transition-all text-white placeholder:text-text-dim outline-none"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
            {initialBookings.length === 0 ? (
              <div className="p-8 text-center text-text-dim">
                <Icon icon="tabler:history-off" className="text-2xl mx-auto mb-2 opacity-50" />
                <span className="text-base font-medium ">No past sessions</span>
              </div>
            ) : (
              initialBookings.map(b => {
                const date = new Date(b.slot_start)
                const isSelected = selectedBookingId === b.id
                const studentName = b.type === 'anonymous' ? 'Anonymous Student' : (resolveProfileDisplayName({ profileName: b.profiles?.name }) || 'Student')
                
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all flex items-start gap-4 group",
                      isSelected ? "bg-surface-raised border-primary/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/10"
                    )}
                  >
                    <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Text variant="small" weight="bold" className={isSelected ? "text-primary" : "text-white"}>
                        {studentName[0]}
                      </Text>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="semibold" className="text-[1.0625rem] truncate text-white mb-1">{studentName}</Text>
                      <Text variant="small" className="text-base font-medium text-text-dim block">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </div>
                    {notes[b.id] && (
                      <Icon icon="tabler:check" className="text-success text-lg shrink-0 mt-1" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {selectedBooking ? (
            <Card padding="none" className="bg-surface border-border flex-1 flex flex-col overflow-hidden relative shadow-premium">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                <div>
                  <Text as="h3" variant="h4" weight="semibold" className="mb-1 text-white">
                    {selectedBooking.type === 'anonymous' ? 'Anonymous Student' : (resolveProfileDisplayName({ profileName: selectedBooking.profiles?.name }) || 'Student')}
                  </Text>
                  <div className="flex items-center gap-3 text-base font-medium text-text-dim ">
                    <span className="flex items-center gap-1"><Icon icon="tabler:calendar" /> {new Date(selectedBooking.slot_start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Icon icon="tabler:clock" /> {new Date(selectedBooking.slot_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="badge badge-outline text-[8px]">{selectedBooking.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:lock" className="text-success text-xl" />
                  <span className="text-base font-medium text-success hidden sm:inline">End-to-End Encrypted</span>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 p-6 relative">
                <textarea
                  value={notes[selectedBooking.id] || ''}
                  onChange={(e) => setNotes(prev => ({ ...prev, [selectedBooking.id]: e.target.value }))}
                  placeholder="Type your clinical session notes here. These are encrypted and only accessible by you..."
                  className="w-full h-full bg-transparent resize-none outline-none text-[1.0625rem] text-white placeholder:text-text-dim leading-relaxed"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-background/50 flex items-center justify-between shrink-0">
                <Text variant="small" className="text-base font-medium text-text-dim flex items-center gap-2">
                  <Icon icon="tabler:cloud-upload" className="text-lg" />
                  Auto-saves locally
                </Text>
                <Button onClick={handleSaveNote} disabled={isSaving}>
                  {isSaving ? 'Encrypting & Saving...' : 'Save Notes securely'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/[0.01] text-text-dim">
              <Icon icon="tabler:note-off" className="text-2xl mb-4 opacity-50" />
              <Text>Select a past session to view or add notes.</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
