import { useState, useCallback, useRef } from 'react'

export interface Message {
 id: string
 role: 'user' | 'assistant'
 content: string
 isStreaming?: boolean
 suggestions?: string[]
 action?: 'book_counselor' | 'show_resources' | 'send_crisis_alert' | null
 actionContext?: string | null
}

interface ChatAction {
 type: 'book_counselor' | 'show_resources' | 'send_crisis_alert'
 context: string | null
}

interface UseChatOptions {
 sessionId: string
 initialMessages?: Message[]
 onAction?: (action: ChatAction) => void
 onCrisis?: () => void
}

export function useChat({ sessionId, initialMessages = [], onAction, onCrisis }: UseChatOptions) {
 const [messages, setMessages] = useState<Message[]>(initialMessages)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const abortControllerRef = useRef<AbortController | null>(null)

 // Generate unique message ID
 const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

 const sendMessage = useCallback(async (content: string) => {
 if (!content.trim() || isLoading) return

 setError(null)
 setIsLoading(true)

 // Add user message
 const userMessage: Message = {
 id: generateId(),
 role: 'user',
 content: content.trim(),
 }
 setMessages(prev => [...prev, userMessage])

 // Add placeholder for assistant message
 const assistantId = generateId()
 setMessages(prev => [
 ...prev,
 {
 id: assistantId,
 role: 'assistant',
 content: '',
 isStreaming: true,
 },
 ])

 // Create abort controller for this request
 abortControllerRef.current = new AbortController()

 try {
 const response = await fetch('/api/chat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ message: content, sessionId }),
 signal: abortControllerRef.current.signal,
 })

 if (!response.ok) {
 throw new Error('Failed to send message')
 }

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
 // Update the streaming message
 setMessages(prev =>
 prev.map(msg =>
 msg.id === assistantId
 ? { ...msg, content: accumulatedContent }
 : msg
 )
 )
 }

 if (data.suggestions || typeof data.action !== 'undefined' || typeof data.actionContext !== 'undefined') {
 setMessages(prev =>
 prev.map(msg =>
 msg.id === assistantId
 ? {
 ...msg,
 suggestions: data.suggestions ?? msg.suggestions,
 action: typeof data.action !== 'undefined' ? data.action : msg.action,
 actionContext: typeof data.actionContext !== 'undefined' ? data.actionContext : msg.actionContext,
 }
 : msg
 )
 )
 }

 if (data.done) {
 // Mark streaming as complete
 setMessages(prev =>
 prev.map(msg =>
 msg.id === assistantId
 ? { ...msg, isStreaming: false }
 : msg
 )
 )

 // Handle actions
 if (data.action && onAction) {
 onAction({ type: data.action, context: data.actionContext })
 }

 // Handle crisis
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
 // Request was cancelled
 setMessages(prev => prev.filter(msg => msg.id !== assistantId))
 } else {
 setError((err as Error).message)
 // Remove the placeholder message
 setMessages(prev =>
 prev.map(msg =>
 msg.id === assistantId
 ? { ...msg, content: 'Sorry, something went wrong. Please try again.', isStreaming: false }
 : msg
 )
 )
 }
 } finally {
 setIsLoading(false)
 abortControllerRef.current = null
 }
 }, [sessionId, isLoading, onAction, onCrisis])

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

// Helper to extract clean message text (remove JSON if present)
export function cleanMessageContent(content: string): string {
 if (!content) return ''

 try {
 const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/i)
 if (jsonBlockMatch?.[1]) {
 const parsed = JSON.parse(jsonBlockMatch[1])
 return parsed.message || parsed.text || content
 }

 const jsonMatch = content.match(/\{[\s\S]*\}/)
 if (jsonMatch) {
 const parsed = JSON.parse(jsonMatch[0])
 return parsed.message || parsed.text || content
 }
 } catch {
 // Not JSON, return as-is
 }

 return content
 .trim()
 .replace(/^["']|["']$/g, '')
 .replace(/\\n/g, '\n')
}
