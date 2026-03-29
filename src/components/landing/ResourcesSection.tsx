"use client";

import { motion } from "motion/react";
import { Button, Card, Container, Text } from "@/components/ui";
import { GrassFlower } from "@/constants/assets";
import { resources } from "@/content/mindbridge";
import { sectionReveal } from "./motion";

export function ResourcesSection() {
  return (
    <motion.section id="resources" className="page-section w-full pb-3" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
      <Container size="lg">
        <div className="mx-auto flex justify-center">
          <Card 
            variant="elevated" 
            padding="none" 
            className="relative overflow-hidden rounded-[calc(var(--radius-lg)*var(--brm))] squircle border-none bg-[var(--color-surface-warm)] w-[95vw] md:w-[75vw] h-[70vh] min-h-[600px] shadow-sm"
          >
            <div className="absolute inset-x-0 bottom-0 pointer-events-none">
              <GrassFlower className="h-auto w-full opacity-60" />
            </div>
            
            <div className="relative h-full flex flex-col items-center justify-center px-6 py-12 sm:px-16">
              <div className="text-center mb-10">
                <Text as="h2" variant="h2" weight="bold" className="mx-auto max-w-[20ch] text-[var(--color-text-primary)]">
                  Resources between sessions.
                </Text>
                <Text as="p" variant="body" color="secondary" className="mx-auto mt-3 max-w-[45ch]">
                  Curated and compact. No noise — just grounded resources for your campus journey.
                </Text>
              </div>

              <div className="grid gap-6 w-full max-w-[64rem] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-center rounded-[calc(var(--radius-lg)*var(--brm))] squircle bg-[var(--color-primary-light)] p-8 sm:p-10 shadow-sm border border-[var(--color-border-warm)]/30">
                  <Text as="p" variant="h3" weight="bold" className="text-[var(--color-text-primary)] leading-tight">
                    Browse by category, save what helps.
                  </Text>
                  <Text as="p" variant="body" color="secondary" className="mt-3">
                    Supportive even when you&apos;re not ready to chat or book.
                  </Text>
                  <div className="mt-8">
                    <Button href="/student/resources" variant="primary" size="md">Open resource hub</Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.slice(0, 4).map((r) => (
                    <div key={r.title} className="flex flex-col justify-center rounded-[calc(var(--radius-md)*var(--brm))] squircle bg-white p-5 shadow-sm border border-[var(--color-border-warm)]/40 transition-[border-color,box-shadow] duration-200 hover:border-[var(--color-border-strong)] hover:shadow-md">
                      <div className="flex items-center gap-2">
                        <Text as="span" variant="label" weight="bold" className="text-[var(--color-primary)]">{r.type}</Text>
                        <Text as="span" variant="small" color="muted">·</Text>
                        <Text as="span" variant="small" color="muted">{r.duration}</Text>
                      </div>
                      <Text as="p" variant="h6" weight="bold" className="mt-2 text-[var(--color-text-primary)] leading-snug">{r.title}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </motion.section>
  );
}
