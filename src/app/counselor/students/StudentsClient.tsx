'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Card, Text, Button } from '@/components/ui'
import { Sheet } from '@/components/ui/Sheet'
import { cn } from '@/lib/utils'
import { resolveProfileDisplayName } from '@/lib/profile-name'
import { useToast } from '@/components/ui/Toast'

type Student = { id: string, name: string | null, institution: string | null }
type CrisisLog = { id: string, student_id: string, severity: string | null, triggered_at: string | null, acknowledged: boolean | null }
type MoodLog = { id: string, user_id: string, score: number, logged_at: string | null, note: string | null }

export default function StudentsClient({ 
  initialStudents, 
  initialCrisisLogs,
  initialMoodLogs
}: { 
  initialStudents: Student[], 
  initialCrisisLogs: CrisisLog[],
  initialMoodLogs: MoodLog[]
}) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const filteredStudents = initialStudents.filter(s => {
    const name = resolveProfileDisplayName({ profileName: s.name }) || 'Unknown Student'
    return name.toLowerCase().includes(search.toLowerCase()) || 
           s.id.toLowerCase().includes(search.toLowerCase())
  })

  const openStudentDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsSheetOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Text variant="h2" className="tracking-tight">Student Management</Text>
          <Text variant="small" color="muted" weight="medium" className="mt-1">Monitor assigned students & alerts</Text>
        </div>
        <div className="relative w-full md:w-72">
          <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-lg" />
          <input 
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[14px] focus:border-white/20 transition-all text-white placeholder:text-text-dim outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const studentCrises = initialCrisisLogs.filter(c => c.student_id === student.id)
          const studentMoods = initialMoodLogs.filter(m => m.user_id === student.id)
          const lastMood = studentMoods.length > 0 ? studentMoods[0] : null
          const hasActiveCrisis = studentCrises.length > 0

          return (
            <Card 
              key={student.id} 
              padding="lg" 
              className={cn(
                "group hover:border-white/20 transition-all cursor-pointer relative overflow-hidden flex flex-col",
                hasActiveCrisis ? "border-danger/30 bg-danger/[0.02]" : "bg-surface"
              )}
              onClick={() => openStudentDetails(student)}
            >
              {hasActiveCrisis && (
                <div className="absolute top-0 left-0 w-full h-1 bg-danger shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              )}
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "size-12 rounded-full flex items-center justify-center font-bold text-lg border",
                    hasActiveCrisis ? "bg-danger/20 text-danger border-danger/30" : "bg-white/5 text-white border-white/10"
                  )}>
                    {(resolveProfileDisplayName({ profileName: student.name }) || 'U')[0]}
                  </div>
                  <div>
                    <Text weight="semibold" className="mb-0.5">{resolveProfileDisplayName({ profileName: student.name }) || 'Unknown Student'}</Text>
                    <Text variant="caption" color="muted" className="font-mono">ID: {student.id.split('-')[0]}</Text>
                  </div>
                </div>
                {hasActiveCrisis && (
                  <span className="flex items-center justify-center size-8 rounded-full bg-danger/10 text-danger animate-pulse">
                    <Icon icon="tabler:alert-triangle-filled" className="text-xl" />
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto border-t border-white/5 pt-4">
                <div>
                  <Text variant="caption" color="muted" weight="medium" className="mb-1">Latest Mood</Text>
                  <div className="flex items-center gap-2">
                    {lastMood ? (
                      <>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          lastMood.score >= 4 ? "bg-success" : lastMood.score === 3 ? "bg-warning" : "bg-danger"
                        )} />
                        <Text variant="subtitle" weight="semibold" className="tabular-nums">{lastMood.score}/5</Text>
                      </>
                    ) : (
                      <Text variant="small" color="muted" className="italic">No logs</Text>
                    )}
                  </div>
                </div>
                <div>
                  <Text variant="caption" color="muted" weight="medium" className="mb-1">Status</Text>
                  {hasActiveCrisis ? (
                    <Text variant="subtitle" weight="semibold" color="danger">Requires Attention</Text>
                  ) : (
                    <Text variant="subtitle" weight="semibold" color="secondary">Stable</Text>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-text-dim border border-dashed border-white/5 rounded-xl">
            <Icon icon="tabler:users-slash" className="text-2xl mb-4 opacity-50" />
            <Text variant="small" weight="medium">No students found matching your criteria.</Text>
          </div>
        )}
      </div>

      <Sheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title="Student Profile"
        side="right"
      >
        {selectedStudent && (() => {
          const studentCrises = initialCrisisLogs.filter(c => c.student_id === selectedStudent.id)
          const studentMoods = initialMoodLogs.filter(m => m.user_id === selectedStudent.id)
          
          return (
            <div className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                  {(resolveProfileDisplayName({ profileName: selectedStudent.name }) || 'U')[0]}
                </div>
                <div>
                  <Text variant="h3" className="mb-1">{resolveProfileDisplayName({ profileName: selectedStudent.name }) || 'Unknown Student'}</Text>
                  <Text color="secondary" weight="medium">{selectedStudent.institution || 'Computer Science'}</Text>
                  <div className="flex gap-2 mt-3">
                    <span className="badge badge-outline">ID: {selectedStudent.id.split('-')[0]}</span>
                    <span className="badge badge-outline">Enrolled 2024</span>
                  </div>
                </div>
              </div>

              {studentCrises.length > 0 && (
                <div className="p-6 rounded-lg bg-danger/10 border border-danger/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-danger" />
                  <div className="flex items-center gap-3 mb-4">
                    <Icon icon="tabler:alert-triangle" className="text-danger text-xl" />
                    <Text variant="subtitle" weight="semibold" color="danger">Active Crisis Alerts</Text>
                  </div>
                  <div className="space-y-3">
                    {studentCrises.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-danger/5 p-3 rounded">
                        <div>
                          <Text variant="small" weight="medium" color="danger">{c.severity} Severity</Text>
                          <Text variant="caption" className="mt-1 block">{c.triggered_at ? new Date(c.triggered_at).toLocaleString() : 'N/A'}</Text>
                        </div>
                        <Button size="sm" className="bg-danger text-white hover:bg-danger-hover border-none">Acknowledge</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-6">
                  <Text variant="h4">Recent Mood Trends</Text>
                  <Button size="sm" className="bg-white/5 hover:bg-white/10 border-white/10 text-text-muted">View Full History</Button>
                </div>
                {studentMoods.length > 0 ? (
                  <div className="space-y-3">
                    {studentMoods.slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className={cn(
                          "size-8 rounded flex items-center justify-center text-[14px] font-bold shrink-0",
                          m.score >= 4 ? "bg-success/20 text-success" : m.score === 3 ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger"
                        )}>
                          {m.score}
                        </div>
                        <div>
                          <Text variant="caption" color="muted" weight="medium" className="tabular-nums">{m.logged_at ? new Date(m.logged_at).toLocaleString() : 'N/A'}</Text>
                          {m.note ? (
                            <Text variant="subtitle" className="mt-1 italic opacity-80">&ldquo;{m.note}&rdquo;</Text>
                          ) : (
                            <Text variant="subtitle" color="muted" className="mt-1 opacity-50">No notes provided.</Text>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                    <Text variant="subtitle" color="muted" className="italic opacity-60">No mood logs recorded yet.</Text>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <Button size="lg" className="flex-1 bg-surface-raised border-border text-white hover:bg-surface-hover w-full" onClick={() => {
                  // Link to booking or just keep as is
                  showToast("Use the booking tool to schedule a session", "info")
                }}>Schedule Session</Button>
              </div>
            </div>
          )
        })()}
      </Sheet>
    </div>
  )
}
