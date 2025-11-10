/**
 * Instagram Content Performance Analyzer Template
 */

import type { Template } from './types'

export const INSTAGRAM_ANALYZER_TEMPLATE: Template = {
  id: '2',
  slug: 'instagram-content-analyzer',
  title: 'Instagram Content Performance Analyzer',
  shortDescription: 'Track engagement metrics, analyze what works, and get AI recommendations for your next posts.',
  longDescription: 'Understand your Instagram performance with deep analytics. This template tracks all your posts, analyzes engagement patterns, identifies best-performing content types, and provides AI-powered suggestions for future content.',
  description: 'Analyze Instagram performance and generate content insights',
  category: 'social',
  subcategories: ['marketing'],
  tags: ['Instagram', 'Social Media', 'Content', 'Analytics'],
  useCases: ['Data Collection', 'Content Generation', 'Reporting & Analytics'],
  thumbnail: '/templates/instagram-analyzer.png',
  icon: '📸',
  difficulty: 'beginner',
  setupTime: 10,
  pricingTier: 'free',
  version: '1.5',
  aiFeatures: ['Sentiment Analysis', 'Content Summarization', 'Text Generation'],
  connections: [
    {
      id: 'instagram-connection',
      name: 'instagram',
      title: 'Instagram Connection',
      provider: 'instagram',
      description: 'Connect to Instagram to analyze your posts and engagement',
      icon: '📸',
      scopes: ['instagram_basic', 'instagram_content_publish'],
      fieldName: 'instagramAuth',
      required: true,
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Instagram',
      description: {
        feature: 'Connect your Instagram account to analyze posts and engagement',
        data: 'OAuth connection for Instagram',
        action: 'Authenticate with Instagram to access posts, analytics, and insights',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Instagram Connection',
          formType: 'edit',
          whenToUse: 'Use this form to configure Instagram OAuth connection for accessing your Instagram account and analyzing posts.',
          modelName: 'Workspace',
          fields: ['instagramAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'instagramAuth'],
        },
      ],
    },
    {
      icon: '📥',

      title: 'Post Import',
      description: {
        feature: 'Import Instagram posts and stories for performance tracking',
        data: 'Post caption, media URL, post type, hashtags, and published date',
        action: 'Sync posts from Instagram API, create post records with unique IDs, fetch engagement metrics automatically',
      },
      forms: [
        {
          formId: 'manual-post',
          formName: 'Manual Post Entry',
          modelName: 'InstagramPost',
          fields: ['caption', 'postType', 'mediaUrl', 'publishedAt'],
        },
      ],
      models: [
        {
          modelName: 'InstagramPost',
          fields: ['postId', 'caption', 'postType', 'mediaUrl', 'publishedAt', 'createdAt'],
        },
      ],
    },
    {
      icon: '📊',

      title: 'Engagement Analysis',
      description: {
        feature: 'Analyze post performance and identify what resonates with your audience',
        data: 'Likes, comments, shares, saves, reach, impressions, and engagement rate',
        action: 'Calculate engagement metrics, compare post performance, identify top-performing content types, analyze caption effectiveness, track hashtag performance',
      },
      actions: [
        {
          actionId: 'analyze-engagement-action',
          actionName: 'analyzeEngagement',
          actionTitle: 'Analyze Engagement',
          modelName: 'InstagramPost',
          inputFields: ['likes', 'comments', 'shares', 'saves', 'reach', 'impressions'],
          outputFields: ['engagementRate', 'aiSentiment', 'aiRecommendations'],
        },
      ],
      models: [
        {
          modelName: 'InstagramPost',
          fields: ['likes', 'comments', 'shares', 'saves', 'reach', 'impressions', 'engagementRate', 'aiSentiment', 'aiRecommendations'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-engagement-analysis',
          name: 'Daily Engagement Analysis',
          description: 'Analyze Instagram post engagement daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['analyze-engagement-action'],
          steps: [
            {
              modelName: 'InstagramPost',
              actionId: 'analyze-engagement-action',
              actionName: 'analyzeEngagement',
              actionTitle: 'Analyze Engagement',
              query: {
                filters: [
                  { field: 'publishedAt', operator: 'is_not_empty', value: null },
                  { field: 'engagementRate', operator: 'is_empty', value: null }
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

      title: 'Content Recommendations',
      description: {
        feature: 'Get AI-powered suggestions for improving future content',
        data: 'Historical post performance, audience demographics, trending topics, and engagement patterns',
        action: 'Analyze successful posts, identify optimal posting times, suggest content themes, recommend hashtags, generate caption ideas',
      },
      actions: [
        {
          actionId: 'generate-recommendations-action',
          actionName: 'generateRecommendations',
          actionTitle: 'Generate Recommendations',
          modelName: 'InstagramPost',
          inputFields: ['caption', 'postType', 'hashtags', 'engagementRate', 'publishedAt'],
          outputFields: ['aiRecommendations'],
        },
      ],
      models: [
        {
          modelName: 'InstagramPost',
          fields: ['caption', 'postType', 'hashtags', 'engagementRate', 'publishedAt', 'aiRecommendations'],
        },
      ],
      schedules: [
        {
          scheduleId: 'weekly-content-recommendations',
          name: 'Weekly Content Recommendations',
          description: 'Generate content recommendations based on performance weekly',
          mode: 'recurring',
          intervalHours: 168,
          actionIds: ['generate-recommendations-action'],
          steps: [
            {
              modelName: 'InstagramPost',
              actionId: 'generate-recommendations-action',
              actionName: 'generateRecommendations',
              actionTitle: 'Generate Recommendations',
              query: {
                filters: [{ field: 'engagementRate', operator: 'is_not_empty', value: null }],
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
    { order: 1, title: 'Connect Instagram', description: 'Authorize access to your Instagram account' },
    { order: 2, title: 'Historical Analysis', description: 'AI analyzes your past 90 days of content' },
    { order: 3, title: 'Identify Patterns', description: 'Discover what resonates with your audience' },
    { order: 4, title: 'Get Recommendations', description: 'Receive personalized content suggestions' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'instagramAuth', type: 'oauth', label: 'Instagram Connection', oauthProvider: 'instagram' as any, oauthScopes: ['instagram_basic', 'instagram_content_publish'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure Instagram OAuth connection for accessing your Instagram account and analyzing posts.',
          modelName: 'Workspace',
          fields: ['instagramAuth'],
        },
      ],
    },
    {
      name: 'InstagramPost',
      description: 'Instagram post with engagement metrics and AI analysis',
      fields: [
        { name: 'postId', type: 'text', label: 'Post ID', required: true },
        { name: 'caption', type: 'textarea', label: 'Caption' },
        { name: 'postType', type: 'select', label: 'Post Type', options: ['Photo', 'Video', 'Carousel', 'Reel', 'Story'], required: true },
        { name: 'mediaUrl', type: 'url', label: 'Media URL', required: true },
        { name: 'publishedAt', type: 'date', label: 'Published At', required: true },
        { name: 'likes', type: 'number', label: 'Likes', required: true },
        { name: 'comments', type: 'number', label: 'Comments', required: true },
        { name: 'shares', type: 'number', label: 'Shares' },
        { name: 'saves', type: 'number', label: 'Saves' },
        { name: 'reach', type: 'number', label: 'Reach' },
        { name: 'impressions', type: 'number', label: 'Impressions' },
        { name: 'engagementRate', type: 'number', label: 'Engagement Rate (%)' },
        { name: 'hashtags', type: 'text', label: 'Hashtags' },
        { name: 'location', type: 'text', label: 'Location' },
        { name: 'aiSentiment', type: 'select', label: 'AI Sentiment', options: ['Positive', 'Neutral', 'Negative'] },
        { name: 'aiRecommendations', type: 'textarea', label: 'AI Recommendations' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
      ],
      actions: [
        {
          name: 'analyzeEngagement',
          title: 'Analyze Engagement',
          emoji: '📊',
          description: 'Calculate engagement metrics and analyze post performance',
          modelName: 'InstagramPost',
          inputFields: ['likes', 'comments', 'shares', 'saves', 'reach', 'impressions'],
          outputFields: ['engagementRate', 'aiSentiment', 'aiRecommendations'],
          steps: [
            {
              name: 'calculateMetrics',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Calculate engagement rate percentage based on likes, comments, shares, saves divided by reach or impressions. Analyze the engagement pattern to determine sentiment (Positive/Neutral/Negative). Provide specific recommendations for improving future posts based on what performed well.',
                inputFields: ['likes', 'comments', 'shares', 'saves', 'reach', 'impressions'],
                outputFields: ['engagementRate', 'aiSentiment', 'aiRecommendations'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'generateRecommendations',
          title: 'Generate Recommendations',
          emoji: '💡',
          description: 'Generate AI-powered content recommendations',
          modelName: 'InstagramPost',
          inputFields: ['caption', 'postType', 'hashtags', 'engagementRate', 'publishedAt'],
          outputFields: ['aiRecommendations'],
          steps: [
            {
              name: 'analyzePatterns',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the post caption, type, hashtags, and engagement rate to identify what works well. Consider posting time and content style. Generate specific recommendations for future content including optimal post types, caption styles, hashtag strategies, and posting times.',
                inputFields: ['caption', 'postType', 'hashtags', 'engagementRate', 'publishedAt'],
                outputFields: ['aiRecommendations'],
                model: 'gpt-4o',
                temperature: 0.5,
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'daily-content-sync',
      name: 'Daily Content Sync',
      description: 'Sync new Instagram posts and update metrics daily',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: [],
      steps: [],
    },
    {
      id: 'weekly-performance-report',
      name: 'Weekly Performance Report',
      description: 'Generate weekly performance analysis and recommendations',
      mode: 'recurring',
      intervalHours: 168, // Weekly
      actionIds: [],
      steps: [],
    },
  ],
  usageCount: 2156,
  viewCount: 8234,
  rating: 4.9,
  reviewCount: 89,
  createdAt: new Date('2024-11-15'),
  updatedAt: new Date('2025-01-10'),
  badges: ['FEATURED', 'TRENDING', 'POPULAR'],
}

