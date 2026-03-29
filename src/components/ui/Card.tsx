"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "subtle";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "border border-[var(--color-border)] bg-[var(--color-surface)]",
      elevated:
        "border border-[var(--color-border)] bg-[var(--color-surface-warm)]",
      outline: "border border-[var(--color-border)] bg-transparent",
      subtle: "border border-[var(--color-border)] bg-[var(--color-surface-tinted)]",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={`rounded-[var(--radius-card)] ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };
