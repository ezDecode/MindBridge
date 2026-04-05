"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiMessageSquare, FiAlertCircle, FiPlus, FiTrendingUp, FiActivity, FiX } from "react-icons/fi";
import { Button, Card, Text } from "@/components/ui";
import { ChatWindow, ChatInput, BookingSuggestion, ResourceSuggestion } from "@/components/chat";
import { CheckInModal } from "./CheckInModal";
import { BookingModal } from "./BookingModal";
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
  router: AppRouterInstance;
  onSwitchToBridge: () => void;
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
  router,
  onSwitchToBridge,
}: MindTabProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookingConfirm = () => {
    setShowBooking(false);
    setShowBookingModal(true);
  };

  const handleResourcesShow = () => {
    setShowResources(false);
    onSwitchToBridge();
  };

  return (
    <>
      <Card 
        variant="subtle" 
        padding="none" 
        className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)]/50 shadow-lg shadow-black/5"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)]/50 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-strong)] px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/20"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiMessageSquare className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <Text as="p" variant="label" weight="bold" className="text-[var(--color-text-primary)]">
                MindBridge
              </Text>
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"
                  animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Text as="span" variant="small" color="muted">
                  Always here for you
                </Text>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={startNewSession} 
              variant="ghost" 
              size="sm"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <FiPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New chat</span>
            </Button>
          </motion.div>
        </div>

        {/* Proactive nudge banner */}
        <AnimatePresence>
          {data?.proactiveMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-[var(--color-primary)]/15 bg-gradient-to-r from-[var(--color-primary-light)]/50 to-[var(--color-primary-light)]/20 px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Text as="p" variant="small" weight="medium" color="secondary">
                  {data.proactiveMessage}
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat body */}
        <div
          className="flex-1 overflow-y-auto px-3 py-2 sm:px-4"
          style={{ minHeight: "380px", maxHeight: "calc(100vh - 380px)" }}
        >
          {messages.length === 0 ? (
            <EmptyState 
              userName={userName} 
              onSwitchToBridge={onSwitchToBridge}
              onCheckIn={() => setShowCheckIn(true)}
              onBookSession={() => setShowBookingModal(true)}
            />
          ) : (
            <ChatWindow messages={messages} isLoading={isLoading} />
          )}
        </div>

        {/* Action suggestions */}
        <AnimatePresence>
          {showBooking && (
            <div className="border-t border-[var(--color-border)]/50 px-4 py-3">
              <BookingSuggestion
                onConfirm={handleBookingConfirm}
                onCancel={() => setShowBooking(false)}
              />
            </div>
          )}
          {showResources && (
            <div className="border-t border-[var(--color-border)]/50 px-4 py-3">
              <ResourceSuggestion
                onShow={handleResourcesShow}
                onDismiss={() => setShowResources(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mb-2 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] px-3 py-2"
            >
              <Text as="p" variant="small" className="text-[var(--color-danger)]">
                {error}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crisis banner - repositioned to top of input area */}
        <div className="mx-4 mb-2 mt-1 flex items-center gap-2 rounded-lg bg-[var(--color-danger-soft)] px-3 py-2">
          <FiAlertCircle className="h-4 w-4 shrink-0 text-[var(--color-danger)]" />
          <Text as="span" variant="small" color="secondary" className="flex-1">
            Crisis? Call iCall{" "}
            <a 
              href="tel:9152987821" 
              className="font-bold text-[var(--color-danger)] underline underline-offset-2 hover:no-underline"
            >
              9152987821
            </a>
          </Text>
        </div>

        {/* Input */}
        <div className="border-t border-[var(--color-border)]/50 bg-[var(--color-surface-strong)]/30 px-3 py-3 sm:px-4">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            onStop={stopGenerating}
            placeholder="How are you feeling today?"
          />
        </div>
      </Card>

      {/* Modals */}
      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
      />
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
}

function EmptyState({ 
  userName, 
  onSwitchToBridge,
  onCheckIn,
  onBookSession
}: { 
  userName: string; 
  onSwitchToBridge: () => void;
  onCheckIn: () => void;
  onBookSession: () => void;
}) {
  return (
    <div className="flex h-full min-h-[340px] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        {/* Animated avatar */}
        <motion.div
          className="relative mb-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] shadow-xl shadow-[var(--color-primary)]/20"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiMessageSquare className="h-8 w-8 text-white" />
          </motion.div>
          
          {/* Floating greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-success)] text-2xl shadow-lg"
          >
            👋
          </motion.div>
        </motion.div>

        <Text as="p" variant="h4" weight="bold" className="text-[var(--color-text-primary)]">
          Hey {userName}! 👋
        </Text>
        <Text as="p" variant="body" color="secondary" className="mt-2 max-w-xs">
          No perfect words needed. I&apos;m here — tell me whatever feels right.
        </Text>

        {/* Quick action buttons */}
        <motion.div 
          className="mt-7 flex flex-wrap justify-center gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              size="sm" 
              onClick={onCheckIn}
              className="gap-2 shadow-md shadow-[var(--color-primary)]/10"
            >
              <FiActivity className="h-4 w-4" />
              Log mood
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              size="sm" 
              variant="warm" 
              onClick={onBookSession}
              className="gap-2"
            >
              Book session
            </Button>
          </motion.div>
        </motion.div>

        {/* Bridge tab nudge */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onSwitchToBridge}
          className="mt-6 flex items-center gap-2 rounded-full bg-[var(--color-surface-strong)] px-4 py-2 text-span transition-all hover:bg-[var(--color-border)] hover:gap-3"
        >
          <FiTrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          <Text as="span" variant="small" weight="medium">
            See your analytics →
          </Text>
        </motion.button>
      </motion.div>
    </div>
  );
}
