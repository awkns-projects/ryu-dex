"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { categories } from "@/lib/templates-data"
import { cn } from "@/lib/utils"

export interface FilterState {
  search: string
  categories: string[]
  useCases: string[]
  integrations: string[]
  difficulty: string[]
  aiFeatures: string[]
  pricingTier: string[]
  sortBy: 'popular' | 'recent' | 'alphabetical' | 'rating'
}

interface TemplateFiltersProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onClearAll: () => void
  resultCount: number
  totalCount: number
  variant?: 'sidebar' | 'mobile-sheet'
  className?: string
}

export function TemplateFilters({
  filters,
  onFilterChange,
  onClearAll,
  resultCount,
  totalCount,
  variant = 'sidebar',
  className,
}: TemplateFiltersProps) {
  const t = useTranslations('templatesMarketplace.filters')
  const [mobileOpen, setMobileOpen] = useState(false)

  const useCases = [
    'dataCollection',
    'contentGeneration',
    'apiIntegration',
    'reportingAnalytics',
    'automationScheduling',
    'dataEnrichment',
    'notificationAlerts',
    'syncMigration',
  ]

  const aiFeatures = [
    'textGeneration',
    'imageGeneration',
    'videoGeneration',
    'webResearch',
    'sentimentAnalysis',
    'dataExtraction',
    'contentSummarization',
  ]

  const difficulties = ['beginner', 'intermediate', 'advanced']
  const pricingTiers = ['free', 'starter', 'pro', 'enterprise']

  const toggleArrayFilter = (filterKey: keyof FilterState, value: string) => {
    const currentValues = filters[filterKey] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFilterChange({ [filterKey]: newValues })
  }

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )

  const CheckboxItem = ({
    checked,
    onChange,
    label,
    count,
  }: {
    checked: boolean
    onChange: () => void
    label: string
    count?: number
  }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-border text-primary focus:ring-primary cursor-pointer"
      />
      <span className="text-sm group-hover:text-foreground transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  )

  const filtersContent = (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {t('showingResults', { count: resultCount, total: totalCount })}
      </div>

      {/* Clear All Button */}
      {(filters.categories.length > 0 ||
        filters.useCases.length > 0 ||
        filters.difficulty.length > 0 ||
        filters.aiFeatures.length > 0 ||
        filters.pricingTier.length > 0) && (
          <Button
            onClick={onClearAll}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {t('clearAll')}
          </Button>
        )}

      {/* Categories */}
      <FilterSection title={t('categories.title')}>
        {categories.map((category) => (
          <CheckboxItem
            key={category.id}
            checked={filters.categories.includes(category.id)}
            onChange={() => toggleArrayFilter('categories', category.id)}
            label={`${category.icon} ${category.name}`}
          />
        ))}
      </FilterSection>

      {/* Use Cases */}
      <FilterSection title={t('useCases.title')}>
        {useCases.map((useCase) => (
          <CheckboxItem
            key={useCase}
            checked={filters.useCases.includes(useCase)}
            onChange={() => toggleArrayFilter('useCases', useCase)}
            label={t(`useCases.${useCase}`)}
          />
        ))}
      </FilterSection>

      {/* Difficulty */}
      <FilterSection title={t('difficulty.title')}>
        {difficulties.map((difficulty) => (
          <CheckboxItem
            key={difficulty}
            checked={filters.difficulty.includes(difficulty)}
            onChange={() => toggleArrayFilter('difficulty', difficulty)}
            label={t(`difficulty.${difficulty}`)}
          />
        ))}
      </FilterSection>

      {/* AI Features */}
      <FilterSection title={t('aiFeatures.title')}>
        {aiFeatures.map((feature) => (
          <CheckboxItem
            key={feature}
            checked={filters.aiFeatures.includes(feature)}
            onChange={() => toggleArrayFilter('aiFeatures', feature)}
            label={t(`aiFeatures.${feature}`)}
          />
        ))}
      </FilterSection>

      {/* Pricing Tier */}
      <FilterSection title={t('pricingTier.title')}>
        {pricingTiers.map((tier) => (
          <CheckboxItem
            key={tier}
            checked={filters.pricingTier.includes(tier)}
            onChange={() => toggleArrayFilter('pricingTier', tier)}
            label={t(`pricingTier.${tier}`)}
          />
        ))}
      </FilterSection>
    </div>
  )

  if (variant === 'mobile-sheet') {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className={className}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('title')}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('title')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {filtersContent}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      {filtersContent}
    </div>
  )
}

