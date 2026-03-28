import Link from "next/link";
import { FiAlertCircle, FiArrowRight, FiPhone } from "react-icons/fi";
import { PageIntro } from "@/components/site";
import { Button, Card, Text } from "@/components/ui";
import { chatMessages, sessionHistory, suggestedActions } from "@/content/mindbridge";

export default function StudentChatPage() {
  return (
    <>
      <PageIntro
        eyebrow="Support chat"
        title="Short replies, steady tone, one next step at a time."
        description="A calm companion, not a wall of AI text. Crisis support stays close without overwhelming."
        actions={
          <>
            <Button href="/student/quizzes">Take PHQ-9</Button>
            <Button href="/student/book" variant="warm">
              Book counselor
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card variant="subtle" padding="lg">
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] p-4">
            <FiAlertCircle className="mt-0.5 h-5 w-5 text-[var(--color-danger)]" />
            <div>
              <Text as="p" variant="small" weight="medium">
                Crisis support stays close
              </Text>
              <Text as="p" variant="small" color="secondary" className="mt-2">
                Mentions of self-harm surface iCall `9152987821` and suggest human help immediately.
              </Text>
            </div>
          </div>

          <div className="mt-5 space-y-3" aria-label="Conversation preview" role="log">
            {chatMessages.map((message) => (
              <div
                key={`${message.role}-${message.content}`}
                className={`max-w-[90%] rounded-[1.55rem] px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-[var(--color-brand-btn)] text-[var(--color-brand-foreground)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-[var(--shadow-line)]"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {suggestedActions.map((action) => (
              <Button key={action} variant="warm" size="sm">
                {action}
              </Button>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="default" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Recent sessions
            </Text>
            <div className="mt-4 space-y-3">
              {sessionHistory.map((session) => (
                <div
                  key={session.title}
                  className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <Text as="p" variant="small" weight="medium">
                    {session.title}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {session.time}
                  </Text>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <Text as="p" variant="small" weight="medium">
                  Need a human next?
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-2 max-w-[32ch]">
                  Escalation that feels supportive, not abrupt.
                </Text>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                <FiPhone className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <a
                href="tel:9152987821"
                className="interactive-panel flex items-center justify-between rounded-[1.4rem] px-4 py-3"
              >
                <div>
                  <Text as="p" variant="small" weight="medium">
                    Call iCall helpline
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    9152987821
                  </Text>
                </div>
                <FiArrowRight className="h-4 w-4 text-[var(--color-brand-btn)]" />
              </a>
              <Link
                href="/student/book"
                className="interactive-panel flex items-center justify-between rounded-[1.4rem] px-4 py-3"
              >
                <div>
                  <Text as="p" variant="small" weight="medium">
                    Book a counselor session
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    Anonymous, named, or crisis booking
                  </Text>
                </div>
                <FiArrowRight className="h-4 w-4 text-[var(--color-brand-btn)]" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
