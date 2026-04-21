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
// Tuned for consistent, warm, empathetic responses
export const DEFAULT_CHAT_PARAMS = {
 model: NIM_MODEL,
 temperature: 0.45,
 max_tokens: 600,
 top_p: 0.85,
 frequency_penalty: 0.2,
 presence_penalty: 0.1,
}

// For memory summarization (faster, more focused)
export const MEMORY_PARAMS = {
 model: NIM_MODEL,
 temperature: 0.3,
 max_tokens: 300,
 top_p: 0.8,
}

// For proactive message generation
export const PROACTIVE_PARAMS = {
 model: NIM_MODEL,
 temperature: 0.5,
 max_tokens: 100,
 top_p: 0.85,
}

// For generating contextual follow-up suggestions
export const SUGGESTION_PARAMS = {
 model: NIM_MODEL,
 temperature: 0.6,
 max_tokens: 100,
 top_p: 0.9,
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

// Clinical words that should never appear in responses
const CLINICAL_FORBIDDEN_WORDS = [
 'depression', 'anxiety disorder', 'major depressive', 'gad',
 'symptom', 'diagnosis', 'dsm', 'criteria', 'mental illness',
 'patient', 'therapy session', 'clinical', 'psychiatric',
 'prescribe', 'medication', 'disorder', 'pathology',
]

// Warm replacements for clinical words
const CLINICAL_REPLACEMENTS: Record<string, string> = {
 depression: 'rough patch',
 'anxiety disorder': 'mind being loud',
 'major depressive': 'hard time',
 gad: 'nervousness',
 symptom: 'sign',
 diagnosis: 'where you are',
 dsm: '',
 criteria: 'things to notice',
 'mental illness': 'hard time',
 patient: 'person',
 'therapy session': 'talk',
 clinical: '',
 psychiatric: '',
 prescribe: '',
 medication: '',
 disorder: 'hard time',
 pathology: 'struggle',
}

function sanitizeClinicalLanguage(text: string): string {
 let sanitized = text.toLowerCase()
 
 for (const [forbidden, replacement] of Object.entries(CLINICAL_REPLACEMENTS)) {
 if (replacement) {
 const regex = new RegExp(`\\b${forbidden}\\b`, 'gi')
 sanitized = sanitized.replace(regex, replacement)
 } else {
 const regex = new RegExp(`\\b${forbidden}\\b`, 'gi')
 sanitized = sanitized.replace(regex, '')
 }
 }
 
 return sanitized
}

function ensureWarmTone(message: string): string {
 let processed = message
 
 const coldPhrases = [
 { pattern: /^I'm a/i, replacement: "I'm" },
 { pattern: /^I am a /i, replacement: "I'm " },
 { pattern: /As an AI/i, replacement: '' },
 { pattern: /I cannot/i, replacement: "I can't" },
 { pattern: /I will not/i, replacement: "I won't" },
 ]
 
 for (const { pattern, replacement } of coldPhrases) {
 processed = processed.replace(pattern, replacement)
 }
 
 return processed.trim()
}

// Parse JSON response safely, with fallback and sanitization
export function parseCompanionResponse(text: string): CompanionResponse | null {
 try {
 // Try JSON code block first
 const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i)
 if (jsonBlockMatch?.[1]) {
 return parseAndSanitize(jsonBlockMatch[1])
 }

 // Try to find JSON in the response
 const jsonMatch = text.match(/\{[\s\S]*\}/)
 if (jsonMatch) {
 return parseAndSanitize(jsonMatch[0])
 }
 
 // If no JSON found, try to extract just the message
 return extractMessageFallback(text)
 } catch {
 return null
 }
}

function parseAndSanitize(jsonString: string): CompanionResponse | null {
 try {
 const parsed = JSON.parse(jsonString)
 
 // Sanitize the message
 if (parsed.message) {
 parsed.message = ensureWarmTone(sanitizeClinicalLanguage(parsed.message))
 }
 
 // Ensure required fields exist
 return {
 message: parsed.message ?? '',
 crisis: parsed.crisis ?? false,
 assessment_update: parsed.assessment_update ?? { criteria_flagged: [], severity: 'none' },
 suggested_action: parsed.suggested_action ?? null,
 action_context: parsed.action_context ?? null,
 suggestions: parsed.suggestions ?? [],
 }
 } catch {
 return null
 }
}

function extractMessageFallback(text: string): CompanionResponse {
 // Clean up the text for use as a direct message
 const cleaned = text
 .replace(/```[\s\S]*?```/g, '')
 .replace(/\n+/g, ' ')
 .trim()
 
 return {
 message: ensureWarmTone(sanitizeClinicalLanguage(cleaned)),
 crisis: false,
 assessment_update: { criteria_flagged: [], severity: 'none' },
 suggested_action: null,
 action_context: null,
 suggestions: [],
 }
}
