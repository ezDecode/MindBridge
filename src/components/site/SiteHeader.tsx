import Link from "next/link";
import { Button, Container, Text } from "@/components/ui";
import { marketingNav } from "@/content/mindbridge";

export function SiteHeader() {
  return (
    <header className="w-full py-5">
      <Container size="md">
        <div className="surface-panel flex items-center justify-between rounded-full px-4 py-3 sm:px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-btn)] text-sm font-medium text-[var(--color-brand-foreground)]">
              MB
            </span>
            <div className="hidden sm:block">
              <Text as="p" variant="small" weight="medium" color="muted" className="uppercase tracking-[0.18em]">
                MindBridge
              </Text>
              <Text as="p" variant="small" color="secondary" className="mt-0.5">
                Calm support for campus life
              </Text>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/login" variant="ghost" size="sm">
              Login
            </Button>
            <Button href="/student/dashboard" size="sm">
              Explore flow
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
