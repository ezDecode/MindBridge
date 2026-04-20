"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from '@iconify/react';
import { Button, Container, Text } from "@/components/ui";
import type { NavItem } from "@/content/mindbridge";
import { cn } from "@/lib/utils";

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

  return (
    <main id="main-content" className="protected-shell w-full flex min-h-[100svh] bg-[var(--color-base-bg)]">
      {/* SIDEBAR */}
      <aside className="hidden h-screen w-[200px] shrink-0 flex-col overflow-y-auto border-none bg-[var(--color-base-sidebar)] lg:flex">
        <div className="flex flex-col gap-6 p-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-2 text-label font-bold text-[var(--color-text-primary)] transition-opacity duration-200 hover:opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border-none bg-[var(--color-base-bg)] text-[var(--color-accent-electric)]">
              <Icon icon="tabler:crown" className="h-5 w-5" />
            </span>
            <span>MindBridge</span>
          </Link>

          <button className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-base-hover)] hover:text-[var(--color-text-primary)] transition-colors duration-200 cursor-pointer outline-none">
            <span className="flex items-center gap-3">
              <Icon icon="tabler:plus" className="h-4 w-4" />
              New Session
            </span>
            <span className="text-xs font-medium opacity-50">⌘K</span>
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
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out focus-visible:outline-none",
                  isActive
                    ? "bg-[#1f1f1f] text-white"
                    : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-base-hover)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon icon={iconName} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* BOTTOM USER AVATAR AND ACTIONS */}
        <div className="mt-auto p-3 mb-2 flex flex-col gap-1">
          <Link href="/student/settings" className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-base-hover)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-electric)] text-[var(--color-white)] text-xs font-bold shrink-0">
                N
              </div>
              Nemo
            </div>
            <Icon icon="tabler:settings" className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col min-w-0 bg-[var(--color-base-bg)]">
        {/* Mobile Header (Hidden on large screens) */}
        <div className="flex items-center justify-between bg-[var(--color-base-bg)] p-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border-none bg-[var(--color-base-card)] text-[var(--color-accent-electric)]">
              <Icon icon="tabler:crown" className="h-5 w-5" />
            </span>
            <span>MindBridge</span>
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="overflow-x-auto border-none lg:hidden">
          <div className="flex min-w-max gap-2 p-3 bg-[var(--color-base-bg)]">
            {navItems.map((item) => {
              const iconName = iconMap[item.icon as keyof typeof iconMap] ?? "tabler:layout-grid";
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-none",
                    isActive
                      ? "bg-[var(--color-base-hover)] text-[var(--color-text-primary)]"
                      : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-base-hover)]"
                  )}
                >
                  <Icon icon={iconName} className="h-4 w-4" />
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
    </main>
  );
}
