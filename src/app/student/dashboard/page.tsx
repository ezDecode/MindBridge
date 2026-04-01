"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiCalendar, FiMessageSquare } from "react-icons/fi";
import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import { getClient } from "@/lib/supabase/client";
import staticResources from "@/content/static-resources.json";

interface DashboardData {
  streak: number;
  nextSession: string | null;
  activeChats: number;
  moodHistory: { day: string; score: number }[];
  proactiveMessage: string | null;
}

const actionTiles = [
  {
    title: "Talk to MindBridge",
    description: "Start or continue a conversation with your AI companion",
    href: "/student/chat",
  },
  {
    title: "Log today's check-in",
    description: "A 15-second mood log to track how you're doing",
    href: "/student/check-in",
  },
  {
    title: "Book a counselor session",
    description: "Anonymous, named, or crisis booking available",
    href: "/student/book",
  },
];

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);

      // Fetch dashboard data in parallel
      const [moodResponse, profileResult, sessionsResult, bookingsResult] = await Promise.all([
        fetch("/api/mood?days=7"),
        supabase.from("profiles").select("name").eq("id", user.id).single(),
        supabase
          .from("chat_sessions")
          .select("id")
          .eq("user_id", user.id)
          .gte("last_message_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from("bookings")
          .select("slot_start")
          .eq("student_id", user.id)
          .eq("status", "confirmed")
          .gte("slot_start", new Date().toISOString())
          .order("slot_start", { ascending: true })
          .limit(1),
      ]);

      // Parse mood data
      let moodData = { moods: [], streak: 0 };
      if (moodResponse.ok) {
        moodData = await moodResponse.json();
      }

      // Check for proactive messages
      const { data: proactiveMsg } = await supabase
        .from("chat_messages")
        .select("content")
        .eq("user_id", user.id)
        .eq("proactive", true)
        .order("sent_at", { ascending: false })
        .limit(1)
        .single();

      setUserName(profileResult.data?.name || "there");
      
      // Generate 7-day mood history
      const moodHistory = generateWeekMoodHistory(moodData.moods || []);

      setData({
        streak: moodData.streak || 0,
        nextSession: bookingsResult.data?.[0]?.slot_start 
          ? formatSessionTime(new Date(bookingsResult.data[0].slot_start))
          : null,
        activeChats: sessionsResult.data?.length || 0,
        moodHistory,
        proactiveMessage: proactiveMsg?.content || null,
      });
    };

    init();
  }, []);

  // Show loading
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <Text as="p" variant="body" color="secondary" className="mt-4">
            Loading...
          </Text>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <PageIntro
          title="Sign in to access your dashboard"
          description="Track your mood, chat with MindBridge, and book counselor sessions."
          actions={
            <>
              <Button href="/login">Sign in</Button>
              <Button href="/student/resources" variant="warm">
                Browse resources
              </Button>
            </>
          }
        />
      </>
    );
  }

  // Metrics for display
  const metrics = [
    {
      label: "Check-in streak",
      value: `${data?.streak || 0} days`,
      note: data?.streak ? "Keep it going! 🔥" : "Start your streak today",
    },
    {
      label: "Next session",
      value: data?.nextSession || "None",
      note: data?.nextSession ? "Upcoming booking" : "Book when ready",
    },
    {
      label: "Active chats",
      value: `${data?.activeChats || 0}`,
      note: "This week",
    },
  ];

  return (
    <>
      <PageIntro
        title={`Hey ${userName} — start with the gentlest next step.`}
        description="Support, screening, and counselor access — surfaced so you don't have to dig."
        actions={
          <>
            <Button href="/student/chat">Continue chat</Button>
            <Button href="/student/check-in" variant="warm">
              Log check-in
            </Button>
          </>
        }
      />

      {/* Proactive message banner */}
      {data?.proactiveMessage && (
        <Card variant="elevated" padding="md" className="mb-4 border-2 border-[var(--color-primary)]/20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
              <FiMessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">
              <Text as="p" variant="label" weight="bold" color="brand">
                MindBridge checked in
              </Text>
              <Text as="p" variant="body" className="mt-1">
                {data.proactiveMessage}
              </Text>
              <Button href="/student/chat" variant="warm" size="sm" className="mt-3">
                Reply now
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} variant="default" padding="md">
            <Text as="p" variant="label" weight="medium" color="secondary">
              {metric.label}
            </Text>
            <Text as="p" variant="h3" weight="bold" className="mt-3 text-[var(--color-primary)]">
              {metric.value}
            </Text>
            <Text as="p" variant="small" color="muted" className="mt-2">
              {metric.note}
            </Text>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <Card variant="elevated" padding="lg">
          <Text as="p" variant="h6" weight="bold">
            Today&apos;s actions
          </Text>
          <div className="mt-5 grid gap-3">
            {actionTiles.map((tile, index) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="interactive-panel group rounded-[calc(var(--radius-lg)*var(--brm))] squircle p-4"
                data-active={index === 0}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Text as="p" variant="h6" weight="bold">
                      {tile.title}
                    </Text>
                    <Text as="p" variant="small" color="secondary" className="mt-2 max-w-[42ch]">
                      {tile.description}
                    </Text>
                  </div>
                  <FiArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card variant="subtle" padding="lg">
          <Text as="p" variant="h6" weight="bold">
            7-day mood rhythm
          </Text>
          <Text as="p" variant="small" color="secondary" className="mt-2">
            Enough signal to notice a pattern, without the obsession.
          </Text>

          <div className="chart-shell mt-8 flex h-40 sm:h-52 items-end justify-between gap-2 sm:gap-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle px-3 sm:px-4 pb-3 sm:pb-4 pt-6 sm:pt-8">
            {(data?.moodHistory || generateEmptyWeek()).map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2 sm:gap-3">
                <div className="chart-bar-track flex h-20 sm:h-32 w-full items-end justify-center rounded-full">
                  <div
                    className={`chart-bar-fill w-full rounded-full transition-all duration-300 ${
                      item.score > 0 ? "" : "!bg-[var(--color-gray-100)]"
                    }`}
                    style={{ height: item.score > 0 ? `${item.score * 20}%` : "5%" }}
                  />
                </div>
                <Text as="span" variant="small" weight="medium" color="muted">
                  {item.day}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Text as="p" variant="h6" weight="bold">
              Saved and suggested
            </Text>
            <Button href="/student/resources" variant="warm" size="sm">
              Browse library
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {staticResources.slice(0, 4).map((resource, index) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[calc(var(--radius-lg)*var(--brm))] squircle border p-4 transition-colors hover:border-[var(--color-primary)]/50"
                style={{
                  borderColor: index === 0 ? "var(--color-primary)" : "var(--color-border)",
                  background: index === 0 ? "var(--color-surface-strong)" : "var(--color-surface)",
                }}
              >
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  {resource.type === "Audio" ? (
                    <FiMessageSquare className="h-4 w-4" />
                  ) : resource.type === "YouTube" ? (
                    <FiCalendar className="h-4 w-4" />
                  ) : (
                    <FiBookOpen className="h-4 w-4" />
                  )}
                  <Text as="span" variant="label" weight="medium" color="secondary">
                    {resource.type}
                  </Text>
                </div>
                <Text as="p" variant="body" weight="bold" className="mt-3">
                  {resource.title}
                </Text>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Text as="p" variant="label" weight="medium" color="muted">
                    {resource.duration}
                  </Text>
                  <span className="status-pill">Open</span>
                </div>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// Generate 7-day mood history from mood logs
function generateWeekMoodHistory(moods: { score: number; logged_at: string }[]): { day: string; score: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const result: { day: string; score: number }[] = [];

  // Create map of dates to scores
  const moodMap = new Map<string, number>();
  moods.forEach(mood => {
    const date = new Date(mood.logged_at).toDateString();
    if (!moodMap.has(date)) {
      moodMap.set(date, mood.score);
    }
  });

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    const score = moodMap.get(date.toDateString()) || 0;
    result.push({ day: dayName, score });
  }

  return result;
}

// Generate empty week for initial state
function generateEmptyWeek(): { day: string; score: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return { day: days[date.getDay()], score: 0 };
  });
}

// Format session time
function formatSessionTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  };
  return date.toLocaleString("en-IN", options);
}
