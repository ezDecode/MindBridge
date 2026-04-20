"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
 "flex h-11 w-full rounded-xl border border-[var(--color-base-border)] bg-[var(--color-base-card)] px-4 py-2 text-sm text-[var(--color-text-primary)] shadow-none ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-electricGlow)] focus-visible:border-[var(--color-accent-electric)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
 className
 )}
 ref={ref}
 {...props}
 />
 );
 }
);
Input.displayName = "Input";

export { Input };

