'use client'

import { usePathname } from "next/navigation"
import { Container } from "@/components/ui"
import { ToastProvider } from "@/components/ui/Toast"
import { RoleShell } from "@/components/site"
import { studentNav } from "@/content/mindbridge"

export default function StudentShellLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
 const pathname = usePathname()
 const isDashboard = pathname === "/student/dashboard"

 return (
 <ToastProvider>
 <RoleShell
 roleLabel="Student space"
 roleDescription="Chat, track your mood, and book counseling sessions."
 navItems={studentNav}
 >
 <div className={`w-full ${isDashboard ? 'h-[calc(100svh-4.75rem)]' : 'min-h-[calc(100vh-12rem)]'}`}>
 {isDashboard ? (
 <div className="h-full">
 {children}
 </div>
 ) : (
 <div className="flex min-w-0 flex-col gap-5 md:gap-6">
 {children}
 </div>
 )}
 </div>
 </RoleShell>
 </ToastProvider>
 )
}

