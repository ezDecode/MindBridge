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
    <footer className="w-full pb-12 pt-10">
      <Container size="md">
        <div className="section-divider rounded-[2rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface),var(--color-brand)_6%)] px-6 py-8 shadow-[var(--shadow-line)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-[44rem]">
              <Text as="p" variant="label" color="brand">
                MindBridge
              </Text>
              <Text as="h2" variant="h3" weight="medium" className="mt-3">
                Life-changing habits start with a single calm conversation.
              </Text>
              <Text as="p" variant="body" color="secondary" className="mt-3 max-w-[58ch]">
                MindBridge makes it easy to look after your mind — a better day at college, in the hostel, and all the moments in between.
              </Text>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-line)]">
                <Text as="p" variant="small" weight="medium">
                  Quick routes
                </Text>
                <div className="mt-4 grid gap-2">
                  {footerLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-[1rem] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-[background-color,color] duration-200 hover:bg-[var(--color-surface-tinted)] hover:text-[var(--color-brand-btn)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-btn)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-line)]">
                <Text as="p" variant="small" weight="medium">
                  Need urgent help?
                </Text>
                <Text as="p" variant="small" color="secondary" className="mt-3">
                  If someone is in immediate danger, route to local emergency services or a crisis helpline before continuing with the app.
                </Text>
                <Text as="p" variant="small" weight="medium" color="brand" className="mt-4">
                  iCall · 9152987821
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
