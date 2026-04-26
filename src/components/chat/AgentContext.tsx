'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

interface AgentState {
  isOpen: boolean
  currentPage: string
  idleSeconds: number
  sessionId: string
  proactivePrompt: string | null
}

interface AgentContextValue extends AgentState {
  open: () => void
  close: () => void
  toggle: () => void
  dismissProactive: () => void
  triggerProactive: (prompt: string) => void
}

const AgentCtx = createContext<AgentContextValue | null>(null)

const MOOD_PROMPT_KEY = 'mb_last_mood_prompt'
const MOOD_PROMPT_INTERVAL_MS = 12 * 60 * 60 * 1000 // 12 hours

function generateSessionId() {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [idleSeconds, setIdleSeconds] = useState(0)
  const [proactivePrompt, setProactivePrompt] = useState<string | null>(null)
  const [sessionId] = useState(() => generateSessionId())

  const currentPage = pathname ?? ''

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  const dismissProactive = useCallback(() => setProactivePrompt(null), [])
  const triggerProactive = useCallback((prompt: string) => setProactivePrompt(prompt), [])

  // Idle tracking
  useEffect(() => {
    const reset = () => setIdleSeconds(0)
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach((evt) => window.addEventListener(evt, reset, { passive: true }))
    const interval = window.setInterval(() => {
      setIdleSeconds((s) => s + 1)
    }, 1000)
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, reset))
      window.clearInterval(interval)
    }
  }, [])

  // Daily mood-check trigger
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const last = window.localStorage.getItem(MOOD_PROMPT_KEY)
        const lastTs = last ? parseInt(last, 10) : 0
        if (!lastTs || Date.now() - lastTs > MOOD_PROMPT_INTERVAL_MS) {
          triggerProactive('Quick check-in — how are you feeling today?')
          window.localStorage.setItem(MOOD_PROMPT_KEY, String(Date.now()))
        }
      } catch {
        // ignore localStorage failures
      }
    })
  }, [triggerProactive])

  // Yield focus to PanicModal
  useEffect(() => {
    const onPanic = () => {
      setProactivePrompt(null)
      setIsOpen(false)
    }
    window.addEventListener('open-panic', onPanic)
    return () => window.removeEventListener('open-panic', onPanic)
  }, [])

  const value = useMemo<AgentContextValue>(
    () => ({
      isOpen,
      currentPage,
      idleSeconds,
      sessionId,
      proactivePrompt,
      open,
      close,
      toggle,
      dismissProactive,
      triggerProactive,
    }),
    [isOpen, currentPage, idleSeconds, sessionId, proactivePrompt, open, close, toggle, dismissProactive, triggerProactive],
  )

  return <AgentCtx.Provider value={value}>{children}</AgentCtx.Provider>
}

export function useAgent(): AgentContextValue {
  const ctx = useContext(AgentCtx)
  if (!ctx) throw new Error('useAgent must be used within an AgentProvider')
  return ctx
}
