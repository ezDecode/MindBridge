import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { Button, Card, Container, Input, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";

export default function LoginPage() {
  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-8 sm:py-12">
        <Container size="md">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <Card variant="subtle" padding="lg" className="rounded-[2rem]">
              <Text as="p" variant="label" color="brand">
                Anonymous-first access
              </Text>
              <Text as="h1" variant="h2" weight="bold" className="mt-3 max-w-[14ch]">
                College email unlocks the deeper features.
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-4">
                Browse chat and resources before sign-in. OTP unlocks quiz history, bookings, and saved progress.
              </Text>

              <div className="mt-8 space-y-3">
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="h6" weight="bold">
                    Why OTP here
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Simple access. Fewer moments where someone abandons support.
                  </Text>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="h6" weight="bold">
                    What stays private
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Anonymous browsing always available. Counselor notes and admin views stay separate.
                  </Text>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="lg" className="rounded-[2rem]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand)]/25 text-[var(--color-brand-btn)]">
                  <FiMail className="h-5 w-5" />
                </span>
                <div>
                  <Text as="p" variant="h3" weight="bold">
                    Sign in with OTP
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    No password. Just your college email.
                  </Text>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <Text as="span" variant="label" weight="medium">
                    College email
                  </Text>
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    className="mt-2 min-h-[3.25rem] rounded-[1rem] border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </label>

                <div className="rounded-[1.3rem] border border-[var(--color-border)] bg-[var(--color-gray-50)] p-4">
                  <div className="flex items-start gap-3">
                    <FiLock className="mt-0.5 h-4 w-4 text-[var(--color-brand-btn)]" />
                    <Text as="p" variant="small" color="secondary">
                      OTP sign-in — no password to remember or reset.
                    </Text>
                  </div>
                </div>

                <Button href="/verify" variant="warm" size="md" className="w-full">
                  Send code
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
