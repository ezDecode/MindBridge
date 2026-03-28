export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const marketingNav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#inside", label: "Inside the flow" },
  { href: "/#roles", label: "For each role" },
  { href: "/#resources", label: "Support library" },
];

export const trustChips = [
  "Anonymous-first support",
  "Campus counselor ready",
  "Warm, non-clinical guidance",
];

export const heroHighlights = [
  {
    title: "Talk before you spiral",
    description: "Open a chat, say what's heavy, get a calm next step.",
  },
  {
    title: "Screen what you feel",
    description: "PHQ-9 and GAD-7 give you clarity, not guesswork.",
  },
  {
    title: "Book a counselor fast",
    description: "Anonymous, named, or crisis — booked in under two minutes.",
  },
];

export const journeyCards = [
  {
    step: "01",
    title: "A softer first touch",
    description: "No form walls. A supportive place to land, even before login.",
  },
  {
    step: "02",
    title: "Clarity without labels",
    description: "Validated screening that helps you understand without over-diagnosing.",
  },
  {
    step: "03",
    title: "Real campus support",
    description: "Not just content — a real path to a real counselor session.",
  },
];

export const featureShowcase = [
  {
    eyebrow: "AI support",
    title: "A grounded chat that sounds human.",
    description: "Short replies, one question at a time, with gentle next-step suggestions.",
    route: "/student/chat",
    routeLabel: "Open chat",
  },
  {
    eyebrow: "Screening",
    title: "Validated check-ins, not wellness fluff.",
    description: "PHQ-9 and GAD-7 framed as clarity tools with plain-language guidance.",
    route: "/student/quizzes",
    routeLabel: "See quizzes",
  },
  {
    eyebrow: "Booking",
    title: "Anonymous, named, or urgent.",
    description: "Stay private until you're ready. Counselors still get what they need.",
    route: "/student/book",
    routeLabel: "See booking",
  },
];

export const roleCards = [
  {
    eyebrow: "Student view",
    title: "Daily support without the clinical feel.",
    description: "Mood, chat, quizzes, resources, and booking — one calm place.",
    route: "/student/dashboard",
    routeLabel: "Student dashboard",
  },
  {
    eyebrow: "Counselor view",
    title: "Built for triage, not noise.",
    description: "Sessions, flags, availability, and notes — no clutter.",
    route: "/counselor/dashboard",
    routeLabel: "Counselor dashboard",
  },
  {
    eyebrow: "Admin view",
    title: "Signals without student exposure.",
    description: "Aggregate trends, crisis counts, and content — no personal data.",
    route: "/admin/dashboard",
    routeLabel: "Admin dashboard",
  },
];

export const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/student/chat", label: "Chat", icon: "chat" },
  { href: "/student/check-in", label: "Check-in", icon: "heart" },
  { href: "/student/quizzes", label: "Quizzes", icon: "quiz" },
  { href: "/student/resources", label: "Resources", icon: "library" },
  { href: "/student/book", label: "Book", icon: "calendar" },
];

export const counselorNav: NavItem[] = [
  { href: "/counselor/dashboard", label: "Dashboard", icon: "shield" },
];

export const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "chart" },
];

export const dashboardMetrics = [
  { label: "Check-in streak", value: "9 days", note: "Gentle consistency." },
  { label: "Next session", value: "Tue, 2:00 PM", note: "Anonymous booking." },
  { label: "Latest screening", value: "PHQ-9 · Mild", note: "Retake in 7 days." },
];

export const moodHistory = [
  { day: "Mon", score: 2 },
  { day: "Tue", score: 3 },
  { day: "Wed", score: 3 },
  { day: "Thu", score: 4 },
  { day: "Fri", score: 3 },
  { day: "Sat", score: 4 },
  { day: "Sun", score: 5 },
];

export const actionTiles = [
  {
    title: "Talk through tonight",
    description: "Continue your last chat — short, clear, private.",
    href: "/student/chat",
  },
  {
    title: "Log a check-in",
    description: "Track today’s mood before the week blurs.",
    href: "/student/check-in",
  },
  {
    title: "Book a session",
    description: "Anonymous, named, or crisis — whatever feels safe.",
    href: "/student/book",
  },
];

