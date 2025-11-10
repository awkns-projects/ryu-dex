/**
 * Blog Post Generator Template - Demonstrates Template-to-Record Generation Pattern
 * 
 * This template showcases the FACTORY PATTERN where:
 * - PostIdea (parent) creates multiple Post (child) records
 * - to_many relationship: PostIdea → Posts
 * - to_one relationship: Post → PostIdea
 */

import type { AgentTemplateData } from './types';

export const BLOG_POST_GENERATOR_TEMPLATE: AgentTemplateData = {
  id: 'blog-post-generator',
  slug: 'blog-post-generator',
  title: 'Blog Post Generator',
  shortDescription: 'Automatically generate blog posts from content ideas on a schedule',
  longDescription: 'This template demonstrates the factory pattern where PostIdea templates automatically generate Post records. Create content ideas once, and AI generates multiple blog posts from each idea based on frequency.',
  description: 'Generate blog posts automatically from content templates',
  thumbnail: '/templates/blog-generator.png',
  icon: '📝',
  category: 'marketing',
  subcategories: ['content', 'automation'],
  tags: ['Blog', 'Content Generation', 'Automation', 'Factory Pattern', 'Template'],
  useCases: ['Content Generation', 'Automation & Scheduling'],
  difficulty: 'intermediate',
  setupTime: 20,
  pricingTier: 'pro',
  version: '1.0',
  aiFeatures: ['Text Generation', 'Content Summarization'],
  connections: [],

  features: [
    {
      icon: '💡',
      title: 'Create Content Ideas',
      description: {
        feature: 'Create content idea templates that generate multiple blog posts',
        data: 'Idea title, content template, category, frequency (daily/weekly/monthly)',
        action: 'Create a PostIdea template that serves as a factory for generating blog posts',
      },
      forms: [
        {
          formId: 'new-post-idea',
          formName: 'New Content Idea',
          formType: 'new',
          whenToUse: 'Use this form to create a new content idea template. This will automatically generate blog posts based on the frequency you set.',
          modelName: 'PostIdea',
          fields: ['title', 'template', 'category', 'frequency', 'status'],
          scheduleId: 'generate-first-post',
        },
      ],
      models: [
        {
          modelName: 'PostIdea',
          fields: ['ideaId', 'title', 'template', 'category', 'frequency', 'status', 'last_generated', 'created_count', 'posts'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-first-post',
          name: 'Generate First Post',
          description: 'Generate the first blog post after creating a content idea',
          mode: 'once',
          actionIds: ['create-post-action'],
          steps: [
            {
              modelName: 'PostIdea',
              actionId: 'create-post-action',
              actionName: 'createPost',
              actionTitle: 'Create Post from Idea',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'active' },
                  { field: 'created_count', operator: 'equals', value: 0 }
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
      title: 'Auto-Generate Posts from Ideas',
      description: {
        feature: 'Automatically create new blog posts from active content ideas',
        data: 'PostIdea template, frequency, category, and generation history',
        action: 'AI creates new Post records from PostIdea templates based on frequency, updates last_generated and created_count',
      },
      actions: [
        {
          actionId: 'create-post-action',
          actionName: 'createPost',
          actionTitle: 'Create Post from Idea',
          modelName: 'PostIdea',
          inputFields: ['title', 'template', 'category', 'frequency'],
          outputFields: ['posts', 'last_generated', 'created_count'],
        },
      ],
      models: [
        {
          modelName: 'PostIdea',
          fields: ['title', 'template', 'category', 'frequency', 'posts', 'last_generated', 'created_count'],
        },
      ],
      schedules: [
        {
          scheduleId: 'auto-generate-posts',
          name: 'Auto-Generate Posts',
          description: 'Generate posts from ideas based on their frequency',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['create-post-action'],
          steps: [
            {
              modelName: 'PostIdea',
              actionId: 'create-post-action',
              actionName: 'createPost',
              actionTitle: 'Create Post from Idea',
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
        feature: 'AI generates full blog post content for newly created posts',
        data: 'Post title and reference to parent PostIdea template',
        action: 'Use AI to generate complete blog post content based on the template, update status to "published"',
      },
      actions: [
        {
          actionId: 'generate-content-action',
          actionName: 'generateContent',
          actionTitle: 'Generate Post Content',
          modelName: 'Post',
          inputFields: ['title', 'post_idea'],
          outputFields: ['content', 'status'],
        },
      ],
      models: [
        {
          modelName: 'Post',
          fields: ['title', 'post_idea', 'content', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-post-content',
          name: 'Generate Post Content',
          description: 'Generate content for newly created posts',
          mode: 'recurring',
          intervalHours: 1,
          actionIds: ['generate-content-action'],
          steps: [
            {
              modelName: 'Post',
              actionId: 'generate-content-action',
              actionName: 'generateContent',
              actionTitle: 'Generate Post Content',
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
  ],

  howItWorks: [
    { order: 1, title: 'Create Idea', description: 'Define a content idea template with category and frequency' },
    { order: 2, title: 'AI Generates Posts', description: 'System automatically creates Post records from PostIdea' },
    { order: 3, title: 'Content Written', description: 'AI writes full blog content for each post' },
    { order: 4, title: 'Track History', description: 'PostIdea tracks generation count and last date' },
  ],

  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
      ],
      forms: [],
    },
    {
      name: 'PostIdea',
      description: 'Content idea template that generates multiple blog posts (PARENT/FACTORY MODEL)',
      fields: [
        { name: 'ideaId', type: 'text', label: 'Idea ID', required: true },
        { name: 'title', type: 'text', label: 'Idea Title', required: true },
        { name: 'template', type: 'textarea', label: 'Content Template', required: true },
        { name: 'category', type: 'select', label: 'Category', options: ['Technology', 'Business', 'Lifestyle', 'Health', 'Education'], required: true },
        { name: 'frequency', type: 'select', label: 'Generation Frequency', options: ['daily', 'weekly', 'monthly'], required: true },
        { name: 'status', type: 'select', label: 'Status', options: ['active', 'paused', 'archived'], defaultValue: 'active' },
        { name: 'last_generated', type: 'date', label: 'Last Generated' },
        { name: 'created_count', type: 'number', label: 'Posts Created', defaultValue: 0 },
        // CRITICAL: to_many relationship to Post model
        { name: 'posts', type: 'reference', label: 'Generated Posts', referenceType: 'to_many', referencesModel: 'Post', referencesField: 'title' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      displayFields: ['title', 'category'],
      actions: [
        {
          name: 'createPost',
          title: 'Create Post from Idea',
          emoji: '✨',
          description: 'Create a new Post record from this PostIdea template',
          modelName: 'PostIdea',
          inputFields: ['title', 'template', 'category', 'frequency'],
          outputFields: ['posts', 'last_generated', 'created_count'],
          steps: [
            {
              name: 'generatePostRecord',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Based on the PostIdea template, create a new Post record with a generated title and initial draft status. Update the PostIdea last_generated timestamp and increment created_count. The "posts" output field will create the new Post record.',
                inputFields: ['title', 'template', 'category'],
                outputFields: ['posts', 'last_generated', 'created_count'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Post',
      description: 'Individual blog post generated from a PostIdea template (CHILD/OUTPUT MODEL)',
      fields: [
        { name: 'postId', type: 'text', label: 'Post ID', required: true },
        { name: 'title', type: 'text', label: 'Post Title', required: true },
        { name: 'content', type: 'textarea', label: 'Post Content' },
        { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
        { name: 'status', type: 'select', label: 'Status', options: ['draft', 'published', 'scheduled'], defaultValue: 'draft' },
        { name: 'published_date', type: 'date', label: 'Published Date' },
        { name: 'word_count', type: 'number', label: 'Word Count' },
        { name: 'seo_score', type: 'number', label: 'SEO Score' },
        // CRITICAL: to_one relationship back to PostIdea
        { name: 'post_idea', type: 'reference', label: 'Source Idea', referenceType: 'to_one', referencesModel: 'PostIdea', referencesField: 'title' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      displayFields: ['title', 'status'],
      actions: [
        {
          name: 'generateContent',
          title: 'Generate Post Content',
          emoji: '📝',
          description: 'Generate full blog post content based on the template',
          modelName: 'Post',
          inputFields: ['title', 'post_idea'],
          outputFields: ['content', 'excerpt', 'word_count', 'status'],
          steps: [
            {
              name: 'writeContent',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Write a comprehensive blog post based on the title and template from the linked PostIdea. Generate engaging content optimized for readers, create an excerpt summary, count words, and update status to "published".',
                inputFields: ['title', 'post_idea'],
                outputFields: ['content', 'excerpt', 'word_count', 'status'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
        {
          name: 'optimizeSEO',
          title: 'Optimize for SEO',
          emoji: '🎯',
          description: 'Analyze and score post for SEO quality',
          modelName: 'Post',
          inputFields: ['title', 'content'],
          outputFields: ['seo_score'],
          steps: [
            {
              name: 'analyzeSEO',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the blog post title and content for SEO quality. Score from 0-100 based on keyword usage, readability, structure, and meta optimization.',
                inputFields: ['title', 'content'],
                outputFields: ['seo_score'],
                model: 'gpt-4o',
                temperature: 0.2,
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
      description: 'Generate the first blog post after creating a content idea',
      mode: 'once',
      actionIds: ['create-post-action'],
      steps: [
        {
          modelName: 'PostIdea',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'active' },
              { field: 'created_count', operator: 'equals', value: 0 }
            ],
            logic: 'AND'
          },
          actionName: 'createPost',
          actionId: 'create-post-action',
          order: 1,
        },
      ],
    },
    {
      id: 'auto-generate-posts',
      name: 'Auto-Generate Posts',
      description: 'Generate posts from ideas based on their frequency',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['create-post-action'],
      steps: [
        {
          modelName: 'PostIdea',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'active' },
              { field: 'frequency', operator: 'equals', value: 'daily' }
            ],
            logic: 'AND'
          },
          actionName: 'createPost',
          actionId: 'create-post-action',
          order: 1,
        },
      ],
    },
    {
      id: 'generate-post-content',
      name: 'Generate Post Content',
      description: 'Generate content for newly created posts',
      mode: 'recurring',
      intervalHours: 1,
      actionIds: ['generate-content-action'],
      steps: [
        {
          modelName: 'Post',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'draft' },
              { field: 'content', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'generateContent',
          actionId: 'generate-content-action',
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

