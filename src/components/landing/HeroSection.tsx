"use client";

import { Container, Chip, Button, Text } from "../ui";
import { HeroIllustration } from "../../constants/assets";

const APP_NAME = "MindBridge";
const APP_TAGLINE = "Your Mental Health Companion";
const APP_DESCRIPTION = "A safe space to understand, track, and improve your mental well-being. Chat with AI, take validated quizzes, book counselors, and access resources, all privately.";
const HERO_FEATURES = ["Anonymous", "24/7 Support", "Free For Students"];

export function HeroSection() {
  return (
    <section className="min-h-[75vh] w-full flex flex-col items-center justify-center bg-[var(--color-background)] px-5 py-16 md:px-6 overflow-hidden">
      <Container size="sm">
        <div className="flex flex-col items-center text-center">
          
          {/* Logo */}
          <Text 
            variant="heading" 
            weight="semibold" 
            as="h1"
            className="mb-6 animate-fade-in"
          >
            {APP_NAME}
          </Text>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[var(--color-text-primary)] mb-5 leading-[1.15] animate-fade-in animation-delay-100">
            {APP_TAGLINE}
          </h2>

          {/* Description */}
          <Text 
            variant="body" 
            color="secondary"
            className="max-w-lg mb-8 animate-fade-in animation-delay-200"
          >
            {APP_DESCRIPTION}
          </Text>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10 animate-fade-in animation-delay-300">
            {HERO_FEATURES.map((feature: string) => (
              <Chip key={feature}>{feature}</Chip>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <Button href="/register" variant="primary" size="md">
              Get Started
            </Button>
            <Button href="/chat" variant="ghost" size="md">
              Start Anonymously
            </Button>
          </div>

          {/* Hero Illustration */}
          <div className="w-full flex justify-center animate-fade-in animation-delay-500">
            <HeroIllustration />
          </div>

        </div>
      </Container>
    </section>
  );
}