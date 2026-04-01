# 🧠 MindBridge — Master Build Plan
**Version:** 3.0 — Final  
**Solo Dev + AI Agents Build**  
**Demo Target:** SIH 2025 Live Demo  
**Timeline:** 3 Weeks

---

## The One Thing This Product Is

Not a chatbot. Not a quiz app. Not a booking tool.

**A companion that knows you, watches over you quietly, and acts on your behalf — before you even know you need help.**

Every single decision in this document flows from that sentence. If a feature doesn't serve that sentence, it doesn't exist in this product.

---

## What's Already Built (Current State)

You have a complete UI shell. That's actually a great foundation.

| What You Have | Status | Decision |
|---|---|---|
| Landing page | ✅ Complete | Keep — don't touch |
| Student dashboard UI | ✅ UI only | Keep shell, wire backend |
| Chat UI | ✅ UI only | Keep — this is the core |
| Check-in (5 moods) | ✅ UI only | Keep as secondary input |
| Quizzes page (PHQ-9 forms) | ✅ UI only | **Cut** — AI does this conversationally now |
| Resources page | ✅ UI only | **Simplify** — 8 curated embeds, no backend |
| Booking UI | ✅ UI only | Keep — wire backend |
| Counselor dashboard | ✅ UI only | Keep — critical for demo |
| Admin dashboard | ✅ UI only | **Cut** — not needed for demo |
| Auth pages | ⚠️ Placeholder | Wire Supabase Auth |

**The entire product differentiation — Memory Engine, Proactive Agent, Auto-booking, Crisis Alert — does not exist yet. That's what we build.**

---

## Tech Stack (Locked)

```yaml
Framework:      Next.js 15 App Router (you're on 16.2.1, fine)
Language:       TypeScript 5
Styling:        Tailwind CSS 4
Animations:     Motion (already installed)

Database:       Supabase (PostgreSQL)
Auth:           Supabase Auth (email OTP — no passwords)
Realtime:       Supabase Realtime (counselor crisis alerts)
Storage:        Supabase Storage (not needed for MVP — resources are URLs)

AI:             NVIDIA NIM API
Model:          meta/llama-3.1-8b-instruct (free, OpenAI-compatible)
Streaming:      Next.js Route Handler + ReadableStream (SSE)

Email:          Resend (booking confirmations, OTP)
Scheduler:      Supabase pg_cron (proactive morning check-ins)

State:          Zustand + TanStack Query
Charts:         Recharts
i18n:           English only for MVP (Hindi — post-demo)

Deployment:     Vercel + Supabase
```

### Why NVIDIA NIM over OpenAI

The API is 100% OpenAI SDK compatible — 2 line change. Free for prototyping with no credit card. `meta/llama-3.1-8b-instruct` is fast, capable, and more than sufficient for empathetic conversation. More importantly — for a hackathon built on government infrastructure, open-source model provenance is a story you can tell. "We're not dependent on proprietary US APIs" is a strong point for a J&K government problem statement.

```typescript
// lib/nvidia-nim.ts
import OpenAI from 'openai'

export const nim = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY!,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

// Use exactly like OpenAI — same SDK, same methods
const stream = await nim.chat.completions.create({
  model: 'meta/llama-3.1-8b-instruct',
  messages: [...],
  stream: true,
})
```

---

## The Agent Architecture

This is the brain of MindBridge. Four agents. One model. Different jobs.

They are not separate services. They are the same NIM model called with different system prompts and different context. The intelligence comes from what you feed each agent and when you call them.

