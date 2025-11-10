import type { AgentTemplateData } from './types';

export const SOCIAL_MEDIA_MANAGER_TEMPLATE: AgentTemplateData = {
  id: 'social-media-manager',
  slug: 'social-media-manager-agent',
  title: 'Social Media Manager Agent',
  shortDescription: 'Schedule posts, analyze engagement, and manage social media across all platforms',
  longDescription: 'Streamline your social media management with AI. This agent helps you schedule posts across multiple platforms, generate engaging content, analyze performance metrics, respond to comments, and optimize posting times. Perfect for businesses and creators managing multiple social channels.',
  description: 'Schedules posts, analyzes engagement, and manages social media presence',
  thumbnail: '/templates/social-media-manager.png',
  icon: '📣',
  category: 'Marketing',
  subcategories: ['social', 'content'],
  tags: ['Social Media', 'Content Scheduling', 'Engagement', 'Multi-platform', 'Analytics', 'Community Management'],
  useCases: ['Social Media Scheduling', 'Content Planning', 'Engagement Analysis', 'Multi-platform Management'],
  difficulty: 'beginner',
  setupTime: 15,
  pricingTier: 'starter',
  version: '2.0',
  aiFeatures: ['Content Generation', 'Engagement Analysis', 'Optimal Timing', 'Performance Insights'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Gmail, analytics and reporting',
      icon: '🔗',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
      fieldName: 'googleAuth',
    },
    {
      id: 'facebook-connection',
      name: 'facebook',
      title: 'Facebook Connection',
      provider: 'facebook',
      description: 'Connect to Facebook to publish posts and access insights',
      icon: '📘',
      scopes: ['email', 'public_profile', 'pages_manage_posts', 'pages_read_engagement'],
      fieldName: 'fbAuth',
      required: true, // Required for social media management
    },
    {
      id: 'x-connection',
      name: 'x',
      title: 'X (Twitter) Connection',
      provider: 'x',
      description: 'Connect to X (Twitter) to post tweets and read analytics',
      icon: '🐦',
      scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      fieldName: 'xAuth',
    },
    {
      id: 'instagram-connection',
      name: 'instagram',
      title: 'Instagram Connection',
      provider: 'instagram',
      description: 'Connect to Instagram to manage posts and stories',
      icon: '📸',
      scopes: ['instagram_basic', 'instagram_content_publish'],
      fieldName: 'instagramAuth',
    },
    {
      id: 'threads-connection',
      name: 'threads',
      title: 'Threads Connection',
      provider: 'threads',
      description: 'Connect to Threads to publish posts',
      icon: '💬',
      scopes: ['threads_basic', 'threads_content_publish'],
      fieldName: 'threadsAuth',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Social Platforms',
      description: {
        feature: 'Connect all your social media accounts in one place',
        data: 'OAuth connections for Google, Facebook, X/Twitter, Instagram, and Threads',
        action: 'Authenticate with social platforms to enable posting and analytics',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Social Media Connections',
          formType: 'edit',
          whenToUse: 'Use this form to connect your social media accounts (Facebook, X, Instagram, Threads, Google). This enables cross-platform posting and analytics.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth', 'xAuth', 'instagramAuth', 'threadsAuth'],
        },
      ],
      models: [
        {
          modelName: 'Workspace',
          fields: ['name', 'description', 'googleAuth', 'fbAuth', 'xAuth', 'instagramAuth', 'threadsAuth'],
        },
      ],
    },
    {
      icon: '⚡',

      title: 'Quick Post Creation',
      description: {
        feature: 'Quickly create social media posts for immediate or later publishing',
        data: 'Target platform (Twitter/LinkedIn/Facebook/etc.) and post content text',
        action: 'Create a new social post record with unique ID, set status to Draft, add timestamp',
      },
      forms: [
        {
          formId: 'quick-post',
          formName: 'Quick Post',
          formType: 'new',
          whenToUse: 'Use this form to quickly create a social media post. Select the platform and write your content.',
          modelName: 'SocialPost',
          fields: ['platform', 'content'],
          scheduleId: 'optimize-new-post-schedule',
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['postId', 'platform', 'content', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'optimize-new-post-schedule',
          name: 'Optimize New Post Schedule',
          description: 'Automatically optimize post content and suggest hashtags after creation',
          mode: 'once',
          actionIds: ['optimize-post-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'optimize-post-action',
              actionName: 'optimizePost',
              actionTitle: 'Optimize Post',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Draft' },
                  { field: 'hashtags', operator: 'is_empty', value: null }
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

      title: 'Scheduled Post Planning',
      description: {
        feature: 'Plan and schedule social media posts in advance with hashtags',
        data: 'Platform, post content, hashtags, content category (Product Update/News/etc.), and scheduled publish time',
        action: 'Create scheduled post record, categorize content, add hashtags, set publish time, prepare for automated posting',
      },
      forms: [
        {
          formId: 'scheduled-post',
          formName: 'Schedule Post',
          formType: 'new',
          whenToUse: 'Use this form to create and schedule a social media post in advance. Set the platform, content, hashtags, category, and when it should be published.',
          modelName: 'SocialPost',
          fields: ['platform', 'content', 'hashtags', 'category', 'scheduledFor'],
          scheduleId: 'publish-scheduled-posts',
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['postId', 'platform', 'content', 'hashtags', 'category', 'scheduledFor', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'publish-scheduled-posts',
          name: 'Publish Scheduled Posts',
          description: 'Automatically publish posts when their scheduled time arrives',
          mode: 'recurring',
          intervalHours: 1,
          actionIds: ['publish-post-action'],
          steps: [
            {
              modelName: 'SocialPost',
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
    },
    {
      icon: '📄',

      title: 'Full Post with Media',
      description: {
        feature: 'Create complete social media posts with images, videos, or GIFs',
        data: 'Platform, content text, hashtags, media file URL, media type (Image/Video/GIF), category, and schedule time',
        action: 'Create multimedia post record with all details, attach media file, schedule for publishing, validate media format for platform',
      },
      forms: [
        {
          formId: 'full-post',
          formName: 'Full Post',
          formType: 'new',
          whenToUse: 'Use this form to create a complete social media post with media attachments (images, videos, GIFs). Fill in all details including content, hashtags, and media URL.',
          modelName: 'SocialPost',
          fields: ['platform', 'content', 'hashtags', 'mediaUrl', 'mediaType', 'category', 'scheduledFor'],
          scheduleId: 'validate-media-schedule',
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['postId', 'platform', 'content', 'hashtags', 'mediaUrl', 'mediaType', 'category', 'scheduledFor', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'validate-media-schedule',
          name: 'Validate Media Schedule',
          description: 'Validate media format and optimize post after creation',
          mode: 'once',
          actionIds: ['optimize-post-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'optimize-post-action',
              actionName: 'optimizePost',
              actionTitle: 'Optimize Post',
              query: {
                filters: [
                  { field: 'mediaUrl', operator: 'is_not_empty', value: null },
                  { field: 'status', operator: 'equals', value: 'Draft' }
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

      title: 'Post Optimization',
      description: {
        feature: 'Optimize social media posts for maximum engagement on each platform',
        data: 'Post content, target platform, and content category',
        action: 'Use AI to optimize content for the specific platform by adjusting length to meet platform limits, tailoring tone and formatting, enhancing call-to-action, applying platform best practices. Suggest 3-5 relevant trending hashtags for better reach',
      },
      actions: [
        {
          actionId: 'optimize-post-action',
          actionName: 'optimizePost',
          actionTitle: 'Optimize Post',
          modelName: 'SocialPost',
          inputFields: ['content', 'platform', 'category'],
          outputFields: ['content', 'hashtags'],
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['content', 'platform', 'category', 'hashtags'],
        },
      ],
      schedules: [
        {
          scheduleId: 'optimize-draft-posts',
          name: 'Optimize Draft Posts',
          description: 'Optimize draft posts every 6 hours',
          mode: 'recurring',
          intervalHours: 6,
          actionIds: ['optimize-post-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'optimize-post-action',
              actionName: 'optimizePost',
              actionTitle: 'Optimize Post',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Draft' },
                  { field: 'content', operator: 'is_not_empty', value: null }
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

      title: 'Engagement Analysis',
      description: {
        feature: 'Measure post performance and understand audience sentiment',
        data: 'Number of likes, shares, comments, impressions, platform, and post content',
        action: 'Use AI to calculate an engagement score (0-100) by analyzing likes, shares, comments, and impressions relative to typical performance on this platform. Determine overall sentiment (Positive/Neutral/Negative) based on engagement patterns',
      },
      actions: [
        {
          actionId: 'analyze-engagement-action',
          actionName: 'analyzeEngagement',
          actionTitle: 'Analyze Engagement',
          modelName: 'SocialPost',
          inputFields: ['likes', 'shares', 'comments', 'impressions', 'platform', 'content'],
          outputFields: ['engagement', 'sentiment'],
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['likes', 'shares', 'comments', 'impressions', 'platform', 'content', 'engagement', 'sentiment'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-engagement-analysis',
          name: 'Daily Engagement Analysis',
          description: 'Analyze engagement metrics for published posts daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['analyze-engagement-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'analyze-engagement-action',
              actionName: 'analyzeEngagement',
              actionTitle: 'Analyze Engagement',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Published' },
                  { field: 'engagement', operator: 'is_empty', value: null }
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

      title: 'Trend-Based Content Ideas',
      description: {
        feature: 'Generate fresh post ideas based on what\'s trending on social media',
        data: 'Target platform and content category',
        action: 'Research trending topics and hashtags on the specified platform, use AI to generate engaging post ideas optimized for platform format, create content that encourages interaction, include relevant trending hashtags, set status to Draft',
      },
      actions: [
        {
          actionId: 'generate-post-ideas-action',
          actionName: 'generatePostIdeas',
          actionTitle: 'Generate Post Ideas',
          modelName: 'SocialPost',
          inputFields: ['platform', 'category'],
          outputFields: ['content', 'hashtags', 'status'],
        },
      ],
      models: [
        {
          modelName: 'SocialPost',
          fields: ['platform', 'category', 'content', 'hashtags', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'weekly-content-ideas',
          name: 'Weekly Content Ideas',
          description: 'Generate trending content ideas weekly',
          mode: 'recurring',
          intervalHours: 168,
          actionIds: ['generate-post-ideas-action'],
          steps: [
            {
              modelName: 'SocialPost',
              actionId: 'generate-post-ideas-action',
              actionName: 'generatePostIdeas',
              actionTitle: 'Generate Post Ideas',
              query: {
                filters: [
                  { field: 'category', operator: 'is_not_empty', value: null },
                  { field: 'content', operator: 'is_empty', value: null }
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
    { order: 1, title: 'Connect Platforms', description: 'Link your social media accounts' },
    { order: 2, title: 'Create Content', description: 'AI helps generate platform-optimized posts' },
    { order: 3, title: 'Schedule Posts', description: 'Set optimal posting times for each platform' },
    { order: 4, title: 'Track Performance', description: 'Monitor engagement and refine strategy' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'socialPosts', type: 'text', label: 'Social Posts' },
        { name: 'fbAuth', type: 'oauth', label: 'Facebook Connection', oauthProvider: 'facebook', oauthScopes: ['email', 'public_profile', 'pages_manage_posts'] },
        { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google', oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'] },
        { name: 'xAuth', type: 'oauth', label: 'X (Twitter) Connection', oauthProvider: 'x' as any, oauthScopes: ['tweet.read', 'tweet.write', 'users.read'] },
        { name: 'instagramAuth', type: 'oauth', label: 'Instagram Connection', oauthProvider: 'instagram' as any, oauthScopes: ['instagram_basic', 'instagram_content_publish'] },
        { name: 'threadsAuth', type: 'oauth', label: 'Threads Connection', oauthProvider: 'threads' as any, oauthScopes: ['threads_basic', 'threads_content_publish'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for social media platforms (Facebook, X, Instagram, Threads, Google). This allows your agent to publish posts across platforms.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth', 'xAuth', 'instagramAuth', 'threadsAuth'],
        },
      ],
      actions: [
        {
          name: 'publishPostToFacebook',
          title: 'Publish to Facebook',
          emoji: '📘',
          description: 'Publish social media post directly to Facebook page',
          modelName: 'Workspace',
          inputFields: ['fbAuth'],
          outputFields: ['facebookPostId', 'publishedUrl'],
          requiresConnection: 'facebook-connection',
          steps: [
            {
              name: 'postToFB',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Post to Facebook page',
                inputFields: ['fbAuth'],
                outputFields: ['facebookPostId', 'publishedUrl'],
                customCode: `// Publish to Facebook
const authData = JSON.parse(fbAuth);
const accessToken = authData.accessToken;

const response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Your post content here',
    access_token: accessToken
  })
});

const result = await response.json();

return {
  facebookPostId: result.id || '',
  publishedUrl: result.id ? \`https://facebook.com/\${result.id}\` : ''
};`,
              },
            },
          ],
        },
        {
          name: 'scheduleGoogleCalendar',
          title: 'Schedule in Calendar',
          emoji: '📅',
          description: 'Add post schedule to Google Calendar',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['calendarEventId'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'addScheduleToCalendar',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Schedule post in Google Calendar',
                inputFields: ['googleAuth'],
                outputFields: ['calendarEventId'],
                customCode: `// Add to Google Calendar
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    summary: 'Social Media Post: [Title]',
    description: 'Scheduled post publication',
    start: {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 1800000).toISOString(),
      timeZone: 'UTC'
    }
  })
});

const result = await response.json();

return { calendarEventId: result.id || '' };`,
              },
            },
          ],
        },
        {
          name: 'postToTwitter',
          title: 'Post to X (Twitter)',
          emoji: '🐦',
          description: 'Post a tweet to X (Twitter)',
          modelName: 'Workspace',
          inputFields: ['xAuth'],
          outputFields: ['tweetId', 'tweetUrl'],
          requiresConnection: 'x-connection',
          steps: [
            {
              name: 'createTweet',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Post tweet to X (Twitter)',
                inputFields: ['xAuth'],
                outputFields: ['tweetId', 'tweetUrl'],
                customCode: `// Post to X (Twitter)
const authData = JSON.parse(xAuth);
const accessToken = authData.accessToken;

const response = await fetch('https://api.twitter.com/2/tweets', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Your tweet content here'
  })
});

const result = await response.json();

return {
  tweetId: result.data?.id || '',
  tweetUrl: result.data?.id ? \`https://twitter.com/user/status/\${result.data.id}\` : ''
};`,
              },
            },
          ],
        },
        {
          name: 'postToInstagram',
          title: 'Post to Instagram',
          emoji: '📸',
          description: 'Publish content to Instagram',
          modelName: 'Workspace',
          inputFields: ['instagramAuth'],
          outputFields: ['instagramPostId'],
          requiresConnection: 'instagram-connection',
          steps: [
            {
              name: 'publishToInstagram',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Publish to Instagram',
                inputFields: ['instagramAuth'],
                outputFields: ['instagramPostId'],
                customCode: `// Post to Instagram
const authData = JSON.parse(instagramAuth);
const accessToken = authData.accessToken;
const userId = authData.user_id;

// Create media container
const response = await fetch(\`https://graph.instagram.com/me/media\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    caption: 'Your Instagram caption',
    access_token: accessToken
  })
});

const result = await response.json();

return {
  instagramPostId: result.id || ''
};`,
              },
            },
          ],
        },
        {
          name: 'postToThreads',
          title: 'Post to Threads',
          emoji: '🧵',
          description: 'Publish a post to Threads',
          modelName: 'Workspace',
          inputFields: ['threadsAuth'],
          outputFields: ['threadsPostId'],
          requiresConnection: 'threads-connection',
          steps: [
            {
              name: 'publishToThreads',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Publish to Threads',
                inputFields: ['threadsAuth'],
                outputFields: ['threadsPostId'],
                customCode: `// Post to Threads
const authData = JSON.parse(threadsAuth);
const accessToken = authData.accessToken;
const userId = authData.user_id;

const response = await fetch(\`https://graph.threads.net/v1.0/\${userId}/threads\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    media_type: 'TEXT',
    text: 'Your Threads post content here'
  })
});

const result = await response.json();

return {
  threadsPostId: result.id || ''
};`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'SocialPost',
      fields: [
        { name: 'postId', type: 'text', label: 'Post ID', required: true },
        { name: 'platform', type: 'select', label: 'Platform', options: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok'], required: true },
        { name: 'content', type: 'textarea', label: 'Content', required: true },
        { name: 'hashtags', type: 'text', label: 'Hashtags (comma-separated)' },
        { name: 'mediaUrl', type: 'url', label: 'Media URL' },
        { name: 'mediaType', type: 'select', label: 'Media Type', options: ['Image', 'Video', 'GIF', 'None'] },
        { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Scheduled', 'Published', 'Failed'], defaultValue: 'Draft' },
        { name: 'scheduledFor', type: 'date', label: 'Scheduled For' },
        { name: 'publishedAt', type: 'date', label: 'Published At' },
        { name: 'engagement', type: 'number', label: 'Engagement Score' },
        { name: 'likes', type: 'number', label: 'Likes', defaultValue: 0 },
        { name: 'shares', type: 'number', label: 'Shares', defaultValue: 0 },
        { name: 'comments', type: 'number', label: 'Comments', defaultValue: 0 },
        { name: 'impressions', type: 'number', label: 'Impressions', defaultValue: 0 },
        { name: 'sentiment', type: 'select', label: 'Sentiment', options: ['Positive', 'Neutral', 'Negative'] },
        { name: 'category', type: 'select', label: 'Category', options: ['Product Update', 'Company News', 'Industry Insights', 'Engagement', 'Promotional'] },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      forms: [
        {
          id: 'quick-post',
          name: 'Quick Post',
          description: 'Create a social media post instantly',
          icon: '⚡',
          modelName: 'SocialPost',
          fields: ['platform', 'content'],
        },
        {
          id: 'scheduled-post',
          name: 'Schedule Post',
          description: 'Plan and schedule a post for later',
          icon: '📅',
          modelName: 'SocialPost',
          fields: ['platform', 'content', 'hashtags', 'category', 'scheduledFor'],
        },
        {
          id: 'full-post',
          name: 'Full Post',
          description: 'Complete post with media and targeting',
          icon: '📄',
          modelName: 'SocialPost',
          fields: ['platform', 'content', 'hashtags', 'mediaUrl', 'mediaType', 'category', 'scheduledFor'],
        },
      ],
      actions: [
        {
          name: 'optimizePost',
          title: 'Optimize Post',
          emoji: '✨',
          description: 'Optimize content for platform and engagement',
          modelName: 'SocialPost',
          inputFields: ['content', 'platform', 'category'],
          outputFields: ['content', 'hashtags'],
          steps: [
            {
              name: 'enhanceContent',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Optimize the social media post for maximum engagement on the specified platform. Adjust length, tone, formatting, and call-to-action based on platform best practices. Suggest relevant, trending hashtags (3-5) for better reach.',
                inputFields: ['content', 'platform', 'category'],
                outputFields: ['content', 'hashtags'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
        {
          name: 'analyzeEngagement',
          title: 'Analyze Engagement',
          emoji: '📊',
          description: 'Analyze post performance and engagement',
          modelName: 'SocialPost',
          inputFields: ['likes', 'shares', 'comments', 'impressions', 'platform', 'content'],
          outputFields: ['engagement', 'sentiment'],
          steps: [
            {
              name: 'calculateEngagement',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Calculate an engagement score (0-100) based on likes, shares, comments, and impressions relative to typical performance on this platform. Also determine overall sentiment (Positive/Neutral/Negative) based on engagement patterns.',
                inputFields: ['likes', 'shares', 'comments', 'impressions', 'platform'],
                outputFields: ['engagement', 'sentiment'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'generatePostIdeas',
          title: 'Generate Post Ideas',
          emoji: '💡',
          description: 'Create content ideas based on trends',
          modelName: 'SocialPost',
          inputFields: ['platform', 'category'],
          outputFields: ['content', 'hashtags', 'status'],
          steps: [
            {
              name: 'researchTrends',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Search for trending topics and hashtags on the specified platform',
                inputFields: ['platform', 'category'],
                outputFields: ['trendingTopics', 'popularHashtags', 'viralContent'],
              },
            },
            {
              name: 'createContent',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Generate engaging social media post ideas based on trending topics and the specified category. Create platform-optimized content that encourages interaction. Include relevant hashtags.',
                inputFields: ['platform', 'category'],
                outputFields: ['content', 'hashtags', 'status'],
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
          description: 'Publish a scheduled post to the social media platform',
          modelName: 'SocialPost',
          inputFields: ['platform', 'content', 'hashtags', 'mediaUrl', 'scheduledFor'],
          outputFields: ['status', 'publishedAt'],
          steps: [
            {
              name: 'publishToPlat form',
              type: 'custom',
              order: '1',
              config: {
                description: 'Publish the post to the specified social media platform using OAuth. Update status to "Published" and set publishedAt timestamp.',
                inputFields: ['platform', 'content', 'hashtags', 'mediaUrl'],
                outputFields: ['status', 'publishedAt'],
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'optimize-posts-schedule',
      name: 'Optimize scheduled posts',
      mode: 'recurring',
      intervalHours: '12',
      actionIds: ['optimize-post-action'],
      steps: [
        {
          modelName: 'SocialPost',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
            logic: 'AND'
          },
          actionName: 'optimizePost',
          actionId: 'optimize-post-action',
          order: 1,
        },
      ],
    },
    {
      id: 'analyze-engagement-schedule',
      name: 'Analyze published posts',
      mode: 'recurring',
      intervalHours: '24',
      actionIds: ['analyze-engagement-action'],
      steps: [
        {
          modelName: 'SocialPost',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'Published' },
              { field: 'engagement', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'analyzeEngagement',
          actionId: 'analyze-engagement-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 2567,
  viewCount: 9834,
  rating: 4.9,
  reviewCount: 142,
  createdAt: new Date('2024-08-15'),
  updatedAt: new Date('2025-01-20'),
  badges: ['FEATURED', 'POPULAR', 'TRENDING'],
};
