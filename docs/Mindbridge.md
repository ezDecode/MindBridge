# 🧠 MindBridge — Simplified Feature Specification
**Stack:** Next.js 15 + Supabase + NVIDIA NIM  
**Version:** 2.0 | **Audience:** Development Team  
**Philosophy:** *"Do fewer things. Do them well. Ship."*

---

## Why We're Simplifying

We studied 10+ mental health apps — Calm, Headspace, Woebot, Wysa, Youper, Sanvello, BetterHelp, Wysa, Flourish, and Bearable. Here is the one pattern that separates apps people actually use from apps people download and forget:

> **The apps that work do 3–4 things extremely well. The apps that fail try to do 12 things.**

Woebot is just a chatbot. Headspace is just guided content. Calm is just sleep and meditation. All of them are category leaders. Our original PRD had Socket.io, WebRTC, Redis, Bull queues, face-api emotion detection, 6 languages, gamification, and a TSV moderation system — for a hackathon project with a 6-person team. That is a failure recipe.

MindBridge's core value proposition is three sentences:
1. A student feeling low at 2 AM can talk to an AI and feel heard.
2. A student who doesn't know if what they're feeling is "serious" can take a quiz and get clarity.
3. A student who needs real help can book a counselor in under 2 minutes.

Every feature in this document either serves those three sentences or is cut.

---

## AI: NVIDIA NIM (Replacing OpenAI)

### Why NVIDIA NIM

NVIDIA NIM provides **OpenAI-compatible API endpoints** — meaning the code change from OpenAI to NIM is literally two lines (base URL + model name). No SDK migration, no prompt rewriting. NVIDIA's API Catalog gives free access to hosted NIM endpoints for prototyping with no credit card required, and you get credits to get started immediately.

### Recommended Model

```
Model:   meta/llama-3.1-8b-instruct
Reason:  Free on NIM API Catalog, OpenAI-compatible, 8B params is more than
         sufficient for empathetic conversation and crisis keyword detection.
         Excellent instruction following. Fast response latency.
```

Alternative if Llama-3.1-8B feels too limited:
```
Model:   meta/llama-3.3-70b-instruct
Reason:  Much stronger reasoning, better nuance for mental health context.
         Still free on NIM API Catalog for prototyping.
```

### Integration (Drop-in Replacement)

```javascript
// BEFORE (OpenAI)
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...]
});

// AFTER (NVIDIA NIM) — only 2 changes
import OpenAI from 'openai';
const client = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',  // ← change 1
});
const response = await client.chat.completions.create({
  model: 'meta/llama-3.1-8b-instruct',  // ← change 2
  messages: [...]
});
```

### Crisis Detection System Prompt (Simplified)

```
You are a compassionate mental wellness support assistant for Indian college students.
You are NOT a therapist. You provide emotional support and psychoeducation only.

CRISIS DETECTION RULES (non-negotiable):
- If the user mentions suicide, self-harm, hurting themselves, or not wanting to
  live: ALWAYS respond with empathy first, then provide iCall helpline: 9152987821.
  Set internal flag: crisis=true in your JSON response.
- Never minimize or dismiss what the user shares.
- Keep responses short (3-5 sentences max). One follow-up question at a time.
- Speak like a warm, calm friend — not a clinical professional.
- Never diagnose. Say "it sounds like you might be experiencing..." not "you have..."

Response format (JSON):
{
  "message": "your response here",
  "crisis": false,
  "suggested_action": null | "book_counselor" | "take_quiz" | "call_helpline"
}
```

---

## Stack (Final — Simplified)

```yaml
Frontend + Backend:  Next.js 15 (App Router)
                     - Pages serve as the UI
                     - Route Handlers replace Express API
                     - Server Actions for form submissions

Database:            Supabase (PostgreSQL)
                     - All data stored here
                     - Row Level Security enforces permissions
                     - Built-in Auth (email OTP)

Real-time:           Supabase Realtime
                     - Counselor gets live crisis alerts
                     - Booking status updates

AI Chatbot:          NVIDIA NIM API (meta/llama-3.1-8b-instruct)
                     - OpenAI-compatible SDK
                     - Streamed via Next.js ReadableStream (SSE)

Storage:             Supabase Storage
                     - Resource hub media (PDFs, audio, thumbnails)

Email:               Resend
                     - Booking confirmations, OTP delivery

Styling:             Tailwind CSS v3
State:               Zustand + TanStack Query
Charts:              Recharts
i18n:                i18next (English + Hindi only for MVP)
Testing:             Vitest (unit) + Playwright (E2E)
Deployment:          Vercel (frontend + API) + Supabase (data)
```

