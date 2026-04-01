import { Container } from "@/components/ui";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen w-full py-6 sm:py-8">
      <Container size="lg">
        <div className="flex min-w-0 flex-col gap-5 md:gap-6">
          {children}
        </div>
      </Container>
    </main>
  );
}
