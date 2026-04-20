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

const CUBIC_BEZIER = [0.32, 0.72, 0, 1] as const;

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const fadeUpReveal = {
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: CUBIC_BEZIER }
  }
};

const floatIn = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: CUBIC_BEZIER }
  }
};

const shellClass = "relative rounded-[2.5rem] bg-white/60 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]";
const innerClass = "relative p-10 rounded-[calc(2.5rem-0.75rem)] bg-gradient-to-b from-white to-[var(--color-surface-warm)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_8px_rgba(0,0,0,0.02)]";

const techniqueShell = "relative rounded-[2rem] bg-white/70 backdrop-blur-md border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
const techniqueInner = "relative p-6 rounded-[calc(2rem-0.5rem)] bg-gradient-to-br from-white to-slate-50/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]";

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"breathe" | "videos" | "audio">("breathe");

  const techniques = [
    { title: "Box Breathing", desc: "Focus & clarity", icon: "□", gradient: "from-slate-100 to-slate-200" },
    { title: "4-7-8 Technique", desc: "Sleep & calm", icon: "◐", gradient: "from-violet-100 to-violet-200" },
    { title: "Physiological Sigh", desc: "Quick relief", icon: "○", gradient: "from-amber-100 to-amber-200" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-8 md:gap-10">
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
        <div className="inline-flex items-center p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              variants={fadeUpReveal}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-8 py-3 rounded-[1.25rem] text-sm font-medium"
            >
              <AnimatePresence mode="wait">
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-[1.25rem] shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
                  />
                )}
              </AnimatePresence>
              <span className={`relative z-10 ${activeTab === tab.id ? "text-white" : "text-slate-600"}`}>
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: CUBIC_BEZIER }}
          className="w-full"
        >
          {activeTab === "breathe" && (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-12">
              <motion.div variants={fadeUpReveal} className="max-w-xl mx-auto">
                <div className={shellClass}>
                  <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-accent)]/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-primary)]/8 blur-[80px]" />
                  </div>
                  <div className={innerClass}>
                    <BreathingExercise />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUpReveal} className="pt-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary-light)]/50 rounded-full border border-[var(--color-primary)]/20 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    <Text as="span" variant="small" weight="medium" className="text-[var(--color-primary)] tracking-wide">
                      THREE TECHNIQUES
                    </Text>
                  </div>
                  <Text as="h3" variant="h3" weight="bold" className="text-slate-900">
                    Quick Start Techniques
                  </Text>
                  <Text as="p" variant="body" color="secondary" className="mt-3 max-w-md mx-auto">
                    Evidence-based breathing methods for different needs
                  </Text>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                  {techniques.map((item, index) => (
                    <motion.div
                      key={item.title}
                      variants={fadeUpReveal}
                      custom={index}
                      className="group"
                      style={{ 
                        transform: `translateY(${index * 12}px)`,
                        zIndex: 3 - index 
                      }}
                    >
                      <motion.button
                        whileHover={{ y: -8, transition: { duration: 0.4, ease: CUBIC_BEZIER } }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-6 rounded-[1.75rem] bg-gradient-to-br ${item.gradient} border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500`}
                      >
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-md flex items-center justify-center text-2xl">
                            {item.icon}
                          </div>
                          <div>
                            <Text as="p" variant="h6" weight="semibold" className="text-slate-900">
                              {item.title}
                            </Text>
                            <Text as="span" variant="small" color="secondary">
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
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
              <motion.div variants={floatIn} className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <Text as="h2" variant="h3" weight="bold" className="text-slate-900">
                    Guided Videos
                  </Text>
                  <Text as="p" variant="body" color="secondary">
                    Meditation and breathing exercises for daily wellness
                  </Text>
                </div>
              </motion.div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((resource, index) => (
                  <motion.div 
                    key={index}
                    variants={fadeUpReveal}
                    custom={index}
                    className="p-2 rounded-[2rem] bg-white/70 backdrop-blur-sm border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                  >
                    <ResourceCard 
                      resource={resource} 
                      className="rounded-[calc(2rem-0.5rem)] bg-white border-0" 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "audio" && (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
              <motion.div variants={floatIn} className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <Text as="h2" variant="h3" weight="bold" className="text-slate-900">
                    Relaxation Audio
                  </Text>
                  <Text as="p" variant="body" color="secondary">
                    Sounds and stories for restful moments
                  </Text>
                </div>
              </motion.div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {audios.map((resource, index) => (
                  <motion.div 
                    key={index}
                    variants={fadeUpReveal}
                    custom={index}
                    className="p-2 rounded-[2rem] bg-white/70 backdrop-blur-sm border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                  >
                    <ResourceCard 
                      resource={resource} 
                      className="rounded-[calc(2rem-0.5rem)] bg-white border-0" 
                    />
                  </motion.div>
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
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)] animate-[pulse_2s_ease-in-out_infinite]" />
          <Text as="span" variant="body" color="secondary" className="text-sm">
            These resources are here to support you
          </Text>
        </div>
      </motion.div>
    </div>
  );
}