import { type DemoRole, DEMO_USERS, type DemoUser } from "./demo-users"

const STORAGE_KEY = "mindbridge_demo_role"

export function setDemoRole(role: DemoRole): void {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, role)
}

export function getDemoRole(): DemoRole {
  if (typeof window === "undefined") return "student"
  
  // Prefer cookie to stay in sync with middleware
  const match = document.cookie.match(new RegExp('(^| )mindbridge_demo_role=([^;]+)'))
  if (match) {
    const role = match[2] as DemoRole
    if (role === "student" || role === "counselor" || role === "admin") {
      return role
    }
  }

  const role = localStorage.getItem(STORAGE_KEY) as DemoRole
  if (role === "student" || role === "counselor" || role === "admin") {
    return role
  }
  return "student"
}

export function getCurrentDemoUser(): DemoUser {
  return DEMO_USERS[getDemoRole()]
}

export function clearDemoSession(): void {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY)
}
