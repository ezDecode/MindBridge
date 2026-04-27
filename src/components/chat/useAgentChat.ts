import { useState, useCallback, useRef } from 'react'
import type { Message } from '@/hooks/useChat'

interface ChatAction {
  type: 'book_counselor' | 'show_resources' | 'send_crisis_alert'
  context: string | null
}

interface ClientContext {
  currentPage: string
  idleSeconds: number
}

interface UseAgentChatOptions {
  sessionId: string
  initialMessages?: Message[]
  getClientContext: () => ClientContext
  onAction?: (action: ChatAction) => void
  onCrisis?: () => void
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

function sanitizePage(page: string): string {
  return String(page).slice(0, 200).replace(/[^\x20-\x7E]/g, '')
}

/**
 * Mirrors `useChat` but additionally sends a `clientContext` field with each
 * request so the agent backend (Phase 2) can react to page/idle state.
 * Streaming/parsing logic is intentionally identical to `useChat`.
 */
export function useAgentChat({
  sessionId,
  initialMessages = [],
  getClientContext,
  onAction,
  onCrisis,
}: UseAgentChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
      }
      setMessages((prev) => [...prev, userMessage])

      const assistantId = generateId()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ])

      abortControllerRef.current = new AbortController()

      try {
        const ctx = getClientContext()
        const clientContext = {
          currentPage: sanitizePage(ctx.currentPage),
          idleSeconds: Math.max(0, Math.floor(ctx.idleSeconds)),
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, sessionId, clientContext }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) throw new Error('Failed to send message')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.text) {
                  accumulatedContent += data.text
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId ? { ...msg, content: accumulatedContent } : msg,
                    ),
                  )
                }

                if (
                  data.suggestions ||
                  typeof data.action !== 'undefined' ||
                  typeof data.actionContext !== 'undefined' ||
                  data.bookingSlots ||
                  typeof data.crisis !== 'undefined'
                ) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId
                        ? {
                            ...msg,
                            suggestions: data.suggestions ?? msg.suggestions,
                            action:
                              typeof data.action !== 'undefined' ? data.action : msg.action,
                            actionContext:
                              typeof data.actionContext !== 'undefined'
                                ? data.actionContext
                                : msg.actionContext,
                            bookingSlots: data.bookingSlots ?? msg.bookingSlots,
                            crisis: typeof data.crisis !== 'undefined' ? data.crisis : msg.crisis,
                          }
                        : msg,
                    ),
                  )
                }

                if (data.done) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId ? { ...msg, isStreaming: false } : msg,
                    ),
                  )

                  if (data.action && onAction) {
                    onAction({ type: data.action, context: data.actionContext })
                  }

                  if (data.crisis && onCrisis) {
                    onCrisis()
                  }
                }

                if (data.error) {
                  setError(data.error)
                }
              } catch {
                // Ignore JSON parse errors for partial data
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantId))
        } else {
          setError((err as Error).message)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: 'Sorry, something went wrong. Please try again.',
                    isStreaming: false,
                  }
                : msg,
            ),
          )
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [sessionId, isLoading, getClientContext, onAction, onCrisis],
  )

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    stopGenerating,
    clearMessages,
    setMessages,
  }
}
