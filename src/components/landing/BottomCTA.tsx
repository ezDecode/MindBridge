"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button, Container, Text } from "@/components/ui";
import { faqItems, stayInLoop } from "@/content/mindbridge";
import { ease, sectionReveal } from "./motion";

/* ── FAQ Item ── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-[1.4rem] border bg-[var(--color-surface)] transition-colors duration-200 ${
        open ? "border-[var(--color-border-strong)] bg-[var(--color-surface-tinted)]" : "border-[var(--color-border)]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
        aria-expanded={open}
      >
        <Text as="span" variant="small" weight="medium">{question}</Text>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]"
        >
          +
        </motion.span>
      </button>
      <div className="faq-answer" data-open={open}>
        <div>
          <div className="px-5 pb-4">
            <Text as="p" variant="small" color="secondary" className="max-w-[60ch]">{answer}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FAQ ── */

export function FAQ() {
  return (
    <motion.section className="page-section w-full pb-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={sectionReveal}>
      <Container size="md">
        <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
          <div className="text-center lg:text-left">
            <Text as="h2" variant="h2" weight="medium" className="mt-2">Frequently asked questions</Text>
            <Text as="p" variant="small" color="secondary" className="mx-auto mt-3 max-w-[28ch] lg:mx-0">
              Can&apos;t find your answer? Reach out through the chat.
            </Text>
          </div>
          <div className="grid gap-2.5">
            {faqItems.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </Container>
    </motion.section>
  );
}

/* ── Newsletter ── */

export function Newsletter() {
  return (
    <section className="w-full pb-6">
      <Container size="md">
        <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center sm:px-10">
          <Text as="h2" variant="h3" weight="medium">{stayInLoop.headline}</Text>
          <Text as="p" variant="small" color="secondary" className="mx-auto mt-2 max-w-[42ch]">{stayInLoop.description}</Text>
          <div className="mx-auto mt-5 flex max-w-sm gap-2.5">
            <input
              type="email"
              placeholder="Your college email"
              className="min-h-11 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-black)]"
            />
            <Button variant="warm" size="md">Subscribe</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
