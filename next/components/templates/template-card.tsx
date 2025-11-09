"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Template, TemplateBadge } from "@/lib/templates-data"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface TemplateCardProps {
  template: Template
  variant?: 'default' | 'featured' | 'compact'
  showStats?: boolean
  className?: string
}

const badgeStyles: Record<TemplateBadge, string> = {
  NEW: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  FEATURED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  TRENDING: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  UPDATED: 'bg-green-500/10 text-green-600 border-green-500/20',
  POPULAR: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
}

export function TemplateCard({
  template,
  variant = 'default',
  showStats = true,
  className,
}: TemplateCardProps) {
  const t = useTranslations('templatesMarketplace')
  const locale = useLocale()

  const formatUsageCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <Link
      href={`/${locale}/templates/${template.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border p-6",
        "bg-background",
        "shadow-xl transition-all duration-300 hover:scale-[1.02]",
        "flex flex-col",
        "before:absolute before:inset-0 before:bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] before:bg-[size:14px_14px] before:opacity-60 before:z-0 before:transition-all before:duration-300",
        "hover:before:bg-[size:20px_20px]",
        "[&>*]:relative [&>*]:z-10",
        variant === 'featured' && "lg:col-span-2",
        className
      )}
    >
      {/* Badges */}
      {template.badges.length > 0 && (
        <div className="absolute top-4 right-4 flex gap-2">
          {template.badges.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className={cn(
                "text-xs px-2 py-1 rounded-full border font-medium",
                badgeStyles[badge]
              )}
            >
              {t(`templateCard.badges.${badge.toLowerCase()}`)}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-4 flex-1 flex flex-col">
        {/* Icon and Category */}
        <div className="flex items-start justify-between">
          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 text-2xl">
            {template.icon}
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {template.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {template.shortDescription}
          </p>
        </div>

        {/* Stats and Metadata */}
        {showStats && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {template.rating && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{template.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>{t('templateCard.uses', { count: formatUsageCount(template.usageCount) })}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{t('templateCard.setupTime', { minutes: template.setupTime })}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {template.connections?.slice(0, 3).map((connection) => (
            <span
              key={connection.id}
              className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border/30 text-muted-foreground"
            >
              {connection.icon} {connection.title}
            </span>
          ))}
          {(template.connections?.length || 0) > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border/30 text-muted-foreground">
              {t('templateCard.moreTags', { count: (template.connections?.length || 0) - 3 })}
            </span>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full border",
            template.difficulty === 'beginner' && "bg-green-500/10 text-green-600 border-green-500/20",
            template.difficulty === 'intermediate' && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
            template.difficulty === 'advanced' && "bg-red-500/10 text-red-600 border-red-500/20"
          )}>
            {t(`templateCard.difficulty.${template.difficulty}`)}
          </span>
        </div>

        {/* View Details Link */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
            <span>{t('templateCard.viewDetails')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

