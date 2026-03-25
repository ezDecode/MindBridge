"use client";

import { forwardRef, ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
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

type PolymorphicComponentProp<T extends ElementType, Props = {}> = {
  as?: T;
} & Props & Omit<ComponentPropsWithoutRef<T>, keyof Props | "as">;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-brand-btn)]/20",
  secondary: "bg-gray-100 text-[var(--color-text-primary)] hover:bg-gray-200 hover:shadow-sm",
  ghost: "text-[var(--color-brand-btn)] hover:bg-[var(--color-brand)]/10",
  brand: "bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-brand-btn)]/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-5 py-1.5 text-sm rounded-full",
  md: "px-7 py-2 text-base rounded-full",
  lg: "px-9 py-2.5 text-lg rounded-full",
};

const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out active:scale-[0.97] select-none";

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
