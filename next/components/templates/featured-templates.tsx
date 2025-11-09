"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Template } from "@/lib/templates-data"
import { TemplateCard } from "./template-card"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FeaturedTemplatesProps {
  templates: Template[]
}

export function FeaturedTemplates({
  templates,
}: FeaturedTemplatesProps) {
  const t = useTranslations('templatesMarketplace.featured')
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
    }
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (templates.length === 0) return null

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--primary))_0%,transparent_70%)] opacity-[0.02]" />

      <div className="container mx-auto max-w-7xl relative z-10 px-4">
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div> */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>



        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 hidden md:block">
            <Button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg backdrop-blur-sm",
                "bg-background/80 hover:bg-background",
                "border-2 transition-all duration-300",
                !canScrollPrev && "opacity-30 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 hidden md:block">
            <Button
              onClick={scrollNext}
              disabled={!canScrollNext}
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg backdrop-blur-sm",
                "bg-background/80 hover:bg-background",
                "border-2 transition-all duration-300",
                !canScrollNext && "opacity-30 cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex-[0_0_100%] min-w-0 pl-6 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="h-full">
                    <TemplateCard
                      template={template}
                      variant="featured"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {templates.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-3 mt-6 md:hidden">
            <Button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full",
                !canScrollPrev && "opacity-30"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={scrollNext}
              disabled={!canScrollNext}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full",
                !canScrollNext && "opacity-30"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

