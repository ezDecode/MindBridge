import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import {
  adminMetrics,
  adminMoodTrend,
  adminQuizDistribution,
  adminResources,
} from "@/content/mindbridge";

export default function AdminDashboardPage() {
  return (
    <>
      <PageIntro
        eyebrow="Admin dashboard"
        title="Institution-level signal without exposing student detail."
        description="Aggregate mood, screening distribution, bookings, and crisis counts. No personal student data."
        actions={
          <>
            <Button href="/counselor/dashboard">Open counselor view</Button>
            <Button href="/" variant="warm">
              Return home
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {adminMetrics.map((metric) => (
          <Card key={metric.label} variant="default" padding="md">
            <Text as="p" variant="small" color="secondary">
              {metric.label}
            </Text>
            <Text as="p" variant="h3" weight="bold" className="mt-3 text-[var(--color-primary)]">
              {metric.value}
            </Text>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card variant="elevated" padding="lg">
          <Text as="p" variant="small" weight="medium">
            Mood trend
          </Text>
          <div className="chart-shell mt-6 flex h-56 items-end justify-between gap-4 rounded-[calc(var(--radius-lg)*var(--brm))] squircle px-4 pb-4 pt-8">
            {adminMoodTrend.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="chart-bar-track flex h-36 w-full items-end justify-center rounded-full">
                  <div
                    className="w-full rounded-full bg-linear-to-t from-[var(--color-success)] to-[var(--color-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <Text as="span" variant="small" color="muted">
                  {item.label}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="subtle" padding="lg">
          <Text as="p" variant="small" weight="medium">
            Screening distribution
          </Text>
          <div className="mt-5 space-y-4">
            {adminQuizDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between">
                  <Text as="span" variant="small" color="secondary">
                    {item.label}
                  </Text>
                  <Text as="span" variant="small" weight="medium">
                    {item.value}
                  </Text>
                </div>
                <div className="mt-2 h-3 rounded-full bg-[var(--color-gray-100)]">
                  <div
                    className="h-3 rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${item.value * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <Card variant="default" padding="lg">
          <Text as="p" variant="small" weight="medium">
            Crisis log preview
          </Text>
          <div className="mt-5 space-y-3">
            {["Mon · 2 flags", "Tue · 1 flag", "Wed · 0 flags", "Thu · 3 flags"].map((item) => (
              <div
                key={item}
                className="rounded-[calc(var(--radius-md)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <Text as="p" variant="small" color="secondary">
                  {item}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <Text as="p" variant="small" weight="medium">
              Resource management
            </Text>
            <Button href="/student/resources" variant="warm" size="sm">
              Preview library
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {adminResources.map((resource) => (
              <div
                key={resource.title}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[calc(var(--radius-lg)*var(--brm))] squircle border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div>
                  <Text as="p" variant="small" weight="medium">
                    {resource.title}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {resource.category}
                  </Text>
                </div>
                <Text as="span" variant="small" color="muted">
                  {resource.type}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
