"use client";

import { type FormEvent, type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowUpRight,
  FiImage,
  FiLogOut,
  FiMessageSquare,
  FiMic,
  FiPlus,
  FiSend,
  FiShield,
  FiSun,
  FiTrash2,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { Button, Text } from "@/components/ui";
import { useChat, cleanMessageContent } from "@/hooks/useChat";
import { getClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { generateSessionId } from "@/app/student/dashboard/_components/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

type ChatAction = {
  type: "book_counselor" | "show_resources" | "send_crisis_alert";
  context: string | null;
};

type SessionPreview = {
  id: string;
  label: string;
  active: boolean;
};

const STORAGE_KEY = "currentChatSession";
const MAX_SESSIONS = 6;

const emptyStateColumns = [
  {
    title: "Examples",
    icon: FiMessageSquare,
    items: [
      "\"Explain quantum computing in simple terms\"",
      "\"Got any creative ideas for a 10 year old's birthday?\"",
      "\"How do I make an HTTP request in Javascript?\"",
    ],
  },
  {
    title: "Capabilities",
    icon: FiZap,
    items: [
      "Remembers what you said earlier in the conversation.",
      "Allows you to provide follow-up corrections.",
      "Trained to decline inappropriate requests.",
    ],
  },
  {
    title: "Limitations",
    icon: FiShield,
    items: [
      "May occasionally generate incorrect information.",
      "May occasionally produce harmful instructions or biased content.",
      "Limited knowledge of world and events after 2021.",
    ],
  },
] as const;

const fallbackSessionLabels = [
  "AI Chat Tool Ethics",
  "AI Chat Tool Impact Writing",
  "New chat",
];

export function StudentChatWorkspace() {
  const router = useRouter();
  const [supabase] = useState<ReturnType<typeof getClient> | null>(() => (typeof window === "undefined" ? null : getClient()));
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "guest">("loading");
  const [userId, setUserId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionPreviews, setSessionPreviews] = useState<SessionPreview[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [actionPrompt, setActionPrompt] = useState<ChatAction | null>(null);

  const { messages, sendMessage, isLoading, error, stopGenerating, setMessages, clearMessages } = useChat({
    sessionId,
    initialMessages: [],
    onAction: setActionPrompt,
    onCrisis: () =>
      setWorkspaceError("If you need urgent support, call iCall at 9152987821 or your local emergency services."),
  });

  const isBusy = isLoading || isLoadingHistory;
  const currentSessionLabel = truncateLabel(cleanMessageContent(messages.find((message) => message.role === "user")?.content ?? "")) || "New chat";
  const displaySessionPreviews = sessionId
    ? [
        {
          id: sessionId,
          label: currentSessionLabel,
          active: true,
        },
        ...sessionPreviews
          .filter((session) => session.id !== sessionId)
          .map((session) => ({ ...session, active: false })),
      ].slice(0, MAX_SESSIONS)
    : sessionPreviews;

  const upsertSessionPreview = useCallback((targetSessionId: string, targetMessages: Message[]) => {
    const firstUserMessage = targetMessages.find((message) => message.role === "user")?.content ?? "";
    const label = firstUserMessage ? truncateLabel(cleanMessageContent(firstUserMessage)) : "New chat";

    setSessionPreviews((current) => {
      const withoutTarget = current.filter((session) => session.id !== targetSessionId);
      const next = [{ id: targetSessionId, label, active: true }, ...withoutTarget.map((session) => ({ ...session, active: false }))];
      return next.slice(0, MAX_SESSIONS);
    });
  }, []);

  const loadSessionMessages = useCallback(
    async (currentUserId: string, targetSessionId: string) => {
      if (!supabase) return;

      setIsLoadingHistory(true);
      setWorkspaceError(null);
      setActionPrompt(null);

      const { data, error: loadError } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("user_id", currentUserId)
        .eq("session_id", targetSessionId)
        .order("sent_at", { ascending: true });

      if (loadError) {
        setWorkspaceError("We couldn't load this conversation right now.");
        setMessages([]);
        setIsLoadingHistory(false);
        return;
      }

      const nextMessages = (data ?? []).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      }));

      setMessages(nextMessages);
      upsertSessionPreview(targetSessionId, nextMessages);
      setIsLoadingHistory(false);
    },
    [setMessages, supabase, upsertSessionPreview]
  );

  const refreshSessionPreviews = useCallback(
    async (currentUserId: string, activeSessionId: string) => {
      if (!supabase) return;

      const { data: sessions, error: sessionsError } = await supabase
        .from("chat_sessions")
        .select("id, title, last_message_at")
        .eq("user_id", currentUserId)
        .order("last_message_at", { ascending: false })
        .limit(MAX_SESSIONS);

      if (sessionsError) {
        setSessionPreviews((current) => {
          if (current.length > 0) return current;
          return fallbackSessionLabels.map((label, index) => ({
            id: index === 0 ? activeSessionId : `fallback-${index}`,
            label,
            active: index === 0,
          }));
        });
        return;
      }

      const orderedIds = Array.from(new Set([activeSessionId, ...(sessions ?? []).map((session) => session.id)]));

      if (orderedIds.length === 0) {
        setSessionPreviews([{ id: activeSessionId, label: "New chat", active: true }]);
        return;
      }

      const { data: previewMessages } = await supabase
        .from("chat_messages")
        .select("session_id, role, content, sent_at")
        .eq("user_id", currentUserId)
        .in("session_id", orderedIds)
        .order("sent_at", { ascending: true });

      const previewMap = new Map<string, string>();

      for (const message of previewMessages ?? []) {
        if (previewMap.has(message.session_id)) continue;
        const content = cleanMessageContent(message.content);
        if (message.role === "user" && content) {
          previewMap.set(message.session_id, truncateLabel(content));
        }
      }

      const nextPreviews = orderedIds.map((id, index) => {
        const session = sessions?.find((entry) => entry.id === id);
        const label = previewMap.get(id) || session?.title || (id === activeSessionId ? "New chat" : fallbackSessionLabels[index] || "Conversation");
        return {
          id,
          label,
          active: id === activeSessionId,
        };
      });

      setSessionPreviews(nextPreviews.slice(0, MAX_SESSIONS));
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) return;

    let isCancelled = false;

    const initialiseWorkspace = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!isCancelled) setAuthState("guest");
        return;
      }

      const storedSessionId = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
      const activeSessionId = storedSessionId || generateSessionId();

      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, activeSessionId);
      }

      if (isCancelled) return;

      setUserId(user.id);
      setSessionId(activeSessionId);
      setAuthState("authenticated");

      await Promise.all([refreshSessionPreviews(user.id, activeSessionId), loadSessionMessages(user.id, activeSessionId)]);
    };

    void initialiseWorkspace();

    return () => {
      isCancelled = true;
    };
  }, [loadSessionMessages, refreshSessionPreviews, supabase]);

  const startNewChat = useCallback(() => {
    const nextSessionId = generateSessionId();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, nextSessionId);
    }

    setSessionId(nextSessionId);
    setWorkspaceError(null);
    setActionPrompt(null);
    clearMessages();
    setSessionPreviews((current) => [
      { id: nextSessionId, label: "New chat", active: true },
      ...current.filter((session) => session.id !== nextSessionId).map((session) => ({ ...session, active: false })),
    ]);
  }, [clearMessages]);

  const openSession = useCallback(
    async (targetSessionId: string) => {
      if (!userId || targetSessionId === sessionId || isBusy) return;

      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, targetSessionId);
      }

      setSessionId(targetSessionId);
      await Promise.all([refreshSessionPreviews(userId, targetSessionId), loadSessionMessages(userId, targetSessionId)]);
    },
    [isBusy, loadSessionMessages, refreshSessionPreviews, sessionId, userId]
  );

  const handlePromptSubmit = useCallback(
    (prompt: string) => {
      if (!prompt.trim() || !sessionId || isBusy) return;
      setWorkspaceError(null);
      setActionPrompt(null);
      void sendMessage(prompt);
    },
    [isBusy, sendMessage, sessionId]
  );

  const handleSidebarAction = useCallback(
    async (action: "clear" | "light" | "account" | "faq" | "logout") => {
      if (action === "clear") {
        startNewChat();
        return;
      }

      if (action === "light") {
        setWorkspaceError("Light mode is already active.");
        return;
      }

      if (action === "account") {
        router.push("/student/dashboard");
        return;
      }

      if (action === "faq") {
        router.push("/#faq");
        return;
      }

      if (!supabase) return;

      await supabase.auth.signOut();
      router.push("/login");
    },
    [router, startNewChat, supabase]
  );

  const handleActionClick = useCallback(() => {
    if (!actionPrompt) return;

    if (actionPrompt.type === "book_counselor") {
      router.push("/student/book");
      return;
    }

    if (actionPrompt.type === "show_resources") {
      router.push("/student/resources");
    }
  }, [actionPrompt, router]);

  if (authState === "loading") {
    return (
      <div className="flex min-h-[70svh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
          <Text as="span" variant="small" weight="medium" className="text-black">
            Loading chat workspace
          </Text>
        </div>
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <div className="flex min-h-[70svh] items-center justify-center">
        <div className="w-full max-w-lg rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-[0_30px_70px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-black text-white">
            <FiMessageSquare className="h-7 w-7" />
          </div>
          <Text as="h1" variant="h5" weight="bold" className="mt-6 text-black">
            Sign in to open your chat workspace
          </Text>
          <Text as="p" variant="body" color="secondary" className="mt-3 text-balance">
            Your conversations stay private to your account, so we need to get you signed in first.
          </Text>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/login" className="!h-11 !rounded-[14px] !px-5">
              Sign in
            </Button>
            <Button href="/" variant="warm" className="!h-11 !rounded-[14px] !px-5">
              Back home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 h-[calc(100svh-4.75rem)] flex flex-col justify-end pb-0">
      <div className="mx-auto flex h-full w-full max-w-[100rem] overflow-hidden rounded-t-[28px] border border-b-0 border-black/10 bg-white shadow-[0_24px_72px_rgba(15,23,42,0.08)]">
        <aside className="flex w-full shrink-0 flex-col border-b border-black/8 bg-[#fcfcfc] md:w-[282px] md:border-b-0 md:border-r">
          <div className="space-y-1 p-4">
            <button
              type="button"
              onClick={startNewChat}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-black px-4 text-sm font-medium text-white transition-transform duration-150 hover:scale-[0.995] disabled:opacity-60"
              disabled={isBusy}
            >
              <FiPlus className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <div className="space-y-1">
              {displaySessionPreviews.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => void openSession(session.id)}
                  disabled={isBusy}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[12px] px-3 py-3 text-left text-sm text-black transition-colors duration-150",
                    session.active ? "bg-black text-white" : "hover:bg-black/[0.03]"
                  )}
                >
                  <FiMessageSquare className={cn("h-4 w-4 shrink-0", session.active ? "text-white" : "text-black/70")} />
                  <span className="truncate">{session.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-black/8 px-4 py-4">
            <div className="space-y-1">
              <SidebarUtilityButton
                icon={<FiTrash2 className="h-4 w-4" />}
                label="Clear conversations"
                onClick={() => void handleSidebarAction("clear")}
              />
              <SidebarUtilityButton icon={<FiSun className="h-4 w-4" />} label="Light mode" onClick={() => void handleSidebarAction("light")} />
              <SidebarUtilityButton
                icon={<FiUser className="h-4 w-4" />}
                label="My account"
                onClick={() => void handleSidebarAction("account")}
              />
              <SidebarUtilityButton
                icon={<FiArrowUpRight className="h-4 w-4" />}
                label="Updates & FAQ"
                onClick={() => void handleSidebarAction("faq")}
              />
              <SidebarUtilityButton
                icon={<FiLogOut className="h-4 w-4" />}
                label="Log out"
                onClick={() => void handleSidebarAction("logout")}
              />
            </div>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_72%,#fafafa_100%)] h-full">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-44 pt-10 sm:px-8 lg:px-12 lg:pt-16">
            {messages.length > 0 ? (
              <ConversationPane messages={messages} isLoading={isLoading} />
            ) : (
              <EmptyState onPromptSelect={handlePromptSubmit} disabled={isBusy || !sessionId} />
            )}
          </div>

          {isLoadingHistory ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[6px]">
              <div className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                Loading conversation
              </div>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-black/5 bg-white/45 px-4 pb-5 pt-4 backdrop-blur-[20px] sm:px-8 lg:px-12">
            <div className="pointer-events-auto mx-auto w-full max-w-[760px]">
              {actionPrompt ? (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-[16px] border border-black/10 bg-white/80 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                  <Text as="p" variant="small" className="text-black/75">
                    {actionPrompt.type === "book_counselor"
                      ? "A counselor booking path is ready if you'd like to take the next step."
                      : "I found a few resources that might help you right now."}
                  </Text>
                  <button
                    type="button"
                    onClick={handleActionClick}
                    className="shrink-0 rounded-[10px] bg-black px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black/85"
                  >
                    {actionPrompt.type === "book_counselor" ? "Book now" : "Open resources"}
                  </button>
                </div>
              ) : null}

              {workspaceError || error ? (
                <div className="mb-3 rounded-[16px] border border-[#f3c9c9] bg-[#fff4f4] px-4 py-3 text-sm text-[#9f3f3f] shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                  {workspaceError || error}
                </div>
              ) : null}

              <div className="mb-3 rounded-[16px] border border-[#f4d8d0] bg-[#fff8f5] px-4 py-2.5 text-sm text-[#72554b]">
                Urgent support: call <a href="tel:9152987821" className="font-semibold text-black underline underline-offset-2">9152987821</a>
              </div>

              <WorkspaceComposer
                disabled={!sessionId || isLoadingHistory}
                isLoading={isLoading}
                onStop={stopGenerating}
                onSubmit={handlePromptSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState({
  onPromptSelect,
  disabled,
}: {
  onPromptSelect: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[920px] flex-col items-center justify-center pb-8 text-center">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-black/10 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <FiMessageSquare className="h-8 w-8 text-black" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[2rem] font-semibold tracking-[-0.04em] text-black sm:text-[2.4rem]">MindBridge</span>
          <span className="rounded-[6px] bg-[#d9d3ff] px-2 py-0.5 text-[11px] font-medium text-[#6b64e8]">Care</span>
        </div>
      </div>

      <div className="mt-16 grid w-full gap-x-10 gap-y-8 md:grid-cols-3">
        {emptyStateColumns.map((column) => {
          const Icon = column.icon;

          return (
            <div key={column.title} className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center text-black">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-2 text-[18px] font-semibold leading-7 tracking-[-0.02em] text-black">{column.title}</h2>
              <div className="mt-5 flex w-full flex-col gap-3">
                {column.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPromptSelect(item.replaceAll("\"", ""))}
                    disabled={disabled}
                    className="rounded-[8px] bg-[#f7f7f8] px-3 py-2.5 text-left text-[14px] leading-5 text-black/85 transition-colors hover:bg-[#f1f1f3] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConversationPane({
  messages,
  isLoading,
}: {
  messages: Message[];
  isLoading: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isLoading, messages]);

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const content = cleanMessageContent(message.content);

        return (
          <div key={message.id} className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser ? (
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-black text-white shadow-[0_12px_22px_rgba(15,23,42,0.12)]">
                <FiMessageSquare className="h-4 w-4" />
              </div>
            ) : null}

            <div
              className={cn(
                "max-w-[min(42rem,88%)] rounded-[20px] px-4 py-3 text-[15px] leading-7 shadow-[0_12px_24px_rgba(15,23,42,0.04)]",
                isUser ? "rounded-br-[8px] bg-[#f4f4f5] text-black" : "rounded-bl-[8px] border border-black/6 bg-white text-black"
              )}
            >
              {content ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : message.isStreaming ? (
                <TypingDots />
              ) : null}
            </div>

            {isUser ? (
              <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#f4f4f5] text-[11px] font-semibold text-black/70 sm:flex">
                You
              </div>
            ) : null}
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}

function WorkspaceComposer({
  disabled,
  isLoading,
  onSubmit,
  onStop,
}: {
  disabled: boolean;
  isLoading: boolean;
  onSubmit: (value: string) => void;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "20px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  }, [value]);

  const submitValue = () => {
    if (!value.trim() || disabled || isLoading) return;

    onSubmit(value.trim());
    setValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitValue();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitValue();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-14 items-end gap-1 rounded-[16px] border border-black/15 bg-white/80 px-3 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-[20px]"
    >
      <IconButton ariaLabel="Voice input" disabled>
        <FiMic className="h-4 w-4" />
      </IconButton>
      <IconButton ariaLabel="Attach image" disabled>
        <FiImage className="h-4 w-4" />
      </IconButton>

      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type message"
        disabled={disabled || isLoading}
        className="min-h-5 flex-1 resize-none bg-transparent px-2 py-1 text-[14px] leading-5 text-black placeholder:text-black/25 focus:outline-none disabled:cursor-not-allowed"
      />

      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/85"
          aria-label="Stop generating"
        >
          <span className="h-3 w-3 rounded-[3px] bg-white" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:text-black/25 enabled:bg-black enabled:text-white enabled:hover:bg-black/85"
          aria-label="Send message"
        >
          <FiSend className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

function SidebarUtilityButton({
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
      className="flex w-full items-center gap-2 rounded-[12px] px-3 py-3 text-left text-sm text-black transition-colors hover:bg-black/[0.03]"
    >
      <span className="text-black/80">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function IconButton({
  ariaLabel,
  children,
  disabled,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full text-black/70 transition-colors hover:bg-black/[0.04] disabled:cursor-default disabled:opacity-100"
    >
      {children}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 py-1">
      {[0, 0.15, 0.3].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-black/40"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}

function truncateLabel(value: string) {
  return value.length > 34 ? `${value.slice(0, 33)}…` : value;
}
