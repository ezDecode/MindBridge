"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/ui";
import { getAssessmentLabel } from "@/lib/question-bank";
import { ChatInput, ChatWindow } from "@/components/chat";
import type { Message } from "@/hooks/useChat";
import { CheckInModal } from "./CheckInModal";
import { BookingModal } from "./BookingModal";
import { AnalyticsModal } from "./AnalyticsModal";
import type { DashboardData, TabId } from "./types";

interface MindTabProps {
 userName: string;
 data: DashboardData | null;
 messages: Message[];
 sendMessage: (msg: string) => void;
 isLoading: boolean;
 error: string | null;
 stopGenerating: () => void;
 startNewSession: () => void;
 autoOpenCheckIn?: boolean;
 onAutoOpenCheckInHandled?: () => void;
 onMoodLogged?: () => void;
 onOpenQuestionnaire: () => void;
 onSwitchToBridge: () => void;
 activeTab: TabId;
 setActiveTab: (tab: TabId) => void;
}

export function MindTab({
 userName,
 data,
 messages,
 sendMessage,
 isLoading,
 error,
 stopGenerating,
 startNewSession,
 autoOpenCheckIn,
 onAutoOpenCheckInHandled,
 onMoodLogged,
 onOpenQuestionnaire,
 onSwitchToBridge,
 activeTab,
 setActiveTab,
}: MindTabProps) {
 const router = useRouter();
 const [showCheckIn, setShowCheckIn] = useState(false);
 const [showBookingModal, setShowBookingModal] = useState(false);
 const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const isCheckInOpen = showCheckIn || Boolean(autoOpenCheckIn);
 const hasMessages = messages.length > 0;

 const latestAssessmentLabel = data?.latestAssessment
 ? getAssessmentLabel(data.latestAssessment.severity)
 : "No check-in yet";

 const assessmentNote = data?.latestAssessment?.criteriaFlagged.length
 ? data.latestAssessment.criteriaFlagged
 .slice(0, 2)
 .map((item) => item.replaceAll("_", " "))
 .join(" • ")
 : "Complete a guided check-in or log your mood to see your latest scan.";

 const handleCloseCheckIn = () => {
 setShowCheckIn(false);
 onAutoOpenCheckInHandled?.();
 };

 return (
 <>
 <div className="flex h-full min-h-0 flex-col bg-[var(--color-background)] lg:flex-row">
 <AnimatePresence>
 {sidebarOpen && (
 <motion.button
 type="button"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setSidebarOpen(false)}
 className="fixed inset-0 z-20 bg-[rgba(45,41,38,0.28)] backdrop-blur-sm lg:hidden"
 />
 )}
 </AnimatePresence>

 <aside
 className={`fixed inset-y-0 left-0 z-30 w-[min(21.5rem,92vw)] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-[0_28px_60px_rgba(45,41,38,0.16)] backdrop-blur-xl transition-transform duration-200 lg:static lg:w-[20rem] lg:shrink-0 lg:bg-transparent lg:px-5 lg:py-6 lg:shadow-none lg:backdrop-blur-0 ${
 sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
 }`}
 >
 <div className="flex h-full flex-col gap-4 lg:gap-5">
 <div className="rounded-md border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,250,247,0.82)_100%)] p-5 shadow-[0_18px_44px_rgba(45,41,38,0.08)]">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
 Mind space
 </Text>
 <Text as="h2" variant="h6" weight="bold" className="mt-2 text-[var(--color-text-primary)]">
 Hi {userName}
 </Text>
 </div>

 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={startNewSession}
 title="Start a new chat"
 className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-white shadow-[0_12px_24px_rgba(45,41,38,0.18)] transition-transform active:scale-[0.92]"
 >
 <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
 </button>
 <button
 type="button"
 onClick={() => setSidebarOpen(false)}
 className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-warm)] lg:hidden"
 >
 <Icon icon="solar:close-circle-linear" className="h-4 w-4" />
 </button>
 </div>
 </div>

 <Text as="p" variant="small" className="mt-3 leading-6 text-[var(--color-text-secondary)]">
 Settle in, choose the support you need, or start typing when you feel ready.
 </Text>

 <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
 <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-tinted)] px-4 py-3">
 <div className="flex items-center gap-2">
 <Icon icon="solar:graph-up-linear" className="h-4 w-4 text-[var(--color-primary)]" />
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Check-in streak</p>
 </div>
 <p className="mt-2 text-base font-semibold tracking-tight text-[var(--color-text-primary)]">{data?.streak || 0} days</p>
 </div>

 <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-tinted)] px-4 py-3">
 <div className="flex items-center gap-2">
 <Icon icon="solar:pulse-linear" className="h-4 w-4 text-[var(--color-info)]" />
 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Latest scan</p>
 </div>
 <p className="mt-2 text-base font-semibold tracking-tight text-[var(--color-text-primary)]">{latestAssessmentLabel}</p>
 <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{assessmentNote}</p>
 </div>
 </div>
 </div>

 <div className="rounded-md border border-white/70 bg-[color:rgba(255,255,255,0.78)] p-3.5 shadow-[0_12px_30px_rgba(45,41,38,0.05)]">
 <Text as="p" variant="small" weight="bold" className="px-1 text-[var(--color-text-primary)]">
 Support actions
 </Text>
 <Text as="p" variant="small" className="mt-1 px-1 leading-6 text-[var(--color-text-secondary)]">
 Everything important is collected here so the conversation area can stay calm and focused.
 </Text>

 <div className="mt-4 grid gap-2.5">
 <ActionButton
 icon={<Icon icon="solar:bolt-linear" className="h-4 w-4" />}
 title="Guided check-in"
 description="Answer a few structured questions for a clearer read."
 onClick={onOpenQuestionnaire}
 highlighted
 />
 <ActionButton
 icon={<Icon icon="solar:heart-linear" className="h-4 w-4" />}
 title="Quick mood log"
 description="Capture how you feel right now in a few taps."
 onClick={() => setShowCheckIn(true)}
 />
 <ActionButton
 icon={<Icon icon="solar:calendar-linear" className="h-4 w-4" />}
 title="Book session"
 description="Reserve time with a counselor when you want extra support."
 onClick={() => setShowBookingModal(true)}
 />
 <ActionButton
 icon={<Icon icon="solar:graph-up-linear" className="h-4 w-4" />}
 title="View dashboard"
 description="See mood patterns, trends, and recent progress."
 onClick={() => setShowAnalyticsModal(true)}
 />
 </div>
 </div>

 <div className="rounded-md border border-[var(--color-warning)]/18 bg-[color:rgba(255,245,233,0.92)] p-4 shadow-[0_10px_26px_rgba(45,41,38,0.04)]">
 <div className="flex items-center gap-2">
 <Icon icon="solar:danger-circle-linear" className="h-5 w-5 shrink-0 text-[var(--color-warning)]" />
 <span className="text-sm font-medium text-[var(--color-text-primary)]">
 Need urgent support? Call{" "}
 <a href="tel:9152987821" className="font-bold underline underline-offset-2">
 9152987821
 </a>
 </span>
 </div>
 </div>

 <div className="rounded-md border border-white/70 bg-[color:rgba(255,255,255,0.7)] p-4">
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[var(--color-info-soft)] text-[var(--color-info)]">
 <Icon icon="solar:shield-linear" className="h-5 w-5" />
 </div>
 <div>
 <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
 Secure and private
 </Text>
 <Text as="p" variant="small" className="mt-2 leading-6 text-[var(--color-text-secondary)]">
 Your check-ins and conversations stay in your own support space, so you can share honestly.
 </Text>
 </div>
 </div>
 </div>
 </div>
 </aside>

 <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
 <header className="px-4 pt-4 sm:px-6 sm:pt-6">
 <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex items-start gap-3">
 <button
 type="button"
 onClick={() => setSidebarOpen(true)}
 className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)]/92 text-[var(--color-text-primary)] shadow-[0_12px_24px_rgba(45,41,38,0.08)] transition-colors hover:bg-[var(--color-surface-warm)] lg:hidden"
 >
 <Icon icon="solar:hamburger-menu-linear" className="h-5 w-5" />
 </button>

 <div>
 <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
 Companion
 </Text>
 <Text as="h1" variant="h6" weight="bold" className="mt-1 text-[var(--color-text-primary)]">
 Mind Space
 </Text>
 <Text as="p" variant="small" className="mt-2 max-w-xl leading-6 text-[var(--color-text-secondary)]">
 A private, steady place to reflect, check in, and ask for support.
 </Text>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-3">
 <div className="flex items-center gap-1 rounded-full border border-white/70 bg-[var(--color-surface)]/88 p-1 shadow-[0_10px_24px_rgba(45,41,38,0.06)]">
 <button
 onClick={() => setActiveTab("mind")}
 className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
 activeTab === "mind"
 ? "bg-[var(--color-text-primary)] text-white"
 : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
 }`}
 >
 Chat
 </button>
 <button
 onClick={() => {
 setActiveTab("bridge");
 onSwitchToBridge();
 }}
 className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
 activeTab === "bridge"
 ? "bg-[var(--color-text-primary)] text-white"
 : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
 }`}
 >
 Dashboard
 </button>
 </div>
 </div>
 </div>
 </header>

 <AnimatePresence>
 {data?.proactiveMessage && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
 className="px-4 pt-4 sm:px-6"
 >
 <div className="mx-auto max-w-4xl">
 <div className="flex items-start gap-3 rounded-md border border-white/70 bg-[color:rgba(255,255,255,0.72)] px-4 py-3.5 shadow-[0_12px_24px_rgba(45,41,38,0.04)]">
 <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-info-soft)]">
 <span className="h-2 w-2 rounded-full bg-[var(--color-info)]" />
 </div>
 <Text as="p" variant="small" className="leading-6 text-[var(--color-text-secondary)]">
 {data.proactiveMessage}
 </Text>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="flex-1 overflow-y-auto px-4 pb-40 pt-6 sm:px-6 sm:pb-44">
 <div className="mx-auto w-full max-w-4xl">
 {hasMessages ? (
 <div className="mx-auto max-w-3xl">
 <ChatWindow
 messages={messages}
 isLoading={isLoading}
 onSuggestionSelect={sendMessage}
 onActionSelect={(action) => {
 if (action === "book_counselor") {
 setShowBookingModal(true);
 return;
 }

 if (action === "show_resources") {
 router.push("/student/resources");
 }
 }}
 />
 </div>
 ) : (
 <EmptyState userName={userName} />
 )}
 </div>
 </div>

 <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(247,243,239,0)_0%,rgba(247,243,239,0.85)_18%,rgba(247,243,239,0.98)_100%)] px-4 pb-4 pt-5 sm:px-6">
 <div className="pointer-events-auto mx-auto max-w-4xl">
 <AnimatePresence>
 {error && (
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 6 }}
 className="mb-2.5 rounded-md border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] px-4 py-2.5 text-sm text-[var(--color-danger)]"
 >
 {error}
 </motion.div>
 )}
 </AnimatePresence>

 <div className="rounded-md border border-white/75 bg-[color:rgba(255,255,255,0.72)] p-2 shadow-[0_20px_44px_rgba(45,41,38,0.08)] backdrop-blur-md">
 <ChatInput
 onSend={sendMessage}
 isLoading={isLoading}
 onStop={stopGenerating}
 placeholder="Tell MindBridge what feels heavy, noisy, or hard to name..."
 onBookSession={() => {
 setShowBookingModal(true);
 }}
 onViewAnalytics={() => {
 setShowAnalyticsModal(true);
 }}
 onQuickMoodLog={() => {
 setShowCheckIn(true);
 }}
 onGuidedQuestions={() => {
 onOpenQuestionnaire();
 }}
 />
 </div>
 </div>
 </div>
 </section>
 </div>

 <CheckInModal isOpen={isCheckInOpen} onClose={handleCloseCheckIn} onComplete={onMoodLogged} />
 <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
 <AnalyticsModal
 isOpen={showAnalyticsModal}
 onClose={() => setShowAnalyticsModal(false)}
 onGoToDashboard={() => {
 setShowAnalyticsModal(false);
 onSwitchToBridge();
 }}
 />
 </>
 );
}

