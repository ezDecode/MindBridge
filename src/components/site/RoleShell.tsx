"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from '@iconify/react';
import { Modal } from "@/components/ui";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { NavItem } from "@/content/mindbridge";

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
  navItems,
  children,
}: RoleShellProps) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    <main id="main-content" className="protected-shell w-full flex min-h-[100svh] bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* SIDEBAR - Student dashboard style */}
      <aside className="hidden h-screen w-[16rem] shrink-0 flex-col overflow-y-auto border-none bg-[var(--bg-sidebar)] lg:flex">
        <div className="flex flex-col gap-6 p-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-2 text-[17px] font-bold text-[var(--text-primary)] transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--action-primary)] to-[var(--action-primary-hover)] text-[var(--text-inverse)] shadow-sm ring-1 ring-inset ring-white/10">
              <Icon icon="tabler:leaf" className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </span>
            <span className="tracking-tight">MindBridge</span>
          </Link>

          <button className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer outline-none">
            <span className="flex items-center gap-2.5">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[var(--chip-bg)] text-[var(--text-icon)]">
                <Icon icon="tabler:plus" className="h-4 w-4" strokeWidth={2.5} />
              </span>
              New Session
            </span>
            <span className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-icon)] bg-[var(--bg-hover)]">
              <Icon icon="tabler:command" className="h-3 w-3" /> K
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const iconName = iconMap[item.icon as keyof typeof iconMap] ?? "tabler:layout-grid";
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavItemClick(item, e)}
                aria-current={isActive ? "page" : undefined}
                className={isActive 
                  ? "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium bg-[var(--surface-default)] text-[var(--text-primary)] shadow-lg ring-1 ring-inset ring-[var(--border-default)]"
                  : "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                }
              >
                <Icon icon={iconName} className="h-[18px] w-[18px]" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* BOTTOM USER AVATAR AND ACTIONS */}
        <div className="mt-auto p-3 mb-2 flex flex-col gap-1">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="group w-full flex items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-default)] hover:shadow-lg hover:ring-1 hover:ring-inset hover:ring-[var(--border-default)] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[var(--action-primary)] to-[var(--action-primary-hover)] text-[var(--text-inverse)] text-xs font-bold shrink-0 shadow-sm ring-1 ring-inset ring-white/20">
                U
              </div>
              My Account
            </div>
            <Icon icon="tabler:settings" className="h-[18px] w-[18px] text-[var(--text-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col min-w-0 bg-[var(--bg-page)]">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-[var(--bg-page)] p-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-[var(--text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-[var(--action-primary)] to-[var(--action-primary-hover)] text-[var(--text-inverse)] shadow-sm ring-1 ring-inset ring-white/10">
              <Icon icon="tabler:leaf" className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </span>
            <span className="text-[17px] tracking-tight">MindBridge</span>
          </Link>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)]"
          >
            <Icon icon="tabler:settings" className="h-5 w-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Mobile Nav */}
        <div className="overflow-x-auto border-none lg:hidden">
          <div className="flex min-w-max gap-2 p-3 bg-[var(--bg-page)]">
            {navItems.map((item) => {
              const iconName = iconMap[item.icon as keyof typeof iconMap] ?? "tabler:layout-grid";
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavItemClick(item, e)}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive
                    ? "inline-flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium bg-[var(--surface-default)] text-[var(--text-primary)] shadow-lg ring-1 ring-inset ring-[var(--border-default)]"
                    : "inline-flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                  }
                >
                  <Icon icon={iconName} className="h-[18px] w-[18px]" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Wrapper */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 flex-1">
            {children}
          </div>
        </div>
      </div>

      {/* Global Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Account Settings"
        size="md"
      >
        <div className="px-8 pb-10 pt-4">
          <SettingsForm onSuccess={() => setIsSettingsOpen(false)} />
        </div>
      </Modal>
    </main>
  );
}
