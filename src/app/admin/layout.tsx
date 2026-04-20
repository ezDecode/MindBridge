import { RoleShell } from "@/components/site";
import { type NavItem } from "@/content/mindbridge";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "shield" },
];

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