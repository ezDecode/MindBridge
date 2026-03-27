import Link from "next/link";
import { Container, Text } from "@/components/ui";

const footerLinks = [
  { href: "/student/chat", label: "Chat" },
  { href: "/student/quizzes", label: "Quizzes" },
  { href: "/student/book", label: "Booking" },
  { href: "/counselor/dashboard", label: "Counselor" },
];

export function SiteFooter() {
  return (
    <footer className="w-full py-10">
      <Container size="md">
        <div className="section-divider rounded-[2rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface),var(--color-brand)_6%)] px-6 py-8 shadow-[var(--shadow-line)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[42rem]">
              <Text as="p" variant="label" color="brand">
                MindBridge
              </Text>
              <Text as="h2" variant="h3" weight="medium" className="mt-3">
                Built to help students reach a calmer next step, not a louder interface.
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-3 max-w-[58ch]">
                The routes in this prototype focus on the student flow, counselor response, and institution-level visibility without overcomplicating the experience.
              </Text>
            </div>

            <div className="flex flex-wrap gap-4">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-brand-btn)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
