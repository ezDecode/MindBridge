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
        whileTap={disabled ? {} : { scale: 0.97 }}
        onClick={disabled ? undefined : onClick}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200",
          selected
            ? "bg-[var(--color-surface-tinted)] border-[var(--color-brand-btn)] ring-2 ring-[var(--color-brand-btn)]/20"
            : "bg-[var(--color-gray-100)] border-transparent hover:bg-[var(--color-gray-200)]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {icon && (
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
          >
            {icon}
          </motion.div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <span className="block font-medium text-[var(--color-text-primary)]">
            {label}
          </span>
          {sublabel && (
            <span className="text-sm text-[var(--color-text-muted)]">
              {sublabel}
            </span>
          )}
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-[var(--color-brand-btn)] flex items-center justify-center flex-shrink-0"
          >
            <svg
              className="w-3 h-3 text-white"
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