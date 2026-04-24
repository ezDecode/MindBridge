'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { type DemoRole, DEMO_USERS } from './demo-users'
import { setDemoRoleCookie, clearDemoRoleCookie, getCurrentDemoUserServer } from './demo-cookie'

export async function loginAsRole(role: DemoRole) {
  await setDemoRoleCookie(role)
  revalidatePath('/', 'layout')

  const targets: Record<DemoRole, string> = {
    student: '/student/dashboard',
    counselor: '/counselor/dashboard',
    admin: '/admin/dashboard',
  }
  redirect(targets[role])
}

export async function signOut() {
  await clearDemoRoleCookie()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  return await getCurrentDemoUserServer()
}

export async function getProfile() {
  return await getCurrentDemoUserServer()
}
