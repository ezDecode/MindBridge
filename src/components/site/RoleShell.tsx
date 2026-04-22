"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from '@iconify/react';
import { Modal, Text } from "@/components/ui";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { NavItem } from "@/content/mindbridge";
import { motion, AnimatePresence } from "motion/react";

const iconMap = {
 grid: "tabler:layout-grid",
 chat: "tabler:message-circle",
 heart: "tabler:heart",
 quiz: "tabler:notes",
 library: "tabler:book",
 calendar: "tabler:calendar",
 shield: "tabler:shield",
 chart: "tabler:chart-pie",
 alert: "tabler:alert-circle",
};

interface RoleShellProps {
 roleLabel: string;
 roleDescription: string;
 navItems: NavItem[];
 children: React.ReactNode;
}

export function RoleShell({
  roleLabel,
  roleDescription,
  navItems,
  children,
}: RoleShellProps) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isAdmin = pathname?.startsWith('/admin');
  const isCounselor = pathname?.startsWith('/counselor');

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  const handleNavItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.label.toLowerCase() === 'settings' || (item.href && item.href.includes('settings'))) {
      e.preventDefault();
      setIsSettingsOpen(true);
    }
  };

  return (
    <main id="main-content" className="protected-shell w-full flex h-screen overflow-hidden bg-bg-page text-text-primary antialiased">
      {/* SIDEBAR */}
      <aside className="hidden h-full w-[16rem] shrink-0 flex-col border-r border-border-default bg-surface-default lg:flex relative z-20">
        <div className="flex flex-col gap-8 p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-1 transition-transform active:scale-[0.96]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-action-primary text-text-inverse shadow-sm border border-white/10">
              <Icon icon="tabler:leaf" className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-mindbridge)' }}>MindBridge</span>
          </Link>

          {!isAdmin && !isCounselor && (
            <button className="flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold bg-surface-strong text-text-muted hover:bg-action-primary hover:text-text-inverse transition-colors active:scale-[0.96] cursor-pointer group">
              <span className="flex items-center gap-2.5">
                <Icon icon="tabler:plus" className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                New Session
              </span>
              <div className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-black bg-surface-default/50 text-text-muted group-hover:bg-white/20 group-hover:text-white tabular-nums">
                <Icon icon="tabler:command" className="h-3 w-3" /> K
              </div>
            </button>
          )}

          <div className="space-y-4">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-text-muted/50 px-1">{roleLabel}</Text>
            <div className="px-4 py-3 rounded-xl bg-surface-strong/20 border border-border-default/50">
              <Text className="text-[11px] leading-relaxed font-medium text-text-secondary text-wrap-pretty opacity-80">{roleDescription}</Text>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-3 overflow-y-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const iconName = iconMap[item.icon as keyof typeof iconMap] ?? "tabler:layout-grid";
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavItemClick(item, e)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors active:scale-[0.96] ${
                  isActive 
                    ? "bg-action-primary/10 text-action-primary shadow-sm" 
                    : "text-text-muted hover:bg-surface-strong/40 hover:text-text-primary"
                }`}
              >
                <Icon icon={iconName} className={`h-5 w-5 transition-colors ${isActive ? 'text-action-primary' : 'text-text-muted/60'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* USER PROFILE CARD */}
        <div className="p-4 border-t border-border-default bg-surface-warm-hover/10">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-strong/40 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-strong border border-border-default text-text-primary text-[10px] font-bold group-hover:bg-action-primary group-hover:text-text-inverse transition-colors">
                {isAdmin ? 'A' : (isCounselor ? 'C' : 'U')}
              </div>
              <div className="text-left">
                <Text className="text-[13px] font-semibold text-text-primary leading-none mb-1 tracking-tight">
                  {isAdmin ? 'Administrator' : (isCounselor ? 'Counselor' : 'Student')}
                </Text>
                <Text className="text-[10px] font-medium text-text-muted/60">
                  Settings
                </Text>
              </div>
            </div>
            <Icon icon="tabler:settings" className="h-3.5 w-3.5 text-text-muted/40 group-hover:text-text-primary transition-colors" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col min-w-0 bg-bg-page overflow-hidden relative">
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center relative z-10">
          
          {/* Mobile Header */}
          <header className="w-full flex items-center justify-between p-4 lg:hidden bg-surface-default/80 backdrop-blur-md border-b border-border-default sticky top-0 z-50">
            <Link href="/" className="inline-flex items-center gap-2 transition-transform active:scale-[0.96]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-action-primary text-text-inverse shadow-sm">
                <Icon icon="tabler:leaf" className="h-4.5 w-4.5" />
              </span>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-mindbridge)' }}>MindBridge</span>
            </Link>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-default border border-border-default active:scale-[0.92] transition-transform"
            >
              <Icon icon="tabler:settings" className="h-5 w-5 text-text-primary" />
            </button>
          </header>

          {/* Page Body */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1"
          >
            <div className="w-full max-w-6xl mx-auto px-6 py-10 sm:px-8 md:px-12">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence initial={false}>
        {isSettingsOpen && (
          <Modal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            title="Security & Preferences"
            size="md"
          >
            <div className="px-6 pb-10 pt-4">
              <SettingsForm onSuccess={() => setIsSettingsOpen(false)} />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}
