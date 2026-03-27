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
      display: "text-[clamp(3.2rem,6vw,5.33rem)] leading-[0.95] tracking-[-0.04em] text-center",
      heading: "text-[clamp(2.4rem,4.5vw,4rem)] leading-[1.02] tracking-[-0.03em] text-center",
      h1: "text-[clamp(2rem,3.5vw,3rem)] leading-[1.05] tracking-[-0.03em] text-center",
      h2: "text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.12] tracking-[-0.02em] text-center",
      h3: "text-[clamp(1.2rem,1.8vw,1.68rem)] leading-[1.2] tracking-[-0.02em]",
      lead: "text-[1.25rem] leading-[1.65] tracking-[-0.01em]",
      body: "text-[1.25rem] leading-[1.7] tracking-[-0.01em]",
      small: "text-[0.9375rem] leading-[1.6]",
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
      brand: "text-[var(--color-primary)]",
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
