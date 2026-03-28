import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiCalendar, FiMessageSquare } from "react-icons/fi";
import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import {
  actionTiles,
  dashboardMetrics,
  moodHistory,
  quizHistory,
  resources,
} from "@/content/mindbridge";

export default function StudentDashboardPage() {
  return (
    <>
      <PageIntro
        title="Start with the gentlest next step."
        description="Support, screening, and counselor access — surfaced so you don’t have to dig."
        actions={
          <>
            <Button href="/student/chat">Continue chat</Button>
            <Button href="/student/check-in" variant="warm">
              Log check-in
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.label} variant="default" padding="md">
            <Text as="p" variant="label" weight="medium" color="secondary">
              {metric.label}
            </Text>
            <Text as="p" variant="h3" weight="bold" className="mt-3">
              {metric.value}
            </Text>
            <Text as="p" variant="small" color="muted" className="mt-2">
              {metric.note}
            </Text>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card variant="elevated" padding="lg">
          <Text as="p" variant="h6" weight="bold">
            Today&apos;s actions
          </Text>
          <div className="mt-5 grid gap-3">
            {actionTiles.map((tile, index) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="interactive-panel group rounded-[1.5rem] p-4"
                data-active={index === 0}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Text as="p" variant="h6" weight="bold">
                      {tile.title}
                    </Text>
                    <Text as="p" variant="small" color="secondary" className="mt-2 max-w-[42ch]">
                      {tile.description}
                    </Text>
                  </div>
                  <FiArrowRight className="mt-1 h-4 w-4 text-[var(--color-brand-btn)] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card variant="subtle" padding="lg">
          <Text as="p" variant="h6" weight="bold">
            7-day mood rhythm
          </Text>
          <Text as="p" variant="small" color="secondary" className="mt-2">
            Enough signal to notice a pattern, without the obsession.
          </Text>

          <div className="chart-shell mt-8 flex h-52 items-end justify-between gap-3 rounded-[1.5rem] px-4 pb-4 pt-8">
            {moodHistory.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
                <div className="chart-bar-track flex h-32 w-full items-end justify-center rounded-full">
                  <div
                    className="chart-bar-fill w-full rounded-full"
                    style={{ height: `${item.score * 20}%` }}
                  />
                </div>
                <Text as="span" variant="label" weight="medium" color="muted">
                  {item.day}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between">
            <Text as="p" variant="h6" weight="bold">
              Recent screenings
            </Text>
            <Button href="/student/quizzes" variant="warm" size="sm">
              View all
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {quizHistory.map((entry) => (
              <div
                key={`${entry.type}-${entry.date}`}
                className="flex items-center justify-between rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div>
                  <Text as="p" variant="label" weight="bold">
                    {entry.type}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {entry.date}
                  </Text>
                </div>
                <div className="text-right">
                  <Text as="p" variant="label" weight="bold">
                    {entry.score}
                  </Text>
                  <Text as="p" variant="small" color="muted" className="mt-1">
                    {entry.severity}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <Text as="p" variant="h6" weight="bold">
              Saved and suggested
            </Text>
            <Button href="/student/resources" variant="warm" size="sm">
              Browse library
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {resources.slice(0, 4).map((resource, index) => (
              <div
                key={resource.title}
                className="rounded-[1.5rem] border p-4"
                style={{
                  borderColor: index === 0 ? "var(--color-brand-btn)" : "var(--color-border)",
                  background: index === 0 ? "var(--color-surface-strong)" : "var(--color-surface)",
                }}
              >
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  {resource.type === "Audio" ? (
                    <FiMessageSquare className="h-4 w-4" />
                  ) : resource.type === "Video" ? (
                    <FiCalendar className="h-4 w-4" />
                  ) : (
                    <FiBookOpen className="h-4 w-4" />
                  )}
                  <Text as="span" variant="label" weight="medium" color="secondary">
                    {resource.category}
                  </Text>
                </div>
                <Text as="p" variant="body" weight="bold" className="mt-3">
                  {resource.title}
                </Text>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Text as="p" variant="label" weight="medium" color="muted">
                    {resource.duration}
                  </Text>
                  {resource.saved ? <span className="status-pill">Saved</span> : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
