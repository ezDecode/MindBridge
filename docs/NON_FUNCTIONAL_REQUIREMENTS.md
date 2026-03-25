# ⚙️ Non-Functional Requirements
## MindBridge — Digital Mental Health & Psychological Support Platform
**Project:** Smart India Hackathon 2025 | Problem Statement: SIH25092  
**Version:** 1.0 | **Last Updated:** February 2026  
**Status:** `DRAFT → IN REVIEW`

---

## Table of Contents
1. [Performance](#1-performance)
2. [Scalability](#2-scalability)
3. [Security](#3-security)
4. [Privacy & Data Protection](#4-privacy--data-protection)
5. [Availability & Reliability](#5-availability--reliability)
6. [Usability & Accessibility](#6-usability--accessibility)
7. [Maintainability & Code Quality](#7-maintainability--code-quality)
8. [Compatibility](#8-compatibility)
9. [Localization & Internationalization](#9-localization--internationalization)
10. [Compliance & Legal](#10-compliance--legal)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [AI Safety & Ethics](#12-ai-safety--ethics)

---

## Requirement ID Convention
```
NFR-[CATEGORY]-[NUMBER]
Example: NFR-PERF-001 = Non-Functional Requirement, Performance, Item 001
Priority: P0 = Must Have | P1 = Should Have | P2 = Nice to Have
```

---

## 1. Performance

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-PERF-001 | API response time for standard REST endpoints | P95 ≤ 200ms under normal load | P0 |
| NFR-PERF-002 | API response time for AI chatbot endpoints (LLM call included) | P95 ≤ 3s (streaming starts within 800ms) | P0 |
| NFR-PERF-003 | Page initial load time (Time to Interactive) | ≤ 3 seconds on a 4G connection (10 Mbps) | P0 |
| NFR-PERF-004 | Lighthouse Performance Score | ≥ 80 on mobile, ≥ 90 on desktop | P1 |
| NFR-PERF-005 | Emotion detection frame processing (client-side) | ≤ 100ms per frame on mid-range Android (Snapdragon 665+) | P1 |
| NFR-PERF-006 | MongoDB aggregate queries for admin analytics | ≤ 500ms for 90-day institution-wide reports | P1 |
| NFR-PERF-007 | Socket.io message delivery latency | ≤ 50ms within same region (AWS ap-south-1) | P0 |
| NFR-PERF-008 | Booking slot availability query | ≤ 150ms for fetching 30-day calendar view | P0 |
| NFR-PERF-009 | Resource hub search results | ≤ 300ms for full-text search across resource library | P1 |
| NFR-PERF-010 | File uploads for resource content (admin) | Support files up to 500MB; chunked upload with progress indicator | P1 |

---

## 2. Scalability

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-SCALE-001 | Concurrent user support — MVP (Pilot) | 500 concurrent users without degradation | P0 |
| NFR-SCALE-002 | Concurrent user support — Phase 2 | 5,000 concurrent users with horizontal scaling | P1 |
| NFR-SCALE-003 | Registered users per institution | Up to 15,000 students per institution | P0 |
| NFR-SCALE-004 | Multi-tenant architecture | Platform shall support up to 50 institutions with complete data isolation | P1 |
| NFR-SCALE-005 | Database horizontal scaling | MongoDB schema shall support sharding by institution ID when load demands | P1 |
| NFR-SCALE-006 | Auto-scaling policy | AWS EC2 Auto Scaling shall trigger at >70% CPU for 5 consecutive minutes; scale in at <30% for 15 minutes | P1 |
| NFR-SCALE-007 | Redis cache hit ratio | ≥ 85% for session data and frequently accessed user profiles | P1 |
| NFR-SCALE-008 | Notification queue throughput | Bull queue shall process ≥ 10,000 notification jobs/hour without backlog | P1 |
| NFR-SCALE-009 | Static asset delivery | CDN (CloudFront) shall serve all static assets; origin load < 5% of total requests | P1 |

---

## 3. Security

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-SEC-001 | All data in transit shall be encrypted using TLS 1.3; TLS 1.0/1.1 shall be disabled | Verified via SSL Labs score ≥ A | P0 |
| NFR-SEC-002 | All sensitive data at rest (session notes, quiz results, mood logs) shall use AES-256 encryption | MongoDB field-level encryption for Highly Sensitive class | P0 |
| NFR-SEC-003 | Passwords shall be hashed using bcrypt with a minimum cost factor of 12 | No plaintext or reversible passwords stored | P0 |
| NFR-SEC-004 | The system shall implement RBAC with principle of least privilege — every action validated server-side | No client-side access control decisions trusted | P0 |
| NFR-SEC-005 | Rate limiting shall be enforced: 100 requests/minute per IP (unauthenticated), 1,000/minute per authenticated user | HTTP 429 returned on violation | P0 |
| NFR-SEC-006 | All user inputs shall be sanitized and validated server-side to prevent injection attacks (NoSQL injection, XSS) | Zero tolerance for injection vulnerabilities | P0 |
| NFR-SEC-007 | CSRF protection shall be implemented for all state-mutating endpoints | Double Submit Cookie pattern | P0 |
| NFR-SEC-008 | HTTP security headers shall be set: `Content-Security-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff` | Verified via securityheaders.com score A+ | P0 |
| NFR-SEC-009 | JWT tokens shall be stored in HTTP-only, Secure, SameSite=Strict cookies — never in localStorage | Zero client-side token storage | P0 |
| NFR-SEC-010 | A full security audit (OWASP ZAP automated + manual penetration test) shall be completed before go-live | Zero P0/P1 OWASP vulnerabilities open at launch | P0 |
| NFR-SEC-011 | All third-party dependencies shall be scanned with `npm audit` in CI pipeline; builds shall fail on Critical/High CVEs | Automated via GitHub Actions | P0 |
| NFR-SEC-012 | Database credentials, API keys, and secrets shall be managed via environment variables and AWS Secrets Manager — never hardcoded | Zero secrets in git history | P0 |
| NFR-SEC-013 | Intrusion Detection: Failed login attempts, anomalous data access patterns, and unusual API volumes shall trigger Sentry/Datadog alerts | Alert within 60 seconds of detection | P1 |
| NFR-SEC-014 | WebRTC video sessions shall use SRTP for media encryption and DTLS for key exchange | No unencrypted media streams | P0 |

---

## 4. Privacy & Data Protection

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-PRIV-001 | The system shall implement **Privacy by Design** — anonymization is architectural, not an afterthought | Pseudonymous IDs used for all behavioral data from Day 1 | P0 |
| NFR-PRIV-002 | No student PII (name, email, phone) shall appear in analytics, logs, queue jobs, or error reporting | Verified via data flow audit | P0 |
| NFR-PRIV-003 | Mood logs, quiz results, and chat summaries shall be stored against pseudonymous IDs only | PII-to-pseudoID mapping stored in encrypted, separately accessed collection | P0 |
| NFR-PRIV-004 | k-anonymity enforcement: Admin analytics shall not display metrics with fewer than 10 contributing individuals | Enforced in all MongoDB aggregate pipelines | P0 |
| NFR-PRIV-005 | Facial emotion detection shall operate entirely client-side with zero server-side video processing | Verified by network traffic analysis (zero media packets to server) | P0 |
| NFR-PRIV-006 | Students shall have the right to: view their data, export their data (JSON), and permanently delete their account | Self-service from profile settings page | P1 |
| NFR-PRIV-007 | Data retention policies shall be enforced automatically: raw mood logs → 90 days, session summaries → 2 years, chat sessions → deleted on session end | Automated via scheduled MongoDB TTL indexes | P0 |
| NFR-PRIV-008 | All data shall be stored on AWS servers located in India (ap-south-1 region) only — no cross-border data transfer | Compliant with Indian DPDP Act 2023 | P0 |
| NFR-PRIV-009 | A clear, plain-language Privacy Policy and Terms of Service shall be presented at registration with explicit opt-in consent | Consent stored with timestamp and version | P0 |
| NFR-PRIV-010 | Application error logs (Sentry) shall strip all PII before transmission using Sentry's `beforeSend` hook | Verified by inspecting Sentry payloads in staging | P0 |

---

## 5. Availability & Reliability

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-AVAIL-001 | System uptime target | ≥ 99.5% monthly uptime (excluding scheduled maintenance) | P0 |
| NFR-AVAIL-002 | Scheduled maintenance windows | Maximum 2 hours/month; notified 48 hours in advance | P1 |
| NFR-AVAIL-003 | Crisis escalation features shall have higher availability target | ≥ 99.9% — crisis notifications shall never be lost | P0 |
| NFR-AVAIL-004 | Failed notification jobs shall be retried 3 times with exponential backoff before being moved to dead-letter queue | Verified via Bull queue monitoring | P0 |
| NFR-AVAIL-005 | Database backups shall be automated daily; point-in-time recovery shall be available for ≥ 7 days | MongoDB Atlas automated backup policy | P0 |
| NFR-AVAIL-006 | Disaster recovery: system shall be recoverable to last-known-good state within 4 hours of critical failure | RTO ≤ 4 hours, RPO ≤ 24 hours | P1 |
| NFR-AVAIL-007 | Graceful degradation: if OpenAI API is unavailable, chatbot shall switch to a pre-scripted rule-based fallback mode — not return an error | Transparent fallback visible to users | P0 |
| NFR-AVAIL-008 | Graceful degradation: if face-api.js fails to load, the emotion detection widget shall hide silently — not block the chatbot UI | Zero dependency blocking | P0 |
| NFR-AVAIL-009 | Circuit breaker pattern shall be implemented for all external API calls (OpenAI, SendGrid, WebRTC signaling) | Hystrix-style breaker via `opossum` npm package | P1 |

---

## 6. Usability & Accessibility

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-UX-001 | The UI shall follow a calming, non-clinical design language: soft colors (blue, green, off-white), rounded corners, generous whitespace | User testing: ≥ 80% rating "comfortable" or "welcoming" | P0 |
| NFR-UX-002 | Mobile-first responsive design; all features fully functional on screens ≥ 360px width | Tested on iPhone SE, Pixel 4a, Galaxy A series | P0 |
| NFR-UX-003 | Progressive Web App (PWA) support: installable to home screen, offline mood check-in with sync on reconnect | Lighthouse PWA score ≥ 90 | P1 |
| NFR-UX-004 | WCAG 2.1 Level AA compliance: keyboard navigation, screen reader compatibility (NVDA, VoiceOver), sufficient color contrast (≥ 4.5:1) | Audited via axe-core + manual review | P1 |
| NFR-UX-005 | Student onboarding shall be completable in ≤ 3 minutes for a first-time user | Measured in user acceptance testing | P0 |
| NFR-UX-006 | All error messages shall be written in plain, non-technical language with clear resolution steps | No raw HTTP status codes or stack traces shown to users | P0 |
| NFR-UX-007 | Loading states shall be shown for all async operations; no blank screens during data fetch | Skeleton loaders or spinner for all async UI states | P0 |
| NFR-UX-008 | Dark mode support | Optional toggle in settings | P2 |
| NFR-UX-009 | The platform shall not use design patterns that exploit compulsive behavior: no infinite scroll, no notification count badges that create anxiety | Design review checkpoint | P1 |

---

## 7. Maintainability & Code Quality

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-MAINT-001 | Codebase shall be modular — backend separated into: routes, controllers, services, models, middleware, utils | No monolithic files >400 lines | P0 |
| NFR-MAINT-002 | All code shall follow ESLint (Airbnb config) + Prettier formatting rules — enforced via Husky pre-commit hooks | 0 lint errors on `main` branch | P0 |
| NFR-MAINT-003 | Backend unit test coverage | ≥ 80% line coverage (Jest) | P1 |
| NFR-MAINT-004 | API documentation shall be auto-generated and kept up-to-date via Swagger (OpenAPI 3.0) | Accessible at `/api/docs` on staging | P1 |
| NFR-MAINT-005 | Secrets and configuration shall be managed via `.env` files (with `.env.example` committed) and AWS Secrets Manager in production | Zero secrets in source code | P0 |
| NFR-MAINT-006 | All dependencies shall be pinned to exact versions in `package-lock.json` and updated via Dependabot | Monthly automated dependency review | P1 |
| NFR-MAINT-007 | A `CONTRIBUTING.md` guide, `README.md`, and component-level JSDoc comments shall be maintained | Documentation kept current with code changes | P1 |
| NFR-MAINT-008 | Database migrations shall be scripted (using `migrate-mongo`) and version-controlled — no manual DB changes in production | Every schema change has a corresponding migration script | P0 |
| NFR-MAINT-009 | CI/CD pipeline via GitHub Actions shall run: lint → unit tests → build → integration tests → deploy to staging | No deployment without passing all gates | P0 |

---

## 8. Compatibility

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-COMPAT-001 | Browser support: Chrome ≥ 90, Firefox ≥ 88, Safari ≥ 14, Edge ≥ 90 | Tested on BrowserStack | P0 |
| NFR-COMPAT-002 | Mobile browser: Chrome for Android, Safari for iOS — all features functional | Tested on iOS 15+ and Android 10+ | P0 |
| NFR-COMPAT-003 | WebRTC video shall work without plugins on all supported browsers | Tested using WebRTC diagnostics | P0 |
| NFR-COMPAT-004 | Face emotion detection shall fail gracefully on browsers without getUserMedia support (IE, old Samsung Internet) | Feature hidden, not broken, on unsupported browsers | P0 |
| NFR-COMPAT-005 | The application shall function correctly on minimum 2GB RAM devices | Profiled on Snapdragon 450/Helio P22 class devices | P1 |

---

## 9. Localization & Internationalization

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-L10N-001 | The UI shall support 6 languages via `i18next`: English, Hindi, Tamil, Telugu, Kannada, Bengali | All static UI strings externalized to JSON locale files | P0 |
| NFR-L10N-002 | Language selection shall be available at onboarding and changeable anytime from settings | Language preference stored in user profile | P0 |
| NFR-L10N-003 | Date and time formats shall adapt to locale (DD/MM/YYYY for India) | Handled via `date-fns` locale support | P0 |
| NFR-L10N-004 | All quiz instruments (PHQ-9, GAD-7, PSS-10) shall have professionally translated and culturally reviewed versions in all 6 languages | Translation reviewed by native-speaking mental health professional | P0 |
| NFR-L10N-005 | Right-to-Left (RTL) language support is not required for initial release but shall be architecturally possible (i18next + CSS logical properties) | No RTL content in v1 | P2 |

---

## 10. Compliance & Legal

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-COMP-001 | **Indian Digital Personal Data Protection Act (DPDP) 2023**: Consent management, data localization in India, grievance officer designation | Compliance checklist signed off by legal review | P0 |
| NFR-COMP-002 | **Indian IT Act 2000 (Section 43A)**: Reasonable security practices for sensitive personal data | Security audit documentation maintained | P0 |
| NFR-COMP-003 | **GDPR Principles** (where applicable for international users): Data minimization, purpose limitation, right to erasure | Applied as best-practice baseline | P1 |
| NFR-COMP-004 | **OWASP Top-10 2023**: All listed vulnerabilities addressed and verified before launch | OWASP ZAP scan report with zero Critical/High open issues | P0 |
| NFR-COMP-005 | Platform shall NOT store, sell, or share any student data with third-party advertisers under any circumstance | Contractual and technical guarantee | P0 |
| NFR-COMP-006 | A clear disclaimer shall be displayed stating the platform is a support tool, not a medical device, and does not replace clinical diagnosis | On landing page, at chatbot start, on quiz results page | P0 |
| NFR-COMP-007 | Mental health crisis response shall align with clinical guidelines from NIMHANS and WHO mhGAP protocols | Content reviewed by licensed mental health professional | P0 |

---

## 11. Monitoring & Observability

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-OBS-001 | Application errors shall be tracked via Sentry with source maps for React and Node.js | Alert on new error with ≥ 5 occurrences/hour | P0 |
| NFR-OBS-002 | Application performance (APM) shall be monitored via Datadog: request traces, database query times, external API latency | P95 latency dashboards reviewed weekly | P1 |
| NFR-OBS-003 | Infrastructure metrics (CPU, RAM, network, disk) via AWS CloudWatch | Alert when CPU > 80% for 5 minutes | P0 |
| NFR-OBS-004 | All API requests shall be logged with: timestamp, method, path, status code, response time, and anonymized user ID | No PII in logs | P0 |
| NFR-OBS-005 | Bull queue health: job completion rates, failure rates, queue depth monitored via Bull Board UI (admin-only) | Alert when queue depth > 1,000 unprocessed jobs | P1 |
| NFR-OBS-006 | Uptime monitoring via AWS Route53 health checks with 1-minute check interval | PagerDuty alert on downtime ≥ 2 minutes | P1 |
| NFR-OBS-007 | OpenAI API usage and cost shall be monitored with daily budget alerts | Alert when 80% of monthly AI budget consumed | P1 |

---

## 12. AI Safety & Ethics

| ID | Requirement | Metric / Target | Priority |
|----|-------------|-----------------|----------|
| NFR-AI-001 | The AI chatbot shall NEVER provide specific methods of self-harm or suicide, even when directly asked | Post-generation safety filter with zero tolerance policy | P0 |
| NFR-AI-002 | The chatbot shall NEVER diagnose a mental health condition — it may describe symptoms but must always recommend professional evaluation | Enforced via system prompt hard rules | P0 |
| NFR-AI-003 | The chatbot shall NEVER recommend specific medications, dosages, or over-the-counter combinations for mental health symptoms | Enforced via system prompt and output filter | P0 |
| NFR-AI-004 | Crisis keyword list shall be curated with input from a licensed mental health professional and reviewed quarterly | Crisis detection false-negative rate target: 0% | P0 |
| NFR-AI-005 | All chatbot response quality shall be evaluable via thumbs-up/down feedback; feedback reviewed monthly by a counselor | Feedback loop → prompt improvement cycle | P1 |
| NFR-AI-006 | Emotion detection outputs shall never be used to make automated decisions (e.g., auto-flagging a student to admin based on facial expression alone) — human counselor always in the loop | Design constraint enforced at architecture level | P0 |
| NFR-AI-007 | The platform shall be transparent with students about where AI is used vs. where humans are involved | AI interactions clearly labelled in UI | P0 |
| NFR-AI-008 | Adversarial testing: before launch, 20+ crisis and harmful request scenarios shall be tested against the chatbot | 100% handled correctly before go-live | P0 |
| NFR-AI-009 | AI-generated wellness plans shall include a disclaimer that they are suggestions, not clinical prescriptions | Always shown below generated plan | P0 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | Team MindBridge | Initial draft |
