"use client";

import { ElementType, HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "small" | "label" | "metric" | "subtitle" | "caption";
  weight?: "normal" | "medium" | "semibold" | "bold" | "black";
  color?: "primary" | "secondary" | "muted" | "brand" | "success" | "danger" | "warning";
  as?: ElementType;
  htmlFor?: string;
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      className = "",
      variant = "body",
      weight,
      color = "primary",
      as: Component,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      metric: "typo-metric font-display tracking-tight leading-none",
      h1: "typo-metric font-display tracking-tight leading-[1.1]",
      h2: "typo-heading font-display tracking-tight leading-[1.2]",
      h3: "typo-subtitle font-display tracking-tight leading-[1.2]",
      subtitle: "typo-subtitle font-display tracking-tight leading-[1.2]",
      h4: "typo-body font-display tracking-tight",
      h5: "typo-base font-display tracking-tight",
      h6: "typo-ui font-display tracking-tight",
      body: "typo-body leading-relaxed",
      small: "typo-ui",
      label: "typo-ui font-medium",
      caption: "text-[12px] leading-tight",
    };

    const defaultWeights = {
      metric: "font-semibold",
      h1: "font-semibold",
      h2: "font-semibold",
      h3: "font-semibold",
      subtitle: "font-medium",
      h4: "font-semibold",
      h5: "font-medium",
      h6: "font-medium",
      body: "font-normal",
      small: "font-normal",
      label: "font-medium",
      caption: "font-medium",
    };

    const defaultElements: Record<string, ElementType> = {
      metric: "div",
      h1: "h1",
      h2: "h2",
      h3: "h3",
      subtitle: "p",
      h4: "h4",
      h5: "h5",
      h6: "h6",
      body: "p",
      small: "span",
      label: "label",
      caption: "span",
    };

    const colors = {
      primary: "text-white",
      secondary: "text-text-muted",
      muted: "text-text-dim",
      brand: "text-primary",
      success: "text-success",
      danger: "text-danger",
      warning: "text-warning",
    };

    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    };

    const FinalComponent = Component || defaultElements[variant] || "p";
    const finalWeight = weight ? weightClasses[weight] : (defaultWeights[variant as keyof typeof defaultWeights] || "font-normal");

    return (
      <FinalComponent
        ref={ref}
        className={cn(
          variants[variant as keyof typeof variants],
          finalWeight,
          colors[color as keyof typeof colors],
          className
        )}
        {...props}
      >
        {children}
      </FinalComponent>
    );
  }
);

Text.displayName = "Text";

export { Text };
export type { TextProps };
