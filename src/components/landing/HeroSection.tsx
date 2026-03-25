"use client";

import { Container, Chip, Button, Text } from "../ui";
import { HeroIllustration } from "../../constants/assets";

const APP_NAME = "MindBridge";
const APP_TAGLINE = "Your Mental Health Companion";
const APP_DESCRIPTION = "A safe space to understand, track, and improve your mental well-being. Chat with AI, take validated quizzes, book counselors, and access resources, all privately.";
const HERO_FEATURES = ["Anonymous", "24/7 Support", "Free For Students"];

export function HeroSection() {
  return (
    <section className="min-h-[75vh] w-full flex flex-col items-center justify-center bg-[var(--color-background)] py-[clamp(2rem,8vw,4rem)] overflow-hidden">
      <Container size="sm">
        <div className="flex flex-col items-center text-center">
          
          {/* Logo */}
          <Text 
            variant="heading" 
            weight="semibold" 
            as="h1"
            className="mb-[clamp(1.5rem,4vw,2rem)] animate-fade-in-up"
          >
            {APP_NAME}
          </Text>

          {/* Heading */}
          <h2 className="text-[clamp(2rem,6vw,3.75rem)] font-serif font-bold tracking-tight text-[var(--color-text-primary)] mb-[clamp(1rem,3vw,1.5rem)] leading-[1.15] animate-fade-in animation-delay-100">
            {APP_TAGLINE}
          </h2>

          {/* Description */}
          <Text 
            variant="body" 
            color="secondary"
            className="max-w-lg mb-[clamp(1.25rem,4vw,1.75rem)] animate-fade-in animation-delay-200"
          >
            {APP_DESCRIPTION}
          </Text>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-[clamp(1.5rem,5vw,2.5rem)] animate-fade-in animation-delay-300">
            {HERO_FEATURES.map((feature: string) => (
              <Chip key={feature}>{feature}</Chip>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-[clamp(2rem,6vw,3rem)]">
            <Button href="/register" variant="primary" size="md" className="animate-scale-in animation-delay-400">
              Get Started
            </Button>
            <Button href="/chat" variant="secondary" size="md" className="bg-[var(--color-surface-tinted)] animate-scale-in animation-delay-500">
              Try Free
            </Button>
          </div>

          {/* Hero Illustration */}
          <div className="w-full flex justify-center animate-fade-in-up animation-delay-600">
            <HeroIllustration />
          </div>

        </div>
      </Container>
    </section>
  );
}