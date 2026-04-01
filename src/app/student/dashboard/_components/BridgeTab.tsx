"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiActivity,
  FiTrendingUp,
  FiCheckCircle,
  FiSun,
  FiClock,
  FiUser,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button, Card, Text } from "@/components/ui";
import staticResources from "@/content/static-resources.json";
import { MoodGauge } from "./MoodGauge";
import type { DashboardData } from "./types";

/* ── Custom tooltip ── */

function MoodTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const labels = ["", "Very low", "Strained", "Steady", "Lighter", "Good"];
  return (
    <div className="rounded-[calc(var(--radius-sm)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-md)]">
      <Text as="p" variant="label" weight="bold">{label}</Text>
      <Text as="p" variant="small" color="secondary" className="mt-0.5">
        {score > 0 ? `${labels[score] || score} (${score}/5)` : "No check-in"}
      </Text>
    </div>
  );
}

/* ── Counselor data (demo simulation) ── */

const counselors = [
  {
    name: "Dr. Meera Shah",
    title: "Clinical Psychologist",
    focus: "Exam stress, burnout, panic",
    avatar: "MS",
    color: "var(--color-primary)",
    nextSlot: "Today · 4:30 PM",
    slots: ["Today 4:30 PM", "Tomorrow 11:00 AM", "Thu 2:00 PM"],
  },
  {
    name: "Arjun Rao",
    title: "Counselling Psychologist",
    focus: "Relationships, adjustment, loneliness",
    avatar: "AR",
    color: "var(--color-info)",
    nextSlot: "Tomorrow · 11:30 AM",
    slots: ["Tomorrow 11:30 AM", "Wed 3:00 PM", "Fri 10:00 AM"],
  },
  {
    name: "Dr. Ritika Nair",
    title: "Psychiatrist",
    focus: "Low mood, confidence, academic pressure",
    avatar: "RN",
    color: "var(--color-success)",
    nextSlot: "Wed · 3:15 PM",
    slots: ["Wed 3:15 PM", "Thu 4:15 PM", "Fri 1:00 PM"],
  },
];

/* ── Quick action tiles ── */

const actionTiles = [
  {
    title: "Log today's check-in",
    description: "A 15-second mood log to track how you're doing",
    href: "/student/check-in",
    icon: <FiCheckCircle className="h-5 w-5 text-[var(--color-success)]" />,
  },
  {
    title: "Book a counselor session",
    description: "Anonymous, named, or crisis booking available",
    href: "/student/book",
    icon: <FiCalendar className="h-5 w-5 text-[var(--color-info)]" />,
  },
  {
    title: "Browse resources",
    description: "Curated articles, audio, and exercises",
    href: "/student/resources",
    icon: <FiBookOpen className="h-5 w-5 text-[var(--color-accent)]" />,
  },
];

/* ── Bridge Tab ── */

interface BridgeTabProps {
  data: DashboardData | null;
  userName: string;
  metrics: { label: string; value: string; note: string; icon: React.ReactNode }[];
  moodHistory: { day: string; score: number }[];
  averageMood: number;
  bestDay: { day: string; score: number } | null;
  worstDay: { day: string; score: number } | null;
  trendDirection: string;
  completedDays: number;
}

