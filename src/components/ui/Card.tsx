"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "subtle" | "warm";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", padding = "md", interactive = false, children, ...props }, ref) => {
    const variants = {
      default: "border border-[var(--color-border)] bg-[var(--color-surface)]",
      elevated:
        "border border-[var(--color-border)] bg-[var(--color-surface-warm)]",
      outline: "border border-[var(--color-border)] bg-transparent",
      subtle: "border border-[var(--color-border)] bg-[var(--color-surface-tinted)]",
      warm: "border border-amber-200 bg-amber-50",
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
        className={`rounded-[calc(var(--radius-card)*var(--brm))] squircle transition-[border-color,background-color,transform,box-shadow] duration-200 ease-[var(--ease-out)] ${variants[variant]} ${paddings[padding]} ${interactive ? "hover:border-[var(--color-border-strong)] hover:shadow-sm active:scale-[0.99]" : ""} ${className}`}
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
