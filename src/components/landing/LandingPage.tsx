"use client";

import { SiteFooter, SiteHeader } from "@/components/site";
import { 
  HeroSection, 
  CategoriesSection, 
  CarouselSection, 
  ResourcesSection, 
  FaqSection, 
  NewsletterSection 
} from "./index";

export function LandingPage() {
  const carouselTabs = [
    { id: "aicompanion", label: "AI Companion" },
    { id: "wellnesscheck", label: "Wellness Check" },
    { id: "expertsupport", label: "Expert Support" },
    { id: "feelgood", label: "Feel-good Library" }
  ];

  return (
    <main id="main-content" className="w-full overflow-hidden">
      <SiteHeader />
      <HeroSection />
      <CategoriesSection />
      <CarouselSection tabs={carouselTabs} />
      <ResourcesSection />
      <FaqSection />
      <NewsletterSection />
      <SiteFooter />
    </main>
  );
}
