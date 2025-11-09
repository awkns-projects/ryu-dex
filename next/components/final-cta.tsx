"use client"

import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"

export function FinalCTA() {
  const t = useTranslations('finalCta')
  const locale = useLocale()

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="container relative mx-auto max-w-4xl text-center">
        <div className="space-y-8">
          <h2 className="text-5xl font-bold text-balance sm:text-6xl">{t('title')}</h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t('description')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-8" asChild>
              <Link href={`/${locale}/pilot`}>
                {t('tryTemplate')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 bg-transparent" asChild>
              <Link href={`/${locale}/pilot`}>
                {t('createNew')}
              </Link>
            </Button>
          </div>

          <div className="pt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">{t('socialProof')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
