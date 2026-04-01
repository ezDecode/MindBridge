"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { FiCheck, FiLoader } from "react-icons/fi";
import { PageIntro } from "@/components/site";
import { Button, Card, SelectionCard, Text } from "@/components/ui";
import { getClient } from "@/lib/supabase/client";

const moodOptions = [
  { label: "Very low", score: 1, note: "Struggling to get through the day", emoji: "😔" },
  { label: "Low", score: 2, note: "Heavy, but managing", emoji: "😕" },
  { label: "Okay", score: 3, note: "Getting by, not great not bad", emoji: "😐" },
  { label: "Good", score: 4, note: "Feeling positive", emoji: "🙂" },
  { label: "Great", score: 5, note: "Energised and hopeful", emoji: "😊" },
];

interface MoodData {
  score: number;
  note: string | null;
  logged_at: string;
}

export default function StudentCheckInPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  // Check auth and load history
  useEffect(() => {
    const init = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);

      // Fetch mood history
      try {
        const response = await fetch("/api/mood?days=30");
        if (response.ok) {
          const data = await response.json();
          setMoodHistory(data.moods || []);
          setStreak(data.streak || 0);
        }
      } catch (error) {
        console.error("Failed to fetch moods:", error);
      }
    };

    init();
  }, []);

  const handleSave = async () => {
    if (!selectedMood || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: selectedMood,
          note: note.trim() || null,
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => {
          router.push("/student/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          eyebrow="Daily mood check-in"
          title="Sign in to track your mood"
          description="Create an account to log daily check-ins and see your patterns over time."
          actions={
            <>
              <Button href="/login">Sign in</Button>
              <Button href="/student/chat" variant="warm">
                Browse chat
              </Button>
            </>
          }
        />
      </>
    );
  }

  // Generate chart data (last 14 days)
  const chartData = generateChartData(moodHistory);
  const selectedMoodData = moodOptions.find(m => m.score === selectedMood);

  return (
    <>
      <PageIntro
        eyebrow="Daily mood check-in"
        title="A 15-second log that still feels considered."
        description="One mood, one optional note, and a soft trend to notice how the week moves."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleSave} 
                disabled={!selectedMood || isLoading || isSaved}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save check-in"
                )}
              </Button>
            </motion.div>
            <Button href="/student/chat" variant="warm">
              Talk instead
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="small" weight="medium">
              How does today feel?
            </Text>
            
            {/* Selected mood feedback */}
            <AnimatePresence mode="wait">
              {selectedMoodData && (
                <motion.div
                  key={selectedMood}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle bg-[var(--color-primary-light)] p-4">
                    <motion.span 
                      className="text-3xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {selectedMoodData.emoji}
                    </motion.span>
                    <div>
                      <Text as="p" variant="label" weight="bold" color="brand">
                        {selectedMoodData.label}
                      </Text>
                      <Text as="p" variant="small" color="secondary">
                        {selectedMoodData.note}
                      </Text>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 grid gap-3">
              {moodOptions.map((option, index) => (
                <motion.div
                  key={option.score}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SelectionCard
                    selected={selectedMood === option.score}
                    label={`${option.emoji} ${option.label}`}
                    sublabel={option.note}
                    onClick={() => setSelectedMood(option.score)}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-6 rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Text as="label" htmlFor="check-in-note" variant="small" weight="medium">
                Optional note
              </Text>
              <textarea
                id="check-in-note"
                rows={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind today? (optional)"
                className="mt-3 w-full resize-none rounded-[calc(var(--radius-sm)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-gray-50)] px-4 py-3 text-span text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 placeholder:text-[var(--color-text-muted)]"
              />
            </motion.div>
          </Card>
        </motion.div>

        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card variant="subtle" padding="lg">
              <Text as="p" variant="small" weight="medium">
                30-day trend preview
              </Text>
              <Text as="p" variant="small" color="secondary" className="mt-2">
                Just enough shape to notice whether you&apos;re sinking or lifting.
              </Text>

              <div className="chart-shell mt-8 flex h-56 items-end justify-between gap-2 rounded-[calc(var(--radius-lg)*var(--brm))] squircle px-3 pb-4 pt-8">
                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="chart-bar-track flex h-[8.5rem] w-full items-end justify-center rounded-full">
                      <motion.div
                        initial={{ height: "5%" }}
                        animate={{ height: item.score ? `${item.score * 18}%` : "5%" }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.3 + index * 0.03,
                          ease: [0.23, 1, 0.32, 1]
                        }}
                        className={`w-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] ${
                          item.score 
                            ? "bg-linear-to-t from-[var(--color-success)] to-[var(--color-primary)]"
                            : "bg-[var(--color-gray-100)]"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between">
                <div>
                  <Text as="p" variant="small" weight="medium">
                    Current streak
                  </Text>
                  <motion.div
                    key={streak}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Text as="p" variant="h2" weight="bold" className="mt-2 text-[var(--color-primary)]">
                      {streak} {streak === 1 ? "day" : "days"} 🔥
                    </Text>
                  </motion.div>
                </div>
              </div>
              <Text as="p" variant="body" color="secondary" className="mt-3">
                {streak === 0 
                  ? "Start your streak by logging today's mood!"
                  : streak < 7 
                    ? "Keep it going! Consistency helps you notice patterns."
                    : "Amazing consistency! You're building a clear picture of your mental health."}
              </Text>
              <div className="mt-5 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button href="/student/book">Book counselor</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button href="/student/resources" variant="warm">
                    Open resources
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-[calc(var(--radius-xl)*var(--brm))] squircle bg-white p-8 text-center shadow-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]/10"
              >
                <FiCheck className="h-8 w-8 text-[var(--color-success)]" />
              </motion.div>
              <Text as="p" variant="h5" weight="bold">
                Check-in saved!
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-2">
                Redirecting to dashboard...
              </Text>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Generate chart data for the last 14 days
function generateChartData(moods: MoodData[]): { date: string; score: number | null }[] {
  const data: { date: string; score: number | null }[] = [];
  const today = new Date();
  
  // Create a map of dates to scores
  const moodMap = new Map<string, number>();
  moods.forEach(mood => {
    const date = new Date(mood.logged_at).toDateString();
    // Keep the most recent score for each day
    if (!moodMap.has(date)) {
      moodMap.set(date, mood.score);
    }
  });

  // Generate last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    
    data.push({
      date: dateStr,
      score: moodMap.get(dateStr) || null,
    });
  }

  return data;
}
