'use client'

import { usePathname } from "next/navigation"
import { RoleShell } from "@/components/site"
import { AgentProvider, FloatingAgentBubble } from "@/components/chat"
import { studentNav } from "@/content/mindbridge"

/**
 * Client component for the student shell.
 * Receives `isStudent` as a prop from the Server Component (layout.tsx)
 * instead of reading cookies client-side.
 */
export function StudentShellClient({
  children,
  isStudent,
}: Readonly<{ children: React.ReactNode; isStudent: boolean }>) {
  const pathname = usePathname()
  const isChat = pathname === "/student/chat"

  return (
    <AgentProvider>
      <RoleShell
        navItems={studentNav}
        fullHeight={isChat}
      >
        {children}
      </RoleShell>
      {isStudent && <FloatingAgentBubble />}
    </AgentProvider>
  )
}
