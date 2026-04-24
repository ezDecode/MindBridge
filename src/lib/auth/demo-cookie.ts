import { cookies } from "next/headers"
import { type DemoRole, DEMO_USERS, type DemoUser } from "./demo-users"

const COOKIE_KEY = "mindbridge_demo_role"

export async function setDemoRoleCookie(role: DemoRole): Promise<void> {
  const c = await cookies()
  c.set(COOKIE_KEY, role, { path: "/" })
}

export async function getDemoRoleCookie(): Promise<DemoRole> {
  const c = await cookies()
  return (c.get(COOKIE_KEY)?.value as DemoRole) || "student"
}

export async function getCurrentDemoUserServer(): Promise<DemoUser> {
  return DEMO_USERS[await getDemoRoleCookie()]
}

export async function clearDemoRoleCookie(): Promise<void> {
  const c = await cookies()
  c.delete(COOKIE_KEY)
}
