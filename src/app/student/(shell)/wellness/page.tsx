"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/Toast";
import { Button, Card, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface WellnessProgress {
  xp: number;
  level: number;
  streak: number;
  last_activity: string | null;
}

export default function WellnessPage() {
  const { showToast } = useToast();
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSeconds, setPomSeconds] = useState(1500);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [progress, setProgress] = useState<WellnessProgress>({ xp: 0, level: 1, streak: 0, last_activity: null });
  const [awarding, setAwarding] = useState(false);

  const phases = useMemo(() => [
    { label: 'Inhale...', duration: 4000 },
    { label: 'Hold...', duration: 7000 },
    { label: 'Exhale...', duration: 8000 }
  ], []);

  // Fetch wellness progress on mount
  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/student/wellness');
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
      }
    } catch {
      console.error('Failed to fetch wellness progress');
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Award XP helper
  const awardXP = async (activity: string, xpAmount: number) => {
    if (awarding) return;
    setAwarding(true);
    try {
      const res = await fetch('/api/student/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, xpAmount }),
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        if (data.leveledUp) {
          showToast(`🎉 Level Up! You reached Level ${data.progress.level}!`, "success");
        } else {
          showToast(`+${xpAmount} XP earned! (${activity})`, "success");
        }
      }
    } catch {
      showToast("Failed to award XP", "error");
    } finally {
      setAwarding(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathRunning) {
      interval = setTimeout(() => {
        const nextPhase = (breathPhase + 1) % 3;
        setBreathPhase(nextPhase);
        // After completing a full cycle (back to phase 0), award XP
        if (nextPhase === 0) {
          awardXP('breathing', 10);
        }
      }, phases[breathPhase].duration);
    }
    return () => clearTimeout(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const timer = setTimeout(() => {
        setPomRunning(false);
        awardXP('pomodoro', 5);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomSeconds, pomRunning]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const xpForNextLevel = progress.level * 100;
  const xpPercent = Math.min((progress.xp / xpForNextLevel) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <Card padding="lg" className="bg-surface border-border">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary">
            <span className="typo-base font-medium ">Level</span>
            <span className="typo-metric font-bold leading-none tabular-nums">{progress.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-4">
              <div>
                <Text weight="semibold" className="text-white typo-base">Wellness Warrior</Text>
                <Text variant="small" className="text-text-dim typo-base font-medium mt-1">
                  {progress.streak > 0 ? `${progress.streak}-day streak 🔥` : 'Start your streak!'}
                </Text>
              </div>
              <Text weight="bold" className="typo-subtitle tabular-nums text-white">
                {progress.xp} <span className="text-text-dim">/ {xpForNextLevel} XP</span>
              </Text>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.5 }}
                className="h-full bg-primary" 
              />
            </div>
            <p className="typo-base font-medium text-text-dim mt-3">
              {xpForNextLevel - progress.xp} XP more to level up · Keep going!
            </p>
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
                : "bg-surface border-border hover:border-white/10 hover:bg-white/2"
            )}
          >
            <div className={cn("size-10 rounded-md bg-white/5 flex items-center justify-center mb-6 transition-colors", act.color)}>
              <Icon icon={act.icon} className="typo-metric" />
            </div>
            <Text weight="semibold" className="text-white typo-subtitle mb-1">{act.label}</Text>
            <Text variant="small" className="text-text-dim typo-base font-medium ">{act.sub}</Text>
            <div className="absolute top-4 right-4 badge badge-primary bg-primary/10 text-primary border-primary/20 typo-base">
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
                  <Text weight="bold" className="text-white typo-heading">
                    {breathRunning ? phases[breathPhase].label : "Ready?"}
                  </Text>
                  {!breathRunning && <Text variant="small" className="text-text-dim mt-2">Press Start</Text>}
                </div>
              </div>

              <Text variant="small" className="text-text-dim typo-base font-medium mt-12 mb-10">
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

      {activeSection === 'meditation' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="bg-surface border-border max-w-2xl mx-auto text-center py-16">
            <div className="flex flex-col items-center">
              <div className="badge badge-outline gap-2 px-4 mb-8">
                <Icon icon="tabler:yoga" className="text-secondary" />
                <span>Guided Mindfulness</span>
              </div>
              <Text className="text-text-muted typo-subtitle leading-relaxed mb-8 max-w-[45ch]">
                Close your eyes. Focus on your breath. Let thoughts pass like clouds. Stay for 5 minutes.
              </Text>
              <div className="flex gap-3">
                <Button size="lg" onClick={() => awardXP('meditation', 25)} disabled={awarding}>
                  <Icon icon="tabler:check" /> Complete Session (+25 XP)
                </Button>
                <Button variant="warm" size="lg" onClick={() => setActiveSection(null)}>Close</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {activeSection === 'gratitude' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="bg-surface border-border max-w-2xl mx-auto text-center py-16">
            <div className="flex flex-col items-center">
              <div className="badge badge-outline gap-2 px-4 mb-8">
                <Icon icon="tabler:hands-pray" className="text-warning" />
                <span>Gratitude Log</span>
              </div>
              <Text className="text-text-muted typo-subtitle leading-relaxed mb-8 max-w-[45ch]">
                Write down 3 things you&apos;re grateful for today, even small ones. Then mark as done.
              </Text>
              <div className="flex gap-3">
                <Button size="lg" onClick={() => awardXP('gratitude', 10)} disabled={awarding}>
                  <Icon icon="tabler:check" /> Log Gratitude (+10 XP)
                </Button>
                <Button variant="warm" size="lg" onClick={() => setActiveSection(null)}>Close</Button>
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
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
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
                  <span className="typo-metric font-bold tabular-nums text-white">{formatTime(pomSeconds)}</span>
                  <span className="typo-base font-medium text-text-dim mt-1">Focus Time</span>
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
              <Icon icon="tabler:target" className="typo-heading" />
            </div>
            <Text as="h3" variant="body" weight="semibold" className="text-white">Mindfulness Challenge</Text>
          </div>
          <span className="badge badge-primary bg-primary/10 text-primary border-primary/20 typo-base">
            Day {Math.min(progress.streak, 7)} of 7
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-10">
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <div 
              key={d} 
              className={cn(
                "p-3 rounded border text-center transition-all",
                d < Math.min(progress.streak, 7) + 1 ? "bg-success/5 border-success/20 text-success" :
                d === Math.min(progress.streak, 7) + 1 ? "bg-primary/5 border-primary/40 text-primary ring-2 ring-primary/10" :
                "bg-white/2 border-white/5 text-text-dim"
              )}
            >
              <div className="flex justify-center mb-1">
                <Icon icon={d < Math.min(progress.streak, 7) + 1 ? "tabler:check" : d === Math.min(progress.streak, 7) + 1 ? "tabler:target" : "tabler:circle"} className="typo-subtitle" />
              </div>
              <div className="typo-base font-medium ">Day {d}</div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-md bg-white/2 border border-white/5 relative group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform">
            <Icon icon="tabler:pin" className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <Text variant="small" weight="medium" className="text-primary mb-2 flex items-center gap-2">
              <Icon icon="tabler:pin" />
              Today&apos;s Task
            </Text>
            <Text color="secondary" className="typo-subtitle leading-relaxed mb-6 max-w-[60ch]">
              Spend 5 minutes in silent observation. Sit comfortably, close your eyes, and simply notice your thoughts without judging them.
            </Text>
            <Button size="md" onClick={() => awardXP('mindfulness_challenge', 20)} disabled={awarding}>
              <Icon icon="tabler:check" />
              Mark as complete (+20 XP)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
