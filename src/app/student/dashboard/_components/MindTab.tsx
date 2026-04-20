"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/ui";
import { getAssessmentLabel } from "@/lib/question-bank";
import { ChatInput, ChatWindow } from "@/components/chat";
import type { Message } from "@/hooks/useChat";
import { CheckInModal } from "./CheckInModal";
import { BookingModal } from "./BookingModal";
import { AnalyticsModal } from "./AnalyticsModal";
import { DashboardSidebar } from "./DashboardSidebar";
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

  const handleCloseCheckIn = () => {
    setShowCheckIn(false);
    onAutoOpenCheckInHandled?.();
  };

  return (
    <>
      <div className="flex h-full min-h-0 bg-[var(--color-surface-tinted)] lg:bg-[var(--color-background)]">
        <DashboardSidebar
          userName={userName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSwitchToBridge={onSwitchToBridge}
          onSwitchToMind={() => {}}
          startNewSession={startNewSession}
          onOpenQuestionnaire={onOpenQuestionnaire}
          setShowCheckIn={setShowCheckIn}
          setShowBookingModal={setShowBookingModal}
          setShowAnalyticsModal={setShowAnalyticsModal}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-surface)] lg:m-2 lg:rounded-[1.5rem] lg:border lg:border-[var(--color-border)] lg:shadow-sm">
          {/* Top Header - Mobile Only or Just the hamburger */}
          <header className="absolute top-0 left-0 z-20 flex w-full items-center p-4 lg:hidden bg-gradient-to-b from-[var(--color-background)] to-transparent">
             <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-sm border border-[var(--color-border)]"
            >
              <Icon icon="tabler:menu-2" className="h-5 w-5" />
            </button>
          </header>

          <div className="relative flex flex-1 flex-col overflow-hidden">
            {!hasMessages ? (
              // Empty State - Centered Search Layout
              <div className="flex h-full flex-col items-center justify-center p-4">
                <div className="mb-8 flex flex-col items-center gap-4 text-center">
                  <Text as="h1" variant="h1" weight="bold" className="text-4xl text-[var(--color-text-primary)] tracking-tight sm:text-5xl">
                    MindBridge
                  </Text>
                  <Text as="p" className="max-w-md text-base text-[var(--color-text-secondary)]">
                    A private, steady place to reflect, check in, and ask for support. How are you feeling today?
                  </Text>
                </div>
                
                <div className="w-full max-w-2xl px-4 lg:px-0">
                  <ChatInput
                    onSend={sendMessage}
                    isLoading={isLoading}
                    onStop={stopGenerating}
                    placeholder="Ask anything..."
                    onBookSession={() => setShowBookingModal(true)}
                    onViewAnalytics={() => setShowAnalyticsModal(true)}
                    onQuickMoodLog={() => setShowCheckIn(true)}
                    onGuidedQuestions={() => onOpenQuestionnaire()}
                  />

                  {/* Suggestion Chips Below Input */}
                  <div className="mt-12 flex flex-wrap justify-center gap-3">
                    <button 
                      onClick={() => setShowCheckIn(true)}
                      className="group flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 pr-5 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-warm)] hover:shadow-sm"
                    >
                      <Icon icon="tabler:mood-smile" className="h-[18px] w-[18px] text-[var(--color-primary)]" />
                      Do a quick check-in
                    </button>
                    <button 
                      onClick={() => onOpenQuestionnaire()}
                      className="group flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 pr-5 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-warm)] hover:shadow-sm"
                    >
                      <Icon icon="tabler:bolt" className="h-[18px] w-[18px] text-[var(--color-primary)]" />
                      Take the mental health scan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
             // Active Chat State 
             <>
               <div className="flex-1 overflow-y-auto px-4 pb-32 pt-16 sm:px-8 sm:pt-20 lg:pt-12">
                  <div className="mx-auto w-full max-w-3xl">
                   <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    onSuggestionSelect={sendMessage}
                    onActionSelect={(action) => {
                      if (action === "book_counselor") setShowBookingModal(true);
                      if (action === "show_resources") router.push("/student/resources");
                    }}
                   />
                  </div>
               </div>
               
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent px-4 pb-6 pt-10 sm:px-8">
                  <div className="mx-auto w-full max-w-3xl">
                   <AnimatePresence>
                    {error && (
                      <motion.div
                       initial={{ opacity: 0, y: 6 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 6 }}
                       className="mb-3 rounded-xl border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]"
                      >
                       {error}
                      </motion.div>
                    )}
                   </AnimatePresence>

                   <ChatInput
                    onSend={sendMessage}
                    isLoading={isLoading}
                    onStop={stopGenerating}
                    placeholder="Ask anything..."
                    onBookSession={() => setShowBookingModal(true)}
                    onViewAnalytics={() => setShowAnalyticsModal(true)}
                    onQuickMoodLog={() => setShowCheckIn(true)}
                    onGuidedQuestions={() => onOpenQuestionnaire()}
                   />
                  </div>
               </div>
             </>
            )}
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
