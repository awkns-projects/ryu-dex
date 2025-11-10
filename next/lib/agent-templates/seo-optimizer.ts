/**
 * SEO Content Research & Optimization Template
 */

import type { Template } from './types'

export const SEO_OPTIMIZER_TEMPLATE: Template = {
  id: '10',
  slug: 'seo-content-optimizer',
  title: 'SEO Content Research & Optimization',
  shortDescription: 'Research keywords, analyze competitors, and optimize your content for search engines with AI.',
  longDescription: 'Boost your search rankings with AI-powered SEO. This template helps you find the right keywords, analyze top-ranking competitors, optimize your content, and track your ranking progress over time.',
  description: 'Optimize content for search engines with AI assistance',
  category: 'marketing',
  subcategories: [],
  tags: ['SEO', 'Content', 'Keywords', 'Optimization'],
  useCases: ['Web Research', 'Content Generation', 'Data Collection'],
  thumbnail: '/templates/seo-optimizer.png',
  icon: '🔍',
  difficulty: 'intermediate',
  setupTime: 25,
  pricingTier: 'pro',
  version: '2.5',
  aiFeatures: ['Web Research', 'Text Generation', 'Content Summarization'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google Search Console for ranking data',
      icon: '🔍',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/webmasters.readonly'],
      fieldName: 'googleAuth',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Google Search Console',
      description: {
        feature: 'Connect Google Search Console to access SEO data and insights',
        data: 'OAuth connection for Google (Search Console, Analytics)',
        action: 'Track rankings, analyze search performance, and monitor indexing status',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Google SEO Tools',
          formType: 'edit',
          whenToUse: 'Use this form to configure Google OAuth connection for accessing Google Search Console and webmaster tools.',
          modelName: 'Workspace',
          fields: ['googleAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'googleAuth'],
        },
      ],
    },
    {
      icon: '⚙️',
      title: 'Content SEO Setup',
      description: {
        feature: 'Set up content for SEO tracking and optimization',
        data: 'Target topic, primary keyword, content title, meta description, and URL',
        action: 'Create SEO content record with unique ID, validate keyword viability, set initial status to "Research", prepare for optimization',
      },
      forms: [
        {
          formId: 'new-seo-content',
          formName: 'New SEO Content',
          formType: 'new',
          whenToUse: 'Use this form to add new content for SEO tracking and optimization. Enter your target topic, primary keyword, content title, and URL.',
          modelName: 'SEOContent',
          fields: ['targetTopic', 'primaryKeyword', 'contentTitle', 'metaDescription', 'currentUrl', 'wordCount'],
          scheduleId: 'research-keywords-schedule',
        },
      ],
      models: [
        {
          modelName: 'SEOContent',
          fields: ['contentId', 'targetTopic', 'primaryKeyword', 'contentTitle', 'metaDescription', 'currentUrl', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'research-keywords-schedule',
          name: 'Research Keywords Schedule',
          description: 'Automatically research keywords after content creation',
          mode: 'once',
          actionIds: ['research-keywords-action', 'analyze-competitors-action'],
          steps: [
            {
              modelName: 'SEOContent',
              actionId: 'research-keywords-action',
              actionName: 'researchKeywords',
              actionTitle: 'Research Keywords',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Research' }],
                logic: 'AND'
              },
              order: 1,
            },
            {
              modelName: 'SEOContent',
              actionId: 'analyze-competitors-action',
              actionName: 'analyzeCompetitors',
              actionTitle: 'Analyze Competitors',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Research' }],
                logic: 'AND'
              },
              order: 2,
            },
          ],
        },
      ],
    },
    {
      icon: '✏️',
      title: 'Update SEO Status',
      description: {
        feature: 'Update the status of SEO content',
        data: 'Content status (Research, In Progress, Optimized, Published, Tracking)',
        action: 'Change the status field to reflect current SEO optimization state',
      },
      forms: [
        {
          formId: 'edit-seo-status',
          formName: 'Update SEO Status',
          formType: 'edit',
          whenToUse: 'Use this form to update the status of your SEO content. Mark content as In Progress, Optimized, or Published.',
          modelName: 'SEOContent',
          fields: ['status', 'updatedAt'],
        },
      ],
      models: [
        {
          modelName: 'SEOContent',
          fields: ['status', 'updatedAt'],
        },
      ],
    },
    {
      icon: '📊',
      title: 'Keyword Research & Analysis',
      description: {
        feature: 'Research keywords and analyze search volume, difficulty, and competition',
        data: 'Target topic and primary keyword',
        action: 'Use web search to find search volume data, analyze keyword difficulty, identify secondary keywords, find long-tail variations, assess competition level',
      },
      actions: [
        {
          actionId: 'research-keywords-action',
          actionName: 'researchKeywords',
          actionTitle: 'Research Keywords',
          modelName: 'SEOContent',
          inputFields: ['targetTopic', 'primaryKeyword'],
          outputFields: ['secondaryKeywords', 'searchVolume', 'difficulty'],
        },
      ],
      models: [
        {
          modelName: 'SEOContent',
          fields: ['targetTopic', 'primaryKeyword', 'secondaryKeywords', 'searchVolume', 'difficulty'],
        },
      ],
      schedules: [
        {
          scheduleId: 'keyword-research-schedule',
          name: 'Keyword Research Schedule',
          description: 'Research keywords for new SEO content daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['research-keywords-action'],
          steps: [
            {
              modelName: 'SEOContent',
              actionId: 'research-keywords-action',
              actionName: 'researchKeywords',
              actionTitle: 'Research Keywords',
              query: {
                filters: [
                  { field: 'primaryKeyword', operator: 'is_not_empty', value: null },
                  { field: 'secondaryKeywords', operator: 'is_empty', value: null }
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
      icon: '📊',
      title: 'Competitor Content Analysis',
      description: {
        feature: 'Analyze top-ranking competitor content for the target keyword',
        data: 'Primary keyword, competitor URLs, and search rankings',
        action: 'Search for top-ranking pages, scrape competitor content, analyze content structure, identify common themes, extract optimization patterns, compile competitive insights',
      },
      actions: [
        {
          actionId: 'analyze-competitors-action',
          actionName: 'analyzeCompetitors',
          actionTitle: 'Analyze Competitors',
          modelName: 'SEOContent',
          inputFields: ['primaryKeyword'],
          outputFields: ['competitorUrls', 'aiRecommendations'],
        },
      ],
      models: [
        {
          modelName: 'SEOContent',
          fields: ['primaryKeyword', 'competitorUrls', 'aiRecommendations'],
        },
      ],
      schedules: [
        {
          scheduleId: 'weekly-competitor-schedule',
          name: 'Weekly Competitor Schedule',
          description: 'Analyze top-ranking competitors weekly',
          mode: 'recurring',
          intervalHours: 168, // Weekly
          actionIds: ['analyze-competitors-action'],
          steps: [
            {
              modelName: 'SEOContent',
              actionId: 'analyze-competitors-action',
              actionName: 'analyzeCompetitors',
              actionTitle: 'Analyze Competitors',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Tracking' },
                  { field: 'status', operator: 'equals', value: 'Published' }
                ],
                logic: 'OR'
              },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      icon: '📋',
      title: 'Content Optimization',
      description: {
        feature: 'Analyze content and provide specific SEO optimization recommendations',
        data: 'Content title, meta description, word count, keyword usage, and structure',
        action: 'Score content on SEO factors (0-100), analyze keyword density, check title and meta optimization, evaluate content structure, generate actionable improvement suggestions',
      },
      actions: [
        {
          actionId: 'optimize-content-action',
          actionName: 'optimizeContent',
          actionTitle: 'Optimize Content',
          modelName: 'SEOContent',
          inputFields: ['contentTitle', 'metaDescription', 'primaryKeyword', 'secondaryKeywords', 'wordCount'],
          outputFields: ['optimizationScore', 'aiRecommendations', 'status'],
        },
      ],
      models: [
        {
          modelName: 'SEOContent',
          fields: ['contentTitle', 'metaDescription', 'primaryKeyword', 'secondaryKeywords', 'wordCount', 'optimizationScore', 'aiRecommendations', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'content-optimization-schedule',
          name: 'Content Optimization Schedule',
          description: 'Optimize SEO content every 12 hours',
          mode: 'recurring',
          intervalHours: 12,
          actionIds: ['optimize-content-action'],
          steps: [
            {
              modelName: 'SEOContent',
              actionId: 'optimize-content-action',
              actionName: 'optimizeContent',
              actionTitle: 'Optimize Content',
              query: {
                filters: [
                  { field: 'contentTitle', operator: 'is_not_empty', value: null },
                  { field: 'optimizationScore', operator: 'is_empty', value: null }
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
    { order: 1, title: 'Enter Target Topic', description: 'Define what you want to rank for' },
    { order: 2, title: 'AI Researches', description: 'Analyzes keywords and top competitors' },
    { order: 3, title: 'Get Recommendations', description: 'Specific tips to optimize your content' },
    { order: 4, title: 'Track Progress', description: 'Monitor ranking improvements' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google', oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/webmasters.readonly'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure Google OAuth connection for accessing Google Search Console and webmaster tools.',
          modelName: 'Workspace',
          fields: ['googleAuth'],
        },
      ],
    },
    {
      name: 'SEOContent',
      description: 'SEO content analysis with keyword research and optimization recommendations',
      fields: [
        { name: 'contentId', type: 'text', label: 'Content ID', required: true },
        { name: 'targetTopic', type: 'text', label: 'Target Topic', required: true },
        { name: 'primaryKeyword', type: 'text', label: 'Primary Keyword', required: true },
        { name: 'secondaryKeywords', type: 'text', label: 'Secondary Keywords' },
        { name: 'currentUrl', type: 'url', label: 'Current URL' },
        { name: 'contentTitle', type: 'text', label: 'Content Title' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
        { name: 'wordCount', type: 'number', label: 'Word Count' },
        { name: 'currentRanking', type: 'number', label: 'Current Ranking' },
        { name: 'searchVolume', type: 'number', label: 'Search Volume' },
        { name: 'difficulty', type: 'select', label: 'Keyword Difficulty', options: ['Easy', 'Medium', 'Hard', 'Very Hard'] },
        { name: 'competitorUrls', type: 'textarea', label: 'Competitor URLs' },
        { name: 'optimizationScore', type: 'number', label: 'Optimization Score (%)' },
        { name: 'aiRecommendations', type: 'textarea', label: 'AI Recommendations' },
        { name: 'status', type: 'select', label: 'Status', options: ['Research', 'In Progress', 'Optimized', 'Published', 'Tracking'], defaultValue: 'Research' },
        { name: 'lastChecked', type: 'date', label: 'Last Checked' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      actions: [
        {
          name: 'researchKeywords',
          title: 'Research Keywords',
          emoji: '🔑',
          description: 'Research and analyze keyword opportunities',
          modelName: 'SEOContent',
          inputFields: ['targetTopic', 'primaryKeyword'],
          outputFields: ['secondaryKeywords', 'searchVolume', 'difficulty'],
          steps: [
            {
              name: 'searchKeywordData',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Search for keyword data, search volume, and related keywords',
                inputFields: ['targetTopic', 'primaryKeyword'],
                outputFields: ['keywordData', 'searchVolume', 'relatedKeywords'],
              },
            },
            {
              name: 'analyzeKeywords',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Analyze the primary keyword and target topic. Identify secondary keywords, estimate search volume, assess keyword difficulty (Easy/Medium/Hard/Very Hard), and find long-tail keyword variations.',
                inputFields: ['targetTopic', 'primaryKeyword'],
                outputFields: ['secondaryKeywords', 'searchVolume', 'difficulty'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'analyzeCompetitors',
          title: 'Analyze Competitors',
          emoji: '🏆',
          description: 'Analyze top-ranking competitor content',
          modelName: 'SEOContent',
          inputFields: ['primaryKeyword'],
          outputFields: ['competitorUrls', 'aiRecommendations'],
          steps: [
            {
              name: 'searchCompetitors',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Find top-ranking pages for the keyword',
                inputFields: ['primaryKeyword'],
                outputFields: ['topPages', 'competitorUrls', 'rankingFactors'],
              },
            },
            {
              name: 'extractCompetitorInsights',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Analyze top-ranking competitor content. Identify common patterns in content structure, word count, keyword usage, and content themes. Generate specific recommendations based on competitive analysis.',
                inputFields: ['primaryKeyword'],
                outputFields: ['competitorUrls', 'aiRecommendations'],
                model: 'gpt-4o',
                temperature: 0.4,
              },
            },
          ],
        },
        {
          name: 'optimizeContent',
          title: 'Optimize Content',
          emoji: '📋',
          description: 'Analyze and score content optimization',
          modelName: 'SEOContent',
          inputFields: ['contentTitle', 'metaDescription', 'primaryKeyword', 'secondaryKeywords', 'wordCount'],
          outputFields: ['optimizationScore', 'aiRecommendations', 'status'],
          steps: [
            {
              name: 'scoreContent',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Score the content on SEO factors (0-100): title optimization, meta description quality, keyword density, content length, use of secondary keywords. Provide specific, actionable recommendations to improve the optimization score.',
                inputFields: ['contentTitle', 'metaDescription', 'primaryKeyword', 'secondaryKeywords', 'wordCount'],
                outputFields: ['optimizationScore', 'aiRecommendations', 'status'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'research-keywords-schedule',
      name: 'Research Keywords (Run Once)',
      description: 'Automatically research keywords after content creation',
      mode: 'once',
      actionIds: ['research-keywords-action', 'analyze-competitors-action'],
      steps: [
        {
          modelName: 'SEOContent',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Research' }],
            logic: 'AND'
          },
          actionName: 'researchKeywords',
          actionId: 'research-keywords-action',
          order: 1,
        },
        {
          modelName: 'SEOContent',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Research' }],
            logic: 'AND'
          },
          actionName: 'analyzeCompetitors',
          actionId: 'analyze-competitors-action',
          order: 2,
        },
      ],
    },
    {
      id: 'keyword-research-schedule',
      name: 'Keyword Research',
      description: 'Research keywords for new SEO content daily',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['research-keywords-action'],
      steps: [
        {
          modelName: 'SEOContent',
          query: {
            filters: [
              { field: 'primaryKeyword', operator: 'is_not_empty', value: null },
              { field: 'secondaryKeywords', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'researchKeywords',
          actionId: 'research-keywords-action',
          order: 1,
        },
      ],
    },
    {
      id: 'weekly-competitor-schedule',
      name: 'Weekly Competitor Analysis',
      description: 'Analyze top-ranking competitors weekly',
      mode: 'recurring',
      intervalHours: 168, // Weekly
      actionIds: ['analyze-competitors-action'],
      steps: [
        {
          modelName: 'SEOContent',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'Tracking' },
              { field: 'status', operator: 'equals', value: 'Published' }
            ],
            logic: 'OR'
          },
          actionName: 'analyzeCompetitors',
          actionId: 'analyze-competitors-action',
          order: 1,
        },
      ],
    },
    {
      id: 'content-optimization-schedule',
      name: 'Content Optimization',
      description: 'Optimize SEO content every 12 hours',
      mode: 'recurring',
      intervalHours: 12,
      actionIds: ['optimize-content-action'],
      steps: [
        {
          modelName: 'SEOContent',
          query: {
            filters: [
              { field: 'contentTitle', operator: 'is_not_empty', value: null },
              { field: 'optimizationScore', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'optimizeContent',
          actionId: 'optimize-content-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 789,
  viewCount: 3245,
  rating: 4.9,
  reviewCount: 45,
  createdAt: new Date('2024-12-01'),
  updatedAt: new Date('2025-01-18'),
  badges: ['FEATURED', 'UPDATED'],
}

