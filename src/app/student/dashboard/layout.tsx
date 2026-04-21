'use client'

import { ToastProvider } from "@/components/ui/Toast"

export default function DashboardLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
 return (
 <ToastProvider>
 <main className="h-[100svh] w-full overflow-hidden">
 {children}
 </main>
 </ToastProvider>
 )
}

