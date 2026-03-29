"use client";

import { motion } from "motion/react";
import { Card, Container, Text, Button } from "@/components/ui";
import { stayInLoop } from "@/content/mindbridge";
import { sectionReveal, stagger, item } from "./motion";

export function NewsletterSection() {
  return (
    <motion.section 
      className="w-full pb-16 pt-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionReveal}
    >
      <Container size="md">
        <motion.div variants={stagger} className="mx-auto max-w-[52rem]">
          <Card 
            variant="elevated" 
            padding="none"
            className="relative overflow-hidden border-none bg-[var(--color-primary-light)] rounded-[1.5rem] px-6 py-12 sm:px-12 sm:py-16"
          >
            <motion.div variants={item} className="relative flex flex-col items-center text-center">
              <Text as="h2" variant="h3" weight="bold" className="text-[var(--color-text-primary)]">
                {stayInLoop.headline}
              </Text>
              <Text as="p" variant="body" className="mx-auto mt-3 max-w-[42ch] text-[var(--color-text-secondary)] leading-relaxed">
                {stayInLoop.description}
              </Text>

              <div className="mt-10 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter your college email"
                    className="h-12 w-full rounded-full border border-[var(--color-border-warm)] bg-white px-6 text-label text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5"
                  />
                </div>
                <Button size="md" className="h-12 px-8">
                  Join the loop
                </Button>
              </div>

              <Text as="p" variant="small" className="mt-5 text-[var(--color-text-muted)]">
                One gentle email a week. Unsubscribe anytime.
              </Text>
            </motion.div>
          </Card>
        </motion.div>
      </Container>
    </motion.section>
  );
}
