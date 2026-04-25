"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/Toast";
import { Button, Card, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function WellnessPage() {
  const { showToast } = useToast();
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSeconds, setPomSeconds] = useState(1500);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const phases = useMemo(() => [
    { label: 'Inhale...', duration: 4000 },
    { label: 'Hold...', duration: 7000 },
    { label: 'Exhale...', duration: 8000 }
  ], []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathRunning) {
      interval = setTimeout(() => {
        setBreathPhase((prev) => (prev + 1) % 3);
      }, phases[breathPhase].duration);
    }
    return () => clearTimeout(interval);
  }, [breathRunning, breathPhase, phases]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomRunning && pomSeconds > 0) {
      interval = setInterval(() => {
        setPomSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomRunning, pomSeconds]);

  useEffect(() => {
    if (pomSeconds === 0 && pomRunning) {
      // Use a small timeout to avoid cascading render warning in some environments
      const timer = setTimeout(() => {
        setPomRunning(false);
        showToast("Pomodoro complete! Take a break", "success");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pomSeconds, pomRunning, showToast]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div>
        <Text as="h2" variant="h3" weight="semibold" className="tracking-tight">Wellness Center</Text>
        <p className="text-text-dim text-xs font-medium tracking-[0.15em] mt-1">Interactive activities & tools</p>
      </div>

      <Card padding="lg" className="bg-surface border-border">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary">
            <span className="text-xs font-medium ">Level</span>
            <span className="text-2xl font-bold leading-none tabular-nums">3</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-4">
              <div>
                <Text weight="semibold" className="text-white text-base">Wellness Warrior</Text>
                <Text variant="small" className="text-text-dim text-[10px] font-medium mt-1">Journey to level 4</Text>
              </div>
              <Text weight="bold" className="text-sm tabular-nums text-white">240 <span className="text-text-dim">/ 300 XP</span></Text>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 1.5 }}
                className="h-full bg-primary" 
              />
            </div>
            <p className="text-[10px] font-medium text-text-dim mt-3">60 XP more to level up · Keep going!</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'breathing', label: 'Breathing', sub: '4-7-8 · Box', icon: 'tabler:ripple', color: 'text-primary', xp: '+10' },
          { id: 'meditation', label: 'Guided', sub: 'Mindfulness', icon: 'tabler:yoga', color: 'text-secondary', xp: '+25' },
          { id: 'gratitude', label: 'Gratitude', sub: 'Daily logs', icon: 'tabler:hands-pray', color: 'text-warning', xp: '+10' },
          { id: 'pomodoro', label: 'Study Timer', sub: 'Pomodoro', icon: 'tabler:clock', color: 'text-primary', xp: '+5' }
        ].map((act) => (
          <button 
            key={act.id}
            onClick={() => setActiveSection(activeSection === act.id ? null : act.id)}
            className={cn(
              "group p-6 rounded-lg border transition-all text-left relative overflow-hidden",
              activeSection === act.id 
                ? "bg-white/5 border-white/20 shadow-xl" 
                : "bg-surface border-border hover:border-white/10 hover:bg-white/[0.02]"
            )}
          >
            <div className={cn("size-10 rounded-md bg-white/5 flex items-center justify-center mb-6 transition-colors", act.color)}>
              <Icon icon={act.icon} className="text-2xl" />
            </div>
            <Text weight="semibold" className="text-white text-sm mb-1">{act.label}</Text>
            <Text variant="small" className="text-text-dim text-[10px] font-medium ">{act.sub}</Text>
            <div className="absolute top-4 right-4 badge badge-primary bg-primary/10 text-primary border-primary/20 text-[9px]">
              {act.xp} XP
            </div>
          </button>
        ))}
      </div>

      {activeSection === 'breathing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="bg-surface border-border max-w-2xl mx-auto text-center py-16">
            <div className="flex flex-col items-center">
              <div className="badge badge-outline gap-2 px-4 mb-8">
                <Icon icon="tabler:ripple" className="text-primary" />
                <span>4-7-8 Technique</span>
              </div>
              
              <div className={cn(
                "size-48 rounded-full border-4 flex items-center justify-center transition-all duration-1000",
                breathRunning ? "border-primary scale-110 bg-primary/5" : "border-white/5 scale-100 bg-white/5"
              )}>
                <div className="text-center">
                  <Text weight="bold" className="text-white text-xl">
                    {breathRunning ? phases[breathPhase].label : "Ready?"}
                  </Text>
                  {!breathRunning && <Text variant="small" className="text-text-dim mt-2">Press Start</Text>}
                </div>
              </div>

              <Text variant="small" className="text-text-dim text-[10px] font-medium tracking-[0.2em] mt-12 mb-10">
                Inhale 4s · Hold 7s · Exhale 8s
              </Text>

              <div className="flex gap-3">
                <Button size="lg" onClick={() => setBreathRunning(!breathRunning)} className="min-w-[120px]">
                  {breathRunning ? <><Icon icon="tabler:pause" /> Pause</> : <><Icon icon="tabler:play" /> Start</>}
                </Button>
                <Button variant="warm" size="lg" onClick={() => { setBreathRunning(false); setActiveSection(null); }}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {activeSection === 'pomodoro' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="bg-surface border-border max-w-md mx-auto text-center py-16">
            <div className="flex flex-col items-center">
              <div className="badge badge-outline gap-2 px-4 mb-12">
                <Icon icon="tabler:clock" className="text-primary" />
                <span>Focus Session</span>
              </div>

              <div className="relative size-48 mb-12">
                <svg className="size-full rotate-[-90deg]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="transparent" 
                    stroke="var(--primary)" strokeWidth="4" 
                    strokeDasharray="282.6" 
                    animate={{ strokeDashoffset: 282.6 * (1 - pomSeconds / 1500) }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tabular-nums text-white">{formatTime(pomSeconds)}</span>
                  <span className="text-[9px] font-medium text-text-dim mt-1">Focus Time</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="md" onClick={() => setPomRunning(!pomRunning)} className="min-w-[100px]">
                  {pomRunning ? "Pause" : "Start"}
                </Button>
                <Button variant="ghost" size="md" onClick={() => { setPomRunning(false); setPomSeconds(1500); }} className="border border-white/5">
                  Reset
                </Button>
                <Button variant="warm" size="md" onClick={() => { setPomRunning(false); setActiveSection(null); }}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Card padding="lg" className="bg-surface border-border overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Icon icon="tabler:target" className="text-xl" />
            </div>
            <Text as="h3" variant="body" weight="semibold" className="text-white">Mindfulness Challenge</Text>
          </div>
          <span className="badge badge-primary bg-primary/10 text-primary border-primary/20 tracking-[0.2em] text-[9px]">Day 4 of 7</span>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-10">
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <div 
              key={d} 
              className={cn(
                "p-3 rounded border text-center transition-all",
                d < 4 ? "bg-success/5 border-success/20 text-success" :
                d === 4 ? "bg-primary/5 border-primary/40 text-primary ring-2 ring-primary/10" :
                "bg-white/[0.02] border-white/5 text-text-dim"
              )}
            >
              <div className="flex justify-center mb-1">
                <Icon icon={d < 4 ? "tabler:check" : d === 4 ? "tabler:target" : "tabler:circle"} className="text-sm" />
              </div>
              <div className="text-[9px] font-medium ">Day {d}</div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-md bg-white/[0.02] border border-white/5 relative group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform">
            <Icon icon="tabler:pin" className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <Text variant="small" weight="medium" className="text-primary mb-2 flex items-center gap-2">
              <Icon icon="tabler:pin" />
              Today&apos;s Task
            </Text>
            <Text color="secondary" className="text-sm leading-relaxed mb-6 max-w-[60ch]">
              Spend 5 minutes in silent observation. Sit comfortably, close your eyes, and simply notice your thoughts without judging them.
            </Text>
            <Button size="md" onClick={() => showToast("Day 4 completed! +20 XP", "success")}>
              <Icon icon="tabler:check" />
              Mark as complete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
