"use client"

import { useTranslations } from "next-intl"
import { TemplateSearch } from "./template-search"
import { categories } from "@/lib/templates-data"
import { cn } from "@/lib/utils"

interface TemplatesHeroProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onCategoryClick: (categoryId: string) => void
  selectedCategories: string[]
}

export function TemplatesHero({
  searchValue,
  onSearchChange,
  onCategoryClick,
  selectedCategories,
}: TemplatesHeroProps) {
  const t = useTranslations('templatesMarketplace.hero')

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--primary))_0%,transparent_70%)] opacity-[0.03]" />

      <div className="container mx-auto max-w-5xl relative z-10 px-4">
        <div className="text-center space-y-6">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            {t('title')}
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <TemplateSearch
              value={searchValue}
              onChange={onSearchChange}
              placeholder={t('searchPlaceholder')}
              className="shadow-lg"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "border hover:scale-105",
                  selectedCategories.includes(category.id)
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background/50 hover:bg-muted border-border"
                )}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span className="font-semibold">{t('statsTemplates')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔌</span>
              <span className="font-semibold">{t('statsIntegrations')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-semibold">{t('statsUsage')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

