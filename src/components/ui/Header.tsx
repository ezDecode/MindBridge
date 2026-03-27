"use client";

import { useState } from "react";
import Link from "next/link";

export interface HeaderProps {
  logo?: string;
}

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "/tools", label: "Free Tools" },
];

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

export function Header({ logo = "MindBridge" }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between px-5 md:px-6 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--color-text-primary)] transition-opacity duration-200 hover:opacity-80"
      >
        {logo}
      </Link>
      
      {/* Desktop Navigation */}
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

      {/* Desktop CTA */}
      <Link
        href="#waitlist"
        className="hidden md:inline-flex h-9 items-center rounded-full bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] px-5 text-sm font-semibold text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.97]"
      >
        Join waitlist
      </Link>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-[var(--color-text-primary)] touch-manipulation"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <nav className="absolute top-0 left-0 right-0 bg-[var(--color-background)] border-b border-[var(--color-border)] py-6 px-5 shadow-lg">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg text-[var(--color-text-secondary)] py-3 px-2 -mx-2 rounded-lg transition-colors hover:text-[var(--color-text-primary)] hover:bg-gray-50/50"
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="#waitlist"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-12 mt-2 items-center justify-center rounded-full bg-linear-to-b from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-base font-semibold text-[var(--color-brand-foreground)] shadow-[0px_1px_2px_rgba(0,0,0,0.1)]"
              >
                Join waitlist
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}