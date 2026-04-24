"use client";


import { Icon } from '@iconify/react';
import { Button, Text } from "@/components/ui";

interface AnalyticsModalProps {
 isOpen: boolean;
 onClose: () => void;
 onGoToDashboard: () => void;
}

export function AnalyticsModal({ isOpen, onClose, onGoToDashboard }: AnalyticsModalProps) {
 return (
 <>
 {isOpen && (
 <>
 <div
 
 
 
 onClick={onClose}
 className="fixed inset-0 z-50 bg-[var(--action-primary)]/30 backdrop-blur-sm"
 />
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 
 
 
 
 className="w-full max-w-sm overflow-hidden rounded-[24px] bg-[var(--surface-default)] shadow-lg"
 >
 <div className="flex flex-col items-center p-8 text-center">
 <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--action-primary-light)] text-[var(--action-primary)]">
 <Icon icon="tabler:trending-up" className="h-8 w-8" />
 </div>

 <Text as="h2" variant="h6" weight="semibold" className="mt-5 text-[var(--text-primary)]">
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
 className="!h-10 !w-full !rounded-[12px] !text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"
 >
 Not now
 </Button>
 </div>
 </div>
 </div>
 </div>
 </>
 )}
 </>
 );
}

