"use client";

import { useState, useEffect, useCallback } from "react";
import { getClient } from "@/lib/supabase/client";

interface Counselor {
  id: string;
  name: string;
}

interface Slot {
  id: string;
  counselor_id: string;
  slot_start: string;
  slot_end: string;
  available: boolean;
  counselor: { name: string } | null;
}

interface Booking {
  id: string;
  slot_start: string;
  slot_end: string;
  status: string;
  type: string;
  counselor: { name: string } | null;
}

import { Icon } from "@iconify/react";
import { useToast } from "@/components/ui/Toast";

import { Button, Card, Text } from "@/components/ui";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function BookCounselorPage() {
  const { showToast } = useToast();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingType, setBookingType] = useState<"online" | "inperson">("online");
  const [bookingNote, setBookingNote] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = (await res.json()) as { counselors: Counselor[], slots: Slot[], existingBookings: Booking[] };
        setCounselors(data.counselors || []);
        setSlots(data.slots || []);
        setExistingBookings(data.existingBookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openBooking = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedCounselor) {
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          counselorId: selectedCounselor.id,
          type: bookingType,
          slotStart: selectedSlot.slot_start,
          slotEnd: selectedSlot.slot_end,
          note: bookingNote
        })
      });

      if (res.ok) {
        showToast("Appointment booked! Confirmation sent to your email", "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to book session", "error");
      }
    } catch (err) {
      console.error("Booking error", err);
    }
  };

  const counselorSlots = selectedCounselor 
    ? slots.filter(s => s.counselor_id === selectedCounselor.id)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <Text as="h2" variant="h3" weight="semibold" className="tracking-tight">Expert Support</Text>
          <p className="text-text-dim text-xs font-bold uppercase tracking-[0.15em] mt-1">Book professional counseling</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-9 rounded bg-surface border border-border px-3 text-xs font-bold text-text-muted outline-none focus:border-white/20 transition-colors uppercase tracking-wider">
            <option>All Specializations</option>
            <option>Anxiety</option>
            <option>Depression</option>
          </select>
          <select className="h-9 rounded bg-surface border border-border px-3 text-xs font-bold text-text-muted outline-none focus:border-white/20 transition-colors uppercase tracking-wider">
            <option>All Languages</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map(counselor => (
          <motion.div key={counselor.id}>
            <Card padding="lg" className="bg-surface border-border group hover:border-white/20 transition-all flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-6">
                {counselor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <Text weight="semibold" className="text-white text-base mb-1">{counselor.name}</Text>
              <Text variant="small" className="text-text-dim text-[10px] font-bold uppercase tracking-widest mb-6">Psychologist · Jammu University</Text>
              
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <span className="badge badge-outline text-[9px] px-2 py-0.5 border-white/5 bg-white/5">General Support</span>
                <span className="badge badge-outline text-[9px] px-2 py-0.5 border-white/5 bg-white/5">Anxiety</span>
              </div>

              <div className="flex items-center gap-2 mb-8">
                <div className="flex gap-0.5 text-warning">
                  {[1, 2, 3, 4, 5].map(i => <Icon key={i} icon="tabler:star-filled" className="text-xs" />)}
                </div>
                {/* Use a deterministic value based on id length to avoid hydration mismatch */}
                <Text variant="small" className="text-text-dim text-[10px] font-bold tabular-nums">4.9 · {50 + (counselor.id.length * 3) % 100} sessions</Text>
              </div>

              <div className="w-full pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-success" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-widest">Available</span>
                  </div>
                  <Text variant="small" className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Next: Today</Text>
                </div>
                <Button onClick={() => openBooking(counselor)} size="md" className="w-full">Book Session</Button>
              </div>
            </Card>
          </motion.div>
        ))}
        {counselors.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center text-text-dim border border-dashed border-border rounded-lg bg-white/[0.01]">
            <Icon icon="tabler:users-off" className="text-4xl mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium italic opacity-60">No counselors available in this view.</p>
          </div>
        )}
      </div>

      <Card padding="lg" className="bg-surface border-border">
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Icon icon="tabler:calendar-check" className="text-xl" />
            </div>
            <Text as="h3" variant="body" weight="semibold" className="text-white">My Appointments</Text>
          </div>
          <span className="badge badge-primary bg-primary/10 text-primary border-primary/20 uppercase tracking-[0.2em] text-[9px]">{existingBookings.length} Upcoming</span>
        </div>
        
        <div className="space-y-3">
          {existingBookings.map(booking => (
            <div key={booking.id} className="group flex flex-col md:flex-row items-center gap-6 p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="flex flex-col items-center justify-center size-16 rounded bg-surface-raised border border-border shadow-sm shrink-0">
                <span className="text-[9px] font-bold uppercase text-text-muted">{new Date(booking.slot_start).toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}</span>
                <span className="text-2xl font-bold text-white leading-tight tabular-nums">{new Date(booking.slot_start).getDate()}</span>
                <span className="text-[9px] font-bold text-text-dim uppercase">{new Date(booking.slot_start).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span>
              </div>
              
              <div className="flex-1 text-center md:text-left min-w-0">
                <Text weight="semibold" className="text-white text-sm mb-1">{booking.counselor?.name || "Counselor"}</Text>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-bold text-text-dim uppercase tracking-widest tabular-nums">
                  <span className="flex items-center gap-1.5"><Icon icon="tabler:clock" className="text-primary text-xs" /> {new Date(booking.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex items-center gap-1.5"><Icon icon={booking.type === 'online' ? "tabler:video" : "tabler:building"} className="text-secondary text-xs" /> {booking.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={cn(
                  "badge text-[9px] uppercase tracking-widest",
                  booking.status === 'confirmed' ? "badge-primary bg-success/10 text-success border-success/20" : "badge-outline border-warning/20 text-warning bg-warning/5"
                )}>{booking.status}</span>
                <div className="flex gap-2">
                  <button className="h-8 px-4 rounded bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">Join</button>
                  <button className="h-8 px-4 rounded bg-white/5 text-text-muted text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:text-white transition-all">Edit</button>
                </div>
              </div>
            </div>
          ))}
          {existingBookings.length === 0 && (
            <div className="p-16 text-center text-text-dim border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
              <Icon icon="tabler:calendar-cancel" className="text-4xl mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium italic opacity-60">No upcoming appointments found.</p>
            </div>
          )}
        </div>
      </Card>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-lg bg-surface border border-white/10 rounded-lg shadow-2xl p-8 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <Text as="h3" variant="h4" weight="semibold">Book with {selectedCounselor?.name.split(' ')[0]}</Text>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-white/5 text-text-dim hover:text-white transition-colors">
                  <Icon icon="tabler:x" className="text-xl" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <Text variant="small" weight="bold" className="text-text-dim uppercase tracking-widest mb-4 block">Session Type</Text>
                  <div className="flex gap-2">
                    {[
                      { id: 'online', label: 'Online', icon: 'tabler:video' },
                      { id: 'inperson', label: 'In-person', icon: 'tabler:building' }
                    ].map(type => (
                      <button 
                        key={type.id}
                        onClick={() => setBookingType(type.id as "online" | "inperson")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 h-10 rounded border transition-all text-xs font-bold uppercase tracking-widest",
                          bookingType === type.id ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-text-muted hover:text-white"
                        )}
                      >
                        <Icon icon={type.icon} className="text-base" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Text variant="small" weight="bold" className="text-text-dim uppercase tracking-widest mb-4 block">Available Slots</Text>
                  <div className="grid grid-cols-3 gap-2">
                    {counselorSlots.length > 0 ? (
                      counselorSlots.map(slot => (
                        <button 
                          key={slot.id} 
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded border transition-all tabular-nums",
                            selectedSlot?.id === slot.id 
                              ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10" 
                              : "bg-background border-border text-text-muted hover:border-white/20 hover:text-white"
                          )}
                        >
                          <span className="text-[10px] font-bold">{new Date(slot.slot_start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[8px] font-bold uppercase opacity-60 mt-1">{new Date(slot.slot_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-3 p-8 text-center text-text-dim border border-dashed border-white/5 rounded italic text-xs uppercase tracking-widest opacity-60">No slots available</div>
                    )}
                  </div>
                </div>

                <div>
                  <Text variant="small" weight="bold" className="text-text-dim uppercase tracking-widest mb-4 block">Message (optional)</Text>
                  <textarea 
                    className="w-full min-h-[100px] bg-background border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-text-dim focus:border-white/20 transition-all outline-none resize-none leading-relaxed" 
                    placeholder="Briefly describe what you'd like to discuss..."
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                  />
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-start gap-3 p-4 rounded-md bg-white/[0.02] border border-white/5 mb-8">
                    <Icon icon="tabler:lock" className="text-primary text-lg shrink-0 mt-0.5" />
                    <Text variant="small" className="text-text-dim text-[11px] leading-relaxed">
                      Your session is confidential. A confirmation will be sent to your college email.
                    </Text>
                  </div>
                  <Button onClick={handleBooking} size="lg" className="w-full" disabled={!selectedSlot}>Confirm Booking</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
