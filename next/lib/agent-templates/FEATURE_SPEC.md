# Agent Template Feature Specification

## Core Principle: Feature-Driven Design

Every agent template is built from **Features**. Each feature represents a complete user capability and defines all the entities needed to make it work.

## CRITICAL: Workspace Pattern

**Default Workspace Record:**
- A default Workspace record is ALWAYS created automatically when an agent is created
- NEVER create a 'new' form for the Workspace model
- Workspace model always includes: name, description, and optional OAuth connection fields

**Workspace Forms:**
- NO 'new' form for Workspace (auto-created with default values)
- ONLY create an 'edit' form IF the agent uses external service connections (OAuth)
- The 'edit' form is ONLY for configuring OAuth connections, not for creating workspace

**Example (with connections):**
```typescript
{
  formId: 'workspace-connections',
  formName: 'Workspace Connections',
  formType: 'edit',
  whenToUse: 'Use this form to configure OAuth connections for external services like Google, X, Instagram, etc.',
  modelName: 'Workspace',
  fields: ['googleAuth', 'xAuth', 'instagramAuth']  // Only OAuth fields
}
```

**Example (no connections):**
```typescript
// NO forms at all for Workspace if no external connections
// Default workspace record is created automatically
```

## Feature Anatomy

A feature answers three questions:
1. **What** does the user want to accomplish?
2. **How** does the user interact with it (forms)?
3. **How** does AI automate it (schedules + actions)?

## Entity Relationships

```
Feature
├── Models (data structure)
│   ├── Fields (what data to store)
│   ├── Forms (how users input/edit data)
│   └── Actions (how AI processes data)
├── Schedules (automation workflows)
│   └── Steps (sequence of actions to execute)
└── Links (how everything connects)
    ├── Forms → Schedules (via scheduleId)
    ├── Schedules → Actions (via actionIds)
    └── Steps → Actions (via actionId)
```

## Rule 1: Define Features First

Start by listing all features your agent provides. Each feature should be specific and actionable.

### Good Feature Definitions:
- ✅ "Quick Expense Entry" - Submit expense with receipt
- ✅ "Expense Approval Workflow" - Approve/reject expenses
- ✅ "AI Receipt Data Extraction" - Auto-extract data from receipts

### Bad Feature Definitions:
- ❌ "Expense Management" - Too broad
- ❌ "Smart Forms" - Not specific
- ❌ "Automation" - Doesn't describe what it automates

## Rule 2: For Each Feature, Identify Required Entities

### 2.1 Models & Fields

**Question:** What data needs to be stored?

```typescript
models: [
  {
    modelName: 'ExpenseReport',
    fields: [
      // All fields that this feature reads or writes
      'receiptImage', 'vendor', 'amount', 'status', ...
    ]
  }
]
```

**Rule:** Include ALL fields the feature touches, even if created by other features.

### 2.2 Forms (User Input)

**Question:** How do users interact with this data?

Each feature can have 0-N forms:

#### NEW Forms (Create Records)
```typescript
{
  formId: 'new-expense-form',
  formName: 'New Expense',
  formType: 'new',  // Creates new records
  whenToUse: 'Fill this form when submitting a NEW expense report...',
  modelName: 'ExpenseReport',
  fields: ['receiptImage', 'vendor', 'amount', 'date'],  // Only input fields
  scheduleId: 'process-expense-schedule'  // Optional: trigger automation
}
```

**UI Location:** Data list page - shown when clicking "New Record" button

**When to create a NEW form:**
- ✅ User needs to create a new record
- ✅ Initial data entry
- ✅ Importing external data

**Important:** The "New Record" button only appears if there's at least one 'new' type form!

**Real Template Example:** See `expense-report.ts`, `lead-enrichment.ts`, `customer-support-analyzer.ts`

#### EDIT Forms (Update Records)
```typescript
{
  formId: 'approve-expense-form',
  formName: 'Approve/Reject Expense',
  formType: 'edit',  // Updates existing records
  whenToUse: 'Use this form to approve or reject an EXISTING expense report...',
  modelName: 'ExpenseReport',
  fields: ['status', 'approvalNotes', 'approvedBy'],  // Only editable fields
  scheduleId: 'notify-approval-schedule'  // Optional: trigger automation
}
```

**UI Location:** Record detail page - shown in "Quick Edit Forms" section

**When to create an EDIT form:**
- ✅ User needs to update specific fields
- ✅ Approval/rejection workflows
- ✅ Status changes
- ✅ Publishing/toggling boolean flags

**Important:** Edit forms only show fields being edited, not all record fields!

**Real Template Examples:**
- `expense-report.ts` - "Approve/Reject Expense" updates approval fields only
- `lead-enrichment.ts` - "Qualify Lead" updates status and notes
- `product-descriptions.ts` - "Update Product Status" updates status field
- `customer-support-analyzer.ts` - "Update Ticket" updates status and assignment