```
┌─────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                  │
│  mood_logs | chat_messages | bookings | profiles     │
└──────────────────────┬──────────────────────────────┘
                       │ reads
          ┌────────────▼────────────┐
          │     MEMORY AGENT        │  Runs before every chat
          │  Builds "who is Riya    │  response. Reads all
          │  right now" summary     │  history, outputs a
          └────────────┬────────────┘  context block.
                       │ feeds context to
          ┌────────────▼────────────┐
          │    COMPANION AGENT      │  The one that talks.
          │  Knows Riya. Speaks     │  Receives memory summary.
          │  naturally. Decides     │  Responds to student.
          │  what to do next.       │  Returns JSON with
          └────────────┬────────────┘  action suggestions.
                       │ triggers
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  OBSERVER   │ │   ACTION    │ │  PROACTIVE  │
│   AGENT     │ │   AGENT     │ │   AGENT     │
│             │ │             │ │             │
│ Runs on     │ │ Executes    │ │ Runs on     │
│ schedule.   │ │ tool calls: │ │ pg_cron     │
│ Spots       │ │ book_slot   │ │ every       │
│ patterns.   │ │ alert_      │ │ morning.    │
│ Triggers    │ │ counselor   │ │ Decides if  │
│ proactive   │ │ send_email  │ │ to initiate │
│ check-in.   │ │             │ │ a message.  │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Module 1: Memory Engine

### What
Before every AI response, the system reads the student's entire history and compresses it into a rich context summary. The companion agent then gets this summary as part of its system prompt — so it always knows who it's talking to.

### Why
This is the single feature that makes MindBridge feel different from every other mental health app. Every other app treats each conversation as new. We treat every conversation as a continuation of an ongoing relationship. Woebot "remembers previous chats" and users call it out as the reason they trust it. We go further — we synthesize everything and use it proactively.

### How

**Step 1 — Collect raw history**
```typescript
// lib/agents/memory-agent.ts

async function buildMemoryContext(userId: string): Promise<string> {
  const [moods, chats, assessments] = await Promise.all([
    supabase
      .from('mood_logs')
      .select('score, note, logged_at')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(30),

    supabase
      .from('chat_messages')
      .select('role, content, crisis_flag, sent_at')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(50),

    supabase
      .from('assessments')
      .select('indicators, severity, assessed_at')
      .eq('user_id', userId)
      .order('assessed_at', { ascending: false })
      .limit(5),
  ])

  // Step 2 — Ask NIM to summarize all of this into a context block
  const summary = await nim.chat.completions.create({
    model: 'meta/llama-3.1-8b-instruct',
    messages: [{
      role: 'user',
      content: `You are a memory system. Given this student's history, write a brief 
      context summary (max 200 words) that will help a companion AI understand who 
      this person is right now. Include: emotional trend, key themes they've discussed, 
      any concerns to be aware of, their communication style.
      
      Mood history (last 30 days): ${JSON.stringify(moods.data)}
      Recent conversations: ${JSON.stringify(chats.data)}
      Mental health indicators: ${JSON.stringify(assessments.data)}
      
      Write as if briefing a counselor before a session. Be specific, not generic.`
    }],
    max_tokens: 300,
  })

  return summary.choices[0].message.content ?? ''
}
```

**Step 3 — This context flows into every companion agent call**

The memory context is rebuilt on every conversation start. It's not cached — fresh data every time. At 50 messages + 30 mood logs, the Supabase query takes ~50ms. The NIM summary call takes ~800ms. Total: ~850ms before the first response. Acceptable for a chat app — we show a "thinking" state.

**What the judges see:** Student opens chat. AI says "Hey Riya — rough week last week, how's today going?" without being asked. The student didn't tell it what week it was or what happened. It just knows. That's the moment.

---

## Module 2: Companion Agent (The Chat)

### What
The conversational AI that the student talks to. It's not a generic chatbot. It receives the memory context, speaks in a warm natural tone, and has specific behaviours baked into its system prompt. It also does hidden assessment — evaluating PHQ-9 and GAD-7 criteria conversationally without ever using clinical language.

### Why
Forms feel clinical. Clinical feels scary. Scared people lie on forms or avoid them. Conversation feels natural. Natural conversation yields honest answers. Woebot proved this — users who'd never fill in a PHQ-9 form happily chatted about their week and got accurate assessments. We go further — our assessment is completely invisible to the user.

### How

**System prompt (the most important piece of code in this product):**

```typescript
// lib/agents/companion-agent.ts

