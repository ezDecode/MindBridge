"use client";

import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "warm";
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
    "bg-[var(--color-text-primary)] !text-[var(--color-white)] hover:bg-[var(--color-black-dark)] hover:!text-[var(--color-white)]",
  warm:
    "bg-[var(--color-surface-warm-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-warm-active)] hover:text-[var(--color-text-primary)]",
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
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap text-button transition-[background-color,color,box-shadow,opacity] duration-150 ease-[var(--ease-out)] active:opacity-80 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 outline-none";

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
    sizeStyles[size],
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
