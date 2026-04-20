"use client";

import { useActionState, useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Input, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";
import { signInWithPassword, signUpWithPassword, type AuthState } from "@/lib/auth/actions";
import { useRouter, useSearchParams } from "next/navigation";

const initialState: AuthState = {};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(defaultRole);
  
  const [state, formAction, isPending] = useActionState(
    isLogin ? signInWithPassword : signUpWithPassword, 
    initialState
  );

  useEffect(() => {
    if (state.success && state.message?.includes('Account created')) {
      // Switch back to login view after successful signup
      setIsLogin(true);
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
                    {isLogin ? "Sign in to MindBridge" : "Create an Account"}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {isLogin ? "Welcome back" : "Join your campus community securely"}
                  </Text>
                </div>
              </div>

              <form action={formAction} className="mt-6 md:mt-8 space-y-4 md:space-y-5">
                {!isLogin && (
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
                    {role === "counselor" && !isLogin ? "Staff email" : "Email"}
                  </Text>
                  <Input
                    type="email"
                    name="email"
                    placeholder={role === "counselor" && !isLogin ? "name@uni.edu" : "you@college.edu"}
                    required
                    disabled={isPending}
                    className="mt-2 min-h-[3.25rem] rounded-sm border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </label>

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
                      {isLogin ? "Secure sign-in. Data remains private." : "Creating an account gives you complete access."}
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
                      {isLogin ? "Signing in..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign in" : "Create Account"}
                      <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 md:mt-8 grid gap-3 sm:grid-cols-2">
                <Button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)} 
                  variant="ghost" 
                  className="w-full"
                >
                  {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
                </Button>
                <Button href="/student/chat" variant="warm" className="w-full">
                  Browse chat preview
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