export const chatMessages = [
  {
    role: "assistant",
    content: "Hi. No perfect words needed. What has today felt like?",
  },
  {
    role: "user",
    content: "Everything feels noisy. I'm behind on classes and keep telling people I'm fine.",
  },
  {
    role: "assistant",
    content: "That sounds exhausting. Want to untangle the pressure, or check if the low feeling has been building?",
  },
  {
    role: "user",
    content: "Maybe the low feeling. It's been building for weeks.",
  },
  {
    role: "assistant",
    content: "A quick PHQ-9 could give you a clearer picture. We can stay in the chat after if you want.",
  },
];

export const sessionHistory = [
  { title: "Sunday night check-in", time: "Yesterday · 10:42 PM" },
  { title: "Exam stress spiral", time: "Mar 22 · 1:18 AM" },
  { title: "Could not sleep", time: "Mar 19 · 12:07 AM" },
];

export const suggestedActions = ["Take PHQ-9", "Book a counselor", "Read a breathing guide"];

export const moodOptions = [
  { emoji: "😞", label: "Very low", note: "Heavy, flat, or drained." },
  { emoji: "😟", label: "Strained", note: "Tense, uneasy, overloaded." },
  { emoji: "😐", label: "Steady", note: "Managing, but not great." },
  { emoji: "🙂", label: "Lighter", note: "A bit more settled today." },
  { emoji: "😊", label: "Good", note: "Clearer, calmer, or hopeful." },
];

export const quizCards = [
  {
    name: "PHQ-9",
    label: "Depression screening",
    note: "9 questions · plain-language severity band",
  },
  {
    name: "GAD-7",
    label: "Anxiety screening",
    note: "7 questions · same calm scoring flow",
  },
];

export const quizQuestions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble concentrating on classes, reading, or work",
];

export const quizHistory = [
  { type: "PHQ-9", score: "8", severity: "Mild", date: "Mar 23" },
  { type: "GAD-7", score: "11", severity: "Moderate", date: "Mar 17" },
  { type: "PHQ-9", score: "6", severity: "Minimal", date: "Mar 10" },
];

export const resources = [
  {
    type: "Article",
    title: "How to steady yourself before an exam spiral",
    category: "Exam Stress",
    duration: "5 min read",
    saved: true,
  },
  {
    type: "Audio",
    title: "Two-minute breathing reset for racing thoughts",
    category: "Anxiety",
    duration: "2 min listen",
    saved: false,
  },
  {
    type: "Video",
    title: "A gentle sleep routine for hostel nights",
    category: "Sleep",
    duration: "7 min watch",
    saved: true,
  },
  {
    type: "Article",
    title: "What to say when you need space from everyone",
    category: "Relationships",
    duration: "4 min read",
    saved: false,
  },
];

export const resourceFilters = [
  "All",
  "Anxiety",
  "Depression",
  "Exam Stress",
  "Relationships",
  "Sleep",
  "Self-Care",
];

export const counselors = [
  {
    name: "Dr. Meera Shah",
    focus: "Exam stress, burnout, panic",
    availability: "Next open: Tue 2:00 PM",
  },
  {
    name: "Arjun Rao",
    focus: "Relationships, adjustment, loneliness",
    availability: "Next open: Wed 11:30 AM",
  },
  {
    name: "Ritika Nair",
    focus: "Low mood, confidence, academic pressure",
    availability: "Next open: Thu 4:15 PM",
  },
];

export const bookingTypes = [
  {
    label: "Anonymous",
    note: "Your name stays hidden until you are ready.",
  },
  {
    label: "Named",
    note: "The counselor sees your profile details upfront.",
  },
  {
    label: "Crisis",
    note: "Use this when you need urgent counselor attention.",
  },
];

export const bookingSlots = [
  "Tue · 2:00 PM",
  "Tue · 3:00 PM",
  "Wed · 11:30 AM",
  "Wed · 4:00 PM",
  "Thu · 10:00 AM",
  "Thu · 4:15 PM",
];

