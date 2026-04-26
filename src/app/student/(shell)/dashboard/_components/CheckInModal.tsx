"use client";

import { useState, useEffect } from "react";

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
<>
{isOpen && (
 <>
 {/* Backdrop */}
 <div
 
 
 
 
 className="fixed inset-0 z-50 bg-[var(--action-primary)]/40 backdrop-blur-md"
 onClick={onClose}
 />
 
         {/* Modal */}
         <div
           
           
           
           
           className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[var(--border-default)] bg-[var(--surface-default)] p-6 shadow-2xl"
         >
           {/* Header */}
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2.5">
               <div
                 
                 
                 className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-error-soft)] shadow-sm ring-1 ring-[var(--status-error)]/10"
               >
                 <Icon icon="tabler:heart" className="h-5 w-5 text-[var(--status-error)]" />
               </div>
               <Text as="p" variant="h6" weight="bold" className="text-wrap-balance">How are you feeling?</Text>
             </div>
             <button
               onClick={onClose}
               className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] transition-all hover:bg-[var(--surface-warm)] hover:text-[var(--text-primary)] active:scale-[0.92]"
             >
               <Icon icon="tabler:x" className="h-5 w-5" />
             </button>
           </div>

           {/* Selected mood preview */}
           
             {selectedMoodData && (
               <div
                 key={selectedMood}
                 
                 
                 
                 
                 className="overflow-hidden"
               >
                 <div 
                   
                   
                   className="flex items-center gap-3 rounded-xl bg-[var(--bg-page)] border border-[var(--action-primary)]/10 px-4 py-3 shadow-sm"
                 >
                   <span className="text-2xl">{selectedMoodData.emoji}</span>
                   <div>
                     <Text as="span" variant="label" weight="bold" color="brand">
                       {selectedMoodData.label}
                     </Text>
                     <Text as="p" variant="small" color="secondary" className="mt-0.5 leading-5 text-wrap-pretty">
                       {selectedMoodData.note}
                     </Text>
                   </div>
                 </div>
               </div>
             )}
           

           {/* Mood emoji selector */}
           <div className="mt-6 grid grid-cols-5 gap-3">
             {moodOptions.map((option) => (
               <button
                 key={option.score}
                 
                 
                 
                 onClick={() => setSelectedMood(option.score)}
                 className={`group relative flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-200 active:scale-[0.92] ${
                   selectedMood === option.score
                     ? "bg-[var(--action-primary-light)] shadow-md ring-1 ring-[var(--action-primary)]/20"
                     : "bg-[var(--surface-warm)] hover:bg-[var(--surface-warm-hover)]"
                 }`}
               >
                 <span className={`text-2xl transition-transform duration-300 ${selectedMood === option.score ? 'scale-110' : ''}`}>
                   {option.emoji}
                 </span>
                 
                   {selectedMood === option.score && (
                     <div
                       
                       
                       
                       className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-lg bg-[var(--action-primary)] text-[var(--text-inverse)] shadow-md"
                     >
                       <Icon icon="tabler:check" className="h-3 w-3" />
                     </div>
                   )}
                 
               </button>
             ))}
           </div>

           {/* Note input */}
           <textarea
             rows={3}
             value={note}
             onChange={(e) => setNote(e.target.value)}
             placeholder="What's on your mind? (optional)"
             className="mt-6 w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] px-4 py-3 text-[1.0625rem] text-[var(--text-primary)] outline-none transition-all duration-200 focus:border-[var(--action-primary)] focus:shadow-[0_0_0_4px_rgba(244,125,75,0.08)] placeholder:text-[var(--text-muted)] text-wrap-pretty"
           />

           {/* Actions */}
           <div className="mt-6 flex gap-3">
             <Button 
               onClick={handleSave} 
               disabled={!selectedMood || isLoading} 
               className="flex-1 gap-2 rounded-full h-11 active:scale-[0.96] transition-transform"
             >
               {isLoading ? (
                 <>
                   <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
                   <span>Saving...</span>
                 </>
               ) : isSaved ? (
                 <>
                   <Icon icon="tabler:check" className="h-4 w-4" />
                   <span>Saved!</span>
                 </>
               ) : (
                 "Save check-in"
               )}
             </Button>
             <Button 
               onClick={onClose} 
               variant="ghost"
               className="rounded-full h-11 text-[var(--text-secondary)] px-6 active:scale-[0.96] transition-transform"
             >
               Skip
             </Button>
           </div>
         </div>
 </>
 )}
 
 
</>
);
}
