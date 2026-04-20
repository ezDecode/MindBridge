"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Text } from "@/components/ui";

const moodOptions = [
 { label: "Very low", score: 1, note: "Struggling to get through the day", emoji: "😔" },
 { label: "Low", score: 2, note: "Heavy, but managing", emoji: "😕" },
 { label: "Okay", score: 3, note: "Getting by, not great not bad", emoji: "😐" },
 { label: "Good", score: 4, note: "Feeling positive", emoji: "🙂" },
 { label: "Great", score: 5, note: "Energised and hopeful", emoji: "😊" },
];

interface CheckInModalProps {
 isOpen: boolean;
 onClose: () => void;
 onComplete?: () => void;
}

export function CheckInModal({ isOpen, onClose, onComplete }: CheckInModalProps) {
 const [selectedMood, setSelectedMood] = useState<number | null>(null);
 const [note, setNote] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [isSaved, setIsSaved] = useState(false);

 useEffect(() => {
 if (!isOpen) {
 setSelectedMood(null);
 setNote("");
 setIsSaved(false);
 }
 }, [isOpen]);

 const handleSave = async () => {
 if (!selectedMood || isLoading) return;

 setIsLoading(true);
 try {
 const response = await fetch("/api/mood", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 score: selectedMood,
 note: note.trim() || null,
 }),
 });

 if (response.ok) {
 setIsSaved(true);
 setTimeout(() => {
 onClose();
 onComplete?.();
 }, 1200);
 }
 } catch (error) {
 console.error("Failed to save mood:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const selectedMoodData = moodOptions.find(m => m.score === selectedMood);

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
 onClick={onClose}
 />
 
 {/* Modal */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 transition={{ type: "spring", stiffness: 300, damping: 25 }}
 className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_24px_72px_rgba(45,41,38,0.22)] "
 >
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <motion.div
 animate={{ scale: [1, 1.1, 1] }}
 transition={{ duration: 2, repeat: Infinity }}
 className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-danger-soft)] shadow-sm"
 >
 <Icon icon="tabler:heart" className="h-5 w-5 text-[var(--color-danger)]" />
 </motion.div>
 <Text as="p" variant="h6" weight="bold">How are you feeling?</Text>
 </div>
 <button
 onClick={onClose}
 className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
 >
 <Icon icon="tabler:x" className="h-5 w-5" />
 </button>
 </div>

 {/* Selected mood preview */}
 <AnimatePresence mode="wait">
 {selectedMoodData && (
 <motion.div
 key={selectedMood}
 initial={{ opacity: 0, height: 0, marginTop: 0 }}
 animate={{ opacity: 1, height: "auto", marginTop: 16 }}
 exit={{ opacity: 0, height: 0, marginTop: 0 }}
 className="overflow-hidden"
 >
 <motion.div 
 initial={{ scale: 0.9 }}
 animate={{ scale: 1 }}
 className="flex items-center gap-3 rounded-md bg-[linear-gradient(135deg,var(--color-primary-light)_0%,white_100%)] border border-[var(--color-primary)]/10 px-4 py-3 shadow-sm"
 >
 <span className="text-2xl">{selectedMoodData.emoji}</span>
 <div>
 <Text as="span" variant="label" weight="bold" color="brand">
 {selectedMoodData.label}
 </Text>
 <Text as="p" variant="small" color="secondary" className="mt-0.5 leading-5">
 {selectedMoodData.note}
 </Text>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Mood emoji selector */}
 <div className="mt-6 grid grid-cols-5 gap-3">
 {moodOptions.map((option, index) => (
 <motion.button
 key={option.score}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 whileHover={{ scale: 1.08 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setSelectedMood(option.score)}
 className={`group relative flex flex-col items-center gap-1 rounded-md p-3 transition-all duration-200 ease-[var(--ease-out)] ${
 selectedMood === option.score
 ? "bg-[var(--color-primary-light)] shadow-md"
 : "bg-[var(--color-surface-warm)] hover:bg-[var(--color-surface-warm-hover)]"
 }`}
 >
 <span className={`text-2xl transition-transform duration-300 ${selectedMood === option.score ? 'scale-125' : ''}`}>
 {option.emoji}
 </span>
 <AnimatePresence>
 {selectedMood === option.score && (
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-md"
 >
 <Icon icon="tabler:circle-check" className="h-3 w-3" />
 </motion.div>
 )}
 </AnimatePresence>
 </motion.button>
 ))}
 </div>

 {/* Note input */}
 <textarea
 rows={3}
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder="What's on your mind? (optional)"
 className="mt-6 w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all duration-200 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(244,125,75,0.08)] placeholder:text-[var(--color-text-muted)]"
 />

 {/* Actions */}
 <div className="mt-6 flex gap-3">
 <Button 
 onClick={handleSave} 
 disabled={!selectedMood || isLoading} 
 className="flex-1 gap-2 rounded-full h-11"
 >
 {isLoading ? (
 <>
 <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
 Saving...
 </>
 ) : isSaved ? (
 <>
 <Icon icon="tabler:circle-check" className="h-4 w-4" />
 Saved!
 </>
 ) : (
 "Save check-in"
 )}
 </Button>
 <Button 
 onClick={onClose} 
 variant="ghost"
 className="rounded-full h-11 text-[var(--color-text-secondary)] px-6"
 >
 Skip
 </Button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
