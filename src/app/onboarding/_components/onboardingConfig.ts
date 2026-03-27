export const STEPS = [
  {
    id: "mood",
    title: "How are you feeling right now?",
    subtitle:
      "This helps us match the right kind of support for you today.",
  },
  {
    id: "name",
    title: "What should we call you?",
    subtitle:
      "You can stay fully anonymous — we'll never share this.",
  },
  {
    id: "focus",
    title: "What brings you here?",
    subtitle:
      "Pick as many as you like. You can change these later.",
  },
  {
    id: "welcome",
    title: "You're all set",
    subtitle:
      "Here's a quick look at your setup.",
  },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const FOCUS_AREAS = [
  { label: "Anxiety" },
  { label: "Depression" },
  { label: "Stress" },
  { label: "Sleep" },
  { label: "Self-Esteem" },
  { label: "Relationships" },
  { label: "Work-Life Balance" },
  { label: "Mindfulness" },
  { label: "Trauma" },
  { label: "Anger" },
] as const;

export const MOODS = [
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😊", label: "Happy" },
  { emoji: "🤔", label: "Confused" },
  { emoji: "😎", label: "Confident" },
] as const;
