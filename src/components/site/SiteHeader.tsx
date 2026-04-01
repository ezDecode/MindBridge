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
        <div className="surface-panel rounded-[calc(var(--radius-2xl)*var(--brm))] squircle px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-span font-bold text-[var(--color-white)]">
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

            <nav className="hidden items-center gap-1 lg:gap-2 lg:flex">
              {marketingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 lg:px-4 py-2 text-label font-medium text-[var(--color-text-secondary)] transition-[color,background-color] duration-200 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Button href="/login" variant="warm" size="sm">
                Login
              </Button>
              <Button href="/student/dashboard" size="sm">
                Explore flow
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-surface-tinted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] lg:hidden"
              aria-expanded={isOpen}
              aria-controls="marketing-menu"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>

          {isOpen ? (
            <div id="marketing-menu" className="mt-4 border-t border-[var(--color-border)] pt-4 lg:hidden">
              <div className="grid gap-2">
                {marketingNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="interactive-panel flex min-h-[3rem] items-center justify-between rounded-[calc(var(--radius-md)*var(--brm))] squircle px-4 py-3 text-label font-medium text-[var(--color-text-primary)]"
                  >
                    <span>{item.label}</span>
                    <FiArrowRight className="h-4 w-4 text-[var(--color-black)]" />
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2">
                <Button href="/student/dashboard" className="w-full justify-between">
                  Explore student flow
                  <FiArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/login" variant="warm" className="w-full">
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
