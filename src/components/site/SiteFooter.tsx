import Link from "next/link";
import { FiHeart, FiMessageCircle, FiCalendar, FiShield, FiArrowRight, FiBook, FiInfo, FiActivity } from "react-icons/fi";
import { Container, Text } from "@/components/ui";

const footerNavigation = {
  tools: [
    { href: "/student/chat", label: "AI Chat Support", icon: FiMessageCircle },
    { href: "/student/check-in", label: "Mood Check-in", icon: FiActivity },
    { href: "/student/resources", label: "Resource Library", icon: FiBook },
    { href: "/student/book", label: "Counselor Booking", icon: FiCalendar },
  ],
  support: [
    { href: "/#faq", label: "Help Center", icon: FiInfo },
    { href: "/counselor/dashboard", label: "Counselor Portal", icon: FiShield },
  ],
};

export function SiteFooter() {
  return (
    <footer className="w-full pb-8 pt-4 sm:pb-10">
      <Container size="md">
        <div className="relative overflow-hidden border-none bg-[var(--color-primary-light)] rounded-[calc(var(--radius-lg)*var(--brm))] squircle px-5 py-8 sm:px-10 sm:py-14">
          <div className="relative">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Brand & Mission */}
              <div className="max-w-[42rem]">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-[var(--color-border-warm)]">
                  <FiHeart className="h-4 w-4 text-[var(--color-primary)]" />
                  <Text as="span" variant="label" weight="bold" className="text-[var(--color-text-primary)] uppercase tracking-wide">
                    MindBridge
                  </Text>
                </div>
                <Text as="h2" variant="h4" weight="bold" className="mt-5 md:mt-6 text-[var(--color-text-primary)] leading-tight md:text-h3">
                  Life-changing habits start with a single calm conversation.
                </Text>
                <Text as="p" variant="body" className="mt-3 md:mt-4 max-w-[45ch] text-[var(--color-text-secondary)] leading-relaxed">
                  MindBridge makes it easy to look after your mind — a better day at college, in the hostel, and all the moments in between.
                </Text>
              </div>

              {/* Navigation Grid */}
              <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
                <div>
                  <Text as="p" variant="label" weight="bold" className="text-[var(--color-text-primary)] uppercase tracking-widest opacity-60">
                    Explore
                  </Text>
                  <div className="mt-4 md:mt-5 grid gap-2">
                    {footerNavigation.tools.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex min-h-[2.5rem] items-center gap-2 text-label font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                      >
                        {item.label}
                        <FiArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <Text as="p" variant="label" weight="bold" className="text-[var(--color-text-primary)] uppercase tracking-widest opacity-60">
                    Support
                  </Text>
                  <div className="mt-4 md:mt-5 grid gap-2">
                    {footerNavigation.support.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex min-h-[2.5rem] items-center gap-2 text-label font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                      >
                        {item.label}
                        <FiArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Support Strip */}
            <div className="mt-10 md:mt-14 rounded-[calc(var(--radius-md)*var(--brm))] squircle bg-white/60 border border-[var(--color-warning)]/20 px-4 py-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-soft)]">
                  <FiHeart className="h-4.5 w-4.5 text-[var(--color-warning)]" />
                </div>
                <div>
                  <Text as="p" variant="label" weight="bold" className="text-[var(--color-text-primary)]">
                    Need urgent help?
                  </Text>
                  <Text as="p" variant="small" className="text-[var(--color-text-secondary)]">
                    In immediate danger? Contact a crisis helpline first.
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-warning)] rounded-full text-white shadow-md shadow-[var(--color-warning)]/20 transition-opacity duration-150 hover:opacity-90">
                <Text as="span" variant="label" weight="bold">
                  iCall · 9152987821
                </Text>
              </div>
            </div>

            {/* Copyright & Meta */}
            <div className="mt-8 md:mt-10 flex flex-col items-center justify-between gap-3 md:gap-4 border-t border-[var(--color-border-warm)]/60 pt-6 sm:flex-row">
              <Text as="p" variant="small" className="text-[var(--color-text-muted)]">
                © 2026 MindBridge. Built with care for campus wellness.
              </Text>
              <div className="flex items-center gap-2 opacity-80">
                <FiHeart className="h-4 w-4 text-[(--color-primary)]" />
                <Text as="span" variant="small" className="text-[var(--color-text-muted)]">
                  Made for students, by students
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
