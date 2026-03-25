# 📋 Functional Requirements
## MindBridge — Digital Mental Health & Psychological Support Platform
**Project:** Smart India Hackathon 2025 | Problem Statement: SIH25092  
**Version:** 1.0 | **Last Updated:** February 2026  
**Status:** `DRAFT → IN REVIEW`

---

## Table of Contents
1. [User Roles & Access](#1-user-roles--access)
2. [Authentication & Onboarding](#2-authentication--onboarding)
3. [AI Chatbot — First-Aid Support](#3-ai-chatbot--first-aid-support)
4. [Facial Emotion Detection](#4-facial-emotion-detection)
5. [Psychometric Screening & Quiz Engine](#5-psychometric-screening--quiz-engine)
6. [Mood Tracking & Progress Dashboard](#6-mood-tracking--progress-dashboard)
7. [Confidential Counselor Booking System](#7-confidential-counselor-booking-system)
8. [Psychoeducational Resource Hub](#8-psychoeducational-resource-hub)
9. [Peer Support Platform](#9-peer-support-platform)
10. [Daily Wellness Plan](#10-daily-wellness-plan)
11. [Notifications & Alerts](#11-notifications--alerts)
12. [Expert Video Consultation](#12-expert-video-consultation)
13. [Counselor Module](#13-counselor-module)
14. [Admin Analytics Dashboard](#14-admin-analytics-dashboard)
15. [Crisis Escalation Protocol](#15-crisis-escalation-protocol)

---

## Requirement ID Convention
```
FR-[MODULE]-[NUMBER]
Example: FR-AUTH-001 = Functional Requirement, Auth Module, Item 001
Priority: P0 = Must Have | P1 = Should Have | P2 = Nice to Have
```

---

## 1. User Roles & Access

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ROLE-001 | The system shall support three distinct user roles: **Student**, **Counselor**, and **Admin** | P0 |
| FR-ROLE-002 | Each role shall have a completely separate dashboard, navigation, and permission set | P0 |
| FR-ROLE-003 | A **Super-Admin** role shall exist for managing multiple institutions | P1 |
| FR-ROLE-004 | Role assignment shall be done at registration (Student) or by Admin (Counselor/Admin) | P0 |
| FR-ROLE-005 | A student shall not be able to view any other student's data under any circumstance | P0 |
| FR-ROLE-006 | Counselors shall only access the data of students who have explicitly booked sessions with them | P0 |

---

## 2. Authentication & Onboarding

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-001 | The system shall allow students to register using their institution-issued email address | P0 |
| FR-AUTH-002 | Registration shall require email OTP verification before account activation | P0 |
| FR-AUTH-003 | The system shall support login with email + password (bcrypt-hashed, min 8 chars) | P0 |
| FR-AUTH-004 | The system shall issue JWT access tokens (15-minute expiry) and HTTP-only refresh tokens (7-day expiry) | P0 |
| FR-AUTH-005 | The system shall support "Forgot Password" via email OTP reset link (valid 30 minutes) | P0 |
| FR-AUTH-006 | After login, students shall complete a one-time onboarding: language preference, notification settings, and optional camera consent | P0 |
| FR-AUTH-007 | The system shall enforce account lockout after 5 consecutive failed login attempts (unlock via email) | P1 |
| FR-AUTH-008 | The system shall allow students to delete their account and all associated data within 30 days | P1 |
| FR-AUTH-009 | A student's pseudonymous ID (different from user ID) shall be auto-generated at registration for use in all behavioral data | P0 |
| FR-AUTH-010 | Counselor and Admin accounts shall only be created by an institution Admin — not via self-registration | P0 |

---

## 3. AI Chatbot — First-Aid Support

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CHAT-001 | The system shall provide an AI-powered chatbot as the primary entry point for mental health support | P0 |
| FR-CHAT-002 | The chatbot shall maintain multi-turn conversation context for the duration of a session | P0 |
| FR-CHAT-003 | The chatbot shall support conversations in: English, Hindi, Tamil, Telugu, Kannada, and Bengali | P0 |
| FR-CHAT-004 | The chatbot shall offer evidence-based coping strategies: deep breathing, grounding (5-4-3-2-1), cognitive reframing, journaling prompts | P0 |
| FR-CHAT-005 | The chatbot shall implement a **multi-layer crisis detection system** that runs BEFORE the LLM response | P0 |
| FR-CHAT-006 | When crisis keywords are detected, the chatbot shall immediately surface: (a) crisis helpline numbers, (b) counselor booking link, (c) emergency contact option — without waiting for LLM output | P0 |
| FR-CHAT-007 | The chatbot shall display a clear disclaimer: *"I am not a therapist. This is not medical advice."* at session start and after any health-related response | P0 |
| FR-CHAT-008 | Full chat transcripts shall NOT be persisted. Only anonymized session summaries (topic category + mood rating) shall be stored | P0 |
| FR-CHAT-009 | The chatbot shall suggest related resources from the Resource Hub based on conversation topics | P1 |
| FR-CHAT-010 | The chatbot shall prompt the student to book a counselor session after 3+ consecutive distress-signaling sessions | P1 |
| FR-CHAT-011 | A student shall be able to rate the chatbot response (helpful / not helpful) with optional text feedback | P1 |
| FR-CHAT-012 | The chatbot shall stream responses token-by-token to simulate natural conversation pace | P1 |
| FR-CHAT-013 | The chatbot shall have a configurable response length cap (150-200 words per turn) enforced at the system prompt level | P0 |

---

## 4. Facial Emotion Detection

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FACE-001 | The system shall offer an opt-in facial emotion detection feature using the device camera | P1 |
| FR-FACE-002 | All face processing shall occur entirely in the browser (client-side via TensorFlow.js). No video frames shall be transmitted to the server | P0 |
| FR-FACE-003 | Emotion detection shall classify 7 states: happy, sad, angry, fearful, disgusted, surprised, neutral | P1 |
| FR-FACE-004 | The detected emotion shall be displayed to the student as a real-time gauge widget during chatbot sessions | P1 |
| FR-FACE-005 | With student consent, weekly aggregated emotion trends (not raw data) shall be added to the mood dashboard | P2 |
| FR-FACE-006 | Camera access shall require browser-level permission confirmation each session — it shall NOT be silently reactivated | P0 |
| FR-FACE-007 | A student can revoke emotion detection consent at any time from settings, immediately stopping all analysis | P0 |
| FR-FACE-008 | The feature shall gracefully degrade (hide) when camera is unavailable or permission is denied | P0 |
| FR-FACE-009 | Processing shall be throttled to 1 frame per 2 seconds using `requestIdleCallback` to prevent UI lag | P1 |

---

## 5. Psychometric Screening & Quiz Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-QUIZ-001 | The system shall include the following validated instruments: PHQ-9 (depression), GAD-7 (anxiety), PSS-10 (perceived stress), and a custom Academic Burnout Scale | P0 |
| FR-QUIZ-002 | Quiz items shall be displayed one at a time on a card-style UI with a clear progress indicator | P0 |
| FR-QUIZ-003 | Answers shall use validated Likert scales matching each instrument's original design | P0 |
| FR-QUIZ-004 | Upon completion, the system shall instantly calculate and display the score with severity label (e.g., PHQ-9: Score 14 → "Moderate Depression") | P0 |
| FR-QUIZ-005 | Quiz results shall be stored against the student's pseudonymous ID (never their email or name) | P0 |
| FR-QUIZ-006 | Students shall be prompted (not forced) to retake quizzes every 2 weeks to track trends | P1 |
| FR-QUIZ-007 | If a PHQ-9 score is ≥ 15 or GAD-7 score is ≥ 15, the system shall immediately display crisis resources and offer to connect with a counselor | P0 |
| FR-QUIZ-008 | Historical quiz scores shall be displayed as a time-series line chart on the student dashboard | P1 |
| FR-QUIZ-009 | Each quiz shall have a help tooltip explaining what the instrument measures and why it matters | P2 |
| FR-QUIZ-010 | Quiz results shall feed automatically into the AI Wellness Plan generator | P0 |
| FR-QUIZ-011 | All quiz instruments shall be available in all 6 supported languages | P1 |

---

## 6. Mood Tracking & Progress Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MOOD-001 | The system shall present a daily mood check-in: a 1-10 slider with emoji labels and an optional free-text note | P0 |
| FR-MOOD-002 | Morning check-in (default 9 AM, adjustable) shall be triggered via push notification on days with no login | P1 |
| FR-MOOD-003 | Evening reflection (default 9 PM) shall present 3 guided journaling prompts from the active wellness plan | P1 |
| FR-MOOD-004 | The student dashboard shall show: 7-day mood trend line chart, 30-day average, longest check-in streak, and a mood heatmap calendar (GitHub-style) | P0 |
| FR-MOOD-005 | Mood scores shall be stored with timestamp and pseudonymous ID only — never with name or email | P0 |
| FR-MOOD-006 | The dashboard shall display a "You've improved X points over 4 weeks" positive reinforcement message when trend is upward | P2 |
| FR-MOOD-007 | Raw mood log data older than 90 days shall be automatically aggregated into monthly averages and raw entries deleted | P1 |
| FR-MOOD-008 | A student shall be able to view, export, and delete their own mood history from the dashboard | P1 |

---

## 7. Confidential Counselor Booking System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BOOK-001 | Students shall be able to browse available counselor time slots without needing to reveal their identity | P0 |
| FR-BOOK-002 | Booking shall support 3 session types: **Anonymous Check-in** (pseudonymous), **Named Consultation** (student reveals identity), **Crisis Session** (instant priority alert) | P0 |
| FR-BOOK-003 | Students shall be able to include an optional anonymous description of their concern at booking | P0 |
| FR-BOOK-004 | Booking confirmation shall trigger: (a) email to student, (b) calendar event for counselor, (c) in-app notification to both | P0 |
| FR-BOOK-005 | Automated reminders shall be sent 1 hour and 15 minutes before a scheduled session | P0 |
| FR-BOOK-006 | Students shall be able to cancel or reschedule bookings up to 2 hours before the session | P1 |
| FR-BOOK-007 | A waitlist system shall be available when all counselor slots are full, with automatic notification when a slot opens | P1 |
| FR-BOOK-008 | Crisis Session bookings (urgency = high) shall immediately push an alert to all online counselors via Socket.io | P0 |
| FR-BOOK-009 | At session time, both parties shall receive a WebRTC room link auto-generated with a session-scoped token | P0 |
| FR-BOOK-010 | Post-session, students shall be prompted for an anonymous feedback rating (1-5 stars + optional comment) | P1 |
| FR-BOOK-011 | A student shall be able to view their full booking history (past and upcoming) in their dashboard | P1 |

---

## 8. Psychoeducational Resource Hub

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RES-001 | The resource hub shall contain three content types: **Videos**, **Audio** (relaxation/guided meditation), and **Written Guides** (PDF/article) | P0 |
| FR-RES-002 | All content shall be tagged by: topic (anxiety, depression, sleep, relationships, academic stress, grief), content type, language, and duration/length | P0 |
| FR-RES-003 | Students shall be able to filter resources by tag, language, type, and search by keyword | P0 |
| FR-RES-004 | Content shall be available in 6 languages: English, Hindi, Tamil, Telugu, Kannada, Bengali | P0 |
| FR-RES-005 | Students shall be able to bookmark resources for later access in a "Saved" section | P1 |
| FR-RES-006 | Video and audio content shall support: play/pause, seek, playback speed (0.75x, 1x, 1.25x, 1.5x), and volume control | P0 |
| FR-RES-007 | A "Continue Watching" feature shall remember playback position for videos and audio | P1 |
| FR-RES-008 | Counselors and Admins shall be able to add, edit, and remove resources through a content management interface | P0 |
| FR-RES-009 | New resources submitted by counselors shall require Admin approval before appearing in the public hub | P1 |
| FR-RES-010 | The chatbot shall recommend relevant resources based on conversation context (linked by topic tags) | P1 |
| FR-RES-011 | Each resource shall display: view count, average rating (1-5 stars from students), and language badges | P2 |

---

## 9. Peer Support Platform

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PEER-001 | The peer forum shall support pseudonymous posting — students select an anonymous handle at onboarding | P0 |
| FR-PEER-002 | Posts shall be organized into topic categories: Exam Stress, Loneliness, Family Pressure, Grief, Relationships, General Wellness | P0 |
| FR-PEER-003 | Students shall be able to create posts, reply to posts, and upvote helpful replies | P0 |
| FR-PEER-004 | All posts shall pass through a Tier 1 automated filter (keyword + ML classifier) before publishing | P0 |
| FR-PEER-005 | Flagged posts shall enter a **Trained Student Volunteer (TSV)** review queue — TSV must review within 4 hours | P0 |
| FR-PEER-006 | TSVs shall have access to: approve post, remove post, or escalate to counselor | P0 |
| FR-PEER-007 | Counselor-escalated posts shall trigger a private, anonymous outreach message to the posting student | P0 |
| FR-PEER-008 | Posts containing confirmed crisis signals shall be auto-removed from public view and escalated to counselors immediately — before TSV review | P0 |
| FR-PEER-009 | Students shall be able to report any post or reply with a reason — this feeds into the TSV queue | P0 |
| FR-PEER-010 | A TSV onboarding module (mini-course) on active listening and crisis escalation protocols shall be built into the platform | P1 |
| FR-PEER-011 | Counselors shall be able to "pin" verified helpful resources or replies to the top of relevant threads | P1 |
| FR-PEER-012 | Real names and emails shall never appear in the forum. PII detection shall auto-redact such content before publishing | P0 |

---

## 10. Daily Wellness Plan

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PLAN-001 | After first quiz completion, the system shall automatically generate a 7-day personalized wellness plan via AI | P0 |
| FR-PLAN-002 | Each day in the plan shall include: morning intention, 1 CBT/mindfulness activity, 1 physical activity suggestion, evening reflection prompt | P0 |
| FR-PLAN-003 | Activities shall be tailored to the student's assessed severity level (e.g., low-energy activities for high depression scores) | P0 |
| FR-PLAN-004 | Students shall be able to mark each activity as Done / Skipped, and view daily completion percentage | P0 |
| FR-PLAN-005 | The plan shall auto-regenerate every 7 days, optionally incorporating student feedback on the previous week | P1 |
| FR-PLAN-006 | A student may manually request plan regeneration at any point | P1 |
| FR-PLAN-007 | The plan shall link directly to relevant resources in the Resource Hub for each activity | P1 |
| FR-PLAN-008 | Completion streaks shall be tracked and displayed as non-competitive private badges in the student's profile | P2 |

---

## 11. Notifications & Alerts

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOTIF-001 | The system shall support push notifications via Web Push API (PWA service worker) | P0 |
| FR-NOTIF-002 | The system shall support email notifications via Nodemailer + SendGrid as a fallback | P0 |
| FR-NOTIF-003 | Notification types: Daily mood check-in reminder, Quiz retake prompt, Booking confirmation/reminder, Wellness plan activity reminder, Crisis escalation alert (counselors), TSV review pending alert (TSVs) | P0 |
| FR-NOTIF-004 | Students shall be able to customize notification frequency and type from their settings page | P1 |
| FR-NOTIF-005 | The system shall never send notifications during exam blackout periods (institution-defined dates set by Admin) | P1 |
| FR-NOTIF-006 | All notification jobs shall be handled via Bull queue with Redis — failed jobs shall retry 3 times with exponential backoff | P0 |
| FR-NOTIF-007 | Counselors shall receive real-time alerts via Socket.io for: new Crisis bookings, TSV-escalated forum posts, session starting in 15 minutes | P0 |

---

## 12. Expert Video Consultation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-VIDEO-001 | The system shall support scheduled video consultations between students and verified mental health professionals (external to campus counselors) | P1 |
| FR-VIDEO-002 | Video sessions shall be conducted via browser-based WebRTC — no third-party app (Zoom, Meet) download required | P1 |
| FR-VIDEO-003 | Session rooms shall be generated with a unique, expiring token valid only for the scheduled 90-minute window | P1 |
| FR-VIDEO-004 | Video sessions shall be end-to-end encrypted (SRTP) — no server-side recording shall occur | P0 |
| FR-VIDEO-005 | Institutions (via Admin) shall be able to pre-purchase consultation credit packages for student distribution | P2 |
| FR-VIDEO-006 | Students shall receive a post-session summary from the professional (text only, opt-in, deleted after 30 days) | P2 |

---

## 13. Counselor Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-COUN-001 | Counselors shall have a dedicated dashboard showing: upcoming sessions, pending bookings, crisis alerts, recent TSV escalations | P0 |
| FR-COUN-002 | Counselors shall be able to manage their availability calendar: set available slots, block dates, set session duration (30/45/60 min) | P0 |
| FR-COUN-003 | Counselors shall be able to add encrypted session notes after each consultation — visible only to themselves | P0 |
| FR-COUN-004 | Counselors shall be able to flag a student case as Priority or Crisis, triggering a different care pathway | P0 |
| FR-COUN-005 | Counselors shall see anonymized mood trend summaries for students who have booked Named Consultations (not for Anonymous sessions) | P1 |
| FR-COUN-006 | Counselors shall receive session feedback ratings aggregated monthly (not per-session to prevent gaming) | P2 |
| FR-COUN-007 | A counselor shall be able to refer a student to an external expert with a direct in-platform referral message | P1 |

---

## 14. Admin Analytics Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADMIN-001 | Admins shall see an institution-level dashboard with: aggregate mood trends, quiz severity distribution, booking utilization, resource engagement, forum activity | P0 |
| FR-ADMIN-002 | All analytics shall be fully anonymized — no individual student data shall be visible to Admins | P0 |
| FR-ADMIN-003 | k-anonymity shall be enforced: no metric shall be shown if the underlying group has fewer than 10 students | P0 |
| FR-ADMIN-004 | Admins shall be able to identify high-risk time periods (e.g., pre-exam weeks) from the crisis flag trend chart | P0 |
| FR-ADMIN-005 | Admins shall be able to manage counselor accounts: create, deactivate, reset password, assign departments | P0 |
| FR-ADMIN-006 | Admins shall be able to set institution-wide exam blackout dates for notification suppression | P1 |
| FR-ADMIN-007 | Admins shall be able to generate and export anonymized PDF/CSV reports for review committees | P1 |
| FR-ADMIN-008 | Admins shall be able to manage the Resource Hub: approve/reject counselor-submitted content | P0 |
| FR-ADMIN-009 | Multi-institution Super-Admins shall see cross-institution aggregate analytics with institution-level breakdowns | P2 |

---

## 15. Crisis Escalation Protocol

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CRIS-001 | Crisis detection shall be implemented at 4 touchpoints: Chatbot messages, Quiz score thresholds, Forum posts, Mood check-in (score ≤ 2 for 3 consecutive days) | P0 |
| FR-CRIS-002 | Crisis keyword list shall be maintained as a configurable list by the platform (not hardcoded) — updatable without code deploy | P0 |
| FR-CRIS-003 | Upon crisis detection, the student shall immediately see: iCall helpline (9152987821), Vandrevala Foundation (1860-2662-345), and a "Talk to a Counselor Now" button | P0 |
| FR-CRIS-004 | Crisis events shall create an alert in the counselor dashboard with pseudonymous student ID and source (chatbot / quiz / forum / mood) | P0 |
| FR-CRIS-005 | Crisis alerts shall be delivered to counselors via Socket.io (real-time) AND email (fallback if no counselor is online) | P0 |
| FR-CRIS-006 | Crisis alerts shall be logged with timestamp, source, and resolution status (pending / acknowledged / resolved) — for audit purposes only | P0 |
| FR-CRIS-007 | The system shall NEVER autonomously contact a student's parents, institution administration, or police without student consent except when immediate life risk is assessed by a counselor | P0 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | Team MindBridge | Initial draft |
