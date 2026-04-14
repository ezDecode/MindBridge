import OpenAI from 'openai'

// NVIDIA NIM client - 100% OpenAI SDK compatible
// Uses meta/llama-3.1-8b-instruct for fast, capable mental health conversations
// Lazy initialization to prevent build-time errors
let _nim: OpenAI | null = null

export function getNimClient(): OpenAI {
  if (!_nim) {
    if (!process.env.NVIDIA_NIM_API_KEY) {
      throw new Error('NVIDIA_NIM_API_KEY environment variable is required')
    }
    _nim = new OpenAI({
      apiKey: process.env.NVIDIA_NIM_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    })
  }
  return _nim
}

// Backwards compatibility export
export const nim = {
  get chat() {
    return getNimClient().chat
  },
}

// Model configuration
export const NIM_MODEL = 'meta/llama-3.1-8b-instruct'

// Default parameters for mental health conversations
export const DEFAULT_CHAT_PARAMS = {
  model: NIM_MODEL,
  temperature: 0.7,
  max_tokens: 500,
  top_p: 0.9,
}

// For memory summarization (faster, more focused)
export const MEMORY_PARAMS = {
  model: NIM_MODEL,
  temperature: 0.3,
  max_tokens: 300,
}

// For proactive message generation
export const PROACTIVE_PARAMS = {
  model: NIM_MODEL,
  temperature: 0.6,
  max_tokens: 80,
}

// Helper types for structured responses
export interface CompanionResponse {
  message: string
  crisis: boolean
  assessment_update: {
    criteria_flagged: string[]
    severity: 'none' | 'mild' | 'moderate' | 'severe'
  }
  suggested_action: 'book_counselor' | 'show_resources' | 'send_crisis_alert' | null
  action_context: string | null
  suggestions?: string[]
}

export interface MemoryContext {
  summary: string
  emotionalTrend: string
  keyThemes: string[]
  concerns: string[]
  communicationStyle: string
}

// Parse JSON response safely, with fallback
export function parseCompanionResponse(text: string): CompanionResponse | null {
  try {
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i)
    if (jsonBlockMatch?.[1]) {
      return JSON.parse(jsonBlockMatch[1])
    }

    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch {
    return null
  }
}
