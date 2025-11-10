/**
 * Social Campaign Generator Template - Factory Pattern Example
 * 
 * Demonstrates: CampaignIdea (parent) → SocialPost (children)
 * Pattern: One campaign idea generates multiple scheduled social posts
 */

import type { AgentTemplateData } from './types';

export const SOCIAL_CAMPAIGN_GENERATOR_TEMPLATE: AgentTemplateData = {
  id: 'social-campaign-generator',
  slug: 'social-campaign-generator',
  title: 'Social Campaign Generator',
  shortDescription: 'Create campaign ideas that auto-generate daily social posts',
  longDescription: 'Factory pattern example: Create one campaign idea template, and AI automatically generates multiple social posts from it based on your schedule. Perfect for testing the template-to-record generation pattern.',
  description: 'Automatically generate social posts from campaign ideas',
  thumbnail: '/templates/campaign-generator.png',
  icon: '🚀',
  category: 'social',
  subcategories: ['marketing', 'automation'],
  tags: ['Social Media', 'Campaigns', 'Automation', 'Factory Pattern'],
  useCases: ['Content Generation', 'Automation & Scheduling'],
  difficulty: 'intermediate',
  setupTime: 15,
  pricingTier: 'pro',
  version: '1.0',
  aiFeatures: ['Text Generation', 'Image Generation'],
  connections: [
    {
      id: 'x-connection',
      name: 'x',
      title: 'X (Twitter) Connection',
      provider: 'x',
      description: 'Connect to X/Twitter to publish generated posts',
      icon: '𝕏',
      scopes: ['tweet.read', 'tweet.write', 'users.read'],
      fieldName: 'xAuth',
      required: false,
    },
  ],

  features: [
    {
      icon: '🔗',
      title: 'Connect X/Twitter',
      description: {
        feature: 'Connect your X/Twitter account to auto-publish generated posts',
        data: 'OAuth connection for X/Twitter',
        action: 'Authenticate to enable automatic posting to your X account',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'X Connection',
          formType: 'edit',
          whenToUse: 'Use this form to configure X/Twitter OAuth connection for automatic post publishing.',
          modelName: 'Workspace',
          fields: ['xAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'xAuth'],
        },
      ],
    },
    {
      icon: '💡',
      title: 'Create Campaign Ideas',
      description: {
        feature: 'Create campaign idea templates that generate multiple posts automatically',
        data: 'Campaign name, content template, frequency, platform, and hashtags',
        action: 'Create a CampaignIdea that serves as a factory for generating SocialPost records',
      },
      forms: [
        {
          formId: 'new-campaign-idea',
          formName: 'New Campaign Idea',
          formType: 'new',
          whenToUse: 'Create a campaign idea template that will automatically generate social posts based on frequency.',
          modelName: 'CampaignIdea',
          fields: ['campaignName', 'contentTemplate', 'platform', 'hashtags', 'frequency', 'status'],
          scheduleId: 'generate-first-post',
        },
      ],
      models: [
        {
          modelName: 'CampaignIdea',
          fields: ['ideaId', 'campaignName', 'contentTemplate', 'platform', 'hashtags', 'frequency', 'status', 'last_generated', 'posts_created', 'social_posts'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-first-post',
          name: 'Generate First Post',
          description: 'Create the first social post from new campaign idea',
          mode: 'once',
          actionIds: ['create-post-action'],
          steps: [
            {
              modelName: 'CampaignIdea',
              actionId: 'create-post-action',
              actionName: 'createSocialPost',
              actionTitle: 'Create Social Post',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'active' },
                  { field: 'posts_created', operator: 'equals', value: 0 }
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
      title: 'Auto-Generate Posts (Factory Pattern)',
      description: {
        feature: 'Automatically create new SocialPost records from CampaignIdea templates',
        data: 'Campaign template, frequency, platform, and generation tracking',
        action: 'Generate new SocialPost child records from parent CampaignIdea. Output to "social_posts" field creates records. Update tracking fields.',
      },
      actions: [
        {
          actionId: 'create-post-action',
          actionName: 'createSocialPost',
          actionTitle: 'Create Social Post',
          modelName: 'CampaignIdea',
          inputFields: ['campaignName', 'contentTemplate', 'platform', 'hashtags'],
          outputFields: ['social_posts', 'last_generated', 'posts_created'],
        },
      ],
      models: [
        {
          modelName: 'CampaignIdea',
          fields: ['campaignName', 'contentTemplate', 'platform', 'hashtags', 'social_posts', 'last_generated', 'posts_created'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-post-generation',
          name: 'Daily Post Generation',
          description: 'Generate posts from daily campaign ideas',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['create-post-action'],
          steps: [
            {
              modelName: 'CampaignIdea',
              actionId: 'create-post-action',
              actionName: 'createSocialPost',
              actionTitle: 'Create Social Post',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'active' },
                  { field: 'frequency', operator: 'equals', value: 'daily' }
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
      icon: '✍️',
      title: 'Generate Post Content',
      description: {
        feature: 'AI writes full content for newly created posts',
        data: 'Post title and reference to parent campaign idea',
        action: 'Generate engaging post content based on campaign template, add hashtags, update status',
      },
      actions: [
        {
          actionId: 'write-content-action',
          actionName: 'writePostContent',
          actionTitle: 'Write Post Content',
          modelName: 'SocialPost',
          inputFields: ['title', 'campaign_idea'],
          outputFields: ['content', 'media_prompt', 'status'],
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['title', 'campaign_idea', 'content', 'media_prompt', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'write-post-content',
          name: 'Write Post Content',
          description: 'Write content for draft posts every 2 hours',
          mode: 'recurring',
          intervalHours: 2,
          actionIds: ['write-content-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'write-content-action',
              actionName: 'writePostContent',
              actionTitle: 'Write Post Content',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'draft' },
                  { field: 'content', operator: 'is_empty', value: null }
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
      icon: '🎨',
      title: 'Generate Post Images',
      description: {
        feature: 'Create AI-generated images for social posts',
        data: 'Media prompt from post',
        action: 'Generate images using AI based on the media prompt',
      },
      actions: [
        {
          actionId: 'generate-image-action',
          actionName: 'generatePostImage',
          actionTitle: 'Generate Post Image',
          modelName: 'SocialPost',
          inputFields: ['media_prompt'],
          outputFields: ['image_url'],
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['media_prompt', 'image_url'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-images',
          name: 'Generate Images',
          description: 'Generate images for posts with prompts',
          mode: 'recurring',
          intervalHours: 4,
          actionIds: ['generate-image-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'generate-image-action',
              actionName: 'generatePostImage',
              actionTitle: 'Generate Post Image',
              query: {
                filters: [
                  { field: 'media_prompt', operator: 'is_not_empty', value: null },
                  { field: 'image_url', operator: 'is_empty', value: null }
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
      icon: '🚀',
      title: 'Auto-Publish to X',
      description: {
        feature: 'Automatically publish posts to X/Twitter at optimal times',
        data: 'Post content, image, and platform',
        action: 'Post to X/Twitter using OAuth, update status to published',
      },
      actions: [
        {
          actionId: 'publish-to-x-action',
          actionName: 'publishToX',
          actionTitle: 'Publish to X',
          modelName: 'SocialPost',
          inputFields: ['content', 'image_url'],
          outputFields: ['tweet_url', 'published_at', 'status'],
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['content', 'image_url', 'tweet_url', 'published_at', 'status'],
        },
      ],
    },
  ],

  howItWorks: [
    { order: 1, title: 'Create Campaign Idea', description: 'Define a template with frequency (daily/weekly)' },
    { order: 2, title: 'AI Generates Posts', description: 'System creates SocialPost records from template' },
    { order: 3, title: 'Content & Images', description: 'AI writes content and generates images' },
    { order: 4, title: 'Auto-Publish', description: 'Posts publish to X at optimal times' },
  ],

  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'xAuth', type: 'oauth', label: 'X (Twitter) Connection', oauthProvider: 'x', oauthScopes: ['tweet.read', 'tweet.write', 'users.read'] },
      ],
      forms: [
        {
          id: 'workspace-connections',
          name: 'X Connection',
          description: 'Configure X/Twitter OAuth',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Connect your X/Twitter account to enable automatic publishing.',
          modelName: 'Workspace',
          fields: ['xAuth'],
        },
      ],
    },
    {
      name: 'CampaignIdea',
      description: 'Campaign template that generates multiple social posts (PARENT MODEL)',
      fields: [
        { name: 'ideaId', type: 'text', label: 'Idea ID', required: true },
        { name: 'campaignName', type: 'text', label: 'Campaign Name', required: true },
        { name: 'contentTemplate', type: 'textarea', label: 'Content Template', required: true },
        { name: 'platform', type: 'select', label: 'Target Platform', options: ['X/Twitter', 'LinkedIn', 'Facebook'], required: true },
        { name: 'hashtags', type: 'text', label: 'Default Hashtags' },
        { name: 'frequency', type: 'select', label: 'Generation Frequency', options: ['daily', 'weekly', 'bi-weekly'], required: true },
        { name: 'status', type: 'select', label: 'Status', options: ['active', 'paused', 'completed'], defaultValue: 'active' },
        { name: 'last_generated', type: 'date', label: 'Last Generated' },
        { name: 'posts_created', type: 'number', label: 'Posts Created', defaultValue: 0 },
        // FACTORY FIELD: to_many relationship to SocialPost
        { name: 'social_posts', type: 'reference', label: 'Generated Posts', referenceType: 'to_many', referencesModel: 'SocialPost', referencesField: 'title' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      displayFields: ['campaignName', 'platform'],
      actions: [
        {
          name: 'createSocialPost',
          title: 'Create Social Post',
          emoji: '✨',
          description: 'Create new SocialPost record from campaign template',
          modelName: 'CampaignIdea',
          inputFields: ['campaignName', 'contentTemplate', 'platform', 'hashtags'],
          outputFields: ['social_posts', 'last_generated', 'posts_created'],
          steps: [
            {
              name: 'generatePost',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Based on the campaign template, create a new SocialPost record. Generate a unique title variation, set initial status to "draft", and link back to this CampaignIdea. The "social_posts" output will create the new record. Update last_generated and increment posts_created count.',
                inputFields: ['campaignName', 'contentTemplate', 'platform', 'hashtags'],
                outputFields: ['social_posts', 'last_generated', 'posts_created'],
                model: 'gpt-4o',
                temperature: 0.8,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'SocialPost',
      description: 'Individual social media post generated from campaign (CHILD MODEL)',
      fields: [
        { name: 'postId', type: 'text', label: 'Post ID', required: true },
        { name: 'title', type: 'text', label: 'Post Title', required: true },
        { name: 'content', type: 'textarea', label: 'Post Content' },
        { name: 'platform', type: 'select', label: 'Platform', options: ['X/Twitter', 'LinkedIn', 'Facebook'] },
        { name: 'hashtags', type: 'text', label: 'Hashtags' },
        { name: 'status', type: 'select', label: 'Status', options: ['draft', 'ready', 'published'], defaultValue: 'draft' },
        { name: 'media_prompt', type: 'textarea', label: 'Image Prompt' },
        { name: 'image_url', type: 'url', label: 'Generated Image URL' },
        { name: 'tweet_url', type: 'url', label: 'Published Tweet URL' },
        { name: 'published_at', type: 'date', label: 'Published At' },
        // LINK BACK: to_one relationship to parent
        { name: 'campaign_idea', type: 'reference', label: 'Source Campaign', referenceType: 'to_one', referencesModel: 'CampaignIdea', referencesField: 'campaignName' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      displayFields: ['title', 'status'],
      actions: [
        {
          name: 'writePostContent',
          title: 'Write Post Content',
          emoji: '📝',
          description: 'Generate full post content based on campaign template',
          modelName: 'SocialPost',
          inputFields: ['title', 'campaign_idea', 'platform'],
          outputFields: ['content', 'media_prompt', 'status'],
          steps: [
            {
              name: 'generateContent',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Write engaging social media content based on the title and campaign template. Optimize for the target platform. Create an image generation prompt. Update status to "ready".',
                inputFields: ['title', 'campaign_idea', 'platform'],
                outputFields: ['content', 'media_prompt', 'status'],
                model: 'gpt-4o',
                temperature: 0.8,
              },
            },
          ],
        },
        {
          name: 'generatePostImage',
          title: 'Generate Post Image',
          emoji: '🎨',
          description: 'Create AI-generated image for the post',
          modelName: 'SocialPost',
          inputFields: ['media_prompt'],
          outputFields: ['image_url'],
          steps: [
            {
              name: 'createImagePrompt',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Refine the media prompt for optimal image generation',
                inputFields: ['media_prompt'],
                outputFields: ['refinedPrompt', 'imageStyle'],
                model: 'gpt-4o',
                temperature: 0.6,
              },
            },
            {
              name: 'generateImage',
              type: 'image_generation',
              order: '2',
              config: {
                prompt: 'Generate a professional social media image',
                inputFields: ['media_prompt'],
                outputFields: ['image_url'],
                model: 'openai/dall-e-3',
              },
            },
          ],
        },
        {
          name: 'publishToX',
          title: 'Publish to X',
          emoji: '🚀',
          description: 'Publish post to X/Twitter',
          modelName: 'SocialPost',
          inputFields: ['content', 'image_url'],
          outputFields: ['tweet_url', 'published_at', 'status'],
          steps: [
            {
              name: 'postToTwitter',
              type: 'custom',
              order: '1',
              config: {
                description: 'Post to X/Twitter with content and image',
                inputFields: ['content', 'image_url'],
                outputFields: ['tweet_url', 'published_at', 'status'],
              },
            },
          ],
        },
      ],
    },
  ],

  schedules: [
    {
      id: 'generate-first-post',
      name: 'Generate First Post (Run Once)',
      description: 'Create the first social post from new campaign idea',
      mode: 'once',
      actionIds: ['create-post-action'],
      steps: [
        {
          modelName: 'CampaignIdea',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'active' },
              { field: 'posts_created', operator: 'equals', value: 0 }
            ],
            logic: 'AND'
          },
          actionName: 'createSocialPost',
          actionId: 'create-post-action',
          order: 1,
        },
      ],
    },
    {
      id: 'daily-post-generation',
      name: 'Daily Post Generation',
      description: 'Generate new posts from daily campaign ideas',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['create-post-action'],
      steps: [
        {
          modelName: 'CampaignIdea',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'active' },
              { field: 'frequency', operator: 'equals', value: 'daily' }
            ],
            logic: 'AND'
          },
          actionName: 'createSocialPost',
          actionId: 'create-post-action',
          order: 1,
        },
      ],
    },
    {
      id: 'write-post-content',
      name: 'Write Post Content',
      description: 'Write content for draft posts every 2 hours',
      mode: 'recurring',
      intervalHours: 2,
      actionIds: ['write-content-action'],
      steps: [
        {
          modelName: 'SocialPost',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'draft' },
              { field: 'content', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'writePostContent',
          actionId: 'write-content-action',
          order: 1,
        },
      ],
    },
    {
      id: 'generate-post-images',
      name: 'Generate Post Images',
      description: 'Generate images for posts every 4 hours',
      mode: 'recurring',
      intervalHours: 4,
      actionIds: ['generate-image-action'],
      steps: [
        {
          modelName: 'SocialPost',
          query: {
            filters: [
              { field: 'media_prompt', operator: 'is_not_empty', value: null },
              { field: 'image_url', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'generatePostImage',
          actionId: 'generate-image-action',
          order: 1,
        },
      ],
    },
    {
      id: 'publish-ready-posts',
      name: 'Publish Ready Posts',
      description: 'Publish posts that are ready every hour',
      mode: 'recurring',
      intervalHours: 1,
      actionIds: ['publish-to-x-action'],
      steps: [
        {
          modelName: 'SocialPost',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'ready' },
              { field: 'tweet_url', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'publishToX',
          actionId: 'publish-to-x-action',
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

