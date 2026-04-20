"use client";

import { motion } from "motion/react";
import { Icon as IconifyIcon } from '@iconify/react';
import { Container, Text } from "@/components/ui";
import { mindbridgeCategories } from "@/content/mindbridge";
import { sectionReveal, stagger, item } from "./motion";

const StressIcon = () => (
 <svg viewBox="0 0 58 58" className="h-[38px] w-[38px]">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 fill="none"
 stroke="#FFCE00"
 strokeWidth="7"
 d="M9 32.28c0 0 19.158-23.29 19.158-23.29 0 0-5.5 24.444-5.5 24.444 0 0 22.693-24.345 22.693-24.345 0 0-8.833 24.661-8.833 24.661 0 0 14.042-15.31 18.146-15.97"
 />
 </svg>
);

const SleepIcon = () => (
 <svg viewBox="0 0 58 58" className="h-[38px] w-[38px]">
 <path
 fill="#AD85D1"
 d="M28.022 29.354c-10.054-3.942-17.178-13.462-17.386-24.344-.208-1.028-.187-2.034-.083-3.02C10.657 1 9.452.308 8.663 1 3.282 5.592.042 12.616.624 20.417c.81 10.861 9.325 19.878 20.044 21.178 8.6 1.027 16.37-2.747 21.065-9.017.602-.796-.105-1.887-1.081-1.74-4.009.629-8.309.377-12.838-1.405z"
 />
 <path
 fill="#FFA1CC"
 d="M51.558 18.428l-5.077-2.269-2.136-4.871a1.2 1.2 0 00-1.543 0l-2.154 4.914-4.98 2.226a.545.545 0 000 .994l4.957 2.214 2.177 4.967a1.2 1.2 0 001.543 0l2.159-4.924 5.054-2.257a.545.545 0 000-.994z"
 />
 </svg>
);

const AnxietyIcon = () => (
 <svg viewBox="0 0 58 58" className="h-[38px] w-[38px]">
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 fill="none"
 stroke="#00A4FF"
 strokeWidth="5"
 d="M45.693 19.812c-2.23-1.144-4.588-1.835-7-2.204-2.328-.356-4.7-.411-7.043-.164-2.31.244-4.585.78-6.76 1.59-2.174.81-4.246 1.893-6.15 3.218-1.929 1.341-3.686 2.93-5.213 4.716-1.576 1.844-2.904 3.896-3.946 6.086-1.151 2.417-1.876 5.014-2.06 7.687-.166 2.372.085 4.77.73 7.058.643 2.272 1.675 4.433 3.039 6.361 1.39 1.964 3.124 3.68 5.103 5.05 1.088.752 2.249 1.4 3.46 1.933 4.337 1.91 9.261 2.284 13.833 1.033 6.566-1.797 12.515-7.103 14.255-13.81 1.676-6.462-1.736-13.38-7.825-16.065-5.892-2.596-13.01-1.682-16.78 3.545-1.394 1.933-2.377 4.232-1.905 6.643.431 2.205 1.942 4.097 4 5.002 3.495 1.539 7.573-.041 9.112-3.537"
 />
 </svg>
);

const ThoughtsIcon = () => (
 <svg viewBox="0 0 58 58" className="h-[38px] w-[38px]">
 <path
 fill="#FF7300"
 d="M27.134 16.43c7.893-1.737 14.661 3.505 17.331 7.515 2.963 4.448 2.832 11.2-1.423 15.42C34.34 48.916 29.175 50.471 19.332 51.535c-7.584.82-13.684 1.22-19.109-5.728-4.125-5.285-.731-10.943.508-15.109C3.557 21.146 8.589 18.559 18.257 16.43"
 />
 <circle cx="44" cy="18" r="4" fill="#FFA1CC" />
 <circle cx="12" cy="46" r="3" fill="#AD85D1" />
 </svg>
);

const MeditationIcon = () => (
 <svg viewBox="0 0 58 58" className="h-[38px] w-[38px]">
 <circle cx="29" cy="29" r="22.7" fill="#FF9900" />
 <circle cx="29" cy="29" r="15.4" fill="#FF7300" />
 </svg>
);

const TherapyIcon = () => (
 <svg viewBox="0 0 58 58" className="h-[38px] w-[38px]">
 <path
 fill="#FFCE00"
 d="M43.526 18.879H29.97c-.822-8.787-.974-10.121-.974-10.121s-1.685-.384-2.349.716c-5.645 9.352-11.29 18.704-11.29 18.704s-6.56 0-9.324 0c-2.764 0-5.005 2.241-5.005 5.005v20.229c0 2.764 2.241 5.005 5.005 5.005h29.052c2.764 0 5.005-2.241 5.005-5.005v-20.229c0-2.764-2.241-5.005-5.005-5.005"
 />
 <path
 fill="#00A4FF"
 d="M42.052 9.268s-14.104 0-14.104 0c-8.35 0-15.119 6.77-15.119 15.12 0 8.35 6.769 15.12 15.119 15.12s5.527 0 5.527 0 .749 8.013.749 8.013c.119 1.281 1.805 1.666 2.469.566l5.178-8.579s.181 0 .181 0c8.35 0 15.119-6.77 15.119-15.12 0-8.35-6.769-15.12-15.119-15.12z"
 />
 </svg>
);

const categoryIcons: Record<string, React.FC> = {
 stress: StressIcon,
 sleep: SleepIcon,
 anxiety: AnxietyIcon,
 thoughts: ThoughtsIcon,
 meditation: MeditationIcon,
 therapy: TherapyIcon,
};

export function CategoriesSection() {
 return (
 <motion.section 
 className="w-full bg-[var(--color-background)]" 
 initial="hidden" 
 whileInView="visible" 
 viewport={{ once: true, margin: "-80px" }} 
 variants={sectionReveal}
 >
 <Container size="lg">
 <div className="mx-auto w-full max-w-[90rem] px-6 py-16 sm:px-12 sm:pb-32 sm:pt-16">
 <motion.div variants={item} className="mb-8 sm:mb-12">
 <Text 
 as="h2" 
 className="text-[var(--color-text-primary)] font-bold text-center text-2xl sm:text-3xl md:text-4xl"
 >
 What kind of mindbridge are you looking for?
 </Text>
 </motion.div>

 <motion.div 
 className="grid w-full grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3" 
 variants={stagger}
 >
 {mindbridgeCategories.map((cat) => {
 const Icon = categoryIcons[cat.id];
 return (
 <motion.button
 key={cat.id}
 type="button"
 variants={item}
 className="group flex min-h-[4rem] w-full items-center justify-between rounded-md border-[0.125rem] border-[var(--color-border)] bg-white p-3 pl-5 sm:p-2 sm:pl-6 transition-[border-color,background-color] duration-200 hover:border-[var(--color-border-strong)] focus:outline-none"
 >
 <Text 
 as="span" 
 variant="label"
 weight="bold"
 className="text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-primary)]"
 >
 {cat.label}
 </Text>
 
 <div className="flex items-center gap-2">
 {Icon && <Icon />}
 <div className="p-2 text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-primary)]">
 <IconifyIcon icon="tabler:chevron-right" className="h-5 w-5" />
 </div>
 </div>
 </motion.button>
 );
 })}
 </motion.div>
 </div>
 </Container>
 </motion.section>
 );
}

