"use client"

import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('howItWorks')
  
  const steps = [
    {
      number: t('steps.step1.number'),
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      visual: (
        <div className="relative w-full h-40 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20" />
          <div className="relative space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/30" />
              <div className="text-[10px] font-semibold text-muted-foreground">{t('steps.step1.accountName')}</div>
            </div>
            <div className="h-8 w-full bg-muted rounded-lg border border-border/50 shadow-sm flex items-center px-3">
              <span className="text-xs text-muted-foreground">@mycompany</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/30" />
              <div className="text-[10px] font-semibold text-muted-foreground">{t('steps.step1.dateRange')}</div>
            </div>
            <div className="h-8 w-full bg-muted rounded-lg border border-border/50 shadow-sm flex items-center px-3">
              <span className="text-xs text-muted-foreground">{t('steps.step1.dateRangeValue')}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: t('steps.step2.number'),
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      visual: (
        <div className="relative w-full h-40 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(var(--primary))_0%,transparent_70%)] opacity-10" />
          <div className="relative flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-xs font-semibold text-primary">{t('steps.step2.processing')}</div>
            <div className="text-[10px] text-muted-foreground">{t('steps.step2.callingApi')}</div>
          </div>
        </div>
      ),
    },
    {
      number: t('steps.step3.number'),
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      visual: (
        <div className="relative w-full h-40 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20" />
          <div className="relative grid grid-cols-3 h-full text-[8px]">
            {[t('steps.step3.input'), t('steps.step3.aiReasoning'), t('steps.step3.result')].map((header, i) => (
              <div key={i} className="border-r border-border/50 last:border-r-0 p-3 space-y-2">
                <div className="text-[9px] font-bold text-muted-foreground mb-2">{header}</div>
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-3/4 bg-muted rounded" />
                {i === 2 && (
                  <div className="h-2 w-full bg-green-500/30 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <section className="py-32 px-4 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">{t('title')}</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-6">{step.visual}</div>

              <div className="text-sm font-mono text-primary mb-2">{step.number}</div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-[calc(100%+1rem)] top-20 w-8">
                  <svg className="w-full h-6 text-border" fill="none" viewBox="0 0 32 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M0 12h28m0 0l-6-6m6 6l-6 6"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
