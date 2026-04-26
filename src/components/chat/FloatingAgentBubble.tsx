'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'

import { cn } from '@/lib/utils'
import { Text } from '@/components/ui'
import { getCurrentDemoUser } from '@/lib/auth/demo-session'
import { useAgent } from './AgentContext'
import { useAgentChat } from './useAgentChat'
import { ChatWindow } from './ChatWindow'

const QUICK_CHIPS = [
  { label: "I'm stressed", prompt: "I'm feeling stressed right now." },
  { label: 'Need a break', prompt: 'I need a break — can you help me unwind?' },
]

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    queueMicrotask(() => setReduced(mq.matches))
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])
  return reduced
}

export function FloatingAgentBubble() {
  const pathname = usePathname()
  const router = useRouter()
  const reduced = usePrefersReducedMotion()
  const {
    isOpen,
    open,
    close,
    toggle,
    sessionId,
    currentPage,
    idleSeconds,
    proactivePrompt,
    dismissProactive,
  } = useAgent()

  // Render guards
  const [isStudent, setIsStudent] = useState(false)
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setIsStudent(getCurrentDemoUser().role === 'student')
      } catch {
        setIsStudent(false)
      }
    })
  }, [pathname])

  // Live ref for context (avoids re-creating sendMessage on every tick)
  const ctxRef = useRef({ currentPage, idleSeconds })
  useEffect(() => {
    ctxRef.current = { currentPage, idleSeconds }
  }, [currentPage, idleSeconds])

  const { messages, sendMessage, isLoading, stopGenerating } = useAgentChat({
    sessionId,
    getClientContext: () => ctxRef.current,
  })

  const onRoute = useMemo(() => {
    if (!pathname) return false
    return pathname.startsWith('/student') && pathname !== '/student/chat'
  }, [pathname])

  if (!isStudent || !onRoute) return null

  const handleSend = (text: string) => {
    if (!text.trim()) return
    if (!isOpen) open()
    dismissProactive()
    sendMessage(text)
  }

  const motionProps = reduced
    ? { initial: false, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, scale: 0.9, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 8 },
        transition: { type: 'spring' as const, stiffness: 320, damping: 28 },
      }

  return (
    <>
      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="agent-panel"
            {...motionProps}
            className="fixed bottom-28 right-7 z-[90] flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
            role="dialog"
            aria-label="MindBot companion"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                  <Icon icon="tabler:robot" className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <Text as="div" weight="semibold" className="text-[0.95rem] text-white">
                    MindBot
                  </Text>
                  <Text as="div" className="text-xs text-text-dim">
                    here for you
                  </Text>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close MindBot"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon icon="tabler:x" className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden px-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Icon icon="tabler:sparkles" className="h-5 w-5" />
                  </div>
                  <Text as="p" className="text-sm text-text-dim">
                    Hi — I&apos;m MindBot. Tell me what&apos;s on your mind, or pick a quick option below.
                  </Text>
                </div>
              ) : (
                <ChatWindow
                  messages={messages}
                  isLoading={isLoading}
                  onSuggestionSelect={(s) => handleSend(s)}
                />
              )}
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 px-3 py-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSend(chip.prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-dim transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  close()
                  router.push('/student/chat')
                }}
                className="ml-auto flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Icon icon="tabler:arrow-up-right" className="h-3 w-3" />
                Open full chat
              </button>
            </div>

            {/* Input */}
            <MiniChatInput onSend={handleSend} isLoading={isLoading} onStop={stopGenerating} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive tooltip */}
      <AnimatePresence>
        {proactivePrompt && !isOpen && (
          <motion.div
            key="agent-proactive"
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-28 right-7 z-[90] w-[260px] rounded-lg border border-border bg-surface p-3 shadow-2xl"
            role="status"
          >
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                <Icon icon="tabler:sparkles" className="h-3.5 w-3.5" />
              </div>
              <Text as="p" className="flex-1 text-sm leading-snug text-white">
                {proactivePrompt}
              </Text>
              <button
                type="button"
                onClick={dismissProactive}
                aria-label="Dismiss"
                className="flex h-6 w-6 items-center justify-center rounded text-text-dim transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon icon="tabler:x" className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  open()
                  dismissProactive()
                }}
                className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-primary/90"
              >
                Reply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? 'Close MindBot' : 'Open MindBot'}
        aria-expanded={isOpen}
        className={cn(
          'fixed bottom-7 right-24 z-[91] flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary shadow-2xl backdrop-blur transition-colors hover:bg-primary/25',
        )}
      >
        <Icon icon={isOpen ? 'tabler:x' : 'tabler:robot'} className="h-6 w-6" />
        {!isOpen && (
          <span
            className={cn(
              'absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary',
              !reduced && 'animate-pulse',
            )}
            aria-hidden
          />
        )}
      </button>
    </>
  )
}

function MiniChatInput({
  onSend,
  isLoading,
  onStop,
}: {
  onSend: (text: string) => void
  isLoading: boolean
  onStop: () => void
}) {
  const [value, setValue] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || isLoading) return
    onSend(text)
    setValue('')
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border-t border-white/5 bg-surface px-3 py-2.5"
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit(e)
          }
        }}
        placeholder="Message MindBot…"
        rows={1}
        className="no-focus-ring max-h-28 min-h-[36px] flex-1 resize-none rounded-md bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-text-dim focus:outline-none"
        aria-label="Message MindBot"
      />
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-danger/20 bg-danger/10 text-danger transition-colors hover:bg-danger/20"
        >
          <Icon icon="tabler:player-stop-filled" className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Send"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
            value.trim()
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-white/5 text-text-dim',
          )}
        >
          <Icon icon="tabler:arrow-up" className="h-4 w-4" strokeWidth={3} />
        </button>
      )}
    </form>
  )
}