function buildSystemPrompt(memoryContext: string, studentName: string): string {
  return `You are MindBridge, a compassionate AI companion for ${studentName}, 
an Indian college student. You are not a therapist. You are a warm, intelligent 
friend who happens to understand mental health deeply.

CONTEXT ABOUT ${studentName} RIGHT NOW:
${memoryContext}

YOUR PERSONALITY:
- Warm but never saccharine. Real, not performative.
- You remember things and reference them naturally. Never say "as I mentioned" 
  or "according to my records" — just speak like you know them.
- Short responses. 2-4 sentences max per turn. You ask one question at a time.
- You never say "I understand how you feel." You show understanding through 
  specific, contextual responses.
- Never use clinical words: "depression", "anxiety disorder", "symptoms", 
  "diagnosis". Say "sounds heavy", "that's a lot to carry", "makes sense 
  you'd feel that way".

HIDDEN ASSESSMENT:
As the conversation progresses, evaluate these 9 PHQ-9 criteria naturally:
1. Low mood / hopelessness
2. Loss of interest in things they used to enjoy  
3. Sleep problems (too much or too little)
4. Low energy / fatigue
5. Appetite changes
6. Feelings of worthlessness or guilt
7. Concentration problems
8. Psychomotor changes (slowing down or restlessness)
9. Any thoughts of self-harm

You evaluate these through natural conversation. Never ask about them directly.
Track which ones come up organically. When you have signal on 5+, flag it internally.

CRISIS PROTOCOL (non-negotiable):
If the student mentions: not wanting to be here, ending it, hurting themselves, 
suicide, self-harm — respond with warmth first, then include iCall: 9152987821 
naturally in your response. Always set crisis: true.

TOOL CALLS:
When appropriate, you can suggest actions. Return these as part of your JSON response.
Available actions: "book_counselor", "show_resources", "send_crisis_alert"

RESPONSE FORMAT — always return valid JSON:
{
  "message": "your natural response here",
  "crisis": false,
  "assessment_update": {
    "criteria_flagged": [],
    "severity": "none | mild | moderate | severe"
  },
  "suggested_action": null | "book_counselor" | "show_resources" | "send_crisis_alert",
  "action_context": null | "reason for the suggestion"
}`
}
```

**Streaming the response:**

```typescript
// app/api/chat/route.ts

export async function POST(req: Request) {
  const { message, userId, sessionId } = await req.json()

  // 1. Build memory context
  const memoryContext = await buildMemoryContext(userId)
  const profile = await getProfile(userId)

  // 2. Get conversation history for this session
  const history = await getSessionHistory(sessionId)

  // 3. Stream from NIM
  const stream = await nim.chat.completions.create({
    model: 'meta/llama-3.1-8b-instruct',
    messages: [
      { role: 'system', content: buildSystemPrompt(memoryContext, profile.name) },
      ...history,
      { role: 'user', content: message }
    ],
    stream: true,
    max_tokens: 500,
  })

  // 4. Stream back to client as SSE
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = ''
      
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        fullResponse += text
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      }

      // 5. Parse the JSON from completed response
      try {
        const parsed = JSON.parse(fullResponse)
        
        // Save to DB
        await saveMessage(userId, sessionId, 'user', message)
        await saveMessage(userId, sessionId, 'assistant', parsed.message, parsed.crisis)
        
        // Handle crisis
        if (parsed.crisis) {
          await triggerCrisisAlert(userId)
        }
        
        // Update assessment if new signals found
        if (parsed.assessment_update.criteria_flagged.length > 0) {
          await updateAssessment(userId, parsed.assessment_update)
        }

        // Send action metadata at end of stream
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, action: parsed.suggested_action })}\n\n`)
        )
      } catch (e) {
        // If JSON parse fails, the message is already streamed — just save raw
      }
      
      controller.close()
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  })
}
```

**What the judges see:** Student types "I've been really tired lately, can't sleep, nothing feels worth doing." AI responds: "That sounds exhausting — not sleeping and feeling disconnected from things usually hit at the same time. Has this been building up over a few days or longer?" No form. No score. But internally, the system just logged: low_energy ✓, anhedonia ✓, sleep_issues ✓. Assessment happening invisibly.

---

## Module 3: Proactive Agent (The Jarvis Moment)

### What
Every morning at 8 AM, a Supabase Edge Function runs via pg_cron. It checks every active student's history. For students who show patterns worth checking in on, it initiates a conversation — the app messages them first.

### Why
Every mental health app waits for the user to come to them. That's backwards. The students who most need support are the ones least likely to open the app. Proactive outreach is what separates a companion from a tool. This is the feature that will make the live demo audience go quiet.

### How

**pg_cron schedule in Supabase:**
```sql
-- Runs every day at 8 AM IST (2:30 AM UTC)
select cron.schedule(
  'proactive-morning-checkin',
  '30 2 * * *',
  $$
  select net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/proactive-agent',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_key') || '"}'::jsonb
  )
  $$
);
```

**The Observer Agent logic (runs inside the Edge Function):**

