"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/Toast";
import { Button, Card, Text, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  ai_insight: string | null;
  created_at: string;
}

export default function JournalPage() {
  const { showToast } = useToast();
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pollingInsight, setPollingInsight] = useState(false);

  const prompts = [
    'What is one thing you are grateful for today, even if small?',
    'Describe how you are feeling right now in 5 words',
    'What challenge did you face this week and how did you handle it?',
    'What would you tell your past self from one year ago?',
    'What does your ideal day look like?',
    'Who made you feel supported recently?'
  ];
  const [promptIdx, setPromptIdx] = useState(0);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/student/journals');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.journals ?? []);
      }
    } catch {
      console.error('Failed to fetch journals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const getNewPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % prompts.length);
  };

  const saveJournal = async () => {
    if (!journalContent.trim()) {
      showToast("Please write something first", "info");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/student/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: journalTitle.trim(),
          content: journalContent.trim(),
        }),
      });

      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      showToast("Journal saved! AI is analyzing...", "success");

      // Add to entries list
      setEntries(prev => [data.journal, ...prev]);
      setJournalTitle("");
      setJournalContent("");
      setShowAiInsight(true);
      setPollingInsight(true);

      // Poll for AI insight (generated in background)
      const journalId = data.journal.id;
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch('/api/student/journals');
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            const updated = pollData.journals?.find((j: JournalEntry) => j.id === journalId);
            if (updated?.ai_insight) {
              setAiInsight(updated.ai_insight);
              setPollingInsight(false);
              setEntries(pollData.journals);
              clearInterval(poll);
            }
          }
        } catch { /* retry */ }
        if (attempts >= 15) {
          setPollingInsight(false);
          setAiInsight("Your thoughts have been safely recorded.");
          clearInterval(poll);
        }
      }, 2000);
    } catch {
      showToast("Failed to save journal", "error");
    } finally {
      setSaving(false);
    }
  };

  const streak = entries.length > 0
    ? Math.min(entries.length, 30) // Simple streak approximation
    : 0;

  // Derive sentiment from ai_insight
  function getSentiment(insight: string | null): { label: string; color: string; bg: string } {
    if (!insight) return { label: "Neutral", color: "text-muted", bg: "bg-white/20" };
    const lower = insight.toLowerCase();
    if (/grateful|happy|positive|good|hopeful|victory/.test(lower)) return { label: "Positive", color: "text-success", bg: "bg-success" };
    if (/struggle|stress|anxiety|burnout|lonely|low|severe|hopeless/.test(lower)) return { label: "Negative", color: "text-danger", bg: "bg-danger" };
    return { label: "Neutral", color: "text-muted", bg: "bg-white/20" };
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Journaling Area */}
        <div className="lg:col-span-8 space-y-6">
          <Card padding="lg" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-8">
              <Text as="h3" variant="h4" weight="semibold">Write Today&apos;s Entry</Text>
              <div className="badge badge-outline gap-1.5 px-3">
                <Icon icon="tabler:lock" className="h-3 w-3" />
                <span>Private</span>
              </div>
            </div>

            <div className="space-y-4">
              <Input 
                placeholder="Title (optional)..." 
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                className="bg-background/50 border-white/5 focus:border-white/10"
              />

              <button 
                onClick={getNewPrompt}
                className="w-full flex items-start gap-3 p-4 rounded-md bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all text-left group"
              >
                <Icon icon="tabler:bulb" className="mt-0.5 shrink-0 text-primary" />
                <div className="flex-1">
                  <Text as="span" variant="small" weight="medium" className="text-primary block mb-1">Today&apos;s Prompt</Text>
                  <Text as="p" className="typo-subtitle text-text-muted leading-relaxed italic group-hover:text-white transition-colors">
                    &ldquo;{prompts[promptIdx]}&rdquo;
                  </Text>
                  <span className="flex items-center gap-1.5 typo-base font-medium text-text-dim mt-3 group-hover:text-primary transition-colors">
                    Click for new prompt 
                    <Icon icon="tabler:arrow-right" className="text-lg" />
                  </span>
                </div>
              </button>

              <textarea 
                className="w-full min-h-[300px] bg-background border border-border rounded-md px-4 py-3 typo-subtitle text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none resize-none leading-relaxed" 
                placeholder="Write your thoughts here... This is your safe space. Only you can read this." 
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
              <Text variant="small" weight="medium" className="text-text-dim ">
                {journalContent.split(/\s+/).filter(Boolean).length} words
              </Text>
              <Button onClick={saveJournal} size="md" className="gap-2" disabled={saving}>
                {saving ? "Saving..." : "Save & Analyze"}
                <Icon icon="tabler:sparkles" className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {showAiInsight && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="lg" className="bg-primary/5 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform rotate-12">
                  <Icon icon="tabler:sparkles" className="h-32 w-32 text-primary" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Icon icon="tabler:sparkles" className="text-primary typo-heading" />
                    <Text variant="small" weight="medium" className="text-primary ">MindBot Reflection</Text>
                  </div>

                  {pollingInsight ? (
                    <div className="flex items-center gap-3">
                      <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <Text className="text-text-muted typo-subtitle">Analyzing your entry...</Text>
                    </div>
                  ) : (
                    <>
                      <Text className="text-white typo-subtitle leading-relaxed mb-8 max-w-[65ch]">
                        {aiInsight ?? "Your thoughts have been safely recorded."}
                      </Text>

                      {aiInsight && (
                        <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                          <Text variant="small" weight="medium" className="text-text-dim ">Theme:</Text>
                          <span className={cn(
                            "badge badge-primary bg-opacity-10 border-opacity-20",
                            getSentiment(aiInsight).color === "text-danger" && "bg-danger/10 text-danger border-danger/20",
                            getSentiment(aiInsight).color === "text-success" && "bg-success/10 text-success border-success/20",
                            getSentiment(aiInsight).color === "text-muted" && "bg-warning/10 text-warning border-warning/20",
                          )}>
                            {getSentiment(aiInsight).label}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="md" className="bg-surface border-border">
            <Text as="h3" variant="small" weight="medium" className="text-text-dim mb-6 px-1">Journal Streak</Text>
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary">
                <Icon icon="tabler:flame" className="text-xl mb-0.5" />
                <span className="typo-base font-bold tabular-nums">{streak}</span>
              </div>
              <div className="flex-1">
                <Text weight="semibold" className="text-white typo-subtitle">
                  {streak > 0 ? "Keep it up!" : "Start your streak!"}
                </Text>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3 mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((streak / 10) * 100, 100)}%` }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-primary" 
                  />
                </div>
                <Text variant="small" className="text-text-dim typo-base font-medium ">
                  {streak > 0 ? `${10 - (streak % 10)} entries to next badge` : "Write your first entry"}
                </Text>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-8 px-1">
              <Text as="h3" variant="small" weight="medium" className="text-text-dim ">Past Entries</Text>
              <span className="badge badge-outline">
                {new Date().toLocaleString('default', { month: 'long' })}
              </span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                  <Text variant="small" className="text-text-dim">Loading entries...</Text>
                </div>
              ) : entries.length === 0 ? (
                <div className="py-8 text-center">
                  <Icon icon="tabler:notebook" className="text-2xl text-text-dim mx-auto mb-3 opacity-30" />
                  <Text variant="small" className="text-text-dim italic">No journal entries yet</Text>
                </div>
              ) : (
                entries.slice(0, 5).map((entry) => {
                  const sentiment = getSentiment(entry.ai_insight);
                  const wordCount = entry.content.split(/\s+/).filter(Boolean).length;
                  const date = new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <div key={entry.id} className="group p-4 rounded-md border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <Text weight="semibold" className="typo-base text-white group-hover:text-primary transition-colors line-clamp-1">
                          {entry.title || entry.ai_insight || "Untitled entry"}
                        </Text>
                        <div className={cn("shrink-0 size-1.5 rounded-full mt-1.5", sentiment.bg)} />
                      </div>
                      <Text variant="small" className="text-text-dim typo-base font-medium ">{date} · {wordCount} words</Text>
                    </div>
                  );
                })
              )}
            </div>

            {entries.length > 5 && (
              <Link href="/student/mood-history" className="flex items-center justify-center gap-2 w-full mt-6 py-2 typo-base font-medium text-text-muted hover:text-white transition-colors border-t border-white/5 pt-6 text-center">
                View full history
                <Icon icon="tabler:arrow-right" className="text-lg" />
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