export const counselorMetrics = [
  { label: "Bookings today", value: "6" },
  { label: "Urgent flags", value: "2" },
  { label: "Notes pending", value: "3" },
];

export const counselorAlerts = [
  {
    title: "Crisis flag from student chat",
    detail: "Triggered at 1:42 AM · Suggested action: call helpline + book now",
  },
  {
    title: "Anonymous booking marked urgent",
    detail: "Tomorrow · 10:00 AM · Added by counselor queue",
  },
];

export const counselorBookings = [
  { student: "Anonymous", type: "Crisis", time: "Tue · 10:00 AM", status: "Confirmed" },
  { student: "A. Singh", type: "Named", time: "Tue · 2:00 PM", status: "Confirmed" },
  { student: "Anonymous", type: "Anonymous", time: "Wed · 11:30 AM", status: "Pending" },
];

export const adminMetrics = [
  { label: "Average mood this week", value: "3.4 / 5" },
  { label: "Bookings this month", value: "82" },
  { label: "Crisis flags this week", value: "7" },
];

export const adminMoodTrend = [
  { label: "Week 1", value: 56 },
  { label: "Week 2", value: 64 },
  { label: "Week 3", value: 60 },
  { label: "Week 4", value: 72 },
];

export const adminQuizDistribution = [
  { label: "Minimal", value: 28 },
  { label: "Mild", value: 24 },
  { label: "Moderate", value: 18 },
  { label: "High", value: 9 },
];

export const adminResources = [
  { title: "Body scan for sleep", type: "Audio", category: "Sleep" },
  { title: "When exam pressure stops feeling normal", type: "Article", category: "Exam Stress" },
  { title: "How to ask for help without explaining everything", type: "Video", category: "Self-Care" },
];

// --- Headspace-inspired content sections ---

export const headspaceCategories = [
  { label: "Ease exam stress", icon: "📚" },
  { label: "Sleep better tonight", icon: "🌙" },
  { label: "Manage anxious thoughts", icon: "🧘" },
  { label: "Process heavy feelings", icon: "💭" },
  { label: "Build a daily rhythm", icon: "✨" },
  { label: "Talk to someone real", icon: "🤝" },
];

export const socialProof = {
  headline: "Trusted by campus communities across India",
  stats: [
    { value: "12,000+", label: "Students supported" },
    { value: "94%", label: "Said it felt safe to open up" },
    { value: "2 min", label: "Average time to first counselor session" },
  ],
};

export const beKindCTA = {
  eyebrow: "Be kind to your mind",
  headline: "Your companion for calmer days and clearer nights.",
  description: "AI chat when nights feel heavy. Validated screenings. Real counselor booking when you're ready.",
  features: [
    "Talk through what's heavy — anytime, anonymously",
    "Understand patterns with PHQ-9 and GAD-7",
    "Book a counselor in under two minutes",
    "Track mood and build a daily rhythm",
  ],
};

export const stayInLoop = {
  headline: "Stay in the loop",
  description:
    "Be the first to hear about new wellness resources, campus events, and features designed for student.",
};

export const faqItems = [
  {
    question: "What is MindBridge?",
    answer: "Your campus companion for mental health — anonymous AI chat, validated screenings (PHQ-9, GAD-7), and direct counselor booking. Calm before clinical.",
  },
  {
    question: "Is it really anonymous?",
    answer: "Yes. Chat, take screenings, and book sessions without sharing your name. You choose when to reveal your identity.",
  },
  {
    question: "How does the AI chat work?",
    answer: "Short, warm replies — one question at a time. It suggests next steps like screenings or booking a counselor. Not a replacement for professional support.",
  },
  {
    question: "What are PHQ-9 and GAD-7?",
    answer: "Clinically validated screening tools. PHQ-9 screens for depression, GAD-7 for anxiety. Plain-language guidance, not diagnostic labels.",
  },
  {
    question: "How do I book a counselor?",
    answer: "Choose anonymous, named, or crisis — pick a slot — confirm. Under two minutes.",
  },
  {
    question: "Is MindBridge free?",
    answer: "Free for students at participating institutions. Your campus covers the cost.",
  },
];
