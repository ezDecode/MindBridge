"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getClient } from "@/lib/supabase/client";

import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/Toast";

import { Button, Card, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useCallback } from "react";

export default function MoodTrackerPage() {
  const { showToast } = useToast();
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Exams"]);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<{ score: number, logged_at: string, created_at: string, note: string }[]>([]);
  const [streak, setStreak] = useState(12);

  const moodItems = [
    { val: 1, label: 'Low', icon: 'tabler:mood-sad', color: 'text-rose-500' },
    { val: 2, label: 'Down', icon: 'tabler:mood-neutral', color: 'text-orange-400' },
    { val: 3, label: 'Okay', icon: 'tabler:mood-smile', color: 'text-amber-400' },
    { val: 4, label: 'Good', icon: 'tabler:mood-happy', color: 'text-emerald-400' },
    { val: 5, label: 'Great', icon: 'tabler:mood-star', color: 'text-primary' }
  ];

  const tags = [
    "Exams", "Hostel Life", "Family", "Placement", 
    "Sleep", "Relationships", "Financial", "General"
  ];

  const fetchMoodHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/mood?days=30');
      if (res.ok) {
        const data = await res.json();
        setMoodHistory(Array.isArray(data.moods) ? data.moods : []);
        setStreak(data.streak || 0);
      }
    } catch (err) {
      console.error("Failed to fetch mood history", err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchMoodHistory()
    }
    init()
  }, [fetchMoodHistory]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const saveMood = async () => {
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          score: selectedMood, 
          note: note + (selectedTags.length > 0 ? ` [Tags: ${selectedTags.join(", ")}]` : "")
        })
      });
      if (res.ok) {
        showToast("Mood logged! +10 XP", "success");
        fetchMoodHistory();
      }
    } catch (err) {
      console.error("Failed to save mood", err);
    }
  };

  const monthlyAvg = (moodHistory.reduce((acc, curr) => acc + curr.score, 0) / (moodHistory.length || 1)).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Logger Area */}
        <div className="lg:col-span-7 space-y-6">
          <Card padding="lg" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Text as="h3" variant="h4" weight="semibold">Daily Check-in</Text>
                <p className="text-text-dim text-base font-medium mt-1">Consistency build clarity</p>
              </div>
              <div className="badge badge-primary bg-primary/10 text-primary border-primary/20 flex items-center gap-2 px-3">
                <Icon icon="tabler:flame" className="animate-pulse" />
                <span className="tabular-nums">{streak} Day Streak</span>
              </div>
            </div>

            <Text weight="semibold" className="text-white text-[1.0625rem] mb-6 block">How are you feeling right now?</Text>
            
            <div className="grid grid-cols-5 gap-3 mb-10">
              {moodItems.map(m => (
                <button 
                  key={m.val}
                  onClick={() => setSelectedMood(m.val)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-lg border transition-all duration-150 group",
                    selectedMood === m.val 
                      ? "bg-white/5 border-white/20 shadow-md ring-1 ring-white/10" 
                      : "bg-background border-border hover:border-white/10 hover:bg-white/[0.02]"
                  )}
                >
                  <Icon icon={m.icon} className={cn("text-2xl transition-transform", selectedMood === m.val ? cn("scale-110", m.color) : "text-text-dim group-hover:text-text-muted")} />
                  <span className={cn(
                    "text-base font-medium ",
                    selectedMood === m.val ? "text-white" : "text-text-dim group-hover:text-text-muted"
                  )}>{m.label}</span>
                </button>
              ))}
            </div>

            <Text weight="semibold" className="text-white text-[1.0625rem] mb-4 block">What&apos;s on your mind?</Text>
            <div className="flex flex-wrap gap-2 mb-10">
              {tags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-base font-medium border transition-all",
                    selectedTags.includes(tag)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-text-muted hover:border-white/20 hover:text-white"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-10">
              <Text weight="semibold" className="text-white text-[1.0625rem] block">Add a note (optional)</Text>
              <textarea 
                className="w-full min-h-[120px] bg-background border border-border rounded-md px-4 py-3 text-[1.0625rem] text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none resize-none leading-relaxed" 
                placeholder="What's causing these feelings..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button onClick={saveMood} size="lg" className="w-full">
              Log Entry <span className="text-base font-medium opacity-60 ml-2 ">+10 XP</span>
            </Button>
          </Card>
        </div>

        {/* Stats Area */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="md" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-8 px-1">
              <Text as="h3" variant="small" weight="medium" className="text-text-dim ">Monthly Overview</Text>
              <span className="badge badge-outline">April</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg text-center">
                <Text weight="bold" className="text-2xl text-white tabular-nums leading-none mb-1">{monthlyAvg}</Text>
                <Text variant="small" className="text-base font-medium text-text-dim ">Average</Text>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg text-center">
                <Text weight="bold" className="text-2xl text-white tabular-nums leading-none mb-1">{moodHistory.length}</Text>
                <Text variant="small" className="text-base font-medium text-text-dim ">Logged</Text>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg text-center">
                <Text weight="bold" className="text-2xl text-white tabular-nums leading-none mb-1">{streak}</Text>
                <Text variant="small" className="text-base font-medium text-text-dim ">Streak</Text>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-10 px-1">
              <Text as="h3" variant="small" weight="medium" className="text-text-dim ">30-Day Trend</Text>
              <p className="text-base font-medium text-success flex items-center gap-1">
                <Icon icon="tabler:trending-up" /> Improved
              </p>
            </div>

            <div className="h-40 flex items-end gap-1.5 px-2">
              {moodHistory.slice(-20).map((entry, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end group cursor-help">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(entry.score / 5) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.02 }}
                    className={cn(
                      "w-full rounded-t-sm transition-all group-hover:opacity-100",
                      entry.score > 3 ? "bg-primary opacity-60" : entry.score < 3 ? "bg-rose-500 opacity-40" : "bg-white/20 opacity-40"
                    )}
                    title={`Score: ${entry.score}`}
                  />
                </div>
              ))}
              {moodHistory.length === 0 && (
                <div className="w-full h-full flex items-center justify-center italic text-text-dim text-base">No data available</div>
              )}
            </div>
            
            <div className="flex gap-2 mt-8 flex-wrap">
              <span className="badge badge-outline border-white/5 bg-white/5 text-base font-medium ">Best day: Thursday</span>
              <span className="badge badge-outline border-white/5 bg-white/5 text-base font-medium ">Most common: Neutral</span>
            </div>
          </Card>
        </div>
      </div>

      {/* History List */}
      <Card padding="lg" className="bg-surface border-border">
        <div className="flex items-center justify-between mb-10 px-1">
          <Text as="h3" variant="body" weight="semibold" className="text-white">Mood History</Text>
          <Link href="/student/mood-history" className="flex items-center justify-center gap-2 text-base font-medium text-text-dim hover:text-white transition-colors ">
            Export intelligence
            <Icon icon="tabler:arrow-right" className="text-lg" />
          </Link>
        </div>

        <div className="space-y-3">
          {moodHistory.slice(0, 8).map((entry, i) => {
            const mood = moodItems.find(mi => mi.val === entry.score);
            return (
              <div key={i} className="flex items-center gap-6 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                <div className={cn("size-10 rounded-md bg-white/5 flex items-center justify-center shrink-0 transition-colors", mood?.color)}>
                  <Icon icon={mood?.icon || 'tabler:mood-neutral'} className="text-2xl" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Text weight="semibold" className="text-white text-[1.0625rem]">{new Date(entry.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    <span className={cn("text-base font-medium ", mood?.color)}>{mood?.label}</span>
                  </div>
                  <Text color="secondary" className="text-base line-clamp-1">{entry.note || "No additional notes"}</Text>
                </div>

                <div className="hidden md:flex items-center gap-4 shrink-0">
                  <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all", mood?.color.replace('text', 'bg'))} style={{ width: `${(entry.score / 5) * 100}%` }} />
                  </div>
                  <Text weight="bold" className="text-base tabular-nums text-white w-6">{entry.score}<span className="text-text-dim">/5</span></Text>
                </div>
              </div>
            );
          })}
          {moodHistory.length === 0 && (
            <div className="p-20 text-center text-text-dim border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
              <Icon icon="tabler:history-off" className="text-2xl mx-auto mb-4 opacity-10" />
              <p className="text-[1.0625rem] font-medium italic opacity-60">Your journey hasn&apos;t started yet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
