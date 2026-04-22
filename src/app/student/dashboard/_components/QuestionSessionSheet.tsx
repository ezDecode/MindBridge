"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Icon } from '@iconify/react';

interface SessionQuestionOption {
 label: string;
 value: number;
}

interface SessionQuestion {
 id: number;
 category: string;
 question: string;
 source: string;
 flags: {
 safety: boolean;
 recommended_action: string;
 };
 options: SessionQuestionOption[];
}

interface QuestionInsight {
 category: string;
 label: string;
 intensity: "low" | "medium" | "high";
 score: number;
}

interface QuestionSummary {
 severity: "none" | "mild" | "moderate" | "severe";
 moodLabel: string;
 tone: string;
 balanceScore: number;
 distressScore: number;
 derivedMoodScore: number;
 criteriaFlagged: string[];
 topInsights: QuestionInsight[];
 hasSafetyConcern: boolean;
 answeredCount: number;
 nextSteps: string[];
}

interface SessionPayload {
 sessionId: string;
 estimatedMinutes: number;
 questions: SessionQuestion[];
}

interface QuestionSessionSheetProps {
 isOpen: boolean;
 onClose: () => void;
 onComplete?: () => void;
 onChatRequested?: () => void;
}

const categoryLabels: Record<string, string> = {
 anxiety: "Anxiety",
 appetite: "Appetite",
 concentration: "Focus",
 coping: "Coping",
 depression: "Mood",
 energy: "Energy",
 irritability: "Irritability",
 other: "Mood shifts",
 sleep: "Sleep",
 social_functioning: "Connection",
 stress: "Stress",
 substance_use: "Alcohol use",
 suicidal_risk: "Safety",
 wellbeing: "Wellbeing",
};

const severityTone: Record<QuestionSummary["severity"], string> = {
 none: "Quiet signal",
 mild: "Gentle nudge",
 moderate: "Support worth planning",
 severe: "Support worth prioritizing",
};

const severityStyles: Record<QuestionSummary["severity"], string> = {
 none: "border-emerald-200 bg-emerald-50 text-emerald-700",
 mild: "border-sky-200 bg-sky-50 text-sky-700",
 moderate: "border-amber-200 bg-amber-50 text-amber-700",
 severe: "border-rose-200 bg-rose-50 text-rose-700",
};

const intensityStyles: Record<QuestionInsight["intensity"], string> = {
 low: "bg-[var(--surface-warm)] text-[var(--text-secondary)]",
 medium: "bg-[var(--status-info-soft)] text-[var(--status-info)]",
 high: "bg-[var(--status-error-soft)] text-[var(--status-error)]",
};

