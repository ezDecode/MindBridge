import { RoleShell } from "@/components/site";
import { counselorNav } from "@/content/mindbridge";

export default function CounselorLayout({
 children,
}: Readonly<{ children: React.ReactNode }>) {
 return (
 <RoleShell
 navItems={counselorNav}
 >
 {children}
 </RoleShell>
 );
}

