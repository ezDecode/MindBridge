"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-surface-strong)]",
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

Skeleton.displayName = "Skeleton";
SkeletonText.displayName = "SkeletonText";
