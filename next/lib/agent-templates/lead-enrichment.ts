/**
 * Lead Enrichment & Scoring Automation Template
 */

import type { Template } from './types'

export const LEAD_ENRICHMENT_TEMPLATE: Template = {
  id: '3',
  slug: 'lead-enrichment-automation',
  title: 'Lead Enrichment & Scoring Automation',
  shortDescription: 'Automatically enrich leads with company data, assign scores, and prioritize your sales pipeline.',
  longDescription: 'Transform your lead management with AI-powered enrichment. This template automatically finds company information, validates email addresses, assigns lead scores, and integrates with your CRM to keep your sales team focused on the best opportunities.',
  description: 'Enrich leads with additional data and insights',
  category: 'sales',
  subcategories: ['operations'],
  tags: ['CRM', 'Sales', 'Lead Generation', 'Automation'],
  useCases: ['Data Enrichment', 'API Integration', 'Automation & Scheduling'],
  thumbnail: '/templates/lead-enrichment.png',
  icon: '💼',
  difficulty: 'intermediate',
  setupTime: 25,
  pricingTier: 'pro',
  version: '3.0',
  aiFeatures: ['Data Extraction', 'Web Research', 'Text Generation'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Sheets integration',
      icon: '📊',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets'],
      fieldName: 'googleAuth',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Google Workspace',
      description: {
        feature: 'Connect Google to access Sheets and automate lead imports',
        data: 'OAuth connection for Google (Sheets, email)',
        action: 'Authenticate with Google to import leads from Sheets and send follow-ups',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Google Connection',
          formType: 'edit',
          whenToUse: 'Use this form to configure Google OAuth connection for accessing Google Sheets and other Google services.',
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
      icon: '⚡',
      title: 'Quick Lead Capture',
      description: {
        feature: 'Quickly add new leads with basic contact information',
        data: 'First name, last name, email, phone, and company name',
        action: 'Create lead record with unique ID, validate email format, set status to "New", prepare for enrichment',
      },
      forms: [
        {
          formId: 'new-lead-form',
          formName: 'New Lead',
          formType: 'new',
          whenToUse: 'Use this form to add a new lead to your pipeline. Enter basic contact information including name, email, and company name.',
          modelName: 'Lead',
          fields: ['firstName', 'lastName', 'email', 'phone', 'companyName', 'source'],
          scheduleId: 'enrich-lead-schedule',
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['leadId', 'firstName', 'lastName', 'email', 'companyName', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'enrich-lead-schedule',
          name: 'Enrich Lead Schedule',
          description: 'Automatically enrich lead after creation',
          mode: 'once',
          actionIds: ['enrich-lead-action'],
          steps: [
            {
              modelName: 'Lead',
              actionId: 'enrich-lead-action',
              actionName: 'enrichLead',
              actionTitle: 'Enrich Lead',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'New' }],
                logic: 'AND'
              },
              order: 1,
            },
            {
              modelName: 'Lead',
              actionId: 'score-lead-action',
              actionName: 'scoreLead',
              actionTitle: 'Score Lead',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'New' }],
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
      title: 'Update Lead Status',
      description: {
        feature: 'Update the status of existing leads as they progress through the pipeline',
        data: 'Lead status (New, Contacted, Qualified, Unqualified, Converted)',
        action: 'Change the status field to reflect current lead state',
      },
      forms: [
        {
          formId: 'edit-lead-status',
          formName: 'Update Lead Status',
          formType: 'edit',
          whenToUse: 'Use this form to update a lead\'s status as they move through your sales pipeline. Select the appropriate status based on engagement.',
          modelName: 'Lead',
          fields: ['status', 'assignedTo', 'notes', 'updatedAt'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['status', 'assignedTo', 'notes', 'updatedAt'],
        },
      ],
    },
    {
      icon: '👤',
      title: 'Qualify Lead',
      description: {
        feature: 'Mark leads as qualified or unqualified',
        data: 'Qualification status and notes',
        action: 'Update status to Qualified or Unqualified with qualification notes',
      },
      forms: [
        {
          formId: 'edit-lead-qualification',
          formName: 'Qualify Lead',
          formType: 'edit',
          whenToUse: 'Use this form after reviewing a lead to mark them as qualified or unqualified. Add notes explaining your decision.',
          modelName: 'Lead',
          fields: ['status', 'notes', 'assignedTo'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['status', 'notes', 'assignedTo'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'Automated Data Enrichment',
      description: {
        feature: 'Automatically find and add company information and contact details',
        data: 'Email address and company name from lead records',
        action: 'Search external databases for company size, industry, revenue, job title, validate email deliverability, find social profiles, update lead record with enriched data',
      },
      actions: [
        {
          actionId: 'enrich-lead-action',
          actionName: 'enrichLead',
          actionTitle: 'Enrich Lead',
          modelName: 'Lead',
          inputFields: ['email', 'companyName'],
          outputFields: ['companySize', 'industry', 'revenue', 'jobTitle', 'emailValidated'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['email', 'companyName', 'companySize', 'industry', 'revenue', 'jobTitle', 'emailValidated'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-lead-enrichment',
          name: 'Daily Lead Enrichment',
          description: 'Enrich new leads with company data daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['enrich-lead-action'],
          steps: [
            {
              modelName: 'Lead',
              actionId: 'enrich-lead-action',
              actionName: 'enrichLead',
              actionTitle: 'Enrich Lead',
              query: {
                filters: [
                  { field: 'email', operator: 'is_not_empty', value: null },
                  { field: 'companySize', operator: 'is_empty', value: null }
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
      title: 'Intelligent Lead Scoring',
      description: {
        feature: 'Score leads based on fit and engagement to prioritize outreach',
        data: 'Company size, industry, job title, email engagement, source, and behavior',
        action: 'Calculate lead score using AI, consider ICP match, engagement level, buying signals, assign score 0-100, update status based on score thresholds',
      },
      actions: [
        {
          actionId: 'score-lead-action',
          actionName: 'scoreLead',
          actionTitle: 'Score Lead',
          modelName: 'Lead',
          inputFields: ['companySize', 'industry', 'jobTitle', 'source', 'emailValidated'],
          outputFields: ['leadScore', 'status'],
        },
      ],
      models: [
        {
          modelName: 'Lead',
          fields: ['companySize', 'industry', 'jobTitle', 'source', 'emailValidated', 'leadScore', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-scoring-schedule',
          name: 'Daily Lead Scoring',
          description: 'Recalculate lead scores daily',
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
                  { field: 'status', operator: 'not_equals', value: 'Converted' },
                  { field: 'status', operator: 'not_equals', value: 'Unqualified' }
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
    { order: 1, title: 'Import Leads', description: 'Add leads manually or sync from your CRM' },
    { order: 2, title: 'AI Enrichment', description: 'System finds and validates company data' },
    { order: 3, title: 'Score & Prioritize', description: 'Leads are scored based on your ICP' },
    { order: 4, title: 'Route to Sales', description: 'Hot leads automatically assigned to reps' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google', oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/spreadsheets'] },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form is ONLY for OAuth connections.
      forms: [
        {
          id: 'workspace-connections',
          name: 'Workspace Connections',
          description: 'Configure OAuth connections for external services',
          icon: '🔗',
          formType: 'edit',
          whenToUse: 'Use this form to configure Google OAuth connection for accessing Google Sheets and other Google services.',
          modelName: 'Workspace',
          fields: ['googleAuth'],
        },
      ],
    },
    {
      name: 'Lead',
      description: 'Sales lead with enrichment data and scoring',
      fields: [
        { name: 'leadId', type: 'text', label: 'Lead ID', required: true },
        { name: 'firstName', type: 'text', label: 'First Name', required: true },
        { name: 'lastName', type: 'text', label: 'Last Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'phone', type: 'text', label: 'Phone' },
        { name: 'companyName', type: 'text', label: 'Company Name' },
        { name: 'companySize', type: 'select', label: 'Company Size', options: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
        { name: 'industry', type: 'text', label: 'Industry' },
        { name: 'revenue', type: 'text', label: 'Revenue' },
        { name: 'jobTitle', type: 'text', label: 'Job Title' },
        { name: 'leadScore', type: 'number', label: 'Lead Score' },
        { name: 'status', type: 'select', label: 'Status', options: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'], defaultValue: 'New' },
        { name: 'source', type: 'text', label: 'Source' },
        { name: 'assignedTo', type: 'text', label: 'Assigned To' },
        { name: 'emailValidated', type: 'boolean', label: 'Email Validated', defaultValue: false },
        { name: 'notes', type: 'textarea', label: 'Notes' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      actions: [
        {
          name: 'enrichLead',
          title: 'Enrich Lead',
          emoji: '🔍',
          description: 'Find and add company information and contact details',
          modelName: 'Lead',
          inputFields: ['email', 'companyName'],
          outputFields: ['companySize', 'industry', 'revenue', 'jobTitle', 'emailValidated'],
          steps: [
            {
              name: 'searchCompanyData',
              type: 'web_search',
              order: '1',
              config: {
                searchQuery: 'Search for company size, industry, revenue, and job title information',
                inputFields: ['email', 'companyName'],
                outputFields: ['companyData', 'industryInfo', 'revenueEstimate'],
              },
            },
            {
              name: 'extractEnrichmentData',
              type: 'ai_reasoning',
              order: '2',
              config: {
                prompt: 'Based on the email domain and company name, extract and structure company information including company size, industry, estimated revenue, job title from email, and validate email deliverability.',
                inputFields: ['email', 'companyName'],
                outputFields: ['companySize', 'industry', 'revenue', 'jobTitle', 'emailValidated'],
                model: 'gpt-4o',
                temperature: 0.2,
              },
            },
          ],
        },
        {
          name: 'scoreLead',
          title: 'Score Lead',
          emoji: '⭐',
          description: 'Calculate lead score based on fit and engagement',
          modelName: 'Lead',
          inputFields: ['companySize', 'industry', 'jobTitle', 'source', 'emailValidated'],
          outputFields: ['leadScore', 'status'],
          steps: [
            {
              name: 'calculateScore',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Calculate a lead score from 0-100 based on: company size (larger = higher score), industry fit, job title seniority, lead source quality, and email validation. Update status to "Qualified" if score > 70, "Contacted" if score > 40, otherwise keep as "New".',
                inputFields: ['companySize', 'industry', 'jobTitle', 'source', 'emailValidated'],
                outputFields: ['leadScore', 'status'],
                model: 'gpt-4o',
                temperature: 0.1,
              },
            },
          ],
        },
      ],
    },
  ],
  schedules: [
    {
      id: 'enrich-lead-schedule',
      name: 'Enrich Lead (Run Once)',
      description: 'Automatically enrich lead after creation',
      mode: 'once',
      actionIds: ['enrich-lead-action', 'score-lead-action'],
      steps: [
        {
          modelName: 'Lead',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          actionName: 'enrichLead',
          actionId: 'enrich-lead-action',
          order: 1,
        },
        {
          modelName: 'Lead',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'New' }],
            logic: 'AND'
          },
          actionName: 'scoreLead',
          actionId: 'score-lead-action',
          order: 2,
        },
      ],
    },
    {
      id: 'daily-lead-enrichment',
      name: 'Daily Lead Enrichment',
      description: 'Enrich new leads with company data daily',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['enrich-lead-action'],
      steps: [
        {
          modelName: 'Lead',
          query: {
            filters: [
              { field: 'email', operator: 'is_not_empty', value: null },
              { field: 'companySize', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'enrichLead',
          actionId: 'enrich-lead-action',
          order: 1,
        },
      ],
    },
    {
      id: 'daily-scoring-schedule',
      name: 'Daily Lead Scoring',
      description: 'Recalculate lead scores daily',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['score-lead-action'],
      steps: [
        {
          modelName: 'Lead',
          query: {
            filters: [
              { field: 'status', operator: 'not_equals', value: 'Converted' },
              { field: 'status', operator: 'not_equals', value: 'Unqualified' }
            ],
            logic: 'AND'
          },
          actionName: 'scoreLead',
          actionId: 'score-lead-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 876,
  viewCount: 3421,
  rating: 4.7,
  reviewCount: 43,
  createdAt: new Date('2024-10-20'),
  updatedAt: new Date('2025-01-20'),
  badges: ['FEATURED', 'UPDATED'],
}

