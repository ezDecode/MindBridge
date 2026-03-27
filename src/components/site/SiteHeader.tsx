"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { Button, Container, Text } from "@/components/ui";
import { marketingNav } from "@/content/mindbridge";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full pt-4 sm:pt-5">
      <Container size="md">
        <div className="surface-panel rounded-[2rem] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[var(--color-brand-btn)] to-[var(--color-brand-btn-dark)] text-sm font-medium text-[var(--color-brand-foreground)] shadow-[0_16px_30px_-20px_rgba(99,71,181,0.85)] transition-transform duration-200 group-hover:scale-[1.03]">
                MB
              </span>
              <div className="min-w-0">
                <Text as="p" variant="small" weight="medium" color="muted" className="uppercase tracking-[0.18em]">
                  MindBridge
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-0.5 truncate">
                  Your guide to a calmer mind
                </Text>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {marketingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-[color,background-color] duration-200 hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-btn)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 sm:flex">
              <Button href="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button href="/student/dashboard" size="sm">
                Explore flow
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-line)] transition-colors duration-200 hover:bg-[var(--color-surface-tinted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-btn)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] sm:hidden"
              aria-expanded={isOpen}
              aria-controls="marketing-menu"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>

          {isOpen ? (
            <div id="marketing-menu" className="mt-4 border-t border-[var(--color-border)] pt-4 sm:hidden">
              <div className="grid gap-2">
                {marketingNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="interactive-panel flex items-center justify-between rounded-[1.35rem] px-4 py-3 text-sm text-[var(--color-text-primary)]"
                  >
                    <span>{item.label}</span>
                    <FiArrowRight className="h-4 w-4 text-[var(--color-brand-btn)]" />
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <Button href="/student/dashboard" className="w-full justify-between">
                  Explore student flow
                  <FiArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/login" variant="secondary" className="w-full">
                  Continue with college email
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
