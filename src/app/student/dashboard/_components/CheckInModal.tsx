"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiCheck, FiLoader, FiHeart } from "react-icons/fi";
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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-danger-soft)]"
                >
                  <FiHeart className="h-4 w-4 text-[var(--color-danger)]" />
                </motion.div>
                <Text as="p" variant="h6" weight="bold">How are you feeling?</Text>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text-primary)]"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            {/* Selected mood preview */}
            <AnimatePresence mode="wait">
              {selectedMoodData && (
                <motion.div
                  key={selectedMood}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 rounded-md bg-gradient-to-r from-[var(--color-primary-light)]/50 to-[var(--color-primary-light)]/20 px-3 py-2"
                  >
                    <span className="text-xl">{selectedMoodData.emoji}</span>
                    <div>
                      <Text as="span" variant="label" weight="bold" color="brand">
                        {selectedMoodData.label}
                      </Text>
                      <Text as="span" variant="small" color="secondary" className="ml-2">
                        {selectedMoodData.note}
                      </Text>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mood emoji selector */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {moodOptions.map((option, index) => (
                <motion.button
                  key={option.score}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(option.score)}
                  className={`group relative flex flex-col items-center gap-1 rounded-md p-2 transition-all ${
                    selectedMood === option.score
                      ? "bg-[var(--color-primary-light)] shadow-lg shadow-[var(--color-primary)]/15"
                      : "bg-[var(--color-surface-strong)] hover:bg-[var(--color-border)]"
                  }`}
                >
                  <span className={`text-2xl transition-transform ${selectedMood === option.score ? 'scale-110' : ''}`}>
                    {option.emoji}
                  </span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: selectedMood === option.score ? 1 : 0 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)]"
                  >
                    <FiCheck className="h-2.5 w-2.5 text-white" />
                  </motion.div>
                </motion.button>
              ))}
            </div>

            {/* Note input */}
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind? (optional)"
              className="mt-4 w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-light)] placeholder:text-[var(--color-text-muted)]"
            />

            {/* Actions */}
            <div className="mt-4 flex gap-2.5">
              <Button 
                onClick={handleSave} 
                disabled={!selectedMood || isLoading} 
                className="flex-1 gap-2 rounded-md"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save check-in"
                )}
              </Button>
              <Button 
                onClick={onClose} 
                variant="ghost"
                className="rounded-md text-[var(--color-text-muted)]"
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
