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
 default: "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]",
 elevated:
 "border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface),var(--color-primary-light)_38%)_0%,var(--color-surface)_100%)] shadow-[var(--shadow-md)]",
 outline: "border border-[var(--color-border)] bg-transparent",
 subtle: "border border-[var(--color-border)] bg-[var(--color-surface-tinted)] shadow-[var(--shadow-sm)]",
 warm: "border border-[var(--color-border)] bg-[var(--color-surface-warm)] shadow-[var(--shadow-sm)]",
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
 className={`rounded-[1.25rem] transition-[border-color,background-color,transform,box-shadow] duration-200 ease-[var(--ease-out)] ${variants[variant]} ${paddings[padding]} ${interactive ? "hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] active:scale-[0.99]" : ""} ${className}`}
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

