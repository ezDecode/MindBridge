'use client'

import { Container } from "@/components/ui"
import { ToastProvider } from "@/components/ui/Toast"

export default function StudentShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <main className="min-h-screen w-full py-6 sm:py-8">
        <Container size="lg">
          <div className="flex min-w-0 flex-col gap-5 md:gap-6">
            {children}
          </div>
        </Container>
      </main>
    </ToastProvider>
  )
}