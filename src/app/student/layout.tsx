import { RoleShell } from "@/components/site";
import { studentNav } from "@/content/mindbridge";

export default function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleShell
      roleLabel="Student space"
      roleDescription="Mood, chat, quizzes, resources, and booking in one calm flow."
      navItems={studentNav}
    >
      {children}
    </RoleShell>
  );
}
