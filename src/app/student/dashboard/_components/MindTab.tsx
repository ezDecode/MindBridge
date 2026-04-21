"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/ui";
import { ChatInput, ChatWindow } from "@/components/chat";
import type { Message } from "@/hooks/useChat";
import type { DashboardData } from "./types";

interface MindTabProps {
  messages: Message[];
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  error: string | null;
  stopGenerating: () => void;
  onOpenQuestionnaire: () => void;
  onOpenSidebar: () => void;
  onOpenCheckIn: () => void;
  onOpenBooking: () => void;
  onOpenAnalytics: () => void;
}

export function MindTab({
  messages,
  sendMessage,
  isLoading,
  error,
  stopGenerating,
  onOpenQuestionnaire,
  onOpenSidebar,
  onOpenCheckIn,
  onOpenBooking,
  onOpenAnalytics,
}: MindTabProps) {
  const router = useRouter();

  const hasMessages = messages.length > 0;

  return (
    <>
        {/* Main Content Area */}
        <section className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--surface-default)] lg:m-2 lg:rounded-[1.5rem] lg:border lg:border-[var(--border-default)] lg:shadow-sm">
          {/* Top Header - Mobile Only or Just the hamburger */}
          <header className="absolute top-0 left-0 z-20 flex w-full items-center p-4 lg:hidden bg-gradient-to-b from-[var(--bg-page)] to-transparent">
             <button
              type="button"
              onClick={onOpenSidebar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-default)] text-[var(--text-secondary)] shadow-sm border border-[var(--border-default)]"
            >
              <Icon icon="tabler:menu-2" className="h-5 w-5" />
            </button>
          </header>

          <div className="relative flex flex-1 flex-col overflow-hidden">
            {!hasMessages ? (
              // Empty State - Centered Search Layout
              <div className="flex h-full flex-col items-center justify-center p-4">
                <div className="mb-10 flex w-full max-w-2xl flex-col items-center gap-3 text-center">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-[var(--action-primary)]/10 px-3 py-1.5 mb-2">
                    <Icon icon="tabler:sparkles" className="mr-1.5 h-4 w-4 text-[var(--action-primary)]" />
                    <span className="text-xs font-medium text-[var(--action-primary)]">Mind Space</span>
                  </div>
                  <Text as="h1" variant="h1" weight="bold" className="text-4xl text-[var(--text-primary)] tracking-tight sm:text-5xl lg:text-5xl">
                    How can I support you today?
                  </Text>
                  <Text as="p" className="mx-auto max-w-lg text-base text-[var(--text-secondary)]">
                    A steady, private space to reflect, do a quick check-in, or just talk through whatever is on your mind.
                  </Text>
                </div>
                
                <div className="w-full max-w-2xl px-4 lg:px-0 relative z-10">
                  <div className="relative">
                    {/* Optional subtle glow behind the input */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[var(--action-primary)]/20 to-[var(--text-secondary)]/20 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />
                    
                    <ChatInput
                      onSend={sendMessage}
                      isLoading={isLoading}
                      onStop={stopGenerating}
                      placeholder="Ask me anything..."
                      onBookSession={onOpenBooking}
                      onViewAnalytics={onOpenAnalytics}
                      onQuickMoodLog={onOpenCheckIn}
                      onGuidedQuestions={() => onOpenQuestionnaire()}
                    />
                  </div>

                  {/* Suggestion Chips Below Input */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    <button 
                      onClick={onOpenCheckIn}
                      className="group flex items-center gap-2 rounded-full border border-[var(--border-default)]/60 bg-[var(--surface-default)]/50 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur-sm transition-all hover:border-[var(--action-primary)]/40 hover:bg-[var(--surface-default)] hover:text-[var(--text-primary)] hover:shadow"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--action-primary)]/10 text-[var(--action-primary)] transition-colors group-hover:bg-[var(--action-primary)] group-hover:text-[var(--text-inverse)]">
                        <Icon icon="tabler:mood-smile" className="h-3.5 w-3.5" />
                      </div>
                      Quick log
                    </button>
                    <button 
                      onClick={() => onOpenQuestionnaire()}
                      className="group flex items-center gap-2 rounded-full border border-[var(--border-default)]/60 bg-[var(--surface-default)]/50 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur-sm transition-all hover:border-[var(--action-primary)]/40 hover:bg-[var(--surface-default)] hover:text-[var(--text-primary)] hover:shadow"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--action-primary)]/10 text-[var(--action-primary)] transition-colors group-hover:bg-[var(--action-primary)] group-hover:text-[var(--text-inverse)]">
                        <Icon icon="tabler:bolt" className="h-3.5 w-3.5" />
                      </div>
                      Mental health scan
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
                      if (action === "book_counselor") onOpenBooking();
                      if (action === "show_resources") router.push("/student/resources");
                    }}
                   />
                  </div>
               </div>
               
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--bg-page)] via-[var(--bg-page)] to-transparent px-4 pb-6 pt-10 sm:px-8">
                  <div className="mx-auto w-full max-w-3xl">
                   <AnimatePresence>
                    {error && (
                      <motion.div
                       initial={{ opacity: 0, y: 6 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 6 }}
                       className="mb-3 rounded-xl border border-[var(--status-error-soft)] bg-[var(--status-error-soft)] px-4 py-3 text-sm text-[var(--status-error)]"
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
                    onBookSession={onOpenBooking}
                    onViewAnalytics={onOpenAnalytics}
                    onQuickMoodLog={onOpenCheckIn}
                    onGuidedQuestions={() => onOpenQuestionnaire()}
                   />
                  </div>
               </div>
             </>
            )}
          </div>
        </section>
    </>
  );
}
