import { Button, Card, Container, Text } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/site";

const otpSlots = ["6", "2", "4", "1", "8", "9"];

export default function VerifyPage() {
  return (
    <main id="main-content" className="w-full">
      <SiteHeader />

      <section className="w-full py-10 sm:py-14">
        <Container size="sm">
          <Card variant="elevated" padding="lg" className="rounded-[2rem] text-center">
            <Text as="p" variant="label" color="brand">
              Verify OTP
            </Text>
            <Text as="h1" variant="h2" weight="medium" className="mt-3">
              Enter the 6-digit code sent to your college email.
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-4">
              This route can stay fast and quiet. Verification should feel like a bridge into support, not a wall before it.
            </Text>

            <div className="mt-8 flex justify-center gap-3">
              {otpSlots.map((digit, index) => (
                <div
                  key={`${digit}-${index}`}
                  className="flex h-14 w-12 items-center justify-center rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] text-lg font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-line)]"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/student/dashboard" size="lg">
                Continue to dashboard
              </Button>
              <Button href="/login" variant="secondary" size="lg">
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
