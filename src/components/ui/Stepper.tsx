"use client";

import { motion } from "motion/react";
import type { Easing } from "motion";

interface StepperProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

const easeOut: Easing = [0.23, 1, 0.32, 1];
const easeInOut: Easing = [0.77, 0, 0.175, 1];

export function Stepper({ totalSteps, currentStep, className = "" }: StepperProps) {
  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      role="progressbar"
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep + 1}
    >
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;

        return (
          <motion.div
            key={idx}
            initial={false}
            animate={{
              backgroundColor: isCompleted || isActive
                ? "var(--color-black)"
                : "var(--color-gray-300)",
              width: isActive ? 20 : 6,
              opacity: isCompleted || isActive ? 1 : 0.5,
            }}
            transition={{
              backgroundColor: { duration: 0.15, ease: easeOut },
              width: { duration: 0.2, ease: easeInOut },
              opacity: { duration: 0.15, ease: easeOut },
            }}
            className="h-1.5 rounded-full"
          />
        );
      })}
      <span className="sr-only">{`Step ${currentStep + 1} of ${totalSteps}`}</span>
    </div>
  );
}
