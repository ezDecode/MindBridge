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
    description:
      "Open the chat, say what is sitting heavy, and get a calm response that keeps the next step small.",
  },
  {
    title: "Screen what you are feeling",
    description:
      "Take PHQ-9 or GAD-7 when you need language, not guesswork, around what is going on.",
  },
  {
    title: "Book a counselor quickly",
    description:
      "Move from uncertainty to a real session in under two minutes, with anonymous and crisis options built in.",
  },
];

export const journeyCards = [
  {
    step: "01",
    title: "A softer first touch",
    description:
      "The first interaction is not a form wall. It is a supportive place to land, even before login.",
  },
  {
    step: "02",
    title: "Clarity without overstatement",
    description:
      "Validated screening helps students understand what they are carrying without being scared or over-labeled.",
  },
  {
    step: "03",
    title: "Real campus support when needed",
    description:
      "MindBridge becomes useful because it does not stop at content. It connects students to a real counselor flow.",
  },
];

export const featureShowcase = [
  {
    eyebrow: "AI support",
    title: "A grounded chat flow that sounds human.",
    description:
      "Short replies, one question at a time, and action chips that gently suggest whether to chat more, take a quiz, or book someone real.",
    route: "/student/chat",
    routeLabel: "Open chat route",
  },
  {
    eyebrow: "Screening",
    title: "Validated check-ins, not vague wellness fluff.",
    description:
      "PHQ-9 and GAD-7 are framed as clarity tools with plain-language severity guidance and a calm next action.",
    route: "/student/quizzes",
    routeLabel: "See quiz flow",
  },
  {
    eyebrow: "Booking",
    title: "Anonymous, named, or urgent when the moment calls for it.",
    description:
      "Students can stay private until they are ready, while counselors still get the structure they need to respond fast.",
    route: "/student/book",
    routeLabel: "See booking flow",
  },
];

export const roleCards = [
  {
    eyebrow: "Student view",
    title: "Daily support that does not feel clinical.",
    description:
      "Mood check-ins, saved resources, past chats, quizzes, and booking all live in one place with a calm daily rhythm.",
    route: "/student/dashboard",
    routeLabel: "Open student dashboard",
  },
  {
    eyebrow: "Counselor view",
    title: "The dashboard is built for triage, not noise.",
    description:
      "See upcoming sessions, urgent chatbot flags, availability, and private notes without digging through clutter.",
    route: "/counselor/dashboard",
    routeLabel: "Open counselor dashboard",
  },
  {
    eyebrow: "Admin view",
    title: "Institutional signals without student exposure.",
    description:
      "Aggregate mood patterns, booking volume, crisis counts, and content management stay visible without exposing personal details.",
    route: "/admin/dashboard",
    routeLabel: "Open admin dashboard",
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
  { label: "Check-in streak", value: "9 days", note: "Gentle consistency, no badges attached." },
  { label: "Next session", value: "Tue, 2:00 PM", note: "Anonymous booking with campus counselor." },
  { label: "Latest screening", value: "PHQ-9 · Mild", note: "Retake in 7 days if you want a fresh check." },
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
    description: "Pick up your last chat and keep the conversation short, clear, and private.",
    href: "/student/chat",
  },
  {
    title: "Log a 15-second check-in",
    description: "Track today’s mood before it blurs into the rest of the week.",
    href: "/student/check-in",
  },
  {
    title: "Book a human session",
    description: "Choose anonymous, named, or crisis depending on what feels safe right now.",
    href: "/student/book",
  },
];

export const chatMessages = [
  {
    role: "assistant",
    content:
      "Hi. You do not need the perfect words here. Start with what today has felt like in your body or your head.",
  },
  {
    role: "user",
    content:
      "Everything feels noisy. I am behind on classes and I keep telling people I am fine even though I am not.",
  },
  {
    role: "assistant",
    content:
      "That sounds exhausting, especially when you are carrying it alone. Do you want to untangle the pressure first, or check whether the low feeling has been sitting there for a while?",
  },
  {
    role: "user",
    content: "Maybe the low feeling. I think it has been building for weeks.",
  },
  {
    role: "assistant",
    content:
      "Thank you for saying that out loud. A quick PHQ-9 could give you a clearer picture, and if you want, we can still stay in the chat after.",
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
  headline: "Your campus companion for calmer days and clearer nights.",
  description:
    "Access grounded AI chat when nights feel heavy, validated screenings to understand what you're carrying, and real counselor booking when you're ready for a human conversation.",
  features: [
    "Talk through what's sitting heavy — anytime, anonymously",
    "Understand your mental patterns with PHQ-9 and GAD-7 screenings",
    "Book a real counselor in under two minutes, crisis or calm",
    "Track mood check-ins and build a gentle daily rhythm",
  ],
};

export const stayInLoop = {
  headline: "Stay in the loop",
  description:
    "Be the first to hear about new wellness resources, campus events, and features designed around student life.",
};

export const faqItems = [
  {
    question: "What is MindBridge?",
    answer:
      "MindBridge is your campus companion for better mental health. Through anonymous AI-powered chat, validated screening tools like PHQ-9 and GAD-7, and direct counselor booking, MindBridge helps students find support that feels calm before it feels clinical.",
  },
  {
    question: "Is MindBridge really anonymous?",
    answer:
      "Yes. MindBridge is anonymous-first by design. You can chat, take screenings, and even book counselor sessions without sharing your name. You choose when — and if — to reveal your identity.",
  },
  {
    question: "How does the AI chat work?",
    answer:
      "The chat is grounded, not generative therapy. It gives short, warm replies — one question at a time — and gently suggests next steps like taking a screening, reading a resource, or booking a counselor. It is not a replacement for professional support.",
  },
  {
    question: "What are PHQ-9 and GAD-7?",
    answer:
      "These are clinically validated screening tools used worldwide. PHQ-9 screens for depression and GAD-7 screens for anxiety. MindBridge frames them as clarity tools with plain-language severity guidance, not diagnostic labels.",
  },
  {
    question: "How do I book a counselor?",
    answer:
      "Navigate to the booking page, choose your session type — anonymous, named, or crisis — pick an available time slot, and confirm. The entire flow takes under two minutes.",
  },
  {
    question: "Is MindBridge free for students?",
    answer:
      "MindBridge is designed to be free for students at participating institutions. Your campus covers the cost so you can focus on what matters.",
  },
];
