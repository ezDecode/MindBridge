"use client";

import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "brand";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps<T extends ElementType = "button"> {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  href?: string;
}

type PolymorphicComponentProp<T extends ElementType, Props = object> = {
  as?: T;
} & Props & Omit<ComponentPropsWithoutRef<T>, keyof Props | "as">;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-[var(--color-brand-foreground)] shadow-[var(--shadow-line),0_18px_35px_-24px_rgba(99,71,181,0.7)]",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-line)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--color-text-secondary)]",
  brand:
    "border border-transparent bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-[var(--color-brand-foreground)] shadow-[var(--shadow-line),0_18px_35px_-24px_rgba(99,71,181,0.7)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 rounded-full px-4 text-sm",
  md: "min-h-12 rounded-full px-5 text-[0.95rem]",
  lg: "min-h-[3.25rem] rounded-full px-6 text-base",
};

const baseStyles =
  "inline-flex select-none items-center justify-center gap-2 font-medium tracking-[-0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-out)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-btn)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50";

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
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
    sizeStyles[size],
    "hover-lift",
    variant === "ghost" && "hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand-btn)]",
    variant === "secondary" && "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-tinted)]",
    (variant === "primary" || variant === "brand") &&
      "hover:shadow-[var(--shadow-line),0_24px_45px_-28px_rgba(99,71,181,0.82)]",
    className
  );

  if (isLink && href) {
    return (
      <Link
        href={href}
        className={sharedClassName}
      >
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
