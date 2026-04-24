"use client";

import { useState } from "react";
import { Icon } from '@iconify/react';
import { motion } from "motion/react";
import { Button, Card, Container, Text } from "@/components/ui";
import { beKindCTA, counselors } from "@/content/mindbridge";
import { sectionReveal } from "./motion";

interface TabConfig {
 id: string;
 label: string;
}

interface CarouselSectionProps {
 tabs: TabConfig[];
}

const CARD_HEIGHT = "h-auto lg:h-[600px]";

/* ── Carousel Slide Component ── */

interface SlideProps {
 children: React.ReactNode;
}

const Slide = ({ children }: SlideProps) => {
 return (
 <li className="flex-shrink-0 w-full px-4 flex justify-center relative list-none">
 <div className="w-full max-w-5xl">
 {children}
 </div>
 </li>
 );
};

/* ── Main Carousel Section ── */

export function CarouselSection({ tabs }: CarouselSectionProps) {
 const [current, setCurrent] = useState(0);

 const handleTabClick = (index: number) => {
 setCurrent(index);
 };

 return (
 <motion.section 
 className="page-section w-full py-20 sm:py-32 border-b border-border" 
 initial="hidden" 
 whileInView="visible" 
 viewport={{ once: true, margin: "-80px" }} 
 variants={sectionReveal}
 >
 <Container size="lg">
 <div className="mb-16 text-center">
 <Text as="h2" variant="h2" weight="semibold">Support that fits your moment</Text>
 </div>

 {/* Tab Navigation */}
 <div className="mx-auto mb-16 flex flex-wrap justify-center gap-2">
 {tabs.map((tab, index) => (
 <button
 key={tab.id}
 onClick={() => handleTabClick(index)}
 className={`h-9 px-4 rounded-md text-sm font-medium transition-all duration-150 ${
 current === index 
 ? "bg-white text-black shadow-sm"
 : "text-text-muted hover:text-white hover:bg-white/5"
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <div className="relative">
 {/* Main Carousel Track */}
 <div className="flex w-full overflow-hidden">
 <ul 
 className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
 style={{ transform: `translateX(-${current * 100}%)` }}
 >
 {tabs.map((tab) => (
 <Slide key={tab.id}>
 {tab.id === "aicompanion" && (
 <Card variant="elevated" padding="none" className="overflow-hidden bg-surface h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-white/[0.02] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-border">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-surface-raised border border-border shadow-sm mb-6">
 <Icon icon="tabler:message-circle" className="w-8 h-8 text-primary" />
 </div>
 <Text as="h3" variant="h3" weight="semibold">AI Companion</Text>
 <Text as="p" color="secondary" className="mt-2">Talk anytime, anonymously</Text>
 </div>
 </div>
 <div className="flex flex-col justify-center p-8 lg:p-16">
 <Text as="h3" variant="h3" weight="semibold" className="leading-tight">{beKindCTA.headline}</Text>
 <Text as="p" color="secondary" className="mt-4 leading-relaxed">{beKindCTA.description}</Text>
 <div className="mt-8 space-y-4">
 {beKindCTA.features.map((f) => (
 <div key={f} className="flex items-center gap-3">
 <Icon icon="tabler:circle-check" className="h-4 w-4 shrink-0 text-primary" />
 <Text as="p" variant="small" color="secondary">{f}</Text>
 </div>
 ))}
 </div>
 <div className="mt-10">
 <Button href="/student/dashboard" size="lg">Get started</Button>
 </div>
 </div>
 </div>
 </Card>
 )}

 {tab.id === "wellnesscheck" && (
 <Card variant="elevated" padding="none" className="overflow-hidden bg-surface h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-white/[0.02] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-border">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-surface-raised border border-border shadow-sm mb-6">
 <Icon icon="tabler:clipboard" className="w-8 h-8 text-primary" />
 </div>
 <Text as="h3" variant="h3" weight="semibold">Wellness Check</Text>
 <Text as="p" color="secondary" className="mt-2">PHQ-9 & GAD-7 validated tools</Text>
 </div>
 </div>
 <div className="flex flex-col justify-center p-8 lg:p-16">
 <Text as="h3" variant="h3" weight="semibold" className="leading-tight">Understand Your Feelings</Text>
 <Text as="p" color="secondary" className="mt-4 leading-relaxed">Track your mental wellness with simple, thoughtful tools designed for students.</Text>
 <div className="mt-8 space-y-6">
 <div className="flex items-start gap-4">
 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-1">
 <Icon icon="tabler:circle-check" className="h-4 w-4" />
 </div>
 <div>
 <Text as="p" weight="semibold">Daily mood check-ins</Text>
 <Text as="p" variant="small" color="secondary" className="mt-1">Track patterns and build consistent self-awareness</Text>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-1">
 <Icon icon="tabler:circle-check" className="h-4 w-4" />
 </div>
 <div>
 <Text as="p" weight="semibold">Wellness resources</Text>
 <Text as="p" variant="small" color="secondary" className="mt-1">Curated videos and audio for mental health support</Text>
 </div>
 </div>
 </div>
 </div>
 </div>
 </Card>
 )}

 {tab.id === "expertsupport" && (
 <Card variant="elevated" padding="none" className="overflow-hidden bg-surface h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-white/[0.02] flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-border">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-surface-raised border border-border shadow-sm mb-6">
 <Icon icon="tabler:user" className="w-8 h-8 text-primary" />
 </div>
 <Text as="h3" variant="h3" weight="semibold">Expert Support</Text>
 <Text as="p" color="secondary" className="mt-2">Book in under 2 minutes</Text>
 </div>
 </div>
 <div className="flex flex-col justify-center p-8 lg:p-16">
 <Text as="h3" variant="h3" weight="semibold" className="leading-tight">Connect with a Counselor</Text>
 <Text as="p" color="secondary" className="mt-4 leading-relaxed">Your choice — anonymous, named, or crisis booking. Get the support you deserve.</Text>
 <div className="mt-8 grid gap-4">
 {counselors.slice(0, 2).map((c) => (
 <div key={c.name} className="rounded-lg bg-surface-raised border border-border p-5 transition-colors hover:bg-surface-hover">
 <div className="flex items-center justify-between gap-4">
 <div>
 <Text as="p" weight="semibold">{c.name}</Text>
 <Text as="p" variant="small" color="secondary">{c.focus}</Text>
 </div>
 <Text as="p" variant="small" weight="bold" className="text-primary bg-primary/10 px-3 py-1 rounded">
 {c.availability}
 </Text>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </Card>
 )}

 {tab.id === "feelgood" && (
 <Card variant="elevated" padding="none" className="overflow-hidden bg-surface h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-white/[0.02] flex flex-col items-center justify-center p-12 text-center border-b lg:border-b-0 lg:border-r border-border">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-surface-raised border border-border shadow-sm mb-6">
 <Icon icon="tabler:book" className="w-8 h-8 text-primary" />
 </div>
 <Text as="h3" variant="h3" weight="semibold">Feel-good Library</Text>
 <Text as="p" color="secondary" className="mt-3 leading-relaxed">Curated collection of guided meditations and mindfulness exercises.</Text>
 </div>
 <div className="relative bg-background flex flex-col items-center justify-center p-12 text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-surface-raised border border-border shadow-sm mb-6">
 <Icon icon="tabler:moon" className="w-8 h-8 text-primary" />
 </div>
 <Text as="h3" variant="h3" weight="semibold">Breathe & Sleep</Text>
 <Text as="p" color="secondary" className="mt-3 leading-relaxed">Calm your mind and improve your sleep with specialized campus routines.</Text>
 </div>
 </div>
 </Card>
 )}
 </Slide>
 ))}
 </ul>
 </div>

 {/* Controls */}
 <div className="mt-16 flex justify-center items-center">
 <div className="flex gap-3">
 {tabs.map((_, i) => (
 <button 
 key={i} 
 onClick={() => setCurrent(i)}
 className={`h-1 transition-all duration-300 rounded-full ${current === i ? "w-8 bg-white" : "w-2 bg-border hover:bg-white/20"}`}
 />
 ))}
 </div>
 </div>
 </div>
 </Container>
 </motion.section>
 );
}
