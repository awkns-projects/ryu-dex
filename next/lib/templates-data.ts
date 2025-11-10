/**
 * Template Data - Legacy Export File
 * This file re-exports from the agent-templates folder
 * for backward compatibility with existing imports
 */

// Re-export everything from agent-templates
export * from './agent-templates'

// For complete backward compatibility, export specific items
export {
  templates,
  agentTemplates,
  marketplaceTemplates,
  categories,
  getTemplatesByCategory,
  getTemplateBySlug,
  getTemplateById,
  getFeaturedTemplates,
  getTrendingTemplates,
  getPopularTemplates,
} from './agent-templates'

// Export types for convenience
export type {
  AgentTemplateData,
  Category,
  Integration,
  ConnectionTemplate,
  SimpleFeature,
  FeatureBreakdown,
  ModelTemplate,
  FieldDefinition,
  FormTemplate,
  ActionTemplate,
  StepTemplate,
  ScheduleTemplate,
  HowItWorksStep,
  TemplateBadge,
  DifficultyLevel,
  PricingTier,
} from './agent-templates/types'

// Alias AgentTemplateData as Template for backward compatibility
export type { AgentTemplateData as Template } from './agent-templates/types'
