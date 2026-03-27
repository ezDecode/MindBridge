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
    "bg-[var(--color-black)] text-[var(--color-white)]",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-black)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--color-text-secondary)]",
  brand:
    "bg-[var(--color-black)] text-[var(--color-white)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-full px-3.5 text-sm",
  md: "min-h-11 rounded-full px-4 text-[0.9rem]",
  lg: "min-h-12 rounded-full px-5 text-base",
};

const baseStyles =
  "inline-flex select-none items-center justify-center gap-2 font-medium tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50";

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
    variant === "ghost" && "hover:bg-[var(--color-primary-light)] hover:text-[var(--color-black)]",
    variant === "secondary" && "hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary-light)]",
    variant === "primary" && "hover:bg-[var(--color-text-secondary)]",
    variant === "brand" && "hover:bg-[var(--color-text-secondary)]",
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
