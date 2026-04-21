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
 default: "border border-[var(--border-default)] bg-[var(--surface-default)] shadow-none",
 elevated:
 "border border-[var(--border-default)] bg-[var(--surface-default)] shadow-none",
 outline: "border border-[var(--border-default)] bg-transparent",
 subtle: "border border-[var(--border-default)] bg-[var(--bg-hover)] shadow-none",
 warm: "border border-[var(--border-default)] bg-[var(--surface-default)] shadow-none",
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
 className={`rounded-xl transition-colors duration-200 ${variants[variant]} ${paddings[padding]} ${interactive ? "hover:border-[var(--action-primary)] " : ""} ${className}`}
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

