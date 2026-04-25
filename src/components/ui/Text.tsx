"use client";

import { ElementType, HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextProps extends HTMLAttributes<HTMLElement> {
 variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "small" | "label";
 weight?: "normal" | "medium" | "semibold" | "bold" | "black";
 color?: "primary" | "secondary" | "muted" | "brand" | "success" | "chess";
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
 h1: "text-4xl sm:text-5xl md:text-6xl font-display tracking-tight leading-[1.1]",
 h2: "text-3xl sm:text-4xl font-display tracking-tight leading-[1.2]",
 h3: "text-2xl sm:text-3xl font-display tracking-tight leading-[1.2]",
 h4: "text-xl sm:text-2xl font-display tracking-tight",
 h5: "text-lg sm:text-xl font-display tracking-tight",
 h6: "text-base sm:text-lg font-display tracking-tight",
 body: "text-base leading-relaxed",
 small: "text-sm",
 label: "text-xs font-medium ",
 };

 const weightOptions = {
 normal: "font-normal",
 medium: "font-medium",
 semibold: "font-semibold",
 bold: "font-bold",
 black: "font-black",
 };

 const colors = {
 primary: "text-white",
 secondary: "text-text-muted",
 muted: "text-text-dim",
 brand: "text-primary",
 success: "text-success",
 chess: "text-white",
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

