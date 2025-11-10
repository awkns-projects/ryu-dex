/**
 * Shopify Order Tracker Template
 */

import type { Template } from './types'

export const SHOPIFY_ORDER_TRACKER_TEMPLATE: Template = {
  id: '1',
  slug: 'shopify-order-tracker',
  title: 'Shopify Order Tracker with AI Insights',
  shortDescription: 'Automatically track orders, analyze customer behavior, and generate weekly reports with AI-powered insights.',
  longDescription: 'This comprehensive Shopify integration automatically syncs your orders, analyzes customer patterns, identifies trends, and generates actionable insights. Perfect for e-commerce managers who want to stay on top of their business metrics.',
  description: 'Track Shopify orders and generate AI-powered analytics',
  category: 'ecommerce',
  subcategories: ['analytics'],
  tags: ['Shopify', 'E-commerce', 'Analytics', 'Reporting'],
  useCases: ['Data Collection', 'Reporting & Analytics', 'Automation & Scheduling'],
  thumbnail: '/templates/shopify-tracker.png',
  icon: '🛒',
  difficulty: 'beginner',
  setupTime: 15,
  pricingTier: 'starter',
  version: '2.1',
  aiFeatures: ['Data Extraction', 'Content Summarization', 'Text Generation'],
  connections: [
    {
      id: 'shopify-connection',
      name: 'shopify',
      title: 'Shopify Connection',
      provider: 'shopify',
      description: 'Connect to your Shopify store for order and customer data',
      icon: '🛍️',
      scopes: ['read_orders', 'read_customers', 'read_products'],
      fieldName: 'shopifyAuth',
      required: true,
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Shopify Store',
      description: {
        feature: 'Connect your Shopify store to track orders in real-time',
        data: 'OAuth connection for Shopify',
        action: 'Sync orders, customers, and product data automatically from your store',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Shopify Connection',
          formType: 'edit',
          whenToUse: 'Use this form to configure Shopify OAuth connection for accessing orders, customers, and products from your Shopify store.',
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
      icon: '📥',

      title: 'Shopify Order Sync',
      description: {
        feature: 'Automatically import orders from Shopify store in real-time',
        data: 'Order number, customer details, items purchased, total amount, and order status',
        action: 'Sync orders from Shopify API, create order records with unique IDs, update existing orders with latest status, track fulfillment and payment status',
      },
      forms: [
        {
          formId: 'manual-order',
          formName: 'Manual Order Entry',
          modelName: 'ShopifyOrder',
          fields: ['orderNumber', 'customerName', 'customerEmail', 'totalAmount', 'status'],
        },
      ],
      models: [
        {
          modelName: 'ShopifyOrder',
          fields: ['orderId', 'orderNumber', 'customerName', 'customerEmail', 'orderDate', 'totalAmount', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '📊',

      title: 'Customer Behavior Analysis',
      description: {
        feature: 'Analyze purchasing patterns and customer behavior trends',
        data: 'Order history, customer purchase frequency, average order value, and product preferences',
        action: 'Use AI to identify repeat customers, calculate lifetime value, detect seasonal trends, segment customers by behavior, and generate personalized insights',
      },
      actions: [
        {
          actionId: 'analyze-customer-action',
          actionName: 'analyzeCustomer',
          actionTitle: 'Analyze Customer',
          modelName: 'ShopifyOrder',
          inputFields: ['customerEmail', 'totalAmount', 'orderDate', 'items'],
          outputFields: ['customerSegment', 'lifetimeValue', 'purchaseFrequency'],
        },
      ],
      models: [
        {
          modelName: 'ShopifyOrder',
          fields: ['customerEmail', 'totalAmount', 'orderDate', 'items', 'customerSegment', 'lifetimeValue', 'purchaseFrequency'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-customer-analysis',
          name: 'Daily Customer Analysis',
          description: 'Analyze customer behavior and purchasing patterns daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['analyze-customer-action'],
          steps: [
            {
              modelName: 'ShopifyOrder',
              actionId: 'analyze-customer-action',
              actionName: 'analyzeCustomer',
              actionTitle: 'Analyze Customer',
              query: {
                filters: [
                  { field: 'customerEmail', operator: 'is_not_empty', value: null },
                  { field: 'customerSegment', operator: 'is_empty', value: null }
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

      title: 'Anomaly Detection',
      description: {
        feature: 'Automatically detect unusual patterns in orders and alert you',
        data: 'Order volumes, average order values, product sales, and historical trends',
        action: 'Monitor orders in real-time, compare against historical averages, identify spikes or drops in sales, detect fraudulent orders, and send alerts for unusual activities',
      },
      actions: [
        {
          actionId: 'detect-anomalies-action',
          actionName: 'detectAnomalies',
          actionTitle: 'Detect Anomalies',
          modelName: 'ShopifyOrder',
          inputFields: ['totalAmount', 'orderDate', 'paymentStatus', 'shippingAddress'],
          outputFields: ['anomalyDetected', 'anomalyType', 'alertMessage'],
        },
      ],
      models: [
        {
          modelName: 'ShopifyOrder',
          fields: ['totalAmount', 'orderDate', 'paymentStatus', 'shippingAddress', 'anomalyDetected', 'anomalyType', 'alertMessage'],
        },
      ],
      schedules: [
        {
          scheduleId: 'hourly-anomaly-detection',
          name: 'Hourly Anomaly Detection',
          description: 'Check for unusual order patterns every hour',
          mode: 'recurring',
          intervalHours: 1,
          actionIds: ['detect-anomalies-action'],
          steps: [
            {
              modelName: 'ShopifyOrder',
              actionId: 'detect-anomalies-action',
              actionName: 'detectAnomalies',
              actionTitle: 'Detect Anomalies',
              query: {
                filters: [
                  { field: 'orderDate', operator: 'is_not_empty', value: null },
                  { field: 'anomalyDetected', operator: 'is_empty', value: null }
                ],
                logic: 'AND'
              },
              order: 1,
            },
          ],
        },
      ],
    }
  ],
  howItWorks: [
    { order: 1, title: 'Connect Shopify', description: 'Link your Shopify store using API credentials' },
    { order: 2, title: 'Configure Settings', description: 'Choose which data to track and reporting frequency' },
    { order: 3, title: 'AI Analyzes Data', description: 'Our AI processes your orders and identifies patterns' },
    { order: 4, title: 'Receive Insights', description: 'Get automated reports and actionable recommendations' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'shopifyAuth', type: 'oauth', label: 'Shopify Connection', oauthProvider: 'shopify', oauthScopes: ['read_orders', 'read_customers', 'read_products'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure Shopify OAuth connection for accessing orders, customers, and products from your Shopify store.',
          modelName: 'Workspace',
          fields: ['shopifyAuth'],
        },
      ],
    },
    {
      name: 'ShopifyOrder',
      description: 'Shopify order tracking with customer analytics',
      fields: [
        { name: 'orderId', type: 'text', label: 'Order ID', required: true },
        { name: 'orderNumber', type: 'text', label: 'Order Number', required: true },
        { name: 'customerName', type: 'text', label: 'Customer Name', required: true },
        { name: 'customerEmail', type: 'email', label: 'Customer Email', required: true },
        { name: 'orderDate', type: 'date', label: 'Order Date', required: true },
        { name: 'totalAmount', type: 'number', label: 'Total Amount', required: true },
        { name: 'currency', type: 'text', label: 'Currency', defaultValue: 'USD' },
        { name: 'items', type: 'text', label: 'Items' },
        { name: 'status', type: 'select', label: 'Status', options: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'], defaultValue: 'Pending' },
        { name: 'shippingAddress', type: 'textarea', label: 'Shipping Address' },
        { name: 'trackingNumber', type: 'text', label: 'Tracking Number' },
        { name: 'fulfillmentStatus', type: 'select', label: 'Fulfillment Status', options: ['Unfulfilled', 'Partial', 'Fulfilled'], defaultValue: 'Unfulfilled' },
        { name: 'paymentStatus', type: 'select', label: 'Payment Status', options: ['Pending', 'Paid', 'Refunded', 'Failed'], defaultValue: 'Pending' },
        { name: 'customerSegment', type: 'text', label: 'Customer Segment' },
        { name: 'lifetimeValue', type: 'number', label: 'Lifetime Value' },
        { name: 'purchaseFrequency', type: 'number', label: 'Purchase Frequency' },
        { name: 'anomalyDetected', type: 'boolean', label: 'Anomaly Detected' },
        { name: 'anomalyType', type: 'text', label: 'Anomaly Type' },
        { name: 'alertMessage', type: 'textarea', label: 'Alert Message' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      forms: [
        {
          id: 'manual-order',
          name: 'Manual Order Entry',
          description: 'Manually add or update Shopify orders',
          icon: '📝',
          modelName: 'ShopifyOrder',
          fields: ['orderNumber', 'customerName', 'customerEmail', 'totalAmount', 'status', 'shippingAddress'],
        },
      ],
      actions: [
        {
          name: 'analyzeCustomer',
          title: 'Analyze Customer',
          emoji: '📊',
          description: 'Analyze customer purchasing patterns and calculate lifetime value',
          modelName: 'ShopifyOrder',
          inputFields: ['customerEmail', 'totalAmount', 'orderDate', 'items'],
          outputFields: ['customerSegment', 'lifetimeValue', 'purchaseFrequency'],
          steps: [
            {
              name: 'calculateMetrics',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the customer purchase history to calculate lifetime value (sum of all orders), purchase frequency (orders per month), and segment the customer (VIP, Regular, New, At-Risk) based on spending patterns and recency.',
                inputFields: ['customerEmail', 'totalAmount', 'orderDate', 'items'],
                outputFields: ['customerSegment', 'lifetimeValue', 'purchaseFrequency'],
                model: 'gpt-4o',
                temperature: 0.2,
              },
            },
          ],
        },
        {
          name: 'detectAnomalies',
          title: 'Detect Anomalies',
          emoji: '🚨',
          description: 'Detect unusual patterns in orders and generate alerts',
          modelName: 'ShopifyOrder',
          inputFields: ['totalAmount', 'orderDate', 'paymentStatus', 'shippingAddress'],
          outputFields: ['anomalyDetected', 'anomalyType', 'alertMessage'],
          steps: [
            {
              name: 'analyzeOrder',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the order for unusual patterns: unusually high order value, suspicious payment status, mismatched shipping address, or unusual timing. Flag anomalies, determine type (Fraud Risk, High Value, Unusual Pattern), and generate an alert message with specific details.',
                inputFields: ['totalAmount', 'orderDate', 'paymentStatus', 'shippingAddress'],
                outputFields: ['anomalyDetected', 'anomalyType', 'alertMessage'],
                model: 'gpt-4o',
                temperature: 0.1,
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'sync-new-orders',
      name: 'Sync New Orders',
      description: 'Automatically sync new orders from Shopify every hour',
      mode: 'recurring',
      intervalHours: 1,
      actionIds: [],
      steps: [],
    },
    {
      id: 'weekly-analytics-report',
      name: 'Weekly Analytics Report',
      description: 'Generate and send weekly analytics report every Monday',
      mode: 'recurring',
      intervalHours: 168, // Weekly
      actionIds: [],
      steps: [],
    },
  ],
  usageCount: 1234,
  viewCount: 5678,
  rating: 4.8,
  reviewCount: 56,
  createdAt: new Date('2024-12-01'),
  updatedAt: new Date('2025-01-15'),
  badges: ['FEATURED', 'POPULAR'],
}

