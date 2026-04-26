"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

import { Text } from "@/components/ui";
import { cn } from "@/lib/utils";

export function PanicModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-panic', handleOpen);
    return () => window.removeEventListener('open-panic', handleOpen);
  }, []);

  const helplines = [
    { 
      name: "iCall", 
      number: "9152987821", 
      hours: "Mon–Sat, 8 AM – 10 PM · Free",
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      name: "Vandrevala Foundation", 
      number: "1860-2662-345", 
      hours: "24/7 · Free · Confidential",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      name: "NIMHANS Helpline", 
      number: "080-46110007", 
      hours: "National Mental Health Helpline",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end sm:p-6 p-4">
          {/* Backdrop with blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <motion.div 
            layoutId="panic-trigger"
            initial={{ 
              opacity: 0, 
              scale: 0.2, 
              x: 100, 
              y: 100,
              filter: "blur(10px)"
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0, 
              y: 0,
              filter: "blur(0px)"
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              x: 40, 
              y: 40,
              filter: "blur(10px)",
              transition: { duration: 0.2 }
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="relative w-full max-w-[380px] glass-sanctuary shadow-2xl rounded-[2rem] overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]" />

            <div className="relative z-10 p-6 pt-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger border border-danger/20">
                  <Icon icon="tabler:alert-triangle" className="h-6 w-6" />
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5 text-text-dim transition-colors"
                >
                  <Icon icon="tabler:x" className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-6">
                <Text as="h2" variant="h3" weight="bold" className="mb-1 text-white text-xl">
                  You are not alone
                </Text>
                <Text color="secondary" className="text-base leading-relaxed">
                  Trusted support is available right now.
                </Text>
              </div>

              <div className="space-y-2 mb-6">
                {helplines.map((h, i) => (
                  <button 
                    key={i} 
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all text-left group"
                    onClick={() => window.open(`tel:${h.number.replace(/-/g, '')}`)}
                  >
                    <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors", h.bg, h.color)}>
                      <Icon icon="tabler:phone" className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5">{h.name}</div>
                      <div className="text-lg font-bold text-white tracking-tight leading-none">{h.number}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon icon="tabler:arrow-up-right" className="h-4 w-4 text-white/40" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white/[0.03] border border-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                  onClick={() => { setIsOpen(false); router.push('/student/chat'); }}
                >
                  <Icon icon="tabler:robot" className="h-4 w-4 text-primary" />
                  MindBot
                </button>
                <button 
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-black text-sm font-black shadow-lg shadow-primary/10 active:scale-95 transition-all"
                  onClick={() => { setIsOpen(false); router.push('/student/appointments'); }}
                >
                  <Icon icon="tabler:calendar-heart" className="h-4 w-4" />
                  Book help
                </button>
              </div>

              <button 
                className="w-full py-2 text-[10px] font-bold text-text-dim hover:text-white transition-colors uppercase tracking-[0.2em]" 
                onClick={() => setIsOpen(false)}
              >
                I am safe right now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}