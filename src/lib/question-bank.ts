import QUESTION_BANK_DATA from './question-bank-data.json'

export interface QuestionBankFlag {
  safety: boolean
  recommended_action: string
}

export interface QuestionBankQuestion {
  id: number
  category: string
  question: string
  options: string[]
  answer: number[]
  source: string
  flags: QuestionBankFlag
}

interface QuestionBankDocument {
  executive_summary: string
  source_summary: Array<{
    instrument: string
    source: string
    items: number
  }>
  questions: QuestionBankQuestion[]
  notes?: string
}

export interface SessionQuestionOption {
  label: string
  value: number
}

export interface SessionQuestion {
  id: number
  category: string
  question: string
  source: string
  flags: QuestionBankFlag
  options: SessionQuestionOption[]
}

export interface QuestionResponseInput {
  questionId: number
  value: number
}

export interface QuestionInsight {
  category: string
  label: string
  intensity: 'low' | 'medium' | 'high'
  score: number
}

export interface QuestionSummary {
  severity: 'none' | 'mild' | 'moderate' | 'severe'
  moodLabel: string
  tone: string
  balanceScore: number
  distressScore: number
  derivedMoodScore: number
  criteriaFlagged: string[]
  topInsights: QuestionInsight[]
  hasSafetyConcern: boolean
  answeredCount: number
  nextSteps: string[]
}

const SESSION_COUNT = 8

const CORE_CATEGORIES = ['wellbeing', 'stress', 'anxiety', 'depression'] as const
const OPTIONAL_CATEGORIES = [
  'sleep',
  'energy',
  'appetite',
  'concentration',
  'irritability',
  'social_functioning',
  'coping',
  'other',
  'substance_use',
  'suicidal_risk',
] as const

const CATEGORY_LABELS: Record<string, string> = {
  anxiety: 'Anxiety',
  appetite: 'Appetite',
  concentration: 'Focus',
  coping: 'Coping',
  depression: 'Mood',
  energy: 'Energy',
  irritability: 'Irritability',
  other: 'Mood shifts',
  sleep: 'Sleep',
  social_functioning: 'Connection',
  stress: 'Stress',
  substance_use: 'Alcohol use',
  suicidal_risk: 'Safety',
  wellbeing: 'Wellbeing',
}

const REVERSE_DISTRESS_IDS = new Set([73, 74, 76, 77])

const cachedQuestionBank = QUESTION_BANK_DATA as unknown as QuestionBankDocument

function shuffle<T>(items: T[]) {
  const cloned = [...items]

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]]
  }

  return cloned
}

function normalizeResponse(question: QuestionBankQuestion, value: number) {
  const max = Math.max(...question.answer)
  if (max <= 0) return 0

  const raw = value / max

  if (question.category === 'wellbeing' || REVERSE_DISTRESS_IDS.has(question.id)) {
    return 1 - raw
  }

  return raw
}

function scoreToIntensity(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.7) return 'high'
  if (score >= 0.45) return 'medium'
  return 'low'
}

function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category.replaceAll('_', ' ')
}

export async function getQuestionBank() {
  return cachedQuestionBank
}

export async function getQuestionSession(count = SESSION_COUNT) {
  const bank = await getQuestionBank()
  const questionsByCategory = new Map<string, QuestionBankQuestion[]>()

  for (const question of bank.questions) {
    const collection = questionsByCategory.get(question.category) ?? []
    collection.push(question)
    questionsByCategory.set(question.category, collection)
  }

  const selected = new Map<number, QuestionBankQuestion>()

  for (const category of shuffle([...CORE_CATEGORIES])) {
    const pool = shuffle(questionsByCategory.get(category) ?? [])
    const picked = pool.find((candidate) => !selected.has(candidate.id))
    if (picked) selected.set(picked.id, picked)
  }

  for (const category of shuffle([...OPTIONAL_CATEGORIES])) {
    if (selected.size >= count) break

    const pool = shuffle(questionsByCategory.get(category) ?? [])
    const picked = pool.find((candidate) => !selected.has(candidate.id))
    if (picked) selected.set(picked.id, picked)
  }

  if (selected.size < count) {
    for (const question of shuffle(bank.questions)) {
      if (selected.size >= count) break
      if (!selected.has(question.id)) selected.set(question.id, question)
    }
  }

  const sessionQuestions: SessionQuestion[] = shuffle([...selected.values()]).map((question) => ({
    id: question.id,
    category: question.category,
    question: question.question,
    source: question.source,
    flags: question.flags,
    options: question.options.map((label, index) => ({
      label,
      value: question.answer[index] ?? index,
    })),
  }))

  return {
    estimatedMinutes: Math.max(2, Math.ceil(sessionQuestions.length / 3)),
    questions: sessionQuestions,
  }
}

