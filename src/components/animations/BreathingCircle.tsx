"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import type { Easing } from "motion";

export interface BreathingPhase {
 name: string;
 duration: number;
}

interface BreathingCircleProps {
 phase: BreathingPhase | null;
 isActive: boolean;
 progress: number;
 className?: string;
}

const easeUI: Easing = [0.23, 1, 0.32, 1];
const easeInOutMotion: Easing = [0.77, 0, 0.175, 1];

export function BreathingCircle({ phase, isActive, progress, className = "" }: BreathingCircleProps) {
 const controls = useAnimation();

 useEffect(() => {
 if (!isActive || !phase) {
 controls.start({
 scale: 0.8,
 opacity: 0.3,
 transition: { duration: 0.6, ease: easeUI }
 });
 return;
 }

 const isInhale = phase.name.toLowerCase().includes("inhale");
 const targetScale = isInhale ? 1 : 0.6;
 const targetOpacity = isInhale ? 0.7 : 0.3;
 
 controls.start({
 scale: targetScale,
 opacity: targetOpacity,
 transition: {
 duration: phase.duration,
 ease: easeInOutMotion
 },
 });
 }, [isActive, phase, controls]);

 return (
 <div className={`relative ${className}`}>
 <motion.div
 animate={controls}
 initial={{ scale: 0.6, opacity: 0.25 }}
 className="relative w-44 h-44 md:w-52 md:h-52"
 >
 <div 
 className="absolute inset-0 rounded-full"
 style={{
 background: "radial-gradient(circle at 35% 30%, #F9C4A8, #F47D4B 50%, #C4572A)",
 boxShadow: `
 0 0 64px rgba(244, 125, 75, 0.45),
 0 0 120px rgba(244, 125, 75, 0.2),
 inset 0 -12px 28px rgba(0, 0, 0, 0.18),
 inset 0 12px 28px rgba(255, 255, 255, 0.25)
 `,
 }}
 />
 
 <motion.div
 animate={{ opacity: [0.2, 0.4, 0.2] }}
 transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
 className="absolute inset-0 rounded-full"
 style={{
 background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), transparent 55%)",
 }}
 />
 </motion.div>
 
 <div 
 className="absolute inset-0 rounded-full -z-10"
 style={{
 transform: "scale(1.25)",
 background: "radial-gradient(circle, rgba(244, 125, 75, 0.12) 0%, transparent 70%)",
 animation: isActive ? "breathPulse 3s ease-in-out infinite" : "none",
 }}
 />
 </div>
 );
}

export function PhaseIndicator({ 
 phase, 
 timeLeft, 
 isActive 
}: { 
 phase: BreathingPhase | null; 
 timeLeft: number; 
 isActive: boolean 
}) {
 if (!phase) return null;
 
 const phaseColor = phase.name.toLowerCase().includes("inhale") 
 ? "text-[var(--color-primary)]" 
 : phase.name.toLowerCase().includes("exhale")
 ? "text-[var(--color-accent)]"
 : "text-[var(--color-text-secondary)]";

 return (
 <motion.div
 key={phase.name}
 initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
 transition={{ duration: 0.3, ease: easeUI }}
 className="text-center"
 >
 <span 
 className={`text-xl md:text-2xl font-semibold tracking-wide ${phaseColor}`}
 >
 {phase.name}
 </span>
 {isActive && (
 <motion.span
 key={timeLeft}
 initial={{ scale: 1.05, opacity: 0.6, filter: "blur(2px)" }}
 animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
 transition={{ duration: 0.3, ease: easeUI }}
 className="block text-5xl md:text-6xl font-bold mt-3 text-[var(--color-text-primary)] tabular-nums"
 >
 {timeLeft}
 </motion.span>
 )}
 </motion.div>
 );
}
