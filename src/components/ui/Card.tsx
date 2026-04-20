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
 default: "border border-[var(--color-base-border)] bg-[var(--color-base-card)] shadow-none",
 elevated:
 "border border-[var(--color-base-border)] bg-[var(--color-base-card)] shadow-none",
 outline: "border border-[var(--color-base-border)] bg-transparent",
 subtle: "border border-[var(--color-base-border)] bg-[var(--color-base-hover)] shadow-none",
 warm: "border border-[var(--color-base-border)] bg-[var(--color-base-card)] shadow-none",
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
 className={`rounded-xl transition-colors duration-200 ${variants[variant]} ${paddings[padding]} ${interactive ? "hover:border-[var(--color-accent-electric)] " : ""} ${className}`}
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

