# Bulk Template Update Guide

This guide provides the exact patterns to update all remaining templates systematically.

## Step-by-Step Update Process

### Step 1: Update Feature Forms

**Find pattern:**
```typescript
forms: [{
  formId: 'some-id',
  formName: 'Some Name',
  modelName: 'ModelName',
  fields: [...]
}]
```

**Replace with:**
```typescript
forms: [{
  formId: 'some-id',
  formName: 'Some Name',
  formType: 'new',  // or 'edit' based on purpose
  whenToUse: 'Fill this form when [creating/updating] [description]...',
  modelName: 'ModelName',
  fields: [...],
  scheduleId: 'related-schedule-id'  // OPTIONAL: if form triggers automation
}]
```

**Decision tree for formType:**
- `'new'` - Form creates new records (e.g., "New Lead", "Add Product", "Create Ticket")
  - Typically has scheduleId for auto-processing after creation
  - Example: "New Expense" with scheduleId: 'extract-receipt-schedule'
- `'edit'` - Form updates existing records (e.g., "Approve", "Update Status", "Publish")
  - Usually NO scheduleId (manual updates)
  - Rare exception: regeneration workflows (e.g., "Edit Tone & Language" with scheduleId)

**Decision tree for scheduleId:**
- ✅ Add to NEW forms if created record needs AI processing
  - Example: NEW expense → extract receipt data
  - Example: NEW lead → enrich with company data
  - Example: NEW ticket → analyze sentiment
- ✅ Add to EDIT forms only for regeneration workflows
  - Example: Edit product tone → regenerate description
- ❌ Skip for pure manual updates (approvals, status changes)

**See Real Examples In:**
- `expense-report.ts` - Complete workflow with NEW + 2 EDIT forms
- `lead-enrichment.ts` - NEW with enrichment + 2 EDIT forms
- `product-descriptions.ts` - NEW + EDIT with regeneration
- `seo-optimizer.ts` - NEW with research + EDIT for status

### Step 2: Update Feature Actions (add actionId)

**Find pattern:**
```typescript
actions: [{
  actionName: 'someAction',
  actionTitle: 'Some Action',
  modelName: 'ModelName',
  inputFields: [...],
  outputFields: [...]
}]
```

**Replace with:**
```typescript
actions: [{
  actionId: 'some-action-id',  // ← ADD THIS (kebab-case)
  actionName: 'someAction',
  actionTitle: 'Some Action',
  modelName: 'ModelName',
  inputFields: [...],
  outputFields: [...]
}]
```

### Step 3: Update Feature Schedules

**Find pattern:**
```typescript
schedules: [{
  name: 'Some Schedule',
  mode: 'once' | 'recurring',
  // missing fields...
}]
```

**Replace with:**
```typescript
schedules: [{
  scheduleId: 'some-schedule-id',  // ← ADD THIS
  name: 'Some Schedule',
  description: 'What this schedule does',
  mode: 'once',  // or 'recurring'
  actionIds: ['action-id-1', 'action-id-2'],  // ← ADD THIS
  steps: [{
    modelName: 'ModelName',
    actionId: 'action-id-1',  // ← ADD THIS
    actionName: 'actionName',
    actionTitle: 'Action Title',
    query: 'optional filter',
    order: 1
  }]
}]
```

### Step 4: Update Model Forms

**Find pattern in models section:**
```typescript
forms: [{
  id: 'form-id',
  name: 'Form Name',
  description: '...',
  icon: '📝',
  modelName: 'ModelName',
  fields: [...]
}]
```

**Replace with:**
```typescript
forms: [{
  id: 'form-id',
  name: 'Form Name',
  description: '...',
  icon: '📝',
  formType: 'new',  // or 'edit'
  whenToUse: 'Fill this form when...',  // ← ADD THIS
  modelName: 'ModelName',
  fields: [...]
}]
```

### Step 5: Update Model Actions (add complete steps)

**Find pattern in models section:**
```typescript
// Usually missing entirely or incomplete
```

**Add complete actions:**
```typescript
actions: [{
  name: 'actionName',
  title: 'Action Title',
  emoji: '🎯',
  description: 'What this action does',
  modelName: 'ModelName',
  inputFields: ['field1', 'field2'],
  outputFields: ['result1', 'result2'],
  steps: [  // ← THIS IS CRITICAL
    {
      name: 'stepName',
      type: 'ai_reasoning',  // or web_search, custom, image_generation
      order: '1',
      config: {
        prompt: 'AI instruction here. Be specific about what to analyze and output.',
        inputFields: ['field1', 'field2'],
        outputFields: ['result1', 'result2'],
        model: 'gpt-4o',
        temperature: 0.3  // Lower for factual, higher for creative
      }
    }
  ]
}]
```

**Common step types:**

1. **AI Reasoning** (most common):
```typescript
{
  name: 'analyzeSomething',
  type: 'ai_reasoning',
  order: '1',
  config: {
    prompt: 'Analyze X and determine Y. Output Z.',
    inputFields: ['input1'],
    outputFields: ['output1'],
    model: 'gpt-4o',
    temperature: 0.2  // 0.1-0.3 for analysis, 0.5-0.8 for creative
  }
}
```

2. **Web Search** (for external data):
```typescript
{
  name: 'searchData',
  type: 'web_search',
  order: '1',
  config: {
    searchQuery: 'Search for company information about {companyName}',
    inputFields: ['companyName'],
    outputFields: []  // Web search doesn't write directly
  }
}
```

