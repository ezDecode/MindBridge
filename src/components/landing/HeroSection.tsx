"use client";

import { motion } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Text } from "@/components/ui";
import { stagger, item } from "./motion";

const valueProps = [
 "AI chat support — anytime, anywhere",
 "Campus counselors who actually understand",
 "100% anonymous. No judgment.",
];

export function HeroSection() {
 return (
 <section className="w-full pb-12 pt-7 sm:pb-15 sm:pt-10">
 <Container size="lg">
 <motion.div 
 initial="hidden" 
 animate="visible" 
 variants={stagger}
 className="mx-auto flex w-full max-w-[86.25rem] flex-col gap-6 px-5 pb-4 sm:gap-7"
 >
 <motion.div variants={item} className="flex flex-col items-center text-center">
 <Text as="h1" variant="h1" weight="bold" className="text-[clamp(1.875rem,6vw,3.5rem)] leading-[1.1] tracking-tight text-[var(--text-primary)]">
 <span className="block">When campus feels heavy</span>
 <span className="block mt-1">You&apos;re not alone</span>
 </Text>
 </motion.div>

 <motion.div variants={item}>
 <ul className="mx-auto flex flex-wrap justify-center gap-x-2 sm:gap-x-4 gap-y-2 max-w-[48rem]">
 {valueProps.map((prop, i) => (
 <li key={i} className="group flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-full px-2.5 py-1.5 sm:px-3 sm:py-1.25 transition-all duration-300 hover:bg-[var(--action-primary-light)]">
 <Icon icon="tabler:circle-check" className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-[var(--action-primary)]" aria-hidden="true" />
 <Text as="span" variant="small" weight="medium" className="tracking-tight text-[var(--text-secondary)] text-center transition-colors duration-300 group-hover:text-[var(--text-primary)]">{prop}</Text>
 </li>
 ))}
 </ul>
 </motion.div>

 <motion.div variants={item} className="mt-4 sm:mt-2 grid gap-4 md:grid-cols-[1.5fr_1fr]">
 <Card 
 variant="elevated" 
 padding="none"
 className="flex flex-col overflow-hidden rounded-md border-[0.125rem] border-[var(--border-default)] bg-[var(--chess-light)] h-[420px] sm:h-[476px]"
 >
 <div className="flex flex-col items-center gap-4 p-6 sm:p-8">
 <Text as="h3" weight="semibold" className="text-center text-[clamp(1.125rem,2.5vw,1.5rem)] leading-[1.2] tracking-tight text-[var(--text-primary)]">
 <span className="block">Your mental health matters —</span>
 <span className="block">we help you thrive every day</span>
 </Text>
 <Button href="/student/dashboard" size="sm" className="w-fit">
 Start for free
 <Icon icon="tabler:arrow-right" className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
 </Button>
 </div>
 <div className="mt-auto">
 <svg viewBox="0 0 400 180" fill="none" className="w-full h-auto">
 <rect x="40" y="20" width="320" height="140" rx="10" fill="var(--surface-default)" />
 <rect x="60" y="40" width="280" height="14" rx="4" fill="var(--action-primary-light)" />
 <rect x="60" y="62" width="200" height="9" rx="3" fill="var(--action-primary-light)" />
 <rect x="60" y="78" width="220" height="9" rx="3" fill="var(--action-primary-light)" />
 <rect x="60" y="94" width="160" height="9" rx="3" fill="var(--action-primary-light)" />
 <circle cx="340" cy="130" r="25" fill="var(--action-primary-light)" />
 <path d="M330 130h20M340 120v20" stroke="var(--action-primary)" strokeWidth="2.5" strokeLinecap="round" />
 </svg>
 </div>
 </Card>

 <Card 
 variant="elevated" 
 padding="none"
 className="flex flex-col overflow-hidden rounded-md border-[0.125rem] border-[var(--border-default)] bg-[var(--chess-light)] h-[420px] sm:h-[476px]"
 >
 <div className="flex flex-col items-center gap-4 p-6 sm:p-8">
 <Text as="h3" weight="semibold" className="text-center text-[clamp(1.125rem,2.5vw,1.5rem)] leading-[1.2] tracking-tight text-[var(--text-primary)]">
 <span className="block">Someone to talk to, anytime</span>
 <span className="block">Your safe space</span>
 </Text>
 <Button href="/student/chat" size="sm" className="w-fit">
 Chat now
 <Icon icon="tabler:arrow-right" className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
 </Button>
 </div>
 <div className="mt-auto">
 <svg viewBox="0 0 400 180" fill="none" className="w-full h-auto">
 <rect x="40" y="20" width="320" height="140" rx="10" fill="var(--surface-default)" />
 <rect x="60" y="40" width="90" height="22" rx="5" fill="var(--action-primary-light)" />
 <rect x="160" y="40" width="170" height="22" rx="5" fill="var(--action-primary-light)" />
 <rect x="60" y="70" width="140" height="14" rx="4" fill="var(--action-primary-light)" />
 <rect x="60" y="92" width="200" height="14" rx="4" fill="var(--action-primary-light)" />
 <rect x="60" y="114" width="110" height="14" rx="4" fill="var(--action-primary-light)" />
 <circle cx="200" cy="140" r="18" fill="var(--action-primary)" />
 <path d="M193 140h14M200 133v14" stroke="var(--surface-default)" strokeWidth="2" strokeLinecap="round" />
 </svg>
 </div>
 </Card>
 </motion.div>
 </motion.div>
 </Container>
 </section>
 );
}

