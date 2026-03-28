import { FiBookmark, FiHeadphones, FiPlayCircle, FiSearch } from "react-icons/fi";
import { PageIntro } from "@/components/site";
import { Button, Card, Chip, Text } from "@/components/ui";
import { resourceFilters, resources } from "@/content/mindbridge";

export default function StudentResourcesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Resource hub"
        title="Curated support for the spaces between conversations."
        description="Filter by what you're carrying. Save what you want to return to."
        actions={
          <>
            <Button href="/student/chat">Ask for a recommendation</Button>
            <Button href="/student/dashboard" variant="warm">
              Back to dashboard
            </Button>
          </>
        }
      />

      <Card variant="elevated" padding="lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[40rem]">
            <Text as="p" variant="small" weight="medium">
              Featured resource
            </Text>
            <Text as="h2" variant="h3" weight="bold" className="mt-3">
              A calmer way to come down after an exam spiral
            </Text>
            <Text as="p" variant="body" color="secondary" className="mt-3">
              Short read first, then a two-minute breathing reset to settle before your next step.
            </Text>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/student/check-in" variant="warm">
              Log mood first
            </Button>
            <Button href="/student/book">Book if needed</Button>
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {resourceFilters.map((filter, index) => (
              <Chip
                key={filter}
                className={index === 0 ? "border-[var(--color-brand-btn)] bg-[var(--color-surface-strong)] text-[var(--color-text-primary)]" : ""}
              >
                {filter}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">
            <FiSearch className="h-4 w-4" />
            Search is deferred for MVP
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.title} variant="subtle" padding="lg" className="rounded-[1.9rem]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-brand-btn)] shadow-[var(--shadow-line)]">
                  {resource.type === "Audio" ? (
                    <FiHeadphones className="h-5 w-5" />
                  ) : resource.type === "Video" ? (
                    <FiPlayCircle className="h-5 w-5" />
                  ) : (
                    <FiBookmark className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <Text as="p" variant="small" weight="medium">
                    {resource.type}
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-1">
                    {resource.category} · {resource.duration}
                  </Text>
                </div>
              </div>

              {resource.saved ? (
                <span className="rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-brand-btn)] shadow-[var(--shadow-line)]">
                  Saved
                </span>
              ) : null}
            </div>

            <Text as="p" variant="body" weight="medium" className="mt-5 max-w-[30ch]">
              {resource.title}
            </Text>
          </Card>
        ))}
      </div>
    </>
  );
}
