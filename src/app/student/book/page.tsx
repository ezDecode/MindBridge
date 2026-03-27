import { PageIntro } from "@/components/site";
import { Button, Card, SelectionCard, Stepper, Text } from "@/components/ui";
import { bookingSlots, bookingTypes, counselors } from "@/content/mindbridge";

export default function StudentBookPage() {
  return (
    <>
      <PageIntro
        eyebrow="Counselor booking"
        title="A booking flow that respects both urgency and privacy."
        description="Students should be able to choose whether they stay anonymous, share their name, or mark a booking as urgent. The route stays short and slot-based so it never feels like paperwork."
        actions={
          <>
            <Button href="/student/dashboard">Confirm booking</Button>
            <Button href="/student/chat" variant="secondary">
              Talk first
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="grid gap-4">
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between">
              <Text as="p" variant="small" weight="medium">
                Step 1 · Booking type
              </Text>
              <Stepper totalSteps={3} currentStep={2} />
            </div>
            <div className="mt-5 grid gap-3">
              {bookingTypes.map((type, index) => (
                <SelectionCard
                  key={type.label}
                  selected={index === 0}
                  label={type.label}
                  sublabel={type.note}
                />
              ))}
            </div>
          </Card>

          <Card variant="subtle" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Step 2 · Choose a counselor
            </Text>
            <div className="mt-5 grid gap-3">
              {counselors.map((counselor, index) => (
                <div
                  key={counselor.name}
                  className={`rounded-[1.5rem] border p-4 ${
                    index === 0
                      ? "border-[var(--color-brand-btn)] bg-[var(--color-surface-strong)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <Text as="p" variant="small" weight="medium">
                    {counselor.name}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {counselor.focus}
                  </Text>
                  <Text as="p" variant="small" color="muted" className="mt-3">
                    {counselor.availability}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card variant="elevated" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Step 3 · Pick a slot
            </Text>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {bookingSlots.map((slot, index) => (
                <button
                  key={slot}
                  type="button"
                  className={`interactive-panel rounded-[1.4rem] px-4 py-3 text-left text-sm focus-visible:outline-none ${
                    index === 0
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                  data-active={index === 0}
                  aria-pressed={index === 0}
                >
                  {slot}
                </button>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <Text as="p" variant="small" weight="medium">
              Booking summary
            </Text>
            <div className="mt-5 space-y-3 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between">
                <Text as="span" variant="small" color="secondary">
                  Type
                </Text>
                <Text as="span" variant="small" weight="medium">
                  Anonymous
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text as="span" variant="small" color="secondary">
                  Counselor
                </Text>
                <Text as="span" variant="small" weight="medium">
                  Dr. Meera Shah
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text as="span" variant="small" color="secondary">
                  Slot
                </Text>
                <Text as="span" variant="small" weight="medium">
                  Tue · 2:00 PM
                </Text>
              </div>
            </div>

            <Text as="p" variant="small" color="secondary" className="mt-4">
              Confirmation email and 24-hour reminder should be handled after booking. If the booking is urgent, the counselor also gets a realtime alert.
            </Text>
          </Card>
        </div>
      </div>
    </>
  );
}
