"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Template } from "@/lib/templates-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronDown, ChevronUp, Clock, Star, Users, Calendar, Zap } from "lucide-react"

interface TemplateDetailModalProps {
  template: Template | null
  open: boolean
  onClose: () => void
  onUseTemplate: (template: Template) => void
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          "hover:bg-muted/50",
          isOpen && "bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export function TemplateDetailModal({
  template,
  open,
  onClose,
  onUseTemplate,
}: TemplateDetailModalProps) {
  const t = useTranslations('templatesMarketplace.templateDetail')
  const locale = useLocale()

  if (!template) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const formatUsageCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl">{template.icon}</span>
            <div className="flex-1">
              <div>{template.title}</div>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {template.shortDescription}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Uses</div>
                <div className="text-sm font-semibold">{formatUsageCount(template.usageCount)}</div>
              </div>
            </div>

            {template.rating && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                <Star className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="text-sm font-semibold">{template.rating}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Setup</div>
                <div className="text-sm font-semibold">{template.setupTime}m</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
              <Zap className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-xs text-muted-foreground">Level</div>
                <div className="text-sm font-semibold capitalize">{template.difficulty}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => onUseTemplate(template)}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-12"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              {t('useTemplate')}
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12"
              size="lg"
              asChild
            >
              <Link href={`/${locale}/pilot`}>
                {t('previewDemo')}
              </Link>
            </Button>
          </div>

          {/* Overview - Always visible */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Overview</h3>
            <p className="text-muted-foreground leading-relaxed">
              {template.longDescription}
            </p>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-3">
            {/* Key Features */}
            <CollapsibleSection
              title={t('sections.keyFeatures')}
              icon="✨"
              defaultOpen={true}
            >
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {template.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {typeof feature.description === 'string'
                          ? feature.description
                          : feature.description.feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* How It Works */}
            <CollapsibleSection
              title={t('sections.howItWorks')}
              icon="🔄"
              defaultOpen={false}
            >
              <div className="space-y-3 pt-4">
                {template.howItWorks.map((step) => (
                  <div key={step.order} className="flex gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* What's Included */}
            <CollapsibleSection
              title={t('sections.included')}
              icon="📦"
              defaultOpen={false}
            >
              <div className="grid sm:grid-cols-2 gap-2 pt-4">
                {['agents', 'actions', 'data', 'docs', 'support'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t(`included.${item}`)}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Integrations */}
            {(template.connections?.length || 0) > 0 && (
              <CollapsibleSection
                title={t('sections.integrations')}
                icon="🔌"
                defaultOpen={false}
              >
                <div className="grid sm:grid-cols-2 gap-2 pt-4">
                  {template.connections?.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{connection.icon}</span>
                        <span className="font-medium">{connection.title}</span>
                      </span>
                      {connection.required && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* AI Features */}
            {template.aiFeatures.length > 0 && (
              <CollapsibleSection
                title={t('sections.aiFeatures')}
                icon="🤖"
                defaultOpen={false}
              >
                <div className="flex flex-wrap gap-2 pt-4">
                  {template.aiFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* OAuth/API Connections */}
            {template.connections && template.connections.length > 0 && (
              <CollapsibleSection
                title="OAuth & API Connections"
                icon="🔐"
                defaultOpen={false}
              >
                <div className="grid sm:grid-cols-1 gap-3 pt-4">
                  {template.connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="p-4 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{connection.icon}</span>
                          <div>
                            <h4 className="font-semibold">{connection.title}</h4>
                            <p className="text-xs text-muted-foreground">{connection.description}</p>
                          </div>
                        </div>
                        {connection.required && (
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {connection.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-xs px-2 py-0.5 rounded bg-background border text-muted-foreground"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Data Models */}
            {template.models && template.models.length > 0 && (
              <CollapsibleSection
                title="Data Models"
                icon="📋"
                defaultOpen={false}
              >
                <div className="space-y-3 pt-4">
                  {template.models.map((model, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold mb-1">{model.name}</h4>
                      {model.description && (
                        <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {model.fields.map((field, fieldIdx) => (
                          <div key={fieldIdx} className="text-xs p-2 rounded bg-background border">
                            <div className="font-medium">{field.label}</div>
                            <div className="text-muted-foreground">{field.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Automated Schedules */}
            {template.schedules && template.schedules.length > 0 && (
              <CollapsibleSection
                title="Automated Schedules"
                icon="⏰"
                defaultOpen={false}
              >
                <div className="space-y-3 pt-4">
                  {template.schedules.map((schedule, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {schedule.mode === 'recurring' ? '🔄' : '1x'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{schedule.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{schedule.description}</p>
                        {schedule.intervalHours && (
                          <span className="text-xs px-2 py-0.5 rounded bg-background border">
                            Every {schedule.intervalHours} hour{Number(schedule.intervalHours) > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Additional Info */}
            <CollapsibleSection
              title="Additional Information"
              icon="ℹ️"
              defaultOpen={false}
            >
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Pricing Tier</span>
                  <span className="text-sm font-medium capitalize">{template.pricingTier}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">{template.version}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">{formatDate(template.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="text-sm font-medium capitalize">{template.category}</span>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

