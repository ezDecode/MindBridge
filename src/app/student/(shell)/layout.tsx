'use client'

import { usePathname } from "next/navigation"
import { Container } from "@/components/ui"
import { ToastProvider } from "@/components/ui/Toast"

export default function StudentShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const isDashboard = pathname === "/student/dashboard"

  return (
    <ToastProvider>
      <main className={`w-full ${isDashboard ? 'h-[calc(100svh-4.75rem)]' : 'min-h-[calc(100svh-4.75rem)]'}`}>
        {isDashboard ? (
          <div className="h-full">
            {children}
          </div>
        ) : (
          <Container size="lg">
            <div className="flex min-w-0 flex-col gap-5 md:gap-6">
              {children}
            </div>
          </Container>
        )}
      </main>
    </ToastProvider>
  )
}
