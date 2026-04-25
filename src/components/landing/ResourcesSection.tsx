"use client";

import { motion } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Text } from "@/components/ui";
import { sectionReveal } from "./motion";

const sampleResources = [
 { title: "5-Minute Breathing for Anxiety", type: "Video", duration: "5 min" },
 { title: "Sleep Stories for Students", type: "Audio", duration: "20 min" },
 { title: "Study Break Meditation", type: "Video", duration: "10 min" },
 { title: "Exam Stress Relief Guide", type: "Article", duration: "8 min read" },
];

export function ResourcesSection() {
 return (
 <motion.section id="resources" className="page-section w-full py-20 sm:py-32 bg-background border-b border-border" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
 <Container size="lg">
 <div className="mx-auto w-full max-w-6xl">
 <div className="mb-16 text-center">
 <Text as="h2" variant="h2" weight="semibold">
 Resources between sessions
 </Text>
 <Text as="p" color="secondary" className="mt-4 max-w-[45ch] mx-auto">
 Curated videos, audio, and articles for your campus mental health journey.
 </Text>
 </div>

 <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
 <Card variant="elevated" className="flex flex-col justify-between p-8 sm:p-12 bg-white/[0.02]">
 <div>
 <Text as="h3" variant="h3" weight="semibold" className="leading-tight">
 Simple wellness resources that actually help.
 </Text>
 <Text as="p" color="secondary" className="mt-4 max-w-[36ch]">
 Supportive even when you&apos;re not ready to chat or book.
 </Text>
 </div>
 <div className="mt-10">
 <Button href="/student/resources" size="lg">Open resource hub</Button>
 </div>
 </Card>

 <div className="grid gap-4 sm:grid-cols-2">
 {sampleResources.map((r) => (
 <article key={r.title} className="group flex flex-col justify-between rounded-lg bg-surface p-6 border border-border transition-all duration-150 hover:border-white/20 hover:bg-surface-hover">
 <div>
 <div className="flex items-center gap-2 mb-4">
 <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium ">
 {r.type}
 </div>
 <Text as="span" variant="small" color="muted">{r.duration}</Text>
 </div>
 <Text as="p" weight="semibold" className="text-white leading-snug group-hover:text-primary transition-colors">{r.title}</Text>
 </div>
 <div className="mt-6 flex justify-end">
 <Icon icon="tabler:arrow-right" className="h-4 w-4 text-text-dim opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:text-white" />
 </div>
 </article>
 ))}
 </div>
 </div>
 </div>
 </Container>
 </motion.section>
 );
}

