/**
 * Product Catalog Generator Template - Factory Pattern Example
 * 
 * Demonstrates: ProductTemplate (parent) → Product (children)
 * Pattern: One product template generates multiple product variations
 */

import type { AgentTemplateData } from './types';

export const PRODUCT_CATALOG_GENERATOR_TEMPLATE: AgentTemplateData = {
  id: 'product-catalog-generator',
  slug: 'product-catalog-generator',
  title: 'Product Catalog Generator',
  shortDescription: 'Generate product variations from templates automatically',
  longDescription: 'Factory pattern for e-commerce: Create product templates that automatically generate multiple product variations. Perfect for catalogs with size/color variants, seasonal products, or bulk catalog generation.',
  description: 'Auto-generate product catalog from templates',
  thumbnail: '/templates/product-catalog.png',
  icon: '🛍️',
  category: 'ecommerce',
  subcategories: ['products', 'automation'],
  tags: ['E-commerce', 'Products', 'Catalog', 'Factory Pattern', 'Shopify'],
  useCases: ['Content Generation', 'Automation & Scheduling', 'E-commerce'],
  difficulty: 'intermediate',
  setupTime: 20,
  pricingTier: 'pro',
  version: '1.0',
  aiFeatures: ['Text Generation', 'Image Generation', 'Data Extraction'],
  connections: [
    {
      id: 'shopify-connection',
      name: 'shopify',
      title: 'Shopify Connection',
      provider: 'shopify',
      description: 'Connect to Shopify to sync generated products',
      icon: '🛍️',
      scopes: ['read_products', 'write_products'],
      fieldName: 'shopifyAuth',
      required: false,
    },
  ],

  features: [
    {
      icon: '🔗',
      title: 'Connect Shopify',
      description: {
        feature: 'Connect Shopify store to sync generated products',
        data: 'OAuth connection for Shopify',
        action: 'Sync products to your Shopify store automatically',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Shopify Connection',
          formType: 'edit',
          whenToUse: 'Connect your Shopify store to publish generated products.',
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
      title: 'Create Product Templates',
      description: {
        feature: 'Create product templates that generate multiple product variations',
        data: 'Base product name, description template, variants (sizes/colors), pricing',
        action: 'Create ProductTemplate that generates Product records for each variant',
      },
      forms: [
        {
          formId: 'new-product-template',
          formName: 'New Product Template',
          formType: 'new',
          whenToUse: 'Create a product template that will generate multiple product variants (e.g., T-shirt in S/M/L, different colors).',
          modelName: 'ProductTemplate',
          fields: ['productName', 'descriptionTemplate', 'basePrice', 'variants', 'status'],
          scheduleId: 'generate-initial-products',
        },
      ],
      models: [
        {
          modelName: 'ProductTemplate',
          fields: ['templateId', 'productName', 'descriptionTemplate', 'basePrice', 'variants', 'status', 'last_generated', 'products_created', 'products'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-initial-products',
          name: 'Generate Initial Products',
          description: 'Generate product variants from new template',
          mode: 'once',
          actionIds: ['create-products-action'],
          steps: [
            {
              modelName: 'ProductTemplate',
              actionId: 'create-products-action',
              actionName: 'createProducts',
              actionTitle: 'Create Products',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'active' },
                  { field: 'products_created', operator: 'equals', value: 0 }
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
      icon: '🏭',
      title: 'Auto-Generate Products (Factory)',
      description: {
        feature: 'Automatically create Product records from ProductTemplate',
        data: 'Product template, variants list, base pricing',
        action: 'Generate Product child records for each variant. Output to "products" field creates records.',
      },
      actions: [
        {
          actionId: 'create-products-action',
          actionName: 'createProducts',
          actionTitle: 'Create Products',
          modelName: 'ProductTemplate',
          inputFields: ['productName', 'descriptionTemplate', 'basePrice', 'variants'],
          outputFields: ['products', 'last_generated', 'products_created'],
        },
      ],
      models: [
        {
          modelName: 'ProductTemplate',
          fields: ['productName', 'descriptionTemplate', 'basePrice', 'variants', 'products', 'last_generated', 'products_created'],
        },
      ],
    },
    {
      icon: '✍️',
      title: 'Generate Product Descriptions',
      description: {
        feature: 'AI generates SEO-optimized descriptions for each product',
        data: 'Product name, variant, template from parent',
        action: 'Generate unique product description for each variant, optimize for SEO',
      },
      actions: [
        {
          actionId: 'write-description-action',
          actionName: 'writeDescription',
          actionTitle: 'Write Description',
          modelName: 'Product',
          inputFields: ['productName', 'variant', 'product_template'],
          outputFields: ['description', 'seoKeywords', 'status'],
        },
      ],
      models: [
        {
          modelName: 'Product',
          fields: ['productName', 'variant', 'product_template', 'description', 'seoKeywords', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'write-descriptions',
          name: 'Write Descriptions',
          description: 'Generate descriptions for new products',
          mode: 'recurring',
          intervalHours: 2,
          actionIds: ['write-description-action'],
          steps: [
            {
              modelName: 'Product',
              actionId: 'write-description-action',
              actionName: 'writeDescription',
              actionTitle: 'Write Description',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'draft' },
                  { field: 'description', operator: 'is_empty', value: null }
                ],
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
    { order: 1, title: 'Create Template', description: 'Define product with variants (sizes/colors)' },
    { order: 2, title: 'Generate Variants', description: 'System creates Product record for each variant' },
    { order: 3, title: 'AI Describes', description: 'Unique descriptions generated for each' },
    { order: 4, title: 'Sync to Shopify', description: 'Products published to your store' },
  ],

  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'shopifyAuth', type: 'oauth', label: 'Shopify Connection', oauthProvider: 'shopify', oauthScopes: ['read_products', 'write_products'] },
      ],
      forms: [
        {
          id: 'workspace-connections',
          name: 'Shopify Connection',
          description: 'Configure Shopify OAuth',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Connect your Shopify store to publish generated products.',
          modelName: 'Workspace',
          fields: ['shopifyAuth'],
        },
      ],
    },
    {
      name: 'ProductTemplate',
      description: 'Product template that generates variants (PARENT MODEL)',
      fields: [
        { name: 'templateId', type: 'text', label: 'Template ID', required: true },
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'descriptionTemplate', type: 'textarea', label: 'Description Template', required: true },
        { name: 'basePrice', type: 'number', label: 'Base Price', required: true },
        { name: 'variants', type: 'text', label: 'Variants (comma-separated)', placeholder: 'S, M, L, XL' },
        { name: 'category', type: 'select', label: 'Category', options: ['Clothing', 'Electronics', 'Home', 'Beauty'] },
        { name: 'status', type: 'select', label: 'Status', options: ['active', 'paused'], defaultValue: 'active' },
        { name: 'last_generated', type: 'date', label: 'Last Generated' },
        { name: 'products_created', type: 'number', label: 'Products Created', defaultValue: 0 },
        // FACTORY FIELD: to_many relationship
        { name: 'products', type: 'reference', label: 'Generated Products', referenceType: 'to_many', referencesModel: 'Product', referencesField: 'productName' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      displayFields: ['productName', 'category'],
      actions: [
        {
          name: 'createProducts',
          title: 'Create Product Variants',
          emoji: '🏭',
          description: 'Generate Product records for each variant',
          modelName: 'ProductTemplate',
          inputFields: ['productName', 'descriptionTemplate', 'basePrice', 'variants'],
          outputFields: ['products', 'last_generated', 'products_created'],
          steps: [
            {
              name: 'generateVariants',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Parse the variants list and create a Product record for each variant. For example, if variants are "S, M, L", create 3 products: ProductName (S), ProductName (M), ProductName (L). Output to "products" field creates the child records. Update tracking fields.',
                inputFields: ['productName', 'variants', 'basePrice'],
                outputFields: ['products', 'last_generated', 'products_created'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Product',
      description: 'Individual product variant (CHILD MODEL)',
      fields: [
        { name: 'productId', type: 'text', label: 'Product ID', required: true },
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'variant', type: 'text', label: 'Variant' },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'price', type: 'number', label: 'Price' },
        { name: 'seoKeywords', type: 'text', label: 'SEO Keywords' },
        { name: 'imageUrl', type: 'url', label: 'Product Image URL' },
        { name: 'status', type: 'select', label: 'Status', options: ['draft', 'published', 'archived'], defaultValue: 'draft' },
        // LINK BACK: to_one relationship to parent
        { name: 'product_template', type: 'reference', label: 'Source Template', referenceType: 'to_one', referencesModel: 'ProductTemplate', referencesField: 'productName' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      displayFields: ['productName', 'variant'],
      actions: [
        {
          name: 'writeDescription',
          title: 'Write Product Description',
          emoji: '📝',
          description: 'Generate SEO-optimized description for product variant',
          modelName: 'Product',
          inputFields: ['productName', 'variant', 'product_template'],
          outputFields: ['description', 'seoKeywords', 'status'],
          steps: [
            {
              name: 'generateDescription',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Generate a unique, SEO-optimized product description for this variant using the template from the parent ProductTemplate. Mention the specific variant (size/color). Extract and suggest SEO keywords. Update status to "published".',
                inputFields: ['productName', 'variant', 'product_template'],
                outputFields: ['description', 'seoKeywords', 'status'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
        {
          name: 'generateProductImage',
          title: 'Generate Product Image',
          emoji: '🎨',
          description: 'Create product image using AI',
          modelName: 'Product',
          inputFields: ['productName', 'variant', 'description'],
          outputFields: ['imageUrl'],
          steps: [
            {
              name: 'createPrompt',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Create a detailed product image generation prompt showing the product with the specific variant',
                inputFields: ['productName', 'variant'],
                outputFields: ['imagePrompt', 'visualDescription'],
                model: 'gpt-4o',
                temperature: 0.5,
              },
            },
            {
              name: 'generateImage',
              type: 'image_generation',
              order: '2',
              config: {
                prompt: 'Generate professional product image',
                inputFields: ['productName', 'variant'],
                outputFields: ['imageUrl'],
                model: 'openai/dall-e-3',
              },
            },
          ],
        },
      ],
    },
  ],

  schedules: [
    {
      id: 'generate-initial-products',
      name: 'Generate Initial Products (Run Once)',
      description: 'Generate product variants from new template',
      mode: 'once',
      actionIds: ['create-products-action'],
      steps: [
        {
          modelName: 'ProductTemplate',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'active' },
              { field: 'products_created', operator: 'equals', value: 0 }
            ],
            logic: 'AND'
          },
          actionName: 'createProducts',
          actionId: 'create-products-action',
          order: 1,
        },
      ],
    },
    {
      id: 'write-descriptions',
      name: 'Write Descriptions',
      description: 'Generate descriptions for new products',
      mode: 'recurring',
      intervalHours: 2,
      actionIds: ['write-description-action'],
      steps: [
        {
          modelName: 'Product',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'draft' },
              { field: 'description', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'writeDescription',
          actionId: 'write-description-action',
          order: 1,
        },
      ],
    },
  ],

  usageCount: 0,
  viewCount: 0,
  rating: 0,
  reviewCount: 0,
  createdAt: new Date('2025-01-24'),
  updatedAt: new Date('2025-01-24'),
  badges: ['new'],
};

