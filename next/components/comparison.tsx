"use client"

import { X, Check, Sparkles, ArrowRight } from "lucide-react"
import { useTranslations } from 'next-intl'

export function Comparison() {
  const t = useTranslations('comparison')

  const comparisons = [
    {
      old: t('old1'),
      new: t('new1'),
      icon: "database"
    },
    {
      old: t('old2'),
      new: t('new2'),
      icon: "brain"
    },
    {
      old: t('old3'),
      new: t('new3'),
      icon: "refresh"
    },
    {
      old: t('old4'),
      new: t('new4'),
      icon: "connect"
    },
  ]

  return (
    <section className="py-32 px-4 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 text-balance">{t('title')}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="relative">
          {/* Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Old Way */}
            <div className="group">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-8 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center">
                    <X className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold text-muted-foreground">{t('traditionalSheets')}</h3>
                </div>
                <div className="space-y-4">
                  {comparisons.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/30"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{item.old}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* New Way */}
            <div className="group">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur p-8 hover:shadow-2xl hover:shadow-primary/10 transition-all">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">{t('ryu')}</h3>
                </div>
                <div className="space-y-4">
                  {comparisons.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-primary/20 hover:border-primary/40 hover:bg-card/80 transition-all cursor-default"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="leading-relaxed font-medium">{item.new}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VS Badge - centered between cards */}
          <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-4 border-background shadow-xl">
                <span className="text-sm font-bold text-primary-foreground">VS</span>
              </div>
            </div>
          </div>

          {/* Mobile Arrow */}
          <div className="flex lg:hidden justify-center my-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-primary rotate-90" />
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-16 text-lg max-w-2xl mx-auto">
          {t('footer')} <span className="text-foreground font-medium">{t('footerHighlight')}</span>.
        </p>
      </div>
    </section>
  )
}
