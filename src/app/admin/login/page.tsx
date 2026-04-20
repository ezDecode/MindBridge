"use client";

import { useActionState } from "react";
import { Icon } from '@iconify/react';
import { Button, Card, Container, Input, Text } from "@/components/ui";
import { SiteHeader } from "@/components/site";
import { adminLoginHardcoded } from "@/lib/auth/actions";

const initialState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLoginHardcoded, initialState);

  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-8 sm:py-12">
        <Container size="sm" className="max-w-md">
          <Card variant="elevated" padding="lg" className="rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Icon icon="solar:shield-keyhole-linear" className="h-5 w-5" />
              </span>
              <div>
                <Text as="p" variant="h4" weight="bold" className="md:text-h3">
                  Admin Gateway
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-1">
                  Hardcoded login panel
                </Text>
              </div>
            </div>

            <form action={formAction} className="mt-6 space-y-4">
              <label className="block">
                <Text as="span" variant="label" weight="medium">
                  Admin ID
                </Text>
                <Input
                  type="text"
                  name="adminId"
                  placeholder="Enter ID (admin)"
                  required
                  disabled={isPending}
                  className="mt-2 min-h-[3.25rem] rounded-sm border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              </label>

              <label className="block mt-4">
                <Text as="span" variant="label" weight="medium">
                  Password
                </Text>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter Password (admin123)"
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

              <Button 
                type="submit" 
                variant="warm" 
                size="md" 
                className="w-full mt-2"
                disabled={isPending}
              >
                {isPending ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </Card>
        </Container>
      </section>
    </main>
  );
}