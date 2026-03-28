"use client";

import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "warm";
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
    "bg-[var(--color-black)] !text-[var(--color-white)] hover:bg-[var(--color-black-dark)] hover:!text-[var(--color-white)]",
  warm:
    "bg-[#F3EDE8] text-[var(--color-text-primary)] hover:bg-[#EAE0D5] hover:text-[var(--color-text-primary)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4",
  md: "h-11 px-5",
  lg: "h-[3.25rem] px-6",
};

const baseStyles =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap text-button font-bold transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out)] active:translate-y-px disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 [&_svg]:shrink-0 outline-none";

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
