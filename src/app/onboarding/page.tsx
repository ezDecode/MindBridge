"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/stores/useUserStore";
import { OnboardingStepContent } from "./_components/OnboardingStepContent";
import { STEPS } from "./_components/onboardingConfig";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { GrassFlower } from "@/constants/assets";

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function OnboardingPage() {
  const router = useRouter();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const { nickname, isAnonymous, focusAreas, initialMood } = useUserStore();

  const step = STEPS[currentStep];

  const canProceed = (() => {
    switch (step.id) {
      case "name":
        return isAnonymous || nickname.trim().length > 0;
      case "focus":
        return focusAreas.length > 0;
      case "mood":
        return initialMood !== null;
      case "welcome":
        return true;
      default:
        return true;
    }
  })();

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > currentStep ? 1 : -1);
    setCurrentStep(nextStep);
  };

  const handlePrimaryAction = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      router.push("/");
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-[var(--color-background)] to-[var(--color-surface)]">
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-md px-6">
        <div className="w-full">
          <div className="flex items-center gap-3">
            <Stepper
              totalSteps={STEPS.length}
              currentStep={currentStep}
              className="justify-start"
            />
            <span className="text-xs text-[var(--color-text-muted)]">
              {currentStep + 1}/{STEPS.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.h2
              key={step.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="mt-6 text-2xl font-semibold leading-tight text-[var(--color-text-primary)]"
            >
              {step.title}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`${step.id}-subtitle`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: easeOut, delay: 0.04 }}
              className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]"
            >
              {step.subtitle}
            </motion.p>
          </AnimatePresence>

          <div className="mt-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step.id}
                custom={direction}
                initial={shouldReduceMotion ? false : { opacity: 0, x: direction * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, x: direction * -16 }}
                transition={{ duration: 0.2, ease: easeOut }}
              >
                <OnboardingStepContent stepId={step.id} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-md px-6 pb-8 pt-4 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToStep(currentStep - 1)}
          className={`gap-1.5 ${currentStep === 0 ? "invisible" : ""}`}
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="brand"
          size="sm"
          onClick={handlePrimaryAction}
          disabled={!canProceed}
          className="gap-1.5"
        >
          {isLastStep ? "Get Started" : "Continue"}
          <FiArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <GrassFlower className="pointer-events-none w-full shrink-0" />
    </div>
  );
}