export function BridgeTab({
  data,
  userName,
  metrics,
  moodHistory,
  averageMood,
  bestDay,
  worstDay,
  trendDirection,
  completedDays,
}: BridgeTabProps) {
  return (
    <>
      {/* ── Greeting ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Text as="p" variant="label" weight="bold" color="brand">Analytics</Text>
          <Text as="h1" variant="h3" weight="bold" className="mt-1">
            Hey {userName} — your wellness at a glance.
          </Text>
          <Text as="p" variant="body" color="secondary" className="mt-1 max-w-lg">
            Patterns, not pressure. Enough signal to notice a trend.
          </Text>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button href="/student/book" size="sm">Book a counselor</Button>
          <Button href="/student/check-in" variant="warm" size="sm">Log check-in</Button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card variant="default" padding="md" className="h-full">
              <div className="flex items-start justify-between">
                <Text as="p" variant="label" weight="medium" color="secondary">
                  {metric.label}
                </Text>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-strong)]">
                  {metric.icon}
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                <Text as="p" variant="h3" weight="bold" className="mt-3 text-[var(--color-primary)]">
                  {metric.value}
                </Text>
              </motion.div>
              <Text as="p" variant="small" color="muted" className="mt-2">
                {metric.note}
              </Text>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Mood Chart + Gauge ── */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="h6" weight="bold">
              7-day mood rhythm
            </Text>
            <Text as="p" variant="small" color="secondary" className="mt-1">
              Enough signal to notice a pattern, without the obsession.
            </Text>
            <div className="mt-6 h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodHistory} barCategoryGap="20%">
                  <CartesianGrid vertical={false} stroke="var(--color-border-light)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 12, fontWeight: 500 }}
                    tickMargin={8}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                    tickMargin={4}
                    width={24}
                  />
                  <Tooltip content={<MoodTooltip />} cursor={{ fill: "var(--color-surface-strong)", radius: 6 }} />
                  <Bar dataKey="score" fill="var(--color-primary)" radius={[6, 6, 2, 2]} maxBarSize={36} animationDuration={800} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card variant="subtle" padding="lg" className="h-full">
            <Text as="p" variant="h6" weight="bold">
              Mood overview
            </Text>
            <div className="mt-5 flex flex-col items-center">
              <MoodGauge value={averageMood} max={5} size={130} />
              <Text as="p" variant="small" color="secondary" weight="medium" className="mt-3">
                Average mood this week
              </Text>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-[calc(var(--radius-md)*var(--brm))] squircle bg-[var(--color-surface-strong)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FiSun className="h-4 w-4 text-[var(--color-accent)]" />
                  <Text as="p" variant="small" weight="medium">Best day</Text>
                </div>
                <Text as="p" variant="small" weight="bold" color="brand">
                  {bestDay ? `${bestDay.day} (${bestDay.score}/5)` : "—"}
                </Text>
              </div>

              <div className="flex items-center justify-between rounded-[calc(var(--radius-md)*var(--brm))] squircle bg-[var(--color-surface-strong)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FiActivity className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <Text as="p" variant="small" weight="medium">Lowest day</Text>
                </div>
                <Text as="p" variant="small" weight="bold">
                  {worstDay ? `${worstDay.day} (${worstDay.score}/5)` : "—"}
                </Text>
              </div>

              <div className="flex items-center justify-between rounded-[calc(var(--radius-md)*var(--brm))] squircle bg-[var(--color-surface-strong)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="h-4 w-4 text-[var(--color-success)]" />
                  <Text as="p" variant="small" weight="medium">Trend</Text>
                </div>
                <Text as="p" variant="small" weight="bold" color={trendDirection === "improving" ? "success" : "primary"}>
                  {trendDirection === "improving" && "↗ Improving"}
                  {trendDirection === "declining" && "↘ Declining"}
                  {trendDirection === "steady" && "→ Steady"}
                </Text>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Check-in Calendar + Session Summary ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card variant="default" padding="lg" className="h-full">
            <Text as="p" variant="h6" weight="bold">Weekly check-ins</Text>
            <Text as="p" variant="small" color="secondary" className="mt-1">
              Consistency matters more than perfection.
            </Text>

            <div className="mt-6 flex items-center justify-between gap-2">
              {moodHistory.map((item, i) => {
                const isToday = i === moodHistory.length - 1;
                const completed = item.score > 0;
                return (
                  <motion.div
                    key={item.day}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <Text as="span" variant="small" weight="medium" color="muted">{item.day}</Text>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        completed
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : isToday
                            ? "border-[var(--color-primary)] border-dashed bg-transparent"
                            : "border-[var(--color-border)] bg-[var(--color-surface)]"
                      }`}
                    >
                      {completed ? (
                        <FiCheckCircle className="h-5 w-5 text-[var(--color-primary)]" />
                      ) : isToday ? (
                        <motion.div
                          className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-[var(--color-gray-200)]" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[var(--color-surface-strong)] px-4 py-2"
            >
              <Text as="span" variant="small" weight="bold" color="brand">
                {data?.streak || 0} day streak
              </Text>
              {(data?.streak || 0) > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                >
                  🔥
                </motion.span>
              )}
            </motion.div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <Card variant="elevated" padding="lg" className="h-full">
            <Text as="p" variant="h6" weight="bold">Session summary</Text>
            <Text as="p" variant="small" color="secondary" className="mt-1">
              Your engagement this month.
            </Text>

            <div className="mt-6 grid gap-4">
              {[
                { label: "Total sessions", value: `${data?.activeChats || 0}`, icon: <FiMessageSquare className="h-4 w-4" /> },
                { label: "This month", value: `${data?.activeChats || 0}`, icon: <FiCalendar className="h-4 w-4" /> },
                { label: "Check-ins logged", value: `${completedDays}/7`, icon: <FiCheckCircle className="h-4 w-4" /> },
                { label: "Avg mood score", value: averageMood > 0 ? `${averageMood.toFixed(1)}/5` : "—", icon: <FiActivity className="h-4 w-4" /> },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[calc(var(--radius-sm)*var(--brm))] squircle bg-[var(--color-surface-strong)] text-[var(--color-text-muted)]">
                      {stat.icon}
                    </div>
                    <Text as="p" variant="small" weight="medium">{stat.label}</Text>
                  </div>
                  <Text as="p" variant="h6" weight="bold" className="text-[var(--color-primary)]">
                    {stat.value}
                  </Text>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <Text as="p" variant="small" weight="medium" color="secondary">Common topics</Text>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {["Stress", "Sleep", "Academics", "Confidence"].map((topic) => (
                  <span key={topic} className="status-pill">{topic}</span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Your Counselors ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Text as="p" variant="h6" weight="bold">Your counselors</Text>
              <Text as="p" variant="small" color="secondary" className="mt-1">
                Book a session — anonymous, named, or crisis.
              </Text>
            </div>
            <Button href="/student/book" variant="warm" size="sm">View all slots</Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {counselors.map((doc, i) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href="/student/book"
                  className="interactive-panel group flex flex-col gap-4 rounded-[calc(var(--radius-lg)*var(--brm))] squircle p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-span font-bold text-white"
                      style={{ backgroundColor: doc.color }}
                    >
                      {doc.avatar}
                    </div>
                    <div className="min-w-0">
                      <Text as="p" variant="label" weight="bold" className="truncate">{doc.name}</Text>
                      <Text as="p" variant="small" color="muted">{doc.title}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                    <FiUser className="h-3.5 w-3.5 shrink-0" />
                    <Text as="p" variant="small" color="secondary">{doc.focus}</Text>
                  </div>
                  <div className="flex items-center justify-between rounded-full bg-[var(--color-surface-strong)] px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                      <Text as="span" variant="small" weight="bold">{doc.nextSlot}</Text>
                    </div>
                    <span className="status-pill !min-h-0 !py-0.5 !px-2 text-[11px]">
                      {doc.slots.length} slots
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.75 }}
      >
        <Card variant="elevated" padding="lg">
          <Text as="p" variant="h6" weight="bold">Quick actions</Text>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {actionTiles.map((tile, index) => (
              <motion.div
                key={tile.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.08 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={tile.href}
                  className="interactive-panel group flex flex-col items-center gap-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle p-5 text-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-strong)]">
                    {tile.icon}
                  </div>
                  <div>
                    <Text as="p" variant="label" weight="bold">{tile.title}</Text>
                    <Text as="p" variant="small" color="secondary" className="mt-1">{tile.description}</Text>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Resources ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <Card variant="default" padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Text as="p" variant="h6" weight="bold">Saved and suggested</Text>
            <Button href="/student/resources" variant="warm" size="sm">Browse library</Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {staticResources.slice(0, 4).map((resource, index) => (
              <motion.a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.08 }}
                whileHover={{ y: -2 }}
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
                  <Text as="span" variant="label" weight="medium" color="secondary">{resource.type}</Text>
                </div>
                <Text as="p" variant="body" weight="bold" className="mt-3">{resource.title}</Text>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Text as="p" variant="label" weight="medium" color="muted">{resource.duration}</Text>
                  <span className="status-pill">Open</span>
                </div>
              </motion.a>
            ))}
          </div>
        </Card>
      </motion.div>
    </>
  );
}
