'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { type DemoRole } from './demo-users'
import { setDemoRoleCookie, clearDemoRoleCookie, getCurrentDemoUserServer } from './demo-cookie'

import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('Sign in error:', error)
    return redirect('/login?error=auth-failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function loginAsRole(role: DemoRole) {
  // Update real profile and auth metadata if user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // 1. Update public profile table
    await supabase.from('profiles').update({ role }).eq('id', user.id)
    
    // 2. Sync with auth metadata so list-users and other auth checks stay in sync
    await supabase.auth.updateUser({
      data: { role }
    })
  }
  
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
  const supabase = await createClient()
  await supabase.auth.signOut()
  await clearDemoRoleCookie()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    return profile || { id: user.id, name: user.user_metadata.full_name || user.email }
  }
  return await getCurrentDemoUserServer()
}

export async function getProfile() {
  return await getUser()
}
