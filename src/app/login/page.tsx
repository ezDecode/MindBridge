"use client";

import { useActionState, useEffect, useState } from "react";
import { FiArrowRight, FiLock, FiMail, FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { Button, Card, Container, Input, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";
import { signInWithOtp, type AuthState } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

const initialState: AuthState = {};

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signInWithOtp, initialState);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (state.success) {
      // Store email for verify page
      sessionStorage.setItem("pendingEmail", email);
      router.push("/verify");
    }
  }, [state.success, email, router]);

  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-8 sm:py-12">
        <Container size="md">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Card variant="subtle" padding="lg" className="rounded-[calc(var(--radius-2xl)*var(--brm))] squircle">
              <Text as="p" variant="label" color="brand">
                Anonymous-first access
              </Text>
              <Text as="h1" variant="h3" weight="bold" className="mt-3 max-w-[14ch)] md:text-h2">
                College email unlocks the deeper features.
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-4">
                Browse chat and resources before sign-in. OTP unlocks quiz history, bookings, and saved progress.
              </Text>

              <div className="mt-6 md:mt-8 space-y-3">
                <div className="rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="h6" weight="bold">
                    Why OTP here
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Simple access. Fewer moments where someone abandons support.
                  </Text>
                </div>
                <div className="rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="h6" weight="bold">
                    What stays private
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Anonymous browsing always available. Counselor notes and admin views stay separate.
                  </Text>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg" className="rounded-[calc(var(--radius-2xl)*var(--brm))] squircle">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <FiMail className="h-5 w-5" />
                </span>
                <div>
                  <Text as="p" variant="h4" weight="bold" className="md:text-h3">
                    Sign in with OTP
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    No password. Just your college email.
                  </Text>
                </div>
              </div>

              <form action={formAction} className="mt-6 md:mt-8 space-y-4 md:space-y-5">
                <label className="block">
                  <Text as="span" variant="label" weight="medium">
                    College email
                  </Text>
                  <Input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    required
                    disabled={isPending}
                    className="mt-2 min-h-[3.25rem] rounded-[calc(var(--radius-sm)*var(--brm))] squircle border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </label>

                {state.error && (
                  <div className="rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-danger)] bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                      <Text as="p" variant="small" className="text-[var(--color-danger)]">
                        {state.error}
                      </Text>
                    </div>
                  </div>
                )}

                {state.success && (
                  <div className="rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-success)] bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                      <Text as="p" variant="small" className="text-[var(--color-success)]">
                        {state.message}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-gray-50)] p-4">
                  <div className="flex items-start gap-3">
                    <FiLock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                    <Text as="p" variant="small" color="secondary">
                      OTP sign-in — no password to remember or reset.
                    </Text>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="warm" 
                  size="md" 
                  className="w-full"
                  disabled={isPending || !email}
                >
                  {isPending ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send code
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 md:mt-8 grid gap-3 sm:grid-cols-2">
                <Button href="/student/chat" variant="warm" className="w-full">
                  Browse chat preview
                </Button>
                <Button href="/student/resources" variant="warm" className="w-full">
                  Open resource hub
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
