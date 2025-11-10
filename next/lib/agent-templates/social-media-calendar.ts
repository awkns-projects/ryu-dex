/**
 * Social Media Content Calendar Template
 */

import type { Template } from './types'

export const SOCIAL_MEDIA_CALENDAR_TEMPLATE: Template = {
  id: '4',
  slug: 'social-media-content-calendar',
  title: 'AI-Powered Social Media Content Calendar',
  shortDescription: 'Plan, generate, and schedule social media content across multiple platforms with AI assistance.',
  longDescription: 'Never run out of content ideas again. This template helps you plan content across platforms, generates post ideas based on trends, creates variations for different channels, and schedules posts automatically.',
  description: 'Plan and schedule social media content',
  category: 'marketing',
  subcategories: ['social'],
  tags: ['Social Media', 'Content', 'Scheduling', 'AI'],
  useCases: ['Content Generation', 'Automation & Scheduling', 'API Integration'],
  thumbnail: '/templates/content-calendar.png',
  icon: '💬',
  difficulty: 'beginner',
  setupTime: 20,
  pricingTier: 'starter',
  version: '2.3',
  aiFeatures: ['Text Generation', 'Image Generation', 'Content Summarization'],
  connections: [
    {
      id: 'x-connection',
      name: 'x',
      title: 'X (Twitter) Connection',
      provider: 'x',
      description: 'Connect to X (Twitter) to post tweets',
      icon: '🐦',
      scopes: ['tweet.read', 'tweet.write', 'users.read'],
      fieldName: 'xAuth',
    },
    {
      id: 'facebook-connection',
      name: 'facebook',
      title: 'Facebook Connection',
      provider: 'facebook',
      description: 'Connect to Facebook to publish posts',
      icon: '👥',
      scopes: ['email', 'public_profile', 'pages_manage_posts'],
      fieldName: 'fbAuth',
    },
    {
      id: 'linkedin-connection',
      name: 'linkedin',
      title: 'LinkedIn Connection',
      provider: 'linkedin',
      description: 'Connect to LinkedIn for professional networking',
      icon: '💼',
      scopes: ['r_liteprofile', 'w_member_social'],
      fieldName: 'linkedinAuth',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Social Platforms',
      description: {
        feature: 'Connect X/Twitter, Facebook, and LinkedIn for cross-platform scheduling',
        data: 'OAuth connections for X, Facebook, and LinkedIn',
        action: 'Publish posts across multiple social platforms automatically',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Social Platform Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for social media platforms (X/Twitter, Facebook, LinkedIn). This allows your agent to publish posts across platforms.',
          modelName: 'Workspace',
          fields: ['xAuth', 'fbAuth', 'linkedinAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'xAuth', 'fbAuth', 'linkedinAuth'],
        },
      ],
    },
    {
      icon: '📋',

      title: 'Content Planning',
      description: {
        feature: 'Plan social media posts across multiple platforms with scheduling',
        data: 'Post content, platform, scheduled date/time, content pillar, and hashtags',
        action: 'Create post record with unique ID, validate content length for platform, set status to "Scheduled", add to calendar view',
      },
      forms: [
        {
          formId: 'schedule-post',
          formName: 'Schedule Post',
          modelName: 'SocialMediaPost',
          fields: ['content', 'platform', 'scheduledDate', 'contentPillar', 'hashtags'],
        },
      ],
      models: [
        {
          modelName: 'SocialMediaPost',
          fields: ['postId', 'content', 'platform', 'scheduledDate', 'contentPillar', 'hashtags', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '🤖',

      title: 'AI Content Generation',
      description: {
        feature: 'Generate engaging social media posts tailored to each platform',
        data: 'Content topic, platform type, tone, target audience, and content pillar',
        action: 'Use AI to create platform-optimized content, adapt length and style for each platform, suggest relevant hashtags, generate multiple variations, mark as AI-generated',
      },
      actions: [
        {
          actionId: 'generate-post-action',
          actionName: 'generatePost',
          actionTitle: 'Generate Post',
          modelName: 'SocialMediaPost',
          inputFields: ['platform', 'contentPillar'],
          outputFields: ['content', 'hashtags', 'aiGenerated'],
        },
      ],
      models: [
        {
          modelName: 'SocialMediaPost',
          fields: ['platform', 'contentPillar', 'content', 'hashtags', 'aiGenerated'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-content-generation',
          name: 'Daily Content Generation',
          description: 'Generate AI posts for scheduled slots daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['generate-post-action'],
          steps: [
            {
              modelName: 'SocialMediaPost',
              actionId: 'generate-post-action',
              actionName: 'generatePost',
              actionTitle: 'Generate Post',
              query: {
                filters: [
                  { field: 'content', operator: 'is_empty', value: null },
                  { field: 'aiGenerated', operator: 'equals', value: false }
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

      title: 'Automated Publishing',
      description: {
        feature: 'Automatically publish posts at scheduled times to connected platforms',
        data: 'Scheduled posts with content, platform, OAuth tokens, and publish time',
        action: 'Check for posts ready to publish, authenticate with platform APIs, post content to social networks, update status to "Published", record engagement metrics',
      },
      actions: [
        {
          actionId: 'publish-post-action',
          actionName: 'publishPost',
          actionTitle: 'Publish Post',
          modelName: 'SocialMediaPost',
          inputFields: ['content', 'platform', 'hashtags', 'mediaUrl'],
          outputFields: ['status', 'publishedAt', 'engagementMetrics'],
        },
      ],
      models: [
        {
          modelName: 'SocialMediaPost',
          fields: ['content', 'platform', 'hashtags', 'mediaUrl', 'status', 'publishedAt', 'engagementMetrics'],
        },
      ],
      schedules: [
        {
          scheduleId: 'hourly-publishing',
          name: 'Hourly Publishing',
          description: 'Publish scheduled posts every hour when their time arrives',
          mode: 'recurring',
          intervalHours: 1,
          actionIds: ['publish-post-action'],
          steps: [
            {
              modelName: 'SocialMediaPost',
              actionId: 'publish-post-action',
              actionName: 'publishPost',
              actionTitle: 'Publish Post',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Scheduled' }],
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
    { order: 1, title: 'Set Your Topics', description: 'Define themes and content pillars' },
    { order: 2, title: 'AI Generates Ideas', description: 'Get post suggestions for the month' },
    { order: 3, title: 'Customize & Schedule', description: 'Edit posts and set publishing times' },
    { order: 4, title: 'Auto-publish', description: 'Content goes live automatically' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'xAuth', type: 'oauth', label: 'X (Twitter) Connection', oauthProvider: 'x' as any, oauthScopes: ['tweet.read', 'tweet.write', 'users.read'] },
        { name: 'fbAuth', type: 'oauth', label: 'Facebook Connection', oauthProvider: 'facebook', oauthScopes: ['email', 'public_profile', 'pages_manage_posts'] },
        { name: 'linkedinAuth', type: 'oauth', label: 'LinkedIn Connection', oauthProvider: 'linkedin' as any, oauthScopes: ['r_liteprofile', 'w_member_social'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for social media platforms (X/Twitter, Facebook, LinkedIn). This allows your agent to publish posts across platforms.',
          modelName: 'Workspace',
          fields: ['xAuth', 'fbAuth', 'linkedinAuth'],
        },
      ],
    },
    {
      name: 'SocialMediaPost',
      description: 'Scheduled social media post with multi-platform support',
      fields: [
        { name: 'postId', type: 'text', label: 'Post ID', required: true },
        { name: 'content', type: 'textarea', label: 'Content', required: true },
        { name: 'platform', type: 'select', label: 'Platform', options: ['Twitter/X', 'LinkedIn', 'Facebook', 'Instagram', 'Threads'], required: true },
        { name: 'scheduledDate', type: 'date', label: 'Scheduled Date', required: true },
        { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Scheduled', 'Published', 'Failed'], defaultValue: 'Draft' },
        { name: 'mediaUrl', type: 'url', label: 'Media URL' },
        { name: 'hashtags', type: 'text', label: 'Hashtags' },
        { name: 'contentPillar', type: 'select', label: 'Content Pillar', options: ['Educational', 'Promotional', 'Entertainment', 'News', 'Engagement'] },
        { name: 'aiGenerated', type: 'boolean', label: 'AI Generated', defaultValue: false },
        { name: 'engagementMetrics', type: 'text', label: 'Engagement Metrics' },
        { name: 'publishedAt', type: 'date', label: 'Published At' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      actions: [
        {
          name: 'generatePost',
          title: 'Generate Post Content',
          emoji: '✍️',
          description: 'Generate engaging social media posts tailored to platform',
          modelName: 'SocialMediaPost',
          inputFields: ['platform', 'contentPillar'],
          outputFields: ['content', 'hashtags', 'aiGenerated'],
          steps: [
            {
              name: 'createContent',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Generate engaging social media content optimized for the specified platform and content pillar. Adapt length and style for the platform (Twitter: concise, LinkedIn: professional, Instagram: visual-focused). Suggest 3-5 relevant hashtags. Mark as AI-generated.',
                inputFields: ['platform', 'contentPillar'],
                outputFields: ['content', 'hashtags', 'aiGenerated'],
                model: 'gpt-4o',
                temperature: 0.8,
              },
            },
          ],
        },
        {
          name: 'publishPost',
          title: 'Publish Post',
          emoji: '🚀',
          description: 'Publish post to social platform at scheduled time',
          modelName: 'SocialMediaPost',
          inputFields: ['content', 'platform', 'hashtags', 'mediaUrl'],
          outputFields: ['status', 'publishedAt', 'engagementMetrics'],
          steps: [
            {
              name: 'publishToPlatform',
              type: 'custom',
              order: '1',
              config: {
                description: 'Post content to the selected social media platform (X, Facebook, LinkedIn, Instagram, or Threads) using OAuth tokens',
                inputFields: ['content', 'platform', 'hashtags', 'mediaUrl'],
                outputFields: ['status', 'publishedAt', 'engagementMetrics'],
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'generate-content-ideas',
      name: 'Generate Content Ideas',
      description: 'Generate AI-powered content ideas for the upcoming week',
      mode: 'recurring',
      intervalHours: 168, // Weekly
      actionIds: [],
      steps: [],
    },
    {
      id: 'auto-publish-posts',
      name: 'Auto-publish Posts',
      description: 'Check and publish scheduled posts every hour',
      mode: 'recurring',
      intervalHours: 1,
      actionIds: [],
      steps: [],
    },
  ],
  usageCount: 1567,
  viewCount: 6234,
  rating: 4.6,
  reviewCount: 72,
  createdAt: new Date('2024-12-10'),
  updatedAt: new Date('2025-01-05'),
  badges: ['FEATURED', 'NEW'],
}

