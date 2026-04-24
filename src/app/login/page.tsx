"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Input, Text } from "@/components/ui";
import { SiteHeader } from "@/components/site";
import { sendOtp, signInWithPassword, signUpWithPassword, signInWithGoogle, type AuthState } from "@/lib/auth/actions";
import { useSearchParams } from "next/navigation";

const initialState: AuthState = {};

function LoginForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';
  
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [role, setRole] = useState(defaultRole);
  const [fullName, setFullName] = useState('');
  
  const [state, formAction, isPending] = useActionState(
    authMode === 'login' ? signInWithPassword : 
    authMode === 'signup' ? signUpWithPassword : 
    sendOtp, 
    initialState
  );

  useEffect(() => {
    if (state.success && state.message?.includes('Account created')) {
      // Switch back to login view after successful signup
      const timer = setTimeout(() => setAuthMode('login'), 0);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.message]);

 return (
 <main id="main-content" className="w-full bg-background min-h-screen flex flex-col">
 <SiteHeader />

 <section className="flex-1 flex items-center py-12">
 <Container size="md">
 <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] items-stretch">
 <Card variant="subtle" padding="lg" className="flex flex-col justify-center bg-white/[0.02] border-white/5">
 <Text as="p" variant="label" className="text-primary tracking-[0.2em] mb-4">
 Anonymous-first
 </Text>
 <Text as="h1" variant="h2" weight="semibold" className="leading-tight">
 College email unlocks the deeper features.
 </Text>
 <Text as="p" color="secondary" className="mt-6 leading-relaxed">
 Browse chat and resources before sign-in. Sign in to unlock your history, sessions, and secure counseling bookings.
 </Text>

 <div className="mt-12 space-y-4">
 <div className="rounded-lg border border-border bg-surface p-6">
 <Text as="p" weight="semibold" className="text-sm">
 Secure Password Access
 </Text>
 <Text as="p" variant="small" color="secondary" className="mt-2 leading-relaxed">
 Quickly return to your sessions securely matching your credentials.
 </Text>
 </div>
 <div className="rounded-lg border border-border bg-surface p-6">
 <Text as="p" weight="semibold" className="text-sm">
 What stays private
 </Text>
 <Text as="p" variant="small" color="secondary" className="mt-2 leading-relaxed">
 Anonymous browsing always available. Counselor notes and admin views stay separate.
 </Text>
 </div>
 </div>
 </Card>

 <Card variant="elevated" padding="lg" className="bg-surface shadow-xl border-border">
 <div className="flex items-center gap-4 mb-10">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">
 <Icon icon="tabler:lock-password" className="h-5 w-5" />
 </div>
 <div>
 <Text as="p" variant="h4" weight="semibold">
 {authMode === 'login' ? "Sign in" : authMode === 'signup' ? "Create Account" : "Magic Link"}
 </Text>
 <Text as="p" variant="small" color="secondary">
 {authMode === 'login' ? "Welcome back" : authMode === 'signup' ? "Join your campus community" : "Temporary link to sign in"}
 </Text>
 </div>
 </div>

 <form action={signInWithGoogle}>
 <Button type="submit" variant="warm" className="w-full justify-center">
 <Icon icon="tabler:brand-google" className="h-4 w-4" />
 Continue with Google
 </Button>
 </form>

 <div className="my-8 flex items-center gap-4">
 <div className="flex-grow border-t border-border"></div>
 <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">OR</span>
 <div className="flex-grow border-t border-border"></div>
 </div>

  <form action={formAction} className="space-y-6">
  {authMode === 'signup' && (
  <>
  <div className="space-y-2">
  <Text as="span" variant="label" weight="bold" className="text-text-dim tracking-widest ml-1">
  Full name
  </Text>
  <Input
  type="text"
  name="fullName"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  placeholder="e.g. Aisha Khan"
  required
  disabled={isPending}
  />
  </div>

  <div className="space-y-2">
  <Text as="span" variant="label" weight="bold" className="text-text-dim tracking-widest ml-1">
  Role
  </Text>
  <select
  name="role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  disabled={isPending}
  className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
  >
  <option value="student">Student</option>
  <option value="counselor">Counselor / Admin</option>
  </select>
  </div>
  </>
  )}

 <div className="space-y-2">
 <Text as="span" variant="label" weight="bold" className="text-text-dim tracking-widest ml-1">
 {role === "counselor" && authMode === 'signup' ? "Staff email" : "Email"}
 </Text>
 <Input
 type="email"
 name="email"
 placeholder={role === "counselor" && authMode === 'signup' ? "name@uni.edu" : "you@college.edu"}
 required
 disabled={isPending}
 />
 </div>

 {authMode !== 'otp' && (
 <div className="space-y-2">
 <Text as="span" variant="label" weight="bold" className="text-text-dim tracking-widest ml-1">
 Password
 </Text>
 <Input
 type="password"
 name="password"
 placeholder="Enter your password"
 required
 disabled={isPending}
 />
 </div>
 )}

 {state.error && (
 <div className="rounded border border-danger/20 bg-danger/10 p-3">
 <div className="flex items-center gap-3">
 <Icon icon="tabler:alert-circle" className="h-4 w-4 shrink-0 text-danger" />
 <Text as="p" variant="small" className="text-danger font-semibold">
 {state.error}
 </Text>
 </div>
 </div>
 )}

 {state.success && (
 <div className="rounded border border-success/20 bg-success/10 p-3">
 <div className="flex items-center gap-3">
 <Icon icon="tabler:circle-check" className="h-4 w-4 shrink-0 text-success" />
 <Text as="p" variant="small" className="text-success font-semibold">
 {state.message}
 </Text>
 </div>
 </div>
 )}

 <Button 
 type="submit" 
 size="lg" 
 className="w-full mt-4"
 disabled={isPending}
 >
 {isPending ? (
 <>
 <Icon icon="tabler:loader" className="h-4 w-4 animate-spin" />
 {authMode === 'login' ? "Signing in..." : authMode === 'signup' ? "Creating..." : "Sending..."}
 </>
 ) : (
 <>
 {authMode === 'login' ? "Sign in" : authMode === 'signup' ? "Create Account" : "Send Magic Link"}
 <Icon icon="tabler:arrow-right" className="h-4 w-4" />
 </>
 )}
 </Button>
 </form>

 <div className="mt-10 pt-8 border-t border-border flex flex-col gap-4">
 {authMode === 'login' ? (
 <>
 <button type="button" onClick={() => setAuthMode('signup')} className="text-xs font-bold text-text-muted hover:text-white transition-colors uppercase tracking-[0.15em] text-center">
 Need an account? Sign up
 </button>
 <button type="button" onClick={() => setAuthMode('otp')} className="text-[10px] font-bold text-text-dim hover:text-white transition-colors uppercase tracking-[0.15em] text-center">
 Lost Password? Use Magic Link
 </button>
 </>
 ) : (
 <button type="button" onClick={() => setAuthMode('login')} className="text-xs font-bold text-text-muted hover:text-white transition-colors uppercase tracking-[0.15em] text-center">
 Back to Sign in
 </button>
 )}
 </div>
 </Card>
 </div>
 </Container>
 </section>
 </main>
 );
 }

 export default function LoginPage() { return (
 <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
 <LoginForm />
 </Suspense>
 );
}
