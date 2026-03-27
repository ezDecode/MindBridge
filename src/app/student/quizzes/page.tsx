import { PageIntro } from "@/components/site";
import { Button, Card, Chip, SelectionCard, Stepper, Text } from "@/components/ui";
import { quizCards, quizHistory, quizQuestions } from "@/content/mindbridge";

const answerOptions = ["Not at all", "Several days", "More than half", "Nearly every day"];

export default function StudentQuizzesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Mental health quizzes"
        title="Validated screening with plain-language framing."
        description="Clarifying, not alarming. See what a score means and what a calm next step could be."
        actions={
          <>
            <Button href="/student/book">Book after screening</Button>
            <Button href="/student/chat" variant="secondary">
              Talk first
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between">
            <Text as="p" variant="small" weight="medium">
              Choose a screening
            </Text>
            <Stepper totalSteps={3} currentStep={1} />
          </div>
          <div className="mt-5 grid gap-3">
            {quizCards.map((card, index) => (
              <SelectionCard
                key={card.name}
                selected={index === 0}
                label={card.name}
                sublabel={`${card.label} · ${card.note}`}
              />
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-warning-soft)] p-4">
            <Text as="p" variant="small" weight="medium">
              High-score path
            </Text>
            <Text as="p" variant="small" color="secondary" className="mt-2">
              Score 15+? Two calm options: talk to AI first, or book a counselor now.
            </Text>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Questionnaire preview
            </Text>
            <div className="mt-5 space-y-4">
              {quizQuestions.map((question, index) => (
                <div key={question} className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <Text as="p" variant="small" weight="medium">
                    {index + 1}. {question}
                  </Text>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {answerOptions.map((option, optionIndex) => (
                      <Chip
                        key={option}
                        className={optionIndex === 1 ? "border-[var(--color-brand-btn)] bg-[var(--color-surface-strong)] text-[var(--color-text-primary)]" : ""}
                      >
                        {option}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="subtle" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Last five attempts
            </Text>
            <div className="mt-4 space-y-3">
              {quizHistory.map((entry) => (
                <div
                  key={`${entry.type}-${entry.date}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <div>
                    <Text as="p" variant="small" weight="medium">
                      {entry.type}
                    </Text>
                    <Text as="p" variant="small" color="secondary" className="mt-1">
                      {entry.date}
                    </Text>
                  </div>
                  <Text as="span" variant="small" color="secondary">
                    {entry.severity}
                  </Text>
                  <Text as="span" variant="small" weight="medium">
                    {entry.score}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
