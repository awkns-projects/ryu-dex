"use client"

import { useState } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"

export function EasyInterface() {
  const t = useTranslations('easyInterface')
  const locale = useLocale()
  const [activeMethod, setActiveMethod] = useState("chat")
  const { ref, isInView } = useInView({ threshold: 0.2, triggerOnce: true })

  const interfaceMethods = [
    {
      id: "chat",
      title: t('methods.chat.title'),
      description: t('methods.chat.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      demo: (
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm">{t('methods.chat.userMessage')}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start justify-end">
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm">{t('methods.chat.aiResponse1')}</p>
              <p className="text-sm">{t('methods.chat.aiResponse2')}</p>
              <p className="text-sm">{t('methods.chat.aiResponse3')}</p>
              <p className="text-xs mt-2 opacity-80">{t('methods.chat.aiResponse4')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "form",
      title: t('methods.form.title'),
      description: t('methods.form.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      demo: (
        <div className="bg-card rounded-xl border border-border shadow-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('methods.form.taskLabel')}</label>
            <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
              {t('methods.form.taskValue')}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('methods.form.toneLabel')}</label>
              <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                {t('methods.form.toneValue')}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('methods.form.audienceLabel')}</label>
              <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                {t('methods.form.audienceValue')}
              </div>
            </div>
          </div>
          <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-md">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('methods.form.executeButton')}
            </span>
          </Button>
          <div className="text-xs text-muted-foreground text-center">{t('methods.form.resultsNote')}</div>
        </div>
      ),
    },
    {
      id: "actions",
      title: t('methods.actions.title'),
      description: t('methods.actions.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      demo: (
        <div className="space-y-3">
          <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{t('methods.actions.action1Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('methods.actions.action1Desc')}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{t('methods.actions.action2Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('methods.actions.action2Desc')}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{t('methods.actions.action3Title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('methods.actions.action3Desc')}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentMethod = interfaceMethods.find((m) => m.id === activeMethod) || interfaceMethods[0]

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/50 backdrop-blur-sm">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block">{t('title.line1')}</span>
            <span className="block text-primary">{t('title.line2')}</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Method Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 max-w-3xl mx-auto">
          {interfaceMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveMethod(method.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all ${activeMethod === method.id
                ? "border-primary bg-primary/10 shadow-lg"
                : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                }`}
            >
              <div className={activeMethod === method.id ? "text-primary" : "text-muted-foreground"}>
                {method.icon}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">{method.title}</h3>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <div
              className={`space-y-6 transition-all duration-500 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
                {currentMethod.icon}
              </div>

              <h3 className="text-3xl md:text-4xl font-bold">
                {currentMethod.title}
              </h3>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentMethod.description}
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('benefits.instant.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('benefits.instant.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('benefits.transparency.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('benefits.transparency.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{t('benefits.noLearning.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('benefits.noLearning.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Demo */}
            <div
              className={`transition-all duration-500 delay-100 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />
                <div className="relative bg-background rounded-2xl border border-border shadow-2xl p-6">
                  {currentMethod.demo}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 shadow-lg" asChild>
            <Link href={`/${locale}/pilot`}>
              {t('ctaButton')}
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">{t('ctaSubtext')}</p>
        </div>
      </div>
    </section>
  )
}

