"use client";

import { motion, AnimatePresence } from "motion/react";
import { Icon } from '@iconify/react';
import { Button, Text } from "@/components/ui";

interface AnalyticsModalProps {
 isOpen: boolean;
 onClose: () => void;
 onGoToDashboard: () => void;
}

export function AnalyticsModal({ isOpen, onClose, onGoToDashboard }: AnalyticsModalProps) {
 return (
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
 />
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ duration: 0.2 }}
 className="w-full max-w-sm overflow-hidden rounded-[24px] bg-[var(--color-surface)] shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
 >
 <div className="flex flex-col items-center p-8 text-center">
 <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
 <Icon icon="tabler:trending-up" className="h-8 w-8" />
 </div>

 <Text as="h2" variant="h6" weight="semibold" className="mt-5 text-[var(--color-text-primary)]">
 View dashboard
 </Text>

 <Text as="p" variant="body" color="secondary" className="mt-2 text-balance">
 Your dashboard brings together mood patterns, trends, and recent check-ins in one place.
 </Text>

 <div className="mt-8 flex w-full flex-col gap-3">
 <Button
 onClick={onGoToDashboard}
 className="!h-12 !w-full !rounded-[14px] !text-sm"
 >
 Open dashboard
 </Button>
 <Button
 variant="ghost"
 onClick={onClose}
 className="!h-10 !w-full !rounded-[12px] !text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
 >
 Not now
 </Button>
 </div>
 </div>
 </motion.div>
 </div>
 </>
 )}
 </AnimatePresence>
 );
}

