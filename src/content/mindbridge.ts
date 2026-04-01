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

export const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/student/chat", label: "Chat", icon: "chat" },
  { href: "/student/check-in", label: "Check-in", icon: "heart" },
  { href: "/student/resources", label: "Resources", icon: "library" },
  { href: "/student/book", label: "Book", icon: "calendar" },
];

export const counselorNav: NavItem[] = [
  { href: "/counselor/dashboard", label: "Dashboard", icon: "shield" },
];

export const dashboardMetrics = [
  { label: "Check-in streak", value: "9 days", note: "Gentle consistency." },
  { label: "Next session", value: "Tue, 2:00 PM", note: "Anonymous booking." },
  { label: "Active chats", value: "2 threads", note: "Continue anytime." },
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
    description: "Continue your last chat - short, clear, private.",
    href: "/student/chat",
  },
  {
    title: "Log a check-in",
    description: "Track today's mood before the week blurs.",
    href: "/student/check-in",
  },
  {
    title: "Book a session",
    description: "Anonymous, named, or crisis - whatever feels safe.",
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
    content: "That sounds exhausting. Want to untangle the pressure, or check if you need to talk to someone?",
  },
  {
    role: "user",
    content: "Maybe talk to someone. It's been building for weeks.",
  },
  {
    role: "assistant",
    content: "I can help you book a counselor session. Anonymous or named - whatever feels right. Want to see the options?",
  },
];

export const sessionHistory = [
  { title: "Sunday night check-in", time: "Yesterday · 10:42 PM" },
  { title: "Exam stress spiral", time: "Mar 22 · 1:18 AM" },
  { title: "Could not sleep", time: "Mar 19 · 12:07 AM" },
];

export const suggestedActions = ["Continue chat", "Book a counselor", "Read wellness resources"];

export const moodOptions = [
  { label: "Very low", note: "Heavy, flat, or drained." },
  { label: "Strained", note: "Tense, uneasy, overloaded." },
  { label: "Steady", note: "Managing, but not great." },
  { label: "Lighter", note: "A bit more settled today." },
  { label: "Good", note: "Clearer, calmer, or hopeful." },
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

// Landing page content
export const mindbridgeCategories = [
  { label: "Stress less", id: "stress" },
  { label: "Sleep soundly", id: "sleep" },
  { label: "Manage anxiety", id: "anxiety" },
  { label: "Process thoughts", id: "thoughts" },
  { label: "Practice meditation", id: "meditation" },
  { label: "Start therapy", id: "therapy" },
];

export const beKindCTA = {
  eyebrow: "Be kind to your mind",
  headline: "Your companion for calmer days and clearer nights.",
  description: "AI chat when nights feel heavy. Real counselor booking when you're ready.",
  features: [
    "Talk through what's heavy - anytime, anonymously",
    "Track mood and build a daily rhythm",
    "Book a counselor in under two minutes",
    "Access curated wellness resources",
  ],
};

export const faqItems = [
  {
    question: "What is MindBridge?",
    answer: "Your campus companion for mental health - anonymous AI chat, mood tracking, and direct counselor booking. Calm before clinical.",
  },
  {
    question: "Is it really anonymous?",
    answer: "Yes. Chat, track mood, and book sessions without sharing your name. You choose when to reveal your identity.",
  },
  {
    question: "How does the AI chat work?",
    answer: "Short, warm replies - one question at a time. It suggests next steps like mood check-ins or booking a counselor. Not a replacement for professional support.",
  },
  {
    question: "How do I book a counselor?",
    answer: "Choose anonymous, named, or crisis - pick a slot - confirm. Under two minutes.",
  },
  {
    question: "Is MindBridge free?",
    answer: "Free for students at participating institutions. Your campus covers the cost.",
  },
];