export function QuestionSessionSheet({
 isOpen,
 onClose,
 onComplete,
 onChatRequested,
}: QuestionSessionSheetProps) {
 const router = useRouter();
 const [session, setSession] = useState<SessionPayload | null>(null);
 const [responses, setResponses] = useState<Record<number, number>>({});
 const [step, setStep] = useState(0);
 const [summary, setSummary] = useState<QuestionSummary | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const currentQuestion = session?.questions[step] ?? null;
 const progress = session?.questions.length
 ? summary
 ? 100
 : ((step + 1) / session.questions.length) * 100
 : 0;


 const loadSession = async () => {
 setIsLoading(true);
 setError(null);
 setSummary(null);
 setResponses({});
 setStep(0);

 try {
 const response = await fetch("/api/questions/session?count=8");
 const payload = await response.json();

 if (!response.ok) {
 throw new Error(payload.error || "Could not load questions right now.");
 }

 setSession(payload);
 } catch (loadError) {
 const message =
 loadError instanceof Error ? loadError.message : "Could not load questions right now.";
 setError(message);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 if (isOpen) {
 void loadSession();
 return;
 }

 setSession(null);
 setResponses({});
 setStep(0);
 setSummary(null);
 setError(null);
 setIsLoading(false);
 setIsSubmitting(false);
 }, [isOpen]);

 const handleAnswerSelect = (questionId: number, value: number) => {
 const nextResponses = { ...responses, [questionId]: value };
 setResponses(nextResponses);

 if (session) {
 setTimeout(() => {
 if (step < session.questions.length - 1) {
 setStep((s) => s + 1);
 } else {
 void handleSubmit(nextResponses);
 }
 }, 400);
 }
 };

 const handleSubmit = async (overrideResponses?: Record<number, number>) => {
 if (!session) return;

 const currentResponses = overrideResponses || responses;
 const payload = session.questions.map((question) => ({
 questionId: question.id,
 value: currentResponses[question.id],
 }));

 if (payload.some((response) => typeof response.value !== "number")) {
 return;
 }

 setIsSubmitting(true);
 setError(null);

 try {
 const response = await fetch("/api/questions/analyze", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ responses: payload }),
 });
 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || "Could not analyze this check-in right now.");
 }

 setSummary(result.summary as QuestionSummary);
 onComplete?.();
 } catch (submitError) {
 const message =
 submitError instanceof Error
 ? submitError.message
 : "Could not analyze this check-in right now.";
 setError(message);
 } finally {
 setIsSubmitting(false);
 }
 };

 const canGoNext = currentQuestion ? typeof responses[currentQuestion.id] === "number" : false;

 return (
 <AnimatePresence>
 {isOpen && (
 <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.3 }}
 className="absolute inset-0 bg-[var(--action-primary)]/40 backdrop-blur-sm"
 onClick={onClose}
 />

 <motion.div
   initial={{ opacity: 0, y: 12, scale: 0.98 }}
   animate={{ opacity: 1, y: 0, scale: 1 }}
   exit={{ opacity: 0, y: 12, scale: 0.98 }}
   transition={{ type: "spring", duration: 0.4, bounce: 0 }}
   className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl sm:max-h-[85vh] sm:rounded-[2rem]"
 >
 {/* Top Progress Bar */}
 {!summary && session && (
 <div className="absolute inset-x-0 top-0 h-1 w-full bg-[var(--surface-warm)]">
 <motion.div
 animate={{ width: `${progress}%` }}
 className="h-full bg-[var(--action-primary)]"
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 />
 </div>
 )}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-4 pt-5">
 <div className="flex items-center gap-2.5">
 {summary ? (
 <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
 Check-in Summary
 </h2>
 ) : currentQuestion ? (
 <>
 <span className="rounded-xl bg-[var(--surface-warm)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ring-1 ring-[var(--border-default)]/5">
 {categoryLabels[currentQuestion.category] || currentQuestion.category}
 </span>
 <span className="text-xs font-semibold text-[var(--text-muted)] tabular-nums">
 {step + 1} of {session?.questions.length || 0}
 </span>
 </>
 ) : (
 <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
 Guided Check-in
 </h2>
 )}
 </div>

 <button
 type="button"
 onClick={onClose}
 className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-warm)] hover:text-[var(--text-primary)] active:scale-[0.92]"
 >
 <Icon icon="tabler:x" className="h-5 w-5" />
 </button>
 </div>

 {/* Content Area */}
 <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-10">
 {isLoading ? (
 <div className="flex h-full min-h-[30vh] items-center justify-center">
 <div className="text-center">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-warm)] text-[var(--action-primary)] shadow-sm ring-1 ring-[var(--action-primary)]/10">
 <Icon icon="tabler:loader" className="h-7 w-7 animate-spin" />
 </div>
 <p className="mt-5 text-base font-bold text-[var(--text-primary)] tracking-tight">
 Curating your mix...
 </p>
 </div>
 </div>
 ) : error && !session && !summary ? (
 <div className="mx-auto flex h-full min-h-[30vh] max-w-xs flex-col items-center justify-center text-center">
 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--status-error-soft)] text-[var(--status-error)] shadow-sm">
 <Icon icon="tabler:alert-triangle" className="h-7 w-7" />
 </div>
 <p className="mt-5 text-lg font-bold text-[var(--text-primary)] tracking-tight">
 We hit a small bump
 </p>
 <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] text-wrap-pretty">
 {error}
 </p>
 <button
 type="button"
 onClick={() => void loadSession()}
 className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--action-primary)] px-6 text-sm font-bold text-[var(--text-inverse)] shadow-md transition-all active:scale-[0.96]"
 >
 <Icon icon="tabler:refresh" className="h-4 w-4" />
 Try again
 </button>
 </div>
 ) : summary ? (
 <div className="mx-auto w-full max-w-2xl space-y-8 pb-4">
 {/* ── Main Mood Result Section ── */}
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-page)] p-6 sm:p-10 shadow-sm"
 >
 <div className="flex flex-wrap items-center gap-3">
 <span className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${severityStyles[summary.severity]}`}>
 {severityTone[summary.severity]}
 </span>
 <div className="h-4 w-px bg-[var(--border-default)]/60 mx-1" />
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight tabular-nums">
 Overall Score {summary.derivedMoodScore}/5
 </span>
 </div>

 <h3 className="mt-6 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl text-wrap-balance leading-[1.1]">
 {summary.moodLabel}
 </h3>
 <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)] text-wrap-pretty max-w-xl">
 {summary.tone}
 </p>

 <div className="mt-10 flex flex-wrap items-center gap-4">
 <button
 type="button"
 onClick={() => { onChatRequested?.(); onClose(); }}
 className="inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-[var(--action-primary)] px-6 text-sm font-bold text-[var(--text-inverse)] shadow-md transition-all active:scale-[0.96]"
 >
 <Icon icon="tabler:message-circle" className="h-4.5 w-4.5" />
 Talk through it
 </button>
 <button
 type="button"
 onClick={() => router.push("/student/book")}
 className="inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-[var(--surface-default)] px-6 text-sm font-bold text-[var(--text-primary)] border border-[var(--border-default)] shadow-sm transition-all hover:bg-[var(--surface-warm)] active:scale-[0.96]"
 >
 <Icon icon="tabler:calendar" className="h-4.5 w-4.5" />
 Book support
 </button>
 </div>
 </motion.div>

 {summary.hasSafetyConcern && (
 <div className="rounded-2xl border border-[var(--status-error)]/20 bg-[var(--status-error-soft)] p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-default)] text-[var(--status-error)] shadow-sm ring-1 ring-[var(--status-error)]/10">
 <Icon icon="tabler:alert-triangle" className="h-6 w-6" />
 </div>
 <div className="pt-0.5">
 <p className="text-base font-bold text-[var(--text-primary)] tracking-tight">
 Immediate support is available
 </p>
 <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)] text-wrap-pretty max-w-lg">
 Please reach out to iCall at <a className="font-bold underline decoration-rose-500/40" href="tel:9152987821">9152987821</a> or your local emergency team right now. You don&apos;t have to carry this alone.
 </p>
 </div>
 </div>
 </div>
 )}

 {/* ── Insights & Action Grid ── */}
 <div className="grid gap-8 pt-2 sm:grid-cols-2">
 <section>
 <div className="flex items-center gap-2 mb-4 ml-1">
 <div className="h-1.5 w-1.5 rounded-full bg-[var(--action-primary)]" />
 <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
 Strongest signals
 </h4>
 </div>
 <div className="space-y-2.5">
 {summary.topInsights.map((insight) => (
 <div
 key={insight.category}
 className="group flex items-center justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] px-5 py-3.5 shadow-sm transition-colors hover:border-[var(--border-strong)]"
 >
 <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">
 {insight.label}
 </p>
 <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${intensityStyles[insight.intensity]}`}>
 {insight.intensity}
 </span>
 </div>
 ))}
 </div>
 </section>

 <section>
 <div className="flex items-center gap-2 mb-4 ml-1">
 <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-info)]" />
 <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
 Recommended steps
 </h4>
 </div>
 <div className="space-y-3">
 {summary.nextSteps.map((stepText, index) => (
 <div key={stepText} className="flex gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] px-5 py-4 shadow-sm transition-colors hover:border-[var(--border-strong)]">
 <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--action-primary-light)] text-[11px] font-bold text-[var(--action-primary)] tabular-nums ring-1 ring-[var(--action-primary)]/10">
 {index + 1}
 </div>
 <p className="text-[13px] font-medium leading-relaxed text-[var(--text-primary)] text-wrap-pretty">
 {stepText}
 </p>
 </div>
 ))}
 </div>
 </section>
 </div>
 </div>
 ) : currentQuestion ? (
 <div className="mx-auto flex w-full max-w-xl flex-col pb-6">
 <div className="mb-10 text-center sm:text-left">
 <div className="inline-flex items-center justify-center rounded-lg bg-[var(--surface-warm)] px-2.5 py-1 mb-4">
 <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--action-primary)]">
 {categoryLabels[currentQuestion.category] || currentQuestion.category}
 </span>
 </div>
 <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl sm:leading-[1.15] text-wrap-balance">
 {currentQuestion.question}
 </h3>
 </div>

 <div className="grid gap-3">
 {currentQuestion.options.map((option, optionIndex) => {
 const selected = responses[currentQuestion.id] === option.value;

 return (
 <motion.button
 key={`${currentQuestion.id}-${option.value}`}
 type="button"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: optionIndex * 0.04, ease: [0.2, 0, 0, 1] }}
 onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
 className={`group flex items-center justify-between gap-4 rounded-[1.5rem] border px-6 py-5 text-left transition-all active:scale-[0.98] ${
 selected
 ? "border-[var(--action-primary)] bg-[var(--action-primary-light)] shadow-md ring-1 ring-[var(--action-primary)]/10"
 : "border-[var(--border-default)] bg-[var(--surface-default)] hover:border-[var(--border-strong)] hover:shadow-sm"
 }`}
 >
 <span className={`text-lg font-semibold ${selected ? "text-[var(--action-primary)]" : "text-[var(--text-primary)]"}`}>
 {option.label}
 </span>
 <div className={cn(
 "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
 selected ? "border-[var(--action-primary)] bg-[var(--action-primary)] shadow-sm" : "border-[var(--border-default)] group-hover:border-[var(--border-strong)]"
 )}>
 {selected && <Icon icon="tabler:check" className="h-4 w-4 text-[var(--text-inverse)] stroke-[3.5]" />}
 </div>
 </motion.button>
 );
 })}
 </div>
 </div>
 ) : null}
 </div>

 {/* Footer */}
 {!summary && session && (
 <div className="border-t border-[var(--border-default)] bg-[var(--surface-default)] px-6 py-5 sm:px-10">
 <div className="mx-auto flex max-w-lg flex-row-reverse items-center justify-between">
 <button
 type="button"
 onClick={() => {
 if (step === session.questions.length - 1) {
 void handleSubmit();
 } else {
 setStep((current) => current + 1);
 }
 }}
 disabled={!canGoNext || isSubmitting}
 className="inline-flex h-11 min-w-[8rem] items-center justify-center gap-2 rounded-full bg-[var(--action-primary)] px-6 text-sm font-bold text-[var(--text-inverse)] shadow-md transition-all active:scale-[0.96] disabled:pointer-events-none disabled:opacity-30"
 >
 {isSubmitting ? (
 <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
 ) : (
 <>
 {step === session.questions.length - 1 ? "Complete" : "Continue"}
 <Icon icon="tabler:arrow-right" className="h-4 w-4" />
 </>
 )}
 </button>

 <button
 type="button"
 onClick={() => setStep((current) => Math.max(0, current - 1))}
 disabled={step === 0}
 className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] active:scale-[0.96] disabled:invisible"
 >
 <Icon icon="tabler:arrow-left" className="h-4 w-4" />
 Back
 </button>
 </div>
 </div>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 );
}
