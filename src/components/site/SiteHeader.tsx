"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from '@iconify/react';
import { Container, Text } from "@/components/ui";
import { marketingNav } from "@/content/mindbridge";

export function SiteHeader() {
 const [isOpen, setIsOpen] = useState(false);
 const desktopGhostLinkClass =
 "inline-flex h-11 shrink-0 items-center justify-center rounded-full px-4 text-button font-bold whitespace-nowrap text-[var(--text-secondary)] transition-[background-color,color] duration-200 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]";
 const desktopWarmLinkClass =
 "inline-flex h-11 shrink-0 items-center justify-center rounded-full px-4 text-button font-bold whitespace-nowrap bg-[var(--surface-warm-hover)] text-[var(--text-primary)] transition-[background-color,color] duration-200 hover:bg-[var(--surface-warm-active)]";
 const mobileGhostLinkClass =
 "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-button font-bold text-[var(--text-secondary)] transition-[background-color,color] duration-200 hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)]";
 const mobileWarmLinkClass =
 "inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-button font-bold bg-[var(--surface-warm-hover)] text-[var(--text-primary)] transition-[background-color,color] duration-200 hover:bg-[var(--surface-warm-active)]";

 return (
 <header className="sticky top-0 z-40 w-full pt-4 sm:pt-5">
 <Container size="md">
 <div className="surface-panel rounded-md px-4 py-3 sm:px-5">
 <div className="flex items-center justify-between gap-3">
 <Link href="/" className="flex min-w-0 items-center gap-3">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--action-primary)] text-span font-bold text-[var(--text-inverse)]">
 MB
 </span>
 <div className="min-w-0">
 <Text as="p" variant="label" weight="bold" color="muted" className="tracking-[0.12em]">
 MindBridge
 </Text>
 <Text as="p" variant="small" color="secondary" className="mt-0.5 truncate">
 Your guide to a calmer mind
 </Text>
 </div>
 </Link>

 <nav className="hidden items-center border-[var(--border-default)] pr-4 mr-2 gap-1 lg:gap-2 border-r lg:flex">
 {marketingNav.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className="rounded-full px-3 lg:px-4 py-2 text-label font-medium text-[var(--text-secondary)] transition-[color,background-color] duration-200 hover:bg-[var(--action-primary-light)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg-page)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)]"
 >
 {item.label}
 </Link>
 ))}
 </nav>

 <div className="hidden items-center gap-2 lg:flex">
 <Link href="/login" className={desktopGhostLinkClass}>
 Login
 </Link>
 <Link href="/student/dashboard" className={desktopWarmLinkClass}>
 Dashboard
 </Link>
 </div>

 <button
 type="button"
 onClick={() => setIsOpen((open) => !open)}
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--surface-tinted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg-page)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)] lg:hidden"
 aria-expanded={isOpen}
 aria-controls="marketing-menu"
 aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
 >
 {isOpen ? <Icon icon="tabler:x" className="h-5 w-5" /> : <Icon icon="tabler:menu-2" className="h-5 w-5" />}
 </button>
 </div>

 {isOpen ? (
 <div id="marketing-menu" className="mt-4 border-t border-[var(--border-default)] pt-4 lg:hidden">
 <div className="grid gap-2">
 {marketingNav.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setIsOpen(false)}
 className="interactive-panel flex min-h-[3rem] items-center justify-between rounded-md px-4 py-3 text-label font-medium text-[var(--text-primary)]"
 >
 <span>{item.label}</span>
 <Icon icon="tabler:arrow-right" className="h-4 w-4 text-[var(--bg-page)]" />
 </Link>
 ))}
 </div>

 <div className="mt-4 border-t border-[var(--border-default)] pt-4">
 <div className="grid grid-cols-2 gap-2">
 <Link href="/login" className={mobileGhostLinkClass} onClick={() => setIsOpen(false)}>
 Login
 </Link>
 <Link href="/student/dashboard" className={mobileWarmLinkClass} onClick={() => setIsOpen(false)}>
 Dashboard
 </Link>
 </div>
 </div>
 </div>
 ) : null}
 </div>
 </Container>
 </header>
 );
}
