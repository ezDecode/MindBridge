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
 "border border-[var(--color-primary)] bg-[var(--color-primary)] !text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] hover:border-[var(--color-primary-dark)] hover:bg-[var(--color-primary-dark)] hover:!text-[var(--color-text-inverse)]",
 warm:
 "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]",
 ghost:
 "border border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text-primary)]",
 link:
 "bg-transparent text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline-offset-4 hover:underline p-0 h-auto",
 danger:
 "border border-[var(--color-danger)] bg-[var(--color-danger)] text-white shadow-[var(--shadow-sm)] hover:bg-[#a75b59] hover:border-[#a75b59]",
};

const sizeStyles: Record<ButtonSize, string> = {
 sm: "h-11 px-4",
 md: "h-12 px-5",
 lg: "h-[3.25rem] px-6",
};

const weightStyles: Record<ButtonWeight, string> = {
 normal: "font-normal",
 medium: "font-medium",
 semibold: "font-semibold",
 bold: "font-bold",
};

const baseStyles =
 "inline-flex shrink-0 items-center justify-center gap-2 rounded-[0.95rem] whitespace-nowrap text-button transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 outline-none";

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

