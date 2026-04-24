"use client";

import { type FormEvent, useEffect, useRef, useState, useCallback } from "react";
import { useChat, cleanMessageContent } from "@/hooks/useChat";
import { getClient } from "@/lib/supabase/client";
import { generateSessionId } from "@/app/student/(shell)/dashboard/_components/types";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui";

const STORAGE_KEY = "currentChatSession";

const messageVariants = {
  initial: { opacity: 0, scale: 0.9, y: 10, originX: 0 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, duration: 0.4, bounce: 0.2 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const userMessageVariants = {
  ...messageVariants,
  initial: { ...messageVariants.initial, originX: 1 }
};

const chipVariants = {
  hidden: { opacity: 0, x: 20 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.5 + (i * 0.1), duration: 0.3 }
  })
};

export default function StudentChatPage() {
  const [supabase] = useState(() => (typeof window === "undefined" ? null : getClient()));
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "guest">("loading");
  const [sessionId, setSessionId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading, setMessages } = useChat({
    sessionId,
    initialMessages: [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const initAuth = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setAuthState(user ? "authenticated" : "guest");
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSessionId(stored);
      } else {
        const newId = generateSessionId();
        setSessionId(newId);
        localStorage.setItem(STORAGE_KEY, newId);
      }
    };
    initAuth();
  }, [supabase]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const msg = inputValue.trim();
    setInputValue("");
    await sendMessage(msg);
  };

  const handleQuickReply = async (text: string) => {
    if (isLoading) return;
    await sendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-5xl mx-auto bg-surface relative overflow-hidden border-x border-border shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Icon icon="tabler:robot" className="text-2xl" />
          </div>
          <div>
            <Text as="h3" variant="body" weight="semibold" className="text-white">MindBot</Text>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="size-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Active session</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="size-8 rounded bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Icon icon="tabler:dots" className="text-text-muted text-lg" />
          </button>
        </div>
      </div>
      
      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-background scroll-smooth no-scrollbar min-h-0">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              variants={messageVariants}
              initial="initial"
              animate="animate"
              className="flex gap-4 max-w-[85%]"
            >
              <div className="size-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 self-start mt-1">
                <Icon icon="tabler:robot" className="text-primary text-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-surface-raised border border-border px-5 py-3 rounded-lg rounded-tl-none shadow-sm text-sm leading-relaxed text-white">
                  <span className="font-bold text-primary block mb-1 text-base tracking-tight uppercase text-xs">MindBot</span>
                  Hello! I&apos;m your MindBot companion. I&apos;m here to listen, support, and help you navigate campus life. How are you feeling right now?
                </div>
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest px-1">Just now</span>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div 
                key={msg.id || idx}
                variants={msg.role === 'user' ? userMessageVariants : messageVariants}
                initial="initial"
                animate="animate"
                className={cn(
                  "flex gap-4 max-w-[90%]",
                  msg.role === 'user' ? "self-end flex-row-reverse" : ""
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="size-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 self-start mt-1">
                    <Icon icon="tabler:robot" className="text-primary text-xl" />
                  </div>
                )}
                <div className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "")}>
                  <div className={cn(
                    "px-5 py-3 rounded-lg shadow-sm text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-white text-black rounded-tr-none font-medium" 
                      : "bg-surface-raised border border-border rounded-tl-none text-white"
                  )}>
                    {cleanMessageContent(msg.content)}
                  </div>
                  <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest px-1">
                    {msg.role === 'user' ? 'Sent' : 'MindBot'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="size-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 self-start mt-1">
                <Icon icon="tabler:robot" className="text-primary text-xl" />
              </div>
              <div className="bg-surface-raised border border-border px-4 py-3 rounded-lg rounded-tl-none flex gap-1.5 items-center">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="size-1 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="size-1 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="size-1 rounded-full bg-primary" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Footer Area with Quick Replies and Input */}
      <div className="bg-surface border-t border-border p-6 relative z-10">
        <AnimatePresence>
          {!isLoading && messages.length < 5 && (
            <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar px-1">
              {[
                { label: 'Exam anxiety', icon: 'tabler:mood-sad', text: 'I am feeling anxious about my exams' },
                { label: 'Hostel life', icon: 'tabler:home', text: 'I am feeling lonely in hostel' },
                { label: 'Sleep issues', icon: 'tabler:bed', text: 'I cannot sleep properly' },
                { label: 'Placement stress', icon: 'tabler:briefcase', text: 'I am stressed about placements' }
              ].map((reply, i) => (
                <motion.button
                  key={reply.label}
                  custom={i}
                  variants={chipVariants}
                  initial="hidden"
                  animate="show"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickReply(reply.text)}
                  className="flex-shrink-0 px-4 py-2 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-text-muted hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest"
                >
                  <Icon icon={reply.icon} className="text-sm text-primary" />
                  {reply.label}
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        <form 
          className="flex gap-3 bg-background p-1.5 rounded-md border border-border shadow-inner group focus-within:border-white/20 transition-all" 
          onSubmit={handleSend}
        >
          <input 
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-white placeholder:text-text-dim font-medium" 
            placeholder="Talk through whatever is on your mind..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button 
            className={cn(
              "size-9 rounded bg-white text-black flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none",
            )}
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
          >
            <Icon icon="tabler:send" className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
}
