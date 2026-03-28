"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCalendar,
  FiGrid,
  FiHeart,
  FiMessageSquare,
  FiPieChart,
  FiShield,
  FiClipboard,
  FiArrowLeft,
} from "react-icons/fi";
import { Button, Container, Text } from "@/components/ui";
import type { NavItem } from "@/content/mindbridge";
import { cn } from "@/lib/utils";

const iconMap = {
  grid: FiGrid,
  chat: FiMessageSquare,
  heart: FiHeart,
  quiz: FiClipboard,
  library: FiBookOpen,
  calendar: FiCalendar,
  shield: FiShield,
  chart: FiPieChart,
  alert: FiAlertCircle,
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
    <main id="main-content" className="w-full py-6 sm:py-8">
      <Container size="md">
        <div className="grid gap-6 lg:grid-cols-[17.25rem_minmax(0,1fr)]">
          <aside className="surface-panel hidden self-start rounded-[2rem] p-5 lg:sticky lg:top-6 lg:block">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mt-6 rounded-[1.6rem] bg-[var(--color-surface-tinted)] p-5">
              <Text as="p" variant="label" color="brand">
                {roleLabel}
              </Text>
              <Text as="p" variant="h3" weight="medium" className="mt-3">
                MindBridge
              </Text>
              <Text as="p" variant="small" color="secondary" className="mt-2">
                {roleDescription}
              </Text>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap] ?? FiGrid;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-sm transition-colors duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
                      isActive
                        ? "border-[var(--color-black)] bg-[var(--color-primary-light)] text-[var(--color-text-primary)]"
                        : "border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-text-primary)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <Text as="p" variant="small" weight="medium" color="primary">
                Crisis protocol
              </Text>
              <Text as="p" variant="small" color="secondary" className="mt-2">
                If someone mentions self-harm or not wanting to live, surface iCall and route them toward real support immediately.
              </Text>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="surface-panel flex items-center justify-between gap-4 rounded-[2rem] px-5 py-4 lg:hidden">
              <div>
                <Text as="p" variant="label" color="brand">
                  {roleLabel}
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-1">
                  {roleDescription}
                </Text>
              </div>
              <Button href="/" variant="warm" size="sm">
                Home
              </Button>
            </div>

            <div className="overflow-x-auto lg:hidden">
              <div className="flex min-w-max gap-3">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? FiGrid;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
                        isActive
                          ? "border-[var(--color-black)] bg-[var(--color-primary-light)] text-[var(--color-text-primary)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {children}
          </div>
        </div>
      </Container>
    </main>
  );
}
