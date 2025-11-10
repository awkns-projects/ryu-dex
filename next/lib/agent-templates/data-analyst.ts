import type { AgentTemplateData } from './types';

export const DATA_ANALYST_TEMPLATE: AgentTemplateData = {
  id: 'data-analyst',
  slug: 'data-analyst-agent',
  title: 'Data Analyst Agent',
  shortDescription: 'Analyze data, generate insights, and create automated reports with AI',
  longDescription: 'Turn your data into actionable insights with AI-powered analysis. This agent connects to your data sources, performs complex analysis, identifies trends and patterns, generates visualizations, and creates comprehensive reports. Perfect for teams that need data-driven decision making.',
  description: 'Analyzes data, generates insights, and creates reports',
  thumbnail: '/templates/data-analyst.png',
  icon: '📊',
  category: 'Analytics',
  subcategories: ['business-intelligence', 'reporting'],
  tags: ['Data Analysis', 'Business Intelligence', 'Reporting', 'Insights', 'Visualization', 'Metrics'],
  useCases: ['Data Analysis', 'Business Intelligence', 'Automated Reporting', 'Trend Detection'],
  difficulty: 'intermediate',
  setupTime: 30,
  pricingTier: 'pro',
  version: '1.0',
  aiFeatures: ['Data Analysis', 'Trend Detection', 'Insight Generation', 'Report Summarization'],
  connections: [
    {
      id: 'google-connection',
      name: 'google',
      title: 'Google Connection',
      provider: 'google',
      description: 'Connect to Google services for Gmail, data access and analytics',
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
      description: 'Connect to Facebook for analytics and insights data',
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
      title: 'Connect Data Sources',
      description: {
        feature: 'Connect Google and Facebook to access and analyze data from multiple sources',
        data: 'OAuth connections for Google (Sheets, Analytics) and Facebook (Insights)',
        action: 'Import data from Google Sheets and Facebook, email reports via Gmail',
      },
      forms: [
        {
          formId: 'workspace-connections',
          formName: 'Data Source Connections',
          formType: 'edit',
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook. This allows your agent to email reports via Gmail and access social data.',
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

      title: 'Quick Analysis Setup',
      description: {
        feature: 'Quickly set up a data analysis with a simple question',
        data: 'Analysis name, type (Trend/Performance/Customer Insights/etc.), and the specific question to analyze',
        action: 'Create a new analysis request with unique ID, set status to Pending, assign medium priority, and queue for processing',
      },
      forms: [
        {
          formId: 'quick-analysis',
          formName: 'Quick Analysis',
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'query'],
        },
      ],
      models: [
        {
          modelName: 'DataAnalysis',
          fields: ['analysisId', 'name', 'type', 'query', 'status', 'priority', 'createdAt'],
        },
      ],
    },
    {
      icon: '📄',

      title: 'Comprehensive Analysis Setup',
      description: {
        feature: 'Set up a detailed data analysis with specific metrics, date range, and visualization preferences',
        data: 'Analysis name and type, data source location, date range to analyze, specific metrics to track, analysis question, priority level, and preferred visualization type (chart/table/dashboard)',
        action: 'Create comprehensive analysis specification with all parameters, validate data source and metrics, set priority, prepare visualization configuration',
      },
      forms: [
        {
          formId: 'full-analysis',
          formName: 'Comprehensive Analysis',
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'dataSource', 'dateRange', 'metrics', 'query', 'priority', 'visualizationType'],
        },
      ],
      models: [
        {
          modelName: 'DataAnalysis',
          fields: ['analysisId', 'name', 'type', 'dataSource', 'dateRange', 'metrics', 'query', 'priority', 'visualizationType', 'status', 'createdAt'],
        },
      ],
    },
    {
      icon: '🤖',

      title: 'Automated Data Analysis',
      description: {
        feature: 'Automatically analyze data to discover patterns, trends, and insights',
        data: 'Analysis parameters including data source, date range, metrics to analyze, and specific questions',
        action: 'Use AI to examine the data based on specified metrics and date range, identify key patterns, trends, anomalies, and correlations. Generate structured findings with supporting data points and actionable insights. Mark analysis as completed with timestamp',
      },
      actions: [
        {
          actionId: 'perform-analysis-action',
          actionName: 'performAnalysis',
          actionTitle: 'Perform Analysis',
          modelName: 'DataAnalysis',
          inputFields: ['name', 'type', 'dataSource', 'dateRange', 'metrics', 'query'],
          outputFields: ['findings', 'insights', 'status'],
        },
      ],
      models: [
        {
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'dataSource', 'dateRange', 'metrics', 'query', 'findings', 'insights', 'status', 'completedAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'auto-run-analyses',
          name: 'Auto-Run Analyses',
          description: 'Automatically run pending analyses every 6 hours',
          mode: 'recurring',
          intervalHours: 6,
          actionIds: ['perform-analysis-action'],
          steps: [
            {
              modelName: 'DataAnalysis',
              actionId: 'perform-analysis-action',
              actionName: 'performAnalysis',
              actionTitle: 'Perform Analysis',
              query: {
                filters: [
                  { field: 'status', operator: 'equals', value: 'Pending' },
                  { field: 'findings', operator: 'is_empty', value: null }
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

      title: 'AI-Generated Recommendations',
      description: {
        feature: 'Turn data insights into specific, actionable recommendations',
        data: 'Analysis name, type, key findings, insights, and tracked metrics',
        action: 'Use AI to review the analysis findings and insights, generate specific actionable recommendations prioritized by potential impact and feasibility. Include clear next steps and expected outcomes for each recommendation',
      },
      actions: [
        {
          actionId: 'generate-recommendations-action',
          actionName: 'generateRecommendations',
          actionTitle: 'Generate Recommendations',
          modelName: 'DataAnalysis',
          inputFields: ['name', 'type', 'findings', 'insights', 'metrics'],
          outputFields: ['recommendations', 'status'],
        },
      ],
      models: [
        {
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'findings', 'insights', 'metrics', 'recommendations', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'generate-recommendations-schedule',
          name: 'Generate Recommendations',
          description: 'Generate actionable recommendations for completed analyses',
          mode: 'recurring',
          intervalHours: 12,
          actionIds: ['generate-recommendations-action'],
          steps: [
            {
              modelName: 'DataAnalysis',
              actionId: 'generate-recommendations-action',
              actionName: 'generateRecommendations',
              actionTitle: 'Generate Recommendations',
              query: {
                filters: [
                  { field: 'findings', operator: 'is_not_empty', value: null },
                  { field: 'recommendations', operator: 'is_empty', value: null }
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

      title: 'Data Visualization Creation',
      description: {
        feature: 'Create visual charts and graphs to display analysis results',
        data: 'Analysis name, type, metrics, findings, and preferred visualization type',
        action: 'Use AI to generate a JSON chart configuration suitable for the specified visualization type (line/bar/pie chart, table, or dashboard). Structure the data with appropriate labels, values, and formatting for interactive visualization',
      },
      actions: [
        {
          actionId: 'create-visualization-action',
          actionName: 'createVisualization',
          actionTitle: 'Create Visualization',
          modelName: 'DataAnalysis',
          inputFields: ['name', 'type', 'metrics', 'findings', 'visualizationType'],
          outputFields: ['chartData', 'status'],
        },
      ],
      models: [
        {
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'metrics', 'findings', 'visualizationType', 'chartData', 'status'],
        },
      ],
      schedules: [
        {
          scheduleId: 'create-visualizations-schedule',
          name: 'Create Visualizations',
          description: 'Create visualizations for completed analyses daily',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['create-visualization-action'],
          steps: [
            {
              modelName: 'DataAnalysis',
              actionId: 'create-visualization-action',
              actionName: 'createVisualization',
              actionTitle: 'Create Visualization',
              query: {
                filters: [
                  { field: 'findings', operator: 'is_not_empty', value: null },
                  { field: 'chartData', operator: 'is_empty', value: null }
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
    { order: 1, title: 'Define Analysis', description: 'Specify what you want to analyze and key questions' },
    { order: 2, title: 'AI Processes Data', description: 'System analyzes data and identifies patterns' },
    { order: 3, title: 'Generate Insights', description: 'AI creates findings and recommendations' },
    { order: 4, title: 'Create Reports', description: 'Automated reports with visualizations' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'dataAnalyses', type: 'text', label: 'Data Analyses' },
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
          whenToUse: 'Use this form to configure OAuth connections for Google and Facebook. This allows your agent to email reports via Gmail and access social data.',
          modelName: 'Workspace',
          fields: ['googleAuth', 'fbAuth'],
        },
      ],
      actions: [
        {
          name: 'emailReport',
          title: 'Email Analysis Report',
          emoji: '📊',
          description: 'Send analysis report via Gmail',
          modelName: 'Workspace',
          inputFields: ['googleAuth'],
          outputFields: ['reportSent'],
          requiresConnection: 'google-connection',
          steps: [
            {
              name: 'sendReport',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Send analysis report via Gmail',
                inputFields: ['googleAuth'],
                outputFields: ['reportSent'],
                customCode: `// Send report via Gmail
const authData = JSON.parse(googleAuth);
const accessToken = authData.accessToken;

const emailContent = [
  'To: stakeholders@company.com',
  'Subject: Weekly Analysis Report',
  'Content-Type: text/html; charset=utf-8',
  '',
  '<h2>Analysis Report</h2>',
  '<p>Key findings and insights...</p>'
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

return { reportSent: response.ok };`,
              },
            },
          ],
        },
        {
          name: 'fetchFacebookInsights',
          title: 'Fetch Facebook Insights',
          emoji: '📈',
          description: 'Pull analytics data from Facebook',
          modelName: 'Workspace',
          inputFields: ['fbAuth'],
          outputFields: ['insightsData', 'fetchedAt'],
          requiresConnection: 'facebook-connection',
          steps: [
            {
              name: 'getInsights',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Fetch Facebook page insights',
                inputFields: ['fbAuth'],
                outputFields: ['insightsData', 'fetchedAt'],
                customCode: `// Fetch Facebook insights
const authData = JSON.parse(fbAuth);
const accessToken = authData.accessToken;

const response = await fetch('https://graph.facebook.com/v18.0/me/insights?metric=page_impressions,page_engaged_users', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
  }
});

const result = await response.json();

return {
  insightsData: JSON.stringify(result.data),
  fetchedAt: new Date().toISOString()
};`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'DataAnalysis',
      fields: [
        { name: 'analysisId', type: 'text', label: 'Analysis ID', required: true },
        { name: 'name', type: 'text', label: 'Analysis Name', required: true },
        { name: 'type', type: 'select', label: 'Type', options: ['Trend Analysis', 'Performance Review', 'Customer Insights', 'Sales Analysis', 'Marketing ROI', 'Custom'], required: true },
        { name: 'dataSource', type: 'text', label: 'Data Source' },
        { name: 'dateRange', type: 'text', label: 'Date Range' },
        { name: 'metrics', type: 'text', label: 'Metrics (comma-separated)' },
        { name: 'query', type: 'textarea', label: 'Analysis Query/Question' },
        { name: 'findings', type: 'textarea', label: 'Key Findings' },
        { name: 'insights', type: 'textarea', label: 'Insights' },
        { name: 'recommendations', type: 'textarea', label: 'Recommendations' },
        { name: 'visualizationType', type: 'select', label: 'Visualization Type', options: ['Line Chart', 'Bar Chart', 'Pie Chart', 'Table', 'Dashboard'] },
        { name: 'chartData', type: 'textarea', label: 'Chart Data (JSON)' },
        { name: 'status', type: 'select', label: 'Status', options: ['Pending', 'In Progress', 'Completed', 'Shared'], defaultValue: 'Pending' },
        { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High'], defaultValue: 'Medium' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'completedAt', type: 'date', label: 'Completed At' },
      ],
      forms: [
        {
          id: 'quick-analysis',
          name: 'Quick Analysis',
          description: 'Start an analysis with basic parameters',
          icon: '⚡',
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'query'],
        },
        {
          id: 'full-analysis',
          name: 'Comprehensive Analysis',
          description: 'Set up detailed analysis with all parameters',
          icon: '📄',
          modelName: 'DataAnalysis',
          fields: ['name', 'type', 'dataSource', 'dateRange', 'metrics', 'query', 'priority', 'visualizationType'],
        },
      ],
      actions: [
        {
          name: 'performAnalysis',
          title: 'Perform Analysis',
          emoji: '📊',
          description: 'Analyze data and generate insights',
          modelName: 'DataAnalysis',
          inputFields: ['name', 'type', 'dataSource', 'dateRange', 'metrics', 'query'],
          outputFields: ['findings', 'insights', 'status'],
          steps: [
            {
              name: 'analyzeData',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the provided data based on the metrics, date range, and specific query. Identify key findings, patterns, trends, anomalies, and correlations. Present findings in a clear, structured format with supporting data points.',
                inputFields: ['type', 'dataSource', 'dateRange', 'metrics', 'query'],
                outputFields: ['findings', 'insights', 'status'],
                model: 'gpt-4o',
                temperature: 0.4,
              },
            },
          ],
        },
        {
          name: 'generateRecommendations',
          title: 'Generate Recommendations',
          emoji: '💡',
          description: 'Create actionable recommendations based on insights',
          modelName: 'DataAnalysis',
          inputFields: ['name', 'type', 'findings', 'insights', 'metrics'],
          outputFields: ['recommendations', 'status'],
          steps: [
            {
              name: 'createRecommendations',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Based on the analysis findings and insights, generate specific, actionable recommendations. Prioritize recommendations by potential impact and feasibility. Include clear next steps and expected outcomes for each recommendation.',
                inputFields: ['type', 'findings', 'insights', 'metrics'],
                outputFields: ['recommendations', 'status'],
                model: 'gpt-4o',
                temperature: 0.6,
              },
            },
          ],
        },
        {
          name: 'createVisualization',
          title: 'Create Visualization',
          emoji: '📈',
          description: 'Generate chart configuration for data visualization',
          modelName: 'DataAnalysis',
          inputFields: ['name', 'type', 'metrics', 'findings', 'visualizationType'],
          outputFields: ['chartData', 'status'],
          steps: [
            {
              name: 'prepareChartData',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Create a JSON configuration for data visualization based on the analysis type, metrics, and findings. Structure the data in a format suitable for the specified visualization type. Include appropriate labels, values, and formatting.',
                inputFields: ['type', 'metrics', 'findings', 'visualizationType'],
                outputFields: ['chartData', 'status'],
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
      id: 'weekly-performance-analysis',
      name: 'Weekly performance analysis',
      mode: 'recurring',
      intervalHours: '168', // 7 days
      actionIds: ['perform-analysis-action', 'generate-recommendations-action'],
      steps: [
        {
          modelName: 'DataAnalysis',
          query: {
            filters: [
              { field: 'type', operator: 'equals', value: 'Performance Review' },
              { field: 'status', operator: 'equals', value: 'Pending' }
            ],
            logic: 'AND'
          },
          actionName: 'performAnalysis',
          actionId: 'perform-analysis-action',
          order: 1,
        },
        {
          modelName: 'DataAnalysis',
          query: {
            filters: [
              { field: 'status', operator: 'equals', value: 'Completed' },
              { field: 'recommendations', operator: 'is_empty', value: null }
            ],
            logic: 'AND'
          },
          actionName: 'generateRecommendations',
          actionId: 'generate-recommendations-action',
          order: 2,
        },
      ],
    },
  ],
  usageCount: 987,
  viewCount: 4321,
  rating: 4.5,
  reviewCount: 54,
  createdAt: new Date('2024-10-01'),
  updatedAt: new Date('2025-01-15'),
  badges: ['UPDATED'],
};
