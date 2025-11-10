import type { AgentTemplateData } from './types';

export const SALES_ASSISTANT_TEMPLATE: AgentTemplateData = {
  id: 'sales-assistant',
  slug: 'sales-assistant-agent',
  title: 'Sales Assistant Agent',
  shortDescription: 'Manage leads, track opportunities, and automate your sales pipeline with AI',
  longDescription: 'Supercharge your sales process with AI automation. This agent manages lead capture, qualification, enrichment, and follow-ups. Features include lead scoring, automated outreach, pipeline tracking, and deal recommendations to close more deals faster.',
  description: 'Manages leads, tracks opportunities, and automates sales workflows',
  thumbnail: '/templates/sales-assistant.png',
  icon: '💼',
  category: 'Sales',
  subcategories: ['crm', 'automation'],
  tags: ['Sales', 'CRM', 'Lead Management', 'Pipeline', 'Outreach', 'Lead Scoring'],
  useCases: ['Lead Management', 'Sales Automation', 'Pipeline Tracking', 'Lead Scoring'],
  difficulty: 'intermediate',
  setupTime: 25,
  pricingTier: 'pro',
  version: '1.5',
  aiFeatures: ['Lead Scoring', 'Email Generation', 'Data Enrichment', 'Predictive Analytics'],
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
      description: 'Connect to Facebook for social media integration and lead ads',
      icon: '📘',
      scopes: ['email', 'public_profile'],
      fieldName: 'fbAuth',
      setupAction: 'facebookLogin',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Sales Platforms',
      description: {
        feature: 'Connect Google and Facebook to enable email outreach and social selling',
        data: 'OAuth connections for Google (Gmail) and Facebook',
        action: 'Send follow-up emails via Gmail and access lead data from Facebook',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Sales Platform Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook. This allows your agent to send emails via Gmail and access social platforms.',
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

      title: 'Quick Lead Capture',
      description: {
        feature: 'Quickly add new sales leads with their essential contact information',
        data: 'Lead name, email, company name, and source (where they came from)',
        action: 'Create a new lead record with a unique ID, timestamp, and default status of "New"',
      },
      forms: [
        {
          formId: 'quick-lead',
          formName: 'Quick Lead',
          modelName: 'Lead',
          fields: ['name', 'email', 'company', 'source'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['leadId', 'name', 'email', 'company', 'source', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '📄',

      title: 'Full Lead Profiling',
      description: {
        feature: 'Capture complete lead profiles with detailed business information for qualification',
        data: 'Full contact details (name, email, phone), company info, position/title, lead source, budget range, purchase timeline, and initial notes',
        action: 'Create comprehensive lead record with all qualification data, validate contact information, and prepare for scoring and assignment',
      },
      forms: [
        {
          formId: 'full-lead',
          formName: 'Full Lead Profile',
          modelName: 'Lead',
          fields: ['name', 'email', 'phone', 'company', 'position', 'source', 'budget', 'timeline', 'notes'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['leadId', 'name', 'email', 'phone', 'company', 'position', 'source', 'budget', 'timeline', 'notes', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '📋',

      title: 'Follow-up Logging',
      description: {
        feature: 'Record interactions with leads and schedule next follow-up activities',
        data: 'Conversation notes, updated status (New/Contacted/Qualified/Proposal/etc.), interest level assessment, and next follow-up date',
        action: 'Update lead record with interaction details, track conversation history, update status in sales pipeline, set reminder for next touchpoint',
      },
      forms: [
        {
          formId: 'lead-follow-up',
          formName: 'Follow-up Notes',
          modelName: 'Lead',
          fields: ['notes', 'status', 'interest', 'nextFollowUp'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['notes', 'status', 'interest', 'nextFollowUp', 'lastContact'],
        },
      ],
    },
    {
      icon: '🤖',

      title: 'Automated Lead Scoring',
      description: {
        feature: 'Automatically calculate lead quality scores to prioritize sales efforts',
        data: 'Lead information including company size indicators, position/seniority, budget availability, timeline urgency, and source quality',
        action: 'Analyze all lead data using AI, calculate a score from 0-100 weighing factors like company fit and urgency, determine interest level (Low/Medium/High), automatically qualify leads scoring above 60',
      },
      actions: [
        {
          actionId: 'score-lead-action',
          actionName: 'scoreLead',
          actionTitle: 'Score Lead',
          modelName: 'Lead',
          inputFields: ['name', 'email', 'company', 'position', 'source', 'budget', 'timeline'],
          outputFields: ['score', 'interest', 'status'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['name', 'email', 'company', 'position', 'source', 'budget', 'timeline', 'score', 'interest', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-lead-scoring',
          name: 'Daily Lead Scoring',
          description: 'Score new and unscored leads every day',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['score-lead-action'],
          steps: [
            {
              modelName: 'Lead',
              actionId: 'score-lead-action',
              actionName: 'scoreLead',
              actionTitle: 'Score Lead',
              query: {
                filters: [
                  { field: 'score', operator: 'is_empty', value: null },
                  { field: 'status', operator: 'equals', value: 'New' }
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

      title: 'Personalized Follow-up Email',
      description: {
        feature: 'Generate customized follow-up emails for each lead based on their context',
        data: 'Lead name, company, current status, interest level, previous conversation notes, and last contact date',
        action: 'Research the lead\'s company online for recent news and context, use AI to draft a personalized email tailored to their status and interest level, keep it concise and value-focused, include clear call-to-action, suggest optimal next follow-up date',
      },
      actions: [
        {
          actionId: 'generate-followup-email-action',
          actionName: 'generateFollowUpEmail',
          actionTitle: 'Generate Follow-up Email',
          modelName: 'Lead',
          inputFields: ['name', 'company', 'status', 'interest', 'notes', 'lastContact'],
          outputFields: ['emailDraft', 'nextFollowUp'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['name', 'company', 'status', 'interest', 'notes', 'lastContact', 'emailDraft', 'nextFollowUp'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-followup-emails',
          name: 'Daily Follow-up Emails',
          description: 'Generate personalized follow-up emails for contacted leads daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['generate-followup-email-action'],
          steps: [
            {
              modelName: 'Lead',
              actionId: 'generate-followup-email-action',
              actionName: 'generateFollowUpEmail',
              actionTitle: 'Generate Follow-up Email',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Contacted' },
                  { field: 'emailDraft', operator: 'is_empty', value: null }
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

      title: 'Lead Qualification',
      description: {
        feature: 'Automatically evaluate if leads meet our qualification criteria and route them to the right sales rep',
        data: 'Lead score, budget information, purchase timeline, and interest level',
        action: 'Use AI to evaluate if the lead should be qualified for sales engagement based on score, budget, timeline, and interest. If qualified, intelligently suggest which sales rep to assign based on territory, expertise, or workload. Update lead status and add qualification notes explaining the decision',
      },
      actions: [
        {
          actionId: 'qualify-lead-action',
          actionName: 'qualifyLead',
          actionTitle: 'Qualify Lead',
          modelName: 'Lead',
          inputFields: ['score', 'budget', 'timeline', 'interest'],
          outputFields: ['status', 'assignedTo', 'notes'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['score', 'budget', 'timeline', 'interest', 'status', 'assignedTo', 'notes'],
        },
      ],
      schedules: [
        {
          scheduleId: 'auto-qualify-leads',
          name: 'Auto-Qualify Leads',
          description: 'Automatically qualify high-scoring leads daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['qualify-lead-action'],
          steps: [
            {
              modelName: 'Lead',
              actionId: 'qualify-lead-action',
              actionName: 'qualifyLead',
              actionTitle: 'Qualify Lead',
              query: {
                filters: [
                  { field: 'score', operator: 'greater_than', value: 60 },
                  { field: 'status', operator: 'equals', value: 'New' }
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
    { order: 1, title: 'Capture Lead', description: 'Add leads manually or import from CRM/forms' },
    { order: 2, title: 'AI Scores', description: 'System scores leads based on fit and engagement' },
    { order: 3, title: 'Auto-qualify', description: 'AI qualifies leads and routes to sales reps' },
    { order: 4, title: 'Follow-up', description: 'Automated personalized follow-up emails' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'leads', type: 'text', label: 'Leads' },
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
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook. This allows your agent to send emails via Gmail and access social platforms.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
      actions: [
        {
          name: 'sendFollowUpEmail',
          title: 'Send Follow-up Email',
          emoji: '📧',
          description: 'Send a personalized follow-up email to lead via Gmail',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['emailSent', 'sentAt'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'composeAndSendEmail',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Send follow-up email to lead using Gmail',
                inputFields: ['googleAuth'],
                outputFields: ['emailSent', 'sentAt'],
                customCode: `// Send follow-up email via Gmail API
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

// Email content
const emailContent = [
  'To: lead@company.com',
  'Subject: Following up on our conversation',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<p>Hi [Name],</p>',
  '<p>I wanted to follow up on our recent conversation...</p>',
  '<p>Best regards,<br>Sales Team</p>'
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

return {
  emailSent: response.ok,
  sentAt: new Date().toISOString()
};`,
              },
            },
          ],
        },
        {
          name: 'importFacebookLeads',
          title: 'Import Facebook Leads',
          emoji: '📥',
          description: 'Import leads from Facebook Lead Ads',
          modelName: 'Workspace',
          inputFields: ['fbAuth'],
          outputFields: ['leadsImported', 'importedAt'],
          requiresConnection: 'facebook-connection',
          steps: [
            {
              name: 'fetchLeadAds',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Fetch leads from Facebook Lead Ads',
                inputFields: ['fbAuth'],
                outputFields: ['leadsImported', 'importedAt'],
                customCode: `// Fetch Facebook Lead Ads
const authData = JSON.parse(fbAuth);
const accessToken = authData.accessToken;

// Get lead ads data
const response = await fetch('https://graph.facebook.com/v18.0/me/leadgen_forms?fields=id,name,leads', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
  }
});

const result = await response.json();

return {
  leadsImported: result.data?.length || 0,
  importedAt: new Date().toISOString()
};`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Lead',
      fields: [
        { name: 'leadId', type: 'text', label: 'Lead ID', required: true },
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'phone', type: 'text', label: 'Phone' },
        { name: 'company', type: 'text', label: 'Company' },
        { name: 'position', type: 'text', label: 'Position' },
        { name: 'source', type: 'select', label: 'Source', options: ['Website', 'Referral', 'Social Media', 'Cold Outreach', 'Event'] },
        { name: 'status', type: 'select', label: 'Status', options: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'], defaultValue: 'New' },
        { name: 'score', type: 'number', label: 'Lead Score (0-100)' },
        { name: 'interest', type: 'select', label: 'Interest Level', options: ['Low', 'Medium', 'High'] },
        { name: 'budget', type: 'text', label: 'Budget' },
        { name: 'timeline', type: 'text', label: 'Timeline' },
        { name: 'notes', type: 'textarea', label: 'Notes' },
        { name: 'nextFollowUp', type: 'date', label: 'Next Follow-up' },
        { name: 'emailDraft', type: 'textarea', label: 'Email Draft' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'assignedTo', type: 'text', label: 'Assigned To' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'lastContact', type: 'date', label: 'Last Contact' },
      ],
      forms: [
        {
          id: 'quick-lead',
          name: 'Quick Lead',
          description: 'Capture lead essentials in seconds',
          icon: '⚡',
          modelName: 'Lead',
          fields: ['name', 'email', 'company', 'source'],
        },
        {
          id: 'full-lead',
          name: 'Full Lead Profile',
          description: 'Complete lead information for qualification',
          icon: '📄',
          modelName: 'Lead',
          fields: ['name', 'email', 'phone', 'company', 'position', 'source', 'budget', 'timeline', 'notes'],
        },
        {
          id: 'lead-follow-up',
          name: 'Follow-up Notes',
          description: 'Log follow-up interactions and next steps',
          icon: '📅',
          modelName: 'Lead',
          fields: ['notes', 'status', 'interest', 'nextFollowUp'],
        },
      ],
      actions: [
        {
          name: 'scoreLead',
          title: 'Score Lead',
          emoji: '📊',
          description: 'Calculate lead score based on engagement and fit',
          modelName: 'Lead',
          inputFields: ['name', 'email', 'company', 'position', 'source', 'budget', 'timeline'],
          outputFields: ['score', 'interest', 'status'],
          steps: [
            {
              name: 'calculateScore',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the lead information and calculate a lead score from 0-100 based on: company size indicators, position seniority, budget availability, timeline urgency, and source quality. Also determine interest level (Low/Medium/High) and update status if qualified (score > 60).',
                inputFields: ['company', 'position', 'source', 'budget', 'timeline'],
                outputFields: ['score', 'interest', 'status'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'generateFollowUpEmail',
          title: 'Generate Follow-up Email',
          emoji: '📧',
          description: 'Create personalized follow-up email based on lead status',
          modelName: 'Lead',
          inputFields: ['name', 'company', 'status', 'interest', 'notes', 'lastContact'],
          outputFields: ['emailDraft', 'nextFollowUp'],
          steps: [
            {
              name: 'researchCompany',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Search for recent news and information about the company',
                inputFields: ['company'],
                outputFields: ['companyNews', 'recentEvents', 'industryContext'],
              },
            },
            {
              name: 'draftEmail',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Generate a personalized follow-up email for this lead. Use any research findings about their company. Tailor the tone and content based on their status and interest level. Keep it concise, value-focused, and include a clear call-to-action. Also suggest the next follow-up date.',
                inputFields: ['name', 'company', 'status', 'interest', 'notes'],
                outputFields: ['emailDraft', 'nextFollowUp'],
                model: 'gpt-4o',
                temperature: 0.7,
              },
            },
          ],
        },
        {
          name: 'qualifyLead',
          title: 'Qualify Lead',
          emoji: '✅',
          description: 'Determine if lead meets qualification criteria',
          modelName: 'Lead',
          inputFields: ['score', 'budget', 'timeline', 'interest'],
          outputFields: ['status', 'assignedTo', 'notes'],
          steps: [
            {
              name: 'evaluateQualification',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Evaluate if this lead should be qualified for sales engagement. Consider lead score, budget availability, timeline, and interest level. If qualified, suggest which sales rep to assign based on territory or expertise. Update status and add qualification notes.',
                inputFields: ['score', 'budget', 'timeline', 'interest'],
                outputFields: ['status', 'assignedTo', 'notes'],
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
      id: 'score-leads-schedule',
      name: 'Score new leads',
      mode: 'recurring',
      intervalHours: '4',
      actionIds: ['score-lead-action'],
      steps: [
        {
          modelName: 'Lead',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          actionName: 'scoreLead',
          actionId: 'score-lead-action',
          order: 1,
        },
      ],
    },
    {
      id: 'generate-followups-schedule',
      name: 'Generate follow-ups',
      mode: 'recurring',
      intervalHours: '24',
      actionIds: ['generate-followup-email-action'],
      steps: [
        {
          modelName: 'Lead',
          query: {
            filters: [
              { field: 'status', operator: 'in', value: ['Contacted', 'Qualified'] }
            ],
            logic: 'AND'
          },
          actionName: 'generateFollowUpEmail',
          actionId: 'generate-followup-email-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 1654,
  viewCount: 6823,
  rating: 4.6,
  reviewCount: 87,
  createdAt: new Date('2024-09-10'),
  updatedAt: new Date('2025-01-18'),
  badges: ['FEATURED', 'UPDATED'],
};
