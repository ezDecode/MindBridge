"use client";

import { motion, AnimatePresence } from "motion/react";
import { FiMessageSquare, FiAlertCircle, FiPlus } from "react-icons/fi";
import { Button, Card, Text } from "@/components/ui";
import { ChatWindow, ChatInput, BookingSuggestion, ResourceSuggestion } from "@/components/chat";
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
}: MindTabProps) {
  return (
    <Card variant="subtle" padding="none" className="flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)]"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiMessageSquare className="h-4 w-4 text-[var(--color-primary)]" />
          </motion.div>
          <div>
            <Text as="p" variant="label" weight="bold">
              MindBridge
            </Text>
            <div className="flex items-center gap-1.5">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Text as="span" variant="small" color="muted">
                Always here for you
              </Text>
            </div>
          </div>
        </div>
        <Button onClick={startNewSession} variant="ghost" size="sm">
          <FiPlus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Proactive nudge banner */}
      {data?.proactiveMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-b border-[var(--color-primary)]/15 bg-[var(--color-primary-light)] px-5 py-3 sm:px-6"
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

      {/* Chat body */}
      <div
        className="flex-1 overflow-y-auto px-5 sm:px-6"
        style={{ minHeight: "420px", maxHeight: "calc(100vh - 340px)" }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
                <FiMessageSquare className="h-7 w-7 text-[var(--color-primary)]" />
              </div>
              <Text as="p" variant="h4" weight="bold" className="mt-5">
                Hey {userName} 👋
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-2 max-w-sm">
                No perfect words needed, no pressure. I&apos;m just here — tell me whatever feels right, or we can just sit with it for a bit.
              </Text>
            </motion.div>
          </div>
        ) : (
          <ChatWindow messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Action suggestions */}
      <AnimatePresence>
        {showBooking && (
          <div className="px-5 sm:px-6">
            <BookingSuggestion
              onConfirm={() => {
                setShowBooking(false);
                router.push("/student/book");
              }}
              onCancel={() => setShowBooking(false)}
            />
          </div>
        )}
        {showResources && (
          <div className="px-5 sm:px-6">
            <ResourceSuggestion
              onShow={() => {
                setShowResources(false);
                router.push("/student/resources");
              }}
              onDismiss={() => setShowResources(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-2 rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] p-3 sm:mx-6">
          <Text as="p" variant="small" className="text-[var(--color-danger)]">
            {error}
          </Text>
        </div>
      )}

      {/* Crisis banner */}
      <div className="mx-5 mb-3 flex items-center gap-2 rounded-full bg-[var(--color-danger-soft)] px-3.5 py-1.5 sm:mx-6">
        <FiAlertCircle className="h-3.5 w-3.5 text-[var(--color-danger)]" />
        <Text as="span" variant="small" color="muted">
          Crisis? Call iCall{" "}
          <a href="tel:9152987821" className="font-bold text-[var(--color-danger)] underline underline-offset-2">
            9152987821
          </a>
        </Text>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] px-5 py-4 sm:px-6">
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          onStop={stopGenerating}
          placeholder="How are you feeling today?"
        />
      </div>
    </Card>
  );
}
