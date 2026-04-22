import { RoleShell } from "@/components/site";
import { adminNav } from "@/content/mindbridge";

export default function AdminLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
 return (
 <RoleShell
 roleLabel="Admin space"
 roleDescription="Manage all users, view detailed logs, and trigger critical interventions."
 navItems={adminNav}
 >
 {children}
 </RoleShell>
 );
}
