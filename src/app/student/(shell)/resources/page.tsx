"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Text } from "@/components/ui";
import { PageIntro } from "@/components/site";
import { BreathingExercise } from "@/components/animations";
import { ResourceCard, type Resource } from "@/components/resources";
import staticResources from "@/content/static-resources.json";

const videos = staticResources.filter(r => r.type === "YouTube") as Resource[];
const audios = staticResources.filter(r => r.type === "Audio") as Resource[];

const tabs = [
 { id: "breathe", label: "Breathing" },
 { id: "videos", label: "Videos" },
 { id: "audio", label: "Audio" },
] as const;

const CUBIC_BEZIER = [0.16, 1, 0.3, 1] as const; // Matches --ease-out

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const fadeUpReveal = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: CUBIC_BEZIER }
  }
};

const floatIn = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: CUBIC_BEZIER }
  }
};

const shellClass = "relative rounded-3xl bg-[var(--surface-default)] backdrop-blur-sm border border-[var(--border-default)] shadow-lg transition-all duration-300";
const innerClass = "relative p-8 rounded-[calc(1.5rem-0.5rem)] bg-gradient-to-b from-[var(--surface-default)] to-[var(--bg-page)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]";

const techniqueShell = "relative rounded-2xl bg-[var(--surface-default)] backdrop-blur-md border border-[var(--border-default)] shadow-md transition-all duration-300";
const techniqueInner = "relative p-5 rounded-[calc(1rem-0.25rem)] bg-gradient-to-br from-[var(--surface-default)] to-[var(--bg-page)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"breathe" | "videos" | "audio">("breathe");

  const techniques = [
    { title: "Box Breathing", desc: "Focus & clarity", icon: "□", gradient: "from-[var(--action-primary-soft)] to-[var(--surface-default)]" },
    { title: "4-7-8 Technique", desc: "Sleep & calm", icon: "◐", gradient: "from-[var(--action-primary-soft)] to-[var(--surface-default)]" },
    { title: "Physiological Sigh", desc: "Quick relief", icon: "○", gradient: "from-[var(--action-primary-soft)] to-[var(--surface-default)]" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-10 md:gap-16">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: CUBIC_BEZIER }}
      >
        <PageIntro
          title="Wellness Resources"
          description="Curated tools and exercises to support your mental health journey"
        />
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex items-center justify-center"
      >
        <div className="inline-flex items-center p-1 bg-[var(--surface-default)] backdrop-blur-xl rounded-xl border border-[var(--border-default)] shadow-md">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              variants={fadeUpReveal}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.96]"
            >
              <AnimatePresence mode="wait">
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-[var(--action-primary)] to-[var(--action-primary-dark)] rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
              <span className={`relative z-10 transition-colors duration-300 ${activeTab === tab.id ? "text-[var(--text-inverse)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: CUBIC_BEZIER }}
          className="w-full"
        >
          {activeTab === "breathe" && (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-16">
              <motion.div variants={fadeUpReveal} className="max-w-xl mx-auto">
                <div className={shellClass}>
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--action-primary)]/5 via-transparent to-[var(--action-primary)]/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--action-primary)]/5 blur-[80px]" />
                  </div>
                  <div className={innerClass}>
                    <BreathingExercise />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUpReveal} className="pt-4">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--action-primary-soft)] rounded-full border border-[var(--action-primary)]/10 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--action-primary)] animate-pulse" />
                    <Text as="span" variant="small" weight="bold" className="text-[var(--action-primary)] tracking-widest text-[10px] uppercase">
                      Core Techniques
                    </Text>
                  </div>
                  <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)] text-balance">
                    Quick Start Exercises
                  </Text>
                  <Text as="p" variant="body" color="secondary" className="mt-3 max-w-md mx-auto text-pretty">
                    Evidence-based breathing methods for immediate relief and focus
                  </Text>
                </div>

                <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                  {techniques.map((item, index) => (
                    <motion.div
                      key={item.title}
                      variants={fadeUpReveal}
                      custom={index}
                      className="group"
                    >
                      <motion.button
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-6 rounded-2xl bg-gradient-to-br ${item.gradient} border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all duration-300 text-left`}
                      >
                        <div className="flex flex-col gap-5">
                          <div className="w-12 h-12 rounded-xl bg-[var(--surface-default)] shadow-sm flex items-center justify-center text-xl border border-[var(--border-light)] group-hover:border-[var(--action-primary)]/20 transition-colors">
                            {item.icon}
                          </div>
                          <div>
                            <Text as="p" variant="h6" weight="bold" className="text-[var(--text-primary)] group-hover:text-[var(--action-primary)] transition-colors">
                              {item.title}
                            </Text>
                            <Text as="span" variant="small" color="secondary" className="block mt-1">
                              {item.desc}
                            </Text>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
 {activeTab === "videos" && (
 <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-12">
 <motion.div variants={floatIn} className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-2xl bg-[var(--status-error-soft)] text-[var(--status-error)] flex items-center justify-center shadow-sm border border-[var(--status-error)]/10">
 <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8 5v14l11-7z" />
 </svg>
 </div>
 <div>
 <Text as="h2" variant="h3" weight="bold" className="text-[var(--text-primary)] text-balance">
 Guided Videos
 </Text>
 <Text as="p" variant="body" color="secondary" className="text-pretty">
 Meditation and breathing exercises for daily wellness
 </Text>
 </div>
 </motion.div>

 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {videos.map((resource, index) => (
 <ResourceCard 
 key={index}
 resource={resource} 
 />
 ))}
 </div>
 </motion.div>
 )}

 {activeTab === "audio" && (
 <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-12">
 <motion.div variants={floatIn} className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-2xl bg-[var(--action-primary-soft)] text-[var(--action-primary)] flex items-center justify-center shadow-sm border border-[var(--action-primary)]/10">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
 </svg>
 </div>
 <div>
 <Text as="h2" variant="h3" weight="bold" className="text-[var(--text-primary)] text-balance">
 Relaxation Audio
 </Text>
 <Text as="p" variant="body" color="secondary" className="text-pretty">
 Sounds and stories for restful moments
 </Text>
 </div>
 </motion.div>

 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {audios.map((resource, index) => (
 <ResourceCard 
 key={index}
 resource={resource} 
 />
 ))}
 </div>
 </motion.div>
 )}
 </motion.div>
 </AnimatePresence>

 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.4, ease: CUBIC_BEZIER }}
 className="mt-8 text-center"
 >
 <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--surface-default)] backdrop-blur-xl rounded-full border border-[var(--border-default)] shadow-lg">
 <div className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] animate-[pulse_2s_ease-in-out_infinite]" />
 <Text as="span" variant="body" color="secondary" className="text-sm">
 These resources are here to support you
 </Text>
 </div>
 </motion.div>
 </div>
 );
}
