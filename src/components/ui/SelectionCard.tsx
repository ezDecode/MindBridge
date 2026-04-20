"use client";

import { motion } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
 selected?: boolean;
 icon?: React.ReactNode;
 label: string;
 sublabel?: string;
 className?: string;
 onClick?: () => void;
 disabled?: boolean;
}

const SelectionCard = forwardRef<HTMLButtonElement, SelectionCardProps>(
 ({ className = "", selected = false, icon, label, sublabel, onClick, disabled }, ref) => {
 return (
 <motion.button
 ref={ref}
 type="button"
 whileTap={disabled ? {} : { opacity: 0.8 }}
 onClick={disabled ? undefined : onClick}
 aria-pressed={selected}
 aria-disabled={disabled}
 className={cn(
 "interactive-panel flex min-h-14 items-center gap-4 rounded-md p-4 text-left focus-visible:outline-none border border-[var(--color-border)]",
 selected
 ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
 : "bg-[var(--color-surface)]",
 disabled && "cursor-not-allowed opacity-50",
 className
 )}
 >
 {icon ? <motion.div className="shrink-0">{icon}</motion.div> : null}
 <div className="min-w-0 flex-1 text-left">
 <span className="block font-semibold text-[var(--color-text-primary)]">
 {label}
 </span>
 {sublabel && (
 <span className="text-span text-[var(--color-text-muted)]">
 {sublabel}
 </span>
 )}
 </div>
 {selected && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]"
 >
 <svg
 className="h-3 w-3 text-[var(--color-white)]"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
 </svg>
 </motion.div>
 )}
 </motion.button>
 );
 }
);

SelectionCard.displayName = "SelectionCard";

export { SelectionCard };
export type { SelectionCardProps };

