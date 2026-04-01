/**
 * Action Agent
 * 
 * Handles tool calls from the Companion Agent. When the LLM suggests an action
 * (book_counselor, show_resources, send_crisis_alert), this agent orchestrates
 * the actual execution.
 * 
 * This is the bridge between conversation and real-world actions.
 */

import { createClient } from '@/lib/supabase/server'

export type ActionType = 
  | 'book_counselor'
  | 'show_resources'
  | 'send_crisis_alert'
  | 'log_mood'

export interface ActionRequest {
  action: ActionType
  userId: string
  context?: string
  params?: Record<string, unknown>
}

export interface ActionResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

/**
 * Execute an action based on the companion agent's suggestion
 */
export async function executeAction(request: ActionRequest): Promise<ActionResult> {
  switch (request.action) {
    case 'book_counselor':
      return await handleBookCounselor(request)
    case 'show_resources':
      return await handleShowResources(request)
    case 'send_crisis_alert':
      return await handleCrisisAlert(request)
    case 'log_mood':
      return await handleLogMood(request)
    default:
      return {
        success: false,
        message: `Unknown action: ${request.action}`,
      }
  }
}

/**
 * Handle counselor booking action
 * Finds available slots and can auto-book if params provided
 */
async function handleBookCounselor(request: ActionRequest): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    // Get student's assigned counselor (if any)
    const { data: profile } = await supabase
      .from('profiles')
      .select('counselor_id, institution')
      .eq('id', request.userId)
      .single()

    // Build slots query
    let slotsQuery = supabase
      .from('counselor_slots')
      .select(`
        id,
        counselor_id,
        slot_start,
        slot_end,
        counselor:profiles!counselor_id(name, institution)
      `)
      .eq('available', true)
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true })
      .limit(5)

    // Prefer assigned counselor if exists
    if (profile?.counselor_id) {
      slotsQuery = slotsQuery.eq('counselor_id', profile.counselor_id)
    }

    const { data: slots, error: slotsError } = await slotsQuery

    if (slotsError) {
      console.error('Failed to fetch slots:', slotsError)
      return {
        success: false,
        message: 'Could not fetch available slots right now.',
      }
    }

    if (!slots || slots.length === 0) {
      return {
        success: true,
        message: 'No slots available right now. I can help you find alternative times.',
        data: { slots: [], needsAlternative: true },
      }
    }

    // If auto-book params provided, create booking
    if (request.params?.autoBook && request.params?.slotId) {
      const slot = slots.find(s => s.id === request.params?.slotId)
      if (slot) {
        const bookingType = (request.params?.type as 'anonymous' | 'named' | 'crisis') || 'anonymous'
        
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            student_id: request.userId,
            counselor_id: slot.counselor_id,
            slot_id: slot.id,
            slot_start: slot.slot_start,
            slot_end: slot.slot_end,
            type: bookingType,
            status: 'pending_confirmation' as const,
          })
          .select()
          .single()

        if (bookingError) {
          return {
            success: false,
            message: 'Could not complete the booking. The slot might have been taken.',
          }
        }

        // Mark slot as unavailable
        await supabase
          .from('counselor_slots')
          .update({ available: false })
          .eq('id', slot.id)

        return {
          success: true,
          message: `Booked a session for ${formatSlotTime(slot.slot_start)}. You'll receive a confirmation soon.`,
          data: { booking, slot },
        }
      }
    }

    // Return available slots for user to choose
    return {
      success: true,
      message: `Found ${slots.length} available slot${slots.length > 1 ? 's' : ''}. Would you like me to book one?`,
      data: { 
        slots: slots.map(s => ({
          id: s.id,
          counselorName: (s.counselor as { name: string })?.name,
          time: formatSlotTime(s.slot_start),
          slotStart: s.slot_start,
          slotEnd: s.slot_end,
        }))
      },
    }
  } catch (error) {
    console.error('Book counselor action error:', error)
    return {
      success: false,
      message: 'Something went wrong while checking availability.',
    }
  }
}

/**
 * Handle show resources action
 * Returns relevant resources based on context
 */
