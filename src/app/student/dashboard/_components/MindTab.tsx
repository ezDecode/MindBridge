"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCalendar,
  FiHeart,
  FiMessageSquare,
  FiPlus,
  FiShield,
  FiTrendingUp,
  FiX,
  FiBarChart2,
} from "react-icons/fi";
import { Text } from "@/components/ui";
import { ChatWindow, ChatInput, BookingSuggestion, ResourceSuggestion } from "@/components/chat";
import { CheckInModal } from "./CheckInModal";
import { BookingModal } from "./BookingModal";
import type { TabId } from "./types";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { DashboardData } from "./types";

interface MindTabProps {
  userName: string;
  data: DashboardData | null;
  messages: { id: string; role: "user" | "assistant"; content: string; isStreaming?: boolean }[];
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  error: string | null;
  stopGenerating: () => void;
  startNewSession: () => void;
  showBooking: boolean;
  showResources: boolean;
  setShowBooking: (v: boolean) => void;
  setShowResources: (v: boolean) => void;
  autoOpenCheckIn?: boolean;
  onAutoOpenCheckInHandled?: () => void;
  onMoodLogged?: () => void;
  router: AppRouterInstance;
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
  showBooking,
  showResources,
  setShowBooking,
  setShowResources,
  autoOpenCheckIn,
  onAutoOpenCheckInHandled,
  onMoodLogged,
  onSwitchToBridge,
  activeTab,
  setActiveTab,
}: MindTabProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isCheckInOpen = showCheckIn || Boolean(autoOpenCheckIn);

  const handleBookingConfirm = () => {
    setShowBooking(false);
    setShowBookingModal(true);
  };

  const handleResourcesShow = () => {
    setShowResources(false);
    onSwitchToBridge();
  };

  const handleCloseCheckIn = () => {
    setShowCheckIn(false);
    onAutoOpenCheckInHandled?.();
  };

  return (
    <>
      <div className="flex h-full w-full overflow-hidden bg-white">
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } shrink-0 overflow-hidden border-r border-gray-100 bg-gray-50/50 transition-all duration-200`}
        >
          <div className="flex h-full w-64 flex-col">
            <div className="border-b border-gray-100 px-3 py-3">
              <button
                type="button"
                onClick={startNewSession}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition-transform duration-150 hover:scale-[0.995] hover:bg-gray-800"
              >
                <FiPlus className="h-4 w-4" />
                New conversation
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-2">
              <Text as="p" variant="small" className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Quick actions
              </Text>
              <button
                onClick={() => setShowCheckIn(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <FiHeart className="h-4 w-4" />
                Log mood
              </button>
              <button
                onClick={() => setShowBookingModal(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <FiCalendar className="h-4 w-4" />
                Book session
              </button>
              <button
                onClick={onSwitchToBridge}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <FiTrendingUp className="h-4 w-4" />
                Analytics
              </button>
            </nav>

            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
                <Text as="p" variant="small" className="text-gray-500">
                  Weekly focus
                </Text>
                <Text as="p" variant="small" weight="bold" className="text-gray-900">
                  {data?.streak ? Math.min(data.streak * 12, 100) : 84}%
                </Text>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gray-800 transition-all duration-500 ease-out"
                  style={{ width: `${data?.streak ? Math.min(data.streak * 12, 100) : 84}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <FiMessageSquare className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('mind')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'mind' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => { setActiveTab('bridge'); onSwitchToBridge(); }}
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

          <AnimatePresence>
            {data?.proactiveMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-gray-100 bg-indigo-50/50 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                  </div>
                  <Text as="p" variant="small" className="leading-relaxed text-indigo-700">
                    {data.proactiveMessage}
                  </Text>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto px-4 pb-40 pt-6">
            <div className="mx-auto max-w-3xl">
              {messages.length === 0 ? (
                <EmptyState
                  userName={userName}
                  onCheckIn={() => setShowCheckIn(true)}
                  onBookSession={() => setShowBookingModal(true)}
                  onSwitchToBridge={onSwitchToBridge}
                />
              ) : (
                <ChatWindow messages={messages} isLoading={isLoading} />
              )}

              <AnimatePresence>
                {showBooking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8"
                  >
                    <BookingSuggestion
                      onConfirm={handleBookingConfirm}
                      onCancel={() => setShowBooking(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showResources && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8"
                  >
                    <ResourceSuggestion
                      onShow={handleResourcesShow}
                      onDismiss={() => setShowResources(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white/80 px-4 pb-4 pt-3 backdrop-blur-sm">
            <div className="pointer-events-auto mx-auto max-w-3xl">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-3 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Urgent support: <a href="tel:9152987821" className="font-semibold text-gray-900 underline underline-offset-2">9152987821</a>
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <ChatInput
                  onSend={sendMessage}
                  isLoading={isLoading}
                  onStop={stopGenerating}
                  placeholder="How are you feeling today?"
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

function EmptyState({
  userName,
  onCheckIn,
  onBookSession,
  onSwitchToBridge,
}: {
  userName: string;
  onCheckIn: () => void;
  onBookSession: () => void;
  onSwitchToBridge: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center pt-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <FiMessageSquare className="h-6 w-6 text-gray-900" />
      </div>

      <Text as="h1" variant="h4" weight="bold" className="mt-6 text-gray-900">
        Hey {userName}!
      </Text>
      <Text as="p" variant="body" className="mt-2 max-w-md text-gray-500">
        No perfect words needed. Share what feels loud, heavy, or hard to name and we can take it one step at a time.
      </Text>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={onCheckIn}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[0.98] hover:bg-gray-800"
        >
          <FiActivity className="h-4 w-4" />
          Log mood
        </button>
        <button
          onClick={onBookSession}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-transform hover:scale-[0.98] hover:bg-gray-50"
        >
          <FiCalendar className="h-4 w-4" />
          Book session
        </button>
      </div>

      <button
        type="button"
        onClick={onSwitchToBridge}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <span>See your analytics</span>
        <FiArrowUpRight className="h-4 w-4" />
      </button>

      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
          <FiShield className="h-3 w-3 text-gray-500" />
        </div>
        <Text as="span" variant="small" className="text-gray-500">
          This space is secure and private
        </Text>
      </div>
    </motion.div>
  );
}