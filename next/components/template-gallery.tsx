"use client"

import { cn } from "@/lib/utils"
import { Marquee } from "@/registry/magicui/marquee"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"

const TemplateCard = ({
  icon,
  title,
  description,
  category,
  t,
}: {
  icon: string
  title: string
  description: string
  category: string
  t: any
}) => {
  return (
    <figure
      className={cn(
        "relative w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
        "bg-background",
        "shadow-xl transition-all duration-300 hover:scale-[1.02]",
        "before:absolute before:inset-0 before:bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] before:bg-[size:14px_14px] before:opacity-60 before:z-0 before:transition-all before:duration-300",
        "hover:before:bg-[size:20px_20px]",
        "[&>*]:relative [&>*]:z-10"
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 text-2xl">
            {icon}
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border/30 text-muted-foreground">
            {category}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between hover:bg-background/50 px-0 group/btn"
        >
          <span>{t('useTemplate')}</span>
          <svg
            className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </figure>
  )
}

export function TemplateGallery() {
  const t = useTranslations('templateGallery')
  const locale = useLocale()

  const templates = [
    {
      icon: "🛒",
      title: t('templates.shopify.title'),
      description: t('templates.shopify.description'),
      category: t('templates.shopify.category'),
    },
    {
      icon: "📸",
      title: t('templates.instagram.title'),
      description: t('templates.instagram.description'),
      category: t('templates.instagram.category'),
    },
    {
      icon: "📊",
      title: t('templates.trading.title'),
      description: t('templates.trading.description'),
      category: t('templates.trading.category'),
    },
    {
      icon: "💬",
      title: t('templates.socialMedia.title'),
      description: t('templates.socialMedia.description'),
      category: t('templates.socialMedia.category'),
    },
    {
      icon: "📋",
      title: t('templates.clinic.title'),
      description: t('templates.clinic.description'),
      category: t('templates.clinic.category'),
    },
    {
      icon: "📈",
      title: t('templates.marketing.title'),
      description: t('templates.marketing.description'),
      category: t('templates.marketing.category'),
    },
    {
      icon: "📧",
      title: t('templates.email.title'),
      description: t('templates.email.description'),
      category: t('templates.email.category'),
    },
    {
      icon: "💰",
      title: t('templates.expense.title'),
      description: t('templates.expense.description'),
      category: t('templates.expense.category'),
    },
    {
      icon: "🎯",
      title: t('templates.support.title'),
      description: t('templates.support.description'),
      category: t('templates.support.category'),
    },
    {
      icon: "📱",
      title: t('templates.appUsage.title'),
      description: t('templates.appUsage.description'),
      category: t('templates.appUsage.category'),
    },
  ]

  const firstRow = templates.slice(0, templates.length / 2)
  const secondRow = templates.slice(templates.length / 2)

  return (
    <section id="templates" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--primary))_0%,transparent_70%)] opacity-[0.03]" />

      <div className="container mx-auto max-w-7xl relative z-10 px-4 mb-12">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:30s] py-4">
          {firstRow.map((template, index) => (
            <TemplateCard key={index} {...template} t={t} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:30s] py-4">
          {secondRow.map((template, index) => (
            <TemplateCard key={index} {...template} t={t} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
      </div>

      {/* View Marketplace Button */}
      <div className="container mx-auto max-w-7xl relative z-10 px-4 mt-12">
        <div className="text-center">
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 shadow-lg hover:shadow-xl transition-all"
            asChild
          >
            <Link href={`/${locale}/templates`}>
              <span className="mr-2">🏪</span>
              {t('viewMarketplace')}
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
