"use client";

import { SiteFooter, SiteHeader } from "@/components/site";
import { Hero } from "./Hero";
import { Resources, SupportCategories } from "./Sections";
import { FAQ, Newsletter } from "./BottomCTA";
import { sectionReveal } from "./motion";
import UnifiedSection from "./UnifiedSection";

export function LandingPage() {
  const unifiedSectionTabs = [
    { id: "aicompanion", label: "AI Companion" },
    { id: "wellnesscheck", label: "Wellness Check" },
    { id: "expertsupport", label: "Expert Support" },
    { id: "feelgood", label: "Feel-good Library" }
  ];

  return (
    <main id="main-content" className="w-full overflow-hidden">
      <SiteHeader />
      <Hero />
      <UnifiedSection tabs={unifiedSectionTabs} />
      <Resources />
      <SupportCategories />
      <FAQ />
      <Newsletter />
      <SiteFooter />
    </main>
  );
}