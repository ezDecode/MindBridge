"use client";

import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "warm" | "ghost" | "link" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonWeight = "normal" | "medium" | "semibold" | "bold" | "black";

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
 "bg-white text-black hover:bg-white/90 shadow-sm",
 warm:
 "bg-surface-raised text-white border border-border hover:bg-surface-hover hover:border-border-hover",
 ghost:
 "bg-transparent text-text-muted hover:text-white hover:bg-white/5",
 link:
 "bg-transparent text-primary hover:text-primary-hover underline-offset-4 hover:underline p-0 h-auto",
 danger:
 "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
};

const sizeStyles: Record<ButtonSize, string> = {
 sm: "h-8 px-3 typo-ui",
 md: "h-10 px-4 typo-base",
 lg: "h-12 px-6 typo-body",
};

const weightStyles: Record<ButtonWeight, string> = {
 normal: "font-normal",
 medium: "font-medium",
 semibold: "font-semibold",
 bold: "font-bold",
 black: "font-black",
};

const baseStyles =
 "inline-flex shrink-0 items-center justify-center gap-2 rounded-md whitespace-nowrap transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 outline-none active:scale-[0.98] cursor-pointer";

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
 variant === "link" && "active:scale-100 active:opacity-100",
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