**Form Field Selection Rules:**
- NEW forms: Include all user-input fields (exclude auto-generated like ID, timestamps)
- EDIT forms: Include ONLY the fields being edited (not the full record)
- Both: Can optionally trigger a schedule upon submission

**Schedule Modes:**
- NEW forms with scheduleId → use mode: 'once' (runs after form submission)
- EDIT forms with scheduleId → use mode: 'once' (rare, for regeneration)
- Background automation → use mode: 'recurring' (periodic processing)

### 2.3 Actions (AI Processing)

**Question:** What AI operations does this feature need?

Each action is a complete AI workflow with steps:

```typescript
{
  name: 'extractReceiptData',           // Unique action name
  title: 'Extract Receipt Data',        // Display title
  emoji: '📸',                           // Icon for UI
  description: 'Extract vendor, date, amount from receipt image',
  modelName: 'ExpenseReport',            // Which model it operates on
  inputFields: ['receiptImage'],         // What it reads
  outputFields: ['vendor', 'date', 'amount', 'currency'],  // What it writes
  steps: [                               // AI workflow steps
    {
      name: 'analyzeReceipt',
      type: 'ai_reasoning',              // Step type
      order: '1',
      config: {
        prompt: 'Analyze the receipt image and extract...',
        inputFields: ['receiptImage'],
        outputFields: ['vendor', 'date', 'amount', 'currency'],
        model: 'gpt-4o',
        temperature: 0.1
      }
    }
  ]
}
```

**Action Step Types:**
1. `ai_reasoning` - Use LLM to analyze/generate content
2. `web_search` - Search the web for information
3. `custom` - Custom code execution
4. `image_generation` - Generate images

**Multi-Step Actions:**
Actions can have multiple steps that run sequentially:

```typescript
steps: [
  {
    name: 'searchData',
    type: 'web_search',
    order: '1',
    config: { searchQuery: 'Find company information...' }
  },
  {
    name: 'processData',
    type: 'ai_reasoning',
    order: '2',
    config: { prompt: 'Analyze the search results...' }
  }
]
```

### 2.4 Schedules (Automation)

**Question:** When should the AI actions run?

#### Run-Once Schedules (Triggered)
Execute immediately after a form submission or event:

```typescript
{
  id: 'process-expense-schedule',
  name: 'Process New Expense',
  description: 'Auto-extract data after expense submission',
  mode: 'once',
  actionIds: ['extract-receipt-action', 'categorize-expense-action'],
  steps: [
    {
      modelName: 'ExpenseReport',
      actionId: 'extract-receipt-action',
      actionName: 'extractReceiptData',
      actionTitle: 'Extract Receipt Data',
      query: 'status equals "Pending"',  // Filter which records
      order: 1
    },
    {
      modelName: 'ExpenseReport',
      actionId: 'categorize-expense-action',
      actionName: 'categorizeExpense',
      actionTitle: 'Categorize Expense',
      query: 'status equals "Pending"',
      order: 2
    }
  ]
}
```

**When to use Run-Once:**
- ✅ Process data immediately after form submission
- ✅ Initial setup/enrichment of new records
- ✅ One-time data transformations

#### Recurring Schedules (Automated)
Run periodically on a schedule:

```typescript
{
  id: 'daily-categorization-schedule',
  name: 'Daily Auto-Categorization',
  description: 'Categorize uncategorized expenses daily',
  mode: 'recurring',
  intervalHours: 24,
  actionIds: ['categorize-expense-action'],
  steps: [
    {
      modelName: 'ExpenseReport',
      actionId: 'categorize-expense-action',
      actionName: 'categorizeExpense',
      actionTitle: 'Categorize Expense',
      query: 'category equals "Other" OR category is empty',
      order: 1
    }
  ]
}
```

**When to use Recurring:**
- ✅ Periodic data processing (daily, weekly, monthly)
- ✅ Ongoing monitoring and updates
- ✅ Batch operations on multiple records

## Rule 3: Link Everything with IDs

All entities are stored in their own fields and linked only by ID:

```
┌─────────────┐
│    Form     │
│ scheduleId  │─────┐
└─────────────┘     │
                    ▼
              ┌──────────────┐
              │   Schedule   │
              │  actionIds[] │────┐
              └──────────────┘    │
                                  ▼
                            ┌───────────┐
                            │  Actions  │
                            │  steps[]  │
                            └───────────┘
```

**Storage Rule:** Each entity stores its complete data in its own field:
- Forms store form configuration
- Schedules store schedule configuration + actionIds
- Actions store action logic + steps
- Models store data fields

**Linking Rule:** Entities reference each other ONLY by ID:
- Forms reference schedules via `scheduleId`
- Schedules reference actions via `actionIds` array
- Schedule steps reference actions via `actionId`

