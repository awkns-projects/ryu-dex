# Agent Templates - Documentation

## 🚨 CRITICAL: Workspace Pattern

**Every agent automatically gets a default Workspace record created on initialization.**

### ❌ NEVER Do This:
```typescript
// WRONG: 'new' form for Workspace
{
  formId: 'workspace-setup',
  formType: 'new',  // ❌ NEVER use 'new' for Workspace!
  modelName: 'Workspace'
}
```

### ✅ Correct Patterns:

**If your agent uses OAuth connections (Google, X, Instagram, etc.):**
```typescript
// Workspace model with OAuth fields
{
  name: 'Workspace',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'googleAuth', type: 'oauth', oauthProvider: 'google' },
    { name: 'xAuth', type: 'oauth', oauthProvider: 'x' }
  ],
  forms: [
    {
      formId: 'workspace-connections',
      formName: 'Workspace Connections',
      formType: 'edit',  // ✅ EDIT form for OAuth connections
      whenToUse: 'Configure OAuth connections for external services',
      modelName: 'Workspace',
      fields: ['googleAuth', 'xAuth']  // Only OAuth fields
    }
  ]
}
```

**If your agent has NO OAuth connections:**
```typescript
// Workspace model without OAuth
{
  name: 'Workspace',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'description', type: 'textarea' }
  ],
  forms: []  // ✅ NO forms - workspace is auto-created
}
```

## 📚 Documentation

**Read these in order:**

1. **[FEATURE_SPEC.md](./FEATURE_SPEC.md)** - Complete specification and rules
   - **Workspace Pattern** (CRITICAL - READ FIRST!)
   - Feature-driven design principles
   - Entity relationships and linking
   - Form types (NEW vs EDIT)
   - Schedule types (once vs recurring)
   - Action structure with steps
   - Complete checklists and anti-patterns

2. **[EXAMPLE_COMPLETE.md](./EXAMPLE_COMPLETE.md)** - Full working example
   - Complete Expense Report system
   - 5 features with different patterns
   - Step-by-step breakdown
   - Entity relationship diagrams

3. **This README** - Quick reference and migration guide

## Overview
All agent templates follow a unified **feature-driven structure** where **forms**, **schedules**, and **actions** are properly typed and linked by IDs. This ensures data consistency and clear relationships between entities.

## Key Changes

### 1. Forms Now Have Types
Every form must specify:
- **`formType`**: Either `'new'` (for creating records) or `'edit'` (for updating existing records)
- **`whenToUse`**: Clear description of when to use this form
- **`scheduleId`** (optional): ID of a schedule to trigger when form is submitted

**UI Behavior Based on formType:**
- **NEW forms (`formType: 'new'`)**: 
  - Shown on the data list page when clicking "New Record" button
  - The "New Record" button only appears if there's at least one 'new' form
  - Used to create new records from scratch
  
- **EDIT forms (`formType: 'edit'`)**: 
  - Shown ONLY on the record detail page in the "Quick Edit Forms" section
  - Used to update specific fields in existing records
  - Perfect for workflows like approvals, status updates, or publishing

#### Example - New Form (from expense-report.ts):
```typescript
{
  formId: 'new-expense-form',
  formName: 'New Expense',
  formType: 'new',
  whenToUse: 'Fill this form when submitting a new expense report. Upload your receipt and provide basic details like vendor, amount, and date.',
  modelName: 'ExpenseReport',
  fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
  scheduleId: 'extract-receipt-schedule', // Triggers this schedule after submission
}
```

#### Example - Edit Form (from lead-enrichment.ts):
```typescript
{
  formId: 'edit-lead-qualification',
  formName: 'Qualify Lead',
  formType: 'edit',
  whenToUse: 'Use this form after reviewing a lead to mark them as qualified or unqualified. Add notes explaining your decision.',
  modelName: 'Lead',
  fields: ['status', 'notes', 'assignedTo'],
  // No scheduleId - manual approval workflow
}
```

See these templates for complete examples:
- `expense-report.ts` - NEW + multiple EDIT forms
- `lead-enrichment.ts` - NEW with enrichment + EDIT for qualification
- `customer-support-analyzer.ts` - NEW with analysis + EDIT for updates
- `product-descriptions.ts` - NEW with generation + EDIT for status/preferences

### 2. Schedules Must Have IDs
Every schedule requires a unique `id` for linking:
- **`id`**: Unique identifier (e.g., 'extract-receipt-schedule')
- **`actionIds`**: Array of action IDs this schedule executes
- **Schedule steps** must include `actionId` to reference specific actions

#### Example - Run Once Schedule:
```typescript
{
  id: 'extract-receipt-schedule',
  name: 'Extract Receipt Data (Run Once)',
  description: 'Automatically extract data from receipt images after expense submission',
  mode: 'once',
  actionIds: ['extract-receipt-action'],
  steps: [
    {
      modelName: 'ExpenseReport',
      actionId: 'extract-receipt-action',
      actionName: 'extractReceiptData',
      actionTitle: 'Extract Receipt Data',
      query: 'status equals "Pending"',
      order: 1,
    },
  ],
}
```

#### Example - Recurring Schedule:
```typescript
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
      actionId: 'categorize-expense-action',
      actionName: 'categorizeExpense',
      actionTitle: 'Categorize Expense',
      query: 'category equals "Other" OR category is empty',
      order: 1,
    },
  ],
}
```

### 3. Actions Must Have Steps
All actions in the `models` section must be complete `ActionTemplate` objects with:
- **`name`**: Action name (used for references)
- **`title`**: Display title
- **`emoji`**: Icon for UI
- **`description`**: What the action does
- **`modelName`**: Which model it operates on
- **`inputFields`**: Array of input field names
- **`outputFields`**: Array of output field names
- **`steps`**: Array of `StepTemplate` objects (AI reasoning, web search, custom code, etc.)

#### Example Action:
```typescript
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
}
```

### 4. Linking System
All entities are stored in their fields and linked by ID:

```
Form (scheduleId) → Schedule (actionIds) → Actions
  ↓                      ↓                      ↓
Stored in field    Stored in field        Stored in field
```

Example flow:
1. User fills "New Expense" form (formId: 'new-expense-form')
2. Form triggers schedule (scheduleId: 'extract-receipt-schedule')
3. Schedule executes action (actionId: 'extract-receipt-action')
4. Action runs its steps to process the data

## Updated Templates ✅

The following templates have been updated with the new structure:
- ✅ `expense-report.ts` - Complete with new/edit forms, schedules, and actions
- ✅ `customer-support.ts` - Multiple form types for creating and editing tickets
- ✅ `email-analyzer.ts` - Campaign forms with analysis schedules
- ✅ `lead-enrichment.ts` - Lead capture with enrichment workflow
- ✅ `product-descriptions.ts` - Product forms with description generation
- ✅ `seo-optimizer.ts` - SEO content with keyword research workflow

## Templates Needing Updates

The following templates still need to be updated:
- ⚠️ `trading-bot.ts` - 115 linting errors (missing formType, whenToUse, actionId, schedule id)
- Plus several other templates with similar issues

## Migration Pattern

To update a template:

1. **Add formType and whenToUse to all forms**:
   ```typescript
   formType: 'new', // or 'edit'
   whenToUse: 'Description of when to use this form',
   ```

2. **Add id to all schedules**:
   ```typescript
   id: 'schedule-unique-id',
   ```

3. **Add actionId to all schedule steps**:
   ```typescript
   steps: [{
     actionId: 'action-unique-id',
     // ... other fields
   }]
   ```

4. **Ensure actions in models have complete steps**:
   ```typescript
   actions: [{
     name: 'actionName',
     title: 'Action Title',
     emoji: '🎯',
     steps: [/* StepTemplate[] */]
   }]
   ```

5. **Link forms to schedules** (if auto-triggering):
   ```typescript
   scheduleId: 'schedule-to-trigger',
   ```

## Common Feature Patterns

### Pattern 1: Form → Automation (NEW form with AI processing)
**Use Case:** User submits data, AI processes it automatically

```typescript
// Feature definition
{
  forms: [{ 
    formType: 'new', 
    scheduleId: 'process-schedule'  // Links to automation
  }],
  schedules: [{ 
    id: 'process-schedule',
    mode: 'once',  // Runs after form submission
    actionIds: ['process-action']
  }],
  actions: [{ 
    actionId: 'process-action',
    steps: [/* AI logic */]
  }]
}

// Examples: Submit expense → Extract receipt data
//           Add lead → Enrich company data
//           Upload product → Generate description
```

### Pattern 2: Simple Edit Form (EDIT only, no automation)
**Use Case:** User manually updates specific fields

```typescript
// Feature definition
{
  forms: [{ 
    formType: 'edit',
    fields: ['status', 'notes']  // Only fields being edited
    // No scheduleId - manual update only
  }]
}

// Examples: Approve/reject expense
//           Change lead status
//           Toggle published flag
```

### Pattern 3: Recurring Automation (No forms, scheduled AI)
**Use Case:** AI runs periodically on existing data

