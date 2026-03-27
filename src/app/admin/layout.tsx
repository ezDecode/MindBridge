import { RoleShell } from "@/components/site";
import { adminNav } from "@/content/mindbridge";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleShell
      roleLabel="Admin space"
      roleDescription="Aggregate trends, crisis counts, counselor accounts, and resource management."
      navItems={adminNav}
    >
      {children}
    </RoleShell>
  );
}
