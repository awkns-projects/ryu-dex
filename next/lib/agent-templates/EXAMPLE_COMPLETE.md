# Complete Template Example: Expense Report System

This is a comprehensive example showing how to build a complete agent template following the Feature Specification rules.

## Feature Analysis

**Agent Purpose:** Automate expense report submission, processing, and approval

**Features to Build:**
1. **Quick Expense Entry** (Form NEW → Schedule ONCE → Action)
2. **Expense Approval** (Form EDIT → Updates)
3. **Publish to Accounting** (Form EDIT → Toggle)
4. **AI Receipt Extraction** (Action only)
5. **Auto-Categorization** (Schedule RECURRING → Action)

## Step 1: Define Models & Fields

First, identify ALL fields needed across ALL features:

```typescript
models: [
  {
    name: 'Workspace',
    description: 'Default workspace configuration (auto-created)',
    fields: [
      { name: 'name', type: 'text', label: 'Workspace Name', required: true },
      { name: 'description', type: 'textarea', label: 'Description' }
      // Note: Add OAuth connection fields here if using external services
      // e.g., { name: 'googleAuth', type: 'oauth', label: 'Google Connection', oauthProvider: 'google' }
    ],
    forms: [
      // CRITICAL: NO 'new' form for Workspace - default record is auto-created!
      // Only include 'edit' form if OAuth connections exist:
      // {
      //   id: 'workspace-connections',
      //   name: 'Workspace Connections',
      //   formType: 'edit',
      //   whenToUse: 'Configure OAuth connections for external services',
      //   modelName: 'Workspace',
      //   fields: ['googleAuth', 'xAuth']  // Only OAuth fields
      // }
    ]
  },
  {
    name: 'ExpenseReport',
    description: 'Expense record with receipt data and categorization',
    fields: [
      // Identity
      { name: 'expenseId', type: 'text', label: 'Expense ID', required: true },
      
      // Receipt data (from Feature 1: Quick Entry)
      { name: 'receiptImage', type: 'url', label: 'Receipt Image', required: true },
      { name: 'vendor', type: 'text', label: 'Vendor Name', required: true },
      { name: 'date', type: 'date', label: 'Expense Date', required: true },
      { name: 'amount', type: 'number', label: 'Amount', required: true },
      { name: 'currency', type: 'select', label: 'Currency', 
        options: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'], 
        defaultValue: 'USD' },
      
      // Categorization (from Feature 5: Auto-Categorization)
      { name: 'category', type: 'select', label: 'Category', 
        options: ['Meals', 'Travel', 'Office', 'Entertainment', 'Equipment', 'Other'], 
        required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      
      // Workflow status
      { name: 'status', type: 'select', label: 'Status', 
        options: ['Pending', 'Approved', 'Rejected', 'Reimbursed'], 
        defaultValue: 'Pending' },
      { name: 'submittedBy', type: 'text', label: 'Submitted By', required: true },
      
      // Approval fields (from Feature 2: Expense Approval)
      { name: 'approvalNotes', type: 'textarea', label: 'Approval Notes' },
      { name: 'approvedBy', type: 'text', label: 'Approved By' },
      { name: 'approvedAt', type: 'date', label: 'Approved At' },
      
      // Publishing fields (from Feature 3: Publish to Accounting)
      { name: 'published', type: 'boolean', label: 'Published to Accounting', defaultValue: false },
      { name: 'publishedAt', type: 'date', label: 'Published At' },
      { name: 'publishedBy', type: 'text', label: 'Published By' },
      
      // System fields
      { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
      { name: 'createdAt', type: 'date', label: 'Created At' },
      { name: 'updatedAt', type: 'date', label: 'Updated At' }
    ],
    
    // ALL forms for this model (from all features)
    forms: [
      {
        id: 'new-expense-form',
        name: 'New Expense',
        description: 'Submit a new expense report',
        icon: '⚡',
        formType: 'new',
        whenToUse: 'Fill this form when submitting a NEW expense report. Upload your receipt and provide basic details like vendor, amount, and date.',
        modelName: 'ExpenseReport',
        fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
        scheduleId: 'extract-receipt-schedule'
      },
      {
        id: 'approve-expense-form',
        name: 'Approve/Reject Expense',
        description: 'Approve or reject submitted expenses',
        icon: '✅',
        formType: 'edit',
        whenToUse: 'Use this form to approve or reject an EXISTING expense report. Toggle the approval status and optionally add notes explaining your decision.',
        modelName: 'ExpenseReport',
        fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt']
      },
      {
        id: 'publish-expense-form',
        name: 'Publish to Accounting',
        description: 'Mark expenses as published',
        icon: '🔄',
        formType: 'edit',
        whenToUse: 'Use this form AFTER exporting expenses to your accounting system. Toggle the published status to mark expenses as processed.',
        modelName: 'ExpenseReport',
        fields: ['published', 'publishedAt', 'publishedBy']
      }
    ],
    
    // ALL actions for this model (from all features)
    actions: [
      {
        name: 'extractReceiptData',
        title: 'Extract Receipt Data',
        emoji: '📸',
        description: 'Extract vendor, date, amount, and category from receipt image using AI',
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
              temperature: 0.1
            }
          }
        ]
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
              temperature: 0.2
            }
          }
        ]
      }
    ]
  }
]
```

## Step 2: Define Features with Complete Workflows

### Feature 1: Quick Expense Entry (NEW → AUTOMATION)

```typescript
{
  icon: '⚡',
  title: 'Quick Expense Entry',
  description: {
    feature: 'Allow employees to quickly submit expense reports with receipt photos',
    data: 'Receipt image, vendor name, amount, date, and expense category',
    action: 'Create a new expense record with unique ID and timestamp, set initial status to "Pending", then trigger AI to extract receipt data'
  },
  
  // 1. User fills NEW form
  forms: [{
    formId: 'new-expense-form',
    formName: 'New Expense',
    formType: 'new',
    whenToUse: 'Fill this form when submitting a NEW expense report. Upload your receipt and provide basic details like vendor, amount, and date.',
    modelName: 'ExpenseReport',
    fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
    scheduleId: 'extract-receipt-schedule'  // Links to automation
  }],
  
  // 2. Data stored in model
  models: [{
    modelName: 'ExpenseReport',
    fields: ['expenseId', 'receiptImage', 'vendor', 'amount', 'date', 'category', 'status', 'createdAt']
  }],
  
  // 3. AI processes via action
  actions: [{
    actionId: 'extract-receipt-action',
    actionName: 'extractReceiptData',
    actionTitle: 'Extract Receipt Data',
    modelName: 'ExpenseReport',
    inputFields: ['receiptImage'],
    outputFields: ['vendor', 'date', 'amount', 'currency', 'category']
  }],
  
  // 4. Schedule triggers action
  schedules: [{
    scheduleId: 'extract-receipt-schedule',
    name: 'Extract Receipt Data',
    description: 'Automatically process receipt after submission',
    mode: 'once',  // Runs once after form submission
    actionIds: ['extract-receipt-action'],
    steps: [{
      modelName: 'ExpenseReport',
      actionId: 'extract-receipt-action',
      actionName: 'extractReceiptData',
      actionTitle: 'Extract Receipt Data',
      query: 'status equals "Pending"',  // Only new pending expenses
      order: 1
    }]
  }]
}
```

**Flow:**
1. User fills "New Expense" form → Creates ExpenseReport record
2. Form submission triggers `extract-receipt-schedule`
3. Schedule runs `extract-receipt-action`
4. Action extracts data from receipt and updates record

### Feature 2: Expense Approval (EDIT only, no automation)

```typescript
{
  icon: '✅',
  title: 'Expense Approval Workflow',
  description: {
    feature: 'Allow managers to review and approve/reject expense reports',
    data: 'Expense approval status and optional rejection notes',
    action: 'Update the status field to Approved or Rejected and notify the employee'
  },
  
  // Only EDIT form, no automation
  forms: [{
    formId: 'approve-expense-form',
    formName: 'Approve/Reject Expense',
    formType: 'edit',
    whenToUse: 'Use this form to approve or reject an EXISTING expense report. Toggle the approval status and optionally add notes explaining your decision.',
    modelName: 'ExpenseReport',
    fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt']
  }],
  
  // Fields being edited
  models: [{
    modelName: 'ExpenseReport',
    fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt']
  }]
  
  // No actions or schedules (pure manual edit)
}
```

**Flow:**
1. Manager finds expense record
2. Opens "Approve/Reject Expense" form
3. Updates status and adds notes
4. Record updated (no automation)

### Feature 3: Publish to Accounting (EDIT only)

```typescript
{
  icon: '🔄',
  title: 'Publish to Accounting',
  description: {
    feature: 'Mark expenses as published to accounting system',
    data: 'Published status flag',
    action: 'Update the published field to indicate the expense has been exported to accounting software'
  },
  
  // Boolean toggle form
  forms: [{
    formId: 'publish-expense-form',
    formName: 'Publish to Accounting',
    formType: 'edit',
    whenToUse: 'Use this form AFTER exporting expenses to your accounting system. Toggle the published status to mark expenses as processed.',
    modelName: 'ExpenseReport',
    fields: ['published', 'publishedAt', 'publishedBy']
  }],
  
  models: [{
    modelName: 'ExpenseReport',
    fields: ['published', 'publishedAt', 'publishedBy']
  }]
}
```

**Flow:**
1. Accountant exports expenses to QuickBooks/Xero
2. Opens "Publish to Accounting" form for each expense
3. Toggles `published` to true
4. Record marked as published

### Feature 4: AI Receipt Data Extraction (ACTION only, referenced by Feature 1)

```typescript
{
  icon: '🤖',
  title: 'AI Receipt Data Extraction',
  description: {
    feature: 'Automatically extract all relevant data from receipt images using OCR and AI',
    data: 'Receipt image from existing expense records',
    action: 'Use AI to scan the receipt image, extract vendor name, date, amount, currency, line items, and suggest appropriate expense category'
  },
  
  // No forms (used by schedule from Feature 1)
  
  // Action definition
  actions: [{
    actionId: 'extract-receipt-action',
    actionName: 'extractReceiptData',
    actionTitle: 'Extract Receipt Data',
    modelName: 'ExpenseReport',
    inputFields: ['receiptImage'],
    outputFields: ['vendor', 'date', 'amount', 'currency', 'category']
  }],
  
  models: [{
    modelName: 'ExpenseReport',
    fields: ['receiptImage', 'vendor', 'date', 'amount', 'currency', 'category']
  }]
}
```

**Note:** This action is referenced by the schedule in Feature 1

### Feature 5: Automatic Categorization (RECURRING schedule → ACTION)

```typescript
{
  icon: '🤖',
  title: 'Automatic Categorization',
  description: {
    feature: 'Intelligently categorize expenses based on vendor and description',
    data: 'Vendor name, amount, and description from expense records',
    action: 'Use AI to analyze the expense details and assign the most appropriate category (Meals, Travel, Office, Entertainment, Equipment, Other)'
  },
  
  // No forms (fully automated)
  
  // AI action
  actions: [{
    actionId: 'categorize-expense-action',
    actionName: 'categorizeExpense',
    actionTitle: 'Categorize Expense',
    modelName: 'ExpenseReport',
    inputFields: ['vendor', 'amount', 'description'],
    outputFields: ['category']
  }],
  
  models: [{
    modelName: 'ExpenseReport',
    fields: ['vendor', 'amount', 'description', 'category']
  }],
  
  // Recurring schedule
  schedules: [{
    scheduleId: 'daily-categorization-schedule',
    name: 'Daily Auto-Categorization',
    description: 'Run daily to categorize uncategorized expenses',
    mode: 'recurring',
    intervalHours: 24,
    actionIds: ['categorize-expense-action'],
    steps: [{
      modelName: 'ExpenseReport',
      actionId: 'categorize-expense-action',
      actionName: 'categorizeExpense',
      actionTitle: 'Categorize Expense',
      query: 'category equals "Other" OR category is empty',  // Only uncategorized
      order: 1
    }]
  }]
}
```

**Flow:**
1. Schedule runs every 24 hours
2. Finds expenses where category is "Other" or empty
3. Runs `categorize-expense-action` on each
4. Updates category field

## Step 3: Define Top-Level Schedules

Consolidate all schedules at the template level:

```typescript
schedules: [
  // From Feature 1 (run once after form submission)
  {
    id: 'extract-receipt-schedule',
    name: 'Extract Receipt Data (Run Once)',
    description: 'Automatically extract data from receipt images after expense submission',
    mode: 'once',
    actionIds: ['extract-receipt-action']
  },
  
  // From Feature 5 (recurring daily)
  {
    id: 'daily-categorization-schedule',
    name: 'Daily Auto-Categorization',
    description: 'Run daily to categorize uncategorized expenses',
    mode: 'recurring',
    intervalHours: 24,
    actionIds: ['categorize-expense-action']
  },
  
  // Additional recurring schedule
  {
    id: 'monthly-report-schedule',
    name: 'Generate Monthly Report',
    description: 'Automatically generate expense summary reports at the end of each month',
    mode: 'recurring',
    intervalHours: 720, // Monthly (30 days)
    actionIds: [] // Could add report generation action
  }
]
```

## Complete Feature Summary

| Feature | Forms | Actions | Schedules | Flow Type |
|---------|-------|---------|-----------|-----------|
| Quick Expense Entry | NEW form | extract-receipt-action | once (triggered) | Form → Schedule → Action |
| Expense Approval | EDIT form | none | none | Form → Update |
| Publish to Accounting | EDIT form | none | none | Form → Update |
| AI Receipt Extraction | none | extract-receipt-action | (used by Feature 1) | Referenced by schedule |
| Auto-Categorization | none | categorize-expense-action | recurring (daily) | Schedule → Action |

## Entity Relationships Diagram

```
┌─────────────────────┐
│  NEW EXPENSE FORM   │
│  (new-expense)      │
└──────────┬──────────┘
           │ scheduleId: extract-receipt-schedule
           ▼
    ┌──────────────────────┐
    │  EXTRACT SCHEDULE    │
    │  (run once)          │
    └──────────┬───────────┘
               │ actionIds: [extract-receipt-action]
               ▼
        ┌─────────────────────┐
        │  EXTRACT ACTION     │
        │  (with AI steps)    │
        └─────────────────────┘

┌─────────────────────┐
│ DAILY SCHEDULE      │
│ (recurring)         │
└──────────┬──────────┘
           │ actionIds: [categorize-expense-action]
           ▼
    ┌──────────────────────┐
    │ CATEGORIZE ACTION    │
    │ (with AI steps)      │
    └──────────────────────┘

┌─────────────────────┐      ┌─────────────────────┐
│ APPROVE FORM        │      │ PUBLISH FORM        │
│ (edit only)         │      │ (edit only)         │
└──────────┬──────────┘      └──────────┬──────────┘
           │                             │
           ▼                             ▼
    ┌──────────────────────────────────────┐
    │      EXPENSE REPORT MODEL            │
    │  (all fields, forms, actions)        │
    └──────────────────────────────────────┘
```

## Key Takeaways

1. **Think Features First** - Each feature is a complete user capability
2. **Forms are for Humans** - NEW creates, EDIT updates specific fields
3. **Actions are for AI** - Always have complete steps
4. **Schedules Connect Everything** - Link forms to actions via schedules
5. **IDs are the Glue** - Everything linked by ID, not nested data
6. **Models are the Source of Truth** - All fields, all forms, all actions in one place