```typescript
// supabase/functions/proactive-agent/index.ts

serve(async () => {
  // Get all active students (logged in within last 7 days)
  const students = await getActiveStudents()

  for (const student of students) {
    const shouldCheckIn = await observerAgent(student)
    
    if (shouldCheckIn.trigger) {
      await initiateProactiveChat(student.id, shouldCheckIn.openingMessage)
    }
  }
})

async function observerAgent(student: Student): Promise<ObserverResult> {
  const history = await getStudentHistory(student.id)
  
  // Rule-based triggers (fast, no LLM needed)
  const rules = [
    // Hasn't checked in for 2+ days
    daysSinceLastActivity(history) >= 2,
    // 3 consecutive low mood scores
    lastThreeMoods(history).every(m => m.score <= 2),
    // Assessment moved from mild to moderate
    assessmentSeverityIncreased(history),
    // Upcoming exam period (if institution data available)
    isExamPeriod(),
  ]

  const triggered = rules.filter(Boolean)
  if (triggered.length === 0) return { trigger: false }

  // Only call LLM if we're going to trigger — to craft the right opening
  const opening = await nim.chat.completions.create({
    model: 'meta/llama-3.1-8b-instruct',
    messages: [{
      role: 'user',
      content: `You're MindBridge checking in on ${student.name} proactively.
      
      Context: ${JSON.stringify(history.summary)}
      Trigger reason: ${triggered.join(', ')}
      
      Write a single, natural opening message (1-2 sentences max). 
      Don't mention the app. Don't say "I noticed". Just open conversation naturally.
      Sound like a friend texting, not a bot checking in.
      
      Examples of good openers:
      - "Hey, rough few days — how's today treating you?"
      - "Haven't heard from you in a bit. What's going on?"
      - "Exams are close — how are you holding up?"
      
      Return just the message, no JSON.`
    }],
    max_tokens: 80,
  })

  return {
    trigger: true,
    openingMessage: opening.choices[0].message.content ?? "Hey, how are you doing today?"
  }
}

async function initiateProactiveChat(studentId: string, message: string) {
  // Insert as an 'assistant' message to start a new session
  // This will appear as a new conversation in the student's chat on next open
  await supabase.from('chat_messages').insert({
    user_id: studentId,
    session_id: generateSessionId(),
    role: 'assistant',
    content: message,
    proactive: true,
    sent_at: new Date().toISOString()
  })

  // Optionally push a notification (PWA — post demo)
}
```

**What the judges see:** Demo student (Riya) had low mood scores Tuesday and Wednesday. She hasn't opened the app Thursday. Live demo is Thursday morning. App shows a message already waiting: *"Hey, rough couple of days — how's today treating you?"* Nobody asked for it. The app just cared. Room goes quiet. That's the moment.

---

## Module 4: Action Agent (Auto-Booking)

### What
When the Companion Agent determines a student needs a counselor session, it doesn't just suggest it. It finds an available slot, tells the student "I found Thursday 3 PM with Dr. Sharma — confirming it for you" and creates the booking. Student just taps Confirm or Cancel.

### Why
The friction between "I should talk to someone" and "I have a booking" is where students fall off. Making them navigate to a booking page, find a slot, fill in a form — that's 5 steps too many for someone who's already struggling. The agent collapses it to zero steps.

### How

**Tool definitions (given to companion agent in its context):**

```typescript
// lib/agents/action-agent.ts

export const AVAILABLE_TOOLS = [
  {
    name: 'find_and_book_slot',
    description: 'Find the earliest available counselor slot and create a pending booking',
    parameters: {
      type: 'object',
      properties: {
        booking_type: {
          type: 'string',
          enum: ['anonymous', 'named', 'crisis']
        },
        reason: {
          type: 'string',
          description: 'Brief reason for booking (internal use only, not shown to counselor)'
        }
      }
    }
  }
]

export async function executeBooking(
  studentId: string,
  bookingType: 'anonymous' | 'named' | 'crisis'
): Promise<BookingResult> {
  // Find earliest available slot
  const slot = await supabase
    .from('counselor_slots')
    .select('*, counselor:profiles(name)')
    .eq('available', true)
    .gte('slot_start', new Date().toISOString())
    .order('slot_start', { ascending: true })
    .limit(1)
    .single()

  if (!slot.data) {
    return { success: false, message: 'No slots available this week' }
  }

  // Create PENDING booking — student confirms
  const booking = await supabase.from('bookings').insert({
    student_id: studentId,
    counselor_id: slot.data.counselor_id,
    slot_start: slot.data.slot_start,
    slot_end: slot.data.slot_end,
    type: bookingType,
    status: 'pending_confirmation', // student must confirm
  }).select().single()

  // Mark slot as tentatively held for 10 min
  await supabase
    .from('counselor_slots')
    .update({ available: false, held_until: tenMinutesFromNow() })
    .eq('id', slot.data.id)

  return {
    success: true,
    booking: booking.data,
    counselorName: slot.data.counselor.name,
    slotTime: formatSlot(slot.data.slot_start),
    message: `Found a slot with ${slot.data.counselor.name} on ${formatSlot(slot.data.slot_start)}`
  }
}
```

