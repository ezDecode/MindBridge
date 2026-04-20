"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from '@iconify/react';
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

  const latestAssessmentLabel = data?.latestAssessment
    ? getAssessmentLabel(data.latestAssessment.severity)
    : "No guided check-in yet";

  const assessmentNote = data?.latestAssessment?.criteriaFlagged.length
    ? data.latestAssessment.criteriaFlagged
        .slice(0, 2)
        .map((item) => item.replaceAll("_", " "))
        .join(" • ")
    : "Start with a guided question set or a quick mood tap.";

  const handleCloseCheckIn = () => {
    setShowCheckIn(false);
    onAutoOpenCheckInHandled?.();
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-warm),white_24%)_0%,var(--color-surface)_16rem)] lg:flex-row">
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
          className={`fixed inset-y-0 left-0 z-30 w-[min(22rem,92vw)] overflow-y-auto border-r border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-warm),white_14%)_0%,var(--color-surface)_100%)] px-4 py-4 shadow-[0_28px_60px_rgba(45,41,38,0.16)] transition-transform duration-200 lg:static lg:w-[19.5rem] lg:shrink-0 lg:border-b-0 lg:border-r lg:px-4 lg:py-5 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.8)_0%,var(--color-surface)_100%)] p-4 shadow-sm shadow-[var(--color-primary)]/5">
              <div className="flex items-center justify-between gap-3">
                <Text as="h2" variant="h6" weight="bold" className="text-[var(--color-text-primary)]">
                  Hi {userName}
                </Text>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={startNewSession}
                    title="Start new chat"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-white transition-transform active:scale-[0.92]"
                  >
                    <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-warm)] lg:hidden"
                  >
                    <Icon icon="solar:close-circle-linear" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center divide-x divide-[var(--color-border-light)] rounded-[calc(var(--radius-sm)*var(--brm))] squircle border border-[var(--color-border-light)] bg-white/50 py-2.5">
                <div className="flex flex-1 items-center justify-center gap-2.5 px-3">
                  <Icon icon="solar:graph-up-linear" className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Streak</p>
                    <p className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">{data?.streak || 0}d</p>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center gap-2.5 px-3">
                  <Icon icon="solar:pulse-linear" className="h-3.5 w-3.5 text-[var(--color-info)]" />
                  <div className="min-w-0 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Scan</p>
                    <p className="truncate text-sm font-bold tracking-tight text-[var(--color-text-primary)]">{latestAssessmentLabel}</p>
                    {assessmentNote && assessmentNote !== "No urgent flags" && (
                      <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-secondary)]" title={assessmentNote}>
                        {assessmentNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[calc(var(--radius-sm)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <Text as="p" variant="small" weight="bold" className="px-1 text-[var(--color-text-primary)]">
                Quick actions
              </Text>

              <div className="mt-3 grid gap-2">
                <ActionButton
                  icon={<Icon icon="solar:bolt-linear" className="h-4 w-4" />}
                  title="Guided check-in"
                  onClick={onOpenQuestionnaire}
                  highlighted
                />
                <ActionButton
                  icon={<Icon icon="solar:heart-linear" className="h-4 w-4" />}
                  title="Quick mood log"
                  onClick={() => setShowCheckIn(true)}
                />
                <ActionButton
                  icon={<Icon icon="solar:calendar-linear" className="h-4 w-4" />}
                  title="Book counselor"
                  onClick={() => setShowBookingModal(true)}
                />
                <ActionButton
                  icon={<Icon icon="solar:graph-up-linear" className="h-4 w-4" />}
                  title="Dashboard"
                  onClick={onSwitchToBridge}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-warning)]/20 bg-[var(--color-warning-soft)] p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon icon="solar:danger-circle-linear" className="h-5 w-5 shrink-0 text-[var(--color-warning)]" />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Urgent support:{" "}
                  <a href="tel:9152987821" className="font-bold underline underline-offset-2">
                    9152987821
                  </a>
                </span>
              </div>
            </div>

            <div className="rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius-sm)*var(--brm))] squircle bg-[var(--color-info-soft)] text-[var(--color-info)]">
                  <Icon icon="solar:shield-linear" className="h-5 w-5" />
                </div>
                <div>
                  <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
                    Secure and private
                  </Text>
                  <Text as="p" variant="small" className="mt-2 leading-6 text-[var(--color-text-secondary)]">
                    Your check-ins and conversations stay in your own support space.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-warm)] lg:hidden shadow-sm"
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
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
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

                <button
                  type="button"
                  onClick={onOpenQuestionnaire}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(244,125,75,0.24)] transition-transform hover:scale-[0.99]"
                >
                  <Icon icon="solar:bolt-linear" className="h-4 w-4" />
                  Guided questions
                </button>
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
                className="border-b border-[var(--color-border)] bg-[var(--color-info-soft)]/70 px-4 py-3 sm:px-6"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-info)]" />
                  </div>
                  <Text as="p" variant="small" className="leading-6 text-[var(--color-info)]">
                    {data.proactiveMessage}
                  </Text>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto px-4 pb-36 pt-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {messages.length === 0 ? (
                <EmptyState userName={userName} />
              ) : (
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
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[color:rgba(255,255,255,0.92)] px-4 pb-3 pt-2 backdrop-blur-sm sm:px-6">
            <div className="pointer-events-auto mx-auto max-w-3xl">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mb-2.5 rounded-[1.1rem] border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] px-4 py-2.5 text-sm text-[var(--color-danger)]"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-[1.5rem] bg-[var(--color-surface)] shadow-sm">
                <ChatInput
                  onSend={sendMessage}
                  isLoading={isLoading}
                  onStop={stopGenerating}
                  placeholder="Tell MindBridge what feels heavy, noisy, or hard to name..."
                  onBookSession={() => {
                    setShowBookingModal(true)
                  }}
                  onViewAnalytics={() => {
                    setShowAnalyticsModal(true)
                  }}
                  onQuickMoodLog={() => {
                    setShowCheckIn(true)
                  }}
                  onGuidedQuestions={() => {
                    onOpenQuestionnaire()
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
          setShowAnalyticsModal(false)
          onSwitchToBridge()
        }}
      />
    </>
  );
}

function ActionButton({
  icon,
  title,
  onClick,
  highlighted = false,
}: {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-[calc(var(--radius-sm)*var(--brm))] px-3 py-2.5 text-left transition-all duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${
        highlighted
          ? "bg-[var(--color-primary-light)] shadow-sm hover:shadow-md hover:bg-[#fff0eb]"
          : "bg-black/[0.03] hover:bg-black/[0.06]"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[calc(var(--radius-sm)*var(--brm)-4px)] bg-white text-[var(--color-primary)] shadow-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold tracking-tight text-[var(--color-text-primary)]">{title}</span>
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
      className="pt-6 sm:pt-10"
    >
      <div className="flex flex-col gap-8 max-w-2xl px-1">
        <Text as="h2" variant="h3" weight="bold" className="tracking-tight text-[var(--color-text-primary)]">
          Welcome back, {userName}.
        </Text>
      </div>
    </motion.div>
  );
}
