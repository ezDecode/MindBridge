"use client";

import { HTMLAttributes, forwardRef } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = "", size = "md", children, ...props }, ref) => {
    const sizes = { 
      sm: "max-w-[640px]", 
      md: "max-w-[1024px]" 
    };

    return (
      <div ref={ref} className={`mx-auto w-full px-[clamp(1.2rem,4.8vw,1.8rem)] ${sizes[size]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };