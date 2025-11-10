import type { AgentTemplateData } from './types';

export const CONTENT_CREATOR_TEMPLATE: AgentTemplateData = {
  id: 'content-creator',
  slug: 'content-creator-agent',
  title: 'Content Creator Agent',
  shortDescription: 'Generate blog posts, social media content, and marketing copy with AI assistance',
  longDescription: 'Transform your content creation workflow with AI. This agent generates high-quality blog posts, social media content, and marketing copy tailored to your brand voice and audience. Features include SEO optimization, featured image generation, and multi-platform content adaptation.',
  description: 'Generates blog posts, social media content, and marketing copy',
  thumbnail: '/templates/content-creator.png',
  icon: '✍️',
  category: 'Marketing',
  subcategories: ['content', 'social'],
  tags: ['Content Creation', 'Blog', 'Social Media', 'Marketing', 'SEO', 'AI Writing'],
  useCases: ['Content Generation', 'SEO Optimization', 'Social Media Management'],
  difficulty: 'beginner',
  setupTime: 15,
  pricingTier: 'starter',
  version: '1.0',
  aiFeatures: ['Text Generation', 'Image Generation', 'Content Summarization', 'SEO Analysis'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Gmail, content publishing and analytics',
      icon: '📧',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
      fieldName: 'googleAuth',
      required: true,
    },
    {
      id: 'facebook-connection',
      name: 'facebook',
      title: 'Facebook Connection',
      provider: 'facebook',
      description: 'Connect to Facebook to publish content directly',
      icon: '📘',
      scopes: ['email', 'public_profile'],
      fieldName: 'fbAuth',
      setupAction: 'facebookLogin',
      required: false,
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Publishing Platforms',
      description: {
        feature: 'Connect Google and Facebook to publish content across platforms',
        data: 'OAuth connections for Google and Facebook',
        action: 'Authenticate to enable content publishing to Facebook and email distribution via Gmail',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Publishing Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook integration. This allows your agent to publish content and send emails.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'googleAuth', 'fbAuth'],
        },
      ],
    },
    {
      icon: '⚡',
      title: 'Quick Content Brief',
      description: {
        feature: 'Quickly start a content creation request with the basic idea',
        data: 'Content title, type (Blog/Social/Email/etc.), main topic, and target platform',
        action: 'Create a new content piece record with unique ID, set status to Draft, and prepare for AI generation',
      },
      forms: [
        {
          formId: 'quick-content',
          formName: 'Quick Content Brief',
          modelName: 'ContentPiece',
          fields: ['title', 'type', 'topic', 'platform'],
        },
      ],
      models: [
        {
          modelName: 'ContentPiece',
          fields: ['contentId', 'title', 'type', 'topic', 'platform', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '📄',
      title: 'Detailed Content Brief',
      description: {
        feature: 'Create a comprehensive content brief with detailed targeting and SEO requirements',
        data: 'Title, content type, topic, SEO keywords, tone (Professional/Casual/etc.), target audience description, detailed requirements/brief, platform, and publish date',
        action: 'Create detailed content specification with all parameters for high-quality AI content generation, validate all requirements, schedule for publish date',
      },
      forms: [
        {
          formId: 'full-content',
          formName: 'Detailed Content Brief',
          modelName: 'ContentPiece',
          fields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform', 'publishDate'],
        },
      ],
      models: [
        {
          modelName: 'ContentPiece',
          fields: ['contentId', 'title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform', 'publishDate', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'AI Content Generation',
      description: {
        feature: 'Automatically generate high-quality written content tailored to platform and audience',
        data: 'Content brief including title, type, topic, keywords, tone, target audience, requirements, and platform',
        action: 'Research the topic online for current information and trends, use AI to generate engaging content optimized for the specified platform, audience, and tone. Consider keyword requirements and brief instructions. Update status when complete',
      },
      actions: [
        {
          actionId: 'generate-content-action',
          actionName: 'generateContent',
          actionTitle: 'Generate Content',
          modelName: 'ContentPiece',
          inputFields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform'],
          outputFields: ['content', 'status'],
        },
      ],
      models: [
        {
          modelName: 'ContentPiece',
          fields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform', 'content', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-content-schedule',
          name: 'Generate Content Schedule',
          description: 'Automatically generate content for briefs every 4 hours',
          mode: 'recurring',
          intervalHours: 4,
          actionIds: ['generate-content-action'],
          steps: [
            {
              modelName: 'ContentPiece',
              actionId: 'generate-content-action',
              actionName: 'generateContent',
              actionTitle: 'Generate Content',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Brief' },
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
      icon: '🔍',
      title: 'SEO Optimization',
      description: {
        feature: 'Analyze content for SEO quality and improve it with AI recommendations',
        data: 'Content title, body text, target keywords, and topic',
        action: 'Use AI to analyze content for keyword usage, title optimization, structure, and readability against SEO best practices. Score from 0-100. Suggest and optionally apply improvements to boost search engine rankings',
      },
      actions: [
        {
          actionId: 'optimize-seo-action',
          actionName: 'optimizeSEO',
          actionTitle: 'Optimize for SEO',
          modelName: 'ContentPiece',
          inputFields: ['title', 'content', 'keywords', 'topic'],
          outputFields: ['seoScore', 'content'],
        },
      ],
      models: [
        {
          modelName: 'ContentPiece',
          fields: ['title', 'content', 'keywords', 'topic', 'seoScore'],
        },
      ],
      schedules: [
        {
          scheduleId: 'seo-optimization-schedule',
          name: 'SEO Optimization Schedule',
          description: 'Optimize content for SEO every 12 hours',
          mode: 'recurring',
          intervalHours: 12,
          actionIds: ['optimize-seo-action'],
          steps: [
            {
              modelName: 'ContentPiece',
              actionId: 'optimize-seo-action',
              actionName: 'optimizeSEO',
              actionTitle: 'Optimize for SEO',
              query: {
                filters: [
                  { field: 'content', operator: 'is_not_empty', value: null },
                  { field: 'seoScore', operator: 'is_empty', value: null }
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
      title: 'Featured Image Generation',
      description: {
        feature: 'Create custom AI-generated images that match the content theme',
        data: 'Content title, topic, type, and the written content itself',
        action: 'Use AI to create a detailed image generation prompt describing visual elements, style, and mood that align with the content theme. Generate the featured image using AI image generation and provide the URL',
      },
      actions: [
        {
          actionId: 'generate-image-action',
          actionName: 'generateImage',
          actionTitle: 'Generate Featured Image',
          modelName: 'ContentPiece',
          inputFields: ['title', 'topic', 'type', 'content'],
          outputFields: ['imagePrompt', 'imageUrl', 'status'],
        },
      ],
      models: [
        {
          modelName: 'ContentPiece',
          fields: ['title', 'topic', 'type', 'content', 'imagePrompt', 'imageUrl', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-images-schedule',
          name: 'Generate Images Schedule',
          description: 'Automatically generate featured images for content with text',
          mode: 'recurring',
          intervalHours: 6,
          actionIds: ['generate-image-action'],
          steps: [
            {
              modelName: 'ContentPiece',
              actionId: 'generate-image-action',
              actionName: 'generateImage',
              actionTitle: 'Generate Featured Image',
              query: {
                filters: [
                  { field: 'content', operator: 'is_not_empty', value: null },
                  { field: 'imageUrl', operator: 'is_empty', value: null }
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
    { order: 1, title: 'Create Brief', description: 'Define your content topic, type, and target audience' },
    { order: 2, title: 'AI Generates', description: 'AI creates high-quality content based on your brief' },
    { order: 3, title: 'Optimize & Review', description: 'SEO optimize and add featured images' },
    { order: 4, title: 'Publish', description: 'Publish directly to your platforms' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'contentPieces', type: 'text', label: 'Content Pieces' },
        { name: 'fbAuth', type: 'oauth', label: 'Facebook Connection', oauthProvider: 'facebook', oauthAction: 'facebookLogin', oauthScopes: ['email', 'public_profile'] },
        { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google', oauthAction: 'googleLogin', oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook integration. This allows your agent to publish content and send emails.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
      actions: [
        {
          name: 'publishToFacebook',
          title: 'Publish to Facebook',
          emoji: '📘',
          description: 'Publish content directly to Facebook page',
          modelName: 'Workspace',
          inputFields: ['fbAuth'],
          outputFields: ['facebookPostId', 'publishedAt'],
          requiresConnection: 'facebook-connection',
          steps: [
            {
              name: 'postContent',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Publish content to Facebook page',
                inputFields: ['fbAuth'],
                outputFields: ['facebookPostId', 'publishedAt'],
                customCode: `// Publish to Facebook
const authData = JSON.parse(fbAuth);
const accessToken = authData.accessToken;

const response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Check out our latest content!',
    access_token: accessToken
  })
});

const result = await response.json();

return {
  facebookPostId: result.id || '',
  publishedAt: new Date().toISOString()
};`,
              },
            },
          ],
        },
        {
          name: 'emailContent',
          title: 'Email Content Draft',
          emoji: '✉️',
          description: 'Send content draft via email for review',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['emailSent'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'sendDraft',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Send content draft via Gmail',
                inputFields: ['googleAuth'],
                outputFields: ['emailSent'],
                customCode: `// Send content via Gmail
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

const emailContent = [
  'To: editor@company.com',
  'Subject: Content Draft for Review',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<h2>Content Draft</h2>',
  '<p>Please review the attached content...</p>'
].join('\\r\\n');

const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)));

const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ raw: encodedEmail })
});

return { emailSent: response.ok };`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'ContentPiece',
      fields: [
        { name: 'contentId', type: 'text', label: 'Content ID', required: true },
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'type', type: 'select', label: 'Type', options: ['Blog Post', 'Social Media', 'Email', 'Landing Page', 'Ad Copy'], required: true },
        { name: 'platform', type: 'select', label: 'Platform', options: ['Website', 'Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'Email'] },
        { name: 'topic', type: 'text', label: 'Topic', required: true },
        { name: 'keywords', type: 'text', label: 'Keywords (comma-separated)' },
        { name: 'tone', type: 'select', label: 'Tone', options: ['Professional', 'Casual', 'Friendly', 'Formal', 'Humorous'], defaultValue: 'Professional' },
        { name: 'targetAudience', type: 'text', label: 'Target Audience' },
        { name: 'brief', type: 'textarea', label: 'Brief/Requirements' },
        { name: 'content', type: 'textarea', label: 'Generated Content' },
        { name: 'seoScore', type: 'number', label: 'SEO Score (0-100)' },
        { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Review', 'Approved', 'Published'], defaultValue: 'Draft' },
        { name: 'imageUrl', type: 'url', label: 'Featured Image URL' },
        { name: 'imagePrompt', type: 'textarea', label: 'Image Generation Prompt' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'publishDate', type: 'date', label: 'Publish Date' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      forms: [
        {
          id: 'quick-content',
          name: 'Quick Content Brief',
          description: 'Start with a simple content idea',
          icon: '⚡',
          modelName: 'ContentPiece',
          fields: ['title', 'type', 'topic', 'platform'],
        },
        {
          id: 'full-content',
          name: 'Detailed Content Brief',
          description: 'Complete content specification',
          icon: '📄',
          modelName: 'ContentPiece',
          fields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform', 'publishDate'],
        },
      ],
      actions: [
        {
          name: 'generateContent',
          title: 'Generate Content',
          emoji: '✍️',
          description: 'Create content based on topic, type, and requirements',
          modelName: 'ContentPiece',
          inputFields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform'],
          outputFields: ['content', 'status'],
          steps: [
            {
              name: 'researchTopic',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Research the topic and gather relevant information, trends, and insights',
                inputFields: ['topic', 'keywords'],
                outputFields: ['researchData', 'trendingTopics', 'keyInsights'],
              },
            },
            {
              name: 'writeContent',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Generate high-quality content based on the provided information. Consider the content type, platform requirements, target audience, tone, and any specific brief instructions. Use research findings to add value and credibility. Optimize for engagement and readability.',
                inputFields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform'],
                outputFields: ['content', 'status'],
                model: 'gpt-4o',
                temperature: 0.8,
              },
            },
          ],
        },
        {
          name: 'optimizeSEO',
          title: 'Optimize for SEO',
          emoji: '🔍',
          description: 'Analyze and improve SEO score',
          modelName: 'ContentPiece',
          inputFields: ['title', 'content', 'keywords', 'topic'],
          outputFields: ['seoScore', 'content'],
          steps: [
            {
              name: 'analyzeSEO',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the content for SEO quality. Check keyword usage, title optimization, meta description potential, content structure, readability, and overall SEO best practices. Score from 0-100 and suggest improvements to the content if needed.',
                inputFields: ['title', 'content', 'keywords', 'topic'],
                outputFields: ['seoScore', 'content'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'generateImage',
          title: 'Generate Featured Image',
          emoji: '🎨',
          description: 'Create an AI-generated featured image',
          modelName: 'ContentPiece',
          inputFields: ['title', 'topic', 'type', 'content'],
          outputFields: ['imagePrompt', 'imageUrl', 'status'],
          steps: [
            {
              name: 'createImagePrompt',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Create a detailed image generation prompt for a featured image that complements this content. The prompt should describe visual elements, style, composition, and mood that align with the content theme and type.',
                inputFields: ['title', 'topic', 'type', 'content'],
                outputFields: ['imagePrompt'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
            {
              name: 'generateVisual',
              type: 'image_generation',
              order: '2',
              config: {
                prompt: 'Use the generated image prompt to create a featured image',
                inputFields: ['imagePrompt'],
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
      id: 'daily-content-generation',
      name: 'Generate daily content',
      mode: 'recurring',
      intervalHours: '24',
      actionIds: ['generate-content-action', 'optimize-seo-action'],
      steps: [
        {
          modelName: 'ContentPiece',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
            logic: 'AND'
          },
          actionName: 'generateContent',
          actionId: 'generate-content-action',
          order: 1,
        },
        {
          modelName: 'ContentPiece',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'Draft' },
              { field: 'content', operator: 'is_not_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'optimizeSEO',
          actionId: 'optimize-seo-action',
          order: 2,
        },
      ],
    },
  ],
  usageCount: 1847,
  viewCount: 7234,
  rating: 4.8,
  reviewCount: 92,
  createdAt: new Date('2024-10-15'),
  updatedAt: new Date('2025-01-20'),
  badges: ['FEATURED', 'POPULAR'],
};
