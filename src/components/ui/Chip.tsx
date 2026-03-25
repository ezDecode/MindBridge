"use client";

import { forwardRef, HTMLAttributes } from "react";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-out";
    const variants = {
      default: "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
      outline: "border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent hover:bg-gray-50 hover:border-gray-300",
    };

    return (
      <span ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </span>
    );
  }
);

Chip.displayName = "Chip";

export { Chip };
export type { ChipProps };