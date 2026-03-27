import { RoleShell } from "@/components/site";
import { counselorNav } from "@/content/mindbridge";

export default function CounselorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleShell
      roleLabel="Counselor space"
      roleDescription="Upcoming sessions, urgent flags, notes, and slot management."
      navItems={counselorNav}
    >
      {children}
    </RoleShell>
  );
}