## Rule 4: Feature Examples Must Be Complete

Every feature in the `features` array should show:

1. **Simple feature** (just description):
```typescript
{
  icon: '📸',
  title: 'Receipt Scanning',
  description: 'AI extracts data from receipt images'
}
```

2. **Detailed feature** (complete workflow):
```typescript
{
  icon: '⚡',
  title: 'Quick Expense Entry',
  description: {
    feature: 'Allow employees to quickly submit expense reports',
    data: 'Receipt image, vendor name, amount, date',
    action: 'Create record, validate, trigger AI extraction'
  },
  forms: [
    {
      formId: 'new-expense-form',
      formName: 'New Expense',
      formType: 'new',
      whenToUse: 'When submitting a NEW expense...',
      modelName: 'ExpenseReport',
      fields: ['receiptImage', 'vendor', 'amount', 'date'],
      scheduleId: 'process-expense-schedule'
    }
  ],
  models: [
    {
      modelName: 'ExpenseReport',
      fields: ['expenseId', 'receiptImage', 'vendor', ...all touched fields]
    }
  ],
  actions: [
    {
      actionId: 'extract-receipt-action',
      actionName: 'extractReceiptData',
      actionTitle: 'Extract Receipt Data',
      modelName: 'ExpenseReport',
      inputFields: ['receiptImage'],
      outputFields: ['vendor', 'date', 'amount', 'currency']
    }
  ],
  schedules: [
    {
      scheduleId: 'process-expense-schedule',
      name: 'Process New Expense',
      mode: 'once',
      actionIds: ['extract-receipt-action'],
      steps: [...]
    }
  ]
}
```

## Rule 5: Model Definitions Must Match Features

In the `models` section at template level, ensure:

1. **All fields from features are defined**:
```typescript
models: [
  {
    name: 'ExpenseReport',
    fields: [
      // Every field mentioned in ANY feature for this model
      { name: 'expenseId', type: 'text', label: 'Expense ID', required: true },
      { name: 'receiptImage', type: 'url', label: 'Receipt Image', required: true },
      { name: 'vendor', type: 'text', label: 'Vendor Name' },
      { name: 'status', type: 'select', label: 'Status', 
        options: ['Pending', 'Approved', 'Rejected'], defaultValue: 'Pending' },
      // ... all other fields
    ],
    actions: [
      // ALL actions that operate on this model (from all features)
      // Each action must have complete steps
    ]
  }
]
```

2. **Forms reference the model**:
```typescript
forms: [
  // All forms that create/edit this model (from all features)
  {
    id: 'new-expense-form',
    name: 'New Expense',
    formType: 'new',
    whenToUse: '...',
    modelName: 'ExpenseReport',
    fields: ['receiptImage', 'vendor', 'amount', 'date']
  }
]
```

3. **Actions are complete with steps**:
```typescript
actions: [
  {
    name: 'extractReceiptData',
    title: 'Extract Receipt Data',
    emoji: '📸',
    description: '...',
    modelName: 'ExpenseReport',
    inputFields: ['receiptImage'],
    outputFields: ['vendor', 'date', 'amount'],
    steps: [
      {
        name: 'analyzeReceipt',
        type: 'ai_reasoning',
        order: '1',
        config: { /* complete config */ }
      }
    ]
  }
]
```

## Complete Feature Example: "Expense Management"

### Feature 1: Quick Expense Entry (NEW)
**User Action:** Submit new expense
**Data Flow:** Form → Schedule (once) → Action (extract data)

```typescript
{
  icon: '⚡',
  title: 'Quick Expense Entry',
  description: {
    feature: 'Submit expense reports quickly with receipt photos',
    data: 'Receipt image, vendor, amount, date, category',
    action: 'Create expense record and auto-extract data from receipt'
  },
  
  // User fills this form
  forms: [{
    formId: 'new-expense-form',
    formName: 'New Expense',
    formType: 'new',
    whenToUse: 'Fill this form when submitting a NEW expense report. Upload receipt and provide basic details.',
    modelName: 'ExpenseReport',
    fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
    scheduleId: 'extract-receipt-schedule'  // Triggers automation
  }],
  
  // Data stored here
  models: [{
    modelName: 'ExpenseReport',
    fields: ['expenseId', 'receiptImage', 'vendor', 'amount', 'date', 'category', 'status', 'createdAt']
  }],
  
  // AI processes the data
  actions: [{
    actionId: 'extract-receipt-action',
    actionName: 'extractReceiptData',
    actionTitle: 'Extract Receipt Data',
    modelName: 'ExpenseReport',
    inputFields: ['receiptImage'],
    outputFields: ['vendor', 'date', 'amount', 'currency', 'category']
  }],
  
  // Automation workflow
  schedules: [{
    scheduleId: 'extract-receipt-schedule',
    name: 'Extract Receipt Data',
    description: 'Auto-extract data after expense submission',
    mode: 'once',
    actionIds: ['extract-receipt-action'],
    steps: [{
      modelName: 'ExpenseReport',
      actionId: 'extract-receipt-action',
      actionName: 'extractReceiptData',
      actionTitle: 'Extract Receipt Data',
      query: 'status equals "Pending"',
      order: 1
    }]
  }]
}
```

### Feature 2: Expense Approval (EDIT)
**User Action:** Approve/reject existing expense
**Data Flow:** Form → Updates record

```typescript
{
  icon: '✅',
  title: 'Expense Approval Workflow',
  description: {
    feature: 'Approve or reject submitted expense reports',
    data: 'Approval status, notes, approver name',
    action: 'Update expense status and notify employee'
  },
  
  // Manager uses this form
  forms: [{
    formId: 'approve-expense-form',
    formName: 'Approve/Reject Expense',
    formType: 'edit',
    whenToUse: 'Use this form to approve or reject an EXISTING expense report. Toggle approval status and add notes.',
    modelName: 'ExpenseReport',
    fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt']
  }],
  
  // Same model, different fields
  models: [{
    modelName: 'ExpenseReport',
    fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt']
  }]
  
  // No actions or schedules for this feature (pure manual edit)
}
```

### Feature 3: Auto-Categorization (AI ONLY)
**User Action:** None (fully automated)
**Data Flow:** Schedule (recurring) → Action (categorize)

```typescript
{
  icon: '🤖',
  title: 'Automatic Categorization',
  description: {
    feature: 'Intelligently categorize expenses based on vendor',
    data: 'Vendor name, amount, description',
    action: 'AI assigns appropriate expense category'
  },
  
  // No forms (fully automated)
  
  // AI reads/writes these fields
  models: [{
    modelName: 'ExpenseReport',
    fields: ['vendor', 'amount', 'description', 'category']
  }],
  
  // AI processing logic
  actions: [{
    actionId: 'categorize-expense-action',
    actionName: 'categorizeExpense',
    actionTitle: 'Categorize Expense',
    modelName: 'ExpenseReport',
    inputFields: ['vendor', 'amount', 'description'],
    outputFields: ['category']
  }],
  
  // Runs daily to catch uncategorized expenses
  schedules: [{
    scheduleId: 'daily-categorization-schedule',
    name: 'Daily Auto-Categorization',
    description: 'Categorize uncategorized expenses daily',
    mode: 'recurring',
    intervalHours: 24,
    actionIds: ['categorize-expense-action'],
    steps: [{
      modelName: 'ExpenseReport',
      actionId: 'categorize-expense-action',
      actionName: 'categorizeExpense',
      actionTitle: 'Categorize Expense',
      query: 'category equals "Other" OR category is empty',
      order: 1
    }]
  }]
}
```

## Checklist: Creating a New Feature

- [ ] Define what the feature accomplishes (clear title + description)
- [ ] Identify the model and all fields it touches
- [ ] Determine if users need forms:
  - [ ] NEW form for creating records?
  - [ ] EDIT form(s) for updating records?
  - [ ] Each form has `formType` and `whenToUse`
- [ ] Determine if AI processing is needed:
  - [ ] Create action(s) with complete steps
  - [ ] Each action has unique ID
- [ ] Determine when AI should run:
  - [ ] Run-once schedule after form submission?
  - [ ] Recurring schedule for batch processing?
  - [ ] Each schedule has unique ID
- [ ] Link everything:
  - [ ] Forms reference schedules via `scheduleId`
  - [ ] Schedules reference actions via `actionIds`
  - [ ] Steps reference actions via `actionId`
- [ ] Update model definition:
  - [ ] All fields defined with types
  - [ ] All forms listed
  - [ ] All actions listed with complete steps

## Anti-Patterns to Avoid

❌ **Don't create forms without specifying type:**
```typescript
forms: [{ formId: 'expense-form', fields: [...] }]  // Missing formType!
```

❌ **Don't create schedules without IDs:**
```typescript
schedules: [{ name: 'Process', mode: 'once' }]  // Missing id!
```

❌ **Don't create actions without steps:**
```typescript
actions: [{ name: 'process', inputFields: [...] }]  // Missing steps!
```

❌ **Don't mix concerns in one form:**
```typescript
// Bad: One form trying to do creation AND editing
formType: 'new',
fields: ['name', 'status', 'approvalNotes']  // Mix of creation and approval fields
```

✅ **Do separate concerns:**
```typescript
// Good: Separate forms for different purposes
{ formId: 'new-form', formType: 'new', fields: ['name', 'description'] }
{ formId: 'approve-form', formType: 'edit', fields: ['status', 'approvalNotes'] }
```

