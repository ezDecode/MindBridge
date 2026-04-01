"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Container, Text } from "@/components/ui";
import { faqItems } from "@/content/mindbridge";
import { sectionReveal, stagger, item } from "./motion";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.section 
      id="faq" 
      className="w-full py-12 sm:py-16 md:py-24" 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={sectionReveal}
    >
      <Container size="md">
        <motion.div variants={item} className="text-center px-4">
          <Text as="h2" variant="h3" weight="bold" className="text-balance text-[var(--color-text-primary)] md:text-h2">
            Common questions
          </Text>
          <Text as="p" variant="body" color="secondary" className="mx-auto mt-2 max-w-[50ch] text-balance">
            Everything you need to know about MindBridge and how we support your campus journey.
          </Text>
        </motion.div>

        <motion.div 
          variants={stagger} 
          className="mx-auto mt-10 md:mt-12 max-w-[54rem]"
        >
          <div className="border-t border-[var(--color-border-light)]">
            {faqItems.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div 
                  key={i} 
                  variants={item}
                  className="border-b border-[var(--color-border-light)]"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full min-h-[4rem] items-center justify-between py-4 md:py-6 text-left transition-colors hover:text-[var(--color-primary)] focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <Text 
                      as="span" 
                      variant="label" 
                      weight="bold" 
                      className={`pr-6 md:pr-8 transition-colors duration-300 ${
                        isOpen ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {faq.question}
                    </Text>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen 
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] rotate-180" 
                        : "bg-[var(--color-surface-warm)] text-[var(--color-text-secondary)]"
                    }`}>
                      <FiChevronDown className="h-5 w-5" />
                    </div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="pb-6 md:pb-8 pr-10 md:pr-12">
                          <Text as="p" variant="body" className="max-w-[65ch] text-[var(--color-text-secondary)] leading-relaxed">
                            {faq.answer}
                          </Text>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </motion.section>
  );
}
