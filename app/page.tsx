import { AppFooter } from "@/components/landing/app-footer";
import { AppNavbar } from "@/components/landing/app-navbar";
import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <AppNavbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <AppFooter />
    </div>
  );
}