**What we removed from the original stack and why:**

| Removed | Why |
|---------|-----|
| Redis + Bull queue | Booking reminders handled by Supabase `pg_cron` + Resend. No always-on worker needed. |
| Socket.io | Supabase Realtime handles DB-change events. SSE handles AI streaming. No persistent WS server. |
| face-api.js emotion detection | Privacy risk, complexity, and unreliable in low-light Indian hostel rooms. Cut entirely. |
| AWS EC2 + Docker Compose | Vercel is zero-ops. No servers to manage. |
| AWS S3 + CloudFront | Supabase Storage has built-in CDN. Simpler setup, same result. |
| mediasoup WebRTC | Cut (see Video Consultations below). |
| migrate-mongo | Using Supabase migrations via `supabase db push`. |

---

## Feature Specification

### Legend
- ✅ **Build it** — core to the product, must be in the demo
- 🔜 **Defer** — good idea, but not for the first version
- ❌ **Cut** — removed permanently; adds complexity without proportional value

---

### 1. Authentication

✅ **Email OTP Login/Register**
Student registers with their college email. Supabase sends a 6-digit OTP. No password. Session managed by Supabase Auth automatically.

✅ **Role-based access (3 roles)**
- `student` — access to their own dashboard, chatbot, bookings, resources
- `counselor` — access to counselor dashboard, their own bookings only
- `admin` — access to analytics only (no student PII)

✅ **Anonymous-first browsing**
First 3 chatbot messages and the resource hub are accessible without login. Gate deeper features (bookings, quiz history, mood tracking) behind auth.

🔜 **Social login (Google)** — defer; OTP is sufficient for college emails.

❌ **Forgot password with reset link** — Supabase Auth's OTP flow IS the login, so there is no password to reset. Not needed.

---

### 2. Daily Mood Check-In

✅ **Simple mood input**
One screen. Student selects a mood on a scale of 1–5 (represented by emojis: 😞 😟 😐 🙂 😊). Optional free-text note (max 200 chars). Takes 15 seconds.

✅ **30-day mood trend chart**
A Recharts line chart showing the last 30 days. Simple, clean. No annotation overlays, no heatmaps, no "insights" AI layer on top.

✅ **Streak counter**
A simple streak number ("7 days in a row") shown on the dashboard. No badges, no levels, no gamification system — just the number.

🔜 **Weekly mood summary email** — defer; adds complexity.

❌ **Heatmap calendar** — the Recharts line chart is enough. A heatmap adds a second chart for no additional insight for the user.

❌ **Emotion detection via camera** — cut permanently. See reasoning above.

---

### 3. Mental Health Quizzes

✅ **PHQ-9 (Depression screening)**
9 questions, standard 4-point scale, auto-scored. Show severity band: Minimal / Mild / Moderate / Moderately Severe / Severe. Plain language explanation of what the score means.

✅ **GAD-7 (Anxiety screening)**
7 questions, same format.

✅ **Crisis trigger on high score**
If PHQ-9 ≥ 15 or GAD-7 ≥ 15: show a gentle prompt with two buttons — "Talk to AI first" and "Book a counselor now". Do not force. Do not alarm.

✅ **Quiz history**
Student can see their last 5 quiz attempts with scores and dates. Simple table. No graphs for this in MVP.

🔜 **PSS-10, Academic Burnout Scale** — defer. Two validated instruments are enough for demo.

❌ **AI-generated 7-day wellness plan** — this was a P1 feature. Cut for now. The chatbot already recommends activities conversationally. A separate "plan generator" is a separate product almost.

---

### 4. AI Chatbot (Core Feature)

✅ **Conversational support chatbot**
Powered by NVIDIA NIM (`meta/llama-3.1-8b-instruct`). Streamed response via SSE so the text appears word-by-word (not a loading spinner then a wall of text). Warm, non-clinical tone.

✅ **Persistent chat sessions**
Each conversation is saved. Student can scroll back and read previous chats. This is important — Woebot's "remembers previous chats" is a key reason users trust it.

