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

// Sophisticated compact easing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] } as any;

const messageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
};

export default function StudentChatPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || generateSessionId();
    }
    return "";
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
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
    <div className="bg-sanctuary flex h-full min-h-0 w-full flex-col font-sans selection:bg-primary/30">
      {/* Floating Action Button (New chat) - Minimalist */}
      <button
        type="button"
        onClick={startNewChat}
        className="absolute top-4 right-6 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/2 border border-white/5 text-text-dim transition-all hover:bg-white/10 hover:text-white active:scale-90"
        title="Start fresh"
      >
        <Icon icon="tabler:plus" className="text-lg" />
      </button>

      {/* Chat Area */}
      <main className="min-h-0 flex-1 overflow-y-auto no-scrollbar relative z-10">
        <div className={cn(
          "mx-auto w-full max-w-2xl px-4 py-8 sm:px-6",
          !hasMessages && "flex h-full items-center justify-center"
        )}>
          <AnimatePresence initial={false} mode="popLayout">
            {!hasMessages ? (
              <motion.div
                key="welcome"
                variants={messageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/2 border border-white/5 text-primary">
                  <Icon icon="tabler:message-heart" className="text-2xl" />
                </div>
                
                <Text as="h2" weight="bold" className="mb-1 text-xl tracking-tight text-white">
                  MindBot
                </Text>
                <p className="max-w-[240px] text-sm font-medium text-text-muted leading-relaxed mb-6">
                  A simple, quiet space to talk through what is on your mind.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full max-w-sm">
                  {[
                    { icon: 'tabler:mood-smile', label: 'Mood check', prompt: 'I want to talk about my mood.' },
                    { icon: 'tabler:wind', label: 'Feel calm', prompt: 'Can you help me with stress?' },
                    { icon: 'tabler:brain', label: 'Guided session', prompt: 'I would like a guided check-in.' },
                    { icon: 'tabler:leaf', label: 'Simple unwind', prompt: 'Help me unwind.' },
                  ].map((tip, i) => (
                    <motion.button
                      key={tip.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (i * 0.04), ...transition }}
                      onClick={() => send(tip.prompt)}
                      className="flex items-center gap-2 rounded-xl bg-white/1 border border-white/5 px-2.5 py-1.5 text-left transition-all hover:bg-white/3 group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/2 text-primary group-hover:scale-105 transition-transform">
                        <Icon icon={tip.icon} className="text-base" />
                      </div>
                      <span className="text-[11px] font-bold text-text-dim group-hover:text-white transition-colors">
                        {tip.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  const isFirst = index === 0 || messages[index - 1]?.role !== msg.role;

                  return (
                    <motion.div
                      key={msg.id || index}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={cn(
                        "group flex w-full gap-2.5",
                        isUser && "flex-row-reverse"
                      )}
                    >
                      {/* Avatar */}
                      {!isUser && isFirst ? (
                        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-xl bg-white/2 text-primary border border-white/5 transition-transform">
                          <Icon icon="tabler:robot" className="text-base" />
                        </div>
                      ) : (
                        <div className="size-7 shrink-0" />
                      )}

                      <div className={cn("flex flex-col min-w-0 max-w-[90%]", isUser ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "relative overflow-hidden rounded-xl px-4 py-2.5 transition-all duration-200",
                            isUser 
                              ? "bg-primary text-black font-bold rounded-tr-none" 
                              : "glass-sanctuary text-white/90 rounded-tl-none leading-snug",
                            !isFirst && (isUser ? "rounded-tr-xl" : "rounded-tl-xl")
                          )}
                        >
                          {cleanMessageContent(msg.content) ? (
                            <div className="text-[0.9375rem]">{cleanMessageContent(msg.content)}</div>
                          ) : !isUser && msg.isStreaming ? (
                            <div className="flex items-center gap-1.5 py-0.5">
                              {[0, 1, 2].map((dot) => (
                                <motion.span
                                  key={dot}
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.4, 1, 0.4] 
                                  }}
                                  transition={{ repeat: Infinity, duration: 1.2, delay: dot * 0.15 }}
                                  className="size-1 rounded-full bg-primary"
                                />
                              ))}
                            </div>
                          ) : null}

                          {!isUser && msg.action && (
                            <div className="mt-3 scale-90 origin-top-left">
                              <ChatActionCard
                                type={msg.action}
                                context={msg.actionContext || null}
                                onConfirm={() => confirmAction(msg.id, msg.action)}
                                onCancel={() => clearAction(msg.id)}
                              />
                            </div>
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
        </div>
      </main>

      {/* Compact Immersive Input Area */}
      <footer className="relative z-20 px-4 pb-6 pt-2">
        <div className="mx-auto max-w-xl">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-[11px] font-bold text-danger backdrop-blur-md"
            >
              <Icon icon="tabler:alert-circle" className="text-base" />
              {error}
            </motion.div>
          )}

          <form
            onSubmit={handleSubmit}
            className="group relative"
          >
            <div className="relative flex items-end gap-2 rounded-2xl bg-white/2 border border-white/5 p-1.5 transition-all duration-300 backdrop-blur-2xl">
              <textarea
                value={inputValue}
                disabled={!mounted || !sessionId || isLoading}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Talk to MindBot..."
                className="no-focus-ring max-h-32 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.9375rem] font-medium text-white placeholder:text-white/20"
              />


              <div className="flex h-[48px] items-center pr-1">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.button
                      key="stop"
                      type="button"
                      onClick={stopGenerating}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger border border-white/5"
                    >
                      <Icon icon="tabler:player-stop-filled" className="text-base" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="send"
                      type="submit"
                      disabled={!mounted || !inputValue.trim() || isLoading || !sessionId}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-all disabled:opacity-5"
                    >
                      <Icon icon="tabler:arrow-up" className="text-lg" strokeWidth={3} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              className="mt-3 flex items-center justify-center gap-3 text-[8px] uppercase tracking-[0.25em] font-black text-white"
            >
               <span>Safe Sanctuary</span>
               <span className="opacity-20">•</span>
               <span>End-to-End Quiet</span>
            </motion.div>
          </form>
        </div>
      </footer>
    </div>
  );
}
