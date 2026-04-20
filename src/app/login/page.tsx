"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Input, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";
import { sendOtp, signInWithPassword, signUpWithPassword, signInWithGoogle, type AuthState } from "@/lib/auth/actions";
import { useRouter, useSearchParams } from "next/navigation";

const initialState: AuthState = {};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';
  
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [role, setRole] = useState(defaultRole);
  
  const [state, formAction, isPending] = useActionState(
    authMode === 'login' ? signInWithPassword : 
    authMode === 'signup' ? signUpWithPassword : 
    sendOtp, 
    initialState
  );

  useEffect(() => {
    if (state.success && state.message?.includes('Account created')) {
      // Switch back to login view after successful signup
      setAuthMode('login');
    }
  }, [state.success, state.message]);

  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-8 sm:py-12">
        <Container size="md">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Card variant="subtle" padding="lg" className="rounded-2xl">
              <Text as="p" variant="label" color="brand">
                Anonymous-first access
              </Text>
              <Text as="h1" variant="h3" weight="bold" className="mt-3 max-w-[14ch)] md:text-h2">
                College email unlocks the deeper features.
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-4">
                Browse chat and resources before sign-in. Sign in to unlock your history, sessions, and secure counseling bookings.
              </Text>

              <div className="mt-6 md:mt-8 space-y-3">
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="h6" weight="bold">
                    Secure Password Access
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Quickly return to your sessions securely matching your credentials.
                  </Text>
                </div>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="h6" weight="bold">
                    What stays private
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Anonymous browsing always available. Counselor notes and admin views stay separate.
                  </Text>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg" className="rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <Icon icon="solar:lock-password-linear" className="h-5 w-5" />
                </span>
                <div>
                  <Text as="p" variant="h4" weight="bold" className="md:text-h3">
                    {authMode === 'login' ? "Sign in to MindBridge" : authMode === 'signup' ? "Create an Account" : "Sign in with Magic Link"}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {authMode === 'login' ? "Welcome back" : authMode === 'signup' ? "Join your campus community securely" : "Receive a temporary link to sign in"}
                  </Text>
                </div>
              </div>

              <form action={signInWithGoogle} className="mt-6 md:mt-8">
                <Button type="submit" variant="ghost" className="w-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <Icon icon="flat-color-icons:google" className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-[var(--color-border)]"></div>
                <span className="mx-4 text-[13px] font-medium text-[var(--color-text-secondary)] uppercase">OR</span>
                <div className="flex-grow border-t border-[var(--color-border)]"></div>
              </div>

              <form action={formAction} className="space-y-4 md:space-y-5">
                {authMode === 'signup' && (
                  <label className="block">
                    <Text as="span" variant="label" weight="medium">
                      Role
                    </Text>
                    <select
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isPending}
                      className="mt-2 w-full min-h-[3.25rem] rounded-sm border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    >
                      <option value="student">Student</option>
                      <option value="counselor">Counselor / Admin</option>
                    </select>
                  </label>
                )}

                <label className="block mt-4 md:mt-5">
                  <Text as="span" variant="label" weight="medium">
                    {role === "counselor" && authMode === 'signup' ? "Staff email" : "Email"}
                  </Text>
                  <Input
                    type="email"
                    name="email"
                    placeholder={role === "counselor" && authMode === 'signup' ? "name@uni.edu" : "you@college.edu"}
                    required
                    disabled={isPending}
                    className="mt-2 min-h-[3.25rem] rounded-sm border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </label>

                {authMode !== 'otp' && (
                  <label className="block mt-4 md:mt-5">
                    <Text as="span" variant="label" weight="medium">
                      Password
                    </Text>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      disabled={isPending}
                      className="mt-2 min-h-[3.25rem] rounded-sm border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </label>
                )}

                {state.error && (
                  <div className="rounded-md border border-[var(--color-danger)] bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <Icon icon="solar:danger-circle-linear" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                      <Text as="p" variant="small" className="text-[var(--color-danger)]">
                        {state.error}
                      </Text>
                    </div>
                  </div>
                )}

                {state.success && (
                  <div className="rounded-md border border-[var(--color-success)] bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <Icon icon="solar:check-circle-linear" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                      <Text as="p" variant="small" className="text-[var(--color-success)]">
                        {state.message}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-gray-50)] p-4">
                  <div className="flex items-start gap-3">
                    <Icon icon="solar:shield-check-linear" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                    <Text as="p" variant="small" color="secondary">
                      {authMode === 'login' ? "Secure sign-in. Data remains private." : authMode === 'signup' ? "Creating an account gives you complete access." : "We'll send a secure login link to your email."}
                    </Text>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="warm" 
                  size="md" 
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Icon icon="solar:restart-circle-linear" className="h-4 w-4 animate-spin" />
                      {authMode === 'login' ? "Signing in..." : authMode === 'signup' ? "Creating..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      {authMode === 'login' ? "Sign in" : authMode === 'signup' ? "Create Account" : "Send Magic Link"}
                      <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 md:mt-8 grid gap-3 sm:grid-cols-2">
                {authMode === 'login' ? (
                  <>
                    <Button type="button" onClick={() => setAuthMode('signup')} variant="ghost" className="w-full">
                      Need an account? Sign up
                    </Button>
                    <Button type="button" onClick={() => setAuthMode('otp')} variant="ghost" className="w-full text-[var(--color-primary)]">
                      Lost Password? Use Magic Link
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setAuthMode('login')} variant="ghost" className="w-full sm:col-span-2">
                    Back to Sign in
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
