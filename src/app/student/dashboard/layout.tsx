'use client'

import { ToastProvider } from "@/components/ui/Toast"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <main className="min-h-screen w-full">
        {children}
      </main>
    </ToastProvider>
  )
}
