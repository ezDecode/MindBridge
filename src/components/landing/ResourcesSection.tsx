"use client";

import { motion } from "motion/react";
import { Button, Container, Text } from "@/components/ui";
import { sectionReveal } from "./motion";

const sampleResources = [
 { title: "5-Minute Breathing for Anxiety", type: "Video", duration: "5 min" },
 { title: "Sleep Stories for Students", type: "Audio", duration: "20 min" },
 { title: "Study Break Meditation", type: "Video", duration: "10 min" },
 { title: "Exam Stress Relief Guide", type: "Article", duration: "8 min read" },
];

export function ResourcesSection() {
 return (
 <motion.section id="resources" className="page-section w-full pb-3" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
 <Container size="lg">
 <div className="mx-auto w-full max-w-6xl rounded-3xl bg-[var(--surface-warm)] px-5 py-8 shadow-[0_16px_42px_-28px_rgba(2,6,23,0.45)] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
 <div className="mx-auto max-w-3xl text-center">
 <Text as="h2" variant="h3" weight="bold" className="mx-auto max-w-[20ch] text-[var(--text-primary)] md:text-h2">
 Resources between sessions.
 </Text>
 <Text as="p" variant="body" color="secondary" className="mx-auto mt-3 max-w-[45ch]">
 Curated videos, audio, and articles for your campus mental health journey.
 </Text>
 </div>

 <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
 <div className="flex h-full flex-col justify-between rounded-2xl bg-[var(--action-primary-light)]/80 p-6 shadow-[0_12px_30px_-22px_rgba(13,42,99,0.6)] sm:p-8">
 <div>
 <Text as="p" variant="h4" weight="bold" className="text-[var(--text-primary)] leading-tight md:text-h3">
 Simple wellness resources that actually help.
 </Text>
 <Text as="p" variant="body" color="secondary" className="mt-3 max-w-[36ch]">
 Supportive even when you&apos;re not ready to chat or book.
 </Text>
 </div>
 <div className="mt-6 md:mt-8">
 <Button href="/student/resources" variant="primary" size="md">Open resource hub</Button>
 </div>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 {sampleResources.map((r) => (
 <article key={r.title} className="group flex h-full flex-col justify-between rounded-2xl bg-[var(--surface-default)]/95 p-4 shadow-[0_14px_28px_-22px_rgba(15,23,42,0.55)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-5">
 <div className="flex items-center gap-2">
 <Text as="span" variant="label" weight="bold" className="text-[var(--action-primary)]">{r.type}</Text>
 <Text as="span" variant="small" color="muted">·</Text>
 <Text as="span" variant="small" color="muted">{r.duration}</Text>
 </div>
 <Text as="p" variant="h6" weight="bold" className="mt-2 text-[var(--text-primary)] leading-snug">{r.title}</Text>
 </article>
 ))}
 </div>
 </div>
 </div>
 </Container>
 </motion.section>
 );
}