async function handleShowResources(request: ActionRequest): Promise<ActionResult> {
  // Import static resources
  const staticResources = await import('@/content/static-resources.json')
  const resources = staticResources.default

  // Simple keyword matching for relevance
  const context = (request.context || '').toLowerCase()
  const params = request.params || {}
  
  let filtered = resources

  // Filter by type if specified
  if (params.type) {
    filtered = filtered.filter(r => 
      r.type.toLowerCase() === (params.type as string).toLowerCase()
    )
  }

  // Filter by context keywords
  if (context) {
    const keywords = extractKeywords(context)
    if (keywords.length > 0) {
      filtered = resources.filter(r => {
        const text = `${r.title} ${r.description}`.toLowerCase()
        return keywords.some(k => text.includes(k))
      })
    }
  }

  // If no matches, return top 3 general resources
  if (filtered.length === 0) {
    filtered = resources.slice(0, 3)
  }

  return {
    success: true,
    message: `Here are some resources that might help.`,
    data: { 
      resources: filtered.slice(0, 4).map(r => ({
        title: r.title,
        type: r.type,
        duration: r.duration,
        url: r.url,
        description: r.description,
      }))
    },
  }
}

/**
 * Handle crisis alert action
 * This is typically called automatically by the chat route,
 * but can also be triggered explicitly
 */
async function handleCrisisAlert(request: ActionRequest): Promise<ActionResult> {
  // Import here to avoid circular dependencies
  const { triggerCrisisAlert } = await import('@/lib/crisis')
  
  try {
    await triggerCrisisAlert(request.userId)
    
    return {
      success: true,
      message: 'A counselor has been notified and will reach out soon.',
      data: { alertSent: true },
    }
  } catch (error) {
    console.error('Crisis alert action error:', error)
    return {
      success: false,
      message: 'Could not send alert, but please reach out to iCall at 9152987821.',
    }
  }
}

/**
 * Handle mood logging action
 * Can be triggered mid-conversation
 */
async function handleLogMood(request: ActionRequest): Promise<ActionResult> {
  const supabase = await createClient()
  const score = request.params?.score as number
  const note = request.params?.note as string

  if (!score || score < 1 || score > 5) {
    return {
      success: false,
      message: 'Please provide a mood score between 1 and 5.',
    }
  }

  try {
    const { error } = await supabase
      .from('mood_logs')
      .insert({
        user_id: request.userId,
        score,
        note: note || null,
      })

    if (error) {
      return {
        success: false,
        message: 'Could not save your mood right now.',
      }
    }

    return {
      success: true,
      message: `Got it, mood logged as ${score}/5.`,
      data: { score, note },
    }
  } catch (error) {
    console.error('Log mood action error:', error)
    return {
      success: false,
      message: 'Something went wrong while saving your mood.',
    }
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format a slot time for display
 */
function formatSlotTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Extract keywords for resource matching
 */
function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  
  // Mental health keywords
  if (/sleep|insomnia|tired|rest/i.test(text)) keywords.push('sleep')
  if (/anxi|nervous|worry|stress|overwhelm/i.test(text)) keywords.push('anxiety', 'stress')
  if (/breath|calm|relax/i.test(text)) keywords.push('breathing', 'relax')
  if (/study|exam|focus|concentrat/i.test(text)) keywords.push('study', 'focus')
  if (/meditat|mindful/i.test(text)) keywords.push('meditation', 'mindful')
  if (/sad|down|depress|low/i.test(text)) keywords.push('mood', 'gratitude')
  if (/morning|wake|start/i.test(text)) keywords.push('morning', 'motivation')
  
  return keywords
}

/**
 * Parse action from companion response
 * Used to extract action from the LLM's JSON response
 */
export function parseActionFromResponse(response: {
  suggested_action?: string | null
  action_context?: string | null
}): { action: ActionType; context: string } | null {
  if (!response.suggested_action) return null
  
  const validActions: ActionType[] = [
    'book_counselor',
    'show_resources', 
    'send_crisis_alert',
    'log_mood',
  ]
  
  if (validActions.includes(response.suggested_action as ActionType)) {
    return {
      action: response.suggested_action as ActionType,
      context: response.action_context || '',
    }
  }
  
  return null
}
