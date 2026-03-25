# 🧠 Product Requirements Document (PRD)
## MindBridge — Digital Mental Health & Psychological Support Platform
**Project:** Smart India Hackathon 2025 | Problem Statement: SIH25092  
**Organization:** Government of Jammu & Kashmir  
**Theme:** MedTech / BioTech / HealthTech  
**Version:** 1.0 | **Last Updated:** February 2026  
**Document Owner:** Team MindBridge  
**Status:** `APPROVED FOR DEVELOPMENT`

---

## 📑 Table of Contents
1. [Product Overview](#1-product-overview)
2. [Problem Space](#2-problem-space)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [User Stories & Journeys](#5-user-stories--journeys)
6. [Feature Prioritization (MoSCoW)](#6-feature-prioritization-moscow)
7. [System Design Decisions](#7-system-design-decisions)
8. [Tech Stack (Finalized)](#8-tech-stack-finalized)
9. [Project Structure](#9-project-structure)
10. [Environment Setup — Start Here](#10-environment-setup--start-here)
11. [Development Workflow](#11-development-workflow)
12. [API Contract Summary](#12-api-contract-summary)
13. [UI/UX Design Principles](#13-uiux-design-principles)
14. [Risk Register](#14-risk-register)
15. [Team Structure & Ownership](#15-team-structure--ownership)
16. [Timeline & Milestones](#16-timeline--milestones)
17. [Definition of Done](#17-definition-of-done)

---

## 1. Product Overview

### 1.1 What is MindBridge?

MindBridge is a web-based digital mental health support platform designed specifically for students in Indian higher education institutions. It provides a safe, anonymous, and technology-driven environment for mental wellness tracking, AI-powered first-aid support, professional counselor booking, peer community, and psychoeducational resources.

It is built in direct response to **SIH25092** — a problem statement from the Government of Jammu & Kashmir under SIH 2025, which calls for a digital system to address the growing mental health crisis in Indian colleges.

### 1.2 The One-Line Pitch
> *"A 24/7 digital companion that helps Indian college students understand, manage, and seek support for their mental health — safely and without stigma."*

### 1.3 What MindBridge is NOT
- ❌ A clinical diagnostic tool
- ❌ A replacement for professional therapy
- ❌ A crisis hotline operator
- ❌ A data monetization platform
- ❌ A surveillance system for institutions

### 1.4 Platform Type
- **Primary:** Progressive Web App (PWA) — works on any browser, installable on Android/iOS
- **Secondary:** Responsive Web (desktop and tablet)
- **No native app** in v1 (PWA covers all platforms without app store overhead)

---

## 2. Problem Space

### 2.1 The Crisis in Numbers

| Metric | Value | Source |
|--------|-------|--------|
| Students with significant anxiety/depression | >35% | NIMHANS 2023 |
| Students who actually seek help | <10% | NIMHANS 2023 |
| Avg. counselor-to-student ratio in Indian colleges | 1:1500+ | UGC Report 2022 |
| WHO recommended ratio | 1:250 | WHO 2020 |
| Suicides in Indian academic institutions (2022) | 13,044 | NCRB 2022 |
| Digital mental health market CAGR (global) | 16.5% | Market Research 2024 |

### 2.2 Root Causes We Address

```
Stigma ──────────────────────────────► Anonymous-first design
Limited counselor hours ──────────────► 24/7 AI chatbot + async booking
No early detection ───────────────────► Daily mood tracking + validated quizzes
No personalized support ──────────────► AI wellness plans + emotion detection
No cultural context ──────────────────► Regional language UI + Indian-specific content
Siloed resources ─────────────────────► Centralized multilingual resource hub
No institutional data ─────────────────► Admin analytics dashboard
```

### 2.3 Competitor Gaps We Fill

| Gap | How MindBridge Addresses It |
|-----|---------------------------|
| No app serves Indian campus ecosystem | Deep campus counselor integration, institution admin roles |
| No regional language support | 6 Indian languages across entire platform |
| No in-browser emotion AI | TensorFlow.js face-api — zero data leaves device |
| No peer forum with trained moderators | TSV-moderated peer support platform |
| No personalized daily recovery plans | AI-generated wellness plan from quiz results |
| No admin intervention analytics | Anonymized institutional trend dashboards |

---

## 3. Goals & Success Metrics

### 3.1 Business Goals (SIH Evaluation)
- Deliver a functional, deployable prototype solving SIH25092 completely
- Demonstrate technical depth (AI, real-time, security) and social impact
- Show scalability beyond a single institution

### 3.2 Product Goals (6 Months Post-Launch)

| Goal | KPI | Target |
|------|-----|--------|
| Student Engagement | Daily Active Users / Monthly Active Users ratio | ≥ 20% |
| Help-Seeking | Students who book at least one counselor session | ≥ 15% of registered users |
| Early Intervention | Crisis flags raised per month vs. counselor capacity | 100% of flags acknowledged within 30 min |
| Mood Improvement | Avg PHQ-9 score change over 8 weeks (active users) | Decrease of ≥ 2 points |
| Retention | Week-4 user retention rate | ≥ 40% |
| Stigma Reduction | % of users using anonymous features first | ≥ 60% |

### 3.3 Technical Goals
- Zero P0 security vulnerabilities at launch
- 99.5% uptime in first 3 months
- 0% false-negative rate on crisis keyword detection

---

## 4. User Personas

### Persona 1: Riya — The Overwhelmed First-Year
- **Age:** 18 | **Course:** B.Tech CSE | **Location:** NIT Srinagar
- **Context:** Away from home for the first time; struggling with academic pressure and loneliness
- **Pain Points:** Doesn't know where to turn; fears judgment if friends find out she's struggling
- **Goals:** Understand what she's feeling; find quiet coping tools she can use alone at night
- **Tech Comfort:** High (smartphone native, uses Instagram, YouTube)
- **Language:** Hindi + English
- **How MindBridge Helps:** Daily mood check-in → chatbot at 2 AM → anonymous peer forum → resource hub

---

### Persona 2: Arjun — The Burnout Engineering Student
- **Age:** 21 | **Course:** B.E. Final Year | **Location:** Government Engineering College, Jammu
- **Context:** Placement pressure + project deadlines + family expectations
- **Pain Points:** Ignores his mental state until it's a crisis; doesn't have time for weekly counseling
- **Goals:** Quick, structured tools; understand if what he's feeling is "serious"
- **Tech Comfort:** High
- **Language:** English
- **How MindBridge Helps:** PHQ-9 quiz → AI wellness plan → structured 10-min daily activities → triggered counselor booking if score high

---

### Persona 3: Dr. Priya Sharma — The Overwhelmed Counselor
- **Age:** 35 | **Role:** Campus Counselor | **Institution:** University of Kashmir
- **Context:** Manages 2,000+ students alone; drowning in informal requests via WhatsApp
- **Pain Points:** No system for organized bookings; no way to see who's at-risk proactively; paperwork chaos
- **Goals:** Structured appointment system; crisis alerts for urgent cases; secure session notes
- **Tech Comfort:** Medium
- **How MindBridge Helps:** Counselor dashboard → structured calendar → priority-flagged queue → encrypted session notes

---

### Persona 4: Prof. Ahmed — The Institution Admin
- **Age:** 50 | **Role:** Dean of Student Affairs | **Institution:** SMVDU, Katra
- **Context:** Has no visibility into student mental health trends; can only react after incidents
- **Pain Points:** No data for policy planning; can't justify budget allocation without evidence
- **Goals:** Aggregate trends; identify high-risk periods; demonstrate impact to governing board
- **How MindBridge Helps:** Admin analytics dashboard → anonymized heatmaps → exportable reports

---

## 5. User Stories & Journeys

### 5.1 Student — First-Time User Journey

```
1. DISCOVER
   Student hears about MindBridge at college orientation / sees poster
   └── Visits mindbridge.app → sees landing page with "Start Anonymously" CTA

2. ONBOARD
   Registers with college email → Email OTP verification
   └── Selects language → Sets notification preferences → Camera consent (skippable)
   └── Prompted to take first mood check-in

3. EXPLORE SAFELY (No commitment)
   Checks out Resource Hub → Reads an article on exam stress
   └── Tries the AI chatbot (no account required for first 3 messages)

4. ENGAGE DEEPER
   Takes PHQ-9 + GAD-7 quiz → Sees score: "Moderate Depression"
   └── AI generates 7-day wellness plan → Activities show up daily
   └── Starts daily mood check-in habit

5. SEEK SUPPORT
   After 2 weeks of moderate scores → System suggests counselor booking
   └── Books anonymous slot → Gets email confirmation
   └── Attends video session → Rates counselor

6. COMMUNITY
   Discovers peer forum → Posts anonymously about exam anxiety
   └── Gets upvoted helpful replies → Feels less alone
```

### 5.2 Core User Stories

```
AS A student, I WANT TO log my mood daily SO THAT I can understand my emotional patterns over time.

AS A student, I WANT TO chat with an AI SO THAT I get immediate support at any hour without judgment.

AS A student, I WANT TO take a validated quiz SO THAT I understand whether my feelings are clinically significant.

AS A student, I WANT TO book a counselor session anonymously SO THAT I don't fear judgment from staff.

AS A student, I WANT TO read mental health content in Hindi SO THAT I can understand it properly.

AS A counselor, I WANT TO see my upcoming sessions in one place SO THAT I can manage my time effectively.

AS A counselor, I WANT TO receive instant alerts for crisis bookings SO THAT I can respond immediately.

AS AN admin, I WANT TO see mood trends across my institution SO THAT I can plan interventions around exam periods.

AS AN admin, I WANT TO export anonymized reports SO THAT I can present data to the governing board.
```

---

## 6. Feature Prioritization (MoSCoW)

### Must Have (P0) — MVP, Required for SIH Demo
- [ ] Student authentication (email OTP, JWT)
- [ ] Daily mood check-in with 30-day trend chart
- [ ] PHQ-9 and GAD-7 validated quiz with severity scoring
- [ ] AI chatbot with crisis detection and escalation
- [ ] Counselor booking system (anonymous + named + crisis types)
- [ ] Psychoeducational resource hub (video + audio + articles)
- [ ] Peer support forum with basic moderation (Tier 1 automated filter)
- [ ] Admin analytics dashboard (aggregate, anonymized)
- [ ] Crisis escalation protocol (all 4 touchpoints)
- [ ] Multi-language UI (English + Hindi minimum for MVP)
- [ ] Counselor dashboard (booking management, calendar, session notes)
- [ ] Security: AES-256, JWT, RBAC, HTTPS, rate limiting

### Should Have (P1) — Complete Product
- [ ] AI-generated 7-day wellness plan
- [ ] PSS-10 and Academic Burnout Scale quizzes
- [ ] Facial emotion detection (browser-based, opt-in)
- [ ] Trained Student Volunteer (TSV) review system for forum
- [ ] Real-time Socket.io chat streaming
- [ ] Push notifications (PWA service worker)
- [ ] All 6 Indian languages
- [ ] WebRTC video consultation
- [ ] Booking reminders (email + push)
- [ ] Resource bookmarking and continue-watching
- [ ] Student data export and account deletion

### Could Have (P2) — Future Enhancement
- [ ] Dark mode
- [ ] Expert video consultation network (paid slots)
- [ ] Multi-institution Super-Admin view
- [ ] ABHA health ID integration
- [ ] WhatsApp/Telegram bot interface
- [ ] Gamification (badges, streaks — visible to student only)
- [ ] Community-submitted resource approval workflow

### Won't Have (v1)
- Native iOS/Android apps
- AI-generated clinical reports
- Direct payment processing (expert consultations)
- Peer-to-peer messaging (only forum posts)

---

## 7. System Design Decisions

### 7.1 Architecture: Modular Monolith (not Microservices)

**Decision:** Single deployable Node.js application with clear module boundaries.

**Reasoning:** 
- Microservices add operational complexity (service discovery, inter-service auth, distributed tracing) that is premature for a capstone/hackathon project
- Modular monolith gives the same code organization benefits while being deployable on a single EC2 instance
- Module boundaries are designed so extraction to microservices is a future option, not a rewrite

**Structure:**
```
server/
├── modules/
│   ├── auth/
│   ├── mood/
│   ├── quiz/
│   ├── chat/
│   ├── booking/
│   ├── resources/
│   ├── forum/
│   ├── wellness/
│   ├── notifications/
│   └── admin/
```

### 7.2 Database: MongoDB (not PostgreSQL)

**Decision:** MongoDB Atlas with Mongoose ODM.

**Reasoning:**
- Mental health data is heterogeneous — quiz schemas differ per instrument, mood logs have optional fields, chat summaries are unstructured
- No complex relational joins needed; data access patterns are document-centric
- MongoDB's TTL indexes natively handle our data retention policies (mood logs auto-delete after 90 days)
- Atlas provides automated backups, monitoring, and India-region hosting out-of-the-box

### 7.3 State Management: Zustand (not Redux)

**Decision:** Zustand for client-side state management.

**Reasoning:**
- Redux is overkill for our UI complexity level
- Zustand requires zero boilerplate, has excellent TypeScript support, and integrates seamlessly with React hooks
- Async state (API calls) handled by TanStack Query (React Query) for caching and revalidation

### 7.4 AI Chatbot: OpenAI API (not self-hosted)

**Decision:** OpenAI GPT-4o-mini via API.

**Reasoning:**
- Self-hosting LLMs (Llama, Mistral) requires GPU infrastructure impractical for a student project
- GPT-4o-mini offers excellent quality at ~$0.15/1M tokens — easily within hackathon budget
- Fine-tuning is NOT used; instead, careful system prompt engineering provides the domain adaptation
- Fallback: pre-scripted rule-based responses for when API is unavailable

### 7.5 Emotion Detection: Client-Side Only

**Decision:** face-api.js running in the browser — zero server-side video processing.

**Reasoning:** This is a hard requirement from a privacy standpoint. Transmitting video to a server — even encrypted — would be a fundamental privacy violation for mental health context. Client-side processing eliminates this risk entirely. A motivated user could inspect network traffic and verify no video is being sent.

---

## 8. Tech Stack (Finalized)

```yaml
# Frontend
framework: React 18 (with Vite bundler)
styling: Tailwind CSS v3
state: Zustand + TanStack Query (React Query)
charts: Recharts
real_time: Socket.io-client
ai_features: face-api.js (TensorFlow.js)
i18n: i18next + react-i18next
pwa: Vite PWA Plugin (workbox)
testing: Vitest + Cypress

# Backend
runtime: Node.js v20 LTS
framework: Express.js v4
real_time: Socket.io v4
auth: jsonwebtoken + bcrypt
validation: Zod
queue: Bull (Redis-backed)
email: Nodemailer + @sendgrid/mail
video: mediasoup (WebRTC SFU)
api_docs: swagger-jsdoc + swagger-ui-express
testing: Jest + Supertest

# Database & Cache
primary_db: MongoDB Atlas v7 (Mongoose ODM)
cache: Redis v7 (AWS ElastiCache)
migrations: migrate-mongo

# AI & ML
chatbot: OpenAI API (gpt-4o-mini)
emotion: face-api.js v0.22 (client-side)

# Infrastructure
compute: AWS EC2 t3.medium
storage: AWS S3 + CloudFront CDN
secrets: AWS Secrets Manager
monitoring: Sentry + Datadog + CloudWatch
ci_cd: GitHub Actions
containers: Docker + Docker Compose

# Security
headers: helmet.js
rate_limiting: express-rate-limit + Redis store
sanitization: express-mongo-sanitize + xss-clean
encryption: crypto (AES-256-GCM, Node.js built-in)
```

---

## 9. Project Structure

```
mindbridge/
├── 📁 client/                          # React Frontend
│   ├── public/
│   │   ├── manifest.json               # PWA manifest
│   │   └── sw.js                       # Service Worker
│   ├── src/
│   │   ├── assets/                     # Images, icons, fonts
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── ui/                     # Base: Button, Input, Card, Modal, Badge
│   │   │   ├── layout/                 # Navbar, Sidebar, Footer, PageWrapper
│   │   │   ├── charts/                 # MoodTrendChart, QuizScoreChart, HeatmapCalendar
│   │   │   ├── chat/                   # ChatWindow, MessageBubble, EmotionGauge
│   │   │   └── forum/                  # PostCard, ReplyThread, CategoryFilter
│   │   ├── pages/                      # Route-level page components
│   │   │   ├── auth/                   # Login, Register, ForgotPassword, Verify
│   │   │   ├── student/                # Dashboard, Mood, Quiz, Resources, Forum, Booking, Plan
│   │   │   ├── counselor/              # CounselorDashboard, Calendar, SessionNotes, Alerts
│   │   │   └── admin/                  # AdminDashboard, Analytics, UserManagement, Content
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useMoodTracker.js
│   │   │   ├── useEmotionDetection.js
│   │   │   ├── useSocket.js
│   │   │   └── useNotifications.js
│   │   ├── stores/                     # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── moodStore.js
│   │   │   └── chatStore.js
│   │   ├── services/                   # API call functions (Axios instances)
│   │   │   ├── api.js                  # Axios base instance with interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── mood.service.js
│   │   │   ├── chat.service.js
│   │   │   ├── booking.service.js
│   │   │   └── resources.service.js
│   │   ├── locales/                    # i18next JSON files
│   │   │   ├── en/, hi/, ta/, te/, kn/, bn/
│   │   ├── utils/                      # Helper functions
│   │   ├── constants/                  # App-wide constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📁 server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── modules/                    # Feature modules (Controller-Service-Route pattern)
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── mood/
│   │   │   ├── quiz/
│   │   │   ├── chat/
│   │   │   ├── booking/
│   │   │   ├── resources/
│   │   │   ├── forum/
│   │   │   ├── wellness/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   ├── models/                     # Mongoose schemas
│   │   │   ├── User.model.js
│   │   │   ├── MoodLog.model.js
│   │   │   ├── QuizResult.model.js
│   │   │   ├── Booking.model.js
│   │   │   ├── Session.model.js
│   │   │   ├── ForumPost.model.js
│   │   │   ├── Resource.model.js
│   │   │   ├── WellnessPlan.model.js
│   │   │   └── Notification.model.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js         # JWT verification
│   │   │   ├── authorize.js            # RBAC role check
│   │   │   ├── rateLimiter.js
│   │   │   ├── errorHandler.js
│   │   │   ├── requestLogger.js
│   │   │   └── sanitize.js
│   │   ├── config/
│   │   │   ├── db.js                   # MongoDB connection
│   │   │   ├── redis.js                # Redis connection
│   │   │   ├── openai.js               # OpenAI client
│   │   │   ├── socket.js               # Socket.io server setup
│   │   │   └── swagger.js              # API docs config
│   │   ├── utils/
│   │   │   ├── encryption.js           # AES-256-GCM encrypt/decrypt
│   │   │   ├── anonymize.js            # PII stripping utilities
│   │   │   ├── crisisDetector.js       # Keyword + ML crisis detection
│   │   │   └── mailer.js               # Email sender utility
│   │   ├── queues/
│   │   │   ├── notificationQueue.js    # Bull queue definition
│   │   │   └── workers/
│   │   │       ├── emailWorker.js
│   │   │       └── pushWorker.js
│   │   ├── sockets/
│   │   │   ├── chat.socket.js
│   │   │   ├── counselor.socket.js
│   │   │   └── forum.socket.js
│   │   └── app.js                      # Express app setup
│   ├── server.js                       # Entry point
│   ├── .env.example
│   └── package.json
│
├── 📁 docs/                            # All documentation
│   ├── FUNCTIONAL_REQUIREMENTS.md      ← You are here
│   ├── NON_FUNCTIONAL_REQUIREMENTS.md  ← You are here
│   ├── PRD.md                          ← You are here
│   ├── TASKS.md                        ← Task execution guide
│   └── api/                            # Swagger YAML files
│
├── 📁 .github/
│   └── workflows/
│       ├── ci.yml                      # Lint + Test + Build
│       └── deploy.yml                  # Deploy to staging/prod
│
├── docker-compose.yml                  # Local dev: Node + MongoDB + Redis
├── docker-compose.prod.yml             # Production overrides
└── README.md
```

---

## 10. Environment Setup — Start Here

> **This section tells every team member exactly how to get the project running on day 1.**

### 10.1 Prerequisites

Install these on your machine before anything else:

```bash
# Required tools
node --version    # Must be v20.x LTS — use nvm to manage
npm --version     # v10+
git --version     # v2.x
docker --version  # Docker Desktop (includes docker-compose)

# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 10.2 Clone & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/mindbridge.git
cd mindbridge

# 2. Start infrastructure services (MongoDB + Redis)
docker-compose up -d
# Verify: MongoDB running on localhost:27017, Redis on localhost:6379

# 3. Setup backend
cd server
cp .env.example .env
# → Edit .env with your values (see Section 10.3)
npm install
npm run dev          # Starts on http://localhost:5000

# 4. Setup frontend (new terminal)
cd ../client
cp .env.example .env
# → Edit .env with your values
npm install
npm run dev          # Starts on http://localhost:5173
```

### 10.3 Environment Variables

**server/.env**
```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/mindbridge
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Encryption
AES_ENCRYPTION_KEY=your_32_byte_hex_key_for_aes_256

# OpenAI
OPENAI_API_KEY=sk-...

# Email
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@mindbridge.app

# Admin seeding
SEED_ADMIN_EMAIL=admin@mindbridge.app
SEED_ADMIN_PASSWORD=ChangeMe_Str0ng!
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=MindBridge
```

### 10.4 Seed Initial Data

```bash
# From server/ directory
npm run seed         # Creates admin account + sample resources + quiz templates
```

### 10.5 Verify Everything Works

```bash
# Backend health check
curl http://localhost:5000/api/health
# Expected: { "status": "ok", "db": "connected", "redis": "connected" }

# Frontend
open http://localhost:5173
# Should see MindBridge landing page
```

### 10.6 VS Code Extensions (Recommended for the Team)

Install these for consistent development:
```
ESLint
Prettier
GitLens
MongoDB for VS Code
REST Client (for testing APIs without Postman)
Thunder Client
Tailwind CSS IntelliSense
```

---

## 11. Development Workflow

### 11.1 Git Branching Strategy (GitHub Flow)

```
main                  → Production-ready code only
  └── staging         → Pre-production integration branch
        └── feature/  → All feature development
        └── fix/      → Bug fixes
        └── docs/     → Documentation only changes
```

### 11.2 Branch Naming Convention

```bash
feature/FR-CHAT-001-chatbot-crisis-detection
feature/FR-MOOD-001-daily-checkin-api
fix/NFR-SEC-005-rate-limiter-not-applying
docs/prd-update-user-stories
```

### 11.3 Commit Message Convention (Conventional Commits)

```bash
feat(chat): add crisis keyword detection layer before LLM call
fix(auth): prevent refresh token reuse after rotation
docs(prd): add environment setup section
test(quiz): add PHQ-9 scoring unit tests
refactor(booking): extract slot validation to service layer
chore(deps): update openai package to 4.28.0
```

### 11.4 Pull Request Process

1. Create feature branch from `staging`
2. Write code + tests
3. Ensure `npm test` passes and `npm run lint` is clean
4. Push and open PR to `staging` (not main)
5. PR must have: description, linked FR/NFR ID, screenshots for UI changes
6. Minimum 1 approval required before merge
7. Squash merge to keep `staging` history clean

### 11.5 Code Review Checklist

Before approving any PR, verify:
- [ ] No secrets or PII in code or logs
- [ ] Input validation present on all new endpoints
- [ ] Auth middleware applied to protected routes
- [ ] Error handling returns consistent JSON format `{ success, message, data }`
- [ ] New features have at least basic unit tests
- [ ] API changes reflected in Swagger docs

---

## 12. API Contract Summary

### 12.1 Standard Response Format

All API responses must follow this shape:

```json
// Success
{
  "success": true,
  "message": "Mood logged successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "moodScore", "message": "Must be between 1 and 10" }
  ]
}
```

### 12.2 Authentication Headers

```http
Authorization: Bearer <access_token>
```

Access token comes from `/api/auth/login` response. Refresh token is stored in HTTP-only cookie automatically.

### 12.3 Key Endpoints at a Glance

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login → returns access token + sets cookie
POST   /api/auth/refresh           Refresh access token using cookie
POST   /api/auth/logout            Clear refresh token cookie

POST   /api/mood/log               Submit daily mood entry
GET    /api/mood/trends            Get mood trend data (last 30/60/90 days)

POST   /api/quiz/submit            Submit quiz answers → get scored result
GET    /api/quiz/history           Get past quiz results

POST   /api/chat/start             Initialize chat session
POST   /api/chat/message           Send message → AI response (streaming)
DELETE /api/chat/end               End session → purge transcript

GET    /api/booking/slots          Available counselor slots
POST   /api/booking/create         Create appointment
PATCH  /api/booking/:id/cancel     Cancel appointment

GET    /api/resources              List/search resources
GET    /api/resources/:id          Get single resource
POST   /api/resources/:id/rate     Rate a resource

GET    /api/forum/posts            List forum posts (paginated)
POST   /api/forum/posts            Create new post
POST   /api/forum/posts/:id/reply  Reply to post

GET    /api/wellness/plan          Get current wellness plan
POST   /api/wellness/generate      Generate new AI wellness plan
PATCH  /api/wellness/activity/:id  Mark activity done/skipped

GET    /api/admin/analytics        Institution aggregate analytics
GET    /api/admin/crisis-alerts    Pending crisis alerts
GET    /api/counselor/dashboard    Counselor summary stats

GET    /api/health                 System health check (public)
```

### 12.4 Socket.io Events

```javascript
// Client emits
socket.emit('chat:message', { sessionId, content })
socket.emit('forum:subscribe', { category })

// Server emits
socket.on('chat:stream', { token })            // Streaming chatbot response
socket.on('chat:done', { sessionId })           // Stream complete
socket.on('counselor:crisis_alert', { alert }) // New crisis booking
socket.on('booking:status_update', { booking }) // Booking confirmed/cancelled
socket.on('forum:new_post', { post })           // New post in subscribed category
```

---

## 13. UI/UX Design Principles

### 13.1 Design Language: Calm & Trustworthy

```
Primary: #2563EB (Calm Blue)
Secondary: #059669 (Wellness Green)
Accent: #7C3AED (Soft Purple — for AI/bot indicators)
Background: #F8FAFC (Near-white, not harsh white)
Text: #111827 (Soft black, not pure black)
Error: #EF4444 | Warning: #F59E0B | Success: #10B981
```

### 13.2 Core UX Rules

1. **Anonymous First** — No feature shall require identity disclosure before the student is ready
2. **No Dark Patterns** — No infinite scroll, no notification badges designed to create anxiety, no manipulative CTAs
3. **Progressive Disclosure** — Show only what's needed now; don't overwhelm with all features at once
4. **Plain Language** — All mental health content reviewed for reading level ≤ Grade 8
5. **Error Empathy** — Errors use supportive language ("Something went wrong — please try again") not blame-language
6. **Mobile First** — Design for smallest screen (360px) first, then scale up
7. **Load States Always** — No feature shall leave users staring at blank space during loading

### 13.3 Navigation Structure

```
Student App:
├── Home (Dashboard: mood + streak + today's plan)
├── Chat (AI Chatbot)
├── Check-In (Mood + Quiz)
├── Learn (Resource Hub)
├── Community (Peer Forum)
├── Book (Counselor Booking)
└── Profile (Settings, History, Language, Privacy)

Counselor App:
├── Dashboard (Stats + Alerts)
├── Schedule (Calendar + Bookings)
├── Sessions (Notes + History)
└── Settings

Admin App:
├── Analytics (Institution Dashboard)
├── Counselors (Account Management)
├── Content (Resource Hub Management)
└── Reports
```

---

## 14. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-01 | OpenAI API latency spikes or outage | Medium | High | Pre-scripted fallback chatbot; circuit breaker pattern |
| R-02 | AI chatbot gives inappropriate response | Low | Critical | Multi-layer filtering, safety system prompt, human-in-loop escalation |
| R-03 | Crisis detection misses a genuine signal (false negative) | Low | Critical | Conservative keyword list, score thresholds, tested by mental health professional |
| R-04 | Student data breach | Very Low | Critical | AES-256 encryption, RBAC, audit logs, penetration testing |
| R-05 | Low student adoption due to stigma | Medium | High | Anonymous-first design, peer forum seeding, institutional awareness campaigns |
| R-06 | Counselor adoption friction | Medium | Medium | Simple calendar UI, training session, dedicated onboarding material |
| R-07 | WebRTC video quality issues on poor connections | High | Medium | Adaptive bitrate, text-based session fallback option |
| R-08 | Regional language translation quality | Medium | Medium | Native speaker review before launch; community correction mechanism |
| R-09 | Database performance degradation at scale | Low | High | MongoDB indexing strategy, Redis caching, pre-defined aggregation pipelines |
| R-10 | Team capacity / scope creep | Medium | High | MoSCoW prioritization, 2-week sprint reviews, strict P0 focus for SIH deadline |

---

## 15. Team Structure & Ownership

| Role | Count | Owns |
|------|-------|------|
| Full-Stack Lead | 1 | Architecture, code reviews, deployment, security |
| Backend Developer | 1-2 | All server modules, DB schema, API, queues |
| Frontend Developer | 1-2 | All React pages, components, state management |
| AI/ML Developer | 1 | Chatbot integration, emotion detection, wellness plan AI |
| UI/UX Designer | 1 | Figma prototypes, design system, content language review |

**Shared responsibilities:** Writing tests for the code you write, updating API docs, writing commit messages properly.

---

## 16. Timeline & Milestones

```
WEEK 1-2: PHASE 1 — Foundation
├── ✅ PRD, FR, NFR finalized
├── ✅ MongoDB schema finalized
├── ✅ API contracts defined (OpenAPI spec)
├── ✅ Figma wireframes for all 3 user roles
├── ✅ GitHub repo + CI pipeline + Docker Compose working
└── ✅ Team agreements: branching, commit style, code review

WEEK 3-5: PHASE 2 — Core Backend
├── Auth module (register, login, OTP, JWT, RBAC)
├── Mood module (log, trends, TTL index)
├── Quiz module (PHQ-9, GAD-7, scoring engine)
├── Booking module (slots, calendar, Bull queue notifications)
├── Resource module (CRUD, S3 upload, search)
└── Forum module (posts, replies, anonymization, Tier 1 filter)

WEEK 6-8: PHASE 3 — Frontend
├── Design system + all base components
├── Auth pages + onboarding flow
├── Student dashboard + mood chart
├── Quiz flow + results page
├── Resource hub + media player
├── Booking calendar + confirmation flow
└── Counselor + Admin dashboards

WEEK 9-10: PHASE 4 — AI & Real-Time Features
├── Chatbot integration + crisis detection
├── Emotion detection module
├── Socket.io: chat streaming, counselor alerts
├── Wellness plan AI generation
├── WebRTC video rooms
├── Push notifications (PWA)
└── Multi-language implementation

WEEK 11-12: PHASE 5 — Polish, Test, Deploy
├── E2E tests (Cypress)
├── Security audit (OWASP ZAP)
├── Load testing (k6)
├── User acceptance testing (10-15 student volunteers)
├── AWS production deployment
├── Monitoring setup (Sentry + Datadog)
└── Final demo prep + documentation
```

---

## 17. Definition of Done

A feature is **Done** only when ALL of the following are true:

- [ ] Code is written and peer-reviewed (PR approved)
- [ ] Unit tests written for all business logic (>80% coverage)
- [ ] Integration test written for all new API endpoints
- [ ] Input validation implemented on backend (Zod schemas)
- [ ] Auth + RBAC middleware applied on all protected routes
- [ ] API endpoint documented in Swagger
- [ ] No secrets or PII in code or logs
- [ ] UI component tested on mobile (360px), tablet (768px), desktop (1280px)
- [ ] Accessibility: tab navigation works, ARIA labels present
- [ ] All 6 language keys added to locale JSON files (content can be placeholder, not blank)
- [ ] Error states handled: API down, empty state, validation error
- [ ] Loading states present for all async operations
- [ ] Code merged to `staging` without breaking existing tests

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | Team MindBridge | Initial complete PRD |
