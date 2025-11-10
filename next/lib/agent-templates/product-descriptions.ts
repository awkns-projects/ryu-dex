/**
 * E-commerce Product Description Generator Template
 */

import type { Template } from './types'

export const PRODUCT_DESCRIPTIONS_TEMPLATE: Template = {
  id: '7',
  slug: 'product-description-generator',
  title: 'E-commerce Product Description Generator',
  shortDescription: 'Generate SEO-optimized product descriptions at scale using AI and your product data.',
  longDescription: 'Create compelling product descriptions in seconds. This template takes your product specifications and generates unique, SEO-friendly descriptions that convert. Perfect for stores with large catalogs.',
  description: 'Generate compelling product descriptions with AI',
  category: 'ecommerce',
  subcategories: ['marketing'],
  tags: ['E-commerce', 'Content', 'SEO', 'AI'],
  useCases: ['Content Generation', 'Automation & Scheduling'],
  thumbnail: '/templates/product-descriptions.png',
  icon: '✍️',
  difficulty: 'beginner',
  setupTime: 10,
  pricingTier: 'free',
  version: '1.3',
  aiFeatures: ['Text Generation', 'Content Summarization'],
  connections: [
    {
      id: 'shopify-connection',
      name: 'shopify',
      title: 'Shopify Connection',
      provider: 'shopify',
      description: 'Connect to your Shopify store for product data',
      icon: '🛍️',
      scopes: ['read_products', 'write_products'],
      fieldName: 'shopifyAuth',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Shopify Store',
      description: {
        feature: 'Connect your Shopify store to sync products and publish descriptions',
        data: 'OAuth connection for Shopify',
        action: 'Sync product catalog and automatically update descriptions in your store',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Shopify Connection',
          formType: 'edit',
          whenToUse: 'Use this form to configure Shopify OAuth connection for reading and writing product information to your Shopify store.',
          modelName: 'Workspace',
          fields: ['shopifyAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'shopifyAuth'],
        },
      ],
    },
    {
      icon: '📋',
      title: 'Product Information Entry',
      description: {
        feature: 'Add product details and specifications for description generation',
        data: 'Product name, category, specifications, features, target keywords, and price',
        action: 'Create product record with unique ID, parse specifications, validate required fields, set status to "Draft"',
      },
      forms: [
        {
          formId: 'new-product-form',
          formName: 'New Product',
          formType: 'new',
          whenToUse: 'Use this form to add a new product for AI description generation. Enter product name, category, specifications, features, and target keywords.',
          modelName: 'Product',
          fields: ['productName', 'category', 'specifications', 'features', 'targetKeywords', 'price', 'tone', 'language'],
          scheduleId: 'generate-description-schedule',
        },
      ],
      models: [
        {
          modelName: 'Product',
          fields: ['productId', 'productName', 'category', 'specifications', 'features', 'targetKeywords', 'price', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-description-schedule',
          name: 'Generate Description Schedule',
          description: 'Automatically generate product description after creation',
          mode: 'once',
          actionIds: ['generate-description-action'],
          steps: [
            {
              modelName: 'Product',
              actionId: 'generate-description-action',
              actionName: 'generateDescription',
              actionTitle: 'Generate Description',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
                logic: 'AND'
              },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      icon: '✏️',
      title: 'Update Product Status',
      description: {
        feature: 'Update the status of product descriptions',
        data: 'Product status (Draft, Generated, Reviewed, Published)',
        action: 'Change the status field to reflect current product description state',
      },
      forms: [
        {
          formId: 'edit-product-status',
          formName: 'Update Product Status',
          formType: 'edit',
          whenToUse: 'Use this form to update a product\'s status after reviewing the generated description. Mark as Reviewed or Published.',
          modelName: 'Product',
          fields: ['status', 'updatedAt'],
        },
      ],
      models: [
        {
          modelName: 'Product',
          fields: ['status', 'updatedAt'],
        },
      ],
    },
    {
      icon: '🎨',
      title: 'Edit Tone & Language',
      description: {
        feature: 'Adjust the tone and language settings for product descriptions',
        data: 'Tone (Professional, Casual, Playful, Luxury, Technical) and Language',
        action: 'Update tone and language preferences, trigger regeneration if needed',
      },
      forms: [
        {
          formId: 'edit-product-preferences',
          formName: 'Edit Tone & Language',
          formType: 'edit',
          whenToUse: 'Use this form to change the tone or language of an existing product description. Regenerate the description after updating.',
          modelName: 'Product',
          fields: ['tone', 'language'],
          scheduleId: 'regenerate-description-schedule',
          name: 'Regenerate Description Schedule',
        },
      ],
      models: [
        {
          modelName: 'Product',
          fields: ['tone', 'language'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'AI Description Generation',
      description: {
        feature: 'Automatically generate compelling, SEO-optimized product descriptions',
        data: 'Product name, specifications, features, target keywords, tone, and language',
        action: 'Use AI to create unique product descriptions, incorporate keywords naturally, match selected tone and style, optimize for search engines, support multiple languages',
      },
      actions: [
        {
          actionId: 'generate-description-action',
          actionName: 'generateDescription',
          actionTitle: 'Generate Description',
          modelName: 'Product',
          inputFields: ['productName', 'specifications', 'features', 'targetKeywords', 'tone', 'language'],
          outputFields: ['generatedDescription', 'status'],
        },
      ],
      models: [
        {
          modelName: 'Product',
          fields: ['productName', 'specifications', 'features', 'targetKeywords', 'tone', 'language', 'generatedDescription', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-descriptions-schedule',
          name: 'Generate Descriptions',
          description: 'Generate product descriptions every 6 hours for new products',
          mode: 'recurring',
          intervalHours: 6,
          actionIds: ['generate-description-action'],
          steps: [
            {
              modelName: 'Product',
              actionId: 'generate-description-action',
              actionName: 'generateDescription',
              actionTitle: 'Generate Description',
              query: {
                filters: [
                  { field: 'productName', operator: 'is_not_empty', value: null },
                  { field: 'generatedDescription', operator: 'is_empty', value: null }
                ],
                logic: 'AND'
              },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      icon: '📋',
      title: 'Bulk Description Processing',
      description: {
        feature: 'Generate descriptions for multiple products simultaneously',
        data: 'Multiple product records with specifications and target keywords',
        action: 'Process products in batch, generate descriptions for each, maintain consistent tone across products, track generation progress, update all records when complete',
      },
      actions: [
        {
          actionId: 'bulk-generate-action',
          actionName: 'bulkGenerate',
          actionTitle: 'Bulk Generate',
          modelName: 'Product',
          inputFields: ['productName', 'specifications', 'features', 'tone', 'language'],
          outputFields: ['generatedDescription', 'status'],
        },
      ],
      models: [
        {
          modelName: 'Product',
          fields: ['productName', 'specifications', 'features', 'tone', 'language', 'generatedDescription', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-bulk-generation-schedule',
          name: 'Daily Bulk Generation',
          description: 'Generate descriptions for all draft products daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['bulk-generate-action'],
          steps: [
            {
              modelName: 'Product',
              actionId: 'bulk-generate-action',
              actionName: 'bulkGenerate',
              actionTitle: 'Bulk Generate',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
                logic: 'AND'
              },
              order: 1,
            },
          ],
        },
      ],
    },
  ],
  howItWorks: [
    { order: 1, title: 'Add Product Data', description: 'Import specs, features, and attributes' },
    { order: 2, title: 'Choose Style', description: 'Select tone and length preferences' },
    { order: 3, title: 'AI Generates', description: 'Unique descriptions created instantly' },
    { order: 4, title: 'Review & Export', description: 'Edit if needed and push to your store' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'shopifyAuth', type: 'oauth', label: 'Shopify Connection', oauthProvider: 'shopify', oauthScopes: ['read_products', 'write_products'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure Shopify OAuth connection for reading and writing product information to your Shopify store.',
          modelName: 'Workspace',
          fields: ['shopifyAuth'],
        },
      ],
    },
    {
      name: 'Product',
      description: 'E-commerce product with AI-generated description',
      fields: [
        { name: 'productId', type: 'text', label: 'Product ID', required: true },
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'category', type: 'text', label: 'Category' },
        { name: 'specifications', type: 'textarea', label: 'Specifications' },
        { name: 'features', type: 'textarea', label: 'Features' },
        { name: 'targetKeywords', type: 'text', label: 'Target Keywords' },
        { name: 'generatedDescription', type: 'textarea', label: 'Generated Description' },
        { name: 'tone', type: 'select', label: 'Tone', options: ['Professional', 'Casual', 'Playful', 'Luxury', 'Technical'], defaultValue: 'Professional' },
        { name: 'language', type: 'select', label: 'Language', options: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'], defaultValue: 'English' },
        { name: 'price', type: 'number', label: 'Price' },
        { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Generated', 'Reviewed', 'Published'], defaultValue: 'Draft' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      actions: [
        {
          name: 'generateDescription',
          title: 'Generate Description',
          emoji: '✍️',
          description: 'Generate SEO-optimized product description using AI',
          modelName: 'Product',
          inputFields: ['productName', 'specifications', 'features', 'targetKeywords', 'tone', 'language'],
          outputFields: ['generatedDescription', 'status'],
          steps: [
            {
              name: 'createDescription',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Generate a compelling, SEO-optimized product description in the specified language and tone. Incorporate target keywords naturally, highlight key features and specifications, and create engaging copy that converts. The description should be unique and match the selected tone (Professional, Casual, Playful, Luxury, or Technical).',
                inputFields: ['productName', 'specifications', 'features', 'targetKeywords', 'tone', 'language'],
                outputFields: ['generatedDescription', 'status'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
        {
          name: 'bulkGenerate',
          title: 'Bulk Generate',
          emoji: '📋',
          description: 'Generate descriptions for multiple products at once',
          modelName: 'Product',
          inputFields: ['productName', 'specifications', 'features', 'tone', 'language'],
          outputFields: ['generatedDescription', 'status'],
          steps: [
            {
              name: 'batchProcess',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Generate product descriptions in batch while maintaining consistent tone across all products. Create unique, SEO-friendly descriptions for each product.',
                inputFields: ['productName', 'specifications', 'features', 'tone', 'language'],
                outputFields: ['generatedDescription', 'status'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'generate-description-schedule',
      name: 'Generate Description (Run Once)',
      description: 'Automatically generate product description after creation',
      mode: 'once',
      actionIds: ['generate-description-action'],
      steps: [
        {
          modelName: 'Product',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
            logic: 'AND'
          },
          actionName: 'generateDescription',
          actionId: 'generate-description-action',
          order: 1,
        },
      ],
    },
    {
      id: 'regenerate-description-schedule',
      name: 'Regenerate Description (Run Once)',
      description: 'Regenerate description after tone/language change',
      mode: 'once',
      actionIds: ['generate-description-action'],
      steps: [
        {
          modelName: 'Product',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
            logic: 'AND'
          },
          actionName: 'generateDescription',
          actionId: 'generate-description-action',
          order: 1,
        },
      ],
    },
    {
      id: 'generate-descriptions-schedule',
      name: 'Generate Descriptions (Recurring)',
      description: 'Generate product descriptions every 6 hours for new products',
      mode: 'recurring',
      intervalHours: 6,
      actionIds: ['generate-description-action'],
      steps: [
        {
          modelName: 'Product',
          query: {
            filters: [
              { field: 'productName', operator: 'is_not_empty', value: null },
              { field: 'generatedDescription', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'generateDescription',
          actionId: 'generate-description-action',
          order: 1,
        },
      ],
    },
    {
      id: 'daily-bulk-generation-schedule',
      name: 'Daily Bulk Generation',
      description: 'Generate descriptions for all draft products daily',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['bulk-generate-action'],
      steps: [
        {
          modelName: 'Product',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
            logic: 'AND'
          },
          actionName: 'bulkGenerate',
          actionId: 'bulk-generate-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 2345,
  viewCount: 9876,
  rating: 4.8,
  reviewCount: 124,
  createdAt: new Date('2024-10-10'),
  updatedAt: new Date('2024-12-15'),
  badges: ['FEATURED', 'POPULAR'],
}

