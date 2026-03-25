"use client";

import Link from "next/link";

export interface HeaderProps {
  logo?: string;
}

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "/tools", label: "Free Tools" },
];

export function Header({ logo = "MindBridge" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between px-5 md:px-6 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--color-text-primary)] transition-opacity duration-200 hover:opacity-80"
      >
        {logo}
      </Link>
      
      <nav className="hidden items-center gap-7 md:flex">
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className="text-sm text-[var(--color-text-secondary)] transition-all duration-200 hover:text-[var(--color-text-primary)] relative group"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-brand-btn)] transition-all duration-200 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      <Link
        href="#waitlist"
        className="inline-flex h-9 items-center rounded-full bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] px-5 text-sm font-medium text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.97]"
      >
        Join waitlist
      </Link>
    </header>
  );
}