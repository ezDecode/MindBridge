import Link from "next/link";
import { Icon } from '@iconify/react';
import { Container, Text, BrandLogo } from "@/components/ui";

const footerNavigation = {
 tools: [
 { href: "/student/chat", label: "AI Chat Support", icon: "tabler:message-circle" },
 { href: "/student/check-in", label: "Mood Check-in", icon: "tabler:heartbeat" },
 { href: "/student/resources", label: "Resource Library", icon: "tabler:book" },
 { href: "/student/book", label: "Counselor Booking", icon: "tabler:calendar" },
 ],
 support: [
 { href: "/#faq", label: "Help Center", icon: "tabler:info-circle" },
 { href: "/counselor/dashboard", label: "Counselor Portal", icon: "tabler:shield" },
 ],
};

export function SiteFooter() {
 return (
 <footer className="w-full pb-12 pt-16 border-t border-border bg-background">
 <Container size="md">
 <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
 {/* Brand & Mission */}
 <div className="max-w-[42rem]">
 <div className="inline-flex items-center gap-3 mb-6">
 <Link href="/" suppressHydrationWarning className="inline-flex items-center gap-3 group">
 <BrandLogo className="h-6 w-6 text-white" />
 <Text as="span" variant="label" weight="bold">
 MindBridge
 </Text>
 </Link>
 </div>
 <Text as="h2" variant="h3" weight="semibold" className="mb-4 leading-tight">
 Life-changing habits start with a single calm conversation.
 </Text>
 <Text as="p" variant="body" color="secondary" className="max-w-[45ch] leading-relaxed">
 MindBridge makes it easy to look after your mind — a better day at college, in the hostel, and all the moments in between.
 </Text>
 </div>

 {/* Navigation Grid */}
 <div className="grid gap-8 sm:grid-cols-2">
 <div>
 <Text as="p" variant="label" weight="bold" color="muted" className="mb-6">
 Explore
 </Text>
 <div className="grid gap-3">
 {footerNavigation.tools.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className="group flex items-center gap-2 text-[1.0625rem] text-text-muted transition-colors hover:text-white"
 >
 {item.label}
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
 </Link>
 ))}
 </div>
 </div>
 <div>
 <Text as="p" variant="label" weight="bold" color="muted" className="mb-6">
 Support
 </Text>
 <div className="grid gap-3">
 {footerNavigation.support.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className="group flex items-center gap-2 text-[1.0625rem] text-text-muted transition-colors hover:text-white"
 >
 {item.label}
 <Icon icon="tabler:arrow-right" className="h-3.5 w-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
 </Link>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Emergency Support Strip */}
 <div className="mt-16 rounded-lg bg-surface border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
 <div className="flex items-center gap-4 text-center sm:text-left">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-danger/10 text-danger">
 <Icon icon="tabler:heart" className="h-5 w-5" />
 </div>
 <div>
 <Text as="p" weight="semibold" className="text-white">
 Need urgent help?
 </Text>
 <Text as="p" variant="small" color="secondary">
 In immediate danger? Contact a crisis helpline first.
 </Text>
 </div>
 </div>
 <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-md text-black font-semibold text-[1.0625rem] transition-opacity hover:opacity-90">
 iCall · 9152987821
 </div>
 </div>

 {/* Copyright & Meta */}
 <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
 <Text as="p" variant="small" color="muted">
 © 2026 MindBridge. Built with care for campus wellness.
 </Text>
 <div className="flex items-center gap-2 text-text-dim">
 <Icon icon="tabler:heart" className="h-4 w-4" />
 <Text as="span" variant="small">
 Made for students, by students
 </Text>
 </div>
 </div>
 </Container>
 </footer>
 );
}

