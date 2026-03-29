"use client";

import { motion } from "motion/react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Button, Card, Container, Text } from "@/components/ui";
import { stagger, item } from "./motion";

const valueProps = [
  "AI chat support — anytime, anywhere",
  "Campus counselors who actually understand",
  "100% anonymous. No judgment.",
];

export function Hero() {
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
            <Text as="h1" variant="h1" weight="bold">
              <span className="block text-[var(--color-primary)]">When campus feels heavy</span>
              <span className="block mt-1">You&apos;re not alone</span>
            </Text>
          </motion.div>

          <motion.div variants={item}>
            <ul className="mx-auto flex flex-wrap justify-center gap-x-5 gap-y-0 whitespace-nowrap">
              {valueProps.map((prop, i) => (
                <li key={i} className="group flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-1.25 transition-all duration-300 hover:bg-[var(--color-primary-light)]">
                  <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                  <Text as="span" variant="h6" color="secondary" className="transition-colors duration-300 group-hover:text-[var(--color-text-primary)]">{prop}</Text>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={item} className="mt-2 grid gap-4 sm:grid-cols-[1.5fr_1fr]">
            <Card 
              variant="elevated" 
              padding="none"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-[var(--color-border-light)] bg-[var(--color-surface-warm)] pt-[1.6rem] pb-0 sm:min-h-[290px]"
            >
              <div className="absolute inset-0 bg-[var(--color-surface-warm)]" />
              <div className="relative flex flex-col items-center gap-5 px-4 sm:px-6">
                <div className="text-center">
                  <Text as="h3" variant="h3" weight="semibold">
                    <span className="block">Your mental health matters —</span>
                    <span className="block">we help you thrive every day</span>
                  </Text>
                </div>
                <Button href="/student/dashboard" size="md" className="w-fit">
                  Start for free
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-auto">
                <svg viewBox="0 0 400 200" fill="none" className="w-full h-auto">
                  <rect x="60" y="30" width="280" height="150" rx="12" fill="white" fillOpacity="0.95" />
                  <rect x="80" y="50" width="240" height="16" rx="4" fill="var(--color-primary-light)" />
                  <rect x="80" y="76" width="180" height="10" rx="3" fill="var(--color-primary-light)" />
                  <rect x="80" y="94" width="200" height="10" rx="3" fill="var(--color-primary-light)" />
                  <rect x="80" y="112" width="140" height="10" rx="3" fill="var(--color-primary-light)" />
                  <circle cx="320" cy="150" r="30" fill="var(--color-primary)" fillOpacity="0.12" />
                  <path d="M308 150h24M320 138v24" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </Card>

            <Card 
              variant="elevated" 
              padding="none"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-[var(--color-border-warm)] bg-[var(--color-surface-warm)] pt-[1.6rem] pb-0 sm:min-h-[290px]"
            >
              <div className="absolute inset-0 bg-[var(--color-surface-warm)]" />
              <div className="relative flex flex-col items-center gap-5 px-4 sm:px-6">
                <div className="text-center">
                  <Text as="h3" variant="h3" weight="semibold">
                    <span className="block">Someone to talk to, anytime</span>
                    <span className="block">Your safe space</span>
                  </Text>
                </div>
                <Button href="/student/chat" size="md" className="w-fit">
                  Chat now
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-auto">
                <svg viewBox="0 0 400 200" fill="none" className="w-full h-auto">
                  <rect x="60" y="30" width="280" height="150" rx="12" fill="white" fillOpacity="0.95" />
                  <rect x="80" y="50" width="80" height="24" rx="6" fill="var(--color-primary)" fillOpacity="0.15" />
                  <rect x="170" y="50" width="150" height="24" rx="6" fill="var(--color-primary-light)" />
                  <rect x="80" y="84" width="120" height="16" rx="4" fill="var(--color-primary-light)" />
                  <rect x="80" y="108" width="180" height="16" rx="4" fill="var(--color-primary-light)" />
                  <rect x="80" y="132" width="100" height="16" rx="4" fill="var(--color-primary-light)" />
                  <circle cx="200" cy="160" r="20" fill="var(--color-primary)" />
                  <path d="M192 160h16M200 152v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
