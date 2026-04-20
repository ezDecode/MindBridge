"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Icon } from '@iconify/react';
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

interface BridgeTabProps {
 data: DashboardData | null;
 userName: string;
 metrics: { label: string; value: string; note: string; icon: ReactNode }[];
 moodHistory: { day: string; score: number }[];
 averageMood: number;
 bestDay: { day: string; score: number } | null;
 worstDay: { day: string; score: number } | null;
 trendDirection: string;
 completedDays: number;
 onOpenQuestionnaire: () => void;
 onSwitchToMind: () => void;
 activeTab: TabId;
 setActiveTab: (tab: TabId) => void;
}

const assessmentTone: Record<NonNullable<DashboardData["latestAssessment"]>["severity"], string> = {
 none: "Stable",
 mild: "Gentle watch",
 moderate: "Needs attention",
 severe: "Priority support",
};

function MoodTooltip({
 active,
 payload,
 label,
}: {
 active?: boolean;
 payload?: Array<{ value: number }>;
 label?: string;
}) {
 if (!active || !payload?.length) return null;

 const score = payload[0].value;
 const labels = ["", "Very low", "Strained", "Steady", "Lighter", "Good"];

 return (
 <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 shadow-[0_20px_40px_rgba(45,41,38,0.12)] backdrop-blur-md">
 <Text as="p" variant="label" weight="bold" className="text-[var(--color-text-primary)]">
 {label}
 </Text>
 <div className="mt-1.5 flex items-center gap-2">
 <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
 <Text as="p" variant="small" className="text-[var(--color-text-secondary)]">
 {score > 0 ? `${labels[score] || score} (${score}/5)` : "No check-in"}
 </Text>
 </div>
 </div>
 );
}

