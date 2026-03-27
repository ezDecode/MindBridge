"use client";

import { ElementType, HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: "display" | "heading" | "h1" | "h2" | "h3" | "lead" | "body" | "small" | "label";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted" | "brand" | "success";
  as?: ElementType;
  htmlFor?: string;
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      className = "",
      variant = "body",
      weight = "normal",
      color = "primary",
      as: Component = "p",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      display: "text-[clamp(3rem,7vw,5.5rem)] leading-[0.94] tracking-[-0.06em]",
      heading: "text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.02] tracking-[-0.05em]",
      h1: "text-[clamp(2rem,3.6vw,3.3rem)] leading-[1.03] tracking-[-0.05em]",
      h2: "text-[clamp(1.5rem,2.6vw,2.3rem)] leading-[1.08] tracking-[-0.04em]",
      h3: "text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.15] tracking-[-0.03em]",
      lead: "text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.65] tracking-[-0.02em]",
      body: "text-base leading-[1.7] tracking-[-0.01em]",
      small: "text-sm leading-[1.6]",
      label: "text-[0.82rem] leading-[1.3] tracking-[0.08em] uppercase",
    };

    const weightOptions = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    const colors = {
      primary: "text-[var(--color-text-primary)]",
      secondary: "text-[var(--color-text-secondary)]",
      muted: "text-[var(--color-text-muted)]",
      brand: "text-[var(--color-brand-btn)]",
      success: "text-[var(--color-success)]",
    };

    return (
      <Component
        ref={ref}
        className={cn(variants[variant], weightOptions[weight], colors[color], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export { Text };
export type { TextProps };
