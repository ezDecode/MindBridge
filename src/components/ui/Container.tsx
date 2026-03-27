"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "lg:max-w-[56vw]",
      md: "lg:max-w-[70vw]",
      lg: "lg:max-w-[78vw]",
    };

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            "mx-auto w-full max-w-[calc(100vw-1.5rem)] px-4 sm:max-w-[calc(100vw-3rem)] sm:px-6 lg:px-0",
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
