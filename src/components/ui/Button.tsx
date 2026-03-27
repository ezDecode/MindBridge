"use client";

import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";

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
  primary: "bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-brand-btn)]/20 active:shadow-none",
  secondary: "bg-[var(--color-brand)]/20 text-[var(--color-brand-btn)] hover:bg-[var(--color-brand)]/30 active:bg-[var(--color-brand)]/40",
  ghost: "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-btn)] hover:bg-[var(--color-brand)]/10 active:bg-[var(--color-brand)]/15",
  brand: "bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-brand-btn)]/20 active:shadow-none",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-sm rounded-full",
  md: "px-7 py-2.5 text-base rounded-full",
  lg: "px-9 py-3 text-lg rounded-full",
};

const baseStyles = "inline-flex items-center justify-center font-semibold transition-transform duration-160 ease-out active:scale-[0.97] select-none cursor-pointer";

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

  if (isLink && href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Component
      as={as}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

Button.displayName = "Button";
