"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@iconify/react";
import { Text } from "@/components/ui";
import { ChatInput } from "@/components/chat";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

interface MindTabProps {
  onOpenSidebar?: () => void;
  onOpenCheckIn: () => void;
  onOpenQuestionnaire: () => void;
}

export function MindTab({ onOpenSidebar, onOpenCheckIn, onOpenQuestionnaire }: MindTabProps) {
  const router = useRouter();

  return (
    <div 
      
      
      
      className="h-full flex flex-col max-w-4xl mx-auto space-y-12 pb-20"
    >
      {/* Header */}
      <header  className="flex items-center justify-between px-1">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="tracking-tight text-white">MindSpace</Text>
          <p className="text-text-dim text-[10px] font-bold uppercase tracking-[0.15em] mt-1">Your secure conversational AI companion</p>
        </div>
        <button
          onClick={onOpenSidebar}
          className="flex lg:hidden h-10 w-10 items-center justify-center rounded-md bg-surface border border-border text-text-muted hover:text-white transition-all shadow-sm"
        >
          <Icon icon="tabler:menu-2" className="h-5 w-5" />
        </button>
      </header>

      {/* Main Input Area */}
      <div  className="relative group flex-1 flex flex-col justify-center">
        <div className="absolute -inset-1 rounded-lg bg-primary/20 opacity-0 blur-2xl transition-opacity duration-500 group-focus-within:opacity-100 pointer-events-none" />
        
        <div className="text-center mb-12 relative z-10">
          <div className="size-16 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/10">
            <Icon icon="tabler:robot" className="text-3xl" />
          </div>
          <Text as="h3" variant="h2" weight="semibold" className="text-white tracking-tight mb-4">How can I support you today?</Text>
          <Text color="secondary" className="max-w-[45ch] mx-auto text-sm leading-relaxed">
            I&apos;m here to listen, analyze your thoughts, or just provide a safe space to talk through campus life.
          </Text>
        </div>

        <div className="w-full max-w-2xl mx-auto shadow-2xl shadow-black/40 rounded-lg">
          <ChatInput 
            onSend={(val) => {
              router.push(`/student/chat?initial=${encodeURIComponent(val)}`);
            }}
            placeholder="Type anything... I'm listening."
          />
          
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              "I feel overwhelmed",
              "Help me sleep",
              "Exam pressure",
              "Just need a chat"
            ].map((suggest) => (
              <button 
                key={suggest}
                onClick={() => router.push(`/student/chat?initial=${encodeURIComponent(suggest)}`)}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-text-dim uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
              >
                {suggest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div  className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={onOpenCheckIn}
          className="group p-6 rounded-lg bg-surface border border-border hover:border-white/20 hover:bg-surface-hover transition-all text-left flex items-center gap-6"
        >
          <div className="size-12 rounded bg-white/5 flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary/10 transition-colors shrink-0">
            <Icon icon="tabler:mood-smile" className="text-2xl" />
          </div>
          <div>
            <Text weight="semibold" className="text-white text-sm mb-1 group-hover:text-primary transition-colors">Daily Check-in</Text>
            <Text variant="small" className="text-text-dim text-[10px] font-bold uppercase tracking-widest">Track your stability</Text>
          </div>
          <Icon icon="tabler:chevron-right" className="ml-auto text-text-dim opacity-0 group-hover:opacity-100 transition-all" />
        </button>

        <button 
          onClick={onOpenQuestionnaire}
          className="group p-6 rounded-lg bg-surface border border-border hover:border-white/20 hover:bg-surface-hover transition-all text-left flex items-center gap-6"
        >
          <div className="size-12 rounded bg-white/5 flex items-center justify-center text-secondary border border-white/5 group-hover:bg-secondary/10 transition-colors shrink-0">
            <Icon icon="tabler:bolt" className="text-2xl" />
          </div>
          <div>
            <Text weight="semibold" className="text-white text-sm mb-1 group-hover:text-secondary transition-colors">Guided Assessment</Text>
            <Text variant="small" className="text-text-dim text-[10px] font-bold uppercase tracking-widest">PHQ-9 & GAD-7 screening</Text>
          </div>
          <Icon icon="tabler:chevron-right" className="ml-auto text-text-dim opacity-0 group-hover:opacity-100 transition-all" />
        </button>
      </div>
    </div>
  );
}
