"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiCompass,
  FiHeart,
  FiMenu,
  FiMessageSquare,
  FiPlus,
  FiShield,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";
import { Text } from "@/components/ui";
import { ChatInput, ChatWindow } from "@/components/chat";
import type { Message } from "@/hooks/useChat";
import { CheckInModal } from "./CheckInModal";
import { BookingModal } from "./BookingModal";
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

const assessmentLabels: Record<NonNullable<DashboardData["latestAssessment"]>["severity"], string> = {
  none: "Stable",
  mild: "Gentle watch",
  moderate: "Needs attention",
  severe: "Needs support",
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isCheckInOpen = showCheckIn || Boolean(autoOpenCheckIn);

  const latestAssessmentLabel = data?.latestAssessment
    ? assessmentLabels[data.latestAssessment.severity]
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
            <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-light),white_12%)_0%,var(--color-surface)_100%)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Mind Space
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startNewSession}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-white transition-transform hover:scale-[0.98]"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] lg:hidden"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Text as="h2" variant="h6" weight="bold" className="mt-3 text-[var(--color-text-primary)]">
                Hi {userName}
              </Text>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[1rem] bg-white/80 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Streak
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {data?.streak || 0}d
                  </p>
                </div>
                <div className="rounded-[1rem] bg-white/80 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Scan
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-primary)] truncate">
                    {latestAssessmentLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <Text as="p" variant="small" weight="bold" className="px-1 text-[var(--color-text-primary)]">
                Quick actions
              </Text>

              <div className="mt-3 grid gap-2">
                <ActionButton
                  icon={<FiZap className="h-4 w-4" />}
                  title="Guided check-in"
                  onClick={onOpenQuestionnaire}
                  highlighted
                />
                <ActionButton
                  icon={<FiHeart className="h-4 w-4" />}
                  title="Quick mood log"
                  onClick={() => setShowCheckIn(true)}
                />
                <ActionButton
                  icon={<FiCalendar className="h-4 w-4" />}
                  title="Book counselor"
                  onClick={() => setShowBookingModal(true)}
                />
                <ActionButton
                  icon={<FiTrendingUp className="h-4 w-4" />}
                  title="Dashboard"
                  onClick={onSwitchToBridge}
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-warm)] text-[var(--color-primary)]">
                  <FiCompass className="h-5 w-5" />
                </div>
                <div>
                  <Text as="p" variant="small" weight="bold" className="text-[var(--color-text-primary)]">
                    Latest support signal
                  </Text>
                  <Text as="p" variant="small" className="mt-2 leading-6 text-[var(--color-text-secondary)]">
                    {assessmentNote}
                  </Text>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-info-soft)] text-[var(--color-info)]">
                  <FiShield className="h-5 w-5" />
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
          <header className="border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] lg:hidden"
                >
                  <FiMenu className="h-5 w-5" />
                </button>

                <div>
                  <Text as="p" variant="small" className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                    Companion
                  </Text>
                  <Text as="h1" variant="h6" weight="bold" className="mt-2 text-[var(--color-text-primary)]">
                    Talk it through or start a guided check-in
                  </Text>
                  <Text as="p" variant="small" className="mt-1 max-w-xl leading-6 text-[var(--color-text-secondary)]">
                    Keep it quick, honest, and low-pressure. We can build clarity one step at a time.
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white p-1">
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
                  <FiZap className="h-4 w-4" />
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
                <EmptyState
                  userName={userName}
                  onCheckIn={() => setShowCheckIn(true)}
                  onOpenQuestionnaire={onOpenQuestionnaire}
                  onBookSession={() => setShowBookingModal(true)}
                  onSwitchToBridge={onSwitchToBridge}
                />
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[color:rgba(255,255,255,0.92)] px-4 pb-3 pt-2 backdrop-blur-sm sm:px-6">
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

              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] border border-[var(--color-warning)]/20 bg-[var(--color-warning-soft)] px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="h-4 w-4 text-[var(--color-warning)]" />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    Urgent support:{" "}
                    <a href="tel:9152987821" className="font-semibold underline underline-offset-2">
                      9152987821
                    </a>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenQuestionnaire}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  <FiActivity className="h-4 w-4" />
                  Guided check-in
                </button>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <ChatInput
                  onSend={sendMessage}
                  isLoading={isLoading}
                  onStop={stopGenerating}
                  placeholder="Tell MindBridge what feels heavy, noisy, or hard to name..."
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <CheckInModal isOpen={isCheckInOpen} onClose={handleCloseCheckIn} onComplete={onMoodLogged} />
      <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
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
      className={`flex items-center gap-2.5 rounded-[1.1rem] border px-3 py-2.5 text-left transition-all duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${
        highlighted
          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-sm hover:shadow-[0_8px_16px_rgba(244,125,75,0.08)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)]"
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-primary)] shadow-sm">
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
  onCheckIn,
  onOpenQuestionnaire,
  onBookSession,
  onSwitchToBridge,
}: {
  userName: string;
  onCheckIn: () => void;
  onOpenQuestionnaire: () => void;
  onBookSession: () => void;
  onSwitchToBridge: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="pt-4"
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-[1.9rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-light),white_30%)_0%,var(--color-surface)_100%)] p-6 sm:p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white text-[var(--color-primary)] shadow-sm">
            <FiMessageSquare className="h-6 w-6" />
          </div>

          <Text as="h2" variant="h4" weight="bold" className="mt-6 text-[var(--color-text-primary)]">
            Start where it feels easiest, {userName}
          </Text>
          <Text as="p" variant="body" className="mt-3 max-w-xl leading-7 text-[var(--color-text-secondary)]">
            You can talk freely in chat, or let a rotating question set help name the pattern underneath what you are feeling.
          </Text>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(244,125,75,0.24)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.96]"
            >
              <FiZap className="h-4 w-4" />
              Start guided questions
            </button>
            <button
              type="button"
              onClick={onCheckIn}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-surface-warm)] active:scale-[0.96]"
            >
              <FiHeart className="h-4 w-4" />
              Quick mood log
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <PillAction
            icon={<FiCalendar className="h-4 w-4" />}
            label="Book session"
            onClick={onBookSession}
          />
          <PillAction
            icon={<FiTrendingUp className="h-4 w-4" />}
            label="View analytics"
            onClick={onSwitchToBridge}
          />
        </div>
      </div>
    </motion.div>
  );
}

function PillAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--color-text-primary)] shadow-sm transition-all duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)] active:scale-[0.97]"
    >
      <span className="text-[var(--color-primary)]">{icon}</span>
      <span>{label}</span>
      <FiArrowUpRight className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
    </button>
  );
}
