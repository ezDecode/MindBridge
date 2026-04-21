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

const CARD_HEIGHT = "h-[70vh] min-h-[600px]";

/* ── Carousel Slide Component ── */

interface SlideProps {
 children: React.ReactNode;
}

const Slide = ({ children }: SlideProps) => {
 return (
 <li className="flex-shrink-0 w-full px-4 flex justify-center relative list-none">
 <div className="w-[95vw] md:w-[75vw]">
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
 className="page-section w-full pt-4 pb-16 overflow-hidden" 
 initial="hidden" 
 whileInView="visible" 
 viewport={{ once: true, margin: "-80px" }} 
 variants={sectionReveal}
 >
 <Container size="lg">
 <div className="mb-10 text-center">
 <Text as="h2" variant="h2" weight="bold" className="text-[var(--text-primary)]">Support that fits your moment</Text>
 </div>

 {/* Tab Navigation */}
 <div className="mx-auto mb-10 flex flex-wrap justify-center gap-2">
 {tabs.map((tab, index) => (
 <button
 key={tab.id}
 onClick={() => handleTabClick(index)}
 className={`h-11 px-6 rounded-full text-label font-bold transition-all duration-300 ${
 current === index 
 ? "bg-[var(--action-primary)] text-[var(--text-inverse)]"
 : "bg-[var(--surface-warm)] text-[var(--text-secondary)] hover:bg-[var(--action-primary-light)] hover:text-[var(--text-primary)]"
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <div className="relative">
 {/* Main Carousel Track */}
 <div className="flex w-full">
 <ul 
 className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
 style={{ transform: `translateX(-${current * 100}%)` }}
 >
 {tabs.map((tab) => (
 <Slide key={tab.id}>
 {tab.id === "aicompanion" && (
 <Card variant="elevated" padding="none" className="rounded-md border-[0.125rem] border-[var(--border-default)] overflow-hidden bg-[var(--surface-default)] h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-[var(--action-primary-light)] flex items-center justify-center p-8">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-[var(--surface-default)] shadow-sm mb-4">
 <Icon icon="tabler:message-circle" className="w-10 h-10 text-[var(--action-primary)]" />
 </div>
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)]">AI Companion</Text>
 <Text as="p" variant="small" className="text-[var(--text-secondary)] mt-2">Talk anytime, anonymously</Text>
 </div>
 </div>
 <div className="flex flex-col justify-center p-8 lg:p-12">
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)] leading-tight">{beKindCTA.headline}</Text>
 <Text as="p" variant="body" className="mt-3.5 text-[var(--text-secondary)] leading-relaxed">{beKindCTA.description}</Text>
 <div className="mt-6 space-y-3">
 {beKindCTA.features.map((f) => (
 <div key={f} className="flex items-center gap-3">
 <Icon icon="tabler:circle-check" className="h-4 w-4 shrink-0 text-[var(--action-primary)]" />
 <Text as="p" variant="small" className="text-[var(--text-secondary)]">{f}</Text>
 </div>
 ))}
 </div>
 <div className="mt-8">
 <Button href="/student/dashboard" variant="primary" size="md">Get started</Button>
 </div>
 </div>
 </div>
 </Card>
 )}

 {tab.id === "wellnesscheck" && (
 <Card variant="elevated" padding="none" className="rounded-md border-[0.125rem] border-[var(--border-default)] overflow-hidden bg-[var(--surface-default)] h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-[var(--action-primary-light)] flex items-center justify-center p-8">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-[var(--surface-default)] shadow-sm mb-4">
 <Icon icon="tabler:clipboard" className="w-10 h-10 text-[var(--action-primary)]" />
 </div>
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)]">Wellness Check</Text>
 <Text as="p" variant="small" className="text-[var(--text-secondary)] mt-2">PHQ-9 & GAD-7 validated tools</Text>
 </div>
 </div>
 <div className="flex flex-col justify-center p-8 lg:p-12">
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)] leading-tight">Understand Your Feelings</Text>
 <Text as="p" variant="body" className="mt-3.5 text-[var(--text-secondary)] leading-relaxed">Track your mental wellness with simple, thoughtful tools designed for students.</Text>
 <div className="mt-6 space-y-4">
 <div className="flex items-start gap-3">
 <Icon icon="tabler:circle-check" className="h-4.5 w-4.5 shrink-0 text-[var(--action-primary)] mt-1" />
 <div>
 <Text as="p" variant="h6" weight="bold" className="text-[var(--text-primary)]">Daily mood check-ins</Text>
 <Text as="p" variant="small" className="text-[var(--text-secondary)] mt-0.5">Track patterns and build consistent self-awareness</Text>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Icon icon="tabler:circle-check" className="h-4.5 w-4.5 shrink-0 text-[var(--action-primary)] mt-1" />
 <div>
 <Text as="p" variant="h6" weight="bold" className="text-[var(--text-primary)]">Wellness resources</Text>
 <Text as="p" variant="small" className="text-[var(--text-secondary)] mt-0.5">Curated videos and audio for mental health support</Text>
 </div>
 </div>
 </div>
 </div>
 </div>
 </Card>
 )}

 {tab.id === "expertsupport" && (
 <Card variant="elevated" padding="none" className="rounded-md border-[0.125rem] border-[var(--border-default)] overflow-hidden bg-[var(--surface-default)] h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-[var(--action-primary-light)] flex items-center justify-center p-8">
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-[var(--surface-default)] shadow-sm mb-4">
 <Icon icon="tabler:user" className="w-10 h-10 text-[var(--action-primary)]" />
 </div>
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)]">Expert Support</Text>
 <Text as="p" variant="small" className="text-[var(--text-secondary)] mt-2">Book in under 2 minutes</Text>
 </div>
 </div>
 <div className="flex flex-col justify-center p-8 lg:p-12">
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)] leading-tight">Connect with a Counselor</Text>
 <Text as="p" variant="body" className="mt-3.5 text-[var(--text-secondary)] leading-relaxed">Your choice — anonymous, named, or crisis booking. Get the support you deserve.</Text>
 <div className="mt-6 grid gap-3">
 {counselors.slice(0, 2).map((c) => (
 <div key={c.name} className="rounded-md bg-[var(--surface-default)] border border-[var(--border-default)] p-4 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <Text as="p" variant="h6" weight="bold" className="text-[var(--text-primary)]">{c.name}</Text>
 <Text as="p" variant="small" className="text-[var(--text-secondary)]">{c.focus}</Text>
 </div>
 <Text as="p" variant="small" weight="bold" className="text-[var(--action-primary)] bg-[var(--action-primary-light)] px-3 py-1 rounded-full">{c.availability}</Text>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </Card>
 )}

 {tab.id === "feelgood" && (
 <Card variant="elevated" padding="none" className="rounded-md border-[0.125rem] border-[var(--border-default)] overflow-hidden bg-[var(--surface-default)] h-full">
 <div className={`grid lg:grid-cols-2 ${CARD_HEIGHT}`}>
 <div className="relative bg-[var(--action-primary-light)] flex flex-col items-center justify-center p-12 text-center border-r border-white/20">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-[var(--surface-default)] shadow-sm mb-6">
 <Icon icon="tabler:book" className="w-10 h-10 text-[var(--action-primary)]" />
 </div>
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)]">Feel-good Library</Text>
 <Text as="p" variant="body" className="text-[var(--text-secondary)] mt-3 leading-relaxed">Curated collection of guided meditations and mindfulness exercises.</Text>
 </div>
 <div className="relative bg-[var(--surface-warm)] flex flex-col items-center justify-center p-12 text-center">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-[var(--surface-default)] shadow-sm mb-6">
 <Icon icon="tabler:moon" className="w-10 h-10 text-[var(--action-primary)]" />
 </div>
 <Text as="h3" variant="h3" weight="bold" className="text-[var(--text-primary)]">Breathe & Sleep</Text>
 <Text as="p" variant="body" className="text-[var(--text-secondary)] mt-3 leading-relaxed">Calm your mind and improve your sleep with specialized campus routines.</Text>
 </div>
 </div>
 </Card>
 )}
 </Slide>
 ))}
 </ul>
 </div>

 {/* Controls */}
 <div className="mt-12 flex justify-center items-center">
 <div className="flex gap-2">
 {tabs.map((_, i) => (
 <button 
 key={i} 
 onClick={() => setCurrent(i)}
 className={`h-2 transition-all duration-300 rounded-full ${current === i ? "w-8 bg-[var(--action-primary)]" : "w-2 bg-[var(--border-default)]"}`}
 />
 ))}
 </div>
 </div>
 </div>
 </Container>
 </motion.section>
 );
}

