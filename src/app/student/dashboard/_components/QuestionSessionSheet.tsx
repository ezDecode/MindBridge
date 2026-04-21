"use client";

import { useEffect, useMemo, useState } from "react";
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

 const usedCategories = useMemo(() => {
 if (!session) return [];
 return Array.from(new Set(session.questions.map((question) => question.category)));
 }, [session]);

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
 const answerCount = Object.keys(responses).length;

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
 initial={{ opacity: 0, y: "100%", scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: "100%", scale: 0.98 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[24px] border border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl sm:max-h-[85vh] sm:rounded-[24px]"
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
 <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-3.5 pt-4">
 <div className="flex items-center gap-2.5">
 {summary ? (
 <h2 className="text-base font-bold text-[var(--text-primary)]">
 Check-in Summary
 </h2>
 ) : currentQuestion ? (
 <>
 <span className="rounded-full bg-[var(--surface-warm)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
 {categoryLabels[currentQuestion.category] || currentQuestion.category}
 </span>
 <span className="text-xs font-semibold text-[var(--text-muted)]">
 {step + 1} of {session?.questions.length || 0}
 </span>
 </>
 ) : (
 <h2 className="text-base font-bold text-[var(--text-primary)]">
 Guided Check-in
 </h2>
 )}
 </div>

 <button
 type="button"
 onClick={onClose}
 className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-warm)] hover:text-[var(--text-primary)]"
 >
 <Icon icon="tabler:x" className="h-4 w-4" />
 </button>
 </div>

 {/* Content Area */}
 <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
 {isLoading ? (
 <div className="flex h-full min-h-[30vh] items-center justify-center">
 <div className="text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[var(--surface-warm)] text-[var(--action-primary)]">
 <Icon icon="tabler:loader" className="h-6 w-6 animate-spin" />
 </div>
 <p className="mt-4 text-base font-bold text-[var(--text-primary)]">
 Curating your mix...
 </p>
 </div>
 </div>
 ) : error && !session && !summary ? (
 <div className="mx-auto flex h-full min-h-[30vh] max-w-xs flex-col items-center justify-center text-center">
 <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--status-error-soft)] text-[var(--status-error)]">
 <Icon icon="tabler:alert-triangle" className="h-6 w-6" />
 </div>
 <p className="mt-4 text-lg font-bold text-[var(--text-primary)]">
 We hit a small bump
 </p>
 <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
 {error}
 </p>
 <button
 type="button"
 onClick={() => void loadSession()}
 className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--action-primary)] px-5 text-xs font-bold text-[var(--text-inverse)] transition-opacity hover:opacity-90 active:scale-95"
 >
 <Icon icon="tabler:refresh" className="h-3.5 w-3.5" />
 Try again
 </button>
 </div>
 ) : summary ? (
 <div className="mx-auto w-full pb-2">
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-page)] p-5 sm:p-6"
 >
 <div className="flex flex-wrap items-center gap-2">
 <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${severityStyles[summary.severity]}`}>
 {severityTone[summary.severity]}
 </span>
 <span className="rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)]">
 Score {summary.derivedMoodScore}/5
 </span>
 </div>

 <h3 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
 {summary.moodLabel}
 </h3>
 <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
 {summary.tone}
 </p>

 <div className="mt-6 flex flex-wrap items-center gap-2">
 <div className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] px-3.5 py-2 shadow-sm">
 <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Balance</span>
 <span className="text-xs font-bold text-[var(--text-primary)]">{summary.balanceScore}%</span>
 </div>

 <div className="h-4 w-px bg-[var(--border-default)] mx-1 hidden sm:block" />

 <button
 type="button"
 onClick={() => { onChatRequested?.(); onClose(); }}
 className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[var(--action-primary)] px-4 text-xs font-bold text-[var(--text-inverse)] transition-opacity hover:opacity-90 active:scale-95"
 >
 <Icon icon="tabler:message-circle" className="h-3.5 w-3.5" />
 Chat
 </button>
 <button
 type="button"
 onClick={() => router.push("/student/book")}
 className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[var(--surface-default)] px-4 text-xs font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-warm)] active:scale-95"
 >
 <Icon icon="tabler:calendar" className="h-3.5 w-3.5" />
 Support
 </button>
 </div>
 </motion.div>

 {summary.hasSafetyConcern && (
 <div className="mt-4 rounded-md border border-[var(--status-error)]/20 bg-[var(--status-error-soft)] p-4">
 <div className="flex items-start gap-3">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--surface-default)] text-[var(--status-error)]">
 <Icon icon="tabler:alert-triangle" className="h-4.5 w-4.5" />
 </div>
 <div>
 <p className="text-sm font-bold text-[var(--text-primary)]">
 Support is available now
 </p>
 <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
 Please reach out to iCall at <a className="font-bold underline" href="tel:9152987821">9152987821</a> or your local emergency support immediately.
 </p>
 </div>
 </div>
 </div>
 )}

 <div className="mt-6 grid gap-5 sm:grid-cols-2">
 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
 Strongest signals
 </p>
 <div className="mt-2.5 space-y-1.5">
 {summary.topInsights.map((insight) => (
 <div
 key={insight.category}
 className="flex items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--surface-default)] px-3 py-2 shadow-sm"
 >
 <p className="truncate text-xs font-bold text-[var(--text-primary)]">
 {insight.label}
 </p>
 <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${intensityStyles[insight.intensity]}`}>
 {insight.intensity}
 </span>
 </div>
 ))}
 </div>
 </div>

 <div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
 Next steps
 </p>
 <div className="mt-2.5 space-y-2">
 {summary.nextSteps.map((stepText, index) => (
 <div key={stepText} className="flex gap-2.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-default)] px-3.5 py-2.5 shadow-sm">
 <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[var(--action-primary-light)] text-[9px] font-bold text-[var(--action-primary)]">
 {index + 1}
 </div>
 <p className="text-xs font-medium leading-relaxed text-[var(--text-primary)]">
 {stepText}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 ) : currentQuestion ? (
 <div className="mx-auto flex w-full max-w-lg flex-col pb-2">
 <div className="mb-6 text-center sm:text-left">
 <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl sm:leading-tight">
 {currentQuestion.question}
 </h3>
 </div>

 <div className="flex flex-col gap-2.5">
 {currentQuestion.options.map((option, optionIndex) => {
 const selected = responses[currentQuestion.id] === option.value;

 return (
 <motion.button
 key={`${currentQuestion.id}-${option.value}`}
 type="button"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: optionIndex * 0.04 }}
 onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
 className={`group flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
 selected
 ? "border-[var(--action-primary)] bg-[var(--action-primary-light)] shadow-sm"
 : "border-[var(--border-default)] bg-[var(--surface-default)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-default)]"
 }`}
 >
 <span className={`text-[15px] font-semibold ${selected ? "text-[var(--action-primary)]" : "text-[var(--text-primary)]"}`}>
 {option.label}
 </span>
 <div className={cn(
 "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-1.5 transition-all",
 selected ? "border-[var(--action-primary)] bg-[var(--action-primary)]" : "border-[var(--border-default)] group-hover:border-[var(--border-strong)]"
 )}>
 {selected && <Icon icon="tabler:check" className="h-3 w-3 text-[var(--text-primary)] stroke-[3]" />}
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
 <div className="border-t border-[var(--border-default)] bg-[var(--surface-default)] px-5 py-3.5 sm:px-8">
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
 className="inline-flex h-10 min-w-[7rem] items-center justify-center gap-2 rounded-full bg-[var(--action-primary)] px-5 text-xs font-bold text-[var(--text-inverse)] transition-opacity hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
 >
 {isSubmitting ? (
 <Icon icon="tabler:loader" className="h-3.5 w-3.5 animate-spin" />
 ) : (
 <>
 {step === session.questions.length - 1 ? "Complete" : "Continue"}
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5" />
 </>
 )}
 </button>

 <button
 type="button"
 onClick={() => setStep((current) => Math.max(0, current - 1))}
 disabled={step === 0}
 className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:invisible"
 >
 <Icon icon="tabler:arrow-left" className="h-3.5 w-3.5" />
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
