import type { Easing } from "motion";

export const ease: Easing = [0.16, 1, 0.3, 1];

export const sectionReveal = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { duration: 0.5, ease } },
};

export const stagger = {
 visible: { transition: { staggerChildren: 0.08 } },
};

export const item = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { duration: 0.45, ease } },
};
