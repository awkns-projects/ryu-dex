import type { AgentTemplateData } from './types';

export const CUSTOMER_SUPPORT_TEMPLATE: AgentTemplateData = {
  id: 'customer-support',
  slug: 'customer-support-agent',
  title: 'Customer Support Agent',
  shortDescription: 'Automate customer support with AI-powered ticket analysis and response generation',
  longDescription: 'Transform your customer support operations with AI. This agent automatically analyzes support tickets, detects sentiment and urgency, generates empathetic responses, and escalates critical issues. Integrate with your existing helpdesk tools for seamless workflow.',
  description: 'Handles customer inquiries, support tickets, and automated responses',
  thumbnail: '/templates/customer-support.png',
  icon: '🎧',
  category: 'Support',
  subcategories: ['analytics', 'automation'],
  tags: ['Customer Service', 'Support Tickets', 'AI Responses', 'Sentiment Analysis', 'Escalation'],
  useCases: ['Ticket Management', 'Sentiment Analysis', 'Automated Responses', 'Escalation'],
  difficulty: 'intermediate',
  setupTime: 20,
  pricingTier: 'pro',
  version: '2.0',
  aiFeatures: ['Sentiment Analysis', 'Text Generation', 'Content Summarization', 'Priority Detection'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Gmail, Calendar, and Drive integration',
      icon: '🔗',
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
      setupAction: 'facebookLogin',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Workspace Setup',
      description: {
        feature: 'Configure workspace and connect external services like Google and Facebook',
        data: 'OAuth connections for Google (Gmail) and Facebook',
        action: 'Connect your Google account to send emails and Facebook for social integration',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Workspace Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook integration. This allows your agent to send emails via Gmail and interact with Facebook.',
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
        feature: 'Allow customers to quickly submit support tickets with their basic information and issue description',
        data: 'Customer name, email, subject line, and description of the issue',
        action: 'Create a new support ticket record with a unique ID and timestamp, set initial status to "New"',
      },
      forms: [
        {
          formId: 'new-ticket-quick',
          formName: 'Quick Ticket',
          formType: 'new',
          whenToUse: 'Use this form to quickly create a new support ticket. Fill in customer name, email, subject, and issue description.',
          modelName: 'SupportTicket',
          fields: ['customerName', 'email', 'subject', 'description'],
          scheduleId: 'analyze-ticket-schedule',
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['ticketId', 'customerName', 'email', 'subject', 'description', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'analyze-ticket-schedule',
          name: 'Analyze Ticket Schedule',
          description: 'Automatically analyze ticket after creation',
          mode: 'once',
          actionIds: ['analyze-ticket-action'],
          steps: [
            {
              modelName: 'SupportTicket',
              actionId: 'analyze-ticket-action',
              actionName: 'analyzeTicket',
              actionTitle: 'Analyze Ticket',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'New' }],
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
      title: 'Detailed Ticket Creation',
      description: {
        feature: 'Create comprehensive support tickets with priority and category information for better organization',
        data: 'Customer details, issue description, priority level (Low/Medium/High/Urgent), and category (Technical/Billing/General/Feature Request/Bug Report)',
        action: 'Generate unique ticket ID, validate all fields, categorize the ticket, and prepare it for the support workflow',
      },
      forms: [
        {
          formId: 'new-ticket-detailed',
          formName: 'Detailed Ticket',
          formType: 'new',
          whenToUse: 'Use this form to create a comprehensive support ticket with priority and category classification. Ideal for tickets that require immediate categorization.',
          modelName: 'SupportTicket',
          fields: ['ticketId', 'customerName', 'email', 'subject', 'description', 'priority', 'category'],
          scheduleId: 'generate-response-schedule',
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['ticketId', 'customerName', 'email', 'subject', 'description', 'priority', 'category', 'status', 'agentId', 'assignedTo', 'createdAt', 'updatedAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-response-schedule',
          name: 'Generate Response Schedule',
          description: 'Automatically generate AI response after ticket creation',
          mode: 'once',
          actionIds: ['generate-response-action'],
          steps: [
            {
              modelName: 'SupportTicket',
              actionId: 'generate-response-action',
              actionName: 'generateResponse',
              actionTitle: 'Generate Response',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'New' },
                  { field: 'response', operator: 'is_empty', value: null }
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
      icon: '✅',
      title: 'Update Ticket Status',
      description: {
        feature: 'Update the status of existing support tickets as they progress through the workflow',
        data: 'Ticket status (New, In Progress, Resolved, Closed)',
        action: 'Change the status field to reflect current ticket state',
      },
      forms: [
        {
          formId: 'edit-ticket-status',
          formName: 'Update Ticket Status',
          formType: 'edit',
          whenToUse: 'Use this form to update an existing ticket\'s status. Select the appropriate status based on ticket progress (New, In Progress, Resolved, Closed).',
          modelName: 'SupportTicket',
          fields: ['status', 'updatedAt'],
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['status', 'updatedAt'],
        },
      ],
    },
    {
      icon: '👤',
      title: 'Assign Ticket',
      description: {
        feature: 'Assign tickets to specific team members for handling',
        data: 'Agent name to assign ticket to',
        action: 'Update the assignedTo field with the selected agent',
      },
      forms: [
        {
          formId: 'edit-ticket-assignment',
          formName: 'Assign Ticket',
          formType: 'edit',
          whenToUse: 'Use this form to assign an existing ticket to a team member. Select the agent who will handle the ticket.',
          modelName: 'SupportTicket',
          fields: ['assignedTo', 'agentId', 'updatedAt'],
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['assignedTo', 'agentId', 'updatedAt'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'Automatic Ticket Analysis',
      description: {
        feature: 'Automatically analyze new support tickets to understand their urgency and customer sentiment',
        data: 'Ticket subject, description, and customer name from existing tickets',
        action: 'Use AI to read the ticket content, determine priority level based on urgency and impact, classify the category, analyze customer sentiment (Positive/Neutral/Negative), and update the ticket with these insights',
      },
      actions: [
        {
          actionId: 'analyze-ticket-action',
          actionName: 'analyzeTicket',
          actionTitle: 'Analyze Ticket',
          modelName: 'SupportTicket',
          inputFields: ['subject', 'description', 'customerName'],
          outputFields: ['priority', 'category', 'sentiment'],
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['subject', 'description', 'customerName', 'priority', 'category', 'sentiment'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'AI Response Generation',
      description: {
        feature: 'Generate professional and empathetic responses to customer support tickets automatically',
        data: 'Ticket subject, description, category, priority, and customer name',
        action: 'Search knowledge base for similar tickets and solutions, use AI to write a personalized response addressing the customer by name, provide clear solutions or next steps, and update the ticket status',
      },
      actions: [
        {
          actionId: 'generate-response-action',
          actionName: 'generateResponse',
          actionTitle: 'Generate Response',
          modelName: 'SupportTicket',
          inputFields: ['subject', 'description', 'category', 'priority', 'customerName'],
          outputFields: ['response', 'status'],
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['subject', 'description', 'category', 'priority', 'customerName', 'response', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'auto-response-schedule',
          name: 'Auto-Generate Responses',
          description: 'Automatically generate responses for analyzed tickets',
          mode: 'recurring',
          intervalHours: 2,
          actionIds: ['generate-response-action'],
          steps: [
            {
              modelName: 'SupportTicket',
              actionId: 'generate-response-action',
              actionName: 'generateResponse',
              actionTitle: 'Generate Response',
              query: {
                filters: [
                  { field: 'priority', operator: 'not_equals', value: 'Urgent' },
                  { field: 'response', operator: 'is_empty', value: null },
                  { field: 'category', operator: 'is_not_empty', value: null }
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
      title: 'Urgent Ticket Escalation',
      description: {
        feature: 'Automatically route high-priority tickets to the right team members for immediate attention',
        data: 'Ticket ID, priority level, category, and issue description',
        action: 'Identify tickets marked as urgent or high priority, analyze the category and description to determine the best team member to handle it based on expertise and current workload, assign the ticket to them, and update status to escalated',
      },
      actions: [
        {
          actionId: 'escalate-ticket-action',
          actionName: 'escalateTicket',
          actionTitle: 'Escalate Ticket',
          modelName: 'SupportTicket',
          inputFields: ['ticketId', 'priority', 'category', 'description'],
          outputFields: ['assignedTo', 'status'],
        },
      ],
      models: [
        {
          modelName: 'SupportTicket',
          fields: ['ticketId', 'priority', 'category', 'description', 'assignedTo', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'escalate-urgent-tickets',
          name: 'Escalate Urgent Tickets',
          description: 'Check for high-priority tickets every 30 minutes and auto-assign them',
          mode: 'recurring',
          intervalHours: 0.5,
          actionIds: ['escalate-ticket-action'],
          steps: [
            {
              modelName: 'SupportTicket',
              actionId: 'escalate-ticket-action',
              actionName: 'escalateTicket',
              actionTitle: 'Escalate Ticket',
              query: {
                filters: [
                  { field: 'priority', operator: 'equals', value: 'Urgent' },
                  { field: 'assignedTo', operator: 'is_empty', value: null }
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
    { order: 1, title: 'Ticket Created', description: 'Customer submits a support ticket via your helpdesk' },
    { order: 2, title: 'AI Analyzes', description: 'System analyzes priority, category, and sentiment' },
    { order: 3, title: 'Response Generated', description: 'AI creates a professional, helpful response' },
    { order: 4, title: 'Auto-escalate', description: 'Urgent tickets are routed to human agents' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'supportTickets', type: 'text', label: 'Support Tickets' },
        { name: 'fbAuth', type: 'oauth', label: 'Facebook Connection', oauthProvider: 'facebook', oauthAction: 'facebookLogin', oauthScopes: ['email', 'public_profile'] },
        { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google', oauthAction: 'googleLogin', oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'] },
      ],
      forms: [
        // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook integration. This allows your agent to send emails via Gmail and interact with Facebook.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
      actions: [
        {
          name: 'sendEmailResponse',
          title: 'Send Email Response',
          emoji: '📧',
          description: 'Send the generated response to customer via Gmail',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['emailSent', 'sentAt'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'sendViaGmail',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Send an email response to the customer using Gmail API',
                inputFields: ['googleAuth'],
                outputFields: ['emailSent', 'sentAt'],
                customCode: `// Use Gmail API to send email
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

// Construct email in RFC 2822 format
const emailContent = [
  'To: customer@example.com',
  'Subject: Re: Support Ticket',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<h2>Thank you for contacting support</h2>',
  '<p>Your response here...</p>'
].join('\\r\\n');

// Base64 encode the email
const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)));

// Send via Gmail API
const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    raw: encodedEmail
  })
});

const result = await response.json();

return {
  emailSent: response.ok,
  sentAt: new Date().toISOString()
};`,
              },
            },
          ],
        },
        {
          name: 'postToFacebookPage',
          title: 'Post Update to Facebook',
          emoji: '📘',
          description: 'Post a support status update to Facebook page',
          modelName: 'Workspace',
          inputFields: ['fbAuth'],
          outputFields: ['postId', 'postedAt'],
          requiresConnection: 'facebook-connection',
          steps: [
            {
              name: 'publishToFacebook',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Post a status update to Facebook page',
                inputFields: ['fbAuth'],
                outputFields: ['postId', 'postedAt'],
                customCode: `// Use Facebook Graph API to post
const authData = JSON.parse(fbAuth);
const accessToken = authData.accessToken;

// Post to Facebook page
const response = await fetch('https://graph.facebook.com/v18.0/me/feed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Our support team is here to help! Tickets are being resolved quickly.',
    access_token: accessToken
  })
});

const result = await response.json();

return {
  postId: result.id || '',
  postedAt: new Date().toISOString()
};`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'SupportTicket',
      fields: [
        { name: 'ticketId', type: 'text', label: 'Ticket ID', required: true },
        { name: 'customerName', type: 'text', label: 'Customer Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'subject', type: 'text', label: 'Subject', required: true },
        { name: 'description', type: 'textarea', label: 'Description', required: true },
        { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'], defaultValue: 'Medium' },
        { name: 'status', type: 'select', label: 'Status', options: ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed'], defaultValue: 'New' },
        { name: 'category', type: 'select', label: 'Category', options: ['Technical', 'Billing', 'General', 'Feature Request', 'Bug Report'] },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'assignedTo', type: 'text', label: 'Assigned To' },
        { name: 'response', type: 'textarea', label: 'Response' },
        { name: 'sentiment', type: 'select', label: 'Sentiment', options: ['Positive', 'Neutral', 'Negative'] },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
        { name: 'resolvedAt', type: 'date', label: 'Resolved At' },
      ],
      forms: [
        {
          id: 'quick-ticket',
          name: 'Quick Ticket',
          description: 'Create a support ticket quickly with essential information',
          icon: '⚡',
          formType: 'new',
          whenToUse: 'Use this form to quickly create a new support ticket with essential customer information.',
          modelName: 'SupportTicket',
          fields: ['customerName', 'email', 'subject', 'description'],
        },
        {
          id: 'detailed-ticket',
          name: 'Detailed Ticket',
          description: 'Create a comprehensive support ticket with all details',
          icon: '📋',
          formType: 'new',
          whenToUse: 'Use this form to create a comprehensive support ticket with detailed priority and category information.',
          modelName: 'SupportTicket',
          fields: ['ticketId', 'customerName', 'email', 'subject', 'description', 'priority', 'category'],
        },
      ],
      actions: [
        {
          name: 'analyzeTicket',
          title: 'Analyze Ticket',
          emoji: '🔍',
          description: 'Analyze ticket content, determine priority and category',
          modelName: 'SupportTicket',
          inputFields: ['subject', 'description', 'customerName'],
          outputFields: ['priority', 'category', 'sentiment'],
          steps: [
            {
              name: 'analyzeSentiment',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the customer support ticket and determine: 1) Priority level (Low/Medium/High/Urgent) based on urgency and impact, 2) Category (Technical/Billing/General/Feature Request/Bug Report), 3) Sentiment (Positive/Neutral/Negative). Consider the tone, language, and content of the message.',
                inputFields: ['subject', 'description', 'customerName'],
                outputFields: ['priority', 'category', 'sentiment'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'generateResponse',
          title: 'Generate Response',
          emoji: '✍️',
          description: 'Generate an appropriate response to the customer',
          modelName: 'SupportTicket',
          inputFields: ['subject', 'description', 'category', 'priority', 'customerName'],
          outputFields: ['response', 'status'],
          steps: [
            {
              name: 'searchKnowledgeBase',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Search for similar support tickets and solutions based on category and subject',
                inputFields: ['subject', 'category'],
                outputFields: ['similarTickets', 'solutionExamples', 'bestPractices'],
              },
            },
            {
              name: 'draftResponse',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Generate a professional, empathetic, and helpful response to the customer support ticket. Use the knowledge base search results if available. Address the customer by name, acknowledge their issue, provide a clear solution or next steps, and maintain a friendly tone.',
                inputFields: ['subject', 'description', 'category', 'priority', 'customerName'],
                outputFields: ['response', 'status'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
        {
          name: 'escalateTicket',
          title: 'Escalate Ticket',
          emoji: '🚨',
          description: 'Escalate high-priority tickets to human agents',
          modelName: 'SupportTicket',
          inputFields: ['ticketId', 'priority', 'category', 'description'],
          outputFields: ['assignedTo', 'status'],
          steps: [
            {
              name: 'determineAssignee',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Based on the ticket priority and category, determine the best team member to assign this ticket to. Consider expertise areas and current workload.',
                inputFields: ['priority', 'category', 'description'],
                outputFields: ['assignedTo', 'status'],
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
      id: 'analyze-ticket-schedule',
      name: 'Analyze Ticket Schedule',
      description: 'Automatically analyze ticket after creation',
      mode: 'once',
      actionIds: ['analyze-ticket-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          actionId: 'analyze-ticket-action',
          actionName: 'analyzeTicket',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          order: 1,
        },
      ],
    },
    {
      id: 'auto-analyze-schedule',
      name: 'Auto-analyze new tickets',
      description: 'Hourly check for unanalyzed tickets',
      mode: 'recurring',
      intervalHours: '1',
      actionIds: ['analyze-ticket-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          actionId: 'analyze-ticket-action',
          actionName: 'analyzeTicket',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          order: 1,
        },
      ],
    },
    {
      id: 'auto-response-schedule',
      name: 'Auto-Generate Responses',
      description: 'Generate responses for analyzed tickets every 2 hours',
      mode: 'recurring',
      intervalHours: 2,
      actionIds: ['generate-response-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          actionId: 'generate-response-action',
          actionName: 'generateResponse',
          query: {
            filters: [
              { field: 'priority', operator: 'not_equals', value: 'Urgent' },
              { field: 'response', operator: 'is_empty', value: null },
              { field: 'category', operator: 'is_not_empty', value: null }
            ],
            logic: 'AND'
          },
          order: 1,
        },
      ],
    },
    {
      id: 'escalate-urgent-schedule',
      name: 'Escalate urgent tickets',
      description: 'Check every 2 hours for urgent tickets to escalate',
      mode: 'recurring',
      intervalHours: '2',
      actionIds: ['escalate-ticket-action'],
      steps: [
        {
          modelName: 'SupportTicket',
          actionId: 'escalate-ticket-action',
          actionName: 'escalateTicket',
          query: {
            filters: [
              { field: 'priority', operator: 'equals', value: 'Urgent' },
              { field: 'status', operator: 'equals', value: 'New' }
            ],
            logic: 'AND'
          },
          order: 1,
        },
      ],
    },
  ],
  usageCount: 2143,
  viewCount: 8567,
  rating: 4.7,
  reviewCount: 108,
  createdAt: new Date('2024-09-25'),
  updatedAt: new Date('2025-01-22'),
  badges: ['FEATURED', 'POPULAR', 'UPDATED'],
};
