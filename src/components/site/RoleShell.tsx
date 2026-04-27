"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal, Text, BrandLogo } from "@/components/ui";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { signOut, getProfile } from "@/lib/auth/actions";
import { AnimatePresence, motion } from "motion/react";
import { PanicModal } from "./PanicModal";
import { useNotifications } from "@/hooks/useNotifications";


interface RoleShellProps {
  children: React.ReactNode;
  navItems: { href: string; label: string; icon: string }[];
  fullHeight?: boolean;
}

export function RoleShell({ children, navItems, fullHeight = false }: RoleShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({
    name: 'User',
    initials: 'U',
    role: 'Student',
    dept: 'Wellness',
  });

  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener("open-settings", handleOpenSettings);
    
    // Fetch real profile
    getProfile().then(profile => {
      if (profile) {
        const hasRole = 'role' in profile;
        const hasInstitution = 'institution' in profile;
        
        setUser({
          name: profile.name || 'User',
          initials: (profile.name || 'User').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          role: hasRole && profile.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1)) : 'Student',
          dept: hasInstitution && profile.institution ? profile.institution : 'Wellness',
        });
      }
    });

    return () => window.removeEventListener("open-settings", handleOpenSettings);
  }, []);

  const isAdmin = pathname.startsWith("/admin");
  const isCounselor = pathname.startsWith("/counselor");

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-full bg-[#030406] text-white overflow-hidden selection:bg-primary/30">
      <aside className="hidden w-64 shrink-0 flex-col bg-transparent lg:flex z-30">
        <div className="p-6 pb-5">
          <Link href="/" className="group flex items-center gap-3" suppressHydrationWarning>
            <BrandLogo className="h-7 w-7 text-white transition-transform group-hover:scale-105" />
            <Text variant="small" weight="bold" className="uppercase text-white">
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
                    ? "bg-white/8 text-white shadow-sm"
                    : "text-text-muted hover:bg-white/4 hover:text-white",
                )}
              >
                <Icon icon={item.icon} className={cn("h-4.5 w-4.5", isActive ? "text-primary" : "text-text-dim")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-2">
          {/* Notifications Link */}
          <div className="relative">
            <Link
              href={isAdmin ? "/admin/notifications" : isCounselor ? "/counselor/notifications" : "/student/notifications"}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all border border-transparent",
                pathname.includes("/notifications") ? "bg-white/8 text-white shadow-sm" : "text-text-muted hover:bg-white/4 hover:text-white"
              )}
            >
              <div className="relative">
                <Icon icon="tabler:bell" className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0c0f14]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </Link>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-white/4 bg-white/2 p-2.5 transition-colors hover:border-white/8 hover:bg-white/4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-xs font-semibold text-white">{user.name}</div>
              <div className="truncate text-[10px] uppercase text-text-dim">
                {user.role} · {user.dept}
              </div>
            </div>
            <Icon icon="tabler:settings" className="h-4 w-4 text-text-dim transition-colors group-hover:text-white" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-3 lg:p-4 lg:pl-0">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#080a0d] shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative z-20">
          
          <main className={cn("flex-1 min-h-0 relative no-scrollbar", fullHeight ? "h-full overflow-hidden" : "overflow-y-auto")}>
            {/* Mobile Menu Trigger - Floating for cleaner look without header */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="absolute top-5 left-5 z-40 flex h-9 w-9 items-center justify-center rounded-md border border-white/8 bg-black/40 backdrop-blur-md text-text-muted transition-all hover:bg-white/4 hover:text-white lg:hidden"
            >
              <Icon icon="tabler:menu-2" className="h-5 w-5" />
            </button>

            {!fullHeight && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white/2 to-transparent z-0"
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
              className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-70 flex w-72 flex-col bg-[#030406] p-6 lg:hidden"
            >
              <div className="mb-10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3" suppressHydrationWarning>
                  <BrandLogo className="h-7 w-7 text-white" />
                  <Text variant="small" weight="bold" className="uppercase text-white">
                    MindBridge
                  </Text>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/8 text-text-muted"
                >
                  <Icon icon="tabler:x" className="h-5 w-5" />
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
                        isActive ? "bg-white/8 text-white" : "text-text-muted"
                      )}
                    >
                      <Icon icon={item.icon} className={cn("h-5 w-5", isActive ? "text-primary" : "text-text-dim")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-white/5 pt-6">
                <button 
                  onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-text-muted"
                >
                  <Icon icon="tabler:settings" className="h-5 w-5" />
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-text-muted"
                >
                  <Icon icon="tabler:logout" className="h-5 w-5" />
                  Sign Out
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
