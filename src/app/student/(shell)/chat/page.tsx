"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";
import { cleanMessageContent, useChat } from "@/hooks/useChat";
import { generateSessionId } from "@/app/student/(shell)/dashboard/_components/types";
import { Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ChatActionCard } from "./_components/ChatActionCard";

const STORAGE_KEY = "currentChatSession";

const messageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.16, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

export default function StudentChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || generateSessionId();
    }
    return "";
  });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading, error, stopGenerating, setMessages } = useChat({
    sessionId,
    initialMessages: [],
  });

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (sessionId) localStorage.setItem(STORAGE_KEY, sessionId);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewChat = () => {
    const nextSessionId = generateSessionId();
    setSessionId(nextSessionId);
    setMessages([]);
    setInputValue("");
  };

  const send = async (text = inputValue) => {
    const message = text.trim();
    if (!message || isLoading || !sessionId) return;

    setInputValue("");
    await sendMessage(message);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send();
  };

  const clearAction = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, action: null } : msg)));
  };

  const confirmAction = (
    messageId: string,
    action: "book_counselor" | "show_resources" | "send_crisis_alert" | null | undefined
  ) => {
    clearAction(messageId);

    if (action === "book_counselor") router.push("/student/book");
    if (action === "show_resources") router.push("/student/resources");
    if (action === "send_crisis_alert") window.dispatchEvent(new CustomEvent("open-panic"));
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#111214]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-4 pl-16 lg:pl-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="rounded-md bg-white/[0.06] px-2 py-1 typo-ui font-medium text-text-dim">Beta</span>
          <Text as="h1" variant="body" weight="semibold" className="truncate text-white">
            MindBot
          </Text>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 typo-base font-medium text-text-muted hover:bg-white/[0.07] hover:text-white"
        >
          <Icon icon="tabler:plus" className="text-base" />
          New chat
        </button>
      </header>

      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto no-scrollbar",
          hasMessages ? "px-4 py-6 sm:px-8" : "flex items-center justify-center px-4 pb-28 pt-8"
        )}
      >
        <AnimatePresence initial={false}>
          {!hasMessages ? (
            <motion.div
              key="welcome"
              variants={messageMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mx-auto flex w-full max-w-2xl flex-col items-center text-center"
            >
              <Icon icon="tabler:message-heart" className="mb-6 text-3xl text-text-muted" />
              <Text as="h2" variant="h3" weight="semibold" className="mb-3 text-white">
                Welcome to MindBot
              </Text>
              <p className="mb-7 max-w-md typo-base font-medium text-text-muted">
                Ask anything or talk through what is on your mind.
              </p>
            </motion.div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";

                return (
                  <motion.div
                    key={msg.id || index}
                    variants={messageMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={cn("flex gap-3", isUser && "justify-end")}
                  >
                    {!isUser && (
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                        <Icon icon="tabler:message-heart" className="text-lg" />
                      </div>
                    )}

                    <div className={cn("min-w-0", isUser ? "max-w-[min(36rem,86vw)]" : "max-w-[min(42rem,86vw)]")}>
                      <div
                        className={cn(
                          "whitespace-pre-wrap rounded-xl px-3 py-1.5 text-[1.0625rem] leading-relaxed",
                          isUser ? "bg-transparent text-white border border-white/10" : "bg-transparent text-white border border-white/[0.04]"
                        )}
                      >
                        {cleanMessageContent(msg.content) ? (
                          cleanMessageContent(msg.content)
                        ) : !isUser && msg.isStreaming ? (
                          <div className="flex items-center gap-2 py-1">
                            <div className="flex gap-1">
                              {[0, 1, 2].map((dot) => (
                                <motion.span
                                  key={dot}
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }}
                                  className="size-1.5 rounded-full bg-primary"
                                />
                              ))}
                            </div>
                            <span className="typo-ui font-medium text-text-dim">Thinking...</span>
                          </div>
                        ) : null}

                        {!isUser && msg.action && (
                          <ChatActionCard
                            type={msg.action}
                            context={msg.actionContext || null}
                            onConfirm={() => confirmAction(msg.id, msg.action)}
                            onCancel={() => clearAction(msg.id)}
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="shrink-0 border-t border-white/[0.06] bg-[#111214] px-4 py-4 sm:px-6">
        {error && (
          <div className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 typo-ui text-danger">
            <Icon icon="tabler:alert-circle" className="text-base" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl flex-col bg-transparent"
        >
          <textarea
            value={inputValue}
            disabled={!sessionId || isLoading}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder="Ask MindBot..."
            className="max-h-36 min-h-12 resize-none bg-transparent px-0 py-2 text-[1.0625rem] leading-relaxed text-white outline-none focus:outline-none focus:ring-0 placeholder:text-text-dim disabled:opacity-50"
          />

          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="hidden typo-ui text-text-dim sm:block">Enter to send · Shift Enter for a new line</p>
            <div className="ml-auto flex items-center gap-2">
              {isLoading && (
                <button
                  type="button"
                  onClick={stopGenerating}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-white/[0.08] px-3 typo-ui font-medium text-text-muted hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon icon="tabler:player-stop" className="text-base" />
                  Stop
                </button>
              )}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || !sessionId}
                className="flex size-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-30 transition-colors"
                aria-label="Send message"
              >
                <Icon icon="tabler:arrow-up" className="text-xl" />
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}
