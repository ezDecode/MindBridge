"use client";

import { BreathingExercise } from "@/components/animations";

export default function BreathingDemoPage() {
 return (
 <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
 <BreathingExercise 
 defaultTechnique="box"
 onComplete={() => {
 console.log("Breathing session completed!");
 }}
 />
 </div>
 );
}
