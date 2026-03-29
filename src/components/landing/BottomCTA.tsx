"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { Button, Container, Text } from "@/components/ui";
import { faqItems, stayInLoop } from "@/content/mindbridge";
import { ease, sectionReveal } from "./motion";

/* ── FAQ Item ── */

function FAQItem({ question, answer, id }: { question: string; answer: string; id: string }) {
  const [open, setOpen] = useState(false);
  const contentId = `faq-content-${id}`;

  return (
    <div
      className={`rounded-[1.4rem] border transition-colors duration-200 ${
        open ? "border-[var(--color-border-dark)] bg-[var(--color-surface-dark-alt)]" : "border-[var(--color-border-dark)] bg-[var(--color-surface-dark-alt)]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[var(--color-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-white)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-dark)]"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <Text as="span" variant="h6" weight="bold">{question}</Text>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-dark)] text-[var(--color-white)]/50"
        >
          <FiPlus className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.span>
      </button>
      <div id={contentId} className="faq-answer" data-open={open} role="region">
        <div>
          <div className="px-5 pb-4">
            <Text as="p" variant="small" className="max-w-[60ch] text-[var(--color-white)]/60">{answer}</Text>
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
        <div className="rounded-[2rem] bg-[var(--color-surface-dark)] px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
          <div className="text-center lg:text-left">
            <Text as="h2" variant="h2" weight="bold" className="mt-2 text-[var(--color-white)]">Frequently asked questions</Text>
            <Text as="p" variant="small" className="mx-auto mt-3 max-w-[28ch] text-[var(--color-white)]/60 lg:mx-0">
              Can&apos;t find your answer? Reach out through the chat.
            </Text>
          </div>
          <div className="grid gap-2.5">
            {faqItems.map((faq, index) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} id={index.toString()} />
            ))}
          </div>
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
        <div className="rounded-[1.8rem] bg-[var(--color-surface-dark-alt)] px-6 py-8 text-center sm:px-10">
          <Text as="h2" variant="h3" weight="bold" className="text-[var(--color-white)]">{stayInLoop.headline}</Text>
          <Text as="p" variant="small" className="mx-auto mt-2 max-w-[42ch] text-[var(--color-white)]/60">{stayInLoop.description}</Text>
          <div className="mx-auto mt-5 flex max-w-sm gap-2.5">
            <input
              type="email"
              placeholder="Your college email"
              className="min-h-11 flex-1 rounded-full border border-[var(--color-border-dark)] bg-[var(--color-surface-dark)] px-4 text-label text-[var(--color-white)] outline-none transition-colors duration-200 placeholder:text-[var(--color-white)]/40 focus:border-[var(--color-primary)]"
            />
            <Button variant="warm" size="md">Subscribe</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
