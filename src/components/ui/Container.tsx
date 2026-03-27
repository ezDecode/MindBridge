"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "max-w-[46rem]",
      md: "max-w-[76rem]",
      lg: "max-w-[84rem]",
    };

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            "mx-auto w-full px-4 sm:px-6 lg:px-8",
            sizes[size],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };
