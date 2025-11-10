/**
 * Customer Support Ticket Analyzer Template
 */

import type { Template } from './types'

export const CUSTOMER_SUPPORT_ANALYZER_TEMPLATE: Template = {
  id: '6',
  slug: 'customer-support-ticket-analyzer',
  title: 'Customer Support Ticket Analyzer',
  shortDescription: 'Analyze support tickets, identify common issues, and get AI recommendations to improve service.',
  longDescription: 'Transform support data into actionable insights. This template analyzes tickets, categorizes issues, tracks response times, identifies trends, and provides recommendations for improving customer satisfaction.',
  description: 'Analyze customer support conversations and generate insights',
  category: 'support',
  subcategories: ['analytics'],
  tags: ['Support', 'Customer Service', 'Analytics', 'AI'],
  useCases: ['Data Collection', 'Sentiment Analysis', 'Reporting & Analytics'],
  thumbnail: '/templates/support-analyzer.png',
  icon: '🎯',
  difficulty: 'intermediate',
  setupTime: 30,
  pricingTier: 'pro',
  version: '2.0',
  aiFeatures: ['Sentiment Analysis', 'Content Summarization', 'Text Generation'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Gmail and Calendar integration',
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
      description: 'Connect to Facebook for social media integration',
      icon: '📘',
      scopes: ['email', 'public_profile'],
      fieldName: 'fbAuth',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Support Platforms',
      description: {
        feature: 'Connect Google and Facebook to integrate with your support workflow',
        data: 'OAuth connections for Google (Gmail) and Facebook',
        action: 'Send automated email responses via Gmail and integrate with Facebook Messenger',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Support Platform Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook integration. This allows your agent to send emails via Gmail and access social media.',
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
      title: 'Quick Ticket Creation',
      description: {
        feature: 'Allow customers to quickly submit support tickets with their basic information',
        data: 'Customer name, email, subject line, and description of the issue',
        action: 'Create a new support ticket record with a unique ID and timestamp, set initial status to "New"',
      },
      forms: [{
        formId: 'new-ticket-form',
        formName: 'New Support Ticket',
        formType: 'new',
        whenToUse: 'Fill this form when submitting a NEW support ticket. Provide customer name, email, subject, and issue description.',
        modelName: 'SupportTicket',
        fields: ['customerName', 'email', 'subject', 'description'],
        scheduleId: 'analyze-ticket-schedule'
      }],
      models: [{
        modelName: 'SupportTicket',
        fields: ['ticketId', 'customerName', 'email', 'subject', 'description', 'status', 'createdAt'],
      }],
      schedules: [{
        scheduleId: 'analyze-ticket-schedule',
        name: 'Analyze Ticket Schedule',
        description: 'Auto-analyze ticket after creation',
        mode: 'once',
        actionIds: ['analyze-ticket-action'],
        steps: [{
          modelName: 'SupportTicket',
          actionId: 'analyze-ticket-action',
          actionName: 'analyzeTicket',
          actionTitle: 'Analyze Ticket',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          order: 1
        }]
      }]
    },
    {
      icon: '✏️',
      title: 'Update Ticket Status',
      description: {
        feature: 'Update the status and assignment of support tickets',
        data: 'Ticket status and assigned agent',
        action: 'Change ticket status and assign to team member',
      },
      forms: [{
        formId: 'edit-ticket-status',
        formName: 'Update Ticket',
        formType: 'edit',
        whenToUse: 'Use this form to update an EXISTING ticket\'s status or assign it to a team member.',
        modelName: 'SupportTicket',
        fields: ['status', 'assignedTo', 'updatedAt']
      }],
      models: [{
        modelName: 'SupportTicket',
        fields: ['status', 'assignedTo', 'updatedAt'],
      }]
    },
    {
      icon: '🤖',
      title: 'Automatic Ticket Analysis',
      description: {
        feature: 'Automatically analyze new support tickets to understand their urgency and sentiment',
        data: 'Ticket subject, description, and customer name from existing tickets',
        action: 'Use AI to read the ticket content, determine priority level, classify the category, and analyze customer sentiment',
      },
      actions: [{
        actionId: 'analyze-ticket-action',
        actionName: 'analyzeTicket',
        actionTitle: 'Analyze Ticket',
        modelName: 'SupportTicket',
        inputFields: ['subject', 'description', 'customerName'],
        outputFields: ['priority', 'category', 'sentiment'],
      }],
      models: [{
        modelName: 'SupportTicket',
        fields: ['subject', 'description', 'customerName', 'priority', 'category', 'sentiment'],
      }],
      schedules: [
        {
          scheduleId: 'hourly-ticket-analysis',
          name: 'Hourly Ticket Analysis',
          description: 'Analyze new tickets every hour for priority and sentiment',
          mode: 'recurring',
          intervalHours: 1,
          actionIds: ['analyze-ticket-action'],
          steps: [
            {
              modelName: 'SupportTicket',
              actionId: 'analyze-ticket-action',
              actionName: 'analyzeTicket',
              actionTitle: 'Analyze Ticket',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'New' },
                  { field: 'priority', operator: 'is_empty', value: null }
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
      title: 'AI Response Generation',
      description: {
        feature: 'Generate professional and empathetic responses to customer support tickets',
        data: 'Ticket subject, description, category, priority, and customer name',
        action: 'Search knowledge base for solutions, use AI to write personalized responses, and update ticket status',
      },
      actions: [{
        actionId: 'generate-response-action',
        actionName: 'generateResponse',
        actionTitle: 'Generate Response',
        modelName: 'SupportTicket',
        inputFields: ['subject', 'description', 'category', 'priority', 'customerName'],
        outputFields: ['response', 'status'],
      }],
      models: [{
        modelName: 'SupportTicket',
        fields: ['subject', 'description', 'category', 'priority', 'customerName', 'response', 'status'],
      }],
      schedules: [{
        scheduleId: 'auto-response-schedule',
        name: 'Auto Response Schedule',
        description: 'Auto-generate responses for analyzed tickets',
        mode: 'recurring',
        intervalHours: 2,
        actionIds: ['generate-response-action'],
        steps: [{
          modelName: 'SupportTicket',
          actionId: 'generate-response-action',
          actionName: 'generateResponse',
          actionTitle: 'Generate Response',
          query: {
            filters: [
              { field: 'priority', operator: 'not_equals', value: 'Urgent' },
              { field: 'response', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          order: 1
        }]
      }]
    }
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google', oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'] },
        { name: 'fbAuth', type: 'oauth', label: 'Facebook Connection', oauthProvider: 'facebook', oauthScopes: ['email', 'public_profile'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook integration. This allows your agent to send emails via Gmail and access social media.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
    },
    {
      name: 'SupportTicket',
      description: 'Customer support ticket with analysis and response tracking',
      fields: [
        { name: 'ticketId', type: 'text', label: 'Ticket ID', required: true },
        { name: 'customerName', type: 'text', label: 'Customer Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'description', type: 'textarea', label: 'Description', required: true },
        { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'], defaultValue: 'Medium' },
        { name: 'status', type: 'select', label: 'Status', options: ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed'], defaultValue: 'New' },
        { name: 'category', type: 'select', label: 'Category', options: ['Technical', 'Billing', 'General', 'Feature Request', 'Bug Report'] },
        { name: 'sentiment', type: 'select', label: 'Sentiment', options: ['Positive', 'Neutral', 'Negative'] },
        { name: 'response', type: 'textarea', label: 'Response' },
        { name: 'assignedTo', type: 'text', label: 'Assigned To' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      actions: [
        {
          name: 'analyzeTicket',
          title: 'Analyze Ticket',
          emoji: '🔍',
          description: 'Analyze ticket content, determine priority, category, and sentiment',
          modelName: 'SupportTicket',
          inputFields: ['subject', 'description', 'customerName'],
          outputFields: ['priority', 'category', 'sentiment'],
          steps: [
            {
              name: 'analyzeSentiment',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the customer support ticket and determine: 1) Priority level (Low/Medium/High/Urgent) based on urgency and impact, 2) Category (Technical/Billing/General/Feature Request/Bug Report), 3) Sentiment (Positive/Neutral/Negative).',
                inputFields: ['subject', 'description', 'customerName'],
                outputFields: ['priority', 'category', 'sentiment'],
                model: 'gpt-4o',
                temperature: 0.3
              }
            }
          ]
        },
        {
          name: 'generateResponse',
          title: 'Generate Response',
          emoji: '✍️',
          description: 'Generate professional, empathetic response to customer',
          modelName: 'SupportTicket',
          inputFields: ['subject', 'description', 'category', 'priority', 'customerName'],
          outputFields: ['response', 'status'],
          steps: [
            {
              name: 'searchKnowledge',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Search for similar support tickets and solutions',
                inputFields: ['subject', 'category'],
                outputFields: ['searchResults', 'similarTickets', 'suggestedSolutions']
              }
            },
            {
              name: 'draftResponse',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Generate a professional, empathetic, and helpful response to the customer support ticket. Address the customer by name, provide clear solutions or next steps.',
                inputFields: ['subject', 'description', 'category', 'priority', 'customerName'],
                outputFields: ['response', 'status'],
                model: 'gpt-4o',
                temperature: 0.7
              }
            }
          ]
        }
      ]
    },
  ],
  schedules: [
    {
      id: 'analyze-ticket-schedule',
      name: 'Analyze Ticket Schedule',
      description: 'Auto-analyze ticket after creation',
      mode: 'once',
      actionIds: ['analyze-ticket-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          actionName: 'analyzeTicket',
          actionId: 'analyze-ticket-action',
          order: 1,
        },
      ],
    },
    {
      id: 'hourly-ticket-analysis',
      name: 'Hourly Ticket Analysis',
      description: 'Analyze new tickets every hour for priority and sentiment',
      mode: 'recurring',
      intervalHours: 1,
      actionIds: ['analyze-ticket-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'New' },
              { field: 'priority', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'analyzeTicket',
          actionId: 'analyze-ticket-action',
          order: 1,
        },
      ],
    },
    {
      id: 'auto-response-schedule',
      name: 'Generate Responses',
      description: 'Auto-generate responses for analyzed tickets',
      mode: 'recurring',
      intervalHours: 2,
      actionIds: ['generate-response-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          query: {
            filters: [
              { field: 'priority', operator: 'not_equals', value: 'Urgent' },
              { field: 'response', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'generateResponse',
          actionId: 'generate-response-action',
          order: 1,
        },
      ],
    },
  ],
  howItWorks: [
    { order: 1, title: 'Connect Support Tool', description: 'Integrate with your helpdesk platform' },
    { order: 2, title: 'Analyze Tickets', description: 'AI processes all customer interactions' },
    { order: 3, title: 'Identify Patterns', description: 'Find common issues and trends' },
    { order: 4, title: 'Get Insights', description: 'Receive actionable recommendations' },
  ],
  usageCount: 654,
  viewCount: 2345,
  rating: 4.7,
  reviewCount: 29,
  createdAt: new Date('2024-12-15'),
  updatedAt: new Date('2025-01-12'),
  badges: ['NEW'],
}

