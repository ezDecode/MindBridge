"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, SelectionCard, Text } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

interface Slot {
 id: string;
 counselor_id: string;
 slot_start: string;
 slot_end: string;
 available: boolean;
 counselor: { name: string };
}

type BookingType = "anonymous" | "named" | "crisis";

const bookingTypes = [
 { label: "Anonymous", note: "Your name stays private", icon: "🎭" },
 { label: "Named", note: "Share your name with counselor", icon: "👤" },
 { label: "Crisis", note: "Urgent - they'll reach out ASAP", icon: "🚨" },
];

interface BookingModalProps {
 isOpen: boolean;
 onClose: () => void;
 onComplete?: () => void;
}

export function BookingModal({ isOpen, onClose, onComplete }: BookingModalProps) {
 const supabase = useMemo(() => createClient(), []);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);

 const [bookingType, setBookingType] = useState<BookingType>("anonymous");
 const [slots, setSlots] = useState<Slot[]>([]);
 const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 useEffect(() => {
 if (!isOpen) {
 setSelectedSlot(null);
 setError(null);
 setSuccess(false);
 setBookingType("anonymous");
 return;
 }

 const fetchData = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 setLoading(false);
 return;
 }

 try {
 const res = await fetch("/api/bookings");
 if (res.ok) {
 const data = await res.json();
 setSlots(data.slots || []);
 }
 } catch (err) {
 console.error("Failed to fetch booking data:", err);
 }
 setLoading(false);
 };

 fetchData();
 }, [isOpen, supabase]);

 const formatSlotTime = useCallback((slot: Slot) => {
 const start = new Date(slot.slot_start);
 const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 const day = dayNames[start.getDay()];
 const time = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
 return `${day} · ${time}`;
 }, []);

 const handleSubmit = async () => {
 if (!selectedSlot || submitting) return;

 setSubmitting(true);
 setError(null);

 try {
 const res = await fetch("/api/bookings", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 slotId: selectedSlot.id,
 counselorId: selectedSlot.counselor_id,
 type: bookingType,
 slotStart: selectedSlot.slot_start,
 slotEnd: selectedSlot.slot_end,
 }),
 });

 if (!res.ok) {
 const data = await res.json();
 throw new Error(data.error || "Failed to create booking");
 }

 setSuccess(true);
 setTimeout(() => {
 onClose();
 onComplete?.();
 }, 1500);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Failed to create booking");
 } finally {
 setSubmitting(false);
 }
 };

 const canSubmit = selectedSlot && !submitting;

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
 className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl"
 >
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <motion.div
 className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary-light)]"
 >
 <Icon icon="tabler:calendar" className="h-4 w-4 text-[var(--color-primary)]" />
 </motion.div>
 <Text as="p" variant="h6" weight="bold">Book a session</Text>
 </div>
 <button
 onClick={onClose}
 className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text-primary)]"
 >
 <Icon icon="tabler:x" className="h-4 w-4" />
 </button>
 </div>

 {success ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center py-8 text-center"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
 className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[var(--color-success-light)] shadow-lg shadow-[var(--color-success)]/20"
 >
 <Icon icon="tabler:check" className="h-7 w-7 text-[var(--color-success)]" />
 </motion.div>
 <Text as="p" variant="h6" weight="bold" className="mt-4">
 Booking confirmed! 🎉
 </Text>
 <Text as="p" variant="small" color="secondary" className="mt-1">
 Redirecting...
 </Text>
 </motion.div>
 ) : (
 <>
 {/* Error */}
 <AnimatePresence>
 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="mt-3 rounded-md border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] px-3 py-2"
 >
 <Text as="p" variant="small" className="text-[var(--color-danger)]">
 {error}
 </Text>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Booking type selector */}
 <div className="mt-4 grid gap-2">
 {bookingTypes.map((type, index) => {
 const typeKey = type.label.toLowerCase().split(" ")[0] as BookingType;
 return (
 <motion.div
 key={typeKey}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.05 }}
 >
 <SelectionCard
 selected={bookingType === typeKey}
 label={type.label}
 sublabel={type.note}
 onClick={() => setBookingType(typeKey)}
 />
 </motion.div>
 );
 })}
 </div>

 {/* Slot selector */}
 <Text as="p" variant="label" weight="medium" className="mt-4">
 Pick a time
 </Text>

 {loading ? (
 <div className="mt-2 grid grid-cols-3 gap-2">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="h-10 animate-pulse rounded-md bg-[var(--color-surface-strong)]" 
 />
 ))}
 </div>
 ) : slots.length > 0 ? (
 <div className="mt-2 grid grid-cols-3 gap-2">
 <AnimatePresence mode="popLayout">
 {slots.slice(0, 6).map((slot, index) => (
 <motion.button
 key={slot.id}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 transition={{ delay: index * 0.03 }}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setSelectedSlot(slot)}
 className={`group relative rounded-md px-3 py-2.5 text-center text-sm transition-all ${
 selectedSlot?.id === slot.id
 ? "bg-[var(--color-primary-light)] shadow-md shadow-[var(--color-primary)]/15"
 : "bg-[var(--color-surface-strong)] hover:bg-[var(--color-surface-warm)] hover:shadow-sm"
 }`}
 >
 <div className="flex flex-col items-center gap-0.5">
 <Icon icon="tabler:clock" className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
 <span className="font-medium">{formatSlotTime(slot)}</span>
 </div>
 </motion.button>
 ))}
 </AnimatePresence>
 </div>
 ) : (
 <div className="mt-2 rounded-md border border-dashed border-[var(--color-border)] p-4 text-center">
 <Text as="p" variant="small" color="muted">
 No slots available right now
 </Text>
 </div>
 )}

 {/* Selected slot preview */}
 <AnimatePresence>
 {selectedSlot && (
 <motion.div
 initial={{ opacity: 0, y: 10, height: 0 }}
 animate={{ opacity: 1, y: 0, height: 'auto' }}
 exit={{ opacity: 0, y: 10, height: 0 }}
 className="mt-3 overflow-hidden"
 >
 <div className="flex items-center gap-3 rounded-md bg-gradient-to-r from-[var(--color-primary-light)]/30 to-[var(--color-primary-light)]/10 px-3 py-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary-light)]">
 <Icon icon="tabler:user" className="h-5 w-5 text-[var(--color-primary)]" />
 </div>
 <div className="flex-1">
 <Text as="p" variant="small" color="secondary">
 {selectedSlot.counselor?.name}
 </Text>
 <Text as="p" variant="label" weight="bold">
 {formatSlotTime(selectedSlot)}
 </Text>
 </div>
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-success)]"
 >
 <Icon icon="tabler:check" className="h-3.5 w-3.5 text-white" />
 </motion.div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Submit button */}
 <div className="mt-4 flex gap-2.5">
 <Button 
 onClick={handleSubmit} 
 disabled={!canSubmit} 
 className="flex-1 gap-2 rounded-md"
 >
 {submitting ? (
 <>
 <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
 Booking...
 </>
 ) : (
 <>
 <Icon icon="tabler:calendar" className="h-4 w-4" />
 Confirm booking
 </>
 )}
 </Button>
 </div>
 </>
 )}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
