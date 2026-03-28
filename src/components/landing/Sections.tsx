"use client";

import { motion } from "motion/react";
import { Button, Card, Container, Text } from "@/components/ui";
import { GrassFlower } from "@/constants/assets";
import {
  headspaceCategories,
  resources,
} from "@/content/mindbridge";
import { sectionReveal, stagger, item } from "./motion";

/* ── Resources ── */

export function Resources() {
  return (
    <motion.section id="resources" className="page-section w-full pb-3" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
      <Container size="md">
        <Card variant="elevated" padding="md" className="relative overflow-hidden rounded-[1.8rem]">
          <div className="absolute inset-x-0 bottom-0">
            <GrassFlower className="h-auto w-full opacity-80" />
          </div>
          <div className="relative">
            <div className="text-center">
              <Text as="h2" variant="h2" weight="bold" className="mx-auto mt-2 max-w-[14ch]">Resources between sessions.</Text>
              <Text as="p" variant="small" color="secondary" className="mx-auto mt-1.5 max-w-[45ch]">Curated and compact. No noise — just grounded resources.</Text>
            </div>

            <div className="mt-5 grid gap-3.5 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                <Text as="p" variant="h3" weight="bold">Browse by category, save what helps.</Text>
                <Text as="p" variant="small" color="secondary" className="mt-1.5">Supportive even when you&apos;re not ready to chat or book.</Text>
                <Button href="/student/resources" variant="warm" size="md" className="mt-3">Open resource hub</Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {resources.slice(0, 4).map((r) => (
                  <div key={r.title} className="rounded-[1.1rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.84)] p-3">
                    <div className="flex items-center gap-2">
                      <Text as="span" variant="label" weight="bold" color="secondary">{r.type}</Text>
                      <Text as="span" variant="small" color="muted">·</Text>
                      <Text as="span" variant="small" color="muted">{r.duration}</Text>
                    </div>
                    <Text as="p" variant="label" weight="bold" className="mt-1.5">{r.title}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </motion.section>
  );
}

/* ── Support Categories ── */

export function SupportCategories() {
  return (
    <motion.section className="page-section w-full" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
      <Container size="md">
        <div className="text-center">
          <Text as="h2" variant="h2" weight="bold" className="mx-auto mt-2 max-w-[16ch]">What support do you need?</Text>
        </div>

        <motion.div className="mx-auto mt-7 flex max-w-[46rem] flex-wrap justify-center gap-2" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {headspaceCategories.map((cat) => (
            <motion.button
              key={cat.label}
              type="button"
              variants={item}
              // whileHover={{ y: -2 }}
              className="category-pill flex items-center gap-2 rounded-full px-3.5 py-2 text-[var(--fs-label)] font-medium text-[var(--color-text-primary)]"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </motion.div>
      </Container>
    </motion.section>
  );
}
