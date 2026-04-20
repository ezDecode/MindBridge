"use client";

import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "warm" | "ghost" | "link" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonWeight = "normal" | "medium" | "semibold" | "bold";

interface ButtonProps<T extends ElementType = "button"> {
 as?: T;
 variant?: ButtonVariant;
 size?: ButtonSize;
 weight?: ButtonWeight;
 children: ReactNode;
 className?: string;
 href?: string;
}

type PolymorphicComponentProp<T extends ElementType, Props = object> = {
 as?: T;
} & Props & Omit<ComponentPropsWithoutRef<T>, keyof Props | "as">;

const variantStyles: Record<ButtonVariant, string> = {
 primary:
 "border-none bg-[var(--color-accent-electric)] text-white hover:bg-[var(--color-accent-electricHover)] shadow-none hover:shadow-none",
 warm:
 "border border-[var(--color-base-border)] bg-[var(--color-base-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-base-hover)] shadow-none hover:shadow-none",
 ghost:
 "border-none bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-base-hover)] hover:text-[var(--color-text-primary)]",
 link:
 "bg-transparent text-[var(--color-accent-electricLight)] hover:text-[var(--color-accent-electric)] underline-offset-4 hover:underline p-0 h-auto",
 danger:
 "border border-red-900 bg-red-950 text-white shadow-none hover:bg-red-900",
};

const sizeStyles: Record<ButtonSize, string> = {
 sm: "h-9 px-4 text-sm",
 md: "h-11 px-5 text-sm",
 lg: "h-12 px-6 text-sm",
};

const weightStyles: Record<ButtonWeight, string> = {
 normal: "font-normal",
 medium: "font-medium",
 semibold: "font-semibold",
 bold: "font-bold",
};

const baseStyles =
 "inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none";

export function Button<T extends ElementType = "button">({
 as,
 variant = "primary",
 size = "md",
 weight = "bold",
 className = "",
 href,
 children,
 ...props
}: PolymorphicComponentProp<T, ButtonProps<T>>) {
 const Component = as || "button";
 const isLink = Component === "a" || href;
 const sharedClassName = cn(
 baseStyles,
 variantStyles[variant],
 variant !== "link" && sizeStyles[size],
 weightStyles[weight],
 className
 );

 if (isLink && href) {
 return (
 <Link href={href} className={sharedClassName}>
 {children}
 </Link>
 );
 }

 return (
 <Component
 className={sharedClassName}
 {...(Component === "button" ? { type: "button" } : {})}
 {...props}
 >
 {children}
 </Component>
 );
}

Button.displayName = "Button";