**In the chat UI — when action agent fires:**

```tsx
// When the AI stream ends with suggested_action: "book_counselor"
// Show this inline in the chat — not a redirect, not a modal

<div className="booking-suggestion">
  <p>I found a slot with Dr. Priya Sharma — Thursday, 3:00 PM</p>
  <div className="flex gap-2">
    <Button onClick={() => confirmBooking(pendingBookingId)}>
      Yes, confirm it
    </Button>
    <Button variant="ghost" onClick={() => cancelHold(pendingBookingId)}>
      Not right now
    </Button>
  </div>
</div>
```

**What the judges see:** Student says "I think I need to talk to someone." AI says "I found a slot with Dr. Sharma — Thursday at 3 PM. Confirming it for you?" Student taps yes. Done. No page navigation, no form, no friction. Booking appears in counselor dashboard immediately. The whole thing happens inside the chat window.

---

## Module 5: Crisis Escalation

### What
When the Companion Agent returns `crisis: true`, three things happen simultaneously: the AI response includes iCall helpline number naturally, the counselor's dashboard shows a real-time alert badge (Supabase Realtime), and a crisis log entry is written (no message content — just timestamp and severity).

### Why
This is the feature that makes MindBridge a responsible product, not just a clever one. It's also the most impressive thing you can show a room of judges — a genuine safety net that fires in real time.

For the demo: trigger manually via a "simulate crisis" button in your demo toolkit. The counselor's laptop (open on the counselor dashboard) lights up live. Judges see both screens simultaneously.

### How

```typescript
// lib/crisis.ts

export async function triggerCrisisAlert(userId: string) {
  // 1. Get student's assigned counselor
  const { data: student } = await supabase
    .from('profiles')
    .select('counselor_id, institution')
    .eq('id', userId)
    .single()

  // 2. Write crisis log (no PII, no message content)
  await supabase.from('crisis_logs').insert({
    student_id: userId,
    counselor_id: student.counselor_id,
    severity: 'high',
    triggered_at: new Date().toISOString(),
    // Deliberately no message content stored
  })

  // 3. Supabase Realtime fires automatically — counselor dashboard
  // is subscribed to crisis_logs INSERT for their counselor_id
  // No additional code needed — Realtime handles this

  // 4. Send backup email via Resend
  await sendCrisisEmail(student.counselor_id, userId)
}
```

**Counselor dashboard subscription:**

```typescript
// app/(counselor)/dashboard/page.tsx

useEffect(() => {
  const channel = supabase
    .channel('crisis-alerts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'crisis_logs',
      filter: `counselor_id=eq.${counselorId}`
    }, (payload) => {
      // This fires in real-time on the counselor's screen
      setCrisisAlerts(prev => [payload.new, ...prev])
      playAlertSound() // subtle audio cue
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

**What the judges see:** Riya types something concerning in chat. Simultaneously — on the counselor's laptop across the table — a red badge appears. No refresh. No delay. Live. The room understands immediately that this is not a mock-up.

---

## Module 6: Resource Hub

### What
8-10 hand-curated videos and audio tracks. Hardcoded. No backend. No admin panel. Just a JSON file and a clean UI.

### Why
Resources are table stakes — every mental health app has them. We're not competing on resources. We have them so the product feels complete and so the companion agent can say "want me to pull up a 5-minute breathing exercise?" and actually have something to show.

### How

```typescript
// src/content/resources.ts — this is the entire backend

