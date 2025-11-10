/**
 * Agent Templates Index
 * Central export file for all agent templates and marketplace templates
 */

import type { AgentTemplateData, FeatureBreakdown } from './types';

// Import agent templates
import { CUSTOMER_SUPPORT_TEMPLATE } from './customer-support';
import { SALES_ASSISTANT_TEMPLATE } from './sales-assistant';
import { CONTENT_CREATOR_TEMPLATE } from './content-creator';
import { DATA_ANALYST_TEMPLATE } from './data-analyst';
import { PROJECT_MANAGER_TEMPLATE } from './project-manager';
import { SOCIAL_MEDIA_MANAGER_TEMPLATE } from './social-media-manager';

// Import marketplace templates
import { SHOPIFY_ORDER_TRACKER_TEMPLATE } from './shopify-order-tracker';
import { INSTAGRAM_ANALYZER_TEMPLATE } from './instagram-analyzer';
import { LEAD_ENRICHMENT_TEMPLATE } from './lead-enrichment';
import { SOCIAL_MEDIA_CALENDAR_TEMPLATE } from './social-media-calendar';
import { BLOG_POST_GENERATOR_TEMPLATE } from './blog-post-generator';
import { SOCIAL_CAMPAIGN_GENERATOR_TEMPLATE } from './social-campaign-generator';
import { PRODUCT_CATALOG_GENERATOR_TEMPLATE } from './product-catalog-generator';
import { EXPENSE_REPORT_TEMPLATE } from './expense-report';
import { CUSTOMER_SUPPORT_ANALYZER_TEMPLATE } from './customer-support-analyzer';
import { PRODUCT_DESCRIPTIONS_TEMPLATE } from './product-descriptions';
import { PRICE_TRACKER_TEMPLATE } from './price-tracker';
import { EMAIL_ANALYZER_TEMPLATE } from './email-analyzer';
import { SEO_OPTIMIZER_TEMPLATE } from './seo-optimizer';
import { TRADING_BOT_TEMPLATE } from './trading-bot';

// Re-export types and categories
export * from './types';
export * from './categories';

// Export individual agent templates
export {
  CUSTOMER_SUPPORT_TEMPLATE,
  SALES_ASSISTANT_TEMPLATE,
  CONTENT_CREATOR_TEMPLATE,
  DATA_ANALYST_TEMPLATE,
  PROJECT_MANAGER_TEMPLATE,
  SOCIAL_MEDIA_MANAGER_TEMPLATE,
};

// Export individual marketplace templates
export {
  SHOPIFY_ORDER_TRACKER_TEMPLATE,
  INSTAGRAM_ANALYZER_TEMPLATE,
  LEAD_ENRICHMENT_TEMPLATE,
  SOCIAL_MEDIA_CALENDAR_TEMPLATE,
  EXPENSE_REPORT_TEMPLATE,
  CUSTOMER_SUPPORT_ANALYZER_TEMPLATE,
  PRODUCT_DESCRIPTIONS_TEMPLATE,
  PRICE_TRACKER_TEMPLATE,
  EMAIL_ANALYZER_TEMPLATE,
  SEO_OPTIMIZER_TEMPLATE,
  TRADING_BOT_TEMPLATE,
};

// Agent templates array
export const agentTemplates: AgentTemplateData[] = [
  CUSTOMER_SUPPORT_TEMPLATE,
  SALES_ASSISTANT_TEMPLATE,
  CONTENT_CREATOR_TEMPLATE,
  DATA_ANALYST_TEMPLATE,
  PROJECT_MANAGER_TEMPLATE,
  SOCIAL_MEDIA_MANAGER_TEMPLATE,
];

// Marketplace templates array
export const marketplaceTemplates: any[] = [
  BLOG_POST_GENERATOR_TEMPLATE,
  SOCIAL_CAMPAIGN_GENERATOR_TEMPLATE,
  PRODUCT_CATALOG_GENERATOR_TEMPLATE,
  SHOPIFY_ORDER_TRACKER_TEMPLATE,
  INSTAGRAM_ANALYZER_TEMPLATE,
  LEAD_ENRICHMENT_TEMPLATE,
  SOCIAL_MEDIA_CALENDAR_TEMPLATE,
  EXPENSE_REPORT_TEMPLATE,
  CUSTOMER_SUPPORT_ANALYZER_TEMPLATE,
  PRODUCT_DESCRIPTIONS_TEMPLATE,
  PRICE_TRACKER_TEMPLATE,
  EMAIL_ANALYZER_TEMPLATE,
  SEO_OPTIMIZER_TEMPLATE,
  TRADING_BOT_TEMPLATE,
];

// All templates combined
export const templates: any[] = [
  ...agentTemplates,
  ...marketplaceTemplates,
];

// Legacy export for backward compatibility
export const AGENT_TEMPLATES = agentTemplates;

// Utility functions
export function getTemplateById(id: string): any {
  return templates.find(template => template.id === id);
}

export function getTemplateBySlug(slug: string): any {
  return templates.find(t => t.slug === slug);
}

export function getTemplatesByCategory(categoryId: string): any[] {
  return templates.filter(t => t.category === categoryId || t.subcategories?.includes(categoryId));
}

export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map(t => t.category)));
}

export function getFeaturedTemplates(): any[] {
  return templates.filter(t => t.badges.includes('FEATURED'));
}

export function getTrendingTemplates(): any[] {
  return templates.filter(t => t.badges.includes('TRENDING'));
}

export function getPopularTemplates(): any[] {
  return templates
    .filter(t => t.usageCount > 1000)
    .sort((a, b) => b.usageCount - a.usageCount);
}

export function getFeaturesByTemplateId(id: string): FeatureBreakdown[] {
  const template = getTemplateById(id);
  return template?.features || [];
}

export function getAllFeaturesCount(): number {
  return templates.reduce((total, template) => total + (template.features?.length || 0), 0);
}

