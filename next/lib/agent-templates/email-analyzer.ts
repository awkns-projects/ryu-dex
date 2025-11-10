/**
 * Email Campaign Performance Analyzer Template
 */

import type { Template } from './types'

export const EMAIL_ANALYZER_TEMPLATE: Template = {
  id: '9',
  slug: 'email-campaign-analyzer',
  title: 'Email Campaign Performance Analyzer',
  shortDescription: 'Track email campaign metrics, A/B test results, and get AI recommendations to improve open rates.',
  longDescription: 'Optimize your email marketing with data-driven insights. This template tracks all campaign metrics, analyzes what works, compares A/B tests, and provides specific recommendations to improve your email performance.',
  description: 'Analyze emails and extract key information automatically',
  category: 'marketing',
  subcategories: ['analytics'],
  tags: ['Email Marketing', 'Analytics', 'A/B Testing', 'Optimization'],
  useCases: ['Data Collection', 'Reporting & Analytics', 'Content Generation'],
  thumbnail: '/templates/email-analyzer.png',
  icon: '📧',
  difficulty: 'beginner',
  setupTime: 15,
  pricingTier: 'starter',
  version: '1.9',
  aiFeatures: ['Sentiment Analysis', 'Content Summarization', 'Text Generation'],
  features: [
    {
      icon: '📥',
      title: 'Campaign Import',
      description: {
        feature: 'Import email campaigns from your email marketing platform for analysis',
        data: 'Campaign name, subject line, preview text, sent date, and recipient count',
        action: 'Create campaign record with unique ID, fetch metrics from email platform API, set status to "Analyzing"',
      },
      forms: [
        {
          formId: 'new-campaign-form',
          formName: 'Import Campaign',
          formType: 'new',
          whenToUse: 'Use this form to import a new email campaign for analysis. Enter campaign details like name, subject line, sent date, and recipient count.',
          modelName: 'EmailCampaign',
          fields: ['campaignName', 'subjectLine', 'previewText', 'sentDate', 'recipients', 'opens', 'clicks'],
          scheduleId: 'analyze-campaign-schedule',
        },
      ],
      models: [
        {
          modelName: 'EmailCampaign',
          fields: ['campaignId', 'campaignName', 'subjectLine', 'sentDate', 'recipients', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'analyze-campaign-schedule',
          name: 'Analyze Campaign Schedule',
          description: 'Automatically analyze campaign after import',
          mode: 'once',
          actionIds: ['analyze-campaign-action'],
          steps: [
            {
              modelName: 'EmailCampaign',
              actionId: 'analyze-campaign-action',
              actionName: 'analyzeCampaign',
              actionTitle: 'Analyze Campaign',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Analyzing' }],
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
      title: 'Update Campaign Status',
      description: {
        feature: 'Update the status of email campaigns',
        data: 'Campaign status (Draft, Sent, Scheduled, Analyzing)',
        action: 'Change the status field to reflect current campaign state',
      },
      forms: [
        {
          formId: 'edit-campaign-status',
          formName: 'Update Campaign Status',
          formType: 'edit',
          whenToUse: 'Use this form to update an existing campaign\'s status. Select the appropriate status (Draft, Sent, Scheduled, Analyzing).',
          modelName: 'EmailCampaign',
          fields: ['status'],
        },
      ],
      models: [
        {
          modelName: 'EmailCampaign',
          fields: ['status'],
        },
      ],
    },
    {
      icon: '📊',
      title: 'Performance Analysis',
      description: {
        feature: 'Automatically analyze campaign metrics and identify areas for improvement',
        data: 'Campaign metrics including opens, clicks, conversions, bounces, and unsubscribes',
        action: 'Calculate engagement rates, identify patterns, compare against industry benchmarks, generate AI-powered recommendations for improving future campaigns',
      },
      actions: [
        {
          actionId: 'analyze-campaign-action',
          actionName: 'analyzeCampaign',
          actionTitle: 'Analyze Campaign',
          modelName: 'EmailCampaign',
          inputFields: ['opens', 'clicks', 'conversions', 'recipients', 'subjectLine'],
          outputFields: ['openRate', 'clickRate', 'conversionRate', 'aiRecommendations'],
        },
      ],
      models: [
        {
          modelName: 'EmailCampaign',
          fields: ['opens', 'clicks', 'conversions', 'recipients', 'subjectLine', 'openRate', 'clickRate', 'conversionRate', 'aiRecommendations'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-campaign-analysis',
          name: 'Daily Campaign Analysis',
          description: 'Analyze email campaign performance daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['analyze-campaign-action'],
          steps: [
            {
              modelName: 'EmailCampaign',
              actionId: 'analyze-campaign-action',
              actionName: 'analyzeCampaign',
              actionTitle: 'Analyze Campaign',
              query: {
                filters: [
                  { field: 'opens', operator: 'is_not_empty', value: null },
                  { field: 'openRate', operator: 'is_empty', value: null }
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
      title: 'A/B Test Comparison',
      description: {
        feature: 'Compare A/B test variations and determine the winning version',
        data: 'Multiple campaign records with different subject lines or content variations',
        action: 'Analyze performance metrics across variations, determine statistical significance, identify the winning version, and provide insights on what elements performed best',
      },
      actions: [
        {
          actionId: 'compare-variations-action',
          actionName: 'compareVariations',
          actionTitle: 'Compare A/B Tests',
          modelName: 'EmailCampaign',
          inputFields: ['campaignName', 'subjectLine', 'openRate', 'clickRate', 'conversionRate'],
          outputFields: ['aiRecommendations'],
        },
      ],
      models: [
        {
          modelName: 'EmailCampaign',
          fields: ['campaignName', 'subjectLine', 'openRate', 'clickRate', 'conversionRate', 'aiRecommendations'],
        },
      ],
      schedules: [
        {
          scheduleId: 'weekly-ab-comparison-schedule',
          name: 'Weekly AB Comparison Schedule',
          description: 'Compare A/B test variations weekly',
          mode: 'recurring',
          intervalHours: 168, // Weekly
          actionIds: ['compare-variations-action'],
          steps: [
            {
              modelName: 'EmailCampaign',
              actionId: 'compare-variations-action',
              actionName: 'compareVariations',
              actionTitle: 'Compare A/B Tests',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Sent' }],
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
    { order: 1, title: 'Connect Email Tool', description: 'Integrate your email marketing platform' },
    { order: 2, title: 'Import Campaigns', description: 'AI pulls your campaign data' },
    { order: 3, title: 'Analyze Performance', description: 'Get insights on what resonates' },
    { order: 4, title: 'Apply Suggestions', description: 'Improve future campaigns with AI tips' },
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
      name: 'EmailCampaign',
      description: 'Email campaign with performance metrics and A/B test results',
      fields: [
        { name: 'campaignId', type: 'text', label: 'Campaign ID', required: true },
        { name: 'campaignName', type: 'text', label: 'Campaign Name', required: true },
        { name: 'subjectLine', type: 'text', label: 'Subject Line', required: true },
        { name: 'previewText', type: 'text', label: 'Preview Text' },
        { name: 'sentDate', type: 'date', label: 'Sent Date', required: true },
        { name: 'recipients', type: 'number', label: 'Recipients', required: true },
        { name: 'opens', type: 'number', label: 'Opens', required: true },
        { name: 'clicks', type: 'number', label: 'Clicks', required: true },
        { name: 'conversions', type: 'number', label: 'Conversions' },
        { name: 'bounces', type: 'number', label: 'Bounces' },
        { name: 'unsubscribes', type: 'number', label: 'Unsubscribes' },
        { name: 'openRate', type: 'number', label: 'Open Rate (%)' },
        { name: 'clickRate', type: 'number', label: 'Click Rate (%)' },
        { name: 'conversionRate', type: 'number', label: 'Conversion Rate (%)' },
        { name: 'aiRecommendations', type: 'textarea', label: 'AI Recommendations' },
        { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Sent', 'Scheduled', 'Analyzing'], defaultValue: 'Draft' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
      ],
      actions: [
        {
          name: 'analyzeCampaign',
          title: 'Analyze Campaign',
          emoji: '📊',
          description: 'Analyze campaign metrics and generate improvement recommendations',
          modelName: 'EmailCampaign',
          inputFields: ['opens', 'clicks', 'conversions', 'recipients', 'subjectLine'],
          outputFields: ['openRate', 'clickRate', 'conversionRate', 'aiRecommendations'],
          steps: [
            {
              name: 'calculateMetrics',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Calculate email campaign performance metrics: open rate (opens/recipients * 100), click rate (clicks/recipients * 100), conversion rate (conversions/recipients * 100). Then analyze the subject line and provide specific recommendations to improve future campaign performance.',
                inputFields: ['opens', 'clicks', 'conversions', 'recipients', 'subjectLine'],
                outputFields: ['openRate', 'clickRate', 'conversionRate', 'aiRecommendations'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'compareVariations',
          title: 'Compare A/B Tests',
          emoji: '🧪',
          description: 'Compare A/B test variations and identify winning version',
          modelName: 'EmailCampaign',
          inputFields: ['campaignName', 'subjectLine', 'openRate', 'clickRate', 'conversionRate'],
          outputFields: ['aiRecommendations'],
          steps: [
            {
              name: 'analyzeVariations',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze multiple campaign variations with different subject lines or content. Compare their performance metrics (open rate, click rate, conversion rate), determine statistical significance, identify the winning version, and provide insights on what elements performed best.',
                inputFields: ['campaignName', 'subjectLine', 'openRate', 'clickRate', 'conversionRate'],
                outputFields: ['aiRecommendations'],
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
      id: 'analyze-campaign-schedule',
      name: 'Analyze Campaign (Run Once)',
      description: 'Automatically analyze campaign after import',
      mode: 'once',
      actionIds: ['analyze-campaign-action'],
      steps: [
        {
          modelName: 'EmailCampaign',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Analyzing' }],
            logic: 'AND'
          },
          actionName: 'analyzeCampaign',
          actionId: 'analyze-campaign-action',
          order: 1,
        },
      ],
    },
    {
      id: 'daily-campaign-analysis-schedule',
      name: 'Daily Campaign Analysis',
      description: 'Analyze email campaign performance daily and generate insights',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['analyze-campaign-action'],
      steps: [
        {
          modelName: 'EmailCampaign',
          query: {
            filters: [
              { field: 'opens', operator: 'is_not_empty', value: null },
              { field: 'openRate', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'analyzeCampaign',
          actionId: 'analyze-campaign-action',
          order: 1,
        },
      ],
    },
    {
      id: 'weekly-ab-comparison-schedule',
      name: 'Weekly A/B Test Analysis',
      description: 'Compare A/B test variations weekly',
      mode: 'recurring',
      intervalHours: 168, // Weekly
      actionIds: ['compare-variations-action'],
      steps: [
        {
          modelName: 'EmailCampaign',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Sent' }],
            logic: 'AND'
          },
          actionName: 'compareVariations',
          actionId: 'compare-variations-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 1123,
  viewCount: 4567,
  rating: 4.7,
  reviewCount: 67,
  createdAt: new Date('2024-11-05'),
  updatedAt: new Date('2024-12-28'),
  badges: [],
}

