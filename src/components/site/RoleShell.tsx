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
 <aside className="hidden lg:flex w-[16.5rem] flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] shrink-0 h-screen sticky top-0 overflow-y-auto">
 <div className="p-4 flex flex-col gap-6">
 <Link
 href="/"
 className="inline-flex items-center gap-2 px-2 text-label font-bold text-[var(--color-text-primary)] transition-opacity duration-200 hover:opacity-80"
 >
 <Icon icon="tabler:crown" className="h-5 w-5 text-[var(--color-primary)]" />
 <span>MindBridge</span>
 </Link>

 <div>
 <Button variant="ghost" className="w-full justify-start text-[var(--color-text-primary)] border border-[var(--color-border-strong)] rounded-full h-10 px-4 bg-[var(--color-surface-tinted)] hover:bg-[var(--color-surface-strong)] shadow-sm">
 <Icon icon="tabler:plus" className="mr-2 h-4 w-4" />
 New Entry
 </Button>
 </div>
 </div>

 <div className="px-3 flex-1 flex flex-col gap-1">
 <Text as="p"  className="px-3 mb-2 font-medium text-[var(--color-text-secondary)] uppercase tracking-wider text-[10px]">
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
 "flex items-center gap-3 rounded-md px-3 py-2.5 text-label font-medium transition-colors duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-text-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface)]",
 isActive
 ? "bg-[var(--color-surface-strong)] text-[var(--color-text-primary)]"
 : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-text-primary)]"
 )}
 >
 <Icon icon={iconName} className="h-[1.125rem] w-[1.125rem]" />
 {item.label}
 </Link>
 );
 })}
 </div>

 <div className="p-3 border-t border-[var(--color-border)]">
 <Link href="/counselor/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-[var(--color-info)] hover:bg-[var(--color-surface-tinted)] transition-colors">
 <Icon icon="tabler:user-shield" className="h-[1.125rem] w-[1.125rem]" />
 Counselor Access
 </Link>
 <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-surface-tinted)] transition-colors">
 <Icon icon="tabler:lock" className="h-[1.125rem] w-[1.125rem]" />
 Admin Panel
 </Link>
 <Link href="/student/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-label font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-text-primary)] transition-colors mt-2 border-t border-[var(--color-border)] pt-3">
 <Icon icon="tabler:user-circle" className="h-[1.125rem] w-[1.125rem]" />
 User Profile
 </Link>
 <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-label font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-text-primary)] transition-colors mt-1">
 <Icon icon="tabler:logout" className="h-[1.125rem] w-[1.125rem]" />
 Leave Dashboard
 </Link>
 </div>
 </aside>

 <div className="flex flex-1 flex-col min-w-0">
 <div className="lg:hidden flex items-center justify-between border-b border-[var(--color-border)] p-4 bg-[var(--color-background)]">
 <Link href="/" className="inline-flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
 <Icon icon="tabler:crown" className="h-5 w-5 text-[var(--color-primary)]" />
 <span>MindBridge</span>
 </Link>
 </div>

 <div className="overflow-x-auto lg:hidden border-b border-[var(--color-border)]">
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
 "inline-flex items-center gap-2 rounded-md px-3 py-2 text-span font-medium transition-colors",
 isActive
 ? "bg-[var(--color-surface-strong)] text-[var(--color-text-primary)]"
 : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tinted)]"
 )}
 >
 <Icon icon={iconName} className="h-4 w-4" />
 <span>{item.label}</span>
 </Link>
 );
 })}
 </div>
 </div>

 <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
 {children}
 </div>
 </div>
 </main>
 );
}

