"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icon } from '@iconify/react';
import { Button, Card, Text } from "@/components/ui";

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
 none: "border-success/20 bg-success/10 text-success",
 mild: "border-primary/20 bg-primary/10 text-primary",
 moderate: "border-warning/20 bg-warning/10 text-warning",
 severe: "border-danger/20 bg-danger/10 text-danger",
};

const intensityStyles: Record<QuestionInsight["intensity"], string> = {
 low: "bg-white/5 text-text-muted border-white/5",
 medium: "bg-primary/10 text-primary border-primary/20",
 high: "bg-danger/10 text-danger border-danger/20",
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
<>
{isOpen && (
 <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
 <div
 
 
 
 
 className="absolute inset-0 bg-background/80 backdrop-blur-sm"
 onClick={onClose}
 />

 <div
   
   
   
   
   className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-white/10 bg-surface shadow-2xl sm:max-h-[85vh] sm:rounded-lg"
 >
 {/* Top Progress Bar */}
 {!summary && session && (
 <div className="absolute inset-x-0 top-0 h-1 w-full bg-white/5">
 <div
 
 className="h-full bg-primary"
 
 />
 </div>
 )}

 {/* Header */}
 <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 pt-5 bg-white/[0.02]">
 <div className="flex items-center gap-3">
 {summary ? (
 <Text as="h2" variant="body" weight="semibold" className="text-white tracking-tight">
 Check-in Summary
 </Text>
 ) : currentQuestion ? (
 <>
 <span className="rounded bg-white/5 px-2 py-0.5 text-base font-medium text-text-dim border border-white/5">
 {categoryLabels[currentQuestion.category] || currentQuestion.category}
 </span>
 <span className="text-base font-medium text-text-dim tabular-nums">
 {step + 1} of {session?.questions.length || 0}
 </span>
 </>
 ) : (
 <Text as="h2" variant="body" weight="semibold" className="text-white tracking-tight">
 Guided Check-in
 </Text>
 )}
 </div>

 <button
 type="button"
 onClick={onClose}
 className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-text-dim hover:text-white transition-all active:scale-[0.92] border border-white/5"
 >
 <Icon icon="tabler:x" className="h-4 w-4" />
 </button>
 </div>

 {/* Content Area */}
 <div className="min-h-0 flex-1 overflow-y-auto px-6 py-10 sm:px-10 no-scrollbar">
 {isLoading ? (
 <div className="flex h-full min-h-[30vh] items-center justify-center">
 <div className="text-center">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white/5 text-primary border border-white/10 shadow-sm">
 <Icon icon="tabler:loader" className="h-7 w-7 animate-spin" />
 </div>
 <Text weight="semibold" className="mt-6 text-white tracking-tight">
 Curating your mix...
 </Text>
 </div>
 </div>
 ) : error && !session && !summary ? (
 <div className="mx-auto flex h-full min-h-[30vh] max-w-xs flex-col items-center justify-center text-center">
 <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-danger/10 text-danger border border-danger/20">
 <Icon icon="tabler:alert-triangle" className="h-7 w-7" />
 </div>
 <Text weight="semibold" className="mt-6 text-white tracking-tight">
 We hit a small bump
 </Text>
 <Text color="secondary" className="mt-2 text-[1.0625rem] leading-relaxed">
 {error}
 </Text>
 <Button
 onClick={() => void loadSession()}
 className="mt-8 gap-2 text-base font-medium"
 >
 <Icon icon="tabler:refresh" className="h-3.5 w-3.5" />
 Try again
 </Button>
 </div>
 ) : summary ? (
 <div className="mx-auto w-full max-w-2xl space-y-10 pb-4">
 {/* ── Main Mood Result Section ── */}
 <div
 
 
 className="rounded-lg border border-border bg-background/50 p-8 sm:p-12 relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform rotate-12">
   <Icon icon="tabler:sparkles" className="h-32 w-32 text-primary" />
 </div>

 <div className="relative z-10">
   <div className="flex flex-wrap items-center gap-3 mb-8">
     <span className={cn("badge px-3 py-1 text-base ", severityStyles[summary.severity])}>
       {severityTone[summary.severity]}
     </span>
     <div className="h-3 w-px bg-white/10 mx-1" />
     <span className="text-base font-medium text-text-dim tabular-nums">
       Overall Score {summary.derivedMoodScore}/5
     </span>
   </div>

   <Text as="h3" variant="h2" weight="semibold" className="text-white tracking-tight leading-tight">
     {summary.moodLabel}
   </Text>
   <Text color="secondary" className="mt-6 text-base leading-relaxed max-w-xl">
     {summary.tone}
   </Text>

   <div className="mt-12 flex flex-wrap items-center gap-4">
     <Button
       onClick={() => { onChatRequested?.(); onClose(); }}
       size="lg"
       className="gap-2"
     >
       <Icon icon="tabler:message-circle" className="h-4.5 w-4.5" />
       Talk through it
     </Button>
     <Button
       variant="warm"
       onClick={() => router.push("/student/book")}
       size="lg"
       className="gap-2"
     >
       <Icon icon="tabler:calendar" className="h-4.5 w-4.5" />
       Book support
     </Button>
   </div>
 </div>
 </div>

 {summary.hasSafetyConcern && (
 <div className="rounded-lg border border-danger/20 bg-danger/5 p-6 relative group overflow-hidden">
 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform">
   <Icon icon="tabler:alert-triangle" className="h-16 w-16 text-danger" />
 </div>
 <div className="flex items-start gap-4 relative z-10">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-danger text-white shadow-lg shadow-danger/20">
 <Icon icon="tabler:alert-triangle" className="h-6 w-6" />
 </div>
 <div>
 <Text weight="semibold" className="text-white text-base">
 Immediate support is available
 </Text>
 <Text color="secondary" className="mt-2 text-[1.0625rem] leading-relaxed max-w-lg">
 Please reach out to iCall at <a className="text-white font-bold underline underline-offset-4" href="tel:9152987821">9152987821</a> or your local emergency team. You don&apos;t have to carry this alone.
 </Text>
 </div>
 </div>
 </div>
 )}

 {/* ── Insights & Action Grid ── */}
 <div className="grid gap-10 pt-4 sm:grid-cols-2">
 <section>
 <div className="flex items-center gap-2 mb-6 px-1">
 <div className="h-1 w-1 rounded-full bg-primary" />
 <Text variant="small" weight="medium" className="text-base font-medium text-text-dim">
 Strongest signals
 </Text>
 </div>
 <div className="space-y-2">
 {summary.topInsights.map((insight) => (
 <div
 key={insight.category}
 className="group flex items-center justify-between rounded-md border border-border bg-white/[0.02] px-4 py-3 hover:border-white/20 hover:bg-white/5 transition-all"
 >
 <Text weight="semibold" className="truncate text-base text-white">
 {insight.label}
 </Text>
 <span className={cn("badge px-2 py-0.5 text-[8px] ", intensityStyles[insight.intensity])}>
 {insight.intensity}
 </span>
 </div>
 ))}
 </div>
 </section>

 <section>
 <div className="flex items-center gap-2 mb-6 px-1">
 <div className="h-1 w-1 rounded-full bg-primary" />
 <Text variant="small" weight="medium" className="text-base font-medium text-text-dim">
 Recommended steps
 </Text>
 </div>
 <div className="space-y-3">
 {summary.nextSteps.map((stepText, index) => (
 <div key={stepText} className="flex gap-4 p-4 rounded-md border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all">
 <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary border border-primary/20 tabular-nums">
 {index + 1}
 </div>
 <Text className="text-base text-text-muted leading-relaxed tracking-tight group-hover:text-white transition-colors">
 {stepText}
 </Text>
 </div>
 ))}
 </div>
 </section>
 </div>
 </div>
 ) : currentQuestion ? (
 <div className="mx-auto flex w-full max-w-xl flex-col pb-6">
 <div className="mb-12 text-center sm:text-left">
 <div className="inline-flex items-center justify-center rounded bg-primary/10 border border-primary/20 px-2.5 py-1 mb-6">
 <span className="text-base font-medium text-primary">
 {categoryLabels[currentQuestion.category] || currentQuestion.category}
 </span>
 </div>
 <Text as="h3" variant="h3" weight="semibold" className="text-white tracking-tight leading-tight">
 {currentQuestion.question}
 </Text>
 </div>

 <div className="space-y-2.5">
 {currentQuestion.options.map((option, optionIndex) => {
 const selected = responses[currentQuestion.id] === option.value;

 return (
 <button
 key={`${currentQuestion.id}-${option.value}`}
 type="button"
 
 
 
 onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
 className={cn(
 "group flex items-center justify-between gap-4 rounded-md border p-5 text-left transition-all active:scale-[0.99]",
 selected
 ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
 : "bg-background border-border hover:border-white/20 hover:bg-white/[0.02]"
 )}
 >
 <span className={cn(
   "text-[1.0625rem] font-semibold transition-colors",
   selected ? "text-white" : "text-text-muted group-hover:text-white"
 )}>
 {option.label}
 </span>
 <div className={cn(
 "size-4 rounded-full border flex items-center justify-center transition-all",
 selected ? "border-primary bg-primary" : "border-text-dim group-hover:border-white/40"
 )}>
 {selected && <Icon icon="tabler:check" className="h-3 w-3 text-black stroke-[4]" />}
 </div>
 </button>
 );
 })}
 </div>
 </div>
 ) : null}
 </div>

 {/* Footer */}
 {!summary && session && (
 <div className="border-t border-white/5 bg-background px-6 py-6 sm:px-10">
 <div className="mx-auto flex max-w-lg flex-row-reverse items-center justify-between">
 <Button
 onClick={() => {
 if (step === session.questions.length - 1) {
 void handleSubmit();
 } else {
 setStep((current) => current + 1);
 }
 }}
 disabled={!canGoNext || isSubmitting}
 size="md"
 className="min-w-[100px] gap-2 text-base font-medium"
 >
 {isSubmitting ? (
 <Icon icon="tabler:loader" className="h-3.5 w-3.5 animate-spin" />
 ) : (
 <>
 {step === session.questions.length - 1 ? "Complete" : "Continue"}
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5" />
 </>
 )}
 </Button>

 <button
 type="button"
 onClick={() => setStep((current) => Math.max(0, current - 1))}
 disabled={step === 0}
 className="inline-flex h-10 items-center justify-center gap-1.5 px-4 text-base font-medium text-text-dim transition-colors hover:text-white disabled:invisible"
 >
 <Icon icon="tabler:arrow-left" className="h-3.5 w-3.5" />
 Back
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 
 
</>
);
}
