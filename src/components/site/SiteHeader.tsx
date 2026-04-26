"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from '@iconify/react';
import { Container, Text, BrandLogo } from "@/components/ui";
import { marketingNav } from "@/content/mindbridge";

export function SiteHeader() {
 const [isOpen, setIsOpen] = useState(false);
 const desktopGhostLinkClass =
 "inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-[1.0625rem] font-medium whitespace-nowrap text-text-muted transition-colors duration-150 hover:bg-white/5 hover:text-white";
 const desktopWarmLinkClass =
 "inline-flex h-9 shrink-0 items-center justify-center rounded-md px-4 text-[1.0625rem] font-medium whitespace-nowrap bg-white text-black transition-opacity duration-150 hover:opacity-90";
 const mobileGhostLinkClass =
 "inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-[1.0625rem] font-medium text-text-muted transition-colors duration-150 hover:bg-white/5 hover:text-white";
 const mobileWarmLinkClass =
 "inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-[1.0625rem] font-medium bg-white text-black transition-opacity duration-150 hover:opacity-90";

 return (
 <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
 <Container size="md">
 <div className="flex h-16 items-center justify-between gap-3">
 <Link href="/" className="flex min-w-0 items-center gap-3 group" suppressHydrationWarning>
 <BrandLogo className="h-8 w-8 text-white transition-transform group-hover:scale-105" />
 <div className="min-w-0">
 <Text as="p" variant="small" weight="bold" className="tracking-tight">
 MindBridge
 </Text>
 </div>
 </Link>

 <nav className="hidden items-center gap-1 lg:flex ml-8 flex-1">
 {marketingNav.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className="rounded-md px-3 py-1.5 text-[1.0625rem] font-medium text-text-muted transition-colors duration-150 hover:text-white hover:bg-white/5"
 >
 {item.label}
 </Link>
 ))}
 </nav>

 <div className="hidden items-center gap-3 lg:flex">
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
 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-white transition-colors duration-150 hover:bg-surface-hover lg:hidden"
 aria-expanded={isOpen}
 aria-controls="marketing-menu"
 aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
 >
 {isOpen ? <Icon icon="tabler:x" className="h-5 w-5" /> : <Icon icon="tabler:menu-2" className="h-5 w-5" />}
 </button>
 </div>

 {isOpen ? (
 <div id="marketing-menu" className="absolute left-0 right-0 top-16 border-b border-border bg-background p-4 lg:hidden animate-in fade-in slide-in-from-top-2">
 <div className="grid gap-1">
 {marketingNav.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setIsOpen(false)}
 className="flex items-center justify-between rounded-md px-3 py-2.5 text-[1.0625rem] font-medium text-text-muted transition-colors hover:text-white hover:bg-white/5"
 >
 <span>{item.label}</span>
 <Icon icon="tabler:arrow-right" className="h-4 w-4 opacity-50" />
 </Link>
 ))}
 </div>

 <div className="mt-4 border-t border-border pt-4">
 <div className="grid grid-cols-2 gap-3">
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
 </Container>
 </header>
 );
}
