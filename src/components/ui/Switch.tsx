"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, className, disabled }: SwitchProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-btn)] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-200 ease-out",
        checked 
          ? "bg-[var(--color-brand-btn)]" 
          : "bg-[var(--color-gray-300)] hover:bg-[var(--color-gray-400)]",
        className
      )}
    >
      <motion.span
        layout
        animate={{ 
          x: checked ? 20 : 2,
        }}
        transition={{ 
          type: "spring", 
          duration: 0.35, 
          bounce: 0.12,
        }}
        whileTap={{ scale: 0.85 }}
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
      />
    </motion.button>
  );
}
