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
              <Text as="h1" variant="h2" weight="medium" className="mt-3 max-w-[14ch]">
                Use a college email only when you want to go deeper.
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-4">
                The chatbot preview and the support library can be browsed before sign-in. OTP unlocks quiz history, bookings, and saved progress without adding password friction.
              </Text>

              <div className="mt-8 space-y-3">
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="small" weight="medium">
                    Why OTP here
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    It keeps access simple for students and reduces the number of moments where someone abandons support.
                  </Text>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="small" weight="medium">
                    What stays private
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-2">
                    Anonymous browsing stays available. Counselor notes and admin views remain separate from student-facing routes.
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
                  <Text as="p" variant="h3" weight="medium">
                    Sign in with OTP
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    No password. No extra setup. Just your college email.
                  </Text>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <label className="block">
                  <Text as="span" variant="small" weight="medium">
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
                      OTP is used as the sign-in method. There is no password reset flow because there is no password to remember in the first place.
                    </Text>
                  </div>
                </div>

                <Button href="/verify" size="lg" className="w-full">
                  Send code
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Button href="/student/chat" variant="secondary" className="w-full">
                  Browse chat preview
                </Button>
                <Button href="/student/resources" variant="ghost" className="w-full">
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