3. **Multi-step** (search then analyze):
```typescript
steps: [
  {
    name: 'searchData',
    type: 'web_search',
    order: '1',
    config: {
      searchQuery: 'Find information about {topic}',
      inputFields: ['topic'],
      outputFields: []
    }
  },
  {
    name: 'analyzeResults',
    type: 'ai_reasoning',
    order: '2',
    config: {
      prompt: 'Based on the search results, extract and structure the key information.',
      inputFields: ['topic'],  // Can access search results implicitly
      outputFields: ['extractedData'],
      model: 'gpt-4o',
      temperature: 0.2
    }
  }
]
```

### Step 6: Update Top-Level Schedules

**Find pattern:**
```typescript
schedules: [{
  name: 'Some Schedule',
  description: '...',
  mode: 'recurring',
  intervalHours: 24
}]
```

**Replace with:**
```typescript
schedules: [{
  id: 'some-schedule-id',  // ← ADD THIS
  name: 'Some Schedule',
  description: '...',
  mode: 'recurring',
  intervalHours: 24,
  actionIds: ['action-id-1']  // ← ADD THIS
}]
```

## Common Patterns by Use Case

### Pattern A: Simple Data Entry (NEW form, no automation)

```typescript
{
  icon: '📝',
  title: 'Manual Entry',
  description: { feature: '...', data: '...', action: '...' },
  forms: [{
    formId: 'new-entry-form',
    formName: 'New Entry',
    formType: 'new',
    whenToUse: 'Fill this form to create a new entry with...',
    modelName: 'SomeModel',
    fields: ['field1', 'field2']
    // No scheduleId - manual only
  }],
  models: [{
    modelName: 'SomeModel',
    fields: ['id', 'field1', 'field2', 'createdAt']
  }]
  // No actions, no schedules
}
```

### Pattern B: Entry with Auto-Processing (NEW form → Schedule → Action)

```typescript
{
  icon: '⚡',
  title: 'Quick Entry',
  description: { feature: '...', data: '...', action: '...' },
  forms: [{
    formId: 'new-entry-form',
    formName: 'New Entry',
    formType: 'new',
    whenToUse: 'Fill this form to create a new entry that will be auto-processed...',
    modelName: 'SomeModel',
    fields: ['rawData'],
    scheduleId: 'process-schedule'  // ← Links to automation
  }],
  models: [{
    modelName: 'SomeModel',
    fields: ['id', 'rawData', 'processedData']
  }],
  actions: [{
    actionId: 'process-action',
    actionName: 'processData',
    actionTitle: 'Process Data',
    modelName: 'SomeModel',
    inputFields: ['rawData'],
    outputFields: ['processedData']
  }],
  schedules: [{
    scheduleId: 'process-schedule',
    name: 'Process Entry',
    mode: 'once',
    actionIds: ['process-action'],
    steps: [{
      modelName: 'SomeModel',
      actionId: 'process-action',
      actionName: 'processData',
      query: 'status equals "New"',
      order: 1
    }]
  }]
}
```

### Pattern C: Edit/Update Form (EDIT form, manual)

```typescript
{
  icon: '✏️',
  title: 'Update Status',
  description: { feature: '...', data: '...', action: '...' },
  forms: [{
    formId: 'edit-status-form',
    formName: 'Update Status',
    formType: 'edit',
    whenToUse: 'Use this form to update the status of an EXISTING entry...',
    modelName: 'SomeModel',
    fields: ['status', 'notes']  // Only fields being edited
    // No scheduleId - manual update
  }],
  models: [{
    modelName: 'SomeModel',
    fields: ['status', 'notes', 'updatedAt']
  }]
}
```

### Pattern D: Pure Automation (No forms, recurring schedule)

```typescript
{
  icon: '🤖',
  title: 'Auto-Processing',
  description: { feature: '...', data: '...', action: '...' },
  // No forms - fully automated
  actions: [{
    actionId: 'auto-process-action',
    actionName: 'autoProcess',
    actionTitle: 'Auto Process',
    modelName: 'SomeModel',
    inputFields: ['inputData'],
    outputFields: ['result']
  }],
  models: [{
    modelName: 'SomeModel',
    fields: ['inputData', 'result']
  }],
  schedules: [{
    scheduleId: 'daily-processing-schedule',
    name: 'Daily Processing',
    mode: 'recurring',
    intervalHours: 24,
    actionIds: ['auto-process-action'],
    steps: [{
      modelName: 'SomeModel',
      actionId: 'auto-process-action',
      actionName: 'autoProcess',
      query: 'processedAt is empty',
      order: 1
    }]
  }]
}
```

## Checklist for Each Template

- [ ] All forms have `formType` and `whenToUse`
- [ ] All feature schedules have `scheduleId` and `actionIds`
- [ ] All schedule steps have `actionId`
- [ ] All feature actions have `actionId`
- [ ] All model forms have `formType` and `whenToUse`
- [ ] All model actions have complete `steps` array
- [ ] All top-level schedules have `id` and `actionIds`
- [ ] All IDs match between features and models sections
- [ ] No duplicate IDs across schedules or actions

## Validation Script

After updating, check for these common issues:

1. **Missing formType**: Search for `forms: [` and verify each has `formType`
2. **Missing whenToUse**: Search for `formType:` and verify each has `whenToUse` nearby
3. **Missing schedule id**: Search for `schedules: [` and verify each has `id` or `scheduleId`
4. **Missing actionId**: Search for `steps: [` and verify each step has `actionId`
5. **Missing action steps**: Search for `actions: [` in models and verify each has `steps`

## Templates Remaining to Update

1. instagram-analyzer.ts
2. price-tracker.ts
3. shopify-order-tracker.ts
4. social-media-calendar.ts
5. content-creator.ts
6. sales-assistant.ts
7. social-media-manager.ts
8. data-analyst.ts
9. project-manager.ts
10. trading-bot.ts

Follow this guide systematically for each template!

