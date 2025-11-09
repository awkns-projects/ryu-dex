"use client"

import { useState, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { TemplatesHeader } from "@/components/templates/templates-header"
import { TemplatesHero } from "@/components/templates/templates-hero"
import { TemplateFilters, FilterState } from "@/components/templates/template-filters"
import { TemplatesGrid } from "@/components/templates/templates-grid"
import { FeaturedTemplates } from "@/components/templates/featured-templates"
import { CategorySpotlight } from "@/components/templates/category-spotlight"
import { GettingStarted } from "@/components/templates/getting-started"
import { AgentCreator } from "@/components/templates/agent-creator"
import { templates, categories, getFeaturedTemplates, getTemplatesByCategory } from "@/lib/templates-data"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"
import { BackToMyAgentsButton } from "@/components/back-to-my-agents-button"

const initialFilters: FilterState = {
  search: '',
  categories: [],
  useCases: [],
  integrations: [],
  difficulty: [],
  aiFeatures: [],
  pricingTier: [],
  sortBy: 'popular',
}

export default function TemplatesPage() {
  const t = useTranslations('templatesMarketplace')
  const searchParams = useSearchParams()
  const { ref: gettingStartedRef, isInView: showGettingStarted } = useInView({ threshold: 0.1, triggerOnce: true })

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlCategories = searchParams.getAll('category')
    const urlSearch = searchParams.get('search') || ''
    return {
      ...initialFilters,
      categories: urlCategories,
      search: urlSearch,
    }
  })

  // Filter templates based on current filters
  const filteredTemplates = useMemo(() => {
    let result = [...templates]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.shortDescription.toLowerCase().includes(searchLower) ||
        t.longDescription.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        (t.connections || []).some(conn => conn.title.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(t =>
        filters.categories.includes(t.category) ||
        t.subcategories?.some(sc => filters.categories.includes(sc))
      )
    }

    // Use case filter
    if (filters.useCases.length > 0) {
      result = result.filter(t =>
        t.useCases.some(uc => {
          // Map use case IDs to display names for matching
          const useCaseMap: Record<string, string[]> = {
            dataCollection: ['Data Collection'],
            contentGeneration: ['Content Generation'],
            apiIntegration: ['API Integration'],
            reportingAnalytics: ['Reporting & Analytics'],
            automationScheduling: ['Automation & Scheduling'],
            dataEnrichment: ['Data Enrichment'],
            notificationAlerts: ['Notification & Alerts'],
            syncMigration: ['Sync & Migration'],
            sentimentAnalysis: ['Sentiment Analysis'],
            webResearch: ['Web Research'],
          }
          return filters.useCases.some(filterUC =>
            useCaseMap[filterUC]?.some(mappedUC => uc === mappedUC)
          )
        })
      )
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      result = result.filter(t => filters.difficulty.includes(t.difficulty))
    }

    // AI Features filter
    if (filters.aiFeatures.length > 0) {
      result = result.filter(t =>
        t.aiFeatures.some(af =>
          filters.aiFeatures.some(filterAF =>
            af.toLowerCase().includes(filterAF.toLowerCase())
          )
        )
      )
    }

    // Pricing tier filter
    if (filters.pricingTier.length > 0) {
      result = result.filter(t => filters.pricingTier.includes(t.pricingTier))
    }

    // Sort
    switch (filters.sortBy) {
      case 'popular':
        result.sort((a, b) => b.usageCount - a.usageCount)
        break
      case 'recent':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    return result
  }, [filters])

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters)
    // Scroll to top of results
    setTimeout(() => {
      document.getElementById('all-templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  const handleCategoryClick = useCallback((categoryId: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
      return { ...prev, categories }
    })
  }, [])

  // No need for handlers anymore - cards link directly to template pages

  const handleViewAllCategory = useCallback((categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: [categoryId],
    }))
    // Scroll to templates section
    document.getElementById('all-templates')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const scrollToTemplates = useCallback(() => {
    document.getElementById('all-templates')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const featuredTemplates = getFeaturedTemplates()
  const hasActiveFilters = filters.search || filters.categories.length > 0 ||
    filters.useCases.length > 0 || filters.difficulty.length > 0 ||
    filters.aiFeatures.length > 0 || filters.pricingTier.length > 0

  const activeFiltersCount =
    filters.categories.length +
    filters.useCases.length +
    filters.difficulty.length +
    filters.aiFeatures.length +
    filters.pricingTier.length +
    (filters.search ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <TemplatesHeader
        activeFiltersCount={activeFiltersCount}
        onClearFilters={activeFiltersCount > 0 ? handleClearFilters : undefined}
      />

      <main>
        {/* Back to My Agents Button - Show when logged in */}
        <div className="container mx-auto max-w-7xl px-4 pt-20 pb-4">
          <BackToMyAgentsButton />
        </div>

        {/* Pilot Builder - Only show if no filters active */}
        {!hasActiveFilters && (
          <div className="container mx-auto max-w-7xl px-4 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <AgentCreator />
          </div>
        )}

        {/* Featured Templates - Only show if no filters active */}
        {!hasActiveFilters && featuredTemplates.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '150ms' }}>
            <FeaturedTemplates
              templates={featuredTemplates}
            />
          </div>
        )}

        {/* Hero Section */}
        <TemplatesHero
          searchValue={filters.search}
          onSearchChange={(search) => handleFilterChange({ search })}
          onCategoryClick={handleCategoryClick}
          selectedCategories={filters.categories}
        />

        {/* Getting Started - Only show if no filters active */}
        {/* {!hasActiveFilters && (
          <div ref={gettingStartedRef}>
            {showGettingStarted && (
              <GettingStarted onBrowseTemplates={scrollToTemplates} />
            )}
          </div>
        )} */}

        {/* Main Templates Section - Only show when filters are active */}
        {hasActiveFilters && (
          <section id="all-templates" className="py-16 lg:py-24 scroll-mt-20">
            <div className="container mx-auto max-w-7xl px-4">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-6">
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-xl border",
                  "bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm"
                )}>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">
                      {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                    </div>
                    {activeFiltersCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                      </div>
                    )}
                  </div>
                  <TemplateFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearFilters}
                    resultCount={filteredTemplates.length}
                    totalCount={templates.length}
                    variant="mobile-sheet"
                  />
                </div>
              </div>

              {/* Desktop: Sidebar + Grid */}
              <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                    <div className={cn(
                      "p-4 rounded-xl border",
                      "bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">Search Results</h3>
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          "bg-primary/10 text-primary border border-primary/20"
                        )}>
                          {filteredTemplates.length}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        of {templates.length} total templates
                      </p>
                    </div>
                    <TemplateFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearAll={handleClearFilters}
                      resultCount={filteredTemplates.length}
                      totalCount={templates.length}
                      variant="sidebar"
                    />
                  </div>
                </aside>

                {/* Templates Grid */}
                <div className="space-y-6">
                  {/* Header with Sort */}
                  <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border",
                    "bg-gradient-to-r from-background to-muted/20"
                  )}>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {hasActiveFilters ? 'Search Results' : 'All Templates'}
                      </h2>
                      {hasActiveFilters && (
                        <p className="text-sm text-muted-foreground">
                          Filtered by {activeFiltersCount} criteria
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="sort-select" className="text-sm text-muted-foreground whitespace-nowrap">
                        Sort by:
                      </label>
                      <select
                        id="sort-select"
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
                        className={cn(
                          "px-4 py-2 rounded-lg border bg-background text-sm font-medium",
                          "hover:bg-muted/50 transition-colors cursor-pointer",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        <option value="popular">{t('filters.sortBy.popular')}</option>
                        <option value="recent">{t('filters.sortBy.recent')}</option>
                        <option value="alphabetical">{t('filters.sortBy.alphabetical')}</option>
                        <option value="rating">{t('filters.sortBy.rating')}</option>
                      </select>
                    </div>
                  </div>

                  {/* No Results State */}
                  {filteredTemplates.length === 0 && (
                    <div className={cn(
                      "text-center py-16 space-y-6 animate-in fade-in zoom-in duration-500",
                      "rounded-2xl border-2 border-dashed bg-muted/20"
                    )}>
                      <div className="text-7xl mb-4 animate-bounce">🔍</div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">{t('noResults.title')}</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {t('noResults.description')}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                          onClick={handleClearFilters}
                          variant="default"
                          size="lg"
                          className="bg-foreground text-background hover:bg-foreground/90"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {t('noResults.clearFilters')}
                        </Button>
                        <Button
                          onClick={() => handleFilterChange({ search: '' })}
                          variant="outline"
                          size="lg"
                        >
                          Browse All Templates
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Templates Grid */}
                  {filteredTemplates.length > 0 && (
                    <TemplatesGrid
                      templates={filteredTemplates}
                    />
                  )}

                  {/* Back to Top Button */}
                  {filteredTemplates.length > 6 && (
                    <div className="text-center pt-8">
                      <Button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        variant="outline"
                        size="lg"
                        className="group"
                      >
                        <svg
                          className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Back to Top
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Spotlights - Only show if no filters active */}
        {!hasActiveFilters && (
          <section className="py-16 bg-muted/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="container mx-auto max-w-7xl px-4 space-y-16">
              {categories.slice(0, 3).map((category, idx) => {
                const categoryTemplates = getTemplatesByCategory(category.id)
                return categoryTemplates.length > 0 ? (
                  <div
                    key={category.id}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-700"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <CategorySpotlight
                      category={category}
                      templates={categoryTemplates}
                      onViewAll={handleViewAllCategory}
                    />
                  </div>
                ) : null
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