export const RESOURCES = [
  {
    id: '1',
    title: '5-Minute Breathing Exercise',
    category: 'anxiety',
    type: 'video',
    duration: '5 min',
    url: 'https://youtube.com/embed/...',
    thumbnail: '...'
  },
  {
    id: '2',
    title: 'Body Scan Meditation for Sleep',
    category: 'sleep',
    type: 'audio',
    duration: '12 min',
    url: 'https://youtube.com/embed/...',
    thumbnail: '...'
  },
  // 6-8 more...
]
```

That's the entire resource hub. No Supabase table. No admin upload. JSON file. Ship it in 2 hours, never touch it again.

---

## Database Schema (Complete)

```sql
-- ============================================
-- PROFILES (extends Supabase Auth)
-- ============================================
create table profiles (
  id              uuid references auth.users primary key,
  name            text,
  role            text check (role in ('student', 'counselor')) not null,
  institution     text,
  counselor_id    uuid references profiles(id), -- student's assigned counselor
  created_at      timestamptz default now()
);

-- RLS: Users read/write only their own profile
alter table profiles enable row level security;
create policy "Users own their profile"
  on profiles for all using (auth.uid() = id);

-- ============================================
-- MOOD LOGS
-- ============================================
create table mood_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  score       int check (score between 1 and 5),
  note        text,
  logged_at   timestamptz default now()
);

alter table mood_logs enable row level security;
create policy "Students own their mood logs"
  on mood_logs for all using (auth.uid() = user_id);

-- ============================================
-- CHAT MESSAGES
-- ============================================
create table chat_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  session_id   uuid not null,
  role         text check (role in ('user', 'assistant')),
  content      text not null,
  crisis_flag  boolean default false,
  proactive    boolean default false, -- true if AI initiated
  sent_at      timestamptz default now()
);

alter table chat_messages enable row level security;
create policy "Students own their messages"
  on chat_messages for all using (auth.uid() = user_id);

-- ============================================
-- ASSESSMENTS (implicit PHQ-9/GAD-7 from chat)
-- ============================================
create table assessments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  criteria_flagged  text[], -- ['low_mood', 'sleep_issues', 'anhedonia']
  severity          text check (severity in ('none', 'mild', 'moderate', 'severe')),
  assessed_at       timestamptz default now()
);

alter table assessments enable row level security;
create policy "Students own their assessments"
  on assessments for all using (auth.uid() = user_id);

-- ============================================
-- COUNSELOR SLOTS
-- ============================================
create table counselor_slots (
  id             uuid primary key default gen_random_uuid(),
  counselor_id   uuid references profiles(id) on delete cascade,
  slot_start     timestamptz not null,
  slot_end       timestamptz not null,
  available      boolean default true,
  held_until     timestamptz -- temporary hold during booking flow
);

alter table counselor_slots enable row level security;
-- Counselors manage their own slots
create policy "Counselors own their slots"
  on counselor_slots for all using (auth.uid() = counselor_id);
-- Students can read available slots
create policy "Students read available slots"
  on counselor_slots for select using (available = true);

-- ============================================
-- BOOKINGS
-- ============================================
create table bookings (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid references profiles(id),
  counselor_id        uuid references profiles(id),
  slot_id             uuid references counselor_slots(id),
  slot_start          timestamptz,
  slot_end            timestamptz,
  type                text check (type in ('anonymous', 'named', 'crisis')),
  status              text check (status in ('pending_confirmation', 'confirmed', 'cancelled', 'completed')),
  notes_encrypted     text, -- AES-256, counselor-only
  created_at          timestamptz default now()
);

alter table bookings enable row level security;
create policy "Students see their bookings"
  on bookings for select using (auth.uid() = student_id);
create policy "Counselors see their bookings"
  on bookings for all using (auth.uid() = counselor_id);

-- ============================================
-- CRISIS LOGS (no message content stored)
-- ============================================
create table crisis_logs (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references profiles(id),
  counselor_id   uuid references profiles(id),
  severity       text,
  acknowledged   boolean default false,
  triggered_at   timestamptz default now()
);

alter table crisis_logs enable row level security;
-- Counselors see their own crisis alerts (Realtime subscribes to this)
create policy "Counselors see their crisis alerts"
  on crisis_logs for all using (auth.uid() = counselor_id);
