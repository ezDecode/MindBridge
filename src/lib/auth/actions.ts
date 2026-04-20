'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type AuthState = {
  error?: string
  success?: boolean
  message?: string
}

export async function signInWithPassword(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }
  if (!password) {
    return { error: 'Please enter a password' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If the user does not exist, we let them sign up. (Auto sign-up logic or show error)
  if (error) {
    // Optionally create the user if no account currently exists
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password. Please try again or create an account.' }
    }
    return { error: error.message }
  }

  const role = data?.user?.user_metadata?.role || 'student'
  
  // Need to use redirect but revalidate path first
  revalidatePath('/', 'layout')
  
  if (role === 'counselor' || role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/student/dashboard')
  }
}

export async function signUpWithPassword(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Get the role from form data (defaults to student)
  const role = (formData.get('role') as string) || 'student'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: 'Account created! You can now sign in.',
  }
}

export async function verifyOtp(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    return { error: 'Email and verification code are required' }
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/student/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function adminLoginHardcoded(
  prevState: any,
  formData: FormData
): Promise<{ error?: string }> {
  const adminId = formData.get('adminId')
  const password = formData.get('password')

  if (adminId === 'admin' && password === 'admin123') {
    const cookieStore = await cookies()
    cookieStore.set('mindbridge_admin', 'true', { path: '/' })
    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
  }

  return { error: 'Invalid credentials' }
}


