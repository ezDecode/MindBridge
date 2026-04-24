"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Icon } from '@iconify/react';
import { Container, Text } from "@/components/ui";
import { faqItems } from "@/content/mindbridge";
import { sectionReveal, stagger, item } from "./motion";

export function FaqSection() {
 const [openIndex, setOpenIndex] = useState<number | null>(0);

 return (
 <motion.section 
 id="faq" 
 className="w-full py-20 sm:py-32" 
 initial="hidden" 
 whileInView="visible" 
 viewport={{ once: true, margin: "-100px" }} 
 variants={sectionReveal}
 >
 <Container size="md">
 <motion.div variants={item} className="text-center mb-16">
 <Text as="h2" variant="h2" weight="semibold">
 Common questions
 </Text>
 <Text as="p" color="secondary" className="mx-auto mt-4 max-w-[50ch]">
 Everything you need to know about MindBridge and how we support your campus journey.
 </Text>
 </motion.div>

 <motion.div 
 variants={stagger} 
 className="mx-auto max-w-[54rem]"
 >
 <div className="border-t border-border">
 {faqItems.map((faq, i) => {
 const isOpen = openIndex === i;
 return (
 <motion.div 
 key={i} 
 variants={item}
 className="border-b border-border"
 >
 <button
 onClick={() => setOpenIndex(isOpen ? null : i)}
 className="group flex w-full items-center justify-between py-6 text-left focus:outline-none"
 aria-expanded={isOpen}
 >
 <Text 
 as="span" 
 weight="medium" 
 className={`pr-8 transition-colors duration-150 ${
 isOpen ? "text-white" : "text-text-muted group-hover:text-white"
 }`}
 >
 {faq.question}
 </Text>
 <div className={`flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-300 ${
 isOpen ? "rotate-180 text-white" : "text-text-dim group-hover:text-white"
 }`}>
 <Icon icon="tabler:chevron-down" className="h-4 w-4" />
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
 <div className="pb-8 pr-12">
 <Text as="p" color="secondary" className="max-w-[65ch] leading-relaxed">
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

