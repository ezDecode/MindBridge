import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import { counselorAlerts, counselorBookings, counselorMetrics } from "@/content/mindbridge";

export default function CounselorDashboardPage() {
  return (
    <>
      <PageIntro
        eyebrow="Counselor dashboard"
        title="Triage first, context second, admin noise never."
        description="Next urgent signal, next booking, notes that need attention. Deliberately simple."
        actions={
          <>
            <Button href="/student/book">Preview student booking</Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {counselorMetrics.map((metric) => (
          <Card key={metric.label} variant="default" padding="md">
            <Text as="p" variant="small" color="secondary">
              {metric.label}
            </Text>
            <Text as="p" variant="h3" weight="medium" className="mt-3">
              {metric.value}
            </Text>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Card variant="subtle" padding="lg">
          <Text as="p" variant="small" weight="medium">
            Realtime crisis alerts
          </Text>
          <div className="mt-5 space-y-3">
            {counselorAlerts.map((alert, index) => (
              <div
                key={alert.title}
                className={`rounded-[1.5rem] border p-4 ${
                  index === 0
                    ? "border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
              >
                <Text as="p" variant="small" weight="medium">
                  {alert.title}
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-2">
                  {alert.detail}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Upcoming bookings
            </Text>
            <div className="mt-5 space-y-3">
              {counselorBookings.map((booking) => (
                <div
                  key={`${booking.student}-${booking.time}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <div>
                    <Text as="p" variant="small" weight="medium">
                      {booking.student}
                    </Text>
                    <Text as="p" variant="small" color="secondary" className="mt-1">
                      {booking.time}
                    </Text>
                  </div>
                  <span className="rounded-full bg-[var(--color-gray-100)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
                    {booking.type}
                  </span>
                  <span className="status-pill">{booking.status}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Notes and slots
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-3">
              Session notes stay private. Availability managed through a simple weekly slot form.
            </Text>
          </Card>
        </div>
      </div>
    </>
  );
}
