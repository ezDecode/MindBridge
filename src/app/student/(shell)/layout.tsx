'use client'

import { usePathname } from "next/navigation"
import { RoleShell } from "@/components/site"
import { AgentProvider, FloatingAgentBubble } from "@/components/chat"
import { studentNav } from "@/content/mindbridge"

export default function StudentShellLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
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
   <FloatingAgentBubble />
  </AgentProvider>
 )
}
