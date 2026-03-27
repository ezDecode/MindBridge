import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiClock, FiShield, FiStar } from "react-icons/fi";
import { Button, Card, Chip, Container, Text } from "@/components/ui";
import { GrassFlower, HeroIllustration } from "@/constants/assets";
import {
  chatMessages,
  featureShowcase,
  heroHighlights,
  journeyCards,
  resources,
  roleCards,
  trustChips,
  headspaceCategories,
  socialProof,
  beKindCTA,
  stayInLoop,
  faqItems,
} from "@/content/mindbridge";
import { SiteFooter, SiteHeader } from "@/components/site";

export function LandingPage() {
  return (
    <main id="main-content" className="w-full overflow-hidden">
      <SiteHeader />

      <section className="w-full pb-12 pt-6 sm:pb-16 sm:pt-8">
        <Container size="md">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-line)]">
                <FiShield className="h-4 w-4 text-[var(--color-brand-btn)]" />
                Campus-first mental wellness for Indian students
              </div>

              <Text as="h1" variant="display" weight="medium" className="mt-6 max-w-[11ch] text-balance">
                Support that feels calm before it feels clinical.
              </Text>

              <Text as="p" variant="lead" color="secondary" className="mt-5 max-w-[58ch]">
                MindBridge helps students do three things well: talk when the night feels heavy, screen what they are feeling with validated tools, and book a real counselor without friction.
              </Text>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/student/dashboard" size="lg">
                  Explore student flow
                </Button>
                <Button href="/student/chat" variant="secondary" size="lg">
                  Try support chat
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {trustChips.map((chip) => (
                  <Chip key={chip} className="bg-[var(--color-surface)]">
                    {chip}
                  </Chip>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {heroHighlights.map((item, index) => (
                  <Card
                    key={item.title}
                    variant={index === 1 ? "elevated" : "subtle"}
                    padding="md"
                    className="animate-scale-in rounded-[1.8rem]"
                  >
                    <Text as="p" variant="small" weight="medium" color="brand">
                      {item.title}
                    </Text>
                    <Text as="p" variant="small" color="secondary" className="mt-2">
                      {item.description}
                    </Text>
                  </Card>
                ))}
              </div>
            </div>

            <Card
              variant="elevated"
              padding="lg"
              className="animate-scale-in stagger-2 relative overflow-hidden rounded-[2rem] border-[var(--color-border-strong)]"
            >
              <div className="ambient-grid absolute inset-0 opacity-60" />
              <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--color-brand)_22%,transparent)] blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] blur-3xl" />

              <div className="relative flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Text as="p" variant="label" color="brand">
                      Daily rhythm
                    </Text>
                    <Text as="p" variant="h3" weight="medium" className="mt-3 max-w-[16ch]">
                      One space for chat, clarity, and next steps.
                    </Text>
                  </div>

                  <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-line)]">
                    Anonymous-first
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
                  <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.8)] p-4 shadow-[var(--shadow-line)]">
                    <div className="flex items-center justify-between">
                      <Text as="p" variant="small" weight="medium">
                        Tonight&apos;s support chat
                      </Text>
                      <Text as="p" variant="small" color="muted">
                        2:14 AM
                      </Text>
                    </div>
                    <div className="mt-4 space-y-3">
                      {chatMessages.slice(1, 4).map((message) => (
                        <div
                          key={`${message.role}-${message.content}`}
                          className={`max-w-[90%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 ${
                            message.role === "user"
                              ? "ml-auto bg-[var(--color-brand-btn)] text-[var(--color-brand-foreground)]"
                              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-[var(--shadow-line)]"
                          }`}
                        >
                          {message.content}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-line)]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
                          <FiCheckCircle className="h-4 w-4" />
                        </span>
                        <div>
                          <Text as="p" variant="small" weight="medium">
                            Screening ready
                          </Text>
                          <Text as="p" variant="small" color="secondary" className="mt-1">
                            PHQ-9 and GAD-7 live beside the chat.
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-line)]">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                          <FiClock className="h-4 w-4" />
                        </span>
                        <div>
                          <Text as="p" variant="small" weight="medium">
                            Book in under two minutes
                          </Text>
                          <Text as="p" variant="small" color="secondary" className="mt-1">
                            Anonymous, named, or urgent depending on the moment.
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 pt-4 shadow-[var(--shadow-line)]">
                      <HeroIllustration />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="page-section w-full">
        <Container size="md">
          <div className="mb-10 max-w-[42rem]">
            <Text as="p" variant="label" color="brand">
              Three things, done well
            </Text>
            <Text as="h2" variant="h1" weight="medium" className="mt-3 max-w-[14ch]">
              This product stays focused on the moments that matter.
            </Text>
            <Text as="p" variant="lead" color="secondary" className="mt-4 max-w-[56ch]">
              The spec intentionally cuts everything that pulls attention away from support, screening, and counselor access.
            </Text>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {journeyCards.map((item) => (
              <Card key={item.step} variant="elevated" padding="lg" className="rounded-[1.8rem]">
                <Text as="p" variant="label" color="brand">
                  {item.step}
                </Text>
                <Text as="h3" variant="h3" weight="medium" className="mt-4">
                  {item.title}
                </Text>
                <Text as="p" variant="body" color="secondary" className="mt-3">
                  {item.description}
                </Text>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="inside" className="page-section w-full">
        <Container size="md">
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <Card variant="elevated" padding="lg" className="rounded-[2rem]">
              <Text as="p" variant="label" color="brand">
                {featureShowcase[0].eyebrow}
              </Text>
              <Text as="h2" variant="h2" weight="medium" className="mt-3 max-w-[18ch]">
                {featureShowcase[0].title}
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-4 max-w-[58ch]">
                {featureShowcase[0].description}
              </Text>

              <div className="mt-8 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={`${message.role}-${message.content}`}
                    className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "ml-auto bg-[var(--color-brand-btn)] text-[var(--color-brand-foreground)]"
                        : "bg-[var(--color-gray-50)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>

              <Link
                href={featureShowcase[0].route}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-btn)]"
              >
                {featureShowcase[0].routeLabel}
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <div className="grid gap-5">
              {featureShowcase.slice(1).map((item) => (
                <Card key={item.title} variant="subtle" padding="lg" className="rounded-[2rem]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Text as="p" variant="label" color="brand">
                        {item.eyebrow}
                      </Text>
                      <Text as="h3" variant="h3" weight="medium" className="mt-3">
                        {item.title}
                      </Text>
                    </div>
                    <span className="rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] shadow-[var(--shadow-line)]">
                      In flow
                    </span>
                  </div>
                  <Text as="p" variant="body" color="secondary" className="mt-4">
                    {item.description}
                  </Text>
                  <Link
                    href={item.route}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-btn)]"
                  >
                    {item.routeLabel}
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="roles" className="page-section w-full">
        <Container size="md">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[42rem]">
              <Text as="p" variant="label" color="brand">
                For each role
              </Text>
              <Text as="h2" variant="h1" weight="medium" className="mt-3">
                One system, three clean views.
              </Text>
              <Text as="p" variant="lead" color="secondary" className="mt-4">
                Students need warmth, counselors need triage, and admins need signal. The routes below stay focused on those jobs.
              </Text>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-line)]">
              <FiStar className="h-4 w-4 text-[var(--color-warning)]" />
              Same tokens, calmer hierarchy, less noise
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {roleCards.map((item, index) => (
              <Card
                key={item.title}
                variant={index === 1 ? "elevated" : "default"}
                padding="lg"
                className="rounded-[2rem]"
              >
                <Text as="p" variant="label" color="brand">
                  {item.eyebrow}
                </Text>
                <Text as="h3" variant="h3" weight="medium" className="mt-3">
                  {item.title}
                </Text>
                <Text as="p" variant="body" color="secondary" className="mt-4">
                  {item.description}
                </Text>
                <Button href={item.route} variant={index === 1 ? "primary" : "secondary"} className="mt-6">
                  {item.routeLabel}
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="resources" className="page-section w-full pb-4">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="relative overflow-hidden rounded-[2.25rem]">
            <div className="absolute inset-x-0 bottom-0">
              <GrassFlower className="h-auto w-full opacity-80" />
            </div>

            <div className="relative">
              <div className="max-w-[44rem]">
                <Text as="p" variant="label" color="brand">
                  Support library
                </Text>
                <Text as="h2" variant="h1" weight="medium" className="mt-3 max-w-[15ch]">
                  Articles, audio, and video for the moments between sessions.
                </Text>
                <Text as="p" variant="lead" color="secondary" className="mt-4 max-w-[58ch]">
                  The content layer stays curated and compact. No noisy marketplace, no recommendation engine, just grounded resources that make sense in a student context.
                </Text>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-line)]">
                  <Text as="p" variant="small" weight="medium">
                    Featured route
                  </Text>
                  <Text as="p" variant="h3" weight="medium" className="mt-3">
                    Browse the resource hub with category filters and saved items.
                  </Text>
                  <Text as="p" variant="small" color="secondary" className="mt-3 max-w-[34ch]">
                    This route is meant to feel supportive even when a student is not ready to chat or book.
                  </Text>
                  <Button href="/student/resources" variant="secondary" className="mt-6">
                    Open resource hub
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.slice(0, 4).map((resource) => (
                    <div
                      key={resource.title}
                      className="rounded-[1.5rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.84)] p-4 shadow-[var(--shadow-line)]"
                    >
                      <Text as="p" variant="small" weight="medium" color="brand">
                        {resource.type}
                      </Text>
                      <Text as="p" variant="small" color="secondary" className="mt-1">
                        {resource.category} · {resource.duration}
                      </Text>
                      <Text as="p" variant="body" weight="medium" className="mt-4">
                        {resource.title}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Headspace-inspired: "What kind of support?" */}
      <section className="page-section w-full">
        <Container size="md">
          <div className="text-center">
            <Text as="p" variant="label" color="brand">
              Explore what fits
            </Text>
            <Text as="h2" variant="h1" weight="medium" className="mx-auto mt-3 max-w-[18ch]">
              What kind of support are you looking for?
            </Text>
            <Text as="p" variant="lead" color="secondary" className="mx-auto mt-4 max-w-[52ch]">
              Everyone carries something different. Pick what resonates and we will guide you to the right place.
            </Text>
          </div>
          <div className="mx-auto mt-10 flex max-w-[48rem] flex-wrap justify-center gap-3">
            {headspaceCategories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                className="interactive-panel flex items-center gap-2.5 rounded-full px-5 py-3 text-[0.95rem] font-medium text-[var(--color-text-primary)]"
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-14 grid max-w-[54rem] gap-6 sm:grid-cols-3">
            {socialProof.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <Text as="p" variant="h2" weight="semibold" color="brand">
                  {stat.value}
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-1">
                  {stat.label}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Headspace-inspired: "Be kind to your mind" CTA */}
      <section className="page-section w-full">
        <Container size="md">
          <Card variant="elevated" padding="lg" className="relative overflow-hidden rounded-[2.25rem]">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-brand)_18%,transparent)] blur-3xl" />
            <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <Text as="p" variant="label" color="brand">
                  {beKindCTA.eyebrow}
                </Text>
                <Text as="h2" variant="h1" weight="medium" className="mt-3 max-w-[16ch]">
                  {beKindCTA.headline}
                </Text>
                <Text as="p" variant="lead" color="secondary" className="mt-4 max-w-[54ch]">
                  {beKindCTA.description}
                </Text>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/student/dashboard" size="lg">
                    Get your calm space
                  </Button>
                  <Button href="/student/chat" variant="secondary" size="lg">
                    Try the chat first
                  </Button>
                </div>
              </div>
              <div className="grid gap-3">
                {beKindCTA.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-[1.4rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.8)] p-4 shadow-[var(--shadow-line)]"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
                      <FiCheckCircle className="h-3.5 w-3.5" />
                    </span>
                    <Text as="p" variant="body" color="secondary">
                      {feature}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Headspace-inspired: FAQ */}
      <section className="page-section w-full pb-4">
        <Container size="md">
          <div className="mb-10 max-w-[42rem]">
            <Text as="p" variant="label" color="brand">
              Common questions
            </Text>
            <Text as="h2" variant="h1" weight="medium" className="mt-3">
              Frequently asked questions
            </Text>
          </div>
          <div className="grid gap-3">
            {faqItems.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-line)] transition-colors duration-200 open:border-[var(--color-border-strong)] open:bg-[var(--color-surface-tinted)]"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-[var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
                  <Text as="span" variant="body" weight="medium">
                    {faq.question}
                  </Text>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <Text as="p" variant="body" color="secondary" className="max-w-[64ch]">
                    {faq.answer}
                  </Text>
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Headspace-inspired: Stay in the loop newsletter */}
      <section className="w-full pb-8">
        <Container size="md">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface),var(--color-brand)_8%)] p-8 text-center shadow-[var(--shadow-line)] sm:p-10">
            <Text as="h2" variant="h2" weight="medium">
              {stayInLoop.headline}
            </Text>
            <Text as="p" variant="body" color="secondary" className="mx-auto mt-3 max-w-[48ch]">
              {stayInLoop.description}
            </Text>
            <div className="mx-auto mt-6 flex max-w-md gap-3">
              <input
                type="email"
                placeholder="Your college email"
                className="min-h-12 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-line)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-btn)] focus:shadow-[var(--ring-shadow)]"
              />
              <Button size="md">Subscribe</Button>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </main>
  );
}
