"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, SelectionCard, Text } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { resolveProfileDisplayName } from "@/lib/profile-name";

interface Slot {
 id: string;
 counselor_id: string;
 slot_start: string;
 slot_end: string;
 available: boolean;
 counselor: { name: string };
}

interface Counselor {
 id: string;
 name: string;
 institution?: string;
}

type BookingType = "anonymous" | "named" | "crisis";

const bookingTypes = [
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

 const [bookingType, setBookingType] = useState<BookingType>("named");
 const [counselors, setCounselors] = useState<Counselor[]>([]);
 const [selectedCounselorId, setSelectedCounselorId] = useState<string | null>(null);
 const [slots, setSlots] = useState<Slot[]>([]);
 const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
 const [selectedDate, setSelectedDate] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

  useEffect(() => {
  if (!isOpen) {
    setSelectedSlot(null);
    setSelectedCounselorId(null);
    setSelectedDate(null);
    setError(null);
    setSuccess(false);
    setBookingType("named");
    return;
  }

  const fetchData = async () => {
    // In demo system, user is always present
    try {
      const res = await fetch(`/api/bookings?_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        
        setCounselors(data.counselors || []);
        if (data.counselors && data.counselors.length > 0) {
          // Default to Dr. Radha Sharma if she's in the list, otherwise first counselor
          const radha = data.counselors.find((c: Counselor) => c.name === 'Dr. Radha Sharma' || c.id === '87a24859-7892-49f8-b26d-c2878fe09f43');
          setSelectedCounselorId(radha ? radha.id : data.counselors[0].id);
        }

        setSlots(data.slots || []);
      } else {
        const errorData = await res.text();
        console.error("API Error Response:", errorData);
        setError(`API Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch booking data:", err);
      setError(`Fetch Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
  };

  fetchData();
 }, [isOpen, supabase]);

 const availableDates = useMemo(() => {
  if (!selectedCounselorId) return [];
  const counselorSlots = slots.filter(s => s.counselor_id === selectedCounselorId);
  const uniqueDates = new Set<string>();
  counselorSlots.forEach(slot => {
    const date = new Date(slot.slot_start);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    uniqueDates.add(`${year}-${month}-${day}`);
  });
  return Array.from(uniqueDates).sort();
 }, [slots, selectedCounselorId]);

 useEffect(() => {
  if (availableDates.length > 0 && (!selectedDate || !availableDates.includes(selectedDate))) {
    setSelectedDate(availableDates[0]);
  } else if (availableDates.length === 0) {
    setSelectedDate(null);
  }
 }, [availableDates, selectedDate, selectedCounselorId]);

 const formatSlotTime = useCallback((slot: Slot) => {
  const start = new Date(slot.slot_start);
  return start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
 }, []);

 const formatPreviewTime = useCallback((slot: Slot) => {
  const start = new Date(slot.slot_start);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[start.getDay()];
  const time = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
 }, []);

 const formatDateLabel = useCallback((dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  
  return date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
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
          className="fixed inset-0 z-50 bg-[var(--action-primary)]/40 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md border border-[var(--border-default)] bg-[var(--surface-default)] p-5 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--action-primary-light)]"
              >
                <Icon icon="tabler:calendar" className="h-4 w-4 text-[var(--action-primary)]" />
              </motion.div>
              <Text as="p" variant="h6" weight="bold">Book a session</Text>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]"
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
                className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[var(--status-success-light)] shadow-lg shadow-[var(--status-success)]/20"
              >
                <Icon icon="tabler:check" className="h-7 w-7 text-[var(--status-success)]" />
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
                    className="mt-3 rounded-md border border-[var(--status-error)]/20 bg-[var(--status-error-soft)] px-3 py-2"
                  >
                    <Text as="p" variant="small" className="text-[var(--status-error)]">
                      {error}
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Booking type selector */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {bookingTypes.map((type, index) => {
                  const typeKey = type.label.toLowerCase().split(" ")[0] as BookingType;
                  return (
                    <motion.div
                      key={typeKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <SelectionCard
                        selected={bookingType === typeKey}
                        label={type.label}
                        sublabel={type.note}
                        onClick={() => setBookingType(typeKey)}
                        className="h-full flex-col items-start justify-center gap-1.5 p-3 text-sm"
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Counselor selector */}
              <Text as="p" variant="label" weight="medium" className="mt-4 mb-2">
                Select a counselor
              </Text>
              {loading ? (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 w-32 animate-pulse rounded-xl bg-[var(--surface-strong)] shrink-0" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {counselors.map((counselor) => (
                    <button
                      key={counselor.id}
                      onClick={() => {
                        setSelectedCounselorId(counselor.id);
                        setSelectedSlot(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                        selectedCounselorId === counselor.id
                          ? "bg-[var(--action-primary)] text-white border-[var(--action-primary)] shadow-md"
                          : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--action-primary)]/50 hover:bg-[var(--surface-strong)]"
                      }`}
                    >
                      {counselor.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Day selector */}
              {availableDates.length > 0 && (
                <>
                  <Text as="p" variant="label" weight="medium" className="mt-4 mb-2">
                    Select a day
                  </Text>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {availableDates.map((dateString) => (
                      <button
                        key={dateString}
                        onClick={() => {
                          setSelectedDate(dateString);
                          setSelectedSlot(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                          selectedDate === dateString
                            ? "bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm"
                            : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]/50 hover:bg-[var(--surface-warm)]"
                        }`}
                      >
                        {formatDateLabel(dateString)}
                      </button>
                    ))}
                  </div>
                </>
              )}

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
                      className="h-10 animate-pulse rounded-md bg-[var(--surface-strong)]" 
                    />
                  ))}
                </div>
              ) : slots.filter(s => {
                  const date = new Date(s.slot_start);
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  return s.counselor_id === selectedCounselorId && `${y}-${m}-${d}` === selectedDate;
                }).length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <AnimatePresence mode="popLayout">
                    {slots.filter(s => {
                      const date = new Date(s.slot_start);
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, '0');
                      const d = String(date.getDate()).padStart(2, '0');
                      return s.counselor_id === selectedCounselorId && `${y}-${m}-${d}` === selectedDate;
                    }).map((slot, index) => (
                      <motion.button
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSlot(slot)}
                        className={`group relative rounded-md px-3 py-2 text-center transition-all ${
                          selectedSlot?.id === slot.id
                            ? "bg-[var(--action-primary-light)] shadow-md shadow-[var(--action-primary)]/15 border border-[var(--action-primary)]/30"
                            : "bg-[var(--surface-strong)] hover:bg-[var(--surface-warm)] hover:shadow-sm border border-transparent"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="text-[11px] font-semibold text-[var(--text-secondary)] truncate w-full px-1">
                            {resolveProfileDisplayName({ profileName: slot.counselor?.name }) || "Counselor"}
                          </span>
                          <div className="flex items-center gap-1.5 bg-[var(--surface-default)] px-2 py-1 rounded-md shadow-sm border border-[var(--border-default)]">
                            <Icon icon="tabler:clock" className="h-3 w-3 text-[var(--action-primary)]" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">{formatSlotTime(slot)}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-2 rounded-md border border-dashed border-[var(--border-default)] p-4 text-center">
                  <Text as="p" variant="small" color="muted">
                    No slots available for this date right now
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
                    <div className="flex items-center gap-3 rounded-md bg-gradient-to-r from-[var(--action-primary-light)]/30 to-[var(--action-primary-light)]/10 px-3 py-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--action-primary-light)]">
                        <Icon icon="tabler:user" className="h-5 w-5 text-[var(--action-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text as="p" variant="small" color="secondary" className="truncate">
                          {resolveProfileDisplayName({ profileName: selectedSlot.counselor?.name }) || "Counselor"}
                        </Text>
                        <Text as="p" variant="label" weight="bold" className="truncate">
                          {formatPreviewTime(selectedSlot)}
                        </Text>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--status-success)]"
                      >
                        <Icon icon="tabler:check" className="h-3.5 w-3.5 text-[var(--text-primary)]" />
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
