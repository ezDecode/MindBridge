"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/Toast";

import { Button, Card, Text, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export default function JournalPage() {
  const { showToast } = useToast();
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [showAiInsight, setShowAiInsight] = useState(false);
  const streak = 8;

  const prompts = [
    'What is one thing you are grateful for today, even if small?',
    'Describe how you are feeling right now in 5 words',
    'What challenge did you face this week and how did you handle it?',
    'What would you tell your past self from one year ago?',
    'What does your ideal day look like?',
    'Who made you feel supported recently?'
  ];
  const [promptIdx, setPromptIdx] = useState(0);

  const getNewPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % prompts.length);
  };

  const saveJournal = () => {
    if (!journalContent.trim()) {
      showToast("Please write something first", "info");
      return;
    }
    showToast("Journal saved & analyzed!", "success");
    setShowAiInsight(true);
  };

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
              <Button onClick={saveJournal} size="md" className="gap-2">
                Save & Analyze
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

                  <Text className="text-white typo-subtitle leading-relaxed mb-8 max-w-[65ch]">
                    It sounds like you&apos;re carrying a lot right now with exams approaching. It&apos;s completely okay to feel the pressure — it shows how much you care. Try taking one small step today instead of looking at everything at once. You&apos;ve got this.
                  </Text>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="badge badge-outline border-white/10">Anxiety</span>
                    <span className="badge badge-outline border-white/10">Academic Stress</span>
                    <span className="badge badge-outline border-white/10 text-primary border-primary/20">Pressure</span>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                    <Text variant="small" weight="medium" className="text-text-dim ">Sentiment:</Text>
                    <span className="badge badge-primary bg-warning/10 text-warning border-warning/20">Neutral leaning negative</span>
                  </div>
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
                <Text weight="semibold" className="text-white typo-subtitle">Keep it up!</Text>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3 mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-primary" 
                  />
                </div>
                <Text variant="small" className="text-text-dim typo-base font-medium ">2 days to next badge</Text>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-surface border-border">
            <div className="flex items-center justify-between mb-8 px-1">
              <Text as="h3" variant="small" weight="medium" className="text-text-dim ">Past Entries</Text>
              <span className="badge badge-outline">April</span>
            </div>

            <div className="space-y-4">
              {[
                { title: "Feeling overwhelmed", sentiment: "Negative", color: "text-danger", bg: "bg-danger", date: "Apr 20", words: 142 },
                { title: "Good day today", sentiment: "Positive", color: "text-success", bg: "bg-success", date: "Apr 18", words: 89 },
                { title: "Hostel life thoughts", sentiment: "Neutral", color: "text-muted", bg: "bg-white/20", date: "Apr 17", words: 67 },
              ].map((entry, i) => (
                <div key={i} className="group p-4 rounded-md border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Text weight="semibold" className="typo-base text-white group-hover:text-primary transition-colors line-clamp-1">{entry.title}</Text>
                    <div className={cn("shrink-0 size-1.5 rounded-full mt-1.5", entry.bg)} />
                  </div>
                  <Text variant="small" className="text-text-dim typo-base font-medium ">{entry.date} · {entry.words} words</Text>
                </div>
              ))}
            </div>

            <Link href="/student/mood-history" className="flex items-center justify-center gap-2 w-full mt-6 py-2 typo-base font-medium text-text-muted hover:text-white transition-colors border-t border-white/5 pt-6 text-center">
              View full history
              <Icon icon="tabler:arrow-right" className="text-lg" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
