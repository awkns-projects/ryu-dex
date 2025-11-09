"use client"

import { Brain, TrendingUp, DollarSign, BarChart3, ShoppingCart, Repeat, Zap } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AICapabilities() {
  const t = useTranslations('aiCapabilities')
  const locale = useLocale()

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="container relative z-10 mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/50 backdrop-blur-sm">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block">{t('title')}</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Capabilities Grid - 3 Column Layout */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 1. Build AI Agents */}
          <div className="relative rounded-xl border border-border bg-card hover:shadow-xl transition-all hover:border-primary/50 overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20" />

            <div className="relative p-6 space-y-6">
              {/* Icon and Title */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('advancedReasoning.title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('advancedReasoning.description')}
                  </p>
                </div>
              </div>

              {/* Visual Demo */}
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">{t('advancedReasoning.task')}</span>
                  </div>
                  <p className="text-xs font-medium">{t('advancedReasoning.taskText')}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border/50">
                    <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-relaxed">{t('advancedReasoning.step1')}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border/50">
                    <BarChart3 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-relaxed">{t('advancedReasoning.step2')}</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border/50">
                    <Zap className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-relaxed">{t('advancedReasoning.step3')}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5">
                  <p className="text-xs font-semibold text-center">
                    ✓ {t('advancedReasoning.resultValue')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Marketplace for AI Agents */}
          <div className="relative rounded-xl border border-border bg-card hover:shadow-xl transition-all hover:border-primary/50 overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20" />

            <div className="relative p-6 space-y-6">
              {/* Icon and Title */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('imageGeneration.title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('imageGeneration.description')}
                  </p>
                </div>
              </div>

              {/* Visual Demo */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">{t('imageGeneration.inputData')}</span>
                  <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-[10px] font-semibold text-primary">{t('imageGeneration.done')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground">{t('imageGeneration.product')}</span>
                    <span className="text-xs font-semibold">{t('imageGeneration.productValue')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground">{t('imageGeneration.style')}</span>
                    <span className="text-xs font-semibold text-primary">{t('imageGeneration.styleValue')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground">{t('imageGeneration.color')}</span>
                    <span className="text-xs font-semibold text-primary">{t('imageGeneration.colorValue')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm text-center">
                  <DollarSign className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold mb-1">{t('imageGeneration.generatedImage')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('imageGeneration.imageSaved')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Trade Positions as Assets */}
          <div className="relative rounded-xl border border-border bg-card hover:shadow-xl transition-all hover:border-primary/50 overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20" />

            <div className="relative p-6 space-y-6">
              {/* Icon and Title */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
                  <Repeat className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('videoGeneration.title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('videoGeneration.description')}
                  </p>
                </div>
              </div>

              {/* Visual Demo */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">{t('videoGeneration.templateData')}</span>
                  <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-[10px] font-semibold text-primary">{t('videoGeneration.done')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground">{t('videoGeneration.template')}</span>
                    <span className="text-xs font-semibold">{t('videoGeneration.templateValue')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-[10px] text-muted-foreground">{t('videoGeneration.duration')}</span>
                    <span className="text-xs font-semibold text-primary">{t('videoGeneration.durationValue')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-[10px] text-muted-foreground">{t('videoGeneration.dataSource')}</span>
                    <span className="text-xs font-semibold">{t('videoGeneration.dataSourceValue')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm text-center">
                  <Repeat className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-semibold mb-1">{t('videoGeneration.generatedVideo')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('videoGeneration.videoSaved')}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Data Storage Feature */}
        {/* <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-8">
          <div className="flex items-start gap-5 max-w-5xl mx-auto">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">Automatic Data Storage & Organization</h3>
              <p className="text-muted-foreground mb-5">
                Every AI operation—whether it's reasoning, generation, or API calls—automatically stores results in your spreadsheet cells. Keep everything organized, versioned, and accessible.
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-sm">Structured Storage</h4>
                  <p className="text-xs text-muted-foreground">
                    Results auto-populate designated cells
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-xl">🔄</span>
                  </div>
                  <h4 className="font-semibold text-sm">Version History</h4>
                  <p className="text-xs text-muted-foreground">
                    Track how AI outputs evolved
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-xl">🔗</span>
                  </div>
                  <h4 className="font-semibold text-sm">Cross-Reference</h4>
                  <p className="text-xs text-muted-foreground">
                    Link outputs to source data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* CTA */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 shadow-lg" asChild>
            <Link href={`/${locale}/pilot`}>
              {t('ctaButton')}
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            {t('cta')}
          </p>
        </div>
      </div>
    </section>
  )
}

