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
 <main id="main-content" className="protected-shell w-full flex min-h-[100svh]">
 <aside className="hidden h-screen w-[17rem] shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border)]/80 bg-[color-mix(in_srgb,var(--color-surface),var(--color-surface-warm)_42%)] lg:flex">
 <div className="flex flex-col gap-6 p-4">
 <Link
 href="/"
 className="inline-flex items-center gap-2 px-2 text-label font-bold text-[var(--color-text-primary)] transition-opacity duration-200 hover:opacity-80"
 >
 <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
 <Icon icon="tabler:crown" className="h-5 w-5" />
 </span>
 <span>MindBridge</span>
 </Link>

 <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-sm)]">
 <Text as="p" className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
 Quick start
 </Text>
 <Button variant="warm" className="h-11 w-full justify-start px-4 text-[var(--color-text-primary)]">
 <Icon icon="tabler:plus" className="mr-2 h-4 w-4" />
 New Entry
 </Button>
 </div>
 </div>

 <div className="flex flex-1 flex-col gap-1 px-3">
 <Text as="p" className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
 {roleLabel} Panel
 </Text>
 {navItems.map((item) => {
 const iconName = iconMap[item.icon as keyof typeof iconMap] ?? "tabler:layout-grid";
 const isActive = pathname === item.href;

 return (
 <Link
 key={item.href}
 href={item.href}
 aria-current={isActive ? "page" : undefined}
 className={cn(
 "flex items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-label font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary-light)]",
 isActive
 ? "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]"
 : "border border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
 )}
 >
 <Icon icon={iconName} className="h-[1.125rem] w-[1.125rem]" />
 {item.label}
 </Link>
 );
 })}
 </div>

 <div className="m-3 mt-auto rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-[var(--shadow-sm)]">
 <Link href="/counselor/dashboard" className="flex items-center gap-3 rounded-[0.95rem] px-3 py-2 text-[13px] font-medium text-[var(--color-info)] transition-colors hover:bg-[var(--color-surface-tinted)]">
 <Icon icon="tabler:user-shield" className="h-[1.125rem] w-[1.125rem]" />
 Counselor Access
 </Link>
 <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-[0.95rem] px-3 py-2 text-[13px] font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-surface-tinted)]">
 <Icon icon="tabler:lock" className="h-[1.125rem] w-[1.125rem]" />
 Admin Panel
 </Link>
 <Link href="/student/settings" className="mt-2 flex items-center gap-3 rounded-[0.95rem] border-t border-[var(--color-border)] px-3 pt-3 pb-2 text-label font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-text-primary)]">
 <Icon icon="tabler:user-circle" className="h-[1.125rem] w-[1.125rem]" />
 User Profile
 </Link>
 <Link href="/" className="mt-1 flex items-center gap-3 rounded-[0.95rem] px-3 py-2 text-label font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-text-primary)]">
 <Icon icon="tabler:logout" className="h-[1.125rem] w-[1.125rem]" />
 Leave Dashboard
 </Link>
 </div>
 </aside>

 <div className="flex flex-1 flex-col min-w-0">
 <div className="flex items-center justify-between border-b border-[var(--color-border)]/80 bg-[color-mix(in_srgb,var(--color-surface),var(--color-surface-warm)_38%)] p-4 lg:hidden">
 <Link href="/" className="inline-flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
 <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]">
 <Icon icon="tabler:crown" className="h-5 w-5" />
 </span>
 <span>MindBridge</span>
 </Link>
 </div>

 <div className="overflow-x-auto border-b border-[var(--color-border)]/80 lg:hidden">
 <div className="flex min-w-max gap-2 p-3">
 {navItems.map((item) => {
 const iconName = iconMap[item.icon as keyof typeof iconMap] ?? "tabler:layout-grid";
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 aria-current={isActive ? "page" : undefined}
 className={cn(
 "inline-flex items-center gap-2 rounded-[0.95rem] border px-3 py-2 text-span font-medium transition-colors",
 isActive
 ? "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]"
 : "border-transparent bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-tinted)]"
 )}
 >
 <Icon icon={iconName} className="h-4 w-4" />
 <span>{item.label}</span>
 </Link>
 );
 })}
 </div>
 </div>

 <div className="w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
 {children}
 </div>
 </div>
 </main>
 );
}