import { DashboardSidebar } from "./DashboardSidebar";
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
 onOpenQuestionnaire,
 onSwitchToMind,
 activeTab,
 setActiveTab,
}: BridgeTabProps) {
 const [sidebarOpen, setSidebarOpen] = useState(false);
  const latestAssessment = data?.latestAssessment;
 const assessmentLabel = latestAssessment ? assessmentTone[latestAssessment.severity] : "No guided scan yet";
 const assessmentCopy = latestAssessment?.criteriaFlagged.length
 ? latestAssessment.criteriaFlagged
 .slice(0, 3)
 .map((item) => item.replaceAll("_", " "))
 .join(" • ")
 : "Run a question set for a richer mood read.";

 return (
    <>
      <div className="flex h-full min-h-0 bg-[var(--color-surface-tinted)] lg:bg-[var(--color-background)]">
        <DashboardSidebar
          userName={userName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSwitchToBridge={() => {}}
          onSwitchToMind={onSwitchToMind}
          startNewSession={() => {}}
          onOpenQuestionnaire={onOpenQuestionnaire}
          setShowCheckIn={() => {}}
          setShowBookingModal={() => {}}
          setShowAnalyticsModal={() => {}}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-surface)] lg:m-2 lg:rounded-[1.5rem] lg:border lg:border-[var(--color-border)] lg:shadow-sm">
          <header className="absolute top-0 left-0 z-20 flex w-full items-center p-4 lg:hidden bg-gradient-to-b from-[var(--color-background)] to-transparent">
             <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-sm border border-[var(--color-border)]"
            >
              <Icon icon="tabler:menu-2" className="h-5 w-5" />
            </button>
          </header>

 <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
 <div className="mx-auto max-w-6xl">
 <div className="rounded-md border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-light),white_28%)_0%,var(--color-surface)_100%)] p-6 sm:p-7">
 <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr),minmax(18rem,0.85fr)] lg:items-end">
 <div>
 <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
 Weekly overview
 </Text>
 <Text as="h2" variant="h4" weight="bold" className="mt-3 text-[var(--color-text-primary)]">
 Welcome back, {userName}
 </Text>
 <Text as="p" variant="body" className="mt-3 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
 Your streak, mood rhythm, and latest guided scan are all in one place so it is easier to notice what needs attention.
 </Text>

 <div className="mt-5 flex flex-wrap gap-3">
 <Button onClick={onSwitchToMind} size="sm" className="gap-2">
 <Icon icon="tabler:message-circle" className="h-4 w-4" />
 Open chat
 </Button>
 <Button onClick={onOpenQuestionnaire} variant="warm" size="sm" className="gap-2">
 <Icon icon="tabler:bolt" className="h-4 w-4" />
 Start question set
 </Button>
 </div>
 </div>

 <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]/85 p-5">
 <div className="flex items-start gap-3">
 <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-surface-warm)] text-[var(--color-primary)]">
 <Icon icon="tabler:compass" className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
 Guided scan status
 </Text>
 <Text as="p" variant="small" className="mt-2 leading-6 text-[var(--color-text-secondary)]">
 {assessmentLabel}
 </Text>
 <Text as="p" variant="small" className="mt-1 leading-6 text-[var(--color-text-muted)]">
 {assessmentCopy}
 </Text>
 </div>
 </div>

 <button
 type="button"
 onClick={onOpenQuestionnaire}
 className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-primary)] shadow-sm hover:bg-[var(--color-surface-warm)] transition-colors"
 >
 <Icon icon="tabler:bolt" className="h-4 w-4" />
 Refresh question set
 </button>
 </div>
 </div>

 <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
 {metrics.map((metric, index) => (
 <motion.div
 key={metric.label}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
 >
 <Card interactive variant="default" padding="sm" className="h-full bg-[var(--color-surface)]/80">
 <div className="flex items-center justify-between gap-3">
 <Text as="p" variant="small" weight="medium" className="text-[var(--color-text-secondary)]">
 {metric.label}
 </Text>
 <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-warm)] text-[var(--color-primary)] shadow-sm">
 {metric.icon}
 </div>
 </div>
 <Text as="p" variant="h6" weight="bold" className="mt-4 text-[var(--color-text-primary)]">
 {metric.value}
 </Text>
 <Text as="p" variant="small" className="mt-1 leading-6 text-[var(--color-text-muted)]">
 {metric.note}
 </Text>
 </Card>
 </motion.div>
 ))}
 </div>
 </div>

 <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
 <Card variant="default" padding="lg">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <Text as="p" variant="h6" weight="bold" className="text-[var(--color-text-primary)]">
 7-day mood rhythm
 </Text>
 <Text as="p" variant="small" className="mt-1 text-[var(--color-text-secondary)]">
 {completedDays}/7 days logged this week
 </Text>
 </div>

 <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
 {trendDirection === "improving" && "Improving"}
 {trendDirection === "declining" && "Needs attention"}
 {trendDirection === "steady" && "Steady"}
 </span>
 </div>

 <div className="mt-6 h-64">
 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
 <BarChart data={moodHistory} barCategoryGap="24%">
 <CartesianGrid vertical={false} stroke="#e8dfd4" strokeDasharray="4 4" />
 <XAxis
 dataKey="day"
 tickLine={false}
 axisLine={false}
 tick={{ fill: "#8a827a", fontSize: 12, fontWeight: 600 }}
 tickMargin={8}
 />
 <YAxis
 domain={[0, 5]}
 ticks={[1, 2, 3, 4, 5]}
 tickLine={false}
 axisLine={false}
 tick={{ fill: "#8a827a", fontSize: 12 }}
 tickMargin={4}
 width={24}
 />
 <Tooltip content={<MoodTooltip />} cursor={{ fill: "#f9f4f2", radius: 10 }} />
 <Bar
 dataKey="score"
 fill="#f47d4b"
 radius={[10, 10, 0, 0]}
 maxBarSize={40}
 animationDuration={450}
 />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 <Card variant="subtle" padding="lg">
 <Text as="p" variant="h6" weight="bold" className="text-[var(--color-text-primary)]">
 Mood snapshot
 </Text>
 <div className="mt-5 flex items-center justify-center">
 <MoodGauge value={averageMood} max={5} size={124} />
 </div>

 <div className="mt-5 space-y-3">
 <SnapshotRow label="Best day" value={bestDay ? bestDay.day : "—"} />
 <SnapshotRow label="Lowest day" value={worstDay ? worstDay.day : "—"} />
 <SnapshotRow
 label="Trend"
 value={
 trendDirection === "improving"
 ? "Upward"
 : trendDirection === "declining"
 ? "Downward"
 : "Steady"
 }
 />
 </div>
 </Card>
 </div>

 <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
 <Card variant="elevated" padding="lg">
 <Text as="p" variant="h6" weight="bold" className="text-[var(--color-text-primary)]">
 Next moves
 </Text>

 <div className="mt-5 grid gap-3">
 <CompactAction
 icon={<Icon icon="tabler:bolt" className="h-4 w-4" />}
 title="Guided question check-in"
 copy="Fresh mixed-category questions and a saved assessment."
 action="Start now"
 onClick={onOpenQuestionnaire}
 />
 <CompactAction
 icon={<Icon icon="tabler:message-circle" className="h-4 w-4" />}
 title="Talk in chat"
 copy="Use the companion when you want to unpack something in real time."
 action="Open chat"
 onClick={onSwitchToMind}
 />
 <Link
 href="/student/book"
 className="group rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)]"
 >
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface-warm)] text-[var(--color-primary)]">
 <Icon icon="tabler:calendar" className="h-4 w-4" />
 </div>
 <div className="min-w-0">
 <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
 Book counselor
 </Text>
 <Text as="p" variant="small" className="mt-1 leading-6 text-[var(--color-text-secondary)]">
 Reserve a support slot when you want a human conversation.
 </Text>
 <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
 Open booking
 <Icon icon="tabler:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
 </span>
 </div>
 </div>
 </Link>
 </div>
 </Card>

 <Card variant="default" padding="lg">
 <div className="flex items-center justify-between gap-3">
 <div>
 <Text as="p" variant="h6" weight="bold" className="text-[var(--color-text-primary)]">
 Recommended for you
 </Text>
 <Text as="p" variant="small" className="mt-1 text-[var(--color-text-secondary)]">
 Calm, short resources to keep nearby.
 </Text>
 </div>
 <Button href="/student/resources" variant="ghost" size="sm" className="gap-1">
 View all <Icon icon="tabler:arrow-right" className="h-4 w-4" />
 </Button>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 {staticResources.slice(0, 4).map((resource) => (
 <a
 key={resource.title}
 href={resource.url}
 target="_blank"
 rel="noopener noreferrer"
 className="group rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)]"
 >
 <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
 <Icon icon="tabler:book" className="h-4 w-4" />
 <Text as="span" variant="small" className="text-[var(--color-text-secondary)]">
 {resource.type}
 </Text>
 </div>
 <Text as="p" variant="body" weight="medium" className="mt-3 line-clamp-2 text-[var(--color-text-primary)]">
 {resource.title}
 </Text>
 <div className="mt-4 flex items-center justify-between">
 <Text as="p" variant="small" className="text-[var(--color-text-muted)]">
 {resource.duration}
 </Text>
 <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-text-primary)]">
 Open
 <Icon icon="tabler:arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
 </span>
 </div>
 </a>
 ))}
 </div>
 </Card>
 </div>
 </div>
 </div>
 </section>
 </div>
 </>
 );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
 return (
 <div className="flex items-center justify-between rounded-md bg-[var(--color-surface)] px-4 py-3 shadow-sm transition-transform hover:scale-[1.01]">
 <Text as="p" variant="small" weight="medium" className="text-[var(--color-text-secondary)]">
 {label}
 </Text>
 <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
 {value}
 </Text>
 </div>
 );
}

function CompactAction({
 icon,
 title,
 copy,
 action,
 onClick,
}: {
 icon: ReactNode;
 title: string;
 copy: string;
 action: string;
 onClick: () => void;
}) {
 return (
 <button
 type="button"
 onClick={onClick}
 className="group rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-all duration-200 ease-[var(--ease-out)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)] active:scale-[0.97]"
 >
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-warm)] text-[var(--color-primary)] shadow-sm transition-transform group-hover:scale-110">
 {icon}
 </div>
 <div className="min-w-0">
 <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
 {title}
 </Text>
 <Text as="p" variant="small" className="mt-1 leading-6 text-[var(--color-text-secondary)]">
 {copy}
 </Text>
 <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
 {action}
 <Icon icon="tabler:arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
 </span>
 </div>
 </div>
 </button>
 );
}






