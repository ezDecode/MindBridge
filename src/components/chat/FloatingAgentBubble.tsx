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
  { label: "Stressed", prompt: "I'm feeling stressed right now." },
  { label: 'Unwind', prompt: 'I need a break — can you help me unwind?' },
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

  const panelVariants = {
    initial: { opacity: 0, scale: 0.96, y: 12, filter: 'blur(8px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15 } },
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="agent-panel"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed bottom-24 right-6 z-[90] flex h-[540px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] glass-sanctuary shadow-2xl"
            role="dialog"
            aria-label="MindBot companion"
          >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]" />

            {/* Close button - minimalist */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={close}
              className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.02] text-text-dim border border-white/5 transition-colors hover:text-white"
            >
              <Icon icon="tabler:x" className="h-4 w-4" />
            </motion.button>

            {/* Messages */}
            <div className="flex-1 overflow-hidden pt-6 px-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 text-primary">
                    <Icon icon="tabler:sparkles" className="h-6 w-6" />
                  </div>
                  <div>
                    <Text as="h3" weight="bold" className="text-lg text-white mb-1">
                      MindBot
                    </Text>
                    <Text as="p" className="text-xs font-medium text-text-dim leading-relaxed">
                      How can I help you find calm right now?
                    </Text>
                  </div>
                </div>
              ) : (
                <ChatWindow
                  messages={messages}
                  isLoading={isLoading}
                  onSuggestionSelect={(s) => handleSend(s)}
                />
              )}
            </div>

            {/* Compact Quick chips & Actions */}
            <div className="px-4 py-3 relative z-10">
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSend(chip.prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-bold text-text-dim transition-all hover:bg-white/10 hover:text-white disabled:opacity-50 active:scale-95"
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
                  className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary/80 hover:text-primary transition-colors"
                >
                  <Icon icon="tabler:layout-maximize" className="h-3 w-3" />
                  Full View
                </button>
              </div>
            </div>

            {/* Compact Mini Input */}
            <MiniChatInput onSend={handleSend} isLoading={isLoading} onStop={stopGenerating} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive tooltip - Compact */}
      <AnimatePresence>
        {proactivePrompt && !isOpen && (
          <motion.div
            key="agent-proactive"
            initial={reduced ? false : { opacity: 0, x: 20, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 10, scale: 0.99, filter: 'blur(4px)' }}
            className="fixed bottom-24 right-6 z-[90] w-[280px] rounded-[1.5rem] glass-sanctuary p-4 shadow-2xl"
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-primary">
                <Icon icon="tabler:sparkles" className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Text as="p" className="text-xs font-bold leading-relaxed text-white/90 mb-3">
                  {proactivePrompt}
                </Text>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      open()
                      dismissProactive()
                    }}
                    className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black text-black shadow-sm transition-transform active:scale-95"
                  >
                    REPLY
                  </button>
                  <button
                    type="button"
                    onClick={dismissProactive}
                    className="rounded-lg bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold text-text-dim hover:text-white"
                  >
                    LATER
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Trigger - Compact */}
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'fixed bottom-6 right-6 z-[91] flex h-14 w-14 items-center justify-center rounded-[1.5rem] shadow-2xl transition-all duration-300',
          isOpen 
            ? 'bg-white/10 text-white backdrop-blur-xl border border-white/10' 
            : 'bg-primary text-black border-4 border-black'
        )}
      >
        <Icon icon={isOpen ? 'tabler:x' : 'tabler:robot'} className="h-7 w-7" />
        {!isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-[#0A0A0B]"></span>
          </span>
        )}
      </motion.button>
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
      className="px-4 pb-6 pt-1 relative z-10"
    >
      <div className="relative flex items-end gap-1.5 rounded-[1.25rem] bg-white/[0.02] border border-white/5 p-1 transition-all duration-300">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit(e)
            }
          }}
          placeholder="Message…"
          rows={1}
          className="no-focus-ring max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.9375rem] font-medium text-white placeholder:text-white/15"
        />
        <div className="flex h-[40px] items-center pr-0.5">
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger"
            >
              <Icon icon="tabler:player-stop-filled" className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                value.trim()
                  ? 'bg-white text-black shadow-sm active:scale-95'
                  : 'bg-white/5 text-text-dim'
              )}
            >
              <Icon icon="tabler:arrow-up" className="h-4.5 w-4.5" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
