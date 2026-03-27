"use client";

import { HTMLAttributes, forwardRef } from "react";

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: "heading" | "h1" | "h2" | "h3" | "body" | "small";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted";
  as?: "p" | "h1" | "h2" | "h3" | "span";
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className = "", variant = "body", weight = "normal", color = "primary", as: Component = "p", children, ...props }, ref) => {
    
    const hasFixedWeight = ["h1", "h2", "h3", "heading"].includes(variant);
    
    const variants = {
      h1: "tracking-tight",
      h2: "tracking-tight",
      h3: "tracking-tight",
      heading: "tracking-tight",
      body: "leading-relaxed tracking-tight",
      small: "tracking-tight",
    };

    const variantSizes: Record<string, string> = {
      h1: "text-[clamp(2.25rem,5vw,3.75rem)]",
      h2: "text-[clamp(1.75rem,4vw,2.5rem)]",
      h3: "text-[clamp(1.125rem,2.5vw,1.5rem)]",
      heading: "text-[clamp(1.75rem,4vw,2.5rem)]",
      body: "text-[clamp(1rem,2vw,1.125rem)]",
      small: "text-sm",
    };

    const variantWeights: Record<string, string> = {
      h1: "font-semibold",
      h2: "font-semibold",
      h3: "font-semibold",
      heading: "font-semibold",
    };

    const weightOptions = {
      normal: "font-normal",
      medium: "font-semibold",
      semibold: "font-semibold",
      bold: "font-semibold",
    };

    const colors = {
      primary: "text-[var(--color-text-primary)]",
      secondary: "text-[var(--color-text-secondary)]",
      muted: "text-[var(--color-text-muted)]",
    };

    return (
      <Component ref={ref} className={`${variants[variant]} ${variantSizes[variant]} ${hasFixedWeight ? variantWeights[variant] : weightOptions[weight]} ${colors[color]} ${className}`} {...props}>
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export { Text };
export type { TextProps };