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

import Link from "next/link";

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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-[#EFEBE4] bg-[#FDFCFB] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:static lg:block lg:w-[16rem] lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-[var(--shadow-xl)]" : "-translate-x-full lg:translate-x-0 lg:shadow-none"
        }`}
      >
        <div className="flex h-full flex-col px-4 pb-4">
          <div className="flex items-center justify-between pt-6 pb-6">
            <Link href="/" className="flex items-center gap-2.5 text-[var(--color-text-primary)] transition-opacity hover:opacity-80 ml-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-[#f47d4b] to-[#e06535] text-white shadow-sm ring-1 ring-inset ring-white/15">
                <Icon icon="tabler:leaf" className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-[#3b352e]">MindBridge</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8a827a] hover:bg-[#f6f2ee] lg:hidden transition-colors"
            >
              <Icon icon="tabler:x" className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
             <button
              type="button"
              onClick={() => {
                if (activeTab !== "mind") {
                   setActiveTab("mind");
                   onSwitchToMind();
                }
                startNewSession();
              }}
              className="group flex w-full items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-[14px] font-semibold text-[#4e463d] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-[#e8dfd4] transition-all hover:bg-[#fcfaf8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:ring-[#e1d5c5] active:scale-[0.98]"
            >
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#f9f4f2] text-[#8a827a] group-hover:text-[#f47d4b] group-hover:bg-[#fff2ed] transition-colors ring-1 ring-inset ring-[#e8dfd4] group-hover:ring-[#f47d4b]/20">
                <Icon icon="tabler:plus" className="h-4 w-4" strokeWidth={2.5} />
              </div>
              New Session
              <div className="ml-auto flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#8a827a] bg-[#f6f2ee] ring-1 ring-inset ring-[#e8dfd4]">
                <Icon icon="tabler:command" className="h-3 w-3" /> K
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
            
            <div className="mb-6 lg:hidden">
              <h3 className="mb-2.5 px-2 text-[10.5px] font-bold uppercase tracking-wider text-[#a0978b]">
                Views
              </h3>
              <nav className="flex flex-col gap-0.5">
                <button
                  onClick={() => {
                     setActiveTab("mind");
                     onSwitchToMind();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium transition-all ${
                    activeTab === "mind" ? "bg-white text-[#4e463d] shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-inset ring-[#e8dfd4]" : "text-[#706458] hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                  }`}
                >
                  <Icon icon="tabler:message-circle" className="h-[18px] w-[18px]" strokeWidth={2} />
                  <span>Mind Space</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("bridge");
                    onSwitchToBridge();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium transition-all ${
                    activeTab === "bridge" ? "bg-white text-[#4e463d] shadow-[0_1px_2px_rgba(0,0,0,0.03)] ring-1 ring-inset ring-[#e8dfd4]" : "text-[#706458] hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                  }`}
                >
                  <Icon icon="tabler:layout-grid" className="h-[18px] w-[18px]" strokeWidth={2} />
                  <span>Dashboard</span>
                </button>
              </nav>
            </div>

            <div className="mb-6">
              <h3 className="mb-2.5 px-2 text-[10.5px] font-bold uppercase tracking-wider text-[#a0978b]">
                Analyze
              </h3>
              <nav className="flex flex-col gap-0.5">
                <button
                  onClick={() => setShowAnalyticsModal(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#706458] transition-colors hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                >
                  <div className="flex h-5 w-5 items-center justify-center text-[#8a827a] group-hover:text-[#4e463d]">
                    <Icon icon="tabler:trending-up" className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span>Mood Insights</span>
                </button>
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#706458] transition-colors hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                >
                  <div className="flex h-5 w-5 items-center justify-center text-[#8a827a] group-hover:text-[#4e463d]">
                    <Icon icon="tabler:mood-smile" className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span>Log Mood</span>
                </button>
              </nav>
            </div>

            <div className="mb-2">
              <h3 className="mb-2.5 px-2 text-[10.5px] font-bold uppercase tracking-wider text-[#a0978b]">
                Support
              </h3>
              <nav className="flex flex-col gap-0.5">
               <button
                  onClick={onOpenQuestionnaire}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#706458] transition-colors hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                >
                  <div className="flex h-5 w-5 items-center justify-center text-[#8a827a]">
                    <Icon icon="tabler:bolt" className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span>Guided Check-in</span>
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#706458] transition-colors hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                >
                  <div className="flex h-5 w-5 items-center justify-center text-[#8a827a]">
                    <Icon icon="tabler:calendar-plus" className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span>Book Session</span>
                </button>
                <Link
                  href="/student/resources"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#706458] transition-colors hover:bg-[#f6f2ee] hover:text-[#4e463d]"
                >
                  <div className="flex h-5 w-5 items-center justify-center text-[#8a827a]">
                    <Icon icon="tabler:books" className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span>Library</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-auto flex flex-col pt-6">
             <div className="rounded-xl bg-gradient-to-b from-[#e3eff8] to-[#f4f7fa] p-3.5 ring-1 ring-inset ring-[#e3eff8] shadow-sm mb-[22px]">
               <div className="flex items-center justify-between mb-1.5">
                 <div className="flex items-center gap-1.5">
                   <div className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-[#3c82f6] text-white">
                     <Icon icon="tabler:stars" className="h-3 w-3" strokeWidth={3} />
                   </div>
                   <span className="text-[11px] font-bold uppercase tracking-wide text-[#2358bc]">Pro Plan</span>
                 </div>
               </div>
               <p className="text-[12.5px] font-medium text-[#4e6b91] leading-snug">
                 Unlimited counselor access & advanced analytics.
               </p>
             </div>

             <Link href="/student/settings" className="group flex w-full items-center justify-between rounded-xl px-2 py-2 transition-all hover:bg-white hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:ring-1 hover:ring-inset hover:ring-[#e8dfd4]">
               <div className="flex items-center gap-2.5">
                 <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-[#f47d4b] to-[#e06535] text-white shadow-sm ring-1 ring-inset ring-white/20 transition-transform group-hover:scale-105">
                   <span className="text-[14px] font-bold">{userName.charAt(0)}</span>
                 </div>
                 <div className="flex flex-col items-start justify-center">
                   <span className="text-[14px] font-bold text-[#3b352e] leading-tight">{userName}</span>
                   <span className="text-[11px] font-semibold tracking-wide text-[#8a827a] mt-0.5 leading-tight">STUDENT</span>
                 </div>
               </div>
               <Icon icon="tabler:settings" className="h-[18px] w-[18px] text-[#a0978b] transition-colors group-hover:text-[#3b352e]" />
             </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
