/**
 * Competitor Price Monitoring & Alerts Template
 */

import type { Template } from './types'

export const PRICE_TRACKER_TEMPLATE: Template = {
  id: '8',
  slug: 'competitor-price-tracker',
  title: 'Competitor Price Monitoring & Alerts',
  shortDescription: 'Track competitor prices, get alerts on changes, and optimize your pricing strategy with AI insights.',
  longDescription: 'Stay competitive with automated price monitoring. This template tracks competitor prices across multiple sites, alerts you to changes, analyzes pricing trends, and provides recommendations for your pricing strategy.',
  description: 'Track competitor prices and get notifications',
  category: 'ecommerce',
  subcategories: ['analytics'],
  tags: ['E-commerce', 'Pricing', 'Competition', 'Monitoring'],
  useCases: ['Web Research', 'Data Collection', 'Notification & Alerts'],
  thumbnail: '/templates/price-tracker.png',
  icon: '💲',
  difficulty: 'intermediate',
  setupTime: 20,
  pricingTier: 'pro',
  version: '2.2',
  aiFeatures: ['Web Research', 'Data Extraction', 'Text Generation'],
  features: [
    {
      icon: '📈',

      title: 'Competitor URL Tracking',
      description: {
        feature: 'Add competitor products to monitor with URL tracking',
        data: 'Product name, competitor name, competitor URL, and alert threshold',
        action: 'Create tracking record with unique ID, validate URL accessibility, set monitoring frequency, initialize price history',
      },
      forms: [
        {
          formId: 'add-competitor',
          formName: 'Add Competitor',
          modelName: 'CompetitorPrice',
          fields: ['productName', 'competitorName', 'competitorUrl', 'alertThreshold'],
        },
      ],
      models: [
        {
          modelName: 'CompetitorPrice',
          fields: ['trackingId', 'productName', 'competitorName', 'competitorUrl', 'alertThreshold', 'createdAt'],
        },
      ],
    },
    {
      icon: '🤖',

      title: 'Automated Price Scraping',
      description: {
        feature: 'Automatically scrape and track competitor prices from their websites',
        data: 'Competitor URLs and product identifiers',
        action: 'Visit competitor websites, extract current prices using web scraping, detect currency, check availability status, compare with previous price, update records with latest data',
      },
      actions: [
        {
          actionId: 'scrape-prices-action',
          actionName: 'scrapePrices',
          actionTitle: 'Scrape Prices',
          modelName: 'CompetitorPrice',
          inputFields: ['competitorUrl', 'productName'],
          outputFields: ['currentPrice', 'previousPrice', 'currency', 'availability', 'lastChecked'],
        },
      ],
      models: [
        {
          modelName: 'CompetitorPrice',
          fields: ['competitorUrl', 'productName', 'currentPrice', 'previousPrice', 'currency', 'availability', 'lastChecked'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-price-scraping',
          name: 'Daily Price Scraping',
          description: 'Scrape competitor prices daily to track changes',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['scrape-prices-action'],
          steps: [
            {
              modelName: 'CompetitorPrice',
              actionId: 'scrape-prices-action',
              actionName: 'scrapePrices',
              actionTitle: 'Scrape Prices',
              query: {
                filters: [{ field: 'competitorUrl', operator: 'is_not_empty', value: null }],
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

      title: 'Price Change Detection & Alerts',
      description: {
        feature: 'Detect significant price changes and send real-time alerts',
        data: 'Current price, previous price, alert threshold, price history',
        action: 'Calculate price change percentage, compare against threshold, identify if alert needed, generate alert message with context, send notification via email/Slack',
      },
      actions: [
        {
          actionId: 'detect-changes-action',
          actionName: 'detectChanges',
          actionTitle: 'Detect Changes',
          modelName: 'CompetitorPrice',
          inputFields: ['currentPrice', 'previousPrice', 'alertThreshold'],
          outputFields: ['priceChange', 'anomalyDetected', 'anomalyType', 'alertMessage'],
        },
      ],
      models: [
        {
          modelName: 'CompetitorPrice',
          fields: ['currentPrice', 'previousPrice', 'alertThreshold', 'priceChange', 'anomalyDetected', 'anomalyType', 'alertMessage'],
        },
      ],
      schedules: [
        {
          scheduleId: 'detect-price-changes',
          name: 'Detect Price Changes',
          description: 'Check for significant price changes every 6 hours',
          mode: 'recurring',
          intervalHours: 6,
          actionIds: ['detect-changes-action'],
          steps: [
            {
              modelName: 'CompetitorPrice',
              actionId: 'detect-changes-action',
              actionName: 'detectChanges',
              actionTitle: 'Detect Changes',
              query: {
                filters: [
                  { field: 'currentPrice', operator: 'is_not_empty', value: null },
                  { field: 'priceChange', operator: 'is_empty', value: null }
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
      icon: '🤖',

      title: 'AI Price Recommendations',
      description: {
        feature: 'Get AI-powered pricing recommendations based on competitive analysis',
        data: 'Your product price, competitor prices, market trends, and historical data',
        action: 'Analyze competitive pricing landscape, consider demand patterns, evaluate profit margins, use AI to recommend optimal pricing strategy, provide reasoning and confidence level',
      },
      actions: [
        {
          actionId: 'recommend-price-action',
          actionName: 'recommendPrice',
          actionTitle: 'Recommend Price',
          modelName: 'CompetitorPrice',
          inputFields: ['productName', 'currentPrice', 'competitorName', 'priceChange'],
          outputFields: ['aiRecommendedPrice', 'notes'],
        },
      ],
      models: [
        {
          modelName: 'CompetitorPrice',
          fields: ['productName', 'currentPrice', 'competitorName', 'priceChange', 'aiRecommendedPrice', 'notes'],
        },
      ],
      schedules: [
        {
          scheduleId: 'weekly-price-recommendations',
          name: 'Weekly Price Recommendations',
          description: 'Generate pricing recommendations weekly based on market data',
          mode: 'recurring',
          intervalHours: 168,
          actionIds: ['recommend-price-action'],
          steps: [
            {
              modelName: 'CompetitorPrice',
              actionId: 'recommend-price-action',
              actionName: 'recommendPrice',
              actionTitle: 'Recommend Price',
              query: {
                filters: [{ field: 'currentPrice', operator: 'is_not_empty', value: null }],
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
    { order: 1, title: 'Add Competitors', description: 'List competitor URLs to monitor' },
    { order: 2, title: 'Set Monitoring Rules', description: 'Define products and check frequency' },
    { order: 3, title: 'Track Prices', description: 'AI scrapes and records prices daily' },
    { order: 4, title: 'Get Recommendations', description: 'Receive pricing strategy insights' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
      ],
      // CRITICAL: Default workspace is auto-created. NO forms needed (no OAuth connections).
      forms: [],
    },
    {
      name: 'CompetitorPrice',
      description: 'Competitor price tracking with historical data and alerts',
      fields: [
        { name: 'trackingId', type: 'text', label: 'Tracking ID', required: true },
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'competitorName', type: 'text', label: 'Competitor Name', required: true },
        { name: 'competitorUrl', type: 'url', label: 'Competitor URL', required: true },
        { name: 'currentPrice', type: 'number', label: 'Current Price', required: true },
        { name: 'previousPrice', type: 'number', label: 'Previous Price' },
        { name: 'currency', type: 'text', label: 'Currency', defaultValue: 'USD' },
        { name: 'priceChange', type: 'number', label: 'Price Change (%)' },
        { name: 'lastChecked', type: 'date', label: 'Last Checked' },
        { name: 'availability', type: 'select', label: 'Availability', options: ['In Stock', 'Out of Stock', 'Limited', 'Pre-order'], defaultValue: 'In Stock' },
        { name: 'alertThreshold', type: 'number', label: 'Alert Threshold (%)' },
        { name: 'aiRecommendedPrice', type: 'number', label: 'AI Recommended Price' },
        { name: 'notes', type: 'textarea', label: 'Notes' },
        { name: 'anomalyDetected', type: 'boolean', label: 'Anomaly Detected', defaultValue: false },
        { name: 'anomalyType', type: 'text', label: 'Anomaly Type' },
        { name: 'alertMessage', type: 'textarea', label: 'Alert Message' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      actions: [
        {
          name: 'scrapePrices',
          title: 'Scrape Prices',
          emoji: '🔍',
          description: 'Scrape and track competitor prices from websites',
          modelName: 'CompetitorPrice',
          inputFields: ['competitorUrl', 'productName'],
          outputFields: ['currentPrice', 'previousPrice', 'currency', 'availability', 'lastChecked'],
          steps: [
            {
              name: 'scrapeWebsite',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Extract current price, availability, and currency from the competitor website',
                inputFields: ['competitorUrl', 'productName'],
                outputFields: ['scrapedPrice', 'productAvailability', 'currencyCode'],
              },
            },
            {
              name: 'extractPriceData',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Extract the current price, detect currency, check availability status, and compare with previous price if available. Return structured data.',
                inputFields: ['competitorUrl', 'productName'],
                outputFields: ['currentPrice', 'previousPrice', 'currency', 'availability', 'lastChecked'],
                model: 'gpt-4o',
                temperature: 0.1,
              },
            },
          ],
        },
        {
          name: 'detectChanges',
          title: 'Detect Price Changes',
          emoji: '🔔',
          description: 'Detect significant price changes and generate alerts',
          modelName: 'CompetitorPrice',
          inputFields: ['currentPrice', 'previousPrice', 'alertThreshold'],
          outputFields: ['priceChange', 'anomalyDetected', 'anomalyType', 'alertMessage'],
          steps: [
            {
              name: 'analyzeChanges',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Calculate price change percentage between current and previous price. If change exceeds alert threshold, flag as anomaly, determine anomaly type (Price Drop, Price Increase, Significant Change), and generate an alert message explaining the change and potential impact.',
                inputFields: ['currentPrice', 'previousPrice', 'alertThreshold'],
                outputFields: ['priceChange', 'anomalyDetected', 'anomalyType', 'alertMessage'],
                model: 'gpt-4o',
                temperature: 0.2,
              },
            },
          ],
        },
        {
          name: 'recommendPrice',
          title: 'Recommend Optimal Price',
          emoji: '💡',
          description: 'Generate AI-powered pricing recommendations',
          modelName: 'CompetitorPrice',
          inputFields: ['productName', 'currentPrice', 'competitorName', 'priceChange'],
          outputFields: ['aiRecommendedPrice', 'notes'],
          steps: [
            {
              name: 'analyzePricing',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the competitive pricing landscape for this product. Consider current price, competitor prices, recent price changes, and market trends. Recommend an optimal price point with reasoning about profit margins, competitiveness, and demand. Provide confidence level and supporting notes.',
                inputFields: ['productName', 'currentPrice', 'competitorName', 'priceChange'],
                outputFields: ['aiRecommendedPrice', 'notes'],
                model: 'gpt-4o',
                temperature: 0.4,
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'daily-price-scraping',
      name: 'Daily Price Check',
      description: 'Check competitor prices and update records daily',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['scrape-prices-action'],
      steps: [
        {
          modelName: 'CompetitorPrice',
          query: {
            filters: [{ field: 'competitorUrl', operator: 'is_not_empty', value: null }],
            logic: 'AND'
          },
          actionName: 'scrapePrices',
          actionId: 'scrape-prices-action',
          order: 1,
        },
      ],
    },
    {
      id: 'detect-price-changes',
      name: 'Price Alert Monitor',
      description: 'Monitor for significant price changes every 6 hours',
      mode: 'recurring',
      intervalHours: 6,
      actionIds: ['detect-changes-action'],
      steps: [
        {
          modelName: 'CompetitorPrice',
          query: {
            filters: [
              { field: 'currentPrice', operator: 'is_not_empty', value: null },
              { field: 'priceChange', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'detectChanges',
          actionId: 'detect-changes-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 567,
  viewCount: 2134,
  rating: 4.6,
  reviewCount: 31,
  createdAt: new Date('2024-11-20'),
  updatedAt: new Date('2025-01-08'),
  badges: ['TRENDING'],
}

