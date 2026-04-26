"use client";

import { Icon } from "@iconify/react";

import type { TabId } from "./types";
import Link from "next/link";

interface DashboardSidebarProps {
  userName: string;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenQuestionnaire: () => void;
  onSwitchToMind: () => void;
  startNewSession: () => void;
  setShowCheckIn: (show: boolean) => void;
  setShowBookingModal: (show: boolean) => void;
}

export function DashboardSidebar({
  userName,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  onOpenQuestionnaire,
  onSwitchToMind,
  startNewSession,
  setShowCheckIn,
  setShowBookingModal,
}: DashboardSidebarProps) {
  return (
    <>
      
        {sidebarOpen && (
          <div
            
            
            
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-surface transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:static lg:block lg:w-[16rem] lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0 lg:shadow-none"
        }`}
      >
        <div className="flex h-full flex-col px-4 pb-4">
          <div className="flex items-center justify-between pt-6 pb-8">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 ml-1 group">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-white text-black text-base font-bold transition-transform">
                MB
              </div>
              <span className="text-[1.0625rem] font-medium tracking-tight text-white ">MindBridge</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim hover:text-white hover:bg-white/5 lg:hidden transition-all"
            >
              <Icon icon="tabler:x" className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-8 px-1">
             <button
              type="button"
              onClick={() => {
                if (activeTab !== "mind") {
                   setActiveTab("mind");
                   onSwitchToMind();
                }
                startNewSession();
              }}
              className="group flex w-full items-center gap-2.5 rounded-md bg-white px-3 py-2 text-[13px] font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              <Icon icon="tabler:plus" className="h-4 w-4" strokeWidth={2.5} />
              New Session
              <div className="ml-auto flex items-center gap-0.5 rounded border border-black/10 px-1 py-0.5 text-base font-bold opacity-60">
                <Icon icon="tabler:command" className="h-2.5 w-2.5" /> K
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
            
            <div className="mb-8">
              <h3 className="mb-3 px-3 text-base font-medium text-text-dim">
                Analyze
              </h3>
              <nav className="flex flex-col gap-1">
                <SidebarLink
                  onClick={() => setShowCheckIn(true)}
                  icon="tabler:mood-smile"
                  label="Log Mood"
                />
              </nav>
            </div>

            <div className="mb-8">
              <h3 className="mb-3 px-3 text-base font-medium text-text-dim">
                Support
              </h3>
              <nav className="flex flex-col gap-1">
                <SidebarLink
                  onClick={onOpenQuestionnaire}
                  icon="tabler:bolt"
                  label="Guided Check-in"
                />
                <SidebarLink
                  onClick={() => setShowBookingModal(true)}
                  icon="tabler:calendar-plus"
                  label="Book Session"
                />
                <Link
                  href="/student/resources"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-[13px] font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-white group"
                >
                  <Icon icon="tabler:books" className="h-4 w-4 text-text-dim group-hover:text-white" />
                  <span>Library</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <button 
               onClick={() => {
                 window.dispatchEvent(new CustomEvent('open-settings'));
               }}
               className="group flex w-full items-center justify-between rounded-md px-2 py-2 transition-all hover:bg-white/5 active:scale-[0.98]"
             >
               <div className="flex items-center gap-3">
                 <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary font-bold text-base">
                   {userName.charAt(0)}
                 </div>
                 <div className="flex flex-col items-start justify-center">
                   <span className="text-[13px] font-semibold text-white leading-none">{userName}</span>
                   <span className="text-base font-medium text-text-dim mt-1 leading-none ">Student</span>
                 </div>
               </div>
               <Icon icon="tabler:settings" className="h-4 w-4 text-text-dim transition-colors group-hover:text-white" />
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ onClick, icon, label }: { onClick: () => void, icon: string, label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-[13px] font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-white group"
    >
      <Icon icon={icon} className="h-4 w-4 text-text-dim group-hover:text-white" />
      <span>{label}</span>
    </button>
  );
}
