"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Text } from "@/components/ui";
import staticResources from "@/content/static-resources.json";
import { MoodGauge } from "./MoodGauge";
import type { DashboardData } from "./types";

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
 onOpenSidebar: () => void;
 onOpenBooking: () => void;
}

const assessmentTone: Record<NonNullable<DashboardData["latestAssessment"]>["severity"], string> = {
 none: "Stable",
 mild: "Gentle watch",
 moderate: "Needs attention",
 severe: "Priority support",
};

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

  onOpenSidebar,
  onOpenBooking,
}: BridgeTabProps) {
  const latestAssessment = data?.latestAssessment;
  const assessmentLabel = latestAssessment ? assessmentTone[latestAssessment.severity] : "No guided scan yet";
  const assessmentCopy = latestAssessment?.criteriaFlagged.length
    ? latestAssessment.criteriaFlagged
        .slice(0, 3)
        .map((item) => item.replaceAll("_", " "))
        .join(" · ")
    : "Run a question set for a richer mood read.";

  return (
    <>
        <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--surface-default)] lg:m-2 lg:rounded-[1.5rem] lg:border lg:border-[var(--border-default)] lg:shadow-sm">
          <header className="absolute top-0 left-0 z-20 flex w-full items-center p-4 lg:hidden bg-gradient-to-b from-[var(--bg-page)] to-transparent">
             <button
              type="button"
              onClick={onOpenSidebar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-default)] text-[var(--text-secondary)] shadow-sm border border-[var(--border-default)]"
            >
              <Icon icon="tabler:menu-2" className="h-5 w-5" />
            </button>
          </header>

 <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
 <motion.div 
   initial="initial"
   animate="animate"
   variants={{
     animate: {
       transition: {
         staggerChildren: 0.08,
         delayChildren: 0.1
       }
     }
   }}
   className="mx-auto max-w-6xl space-y-5"
 >

 {/* ── Section 1: Welcome Hero ── */}
 <motion.div 
   variants={{
     initial: { opacity: 0, y: 12 },
     animate: { opacity: 1, y: 0 }
   }}
   className="rounded-2xl bg-[var(--surface-strong)] p-6 sm:p-8"
 >
 <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
 Weekly overview
 </Text>
 <Text as="h2" variant="h4" weight="bold" className="mt-2 text-[var(--text-primary)]">
 Welcome back, {userName}
 </Text>
 <Text as="p" variant="body" className="mt-2 max-w-2xl leading-7 text-[var(--text-secondary)]">
 Your streak, mood rhythm, and latest guided scan are all in one place so it is easier to notice what needs attention.
 </Text>
 </motion.div>

 {/* ── Section 2: Quick Stats ── */}
 <motion.div 
   variants={{
     initial: { opacity: 0, y: 12 },
     animate: { opacity: 1, y: 0 }
   }}
   className="grid gap-3 grid-cols-2 xl:grid-cols-4"
 >
 {metrics.map((metric, index) => (
 <div
 key={metric.label}
 >
 <div className="group h-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-all duration-200 hover:shadow-md hover:border-[var(--border-strong)] active:scale-[0.98] cursor-pointer">
 <div className="flex items-center justify-between">
 <Text as="p" variant="small" weight="medium" className="text-[var(--text-muted)]">
 {metric.label}
 </Text>
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-strong)] transition-all group-hover:bg-[var(--action-primary-light)] group-hover:scale-105">
 {metric.icon}
 </div>
 </div>
 <Text as="p" variant="h5" weight="bold" className="mt-3 text-[var(--text-primary)]">
 {metric.value}
 </Text>
 <Text as="p" variant="small" className="mt-0.5 text-[var(--text-muted)]">
 {metric.note}
 </Text>
 </div>
 </div>
 ))}
 </motion.div>

 {/* ── Section 3: Guided Scan Status ── */}
 <motion.div 
   variants={{
     initial: { opacity: 0, y: 12 },
     animate: { opacity: 1, y: 0 }
   }}
   className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 sm:p-6"
 >
 <div className="flex items-start gap-4">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--action-primary-light)] text-[var(--action-primary)]">
 <Icon icon="tabler:compass" className="h-5 w-5" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between gap-3">
 <Text as="p" variant="body" weight="bold" className="text-[var(--text-primary)]">
 Guided scan status
 </Text>
 <button
 type="button"
 onClick={onOpenQuestionnaire}
 className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--action-primary)] transition-all hover:bg-[var(--action-primary-light)] active:scale-95"
 >
 <Icon icon="tabler:refresh" className="h-3.5 w-3.5" />
 Refresh
 </button>
 </div>
 <Text as="p" variant="small" className="mt-1 text-[var(--text-secondary)]">
 {assessmentLabel}
 </Text>
 <Text as="p" variant="small" className="mt-0.5 text-[var(--text-muted)]">
 {assessmentCopy}
 </Text>
 </div>
 </div>
 </motion.div>

 {/* ── Section 4: Mood Chart + Snapshot ── */}
 <motion.div 
   variants={{
     initial: { opacity: 0, y: 12 },
     animate: { opacity: 1, y: 0 }
   }}
   className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"
 >
 <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 sm:p-6">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <Text as="p" variant="body" weight="bold" className="text-[var(--text-primary)]">
 7-day mood rhythm
 </Text>
 <Text as="p" variant="small" className="mt-1 text-[var(--text-muted)]">
 {completedDays}/7 days logged this week
 </Text>
 </div>

 <span className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] ${
 trendDirection === "improving"
 ? "bg-[var(--status-success-soft)] text-[var(--status-success-dark)]"
 : trendDirection === "declining"
 ? "bg-[var(--status-warning-soft)] text-[var(--status-warning)]"
 : "bg-[var(--surface-strong)] text-[var(--text-secondary)]"
 }`}>
 {trendDirection === "improving" && "Improving"}
 {trendDirection === "declining" && "Needs attention"}
 {trendDirection === "steady" && "Steady"}
 </span>
 </div>

 {/* Custom Bar Chart */}
 <div className="mt-6">
 <div className="flex items-end justify-between gap-1.5" style={{ height: 180 }}>
 {moodHistory.map((entry) => {
 const barHeight = entry.score > 0 ? Math.max((entry.score / 5) * 100, 8) : 0;
 const barColor = entry.score <= 0 ? "var(--surface-strong)"
 : entry.score <= 1.5 ? "#ef4444"
 : entry.score <= 2.5 ? "#f59e0b"
 : entry.score <= 3.5 ? "#B58863"
 : "#739552";

 return (
 <div key={entry.day} className="group flex flex-1 flex-col items-center gap-2">
 <div className="relative flex w-full items-end justify-center" style={{ height: 140 }}>
 {entry.score > 0 ? (
 <motion.div
 initial={{ height: 0 }}
 animate={{ height: `${barHeight}%` }}
 transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
 className="relative w-[clamp(20px,70%,36px)] rounded-t-lg transition-all group-hover:opacity-80"
 style={{ backgroundColor: barColor }}
 >
 {/* Tooltip on hover */}
 <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--text-primary)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-inverse)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
 {entry.score}/5
 </div>
 </motion.div>
 ) : (
 <div className="w-[clamp(20px,70%,36px)] rounded-t-lg bg-[var(--surface-strong)]" style={{ height: '6%' }} />
 )}
 </div>
 <span className="text-[11px] font-semibold text-[var(--text-muted)]">{entry.day}</span>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 sm:p-6 flex flex-col">
 <Text as="p" variant="body" weight="bold" className="text-[var(--text-primary)]">
 Mood snapshot
 </Text>
 <div className="mt-4 flex flex-1 items-center justify-center">
 <MoodGauge value={averageMood} max={5} size={160} />
 </div>

 <div className="mt-4 grid grid-cols-3 gap-2">
 <div className="flex flex-col items-center rounded-xl bg-[var(--surface-strong)]/50 px-3 py-3">
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Best</span>
 <span className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{bestDay ? bestDay.day : "—"}</span>
 </div>
 <div className="flex flex-col items-center rounded-xl bg-[var(--surface-strong)]/50 px-3 py-3">
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Lowest</span>
 <span className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{worstDay ? worstDay.day : "—"}</span>
 </div>
 <div className="flex flex-col items-center rounded-xl bg-[var(--surface-strong)]/50 px-3 py-3">
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Trend</span>
 <span className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">
 {trendDirection === "improving" ? "↑ Up" : trendDirection === "declining" ? "↓ Down" : "→ Steady"}
 </span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* ── Section 5: Next Moves ── */}
 <motion.div 
   variants={{
     initial: { opacity: 0, y: 12 },
     animate: { opacity: 1, y: 0 }
   }}
   className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]"
 >
 <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 sm:p-6">
 <Text as="p" variant="body" weight="bold" className="text-[var(--text-primary)]">
 Next moves
 </Text>

 <div className="mt-4 grid gap-2.5">
 <CompactAction
 icon={<Icon icon="tabler:bolt" className="h-4 w-4" />}
 title="Guided question check-in"
 copy="Fresh mixed-category questions and a saved assessment."
 action="Start now"
 onClick={onOpenQuestionnaire}
 />
 <CompactAction
 icon={<Icon icon="tabler:calendar-plus" className="h-4 w-4" />}
 title="Book session"
 copy="Reserve a support slot when you want a human conversation."
 action="Open booking"
 onClick={onOpenBooking}
 />
 <CompactAction
 icon={<Icon icon="tabler:book" className="h-4 w-4" />}
 title="Library"
 copy="Browse resources and readings."
 action="View"
 onClick={() => window.location.href = '/student/resources'}
 />
 </div>
 </div>

 <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 sm:p-6">
 <div className="flex items-center justify-between gap-3">
 <div>
 <Text as="p" variant="body" weight="bold" className="text-[var(--text-primary)]">
 Recommended for you
 </Text>
 <Text as="p" variant="small" className="mt-1 text-[var(--text-muted)]">
 Calm, short resources to keep nearby.
 </Text>
 </div>
 <Button href="/student/resources" variant="ghost" size="sm" className="gap-1">
 View all <Icon icon="tabler:arrow-right" className="h-4 w-4" />
 </Button>
 </div>

 <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
 {staticResources.slice(0, 4).map((resource) => (
 <a
 key={resource.title}
 href={resource.url}
 target="_blank"
 rel="noopener noreferrer"
 className="group rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-sm active:scale-[0.98]"
 >
 <div className="flex items-center gap-2 text-[var(--text-muted)]">
 <Icon icon="tabler:book" className="h-3.5 w-3.5" />
 <Text as="span" variant="small" className="text-[var(--text-muted)]">
 {resource.type}
 </Text>
 </div>
 <Text as="p" variant="small" weight="medium" className="mt-2 line-clamp-2 text-[var(--text-primary)] leading-snug">
 {resource.title}
 </Text>
 <div className="mt-3 flex items-center justify-between">
 <Text as="p" variant="small" className="text-[var(--text-muted)]">
 {resource.duration}
 </Text>
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--action-primary)] opacity-0 transition-opacity group-hover:opacity-100">
 Open
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
 </span>
 </div>
 </a>
 ))}
 </div>
 </div>
 </motion.div>

 </motion.div>
 </div>
 </section>
    </>
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
 className="group flex items-start gap-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] p-4 text-left transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-sm active:scale-[0.98]"
 >
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-strong)] text-[var(--action-primary)] transition-all group-hover:bg-[var(--action-primary-light)] group-hover:scale-105">
 {icon}
 </div>
 <div className="min-w-0">
 <Text as="p" variant="small" weight="bold" className="text-[var(--text-primary)]">
 {title}
 </Text>
 <Text as="p" variant="small" className="mt-0.5 leading-5 text-[var(--text-muted)]">
 {copy}
 </Text>
 <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--action-primary)]">
 {action}
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
 </span>
 </div>
 </button>
 );
}
