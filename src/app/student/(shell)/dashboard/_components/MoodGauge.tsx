"use client";

import { useState, useEffect, useId } from "react";
import { useMotionValue, useSpring } from "motion/react";

export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
 const motionVal = useMotionValue(0);
 const spring = useSpring(motionVal, { damping: 40, stiffness: 120 });
 const [display, setDisplay] = useState("0");

 useEffect(() => {
 motionVal.set(value);
 }, [value, motionVal]);

 useEffect(() => {
 const unsub = spring.on("change", (v) => {
 setDisplay(v.toFixed(decimals));
 });
 return unsub;
 }, [spring, decimals]);

 return <>{display}</>;
}

function getMoodLabel(value: number): string {
 if (value <= 0) return "No data";
 if (value <= 1.5) return "Very low";
 if (value <= 2.5) return "Strained";
 if (value <= 3.5) return "Steady";
 if (value <= 4.5) return "Good";
 return "Excellent";
}

function getMoodColor(value: number): string {
 if (value <= 1.5) return "#ef4444";
 if (value <= 2.5) return "#f59e0b";
 if (value <= 3.5) return "#B58863";
 if (value <= 4.5) return "#739552";
 return "#22c55e";
}

export function MoodGauge({ value, max = 5, size = 140 }: { value: number; max?: number; size?: number }) {
 const gradientId = useId();
 const percent = Math.min((value / max) * 100, 100);
 const motionVal = useMotionValue(0);
 const spring = useSpring(motionVal, { damping: 50, stiffness: 100 });
 const [animPercent, setAnimPercent] = useState(0);

 useEffect(() => {
 motionVal.set(percent);
 }, [percent, motionVal]);

 useEffect(() => {
 const unsub = spring.on("change", (v) => setAnimPercent(v));
 return unsub;
 }, [spring]);

 const circleSize = 120;
 const strokeWidth = 12;
 const radius = circleSize / 2 - strokeWidth / 2;
 const circumference = 2 * Math.PI * radius;

 // Semicircle: only use half the circumference
 const semiCircumference = circumference / 2;
 const dashFilled = (animPercent / 100) * semiCircumference;

 const moodColor = getMoodColor(value);
 const moodLabel = getMoodLabel(value);

 return (
 <div className="relative inline-flex flex-col items-center">
 <div className="relative" style={{ width: size, height: size * 0.65 }}>
 <svg
 width={size}
 height={size * 0.65}
 viewBox={`0 0 ${circleSize} ${circleSize * 0.65}`}
 fill="none"
 >
 <defs>
 <linearGradient id={`mood-grad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
 <stop offset="0%" stopColor="#f59e0b" />
 <stop offset="50%" stopColor="#B58863" />
 <stop offset="100%" stopColor="#739552" />
 </linearGradient>
 </defs>
 {/* Background track */}
 <path
 d={`M ${strokeWidth / 2} ${circleSize * 0.6} A ${radius} ${radius} 0 0 1 ${circleSize - strokeWidth / 2} ${circleSize * 0.6}`}
 stroke="var(--surface-strong)"
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 fill="none"
 />
 {/* Filled arc */}
 <path
 d={`M ${strokeWidth / 2} ${circleSize * 0.6} A ${radius} ${radius} 0 0 1 ${circleSize - strokeWidth / 2} ${circleSize * 0.6}`}
 stroke={`url(#mood-grad-${gradientId})`}
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 fill="none"
 strokeDasharray={`${dashFilled} ${semiCircumference}`}
 style={{
 filter: `drop-shadow(0 0 6px ${moodColor}40)`,
 transition: "stroke-dasharray 0.3s ease",
 }}
 />
 </svg>
 {/* Center text overlay */}
 <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
 <span className="text-[2rem] font-bold leading-none text-[var(--text-primary)]">
 <AnimatedNumber value={value} decimals={1} />
 </span>
 <span className="mt-1 text-base font-medium text-[var(--text-muted)]">out of {max}</span>
 </div>
 </div>
 {/* Label below */}
 <span
 className="mt-1 rounded-full px-3 py-1 text-base font-medium "
 style={{
 color: moodColor,
 backgroundColor: `${moodColor}15`,
 }}
 >
 {moodLabel}
 </span>
 </div>
 );
}
