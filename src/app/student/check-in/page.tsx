import { PageIntro } from "@/components/site";
import { Button, Card, SelectionCard, Text } from "@/components/ui";
import { moodHistory, moodOptions } from "@/content/mindbridge";

export default function StudentCheckInPage() {
  return (
    <>
      <PageIntro
        eyebrow="Daily mood check-in"
        title="A 15-second log that still feels considered."
        description="The check-in route should stay simple: one mood selection, one optional note, and a soft trend line that helps the student notice how the week is moving."
        actions={
          <>
            <Button href="/student/dashboard">Save check-in</Button>
            <Button href="/student/chat" variant="secondary">
              Talk instead
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Card variant="elevated" padding="lg">
          <Text as="p" variant="small" weight="medium">
            How does today feel?
          </Text>
          <div className="mt-5 grid gap-3">
            {moodOptions.map((option, index) => (
              <SelectionCard
                key={option.label}
                selected={index === 2}
                label={`${option.emoji} ${option.label}`}
                sublabel={option.note}
              />
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <Text as="p" variant="small" weight="medium">
              Optional note
            </Text>
            <textarea
              rows={5}
              defaultValue="The day was manageable, but I still felt that low pressure in my chest after classes."
              className="mt-3 w-full resize-none rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-gray-50)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-brand-btn)]"
            />
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="subtle" padding="lg">
            <Text as="p" variant="small" weight="medium">
              30-day trend preview
            </Text>
            <Text as="p" variant="small" color="secondary" className="mt-2">
              No heatmap, no excessive analysis, just enough shape to help a student notice whether they are gradually sinking or lifting.
            </Text>

            <div className="mt-8 flex h-56 items-end justify-between gap-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 pb-4 pt-8">
              {[...moodHistory, ...moodHistory].map((item, index) => (
                <div key={`${item.day}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-[8.5rem] w-full items-end justify-center rounded-full bg-[var(--color-gray-100)]">
                    <div
                      className="w-full rounded-full bg-linear-to-t from-[var(--color-success)] to-[var(--color-brand)]"
                      style={{ height: `${item.score * 18}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Gentle prompt
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-3">
              You have checked in four times this week. If the low feeling keeps hanging around, taking PHQ-9 could give you a clearer read before it turns into guesswork.
            </Text>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/student/quizzes">Take PHQ-9</Button>
              <Button href="/student/resources" variant="secondary">
                Open sleep resources
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
