import { Button, Card, Container, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";

const otpSlots = ["6", "2", "4", "1", "8", "9"];

export default function VerifyPage() {
  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-10 sm:py-14">
        <Container size="sm">
          <Card variant="elevated" padding="lg" className="rounded-[calc(var(--radius-2xl)*var(--brm))] squircle text-center">
            <Text as="p" variant="label" color="brand">
              Verify OTP
            </Text>
            <Text as="h1" variant="h2" weight="bold" className="mt-3">
              Enter the code sent to your email.
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-4">
              A bridge into support, not a wall before it.
            </Text>

            <div className="mt-8 flex justify-center gap-3">
              {otpSlots.map((digit, index) => (
                <div
                  key={`${digit}-${index}`}
                  className="flex h-14 w-12 items-center justify-center rounded-[calc(var(--radius-sm)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] text-h4 font-bold text-[var(--color-text-primary)]"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/student/dashboard" variant="warm" size="md">
                Continue to dashboard
              </Button>
              <Button href="/login" variant="warm" size="md">
                Resend code
              </Button>
            </div>
          </Card>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