```

---

## Project Structure (Revised)

```
mindbridge/
├── app/
│   ├── (public)/
│   │   └── page.tsx                    ← Landing (already built ✅)
│   ├── (auth)/
│   │   ├── login/page.tsx              ← Wire Supabase OTP
│   │   └── verify/page.tsx             ← Wire Supabase OTP verify
│   ├── (student)/
│   │   ├── dashboard/page.tsx          ← Mood streak + proactive message badge
│   │   ├── chat/page.tsx               ← THE core — streaming AI chat
│   │   ├── check-in/page.tsx           ← Quick mood (1-5) — secondary
│   │   ├── resources/page.tsx          ← Static embeds from JSON
│   │   └── book/page.tsx               ← Booking confirmation (post-chat mostly)
│   ├── (counselor)/
│   │   └── dashboard/page.tsx          ← Bookings + LIVE crisis alerts
│   └── api/
│       ├── chat/route.ts               ← NIM streaming + agent orchestration
│       ├── bookings/
│       │   ├── route.ts                ← Create/list bookings
│       │   └── [id]/confirm/route.ts   ← Confirm pending booking
│       └── crisis/
│           └── simulate/route.ts       ← Demo-only: manual crisis trigger
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ← Browser client
│   │   └── server.ts                   ← Server client (Route Handlers)
│   ├── agents/
│   │   ├── memory-agent.ts             ← Builds context summary
│   │   ├── companion-agent.ts          ← System prompt builder
│   │   ├── action-agent.ts             ← Book slots, execute actions
│   │   └── observer-agent.ts           ← Pattern detection logic
│   ├── nvidia-nim.ts                   ← OpenAI-compatible NIM client
│   ├── crisis.ts                       ← Crisis alert orchestration
│   └── encryption.ts                   ← AES-256 for session notes
│
├── components/
│   ├── ui/                             ← Already built ✅
│   ├── chat/
│   │   ├── ChatWindow.tsx              ← Message list + input
│   │   ├── MessageBubble.tsx           ← Streaming text rendering
│   │   ├── ActionChip.tsx              ← "Book counselor" suggestion UI
│   │   └── BookingSuggestion.tsx       ← Inline confirm/cancel booking card
│   ├── dashboard/
│   │   ├── MoodChart.tsx               ← Recharts 30-day line
│   │   ├── StreakCounter.tsx           ← Number + flame icon
│   │   └── ProactiveMessageBadge.tsx  ← "New message from MindBridge"
│   └── counselor/
│       └── CrisisAlert.tsx             ← Realtime alert component
│
├── src/
│   └── content/
│       ├── mindbridge.ts               ← Already exists ✅ (keep)
│       └── resources.ts                ← NEW: 8-10 hardcoded resources
│
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql      ← All tables + RLS above
    └── functions/
        └── proactive-agent/
            └── index.ts                ← Morning check-in edge function
