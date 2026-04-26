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

import { Text } from "./Text";

const SelectionCard = forwardRef<HTMLButtonElement, SelectionCardProps>(
 ({ className = "", selected = false, icon, label, sublabel, onClick, disabled }, ref) => {
 return (
 <motion.button
 ref={ref}
 type="button"
 whileTap={disabled ? {} : { scale: 0.98 }}
 onClick={disabled ? undefined : onClick}
 aria-pressed={selected}
 aria-disabled={disabled}
 className={cn(
 "group flex min-h-14 items-center gap-4 rounded-md p-4 text-left transition-all duration-150 focus-visible:outline-none border",
 selected
 ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
 : "bg-surface border-border hover:border-white/20 hover:bg-surface-hover",
 disabled && "cursor-not-allowed opacity-40 grayscale",
 className
 )}
 >
 {icon ? (
 <motion.div 
 className={cn(
 "shrink-0 size-10 rounded bg-white/5 flex items-center justify-center transition-colors",
 selected ? "text-primary bg-primary/10" : "text-text-muted group-hover:text-white"
 )}
 >
 {icon}
 </motion.div>
 ) : null}
 <div className="min-w-0 flex-1 text-left">
 <Text 
 weight="semibold" 
 className={cn(
 "block text-[1.0625rem] transition-colors",
 selected ? "text-white" : "text-text-muted group-hover:text-white"
 )}
 >
 {label}
 </Text>
 {sublabel && (
 <Text variant="small" className="text-text-dim text-base font-medium mt-1">
 {sublabel}
 </Text>
 )}
 </div>
 {selected && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20"
 >
 <svg
 className="h-3 w-3 text-black"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 strokeWidth={4}
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

