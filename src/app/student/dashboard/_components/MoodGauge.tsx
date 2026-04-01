"use client";

import { useState, useEffect } from "react";
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

export function MoodGauge({ value, max = 5, size = 120 }: { value: number; max?: number; size?: number }) {
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

  const circleSize = 100;
  const strokeWidth = 10;
  const radius = circleSize / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dasharray = `${(animPercent / 100) * circumference} ${circumference}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        fill="none"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="var(--color-surface-strong)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dasharray}
          strokeDashoffset={0}
          style={{
            filter: "drop-shadow(0 0 4px var(--color-primary))",
            transition: "stroke-dasharray 0.1s ease",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-h4 font-bold text-[var(--color-text-primary)]">
          <AnimatedNumber value={value} decimals={1} />
        </span>
        <span className="text-span text-[var(--color-text-muted)]">/ {max}</span>
      </div>
    </div>
  );
}
