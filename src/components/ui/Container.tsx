"use client";

import { HTMLAttributes, forwardRef } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = "md", children, ...props }, ref) => {
    const sizes = { 
      sm: "max-w-xl", 
      md: "max-w-4xl" 
    };

    return (
      <div ref={ref} className={`mx-auto w-full px-5 md:px-6 ${sizes[size]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };