/**
 * Expense Report & Receipt Processing Template
 */

import type { Template } from './types'

export const EXPENSE_REPORT_TEMPLATE: Template = {
  id: '5',
  slug: 'expense-report-automation',
  title: 'Expense Report & Receipt Processing',
  shortDescription: 'Automatically extract data from receipts, categorize expenses, and generate reports for accounting.',
  longDescription: 'Simplify expense management with AI. Upload receipts, and our AI extracts all relevant information, categorizes expenses, tracks budgets, and generates reports ready for your accounting system.',
  description: 'Automate expense tracking and report generation',
  category: 'finance',
  subcategories: ['operations'],
  tags: ['Finance', 'Accounting', 'Automation', 'OCR'],
  useCases: ['Data Extraction', 'Automation & Scheduling', 'Reporting & Analytics'],
  thumbnail: '/templates/expense-automation.png',
  icon: '💰',
  difficulty: 'beginner',
  setupTime: 15,
  pricingTier: 'starter',
  version: '1.8',
  aiFeatures: ['Data Extraction', 'Image Analysis', 'Text Generation'],
  features: [
    {
      icon: '⚡',
      title: 'Quick Expense Entry',
      description: {
        feature: 'Allow employees to quickly submit expense reports with receipt photos',
        data: 'Receipt image, vendor name, amount, date, and expense category',
        action: 'Create a new expense record with unique ID and timestamp, set initial status to "Pending"',
      },
      forms: [
        {
          formId: 'new-expense-form',
          formName: 'New Expense',
          formType: 'new',
          whenToUse: 'Fill this form when submitting a new expense report. Upload your receipt and provide basic details like vendor, amount, and date.',
          modelName: 'ExpenseReport',
          fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
          scheduleId: 'extract-receipt-schedule',
        },
      ],
      models: [
        {
          modelName: 'ExpenseReport',
          fields: ['expenseId', 'receiptImage', 'vendor', 'amount', 'date', 'category', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          scheduleId: 'extract-receipt-schedule',
          name: 'Extract Receipt Schedule',
          description: 'Automatically process receipt after submission',
          mode: 'once',
          actionIds: ['extract-receipt-action'],
          steps: [
            {
              modelName: 'ExpenseReport',
              actionId: 'extract-receipt-action',
              actionName: 'extractReceiptData',
              actionTitle: 'Extract Receipt Data',
              query: {
                filters: [{ field: 'status', operator: 'equals', value: 'Pending' }],
                logic: 'AND'
              },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      icon: '✏️',
      title: 'Expense Approval Workflow',
      description: {
        feature: 'Allow managers to review and approve/reject expense reports',
        data: 'Expense approval status and optional rejection notes',
        action: 'Update the status field to Approved or Rejected and notify the employee',
      },
      forms: [
        {
          formId: 'approve-expense-form',
          formName: 'Approve/Reject Expense',
          formType: 'edit',
          whenToUse: 'Use this form to approve or reject an existing expense report. Toggle the approval status and optionally add notes explaining your decision.',
          modelName: 'ExpenseReport',
          fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt'],
        },
      ],
      models: [
        {
          modelName: 'ExpenseReport',
          fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt'],
        },
      ],
    },
    {
      icon: '🔄',
      title: 'Publish to Accounting',
      description: {
        feature: 'Mark expenses as published to accounting system',
        data: 'Published status flag',
        action: 'Update the published field to indicate the expense has been exported to accounting software',
      },
      forms: [
        {
          formId: 'publish-expense-form',
          formName: 'Publish to Accounting',
          formType: 'edit',
          whenToUse: 'Use this form after exporting expenses to your accounting system. Toggle the published status to mark expenses as processed.',
          modelName: 'ExpenseReport',
          fields: ['published', 'publishedAt', 'publishedBy'],
        },
      ],
      models: [
        {
          modelName: 'ExpenseReport',
          fields: ['published', 'publishedAt', 'publishedBy'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'AI Receipt Data Extraction',
      description: {
        feature: 'Automatically extract all relevant data from receipt images using OCR and AI',
        data: 'Receipt image from existing expense records',
        action: 'Use AI to scan the receipt image, extract vendor name, date, amount, currency, line items, and suggest appropriate expense category',
      },
      actions: [
        {
          actionId: 'extract-receipt-action',
          actionName: 'extractReceiptData',
          actionTitle: 'Extract Receipt Data',
          modelName: 'ExpenseReport',
          inputFields: ['receiptImage'],
          outputFields: ['vendor', 'date', 'amount', 'currency', 'category'],
        },
      ],
      models: [
        {
          modelName: 'ExpenseReport',
          fields: ['receiptImage', 'vendor', 'date', 'amount', 'currency', 'category'],
        },
      ],
    },
    {
      icon: '🤖',
      title: 'Automatic Categorization',
      description: {
        feature: 'Intelligently categorize expenses based on vendor and description',
        data: 'Vendor name, amount, and description from expense records',
        action: 'Use AI to analyze the expense details and assign the most appropriate category (Meals, Travel, Office, Entertainment, Equipment, Other)',
      },
      actions: [
        {
          actionId: 'categorize-expense-action',
          actionName: 'categorizeExpense',
          actionTitle: 'Categorize Expense',
          modelName: 'ExpenseReport',
          inputFields: ['vendor', 'amount', 'description'],
          outputFields: ['category'],
        },
      ],
      models: [
        {
          modelName: 'ExpenseReport',
          fields: ['vendor', 'amount', 'description', 'category'],
        },
      ],
      schedules: [
        {
          scheduleId: 'daily-categorization-schedule',
          name: 'Daily Auto-Categorization',
          description: 'Run daily to categorize uncategorized expenses',
          mode: 'recurring',
          intervalHours: 24,
          actionIds: ['categorize-expense-action'],
          steps: [
            {
              modelName: 'ExpenseReport',
              actionId: 'categorize-expense-action',
              actionName: 'categorizeExpense',
              actionTitle: 'Categorize Expense',
              query: {
                filters: [
                  { field: 'category', operator: 'equals', value: 'Other' },
                  { field: 'category', operator: 'is_empty', value: null }
                ],
                logic: 'OR'
              },
              order: 1,
            },
          ],
        },
      ],
    },
  ],
  howItWorks: [
    { order: 1, title: 'Upload Receipts', description: 'Take photos or upload receipt images' },
    { order: 2, title: 'AI Extracts Data', description: 'Date, amount, vendor, category extracted' },
    { order: 3, title: 'Review & Approve', description: 'Verify extracted information' },
    { order: 4, title: 'Export Reports', description: 'Generate reports for accounting' },
  ],
  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
      ],
      // CRITICAL: Default workspace is auto-created. NO forms needed (no OAuth connections).
      forms: [],
    },
    {
      name: 'ExpenseReport',
      description: 'Expense record with receipt data and categorization',
      fields: [
        { name: 'expenseId', type: 'text', label: 'Expense ID', required: true },
        { name: 'receiptImage', type: 'url', label: 'Receipt Image', required: true },
        { name: 'vendor', type: 'text', label: 'Vendor Name', required: true },
        { name: 'date', type: 'date', label: 'Expense Date', required: true },
        { name: 'amount', type: 'number', label: 'Amount', required: true },
        { name: 'currency', type: 'select', label: 'Currency', options: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'], defaultValue: 'USD' },
        { name: 'category', type: 'select', label: 'Category', options: ['Meals', 'Travel', 'Office', 'Entertainment', 'Equipment', 'Other'], required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'status', type: 'select', label: 'Status', options: ['Pending', 'Approved', 'Rejected', 'Reimbursed'], defaultValue: 'Pending' },
        { name: 'submittedBy', type: 'text', label: 'Submitted By', required: true },
        { name: 'approvalNotes', type: 'textarea', label: 'Approval Notes' },
        { name: 'approvedBy', type: 'text', label: 'Approved By' },
        { name: 'approvedAt', type: 'date', label: 'Approved At' },
        { name: 'published', type: 'boolean', label: 'Published to Accounting', defaultValue: false },
        { name: 'publishedAt', type: 'date', label: 'Published At' },
        { name: 'publishedBy', type: 'text', label: 'Published By' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      actions: [
        {
          name: 'extractReceiptData',
          title: 'Extract Receipt Data',
          emoji: '📸',
          description: 'Extract vendor, date, amount, and category from receipt image',
          modelName: 'ExpenseReport',
          inputFields: ['receiptImage'],
          outputFields: ['vendor', 'date', 'amount', 'currency', 'category'],
          steps: [
            {
              name: 'analyzeReceipt',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the receipt image and extract: vendor name, date, total amount, currency, and suggest an appropriate expense category (Meals, Travel, Office, Entertainment, Equipment, Other). Return structured data.',
                inputFields: ['receiptImage'],
                outputFields: ['vendor', 'date', 'amount', 'currency', 'category'],
                model: 'gpt-4o',
                temperature: 0.1,
              },
            },
          ],
        },
        {
          name: 'categorizeExpense',
          title: 'Categorize Expense',
          emoji: '🏷️',
          description: 'Intelligently categorize expense based on vendor and description',
          modelName: 'ExpenseReport',
          inputFields: ['vendor', 'amount', 'description'],
          outputFields: ['category'],
          steps: [
            {
              name: 'analyzeExpense',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Based on the vendor name, amount, and description, determine the most appropriate expense category: Meals, Travel, Office, Entertainment, Equipment, or Other.',
                inputFields: ['vendor', 'amount', 'description'],
                outputFields: ['category'],
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
      id: 'extract-receipt-schedule',
      name: 'Extract Receipt Data (Run Once)',
      description: 'Automatically process receipt after submission',
      mode: 'once',
      actionIds: ['extract-receipt-action'],
      steps: [
        {
          modelName: 'ExpenseReport',
          query: {
            filters: [{ field: 'status', operator: 'equals', value: 'Pending' }],
            logic: 'AND'
          },
          actionName: 'extractReceiptData',
          actionId: 'extract-receipt-action',
          order: 1,
        },
      ],
    },
    {
      id: 'daily-categorization-schedule',
      name: 'Daily Auto-Categorization',
      description: 'Run daily to categorize uncategorized expenses',
      mode: 'recurring',
      intervalHours: 24,
      actionIds: ['categorize-expense-action'],
      steps: [
        {
          modelName: 'ExpenseReport',
          query: {
            filters: [
              { field: 'category', operator: 'equals', value: 'Other' },
              { field: 'category', operator: 'is_empty', value: null }
            ],
            logic: 'OR'
          },
          actionName: 'categorizeExpense',
          actionId: 'categorize-expense-action',
          order: 1,
        },
      ],
    },
  ],
  usageCount: 943,
  viewCount: 3876,
  rating: 4.5,
  reviewCount: 38,
  createdAt: new Date('2024-11-01'),
  updatedAt: new Date('2024-12-20'),
  badges: [],
}

