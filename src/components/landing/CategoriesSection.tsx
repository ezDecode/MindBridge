"use client";

import { motion } from "motion/react";
import { Icon as IconifyIcon } from '@iconify/react';
import { Container, Text } from "@/components/ui";
import { mindbridgeCategories } from "@/content/mindbridge";
import { sectionReveal, stagger, item } from "./motion";

const categoryIcons: Record<string, string> = {
 stress: "tabler:bolt",
 sleep: "tabler:moon",
 anxiety: "tabler:wind",
 thoughts: "tabler:brain",
 meditation: "tabler:yoga",
 therapy: "tabler:user-heart",
};

export function CategoriesSection() {
 return (
 <motion.section 
 className="w-full bg-background border-b border-border" 
 initial="hidden" 
 whileInView="visible" 
 viewport={{ once: true, margin: "-80px" }} 
 variants={sectionReveal}
 >
 <Container size="lg">
 <div className="mx-auto w-full max-w-[90rem] px-6 py-20 sm:px-12 sm:py-32">
 <motion.div variants={item} className="mb-12 sm:mb-20">
 <Text 
 as="h2" 
 variant="h2"
 weight="semibold"
 className="text-center"
 >
 Support for every moment
 </Text>
 </motion.div>

 <motion.div 
 className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" 
 variants={stagger}
 >
 {mindbridgeCategories.map((cat) => {
 const iconName = categoryIcons[cat.id];
 return (
 <motion.button
 key={cat.id}
 type="button"
 variants={item}
 className="group flex h-16 w-full items-center justify-between rounded-lg border border-border bg-surface px-6 transition-all duration-150 hover:border-white/20 hover:bg-surface-hover focus:outline-none"
 >
 <div className="flex items-center gap-4">
 <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-text-muted transition-colors group-hover:text-white group-hover:bg-white/10">
 <IconifyIcon icon={iconName} className="h-5 w-5" />
 </div>
 <Text 
 as="span" 
 weight="medium"
 className="text-text-muted transition-colors group-hover:text-white"
 >
 {cat.label}
 </Text>
 </div>
 
 <IconifyIcon icon="tabler:chevron-right" className="h-4 w-4 text-text-dim transition-colors duration-150 group-hover:text-white" />
 </motion.button>
 );
 })}
 </motion.div>
 </div>
 </Container>
 </motion.section>
 );
}