function ActionButton({
 icon,
 title,
 description,
 onClick,
 highlighted = false,
}: {
 icon: ReactNode;
 title: string;
 description: string;
 onClick: () => void;
 highlighted?: boolean;
}) {
 return (
 <button
 type="button"
 onClick={onClick}
 className={`group flex items-start gap-3 rounded-md border px-3.5 py-3.5 text-left transition-all duration-200 ease-[var(--ease-out)] active:scale-[0.98] ${
 highlighted
 ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md"
 : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-strong)]"
 }`}
 >
 <span
 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] ${
 highlighted
 ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
 : "bg-[var(--color-surface-warm)] text-[var(--color-primary)]"
 }`}
 >
 {icon}
 </span>
 <span className="min-w-0 flex-1">
 <span className="block text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</span>
 <span className="mt-1 block text-xs leading-5 text-[var(--color-text-secondary)]">{description}</span>
 </span>
 <span className="mt-1 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5">
 <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
 </span>
 </button>
 );
}

function EmptyState({
 userName,
}: {
 userName: string;
}) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
 className="flex min-h-[42vh] items-center py-10 sm:min-h-[48vh] sm:py-14"
 >
 <div className="max-w-2xl px-1">
 <Text as="h2" variant="h2" weight="bold" className="tracking-tight text-[var(--color-text-primary)]">
 Welcome back, {userName}.
 </Text>
 </div>
 </motion.div>
 );
}


