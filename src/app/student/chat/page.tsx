"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiArrowRight, FiPhone, FiPlus } from "react-icons/fi";
import { AnimatePresence } from "motion/react";
import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import { ChatWindow, ChatInput, BookingSuggestion, ResourceSuggestion } from "@/components/chat";
import { useChat } from "@/hooks/useChat";
import { getClient } from "@/lib/supabase/client";

// Generate a new session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function StudentChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<{ id: string; title: string; time: string }[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Initialize session and check auth
  useEffect(() => {
    const init = async () => {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      // Create a new session or get existing
      const storedSessionId = sessionStorage.getItem("currentChatSession");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        sessionStorage.setItem("currentChatSession", newSessionId);
      }

      // Load recent sessions
      const { data: recentSessions } = await supabase
        .from("chat_sessions")
        .select("id, title, last_message_at")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false })
        .limit(5);

      if (recentSessions) {
        setSessions(
          recentSessions.map((s) => ({
            id: s.id,
            title: s.title || "Chat session",
            time: formatRelativeTime(new Date(s.last_message_at)),
          }))
        );
      }
    };

    init();
  }, []);

  const handleAction = useCallback((action: { type: string; context: string | null }) => {
    if (action.type === "book_counselor") {
      setShowBooking(true);
    } else if (action.type === "show_resources") {
      setShowResources(true);
    }
  }, []);

  const handleCrisis = useCallback(() => {
    // Crisis alert is handled server-side
    // This callback could show additional UI if needed
    console.log("Crisis detected - alert sent to counselor");
  }, []);

  const {
    messages,
    sendMessage,
    isLoading,
    error,
    stopGenerating,
  } = useChat({
    sessionId,
    onAction: handleAction,
    onCrisis: handleCrisis,
  });

  const startNewSession = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    sessionStorage.setItem("currentChatSession", newSessionId);
    // Clear messages would happen via setMessages([]) from useChat
    window.location.reload(); // Simple approach for now
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <Text as="p" variant="body" color="secondary" className="mt-4">
            Loading...
          </Text>
        </div>
      </div>
    );
  }

  // Show preview mode for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        <PageIntro
          eyebrow="Support chat"
          title="Sign in to start chatting"
          description="Create an account to talk with MindBridge. Your conversations are private and secure."
          actions={
            <>
              <Button href="/login">Sign in</Button>
              <Button href="/student/resources" variant="warm">
                Browse resources
              </Button>
            </>
          }
        />

        <Card variant="subtle" padding="lg" className="text-center">
          <Text as="p" variant="h4" weight="bold">
            A warm companion, not a wall of AI text.
          </Text>
          <Text as="p" variant="body" color="secondary" className="mt-3 mx-auto max-w-md">
            MindBridge remembers your conversations, notices patterns, and reaches out
            when you might need support. Sign in to experience personalized care.
          </Text>
          <Button href="/login" variant="warm" size="md" className="mt-6">
            Get started
          </Button>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Support chat"
        title="Short replies, steady tone, one next step at a time."
        description="A calm companion, not a wall of AI text. Crisis support stays close without overwhelming."
        actions={
          <>
            <Button href="/student/check-in">Check mood</Button>
            <Button onClick={startNewSession} variant="warm">
              <FiPlus className="h-4 w-4" />
              New chat
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card variant="subtle" padding="lg" className="flex flex-col">
          {/* Crisis info banner */}
          <div className="flex items-start gap-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] p-4">
            <FiAlertCircle className="mt-0.5 h-5 w-5 text-[var(--color-danger)]" />
            <div>
              <Text as="p" variant="h6" weight="bold">
                Crisis support stays close
              </Text>
              <Text as="p" variant="small" color="secondary" className="mt-2">
                Mentions of self-harm surface iCall <code>9152987821</code> and suggest human help immediately.
              </Text>
            </div>
          </div>

          {/* Chat messages */}
          <div className="mt-4 flex-1 overflow-y-auto" style={{ minHeight: "300px", maxHeight: "500px" }}>
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <Text as="p" variant="h5" weight="bold">
                    Hey there 👋
                  </Text>
                  <Text as="p" variant="body" color="secondary" className="mt-2 max-w-sm">
                    I&apos;m MindBridge, your companion. How are you feeling today?
                  </Text>
                </div>
              </div>
            ) : (
              <ChatWindow messages={messages} isLoading={isLoading} />
            )}
          </div>

          {/* Action suggestions */}
          <AnimatePresence>
            {showBooking && (
              <div className="mt-4">
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
              <div className="mt-4">
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

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] p-3">
              <Text as="p" variant="small" className="text-[var(--color-danger)]">
                {error}
              </Text>
            </div>
          )}

          {/* Chat input */}
          <div className="mt-4">
            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              onStop={stopGenerating}
              placeholder="How are you feeling today?"
            />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="default" padding="lg">
            <Text as="p" variant="h6" weight="bold">
              Recent sessions
            </Text>
            <div className="mt-4 space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      setSessionId(session.id);
                      sessionStorage.setItem("currentChatSession", session.id);
                      window.location.reload();
                    }}
                    className="w-full rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left transition-colors hover:border-[var(--color-primary)]/30"
                  >
                    <Text as="p" variant="label" weight="bold">
                      {session.title}
                    </Text>
                    <Text as="p" variant="small" color="secondary" className="mt-1">
                      {session.time}
                    </Text>
                  </button>
                ))
              ) : (
                <Text as="p" variant="small" color="secondary">
                  No previous sessions yet. Start chatting!
                </Text>
              )}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <Text as="p" variant="h6" weight="bold">
                  Need a human next?
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-2 max-w-[32ch]">
                  Escalation that feels supportive, not abrupt.
                </Text>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                <FiPhone className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <a
                href="tel:9152987821"
                className="interactive-panel flex items-center justify-between rounded-[calc(var(--radius-md)*var(--brm))] squircle px-4 py-3"
              >
                <div>
                  <Text as="p" variant="label" weight="bold">
                    Call iCall helpline
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    9152987821
                  </Text>
                </div>
                <FiArrowRight className="h-4 w-4 text-[var(--color-primary)]" />
              </a>
              <Link
                href="/student/book"
                className="interactive-panel flex items-center justify-between rounded-[calc(var(--radius-md)*var(--brm))] squircle px-4 py-3"
              >
                <div>
                  <Text as="p" variant="label" weight="bold">
                    Book a counselor session
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    Anonymous, named, or crisis booking
                  </Text>
                </div>
                <FiArrowRight className="h-4 w-4 text-[var(--color-primary)]" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