```

---

## 3-Week Build Plan (Solo Dev)

### Week 1 — Foundation + The Brain

**Goal:** By end of week 1, a student can log in, chat with an AI that knows their history, and it feels genuinely intelligent.

| Day | Task | Why First |
|-----|------|-----------|
| Day 1 | Supabase setup — project, schema, RLS, seed data | Everything depends on this |
| Day 1 | Supabase Auth wired to login/verify pages | Can't build anything authenticated without this |
| Day 2 | NVIDIA NIM client + basic chat Route Handler | Core of the product |
| Day 2 | Memory Agent — history query + NIM summarization | What makes it feel smart |
| Day 3 | Companion Agent system prompt + JSON response parsing | The personality layer |
| Day 3 | Chat UI streaming (SSE → word-by-word rendering) | What makes it feel alive |
| Day 4 | Implicit assessment — criteria tracking + DB write | The invisible PHQ-9 |
| Day 4 | Session persistence — load past conversations | Judges will scroll back |
| Day 5 | Mood check-in wired to Supabase | Quick win, feeds memory |
| Day 5 | Dashboard — mood chart + streak from real data | Visual proof it works |

**End of Week 1 checkpoint:** Open chat, say "I've been really stressed about exams and can't sleep" — AI responds warmly, asks a follow-up, and internally logs sleep_issues + anxiety. Memory context shows on next session. This should feel real.

---

### Week 2 — Agents + Actions

**Goal:** By end of week 2, the proactive check-in fires, auto-booking works inside chat, and the counselor alert is live.

| Day | Task |
|-----|------|
| Day 6 | Observer Agent — pattern detection rules (no LLM needed) |
| Day 6 | Proactive Agent — opening message generation via NIM |
| Day 7 | Supabase pg_cron — schedule morning edge function |
| Day 7 | Proactive message appears in chat on next student open |
| Day 8 | Counselor slot management (simple form — day + time range) |
| Day 8 | Action Agent — find_and_book_slot tool |
| Day 9 | Booking suggestion UI inside chat (inline confirm/cancel) |
| Day 9 | Booking confirmation flow — email via Resend |
| Day 10 | Crisis escalation — crisis_logs write + Realtime subscribe |
| Day 10 | Counselor dashboard — live alert badge (Supabase Realtime) |

**End of Week 2 checkpoint:** Run the full demo flow yourself. Student chats → AI suggests booking → student confirms inside chat → counselor sees booking appear. Then trigger crisis manually → counselor badge fires live. Fix everything that breaks.

---

### Week 3 — Polish + Demo Prep

**Goal:** By end of week 3, the demo flow is so tight you could do it in your sleep, on bad wifi, with a judge asking questions mid-demo.

| Day | Task |
|-----|------|
| Day 11 | Resource hub — static JSON → clean UI (8 embeds) |
| Day 11 | Mobile responsiveness pass — chat, dashboard, counselor |
| Day 12 | Error states everywhere — API down, no slots, network fail |
| Day 12 | Loading states — skeleton loaders, streaming indicators |
| Day 13 | Seed demo data — Riya's 2 weeks of mood + chat history |
| Day 13 | Demo crisis simulate button (hidden, keyboard shortcut) |
| Day 14 | Deploy to Vercel + Supabase production |
| Day 14 | End-to-end demo run on production — fix prod-only bugs |
| Day 15 | Rehearse demo 10 times with real people |
| Day 15 | Write the 2-minute product pitch |

---

## The Demo Script (4 Minutes)

**Minute 1 — "It knows her"**
Open student dashboard as Riya. Show that MindBridge already sent her a message this morning — unprompted. "Hey, rough couple of days — how's today treating you?" Explain: app noticed low mood Tuesday + Wednesday. Nobody asked it to reach out.

**Minute 2 — "It assesses without asking"**
Riya replies: "Still not great honestly, exams are close and I can't sleep." AI responds naturally. No form. No "on a scale of 1-10". Just a conversation. Point out to judges: internally it just flagged sleep_issues, exam_stress, low_mood. Hidden assessment. Invisible to the user.

**Minute 3 — "It acts without being asked"**
AI says: "I can see this is building up. I found a slot with Dr. Priya Sharma — Thursday at 3 PM. Want me to confirm it?" Riya taps "Yes". Booking confirmed. No page redirect. Inside the chat.

**Minute 4 — "It protects her"**
Riya says something concerning. Switch to counselor's laptop. Crisis alert fires live. No refresh. Real-time. "A student needs support." Counselor acknowledges. Both screens showing simultaneously. Done.

---

## What This Becomes (Post-Demo Roadmap)

This is the honest roadmap — not features for the sake of features, but natural extensions of the companion concept.

**v1.1 — 1 month post-demo**
- Hindi language support (i18next already in stack)
- PWA push notifications (proactive check-in as a push, not just in-app)
- Peer community — anonymous forum once moderation is figured out
- Multiple counselors per institution

**v2.0 — 3 months post-demo**
- Voice interface — student speaks, companion listens (Web Speech API + Whisper via NIM)
- Longitudinal reports — "Here's your emotional journey over 3 months" (for student only, beautiful chart)
- Counselor session prep — before a booking, companion summarizes relevant context for the counselor (anonymized, student-approved)
- Multi-institution deployment — separate Supabase projects per institution

**v3.0 — 6 months post-demo**
- True fine-tuned model — after 6 months of conversation data, fine-tune Llama on mental health + Indian campus context (NVIDIA makes this straightforward)
- WhatsApp interface — meet students where they already are
- ABHA health ID integration — for formal health record continuity
- Research dashboard — anonymized aggregate data for mental health researchers

---

## The Three Things That Differentiate This

After analyzing every mental health app in the market:

**1. It initiates.** Every other app waits. We reach out first. This is new.

**2. It remembers everything and uses it naturally.** Not "according to your history" — just genuine continuity. This is new.

**3. It connects to a real institutional safety net.** Your campus counselor sees the alert. Not a generic helpline. Your actual counselor. This is new.

These three things are not features. They are the product. Everything else is infrastructure.
