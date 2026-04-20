"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "motion/react";
import type { TabId } from "./types";

interface DashboardSidebarProps {
  userName: string;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onSwitchToBridge: () => void;
  onSwitchToMind: () => void;
  startNewSession: () => void;
  onOpenQuestionnaire: () => void;
  setShowCheckIn: (val: boolean) => void;
  setShowBookingModal: (val: boolean) => void;
  setShowAnalyticsModal: (val: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}

export function DashboardSidebar({
  userName,
  activeTab,
  setActiveTab,
  onSwitchToBridge,
  onSwitchToMind,
  startNewSession,
  onOpenQuestionnaire,
  setShowCheckIn,
  setShowBookingModal,
  setShowAnalyticsModal,
  sidebarOpen,
  setSidebarOpen,
}: DashboardSidebarProps) {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Perplexity Style */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] pb-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:static lg:block lg:w-[15rem] lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & New Chat */}
        <div className="flex flex-col gap-4 px-4 pt-5 pb-3">
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
              <Icon icon="tabler:leaf" className="h-6 w-6 text-[var(--color-primary)]" />
              <span className="text-xl font-bold tracking-tight">MindBridge</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-warm)] lg:hidden"
            >
              <Icon icon="tabler:x" className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
               if (activeTab !== "mind") {
                   setActiveTab("mind");
                   onSwitchToMind();
               }
               startNewSession();
            }}
            className="group flex w-full items-center justify-between rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-warm)] hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Icon icon="tabler:plus" className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]" />
              <span>New Session</span>
            </div>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--color-text-muted)]">
              <Icon icon="tabler:command" /> K
            </span>
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3">
          <nav className="flex flex-col gap-1 py-2">
            <button
              onClick={() => {
                 setActiveTab("mind");
                 onSwitchToMind();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "mind" ? "bg-[var(--color-surface-tinted)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-border)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon icon="tabler:message-circle" className="h-[18px] w-[18px]" />
              <span>Mind Space (Chat)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("bridge");
                onSwitchToBridge();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "bridge" ? "bg-[var(--color-surface-tinted)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-border)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon icon="tabler:layout-grid" className="h-[18px] w-[18px]" />
              <span>Dashboard (Bridge)</span>
            </button>
            
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
            >
              <Icon icon="tabler:trending-up" className="h-[18px] w-[18px]" />
              <span>Analytics</span>
            </button>

            <div className="my-2 h-px w-full bg-[var(--color-border-light)]" />

            <div className="mb-1 px-3">
              <button 
                onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
                className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              >
                Quick Actions
                <Icon 
                  icon="tabler:chevron-down" 
                  className={`h-3 w-3 transition-transform ${isMenuCollapsed ? "-rotate-90" : ""}`} 
                />
              </button>
            </div>

            <AnimatePresence>
              {!isMenuCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-1 overflow-hidden"
                >
                  <button
                    onClick={() => setShowCheckIn(true)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
                  >
                    <Icon icon="tabler:mood-smile" className="h-[18px] w-[18px]" />
                    <span>Log Mood</span>
                  </button>

                  <button
                    onClick={onOpenQuestionnaire}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
                  >
                    <Icon icon="tabler:bolt" className="h-[18px] w-[18px]" />
                    <span>Guided Check-in</span>
                  </button>

                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-text-primary)]"
                  >
                    <Icon icon="tabler:calendar-plus" className="h-[18px] w-[18px]" />
                    <span>Book Session</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>

        {/* Bottom Actions - Perplexity Style */}
        <div className="flex flex-col gap-1 px-4 mt-auto">
           <button className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-warm)]">
             <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-info-soft)] text-[var(--color-info)]">
                 <Icon icon="tabler:stars" className="h-4 w-4" />
               </div>
               <div className="flex flex-col items-start gap-0">
                 <span className="text-[13px] font-semibold leading-tight">Support Plan</span>
                 <span className="text-[11px] text-[var(--color-text-muted)] font-normal leading-tight">Counseling <Icon icon="tabler:arrow-right" className="inline w-3 h-3"/></span>
               </div>
             </div>
           </button>
           
           <div className="h-px bg-[var(--color-border)] mt-1 mb-1"/>

           <a href="/student/settings" className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-warm)]">
             <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                 <span className="text-xs uppercase font-bold">{userName.charAt(0)}</span>
               </div>
               <span className="text-sm font-medium">{userName}</span>
             </div>
             <Icon icon="tabler:settings" className="h-4 w-4 text-[var(--color-text-muted)]" />
           </a>
        </div>
      </aside>
    </>
  );
}
