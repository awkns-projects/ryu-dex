"use client"

import { Template } from "@/lib/templates-data"
import { TemplateCard } from "./template-card"
import { cn } from "@/lib/utils"

interface TemplatesGridProps {
  templates: Template[]
  loading?: boolean
  columns?: { desktop: number; tablet: number; mobile: number }
  className?: string
}

export function TemplatesGrid({
  templates,
  loading = false,
  columns = { desktop: 3, tablet: 2, mobile: 1 },
  className,
}: TemplatesGridProps) {
  if (loading) {
    return (
      <div className={cn("grid gap-6", className)} style={{
        gridTemplateColumns: `repeat(${columns.mobile}, 1fr)`,
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-xl border bg-muted/20 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No templates found</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        className
      )}
    >
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
        />
      ))}
    </div>
  )
}

