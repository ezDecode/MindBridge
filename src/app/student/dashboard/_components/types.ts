export interface DashboardData {
  streak: number;
  nextSession: string | null;
  activeChats: number;
  moodHistory: { day: string; score: number }[];
  proactiveMessage: string | null;
  latestAssessment: {
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    criteriaFlagged: string[];
    assessedAt: string;
  } | null;
}

export type TabId = "mind" | "bridge";

export function generateWeekMoodHistory(
  moods: { score: number; logged_at: string }[]
): { day: string; score: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const result: { day: string; score: number }[] = [];
  const moodMap = new Map<string, number>();

  moods.forEach((mood) => {
    const date = new Date(mood.logged_at).toDateString();
    if (!moodMap.has(date)) {
      moodMap.set(date, mood.score);
    }
  });

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    const score = moodMap.get(date.toDateString()) || 0;
    result.push({ day: dayName, score });
  }

  return result;
}

export function generateEmptyWeek(): { day: string; score: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return { day: days[date.getDay()], score: 0 };
  });
}

export function formatSessionTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
