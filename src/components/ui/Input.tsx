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
 "flex h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] px-4 py-2 text-sm text-[var(--text-primary)] shadow-none ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action-primary-glow)] focus-visible:border-[var(--action-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
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