✅ **Crisis detection and escalation**
The model's JSON response includes a `crisis: true` flag when crisis signals are detected. When flagged:
1. Response includes iCall helpline number prominently.
2. A quiet notification goes to the assigned counselor (Supabase Realtime).
3. Crisis is logged (anonymized timestamp + severity flag — no message content).

✅ **Suggested action chips**
After each AI response, show 1–2 contextual action chips: "Take PHQ-9 quiz", "Book a counselor", "Read this article". These are suggested by the AI in its JSON response, not hardcoded.

🔜 **Voice input** — defer. Useful but not core to the demo.

❌ **Offline fallback scripted chatbot** — the original PRD had pre-scripted responses as a fallback. NVIDIA NIM's free tier has good uptime. If the API is down, show a simple "I'm unavailable right now — please try again in a few minutes" message. A scripted fallback is a separate system to maintain.

---

### 5. Counselor Booking

✅ **Slot-based booking calendar**
Counselors define available slots (e.g., Mon 10–11 AM, Tue 2–3 PM). Students pick an open slot. Booking confirmed instantly. That's it.

✅ **Three booking types**
- **Anonymous** — student name not shown to counselor until they arrive
- **Named** — student name visible in counselor dashboard
- **Crisis** — flagged as urgent; counselor gets a Supabase Realtime push alert immediately

✅ **Email confirmation**
Booking confirmed → Resend sends email to student. 24h reminder email before the session.

✅ **Counselor can add session notes**
Simple text area. Notes are encrypted client-side before writing to Supabase (AES-256). Only the counselor can read their own notes. Admin cannot see notes.

🔜 **Booking reschedule by student** — defer; counselor can cancel and student re-books.

🔜 **Calendar sync (Google Calendar)** — defer.

❌ **WebRTC video consultations** — cut. This is an entire infra problem (TURN servers, mediasoup, NAT traversal). For the demo and v1, the counselor's booking confirmation email includes a Google Meet link they paste in manually. Zero complexity, same outcome for the SIH demo.

❌ **Therapist rating/review system** — cut. Inappropriate for a mental health context (students rating their counselors creates a bad dynamic) and adds complexity.

---

### 6. Resource Hub

✅ **Curated content library**
Articles, short audio clips (guided breathing, body scan meditation), and short videos (<10 min). Admin uploads via the admin dashboard. Students browse and read/listen/watch.

✅ **Category filtering**
Filter by: Anxiety, Depression, Exam Stress, Relationships, Sleep, Self-Care. Simple tag-based filter, no search in MVP.

✅ **Bookmarking**
Student can save resources. Shown in their profile under "Saved".

🔜 **Full-text search** — defer. Category filter is sufficient for MVP content volume.

🔜 **Continue watching / progress tracking for videos** — defer. Adds state complexity.

❌ **Community-submitted resources** — cut. Moderation burden. Admin-curated only.

❌ **Resource recommendation AI** — cut. The chatbot already recommends articles conversationally. A separate recommendation engine is over-engineering.

---

### 7. Peer Community Forum

🔜 **Anonymous peer forum** — deferred to v1.1.

