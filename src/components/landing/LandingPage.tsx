import { SiteFooter, SiteHeader } from "@/components/site";
import { Hero } from "./Hero";
import { Journey, Features, Roles, Resources, SupportCategories } from "./Sections";
import { CTA, FAQ, Newsletter } from "./BottomCTA";

export function LandingPage() {
  return (
    <main id="main-content" className="w-full overflow-hidden">
      <SiteHeader />
      <Hero />
      <Journey />
      <Features />
      <Roles />
      <Resources />
      <SupportCategories />
      <CTA />
      <FAQ />
      <Newsletter />
      <SiteFooter />
    </main>
  );
}
