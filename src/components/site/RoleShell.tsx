"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal, Text } from "@/components/ui";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/actions";
import { AnimatePresence, motion } from "motion/react";
import { PanicModal } from "./PanicModal";
import { getCurrentDemoUser } from "@/lib/auth/demo-session";

interface RoleShellProps {
  children: React.ReactNode;
  navItems: { href: string; label: string; icon: string }[];
  fullHeight?: boolean;
}

import { DEMO_USERS } from "@/lib/auth/demo-users";

export function RoleShell({ children, navItems, fullHeight = false }: RoleShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener("open-settings", handleOpenSettings);
    return () => window.removeEventListener("open-settings", handleOpenSettings);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const [demoUser, setDemoUser] = useState(DEMO_USERS["student"]);

  useEffect(() => {
    setDemoUser(getCurrentDemoUser());
  }, []);

  const user = {
    name: demoUser.name,
    initials: demoUser.name.split(' ').map(n => n[0]).join('').slice(0, 2),
    role: demoUser.role.charAt(0).toUpperCase() + demoUser.role.slice(1),
    dept: demoUser.institution,
  };

  const isAdmin = pathname.startsWith("/admin");
  const isCounselor = pathname.startsWith("/counselor");

  const pageTitles: Record<string, string> = {
    "/student/dashboard": "Personal Dashboard",
    "/student/chat": "MindBot Companion",
    "/student/resources": "Wellness Library",
    "/student/book": "Expert Support",
    "/student/journal": "Thought Journal",
    "/student/screening": "Clinical Assessments",
    "/student/wellness": "Wellness Center",
    "/student/check-in": "Daily Mood Log",
    "/admin/dashboard": "Campus Intelligence",
    "/counselor/dashboard": "Support Command",
  };

  const currentTitle = pageTitles[pathname] || "MindBridge";

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-full bg-[#030406] text-white overflow-hidden selection:bg-primary/30">
      <aside className="hidden w-64 shrink-0 flex-col bg-transparent lg:flex z-10">
        <div className="p-6 pb-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[10px] font-bold text-black transition-transform group-hover:scale-105">
              MB
            </div>
            <Text variant="small" weight="bold" className="uppercase tracking-widest text-white">
              MindBridge
            </Text>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-text-muted hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <Icon icon={item.icon} className={cn("h-4.5 w-4.5", isActive ? "text-primary" : "text-text-dim")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-2">
          {/* Notifications in Sidebar */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all border border-transparent",
                isNotifOpen ? "bg-white/[0.08] text-white" : "text-text-muted hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <div className="relative">
                <Icon icon="tabler:bell" className="h-4.5 w-4.5" />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              Notifications
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 z-50 mb-2 w-72 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0f14] shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Alerts</span>
                    <button className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-primary-hover">
                      Clear
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <NotificationItem
                      title="Appointment Reminder"
                      desc="Dr. Radha session tomorrow"
                      time="2h ago"
                      unread
                    />
                    <NotificationItem
                      title="Mood Check-in"
                      desc="How are you feeling?"
                      time="5h ago"
                      unread
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5 transition-colors hover:border-white/[0.08] hover:bg-white/[0.04]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-xs font-semibold text-white">{user.name}</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-text-dim">
                {user.role} · {user.dept}
              </div>
            </div>
            <Icon icon="tabler:settings" className="h-4 w-4 text-text-dim transition-colors group-hover:text-white" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-3 lg:p-4 lg:pl-0">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#080a0d] shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative z-20">
          
          <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] text-text-muted transition-all hover:bg-white/[0.04] hover:text-white lg:hidden"
              >
                <Icon icon="tabler:menu-2" className="h-5 w-5" />
              </button>
              <Text as="h1" variant="h6" weight="semibold" className="tracking-tight">
                {currentTitle}
              </Text>
            </div>
          </header>

          <main className={cn("flex-1 min-h-0 relative", fullHeight ? "h-full overflow-hidden" : "overflow-y-auto")}>
            {!fullHeight && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent z-0"
              />
            )}
            <div className={cn("relative z-10", fullHeight ? "h-full" : "p-5 md:p-8 lg:p-10")}>
              {children}
            </div>
          </main>
        </div>
      </div>

      {!isAdmin && !isCounselor && (
        <button
          className="group fixed bottom-7 right-7 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-danger text-white shadow-2xl transition-all active:scale-95"
          onClick={() => (window as unknown as { dispatchEvent: (e: CustomEvent) => void }).dispatchEvent(new CustomEvent("open-panic"))}
          title="Emergency Help"
        >
          <Icon icon="tabler:alert-triangle" className="h-6 w-6 group-hover:animate-pulse" />
        </button>
      )}

      <PanicModal />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col bg-[#030406] p-6 lg:hidden"
            >
              <div className="mb-10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[10px] font-bold text-black">
                    MB
                  </div>
                  <Text variant="small" weight="bold" className="uppercase tracking-widest text-white">
                    MindBridge
                  </Text>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-text-muted"
                >
                  <Icon icon="tabler:x" className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-text-muted hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      <Icon icon={item.icon} className={cn("h-5 w-5", isActive ? "text-primary" : "text-text-dim")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-white/[0.04]">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-xs font-semibold text-white">{user.name}</div>
                    <div className="truncate text-[10px] uppercase tracking-wider text-text-dim">
                      {user.role}
                    </div>
                  </div>
                  <Icon icon="tabler:settings" className="h-4 w-4 text-text-dim" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {isSettingsOpen && (
        <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Account Settings" size="md">
          <div className="px-6 pb-10 pt-4">
            <SettingsForm onSuccess={() => setIsSettingsOpen(false)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function NotificationItem({
  title,
  desc,
  time,
  unread = false,
}: {
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer border-b border-white/[0.06] p-4 transition-colors hover:bg-white/[0.02]",
        unread && "bg-white/[0.015]",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <div className="text-xs font-semibold text-white">{title}</div>
        {unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
      <div className="mb-2 line-clamp-1 text-[11px] text-text-muted">{desc}</div>
      <div className="text-[9px] font-bold uppercase tracking-widest text-text-dim">{time}</div>
    </div>
  );
}
