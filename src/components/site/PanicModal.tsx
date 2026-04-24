"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { Button, Text } from "@/components/ui";

export function PanicModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-panic', handleOpen);
    return () => window.removeEventListener('open-panic', handleOpen);
  }, []);

  if (!isOpen) return null;

  const helplines = [
    { name: "iCall", number: "9152987821", hours: "Mon–Sat, 8 AM – 10 PM · Free" },
    { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7 · Free · Confidential" },
    { name: "NIMHANS Helpline", number: "080-46110007", hours: "National Mental Health Helpline" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-md bg-surface border border-white/10 rounded-lg shadow-2xl p-8 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform rotate-12">
          <Icon icon="tabler:heart-handshake" className="h-32 w-32" />
        </div>

        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
            <Icon icon="tabler:heart-handshake" className="h-8 w-8" />
          </div>
          <Text as="h3" variant="h3" weight="semibold" className="mb-2 tracking-tight">
            You are not alone
          </Text>
          <Text color="secondary" className="text-sm">
            Help is available right now. Please reach out.
          </Text>
        </div>

        <div className="space-y-3 mb-10">
          {helplines.map((h, i) => (
            <button 
              key={i} 
              className="w-full flex items-center gap-4 p-4 rounded-md bg-white/5 border border-white/5 hover:border-white/20 transition-all text-left group"
              onClick={() => window.open(`tel:${h.number.replace(/-/g, '')}`)}
            >
              <div className="h-10 w-10 shrink-0 rounded bg-white/10 flex items-center justify-center text-white transition-colors">
                <Icon icon="tabler:phone" className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{h.name}</div>
                <div className="text-lg font-bold text-primary tracking-tight">{h.number}</div>
                <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mt-1">{h.hours}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-8 border-t border-white/5 mb-4">
          <Button variant="ghost" className="justify-center border border-white/10" onClick={() => { setIsOpen(false); router.push('/student/chat'); }}>
            <Icon icon="tabler:robot" className="h-4 w-4" />
            MindBot
          </Button>
          <Button variant="warm" className="justify-center" onClick={() => { setIsOpen(false); router.push('/student/book'); }}>
            <Icon icon="tabler:calendar-event" className="h-4 w-4" />
            Book help
          </Button>
        </div>
        <button 
          className="w-full py-2 text-[10px] font-bold text-text-dim hover:text-white transition-colors uppercase tracking-[0.2em]" 
          onClick={() => setIsOpen(false)}
        >
          I am safe right now
        </button>
      </div>
    </div>
  );
}