export async function analyzeQuestionResponses(responses: QuestionResponseInput[]) {
  const bank = await getQuestionBank()
  const questionMap = new Map(bank.questions.map((question) => [question.id, question]))

  const normalizedByCategory = new Map<string, number[]>()
  const criteriaFlagged = new Set<string>()
  let safetyConcern = false

  for (const response of responses) {
    const question = questionMap.get(response.questionId)
    if (!question) {
      throw new Error(`Unknown question id: ${response.questionId}`)
    }

    if (!question.answer.includes(response.value)) {
      throw new Error(`Invalid answer value for question id: ${response.questionId}`)
    }

    const normalized = normalizeResponse(question, response.value)
    const current = normalizedByCategory.get(question.category) ?? []
    current.push(normalized)
    normalizedByCategory.set(question.category, current)

    if (question.flags.safety && response.value > 0) {
      safetyConcern = true
      criteriaFlagged.add('self_harm')
    }
  }

  const categoryInsights = [...normalizedByCategory.entries()]
    .map(([category, scores]) => {
      const score = scores.reduce((sum, item) => sum + item, 0) / scores.length
      return {
        category,
        label: categoryLabel(category),
        intensity: scoreToIntensity(score),
        score,
      } satisfies QuestionInsight
    })
    .sort((left, right) => right.score - left.score)

  const distressScore = categoryInsights.length
    ? categoryInsights.reduce((sum, insight) => sum + insight.score, 0) / categoryInsights.length
    : 0

  if ((normalizedByCategory.get('depression')?.[0] ?? 0) >= 0.55 || (normalizedByCategory.get('depression')?.reduce((sum, value) => sum + value, 0) ?? 0) >= 1.1) {
    criteriaFlagged.add('low_mood')
  }

  if ((normalizedByCategory.get('anxiety')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('anxiety')?.length ?? 1, 1) >= 0.58) {
    criteriaFlagged.add('anxiety')
  }

  if ((normalizedByCategory.get('stress')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('stress')?.length ?? 1, 1) >= 0.58) {
    criteriaFlagged.add('stress_overload')
  }

  if ((normalizedByCategory.get('sleep')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('sleep')?.length ?? 1, 1) >= 0.55) {
    criteriaFlagged.add('sleep_issues')
  }

  if ((normalizedByCategory.get('concentration')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('concentration')?.length ?? 1, 1) >= 0.55) {
    criteriaFlagged.add('focus_issues')
  }

  if ((normalizedByCategory.get('social_functioning')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('social_functioning')?.length ?? 1, 1) >= 0.55) {
    criteriaFlagged.add('social_withdrawal')
  }

  if ((normalizedByCategory.get('energy')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('energy')?.length ?? 1, 1) >= 0.55) {
    criteriaFlagged.add('low_energy')
  }

  if ((normalizedByCategory.get('wellbeing')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('wellbeing')?.length ?? 1, 1) >= 0.58) {
    criteriaFlagged.add('low_wellbeing')
  }

  if ((normalizedByCategory.get('substance_use')?.reduce((sum, value) => sum + value, 0) ?? 0) / Math.max(normalizedByCategory.get('substance_use')?.length ?? 1, 1) >= 0.58) {
    criteriaFlagged.add('substance_use')
  }

  const severity: QuestionSummary['severity'] = safetyConcern || distressScore >= 0.72
    ? 'severe'
    : distressScore >= 0.54
      ? 'moderate'
      : distressScore >= 0.32
        ? 'mild'
        : 'none'

  const balanceScore = Math.round((1 - distressScore) * 100)
  const derivedMoodScore = Math.min(5, Math.max(1, Math.round((1 - distressScore) * 4) + 1))

  const moodLabel =
    balanceScore >= 72
      ? 'Grounded'
      : balanceScore >= 56
        ? 'Steady'
        : balanceScore >= 40
          ? 'Tender'
          : 'Heavy'

  const tone =
    balanceScore >= 72
      ? 'You seem to be carrying yourself with a fair amount of steadiness right now.'
      : balanceScore >= 56
        ? 'Things look mixed, but there are still signs of balance in how you are coping.'
        : balanceScore >= 40
          ? 'A few areas are asking for care right now, even if everything is not equally heavy.'
          : 'This check-in suggests that things may feel especially heavy right now.'

  const nextSteps = safetyConcern
    ? [
        'Reach out to a trusted person or local emergency support right away if you feel unsafe.',
        'Use the chat or book a counselor session for immediate follow-up support.',
        'Take a pause and avoid being alone with overwhelming thoughts if possible.',
      ]
    : severity === 'severe'
      ? [
          'Book a counselor session soon so this does not sit only on your shoulders.',
          'Use the chat to talk through the heaviest part of what is going on.',
          'Keep today gentle and aim for one supportive action, not a full reset.',
        ]
      : severity === 'moderate'
        ? [
            'A short chat or counselor check-in could help you unpack the main pressure point.',
            'Notice which category feels most accurate and start with that one this week.',
            'Try a lighter routine for today: rest, hydration, food, and one doable task.',
          ]
        : [
            'Keep checking in regularly so patterns stay visible before they build up.',
            'Use the chat whenever you want to talk something through in the moment.',
            'Carry forward one habit that has been helping, even if it is small.',
          ]

  return {
    severity,
    moodLabel,
    tone,
    balanceScore,
    distressScore,
    derivedMoodScore,
    criteriaFlagged: [...criteriaFlagged],
    topInsights: categoryInsights.slice(0, 3),
    hasSafetyConcern: safetyConcern,
    answeredCount: responses.length,
    nextSteps,
  } satisfies QuestionSummary
}

export const ASSESSMENT_LABELS: Record<QuestionSummary['severity'], string> = {
  none: 'Stable',
  mild: 'Gentle watch',
  moderate: 'Needs attention',
  severe: 'Needs support',
}

export function getAssessmentLabel(severity: QuestionSummary['severity']) {
  return ASSESSMENT_LABELS[severity]
}

export function formatAssessmentNote(summary: QuestionSummary) {
  const signalText = summary.topInsights.length
    ? `Signals: ${summary.topInsights.map((insight) => insight.label).join(', ')}.`
    : 'Signals: general mood snapshot.'

  return `Guided check-in: ${summary.moodLabel}. ${signalText}`
}
