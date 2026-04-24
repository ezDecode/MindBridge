"use client";

import { motion } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Card, Text } from "@/components/ui";
import staticResources from "@/content/static-resources.json";
import Link from "next/link";
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

export function BridgeTab() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={container}
      className="space-y-10"
    >
      {/* Search Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="tracking-tight text-white">Resource Center</Text>
          <p className="text-text-dim text-[10px] font-bold uppercase tracking-[0.15em] mt-1">Tools for your wellness journey</p>
        </div>
        <div className="relative w-full md:w-[320px]">
          <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input 
            className="w-full h-10 bg-surface border border-border rounded-md pl-10 pr-4 text-sm text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none" 
            placeholder="Search resources, topics..." 
          />
        </div>
      </motion.div>

      {/* Featured Elevation */}
      <motion.div variants={item}>
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-8 sm:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform rotate-12">
            <Icon icon="tabler:ripple" className="h-48 w-48 text-primary" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Featured Meditation</div>
            <Text as="h3" variant="h2" weight="semibold" className="text-white mb-4 leading-tight tracking-tight">Mindful Study Breaks: A Guide to Focused Learning</Text>
            <Text color="secondary" className="text-base leading-relaxed mb-10 max-w-[50ch]">
              Learn how to integrate 5-minute micro-meditations into your study sessions to reduce burnout and maintain cognitive focus.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2">
                <Icon icon="tabler:headphones" className="text-lg" />
                Listen Now
              </Button>
              <Button variant="warm" size="lg" className="gap-2">
                <Icon icon="tabler:book" className="text-lg" />
                Read Guide
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Book a Session", desc: "1-on-1 support with campus counselors", action: "Schedule", icon: "tabler:calendar-plus", color: "text-primary", href: "/student/book" },
          { title: "Mood Analytics", desc: "View detailed trends and stability logs", action: "Analyze", icon: "tabler:chart-line", color: "text-secondary", href: "/student/check-in" },
          { title: "Screening Tools", desc: "Professional PHQ-9 & GAD-7 assessments", action: "Start", icon: "tabler:clipboard-check", color: "text-warning", href: "/student/screening" }
        ].map((act, i) => (
          <Link key={i} href={act.href}>
            <motion.div variants={item} className="h-full group">
              <Card padding="lg" className="h-full bg-surface border-border hover:border-white/20 hover:bg-white/[0.02] transition-all flex flex-col">
                <div className={cn("size-10 rounded bg-white/5 flex items-center justify-center mb-8 transition-colors", act.color)}>
                  <Icon icon={act.icon} className="text-2xl" />
                </div>
                <div className="flex-1 mb-8">
                  <Text weight="semibold" className="text-white text-base mb-2 group-hover:text-primary transition-colors">{act.title}</Text>
                  <Text color="secondary" className="text-sm leading-relaxed">{act.desc}</Text>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest group-hover:text-white transition-colors">
                  {act.action} <Icon icon="tabler:arrow-right" />
                </div>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Library Snapshot */}
      <motion.div variants={item} className="space-y-6 pt-10 border-t border-white/5">
        <div className="flex items-center justify-between px-1">
          <Text weight="semibold" className="text-white text-sm uppercase tracking-widest">Wellness Library</Text>
          <Link href="/student/resources" className="text-[10px] font-bold text-text-dim hover:text-white transition-colors uppercase tracking-widest">
            View All Resources →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {staticResources.slice(0, 4).map((res, i) => (
            <div key={i} className="group p-4 rounded-md border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center gap-5">
              <div className="size-12 rounded bg-white/5 flex items-center justify-center shrink-0">
                <Icon 
                  icon={res.type === "YouTube" ? "tabler:video" : res.type === "Audio" ? "tabler:headphones" : "tabler:book"} 
                  className="text-primary text-2xl opacity-40 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Text weight="semibold" className="text-sm text-white truncate group-hover:text-primary transition-colors">{res.title}</Text>
                <Text variant="small" className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-1 tabular-nums">{res.type} · {res.duration || '5 mins'}</Text>
              </div>
              <Icon icon="tabler:chevron-right" className="text-text-dim opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
