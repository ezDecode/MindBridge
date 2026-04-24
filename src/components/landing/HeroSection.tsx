"use client";

import { motion } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Text } from "@/components/ui";
import { stagger, item } from "./motion";

const valueProps = [
  "100% anonymous. No judgment.",
  "24/7 proactive AI support.",
  "Quick booking with campus counselors.",
  "Evidence-based wellness tools.",
];

export function HeroSection() {
 return (
 <section className="w-full pb-20 pt-16 sm:pb-32 sm:pt-24 border-b border-border">
 <Container size="lg">
 <motion.div 
 initial="hidden" 
 animate="visible" 
 variants={stagger}
 className="mx-auto flex w-full max-w-[86.25rem] flex-col gap-12 px-5 sm:gap-16"
 >
 <motion.div variants={item} className="flex flex-col items-center text-center">
 <Text as="h1" variant="h1" weight="semibold" className="text-[clamp(2.5rem,8vw,5rem)] leading-[1.05] tracking-[-0.03em] text-white">
 <span className="block text-gradient">When campus feels heavy</span>
 <span className="block mt-2">You&apos;re not alone.</span>
 </Text>
 <Text as="p" variant="h5" color="secondary" className="mt-6 max-w-[60ch] mx-auto leading-relaxed">
 A campus-first mental wellness space for students who need calm support, clarity, and a quick path to real help.
 </Text>
 </motion.div>

 <motion.div variants={item} className="flex justify-center">
 <ul className="flex flex-wrap justify-center gap-4 sm:gap-6">
 {valueProps.map((prop, i) => (
 <li key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white/[0.02] transition-colors hover:bg-white/[0.05]">
 <Icon icon="tabler:circle-check" className="h-4 w-4 text-primary" aria-hidden="true" />
 <Text as="span" variant="small" weight="medium" color="secondary" className="tracking-tight">{prop}</Text>
 </li>
 ))}
 </ul>
 </motion.div>

 <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
 <Card 
 variant="elevated" 
 padding="none"
 className="group relative flex flex-col overflow-hidden bg-surface h-[400px] sm:h-[480px]"
 >
 <div className="flex flex-col items-start gap-6 p-8 sm:p-12 z-10">
 <Text as="h3" variant="h2" weight="semibold" className="max-w-[15ch] leading-tight">
 Your mental health matters
 </Text>
 <Text as="p" color="secondary" className="max-w-[30ch]">
 We help you thrive every day with proactive support and tools.
 </Text>
 <Button href="/student/dashboard" size="lg" className="mt-4">
 Start for free
 <Icon icon="tabler:arrow-right" className="ml-2 h-4 w-4 transition-opacity group-hover:opacity-80" />
 </Button>
 </div>
 <div className="absolute bottom-0 right-0 w-[80%] h-[60%] opacity-20 group-hover:opacity-30 transition-opacity">
 <svg viewBox="0 0 400 300" fill="none" className="w-full h-full">
 <rect x="50" y="50" width="300" height="200" rx="8" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
 <rect x="80" y="80" width="100" height="8" rx="2" fill="white" />
 <rect x="80" y="100" width="150" height="8" rx="2" fill="white" />
 <circle cx="300" cy="150" r="40" stroke="white" strokeWidth="1" />
 <path d="M300 130v40M280 150h40" stroke="white" strokeWidth="1" />
 </svg>
 </div>
 </Card>

 <Card 
 variant="elevated" 
 padding="none"
 className="group relative flex flex-col overflow-hidden bg-surface h-[400px] sm:h-[480px]"
 >
 <div className="flex flex-col items-start gap-6 p-8 sm:p-12 z-10">
 <Text as="h3" variant="h3" weight="semibold" className="max-w-[15ch] leading-tight">
 Someone to talk to, anytime
 </Text>
 <Text as="p" color="secondary" className="max-w-[25ch]">
 100% anonymous chat. No judgment, just support.
 </Text>
 <Button href="/student/chat" variant="warm" size="lg" className="mt-4">
 Chat now
 <Icon icon="tabler:arrow-right" className="ml-2 h-4 w-4 transition-opacity group-hover:opacity-80" />
 </Button>
 </div>
 <div className="absolute bottom-0 right-0 w-[80%] h-[60%] opacity-20 group-hover:opacity-30 transition-opacity">
 <svg viewBox="0 0 400 300" fill="none" className="w-full h-full">
 <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" strokeDasharray="8 8" />
 <rect x="150" y="150" width="100" height="60" rx="4" fill="white" opacity="0.1" />
 <rect x="170" y="170" width="60" height="6" rx="1" fill="white" />
 <rect x="170" y="185" width="40" height="6" rx="1" fill="white" />
 </svg>
 </div>
 </Card>
 </motion.div>
 </motion.div>
 </Container>
 </section>
 );
}
