"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { FiActivity, FiCalendar, FiMessageSquare, FiArrowLeft } from "react-icons/fi";
import { Button, Text } from "@/components/ui";
import { useChat } from "@/hooks/useChat";
import { getClient } from "@/lib/supabase/client";

import { PillToggle } from "./_components/PillToggle";
import { MindTab } from "./_components/MindTab";
import { BridgeTab } from "./_components/BridgeTab";
import {
  generateWeekMoodHistory,
  generateEmptyWeek,
  formatSessionTime,
  generateSessionId,
} from "./_components/types";
import type { DashboardData, TabId } from "./_components/types";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("mind");

  /* ── Chat state ── */
  const [sessionId, setSessionId] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [showResources, setShowResources] = useState(false);

  const handleAction = useCallback(
    (action: { type: string; context: string | null }) => {
      if (action.type === "book_counselor") setShowBooking(true);
      else if (action.type === "show_resources") setShowResources(true);
    },
    []
  );

  const handleCrisis = useCallback(() => {
    console.log("Crisis detected - alert sent to counselor");
  }, []);

  const { messages, sendMessage, isLoading, error, stopGenerating } = useChat({
    sessionId,
    onAction: handleAction,
    onCrisis: handleCrisis,
  });

  const startNewSession = () => {
    const newId = generateSessionId();
    setSessionId(newId);
    sessionStorage.setItem("currentChatSession", newId);
    window.location.reload();
  };

  /* ── Data fetching ── */
  useEffect(() => {
    const init = async () => {
      const supabase = getClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      const stored = sessionStorage.getItem("currentChatSession");
      if (stored) {
        setSessionId(stored);
      } else {
        const newId = generateSessionId();
        setSessionId(newId);
        sessionStorage.setItem("currentChatSession", newId);
      }

      const [moodResponse, profileResult, sessionsResult, bookingsResult] =
        await Promise.all([
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

      let moodData = { moods: [], streak: 0 };
      if (moodResponse.ok) moodData = await moodResponse.json();

      const { data: proactiveMsg } = await supabase
        .from("chat_messages")
        .select("content")
        .eq("user_id", user.id)
        .eq("proactive", true)
        .order("sent_at", { ascending: false })
        .limit(1)
        .single();

      setUserName(profileResult.data?.name || "there");

      setData({
        streak: moodData.streak || 0,
        nextSession: bookingsResult.data?.[0]?.slot_start
          ? formatSessionTime(new Date(bookingsResult.data[0].slot_start))
          : null,
        activeChats: sessionsResult.data?.length || 0,
        moodHistory: generateWeekMoodHistory(moodData.moods || []),
        proactiveMessage: proactiveMsg?.content || null,
      });
    };

    init();
  }, []);

  /* ── Loading ── */
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <Text as="p" variant="body" color="secondary" className="mt-4">Loading...</Text>
        </div>
      </div>
    );
  }

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <Text as="h1" variant="h2" weight="bold">Sign in to continue</Text>
        <Text as="p" variant="body" color="secondary" className="mt-3 max-w-md">
          Track your mood, chat with MindBridge, and book counselor sessions.
        </Text>
        <div className="mt-6 flex gap-3">
          <Button href="/login">Sign in</Button>
          <Button href="/student/resources" variant="warm">Browse resources</Button>
        </div>
      </div>
    );
  }

  /* ── Computed analytics ── */
  const moodHistory = data?.moodHistory || generateEmptyWeek();
  const scored = moodHistory.filter((m) => m.score > 0);
  const averageMood = scored.length ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0;
  const bestDay = scored.length ? scored.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const worstDay = scored.length ? scored.reduce((a, b) => (b.score < a.score ? b : a)) : null;

  const trendDirection = (() => {
    if (scored.length < 2) return "steady";
    const half = Math.ceil(scored.length / 2);
    const avgFirst = scored.slice(0, half).reduce((a, b) => a + b.score, 0) / half;
    const avgSecond = scored.slice(half).reduce((a, b) => a + b.score, 0) / scored.slice(half).length;
    if (avgSecond - avgFirst > 0.3) return "improving";
    if (avgFirst - avgSecond > 0.3) return "declining";
    return "steady";
  })();

  const metrics = [
    {
      label: "Check-in streak",
      value: `${data?.streak || 0} days`,
      note: data?.streak ? "Keep it going! 🔥" : "Start your streak today",
      icon: <FiActivity className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      label: "Next session",
      value: data?.nextSession || "None",
      note: data?.nextSession ? "Upcoming booking" : "Book when ready",
      icon: <FiCalendar className="h-5 w-5 text-[var(--color-info)]" />,
    },
    {
      label: "Active chats",
      value: `${data?.activeChats || 0}`,
      note: "This week",
      icon: <FiMessageSquare className="h-5 w-5 text-[var(--color-success)]" />,
    },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-label font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <PillToggle active={activeTab} onChange={setActiveTab} />
        <Text as="p" variant="label" weight="bold" color="brand" className="hidden sm:block">
          MindBridge
        </Text>
        <span className="sm:hidden" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "mind" ? (
          <motion.div
            key="mind"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 md:gap-6"
          >
            <MindTab
              userName={userName}
              data={data}
              messages={messages}
              sendMessage={sendMessage}
              isLoading={isLoading}
              error={error}
              stopGenerating={stopGenerating}
              startNewSession={startNewSession}
              showBooking={showBooking}
              showResources={showResources}
              setShowBooking={setShowBooking}
              setShowResources={setShowResources}
              router={router}
            />
          </motion.div>
        ) : (
          <motion.div
            key="bridge"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 md:gap-6"
          >
            <BridgeTab
              data={data}
              userName={userName}
              metrics={metrics}
              moodHistory={moodHistory}
              averageMood={averageMood}
              bestDay={bestDay}
              worstDay={worstDay}
              trendDirection={trendDirection}
              completedDays={scored.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
