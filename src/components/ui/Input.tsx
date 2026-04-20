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
 "flex h-12 w-full rounded-[0.95rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-label text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] ring-offset-[var(--color-background)] file:border-0 file:bg-transparent file:text-span file:font-bold placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary-light)] focus-visible:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-[border-color,box-shadow,background-color] duration-200",
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

