import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { UseCases } from "@/components/use-cases"
import { FeaturesTabs } from "@/components/features-tabs"
import { TemplateGallery } from "@/components/template-gallery"
import { Comparison } from "@/components/comparison"
import { Pricing } from "@/components/pricing"
import { FinalCTA } from "@/components/final-cta"
import { Header } from "@/components/header"
import { AICapabilities } from "@/components/ai-capabilities"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* 1. Hero: The Hook - Problem + Solution */}
        <Hero />

        {/* 2. Get Started Fast - Templates (Show what you can build!) */}
        <section id="templates">
          <TemplateGallery />
        </section>

        {/* 3. Features Tabs - All-in-one interface and capabilities */}
        <section id="features">
          <AICapabilities />
          <FeaturesTabs />
        </section>

        {/* 4. How It Works - The process behind the magic */}
        <section id="how-it-works">
          <HowItWorks />
        </section>

        {/* 5. See It In Action - Real use cases with AI reasoning */}
        <section id="use-cases">
          <UseCases />
        </section>

        {/* 6. Why Choose Us - Comparison */}
        <section id="comparison">
          <Comparison />
        </section>

        {/* 7. Pricing */}
        <section id="pricing">
          <Pricing />
        </section>

        {/* 8. Final CTA */}
        <FinalCTA />
      </main>
    </div>
  )
}
