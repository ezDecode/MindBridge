export type DemoRole = "student" | "counselor" | "admin"

export interface DemoUser {
  id: string
  email: string
  role: DemoRole
  name: string
  institution: string
}

// IMPORTANT: The counselor UUID must match Dr. Radha Sharma's actual UUID
// from the database. After running the migration, query:
//   SELECT id FROM profiles WHERE name = 'Dr. Radha Sharma' AND role = 'counselor';
// Then hardcode that UUID here.
export const DEMO_USERS: Record<DemoRole, DemoUser> = {
  student: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "student@mindbridge.demo",
    role: "student",
    name: "Nemo",
    institution: "Computer Science",
  },
  counselor: {
    id: "87a24859-7892-49f8-b26d-c2878fe09f43", 
    email: "counselor@mindbridge.demo",
    role: "counselor",
    name: "Dr. Radha Sharma",
    institution: "Psychology & Wellness",
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "admin@mindbridge.demo",
    role: "admin",
    name: "Prof. Raj Verma",
    institution: "Campus Administration",
  },
}

export function detectRoleFromEmail(email: string): DemoRole {
  if (email.startsWith("counselor")) return "counselor"
  if (email.startsWith("admin")) return "admin"
  return "student"
}
