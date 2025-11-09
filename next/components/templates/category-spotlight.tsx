"use client"

import { useTranslations } from "next-intl"
import { Category, Template } from "@/lib/templates-data"
import { TemplateCard } from "./template-card"
import { Button } from "@/components/ui/button"

interface CategorySpotlightProps {
  category: Category
  templates: Template[]
  onViewAll: (categoryId: string) => void
}

export function CategorySpotlight({
  category,
  templates,
  onViewAll,
}: CategorySpotlightProps) {
  const t = useTranslations('templatesMarketplace.categorySpotlight')

  if (templates.length === 0) return null

  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{category.icon}</span>
          <h3 className="text-2xl sm:text-3xl font-bold">{category.name}</h3>
        </div>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {templates.slice(0, 3).map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
          />
        ))}
      </div>

      {templates.length > 3 && (
        <div className="text-center">
          <Button
            onClick={() => onViewAll(category.id)}
            variant="ghost"
            className="group"
          >
            {t('viewAll', { category: category.name })}
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </section>
  )
}

