"use client";

import { ElementType, HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "small" | "label";
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
      h1: "text-h1",
      h2: "text-h2",
      h3: "text-h3",
      h4: "text-h4",
      h5: "text-h5",
      h6: "text-h6",
      body: "text-p",
      small: "text-span",
      label: "text-label",
    };

    const weightOptions = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    const colors = {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      muted: "text-text-muted",
      brand: "text-primary",
      success: "text-success",
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