```typescript
// Feature definition
{
  // No forms - fully automated
  schedules: [{ 
    id: 'recurring-schedule',
    mode: 'recurring',
    intervalHours: 24,  // Daily
    actionIds: ['process-action']
  }],
  actions: [{ 
    actionId: 'process-action',
    steps: [/* AI logic */]
  }]
}

// Examples: Daily categorization of uncategorized items
//           Weekly competitor analysis
//           Monthly report generation
```

### Pattern 4: Multi-Step Workflow
**Use Case:** Complex AI processing with multiple steps

```typescript
{
  actions: [{
    actionId: 'complex-action',
    steps: [
      { name: 'search', type: 'web_search', order: '1' },
      { name: 'analyze', type: 'ai_reasoning', order: '2' },
      { name: 'summarize', type: 'ai_reasoning', order: '3' }
    ]
  }]
}

// Examples: Lead enrichment (search company → analyze data)
//           SEO optimization (research keywords → analyze competitors → score content)
```

### Pattern 5: Form Edit with Automation
**Use Case:** User edits field, triggers AI workflow

```typescript
{
  forms: [{ 
    formType: 'edit',
    fields: ['tone', 'language'],
    scheduleId: 'regenerate-schedule'  // Re-process after edit
  }],
  schedules: [{ 
    id: 'regenerate-schedule',
    mode: 'once',
    actionIds: ['generate-action']
  }]
}

// Examples: Change product tone → Regenerate description
//           Update SEO keywords → Re-optimize content
```

## Quick Reference: Entity Checklist

### Creating a NEW Form
```typescript
{
  formId: 'unique-id',
  formName: 'Display Name',
  formType: 'new',  // ← REQUIRED
  whenToUse: 'Fill this form when creating a NEW...',  // ← REQUIRED
  modelName: 'ModelName',
  fields: ['field1', 'field2'],  // Input fields only
  scheduleId: 'optional-schedule-id'  // Optional: trigger automation
}
```

### Creating an EDIT Form
```typescript
{
  formId: 'unique-id',
  formName: 'Display Name',
  formType: 'edit',  // ← REQUIRED
  whenToUse: 'Use this form to update EXISTING...',  // ← REQUIRED
  modelName: 'ModelName',
  fields: ['status', 'notes'],  // Only fields being edited
  scheduleId: 'optional-schedule-id'  // Optional: trigger automation
}
```

### Creating a Run-Once Schedule
```typescript
{
  id: 'unique-schedule-id',  // ← REQUIRED
  name: 'Display Name',
  description: 'What this schedule does',
  mode: 'once',  // ← Runs once when triggered
  actionIds: ['action-id-1', 'action-id-2'],  // ← REQUIRED
  steps: [{
    modelName: 'ModelName',
    actionId: 'action-id-1',  // ← REQUIRED
    actionName: 'actionName',
    query: 'filter criteria',
    order: 1
  }]
}
```

### Creating a Recurring Schedule
```typescript
{
  id: 'unique-schedule-id',  // ← REQUIRED
  name: 'Display Name',
  description: 'What this schedule does',
  mode: 'recurring',  // ← Runs on interval
  intervalHours: 24,  // ← REQUIRED for recurring
  actionIds: ['action-id-1'],  // ← REQUIRED
  steps: [{ /* same as run-once */ }]
}
```

### Creating an Action (in models section)
```typescript
{
  name: 'actionName',  // ← REQUIRED (used in references)
  title: 'Display Title',  // ← REQUIRED
  emoji: '🎯',  // ← REQUIRED
  description: 'What this action does',  // ← REQUIRED
  modelName: 'ModelName',  // ← REQUIRED
  inputFields: ['field1', 'field2'],  // ← REQUIRED
  outputFields: ['result1', 'result2'],  // ← REQUIRED
  steps: [  // ← REQUIRED (at least one step)
    {
      name: 'stepName',
      type: 'ai_reasoning',  // or web_search, custom, image_generation
      order: '1',
      config: {
        prompt: 'AI instruction...',
        inputFields: ['field1'],
        outputFields: ['result1'],
        model: 'gpt-4o',
        temperature: 0.3
      }
    }
  ]
}
```

## Benefits

1. **Type Safety**: TypeScript ensures all required fields are present
2. **Clear Relationships**: IDs make relationships explicit and traceable
3. **Decoupled Storage**: Each entity stores its own data, linked only by ID
4. **Flexible Scheduling**: Forms can trigger one-time or recurring schedules
5. **Workflow Clarity**: Easy to see how forms → schedules → actions flow
6. **Feature-Driven**: Think in terms of user capabilities, not technical implementation
