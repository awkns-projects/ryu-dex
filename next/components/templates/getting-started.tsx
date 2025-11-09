"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

interface GettingStartedProps {
  onBrowseTemplates: () => void
}

export function GettingStarted({ onBrowseTemplates }: GettingStartedProps) {
  const t = useTranslations('templatesMarketplace.gettingStarted')

  const steps = [
    {
      number: "01",
      icon: "🔍",
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
    },
    {
      number: "02",
      icon: "👀",
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
    },
    {
      number: "03",
      icon: "✨",
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
    },
    {
      number: "04",
      icon: "🚀",
      title: t('steps.step4.title'),
      description: t('steps.step4.description'),
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center space-y-3">
              <div className="text-5xl mb-2">{step.icon}</div>
              <div className="text-sm font-mono text-muted-foreground">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={onBrowseTemplates}
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8"
          >
            {t('ctaButton')}
          </Button>
        </div>
      </div>
    </section>
  )
}

