"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Easing } from "motion";
import { Button } from "@/components/ui/Button";
import { useBreathingCycle, TECHNIQUES, type BreathingTechnique } from "./hooks/useBreathingCycle";
import { BreathingCircle, PhaseIndicator } from "./BreathingCircle";

export interface BreathingExerciseProps {
  defaultTechnique?: BreathingTechnique;
  onComplete?: () => void;
  className?: string;
}

const ease: Easing = [0.23, 1, 0.32, 1]; // Strong ease-out
const springTransition = { type: "spring", stiffness: 400, damping: 30 };

const fadeInUp = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease }
  }
};

export function BreathingExercise({ 
  defaultTechnique = "box", 
  onComplete,
  className = "" 
}: BreathingExerciseProps) {
  const [technique, setTechnique] = useState<BreathingTechnique>(defaultTechnique);
  const [showInstructions, setShowInstructions] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  const {
    isActive,
    currentPhase,
    phaseTimeLeft,
    cycleCount,
    totalCycles,
    totalTimeElapsed,
    progress,
    technique: currentTechnique,
    start,
    pause,
    reset,
  } = useBreathingCycle(technique, () => {
    setCompletedCycles(totalCycles);
    onComplete?.();
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setShowInstructions(false);
    setCompletedCycles(0);
    start();
  };

  const handleReset = () => {
    reset();
    setShowInstructions(true);
    setCompletedCycles(0);
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        {showInstructions && !isActive && completedCycles === 0 ? (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(2px)" }}
            transition={{ duration: 0.3, ease }}
            className="space-y-6"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-lg">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Breathe & Relax
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm max-w-[260px] mx-auto">
                Choose a technique and follow the visual guide
              </p>
            </motion.div>

            <div className="space-y-3">
              {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map((tech, index) => (
                <motion.button
                  key={tech}
                  variants={fadeInUp}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setTechnique(tech)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                    technique === tech
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[var(--color-text-primary)] block">
                        {TECHNIQUES[tech].name}
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
                        {TECHNIQUES[tech].description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-gray-100)] px-2.5 py-1 rounded-full">
                        {TECHNIQUES[tech].cycles} cycles
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        ~{Math.floor(TECHNIQUES[tech].totalDuration / 60)}min
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.div variants={fadeInUp}>
              <Button 
                onClick={handleStart}
                className="w-full"
                size="lg"
              >
                Start Breathing
              </Button>
            </motion.div>
          </motion.div>
        ) : completedCycles > 0 ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--color-success)] to-[var(--color-primary)] flex items-center justify-center shadow-xl mb-5"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              Well Done
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              You completed {completedCycles} breathing cycles
            </p>
            <Button onClick={handleReset} variant="warm" size="lg">
              Practice Again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="exercise"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="p-2.5 rounded-full bg-[var(--color-surface-warm)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-warm)] rounded-full border border-[var(--color-border)]">
                <motion.span
                  key={cycleCount}
                  initial={{ scale: 1.05, opacity: 0.5, filter: "blur(2px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.3, ease }}
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  Cycle {cycleCount + 1}
                </motion.span>
                <span className="text-[var(--color-text-muted)]">/</span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {totalCycles}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const keys = Object.keys(TECHNIQUES) as BreathingTechnique[];
                  const currentIndex = keys.indexOf(technique);
                  const nextIndex = (currentIndex + 1) % keys.length;
                  setTechnique(keys[nextIndex]);
                  reset();
                  setShowInstructions(true);
                }}
                className="p-2.5 rounded-full bg-[var(--color-surface-warm)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
                title="Change technique"
              >
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <motion.div
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease }}
                className="mb-8"
              >
                <BreathingCircle
                  phase={currentPhase}
                  isActive={isActive}
                  progress={progress}
                />
              </motion.div>
              
              <PhaseIndicator
                phase={currentPhase}
                timeLeft={phaseTimeLeft}
                isActive={isActive}
              />
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                onClick={isActive ? pause : start}
                variant={isActive ? "warm" : "primary"}
                size="lg"
                className="min-w-[130px]"
              >
                {isActive ? "Pause" : cycleCount > 0 ? "Resume" : "Start"}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="ghost"
                size="lg"
              >
                Reset
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm tabular-nums">{formatTime(totalTimeElapsed)}</span>
              <span className="text-sm">/ {formatTime(currentTechnique.totalDuration)}</span>
            </div>

            <div className="w-full mt-4 h-1.5 rounded-full bg-[var(--color-gray-200)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)]"
                animate={{ 
                  width: `${((cycleCount + (currentPhase ? (1 - phaseTimeLeft / currentPhase.duration) : 0) / currentTechnique.phases.length) / totalCycles) * 100}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}