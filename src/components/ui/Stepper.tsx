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
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={false}
          animate={{
            backgroundColor:
              idx <= currentStep
                ? "var(--color-brand-btn)"
                : "var(--color-gray-300)",
            width: idx === currentStep ? 24 : 8,
          }}
          transition={{
            backgroundColor: { duration: 0.2, ease: easeOut },
            width: { duration: 0.3, ease: easeInOut },
          }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}