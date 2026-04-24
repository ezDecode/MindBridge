import { RoleShell } from "@/components/site";
import { adminNav } from "@/content/mindbridge";

export default function AdminLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
 return (
 <RoleShell
 navItems={adminNav}
 >
 {children}
 </RoleShell>
 );
}
