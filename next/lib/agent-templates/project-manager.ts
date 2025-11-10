import type { AgentTemplateData } from './types';

export const PROJECT_MANAGER_TEMPLATE: AgentTemplateData = {
  id: 'project-manager',
  slug: 'project-manager-agent',
  title: 'Project Manager Agent',
  shortDescription: 'Manage projects, track progress, and coordinate team tasks with AI assistance',
  longDescription: 'Keep your projects on track with AI-powered project management. This agent helps you create projects, break down tasks, assign work, track progress, identify blockers, and generate status reports. Perfect for teams looking to streamline their project workflows.',
  description: 'Manages projects, tracks progress, and coordinates tasks',
  thumbnail: '/templates/project-manager.png',
  icon: '💼',
  category: 'Productivity',
  subcategories: ['project-management', 'collaboration'],
  tags: ['Project Management', 'Task Tracking', 'Team Collaboration', 'Progress Monitoring', 'Reporting'],
  useCases: ['Project Planning', 'Task Management', 'Team Coordination', 'Progress Tracking'],
  difficulty: 'beginner',
  setupTime: 20,
  pricingTier: 'starter',
  version: '1.0',
  aiFeatures: ['Task Breakdown', 'Progress Analysis', 'Risk Detection', 'Status Reporting'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Gmail, Calendar and Drive integration',
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
      description: 'Connect to Facebook for team collaboration',
      icon: '📘',
      scopes: ['email', 'public_profile'],
      fieldName: 'fbAuth',
      setupAction: 'facebookLogin',
    },
  ],
  features: [
    {
      icon: '🔗',
      title: 'Connect Collaboration Tools',
      description: {
        feature: 'Connect Google and Facebook to send project updates and notifications',
        data: 'OAuth connections for Google (Gmail, Calendar) and Facebook',
        action: 'Send project updates via Gmail and post status to team channels',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Collaboration Tool Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook. This allows your agent to send project updates via Gmail and post to social platforms.',
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

      title: 'Quick Project Creation',
      description: {
        feature: 'Quickly create a new project with just the essential information',
        data: 'Project name, description, current status (Planning/Active/etc.), and priority level',
        action: 'Create a new project record with unique ID, set initial progress to 0%, add timestamp, prepare for tracking',
      },
      forms: [
        {
          formId: 'quick-project',
          formName: 'Quick Project',
          modelName: 'Project',
          fields: ['name', 'description', 'status', 'priority'],
        },
      ],
      models: [
        {
          modelName: 'Project',
          fields: ['projectId', 'name', 'description', 'status', 'priority', 'progress', 'createdAt'],
        },
      ],
    },
    {
      icon: '📄',

      title: 'Complete Project Setup',
      description: {
        feature: 'Set up a new project with complete details including budget, timeline, and team',
        data: 'Project name, description, status, priority, budget amount, start date, end date, and team member names',
        action: 'Create comprehensive project plan with all parameters, validate timeline, assign team members, initialize budget tracking, set progress to 0%',
      },
      forms: [
        {
          formId: 'full-project',
          formName: 'Complete Project',
          modelName: 'Project',
          fields: ['name', 'description', 'status', 'priority', 'budget', 'startDate', 'endDate', 'team'],
        },
      ],
      models: [
        {
          modelName: 'Project',
          fields: ['projectId', 'name', 'description', 'status', 'priority', 'budget', 'startDate', 'endDate', 'team', 'progress', 'createdAt'],
        },
      ],
    },
    {
      icon: '📋',

      title: 'Project Status Update',
      description: {
        feature: 'Update project progress, spending, blockers, and risks as work progresses',
        data: 'Current status, progress percentage (0-100), amount spent so far, current blockers preventing progress, identified risks',
        action: 'Update project record with latest status and progress, track budget utilization against budget, document obstacles and risks, update timestamp',
      },
      forms: [
        {
          formId: 'project-update',
          formName: 'Project Update',
          modelName: 'Project',
          fields: ['status', 'progress', 'spent', 'blockers', 'risks'],
        },
      ],
      models: [
        {
          modelName: 'Project',
          fields: ['status', 'progress', 'spent', 'blockers', 'risks', 'updatedAt'],
        },
      ],
    },
    {
      icon: '🤖',

      title: 'Automated Status Reporting',
      description: {
        feature: 'Automatically generate comprehensive project status reports for stakeholders',
        data: 'Project name, status, progress, budget and spending data, timeline, team info, identified risks, and current blockers',
        action: 'Use AI to analyze all project data and generate a comprehensive status report including progress summary, budget burn rate, timeline adherence, team performance, risk assessment, blockers, achievements and challenges. Suggest specific next actions to keep the project on track',
      },
      actions: [
        {
          actionId: 'generate-status-report-action',
          actionName: 'generateStatusReport',
          actionTitle: 'Generate Status Report',
          modelName: 'Project',
          inputFields: ['name', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'team', 'risks', 'blockers'],
          outputFields: ['statusReport', 'nextActions'],
        },
      ],
      models: [
        {
          modelName: 'Project',
          fields: ['name', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'team', 'risks', 'blockers', 'statusReport', 'nextActions'],
        },
      ],
      schedules: [
        {
          scheduleId: 'weekly-status-reports',
          name: 'Weekly Status Reports',
          description: 'Generate project status reports every week',
          mode: 'recurring',
          intervalHours: 168,
          actionIds: ['generate-status-report-action'],
          steps: [
            {
              modelName: 'Project',
              actionId: 'generate-status-report-action',
              actionName: 'generateStatusReport',
              actionTitle: 'Generate Status Report',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'In Progress' }],
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

      title: 'Risk Identification',
      description: {
        feature: 'Proactively identify potential project risks before they become problems',
        data: 'Project name, description, status, progress, budget, spending, timeline dates, and current blockers',
        action: 'Use AI to analyze project details and identify potential risks like budget overruns, timeline delays, resource constraints, scope creep, and technical challenges. For each risk, assess likelihood and impact, provide mitigation strategies',
      },
      actions: [
        {
          actionId: 'identify-risks-action',
          actionName: 'identifyRisks',
          actionTitle: 'Identify Risks',
          modelName: 'Project',
          inputFields: ['name', 'description', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'blockers'],
          outputFields: ['risks', 'nextActions'],
        },
      ],
      models: [
        {
          modelName: 'Project',
          fields: ['name', 'description', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'blockers', 'risks', 'nextActions'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-risk-assessment',
          name: 'Daily Risk Assessment',
          description: 'Check active projects for risks daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['identify-risks-action'],
          steps: [
            {
              modelName: 'Project',
              actionId: 'identify-risks-action',
              actionName: 'identifyRisks',
              actionTitle: 'Identify Risks',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'In Progress' },
                  { field: 'status', operator: 'equals', value: 'At Risk' }
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

      title: 'Progress Calculation',
      description: {
        feature: 'Automatically calculate project completion percentage based on milestones',
        data: 'Project milestones (completed and pending), start date, end date, and current status',
        action: 'Use AI to analyze completed milestones vs total milestones, calculate time elapsed vs total timeline, consider current status, compute accurate progress percentage (0-100), generate progress summary',
      },
      actions: [
        {
          actionId: 'update-progress-action',
          actionName: 'updateProgress',
          actionTitle: 'Update Progress',
          modelName: 'Project',
          inputFields: ['milestones', 'startDate', 'endDate', 'status'],
          outputFields: ['progress', 'statusReport'],
        },
      ],
      models: [
        {
          modelName: 'Project',
          fields: ['milestones', 'startDate', 'endDate', 'status', 'progress', 'statusReport'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-progress-update',
          name: 'Daily Progress Update',
          description: 'Recalculate project progress daily based on milestones',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['update-progress-action'],
          steps: [
            {
              modelName: 'Project',
              actionId: 'update-progress-action',
              actionName: 'updateProgress',
              actionTitle: 'Update Progress',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'In Progress' }],
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
    { order: 1, title: 'Create Project', description: 'Set up project with goals and timeline' },
    { order: 2, title: 'Break Down Tasks', description: 'AI helps create detailed task list' },
    { order: 3, title: 'Track Progress', description: 'Monitor completion and identify blockers' },
    { order: 4, title: 'Generate Reports', description: 'Automated status updates for stakeholders' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'projects', type: 'text', label: 'Projects' },
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
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook. This allows your agent to send project updates via Gmail and post to social platforms.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
      actions: [
        {
          name: 'sendProjectUpdate',
          title: 'Send Project Update',
          emoji: '📧',
          description: 'Email project status update to team via Gmail',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['updateSent'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'sendUpdate',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Send project update email via Gmail',
                inputFields: ['googleAuth'],
                outputFields: ['updateSent'],
                customCode: `// Send project update via Gmail
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

const emailContent = [
  'To: team@company.com',
  'Subject: Project Status Update',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<h2>Project Status Update</h2>',
  '<p><strong>Progress:</strong> 75%</p>',
  '<p><strong>Status:</strong> On track</p>',
  '<p>Next steps and updates...</p>'
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

return { updateSent: response.ok };`,
              },
            },
          ],
        },
        {
          name: 'createCalendarEvent',
          title: 'Create Calendar Event',
          emoji: '📅',
          description: 'Create project milestone in Google Calendar',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['eventId', 'eventCreated'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'addToCalendar',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Create event in Google Calendar',
                inputFields: ['googleAuth'],
                outputFields: ['eventId', 'eventCreated'],
                customCode: `// Create Google Calendar event
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    summary: 'Project Milestone',
    description: 'Important project deadline',
    start: {
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
      timeZone: 'UTC'
    }
  })
});

const result = await response.json();

return {
  eventId: result.id || '',
  eventCreated: !!result.id
};`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Project',
      fields: [
        { name: 'projectId', type: 'text', label: 'Project ID', required: true },
        { name: 'name', type: 'text', label: 'Project Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'status', type: 'select', label: 'Status', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'], defaultValue: 'Planning' },
        { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High', 'Critical'], defaultValue: 'Medium' },
        { name: 'progress', type: 'number', label: 'Progress (0-100)', defaultValue: 0 },
        { name: 'budget', type: 'text', label: 'Budget' },
        { name: 'spent', type: 'text', label: 'Amount Spent' },
        { name: 'startDate', type: 'date', label: 'Start Date' },
        { name: 'endDate', type: 'date', label: 'End Date' },
        { name: 'team', type: 'text', label: 'Team Members (comma-separated)' },
        { name: 'risks', type: 'textarea', label: 'Identified Risks' },
        { name: 'milestones', type: 'textarea', label: 'Milestones (JSON)' },
        { name: 'statusReport', type: 'textarea', label: 'Status Report' },
        { name: 'nextActions', type: 'textarea', label: 'Next Actions' },
        { name: 'blockers', type: 'textarea', label: 'Current Blockers' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      forms: [
        {
          id: 'quick-project',
          name: 'Quick Project',
          description: 'Create a project with essential details',
          icon: '⚡',
          modelName: 'Project',
          fields: ['name', 'description', 'status', 'priority'],
        },
        {
          id: 'full-project',
          name: 'Complete Project',
          description: 'Full project setup with budget, timeline, and team',
          icon: '📄',
          modelName: 'Project',
          fields: ['name', 'description', 'status', 'priority', 'budget', 'startDate', 'endDate', 'team'],
        },
        {
          id: 'project-update',
          name: 'Project Update',
          description: 'Update project status and progress',
          icon: '📈',
          modelName: 'Project',
          fields: ['status', 'progress', 'spent', 'blockers', 'risks'],
        },
      ],
      actions: [
        {
          name: 'generateStatusReport',
          title: 'Generate Status Report',
          emoji: '📋',
          description: 'Create comprehensive project status report',
          modelName: 'Project',
          inputFields: ['name', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'team', 'risks', 'blockers'],
          outputFields: ['statusReport', 'nextActions'],
          steps: [
            {
              name: 'analyzeProgress',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Generate a comprehensive project status report. Include: 1) Overall progress summary, 2) Budget status and burn rate, 3) Timeline adherence, 4) Team performance, 5) Risk assessment, 6) Current blockers, 7) Achievements and challenges. Also suggest specific next actions.',
                inputFields: ['name', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'team', 'risks', 'blockers'],
                outputFields: ['statusReport', 'nextActions'],
                model: 'gpt-4o',
                temperature: 0.5,
              },
            },
          ],
        },
        {
          name: 'identifyRisks',
          title: 'Identify Risks',
          emoji: '⚠️',
          description: 'Analyze project and identify potential risks',
          modelName: 'Project',
          inputFields: ['name', 'description', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'blockers'],
          outputFields: ['risks', 'nextActions'],
          steps: [
            {
              name: 'assessRisks',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the project details and identify potential risks. Consider: budget overruns, timeline delays, resource constraints, scope creep, technical challenges, and team issues. For each risk, provide likelihood, impact, and mitigation strategies.',
                inputFields: ['description', 'status', 'progress', 'budget', 'spent', 'startDate', 'endDate', 'blockers'],
                outputFields: ['risks', 'nextActions'],
                model: 'gpt-4o',
                temperature: 0.4,
              },
            },
          ],
        },
        {
          name: 'updateProgress',
          title: 'Update Progress',
          emoji: '📈',
          description: 'Calculate and update project progress',
          modelName: 'Project',
          inputFields: ['milestones', 'startDate', 'endDate', 'status'],
          outputFields: ['progress', 'statusReport'],
          steps: [
            {
              name: 'calculateProgress',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Calculate project progress based on completed milestones, time elapsed, and current status. Provide a progress percentage (0-100) and a brief progress summary.',
                inputFields: ['milestones', 'startDate', 'endDate', 'status'],
                outputFields: ['progress', 'statusReport'],
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
      id: 'weekly-project-reports',
      name: 'Weekly project reports',
      mode: 'recurring',
      intervalHours: '168', // Weekly
      actionIds: ['generate-status-report-action', 'identify-risks-action'],
      steps: [
        {
          modelName: 'Project',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Active' }],
            logic: 'AND'
          },
          actionName: 'generateStatusReport',
          actionId: 'generate-status-report-action',
          order: 1,
        },
        {
          modelName: 'Project',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Active' }],
            logic: 'AND'
          },
          actionName: 'identifyRisks',
          actionId: 'identify-risks-action',
          order: 2,
        },
      ],
    },
    {
      id: 'daily-progress-updates',
      name: 'Daily progress updates',
      mode: 'recurring',
      intervalHours: '24',
      actionIds: ['update-progress-action'],
      steps: [
        {
          modelName: 'Project',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Active' }],
            logic: 'AND'
          },
          actionName: 'updateProgress',
          actionId: 'update-progress-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 1432,
  viewCount: 5789,
  rating: 4.6,
  reviewCount: 74,
  createdAt: new Date('2024-09-20'),
  updatedAt: new Date('2025-01-10'),
  badges: ['FEATURED'],
};
