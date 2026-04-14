"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";
import { verifyOtp, type AuthState } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

const initialState: AuthState = {};
const OTP_LENGTH = 6;

function getPendingEmail() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("pendingEmail") || "";
}

export default function VerifyPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(verifyOtp, initialState);
  const [email] = useState(getPendingEmail);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < OTP_LENGTH) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, OTP_LENGTH) - 1;
    inputRefs.current[lastIndex]?.focus();
  };

  const otpValue = otp.join("");
  const isComplete = otpValue.length === OTP_LENGTH;

  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-10 sm:py-14">
        <Container size="sm">
          <Card variant="elevated" padding="lg" className="rounded-2xl text-center">
            <Text as="p" variant="label" color="brand">
              Verify OTP
            </Text>
            <Text as="h1" variant="h2" weight="bold" className="mt-3">
              Enter the code sent to your email.
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-4">
              {email ? (
                <>We sent a 6-digit code to <strong>{email}</strong></>
              ) : (
                "A bridge into support, not a wall before it."
              )}
            </Text>

            <form action={formAction}>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={otpValue} />

              <div className="mt-8 flex justify-center gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isPending}
                    className="flex h-14 w-12 items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-h4 font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:opacity-50"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {state.error && (
                <div className="mt-6 rounded-md border border-[var(--color-danger)] bg-red-50 p-4">
                  <div className="flex items-center justify-center gap-3">
                    <Icon icon="solar:danger-circle-linear" className="h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                    <Text as="p" variant="small" className="text-[var(--color-danger)]">
                      {state.error}
                    </Text>
                  </div>
                </div>
              )}

              {state.success && (
                <div className="mt-6 rounded-md border border-[var(--color-success)] bg-green-50 p-4">
                  <div className="flex items-center justify-center gap-3">
                    <Icon icon="solar:check-circle-linear" className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
                    <Text as="p" variant="small" className="text-[var(--color-success)]">
                      Verified! Redirecting...
                    </Text>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="submit"
                  variant="warm"
                  size="md"
                  disabled={!isComplete || isPending}
                >
                  {isPending ? (
                    <>
                      <Icon icon="solar:restart-circle-linear" className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & continue"
                  )}
                </Button>
                <Button href="/login" variant="warm" size="md">
                  <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
                  Back to login
                </Button>
              </div>
            </form>

            <Text as="p" variant="small" color="secondary" className="mt-6">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-[var(--color-primary)] hover:underline"
              >
                Resend code
              </button>
            </Text>
          </Card>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