**Why deferred (not cut):** Every successful mental health app with a community feature (Sanvello, Headspace's community) has a full-time moderation team. We do not. Unmoderated mental health forums are actively dangerous. The TSV (Trained Student Volunteer) system in the original PRD was the right instinct but it's a separate operational system, not just code. We will build this after launch when we have real users who can volunteer as moderators.

For SIH demo: the chatbot fills the "I want to feel heard" need. We mention the forum as a "coming soon" feature.

---

### 8. Counselor Dashboard

✅ **Upcoming bookings list**
Sorted by date. Shows booking type (anonymous/named/crisis). Crisis bookings are highlighted in red. One-click to view student details (if named booking).

✅ **Real-time crisis alert**
When a student's chatbot session triggers `crisis: true`, the counselor gets a badge notification on their dashboard immediately (Supabase Realtime). No email — it needs to be instant.

✅ **Session notes**
Per-booking notes editor. Encrypted. Only accessible to the counselor who created them.

✅ **Slot management**
Counselor sets their weekly availability. Simple form — day + time range. No drag-and-drop calendar builder.

🔜 **Session history analytics (counselor's own stats)** — defer.

❌ **Direct messaging between counselor and student** — cut. All communication happens through bookings and the structured session. Unstructured messaging in a mental health context is a liability.

---

### 9. Admin Dashboard

✅ **Institution-level mood trends**
Aggregate anonymous data: average mood score over time (line chart), quiz score distributions (bar chart). No individual student data visible anywhere.

✅ **Booking volume metrics**
Total bookings this month, split by type (anonymous/named/crisis). Trend over 3 months.

✅ **Crisis alert log**
Count of crisis flags per week. No message content, no student identity. Just the count and the time.

✅ **Counselor account management**
Admin can create/deactivate counselor accounts. Assign counselors to the institution.

✅ **Resource management**
Admin uploads and manages the resource hub content. Title, category, type (article/audio/video), URL or file upload.

❌ **Multi-institution Super-Admin** — cut for v1. One institution per deployment.

❌ **Exportable PDF reports** — cut. CSV export is fine for now.

---

### 10. Notifications

✅ **Email notifications (Resend)**
- Booking confirmation (student)
- 24h booking reminder (student)
- Crisis alert (counselor, email as backup to Realtime)
- OTP for login

🔜 **PWA push notifications** — defer. Service worker setup adds complexity. Email covers the critical paths.

❌ **SMS notifications** — cut. Twilio costs money. Email is free.

---

## What We're Not Building (and Why)

| Feature | Reason Cut |
|---------|------------|
| WebRTC video consultations | An entire infra problem (TURN, mediasoup, NAT traversal). Use Google Meet link in email. |
| Socket.io real-time | Supabase Realtime + SSE handles all our real-time needs without a persistent server. |
| Redis + Bull job queue | `pg_cron` in Supabase handles scheduled reminders. No always-on worker needed. |
| face-api.js emotion detection | Privacy risk, unreliable in real-world conditions, complex to implement correctly. |
| AI wellness plan generator | The chatbot already recommends activities. A separate plan generator is v2. |
| Peer community forum | Requires active moderation. A dangerous feature without it. Deferred to v1.1. |
| 6 Indian languages | English + Hindi covers ~60% of our target users. More languages = more maintenance. |
| Gamification (badges, levels) | Mental health is not a game. Streak counter only. |
| Community-submitted resources | Admin-curated content only. Moderation burden too high. |
| Scripted chatbot fallback | If NVIDIA NIM is down, show a friendly error. Two chatbot systems to maintain is worse. |
| Student/counselor rating system | Wrong dynamic for mental health. Cut permanently. |
| Direct messaging | All communication through structured bookings. No open messaging. |
| Multi-institution admin | One institution per deployment. Super-admin is v2. |
| ABHA health ID integration | Out of scope for a hackathon demo. |
| WhatsApp/Telegram bot | Different product. V3 at the earliest. |
| Dark mode | V1.1. Low effort but low priority during initial build. |

---

## Simplified Database Schema

Six tables. That's it.

```sql
-- Users (managed by Supabase Auth, extended here)
create table profiles (
  id          uuid references auth.users primary key,
  role        text check (role in ('student','counselor','admin')) not null,
  name        text,
  institution text,
  created_at  timestamptz default now()
);

-- Mood logs
create table mood_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  score      int check (score between 1 and 5),
  note       text,
  logged_at  timestamptz default now()
);

-- Quiz attempts
create table quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  quiz_type   text check (quiz_type in ('PHQ9','GAD7')),
  answers     jsonb,  -- array of {question_id, score}
  total_score int,
  severity    text,
  taken_at    timestamptz default now()
);

-- Counselor slots + bookings
create table bookings (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references profiles(id),
  counselor_id   uuid references profiles(id),
  slot_start     timestamptz,
  slot_end       timestamptz,
  type           text check (type in ('anonymous','named','crisis')),
  status         text check (status in ('pending','confirmed','cancelled','completed')),
  notes_encrypted text,  -- AES-256 encrypted session notes
  created_at     timestamptz default now()
);

-- Chat sessions + messages
create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  session_id  uuid,  -- groups messages into conversations
  role        text check (role in ('user','assistant')),
  content     text,
  crisis_flag boolean default false,
  sent_at     timestamptz default now()
);

-- Resources
create table resources (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  category    text check (category in ('anxiety','depression','exam_stress','relationships','sleep','self_care')),
  type        text check (type in ('article','audio','video')),
  url         text,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now()
);
```

RLS policies ensure:
- Students can only read/write their own rows
- Counselors can read bookings where they are the counselor
- Admin can read aggregated data but never individual student rows

---

## Simplified Project Structure

```
mindbridge/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── verify/page.tsx
│   ├── (student)/
│   │   ├── dashboard/page.tsx       ← mood streak + today's actions
│   │   ├── chat/page.tsx            ← AI chatbot
│   │   ├── checkin/page.tsx         ← mood log
│   │   ├── quiz/page.tsx            ← PHQ-9 / GAD-7
│   │   ├── resources/page.tsx       ← resource hub
│   │   └── book/page.tsx            ← counselor booking
│   ├── (counselor)/
│   │   └── dashboard/page.tsx       ← bookings + alerts + notes
│   ├── (admin)/
│   │   └── dashboard/page.tsx       ← analytics
│   └── api/
│       ├── chat/route.ts            ← NVIDIA NIM streaming endpoint
│       ├── quiz/score/route.ts
│       └── bookings/route.ts
├── components/
│   ├── ui/                          ← Button, Card, Input, Modal, Badge
│   ├── MoodChart.tsx
│   ├── ChatWindow.tsx
│   ├── QuizFlow.tsx
│   └── BookingCalendar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                ← browser client
│   │   └── server.ts                ← server client (Route Handlers)
│   ├── nvidia-nim.ts                ← OpenAI-compatible NIM client
│   ├── crisis-detector.ts           ← parse crisis flag from AI response
│   └── encryption.ts               ← AES-256 for session notes
└── supabase/
    └── migrations/                  ← SQL migration files
```

---

## Development Phases (Revised)

```
WEEK 1 — Foundation
├── Next.js project setup + Supabase project created
├── Database schema + RLS policies written and tested
├── Supabase Auth (email OTP) working end-to-end
├── NVIDIA NIM API key obtained, test call works
└── Design system: colors, Button, Card, Input components

WEEK 2-3 — Student Core
├── Dashboard page (mood streak display)
├── Mood check-in (log + 30-day chart)
├── PHQ-9 + GAD-7 quiz flow + scoring
└── Resource hub (browse + bookmark)

WEEK 4 — AI Chatbot
├── NVIDIA NIM Route Handler with SSE streaming
├── Chat UI (streaming message bubbles)
├── Crisis detection + counselor alert via Supabase Realtime
└── Session persistence (read past chats)

WEEK 5 — Booking System
├── Counselor slot management
├── Student booking flow (select slot → confirm → email)
├── Counselor dashboard (bookings list + crisis alerts)
└── Session notes (encrypted write + read)

WEEK 6 — Admin + Polish
├── Admin analytics dashboard (charts)
├── Hindi language (i18next, key screens only)
├── Mobile responsiveness pass
├── Error states, loading states, empty states
└── Basic E2E tests (Playwright) on critical flows

WEEK 7 — SIH Demo Prep
├── Seed data for demo (3 student personas, 1 counselor, content)
├── Deploy to Vercel + Supabase production
├── Demo script + walkthrough recording
└── Documentation
```

---

## Definition of Done (Simplified)

A feature is done when:
- [ ] Works on mobile (360px) and desktop (1280px)
- [ ] Loading state shown during any async operation
- [ ] Empty state handled (no data yet)
- [ ] Error state handled (API failure, validation error)
- [ ] RLS policy tested: can a student read another student's data? (must be no)
- [ ] No console errors in production build

That's it. No 80% test coverage requirement, no Swagger docs, no ARIA label audit — those are real requirements for a production app. For the SIH demo, working and correct is the goal.

---

## What Differentiates MindBridge

After reviewing all major mental health apps, here is what none of them do that we do:

1. **Campus counselor integration** — Woebot, Wysa, Calm, Headspace are all direct-to-consumer. They have no concept of an institutional counselor. MindBridge is the only app where a college counselor sees live crisis alerts and manages bookings.

2. **Indian campus context** — All leading apps are Western-designed. No PHQ-9 results page that says "your score suggests moderate depression — iCall (9152987821) and your campus counselor are here for you."

3. **Anonymous-first booking** — BetterHelp, Talkspace require identity upfront. MindBridge lets a student book a counselor session without revealing their name until they're ready.

These three are our differentiators. Every feature we build either strengthens one of these three or gets cut.