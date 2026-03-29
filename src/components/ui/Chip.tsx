"use client";

import { forwardRef, HTMLAttributes } from "react";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className = "", variant = "default", size = "md", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center px-3.5 text-span font-semibold rounded-full transition-[color,background-color,border-color,box-shadow] duration-150 ease-out touch-manipulation";
    const variants = {
      default: "bg-[var(--color-surface-warm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-warm-hover)] hover:shadow-sm",
      outline: "border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent hover:bg-[var(--color-gray-50)] hover:border-[var(--color-gray-300)]",
    };
    const sizes = {
      sm: "py-1",
      md: "py-1.5",
      lg: "py-2",
    };

    return (
      <span ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {children}
      </span>
    );
  }
);

Chip.displayName = "Chip";

export { Chip };
export type { ChipProps };