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
      h1: "text-4xl md:text-5xl font-serif tracking-tight",
      h2: "text-3xl md:text-4xl font-serif tracking-tight",
      h3: "text-xl md:text-2xl font-serif tracking-tight",
      heading: "text-3xl md:text-4xl font-serif tracking-tight",
      body: "text-lg leading-relaxed tracking-tight",
      small: "text-sm tracking-tight",
    };

    const variantWeights: Record<string, string> = {
      h1: "font-bold",
      h2: "font-semibold",
      h3: "font-medium",
      heading: "font-bold",
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
    };

    return (
      <Component ref={ref} className={`${variants[variant]} ${hasFixedWeight ? variantWeights[variant] : weightOptions[weight]} ${colors[color]} ${className}`} {...props}>
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export { Text };
export type { TextProps };