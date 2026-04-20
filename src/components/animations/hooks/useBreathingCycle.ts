"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type BreathingTechnique = 
 | "box" 
 | "four-seven-eight" 
 | "physiological-sigh";

export interface TechniqueConfig {
 id: BreathingTechnique;
 name: string;
 description: string;
 phases: BreathingPhase[];
 cycles: number;
 totalDuration: number;
}

export interface BreathingPhase {
 name: string;
 duration: number;
}

const TECHNIQUES: Record<BreathingTechnique, Omit<TechniqueConfig, "id">> = {
 box: {
 name: "Box Breathing",
 description: "Used by Navy SEALs for focus and calm. Equal timing for inhale, hold, exhale, hold.",
 phases: [
 { name: "Inhale", duration: 4 },
 { name: "Hold", duration: 4 },
 { name: "Exhale", duration: 4 },
 { name: "Hold", duration: 4 },
 ],
 cycles: 5,
 totalDuration: 80,
 },
 "four-seven-eight": {
 name: "4-7-8 Breathing",
 description: "Dr. Andrew Weil's technique for deep relaxation, anxiety relief, and better sleep.",
 phases: [
 { name: "Inhale", duration: 4 },
 { name: "Hold", duration: 7 },
 { name: "Exhale", duration: 8 },
 ],
 cycles: 4,
 totalDuration: 76,
 },
 "physiological-sigh": {
 name: "Physiological Sigh",
 description: "Stanford-proven fastest way to calm down. Double inhale + long exhale.",
 phases: [
 { name: "Inhale", duration: 2.5 },
 { name: "Inhale", duration: 2.5 },
 { name: "Exhale", duration: 5 },
 ],
 cycles: 5,
 totalDuration: 50,
 },
};

export function useBreathingCycle(
 techniqueId: BreathingTechnique,
 onCycleComplete?: () => void
) {
 const [isActive, setIsActive] = useState(false);
 const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
 const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
 const [cycleCount, setCycleCount] = useState(0);
 const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
 const intervalRef = useRef<NodeJS.Timeout | null>(null);
 const startTimeRef = useRef<number>(0);

 const technique = TECHNIQUES[techniqueId];
 const currentPhase = technique.phases[currentPhaseIndex];

 const start = useCallback(() => {
 setIsActive(true);
 setCurrentPhaseIndex(0);
 setPhaseTimeLeft(technique.phases[0].duration);
 setCycleCount(0);
 setTotalTimeElapsed(0);
 startTimeRef.current = Date.now();
 }, [technique.phases]);

 const pause = useCallback(() => {
 setIsActive(false);
 }, []);

 const reset = useCallback(() => {
 setIsActive(false);
 setCurrentPhaseIndex(0);
 setPhaseTimeLeft(technique.phases[0].duration);
 setCycleCount(0);
 setTotalTimeElapsed(0);
 }, [technique.phases]);

 useEffect(() => {
 if (!isActive) {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 return;
 }

 intervalRef.current = setInterval(() => {
 setPhaseTimeLeft((prev) => {
 const newTime = prev - 0.1;
 
 setTotalTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
 
 if (newTime <= 0) {
 const nextPhaseIndex = currentPhaseIndex + 1;
 
 if (nextPhaseIndex >= technique.phases.length) {
 const nextCycle = cycleCount + 1;
 if (nextCycle >= technique.cycles) {
 setIsActive(false);
 onCycleComplete?.();
 return 0;
 }
 setCycleCount(nextCycle);
 setCurrentPhaseIndex(0);
 return technique.phases[0].duration;
 }
 
 setCurrentPhaseIndex(nextPhaseIndex);
 return technique.phases[nextPhaseIndex].duration;
 }
 
 return newTime;
 });
 }, 100);

 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 }
 };
 }, [isActive, currentPhaseIndex, cycleCount, technique, onCycleComplete]);

 const progress = currentPhase 
 ? 1 - (phaseTimeLeft / currentPhase.duration)
 : 0;

 return {
 isActive,
 currentPhase,
 phaseTimeLeft: Math.ceil(phaseTimeLeft),
 cycleCount,
 totalCycles: technique.cycles,
 totalTimeElapsed,
 progress,
 technique,
 start,
 pause,
 reset,
 };
}

export { TECHNIQUES };