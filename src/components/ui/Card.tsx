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
 default: "border border-border bg-surface",
 elevated:
 "border border-border bg-surface-raised shadow-md",
 outline: "border border-border bg-transparent",
 subtle: "border border-border/50 bg-white/[0.02]",
 warm: "border border-border bg-surface",
 };

 const paddings = {
 none: "",
 sm: "p-4",
 md: "p-6",
 lg: "p-8 sm:p-10",
 };

 return (
 <div
 ref={ref}
 className={`rounded-lg transition-all duration-150 ease-out ${variants[variant]} ${paddings[padding]} ${interactive ? "hover:border-border-hover hover:bg-surface-hover active:scale-[0.99] cursor-pointer" : ""} ${className}`}
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

