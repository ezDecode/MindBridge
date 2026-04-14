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
  FiArrowRight,
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
import type { DashboardData, TabId } from "./types";

function MoodTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const labels = ["", "Very low", "Strained", "Steady", "Lighter", "Good"];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <Text as="p" variant="label" weight="bold">{label}</Text>
      <Text as="p" variant="small" color="secondary" className="mt-0.5">
        {score > 0 ? `${labels[score] || score} (${score}/5)` : "No check-in"}
      </Text>
    </div>
  );
}

const counselors = [
  {
    name: "Dr. Meera Shah",
    title: "Clinical Psychologist",
    focus: "Exam stress, burnout, panic",
    avatar: "MS",
    color: "#6366f1",
    nextSlot: "Today · 4:30 PM",
    slots: ["Today 4:30 PM", "Tomorrow 11:00 AM", "Thu 2:00 PM"],
  },
  {
    name: "Arjun Rao",
    title: "Counselling Psychologist",
    focus: "Relationships, adjustment, loneliness",
    avatar: "AR",
    color: "#10b981",
    nextSlot: "Tomorrow · 11:30 AM",
    slots: ["Tomorrow 11:30 AM", "Wed 3:00 PM", "Fri 10:00 AM"],
  },
  {
    name: "Dr. Ritika Nair",
    title: "Psychiatrist",
    focus: "Low mood, confidence, academic pressure",
    avatar: "RN",
    color: "#f59e0b",
    nextSlot: "Wed · 3:15 PM",
    slots: ["Wed 3:15 PM", "Thu 4:15 PM", "Fri 1:00 PM"],
  },
];

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
  onSwitchToMind: () => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
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
  onSwitchToMind,
  activeTab,
  setActiveTab,
}: BridgeTabProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Text as="p" variant="body" weight="semibold" className="text-gray-900">
            Analytics
          </Text>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => { setActiveTab('mind'); onSwitchToMind(); }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'mind' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'bridge' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Text as="span" variant="small" className="text-xs font-medium text-gray-500">
            Live
          </Text>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Text as="h1" variant="h3" weight="bold" className="text-gray-900">
              Welcome back, {userName}
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-1">
              Here&apos;s your weekly wellness overview
            </Text>
          </div>
          <Button onClick={onSwitchToMind} variant="primary" size="sm" className="gap-2">
            <FiMessageSquare className="h-4 w-4" />
            Start chatting
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card variant="default" padding="md" className="h-full">
                <div className="flex items-center justify-between">
                  <Text as="p" variant="small" weight="medium" color="secondary">
                    {metric.label}
                  </Text>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    {metric.icon}
                  </div>
                </div>
                <Text as="p" variant="h3" weight="bold" className="mt-2 text-gray-900">
                  {metric.value}
                </Text>
                <Text as="p" variant="small" color="muted" className="mt-1">
                  {metric.note}
                </Text>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card variant="default" padding="lg" className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <Text as="p" variant="h6" weight="bold">
                    7-day mood rhythm
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    Track your emotional pattern throughout the week
                  </Text>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                  <Text as="span" variant="small" className="text-gray-600">{completedDays}/7 logged</Text>
                </div>
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                  <BarChart data={moodHistory} barCategoryGap="24%">
                    <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                      tickMargin={8}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickMargin={4}
                      width={24}
                    />
                    <Tooltip content={<MoodTooltip />} cursor={{ fill: "#f3f4f6", radius: 4 }} />
                    <Bar dataKey="score" fill="#374151" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={400} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card variant="subtle" padding="lg" className="h-full">
              <Text as="p" variant="h6" weight="bold">
                Mood overview
              </Text>
              <div className="mt-6 flex flex-col items-center">
                <MoodGauge value={averageMood} max={5} size={120} />
                <Text as="p" variant="small" color="secondary" weight="medium" className="mt-3">
                  Average mood
                </Text>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FiSun className="h-4 w-4 text-amber-500" />
                    <Text as="p" variant="small" weight="medium">Best day</Text>
                  </div>
                  <Text as="p" variant="small" weight="bold" className="text-gray-900">
                    {bestDay ? `${bestDay.day}` : "—"}
                  </Text>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FiActivity className="h-4 w-4 text-gray-400" />
                    <Text as="p" variant="small" weight="medium">Lowest day</Text>
                  </div>
                  <Text as="p" variant="small" weight="bold" className="text-gray-900">
                    {worstDay ? `${worstDay.day}` : "—"}
                  </Text>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="h-4 w-4 text-emerald-500" />
                    <Text as="p" variant="small" weight="medium">Trend</Text>
                  </div>
                  <Text as="p" variant="small" weight="bold" className={trendDirection === "improving" ? "text-emerald-600" : "text-gray-900"}>
                    {trendDirection === "improving" && "↗ Improving"}
                    {trendDirection === "declining" && "↘ Declining"}
                    {trendDirection === "steady" && "→ Steady"}
                  </Text>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                <Text as="span" variant="small" weight="bold" className="text-gray-900">
                  {data?.streak || 0} day streak
                </Text>
                {(data?.streak || 0) > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    className="text-base"
                  >
                    🔥
                  </motion.span>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card variant="default" padding="lg" className="h-full">
              <Text as="p" variant="h6" weight="bold">Your counselors</Text>
              <Text as="p" variant="small" color="secondary" className="mt-1">
                Book a session when you need support
              </Text>

              <div className="mt-5 grid gap-3">
                {counselors.map((doc) => (
                  <Link
                    key={doc.name}
                    href="/student/book"
                    className="group flex items-center gap-4 rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: doc.color }}
                    >
                      {doc.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text as="p" variant="label" weight="bold" className="truncate">{doc.name}</Text>
                      <Text as="p" variant="small" color="secondary">{doc.title}</Text>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <FiClock className="h-3.5 w-3.5" />
                      <Text as="span" variant="small">{doc.nextSlot}</Text>
                      <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card variant="elevated" padding="lg" className="h-full">
              <div className="flex items-center justify-between">
                <Text as="p" variant="h6" weight="bold">Quick actions</Text>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/student/check-in"
                  className="group flex flex-col items-center gap-3 rounded-lg border border-gray-100 p-4 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>
                  <Text as="p" variant="label" weight="medium">Log check-in</Text>
                </Link>
                <Link
                  href="/student/book"
                  className="group flex flex-col items-center gap-3 rounded-lg border border-gray-100 p-4 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <FiCalendar className="h-5 w-5" />
                  </div>
                  <Text as="p" variant="label" weight="medium">Book session</Text>
                </Link>
                <Link
                  href="/student/resources"
                  className="group flex flex-col items-center gap-3 rounded-lg border border-gray-100 p-4 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <FiBookOpen className="h-5 w-5" />
                  </div>
                  <Text as="p" variant="label" weight="medium">Resources</Text>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6"
        >
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between">
              <Text as="p" variant="h6" weight="bold">Recommended for you</Text>
              <Button href="/student/resources" variant="ghost" size="sm" className="gap-1">
                View all <FiArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {staticResources.slice(0, 4).map((resource) => (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-lg border border-gray-100 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiBookOpen className="h-4 w-4" />
                    <Text as="span" variant="small" weight="medium" color="secondary">{resource.type}</Text>
                  </div>
                  <Text as="p" variant="body" weight="medium" className="mt-3 line-clamp-2">{resource.title}</Text>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <Text as="p" variant="small" color="muted">{resource.duration}</Text>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Open →</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}