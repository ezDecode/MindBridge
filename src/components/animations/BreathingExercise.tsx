"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Easing } from "motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import { useBreathingCycle, TECHNIQUES, type BreathingTechnique } from "./hooks/useBreathingCycle";
import { BreathingCircle, PhaseIndicator } from "./BreathingCircle";

export interface BreathingExerciseProps {
 defaultTechnique?: BreathingTechnique;
 onComplete?: () => void;
 className?: string;
}

const ease: Easing = [0.16, 1, 0.3, 1]; // Matches --ease-out

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease }
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease }}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </motion.div>
              </div>
              <h2 className="text-2xl font-semibold text-white tracking-tight leading-tight">
                Breathe & Relax
              </h2>
              <p className="text-text-muted text-sm max-w-[240px] mx-auto leading-relaxed">
                Choose a technique and follow the gentle visual guide
              </p>
            </motion.div>

            <div className="space-y-2">
              {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map((tech, index) => (
                <motion.button
                  key={tech}
                  variants={fadeInUp}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, ease }}
                  onClick={() => setTechnique(tech)}
                  className={`w-full p-4 rounded-lg border transition-all duration-150 text-left active:scale-[0.99] ${
                    technique === tech
                      ? "border-primary/40 bg-primary/10 shadow-sm"
                      : "border-border bg-surface hover:border-white/20 hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold block transition-colors ${technique === tech ? "text-white" : "text-text-muted"}`}>
                        {TECHNIQUES[tech].name}
                      </span>
                      <p className="text-[11px] text-text-dim mt-1 truncate">
                        {TECHNIQUES[tech].description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3 shrink-0 tabular-nums">
                      <span className="text-[9px] font-medium text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {TECHNIQUES[tech].cycles} cycles
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
                Start Practice
              </Button>
            </motion.div>
          </motion.div>
        ) : completedCycles > 0 ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="text-center py-10"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">
              Well Done
            </h3>
            <p className="text-text-muted text-sm mb-10 leading-relaxed">
              You&apos;ve successfully completed {completedCycles} mindful breathing cycles
            </p>
            <Button onClick={handleReset} variant="warm" size="lg" className="px-10">
              Practice Again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="exercise"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full mb-10">
              <button
                onClick={handleReset}
                className="p-2.5 rounded-md bg-surface border border-border text-text-muted hover:text-white hover:bg-surface-hover transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 px-4 py-1.5 bg-surface rounded-md border border-border tabular-nums">
                <span className="text-[10px] font-medium text-white ">
                  Cycle {cycleCount + 1} <span className="text-text-dim">/ {totalCycles}</span>
                </span>
              </div>
              
              <button
                onClick={() => {
                  const keys = Object.keys(TECHNIQUES) as BreathingTechnique[];
                  const currentIndex = keys.indexOf(technique);
                  const nextIndex = (currentIndex + 1) % keys.length;
                  setTechnique(keys[nextIndex]);
                  reset();
                  setShowInstructions(true);
                }}
                className="p-2.5 rounded-md bg-surface border border-border text-text-muted hover:text-white hover:bg-surface-hover transition-all"
                title="Change technique"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease }}
                className="mb-12"
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

            <div className="flex items-center justify-center gap-4 mt-12 w-full">
              <Button
                onClick={isActive ? pause : start}
                variant="warm"
                size="lg"
                className="flex-1"
              >
                {isActive ? "Pause" : cycleCount > 0 ? "Resume" : "Start"}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="ghost"
                size="lg"
                className="flex-1"
              >
                Reset
              </Button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-text-dim font-medium text-[10px] tabular-nums">
              <Icon icon="tabler:clock" className="h-3 w-3" />
              <span>{formatTime(totalTimeElapsed)} / {formatTime(currentTechnique.totalDuration)}</span>
            </div>

            <div className="w-full mt-6 h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{ 
                  width: `${((cycleCount + (currentPhase ? (1 - phaseTimeLeft / currentPhase.duration) : 0) / currentTechnique.phases.length) / totalCycles) * 100}%` 
                }}
                transition={{ duration: 0.4, ease }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
