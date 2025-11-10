# Template Update Status

## ✅ Fully Updated Templates (Complete with formType, whenToUse, actionId, steps)

1. **expense-report.ts** - ✅ Complete
   - NEW form: New Expense (with schedule)
   - EDIT forms: Approve/Reject, Publish to Accounting
   - Actions with steps: extractReceiptData, categorizeExpense
   - Schedules with IDs: extract-receipt, daily-categorization

2. **customer-support.ts** - ✅ Complete
   - NEW forms: Quick Ticket, Detailed Ticket
   - EDIT forms: Update Status, Assign Ticket
   - Actions with steps: analyzeTicket, generateResponse, escalateTicket
   - Schedules with IDs: analyze, auto-response, escalation

3. **email-analyzer.ts** - ✅ Complete
   - NEW form: Import Campaign (with schedule)
   - EDIT form: Update Campaign Status
   - Actions with steps: analyzeCampaign, compareVariations
   - Schedules with IDs: analyze, daily/weekly recurring

4. **lead-enrichment.ts** - ✅ Complete
   - NEW form: New Lead (with schedule)
   - EDIT forms: Update Lead Status, Qualify Lead
   - Actions with steps: enrichLead (web search + AI), scoreLead
   - Schedules with IDs: enrich on creation, recurring scoring

5. **product-descriptions.ts** - ✅ Complete
   - NEW form: New Product (with schedule)
   - EDIT forms: Update Status, Edit Tone/Language
   - Actions with steps: generateDescription, bulkGenerate
   - Schedules with IDs: generate, regenerate, daily bulk

6. **seo-optimizer.ts** - ✅ Complete
   - NEW form: New SEO Content (with schedule)
   - EDIT form: Update SEO Status
   - Actions with steps: researchKeywords (web + AI), analyzeCompetitors, optimizeContent
   - Schedules with IDs: research, weekly competitor, daily rank check

7. **customer-support-analyzer.ts** - ✅ Complete
   - NEW form: New Support Ticket (with schedule)
   - EDIT form: Update Ticket
   - Actions with steps: analyzeTicket, generateResponse
   - Schedules with IDs: analyze, hourly/recurring analysis, auto-response

## ⚠️ Partially Updated / Needs Work

8. **instagram-analyzer.ts** - Needs Update
   - Missing: formType, whenToUse in forms
   - Missing: id in schedules
   - Missing: actionId in schedule steps
   - Missing: Complete actions with steps in models section

9. **price-tracker.ts** - Needs Update
   - Missing: formType, whenToUse in forms
   - Missing: id in schedules
   - Missing: actionId in schedule steps
   - Missing: Complete actions with steps in models section

10. **shopify-order-tracker.ts** - Needs Update
11. **social-media-calendar.ts** - Needs Update
12. **content-creator.ts** - Needs Update
13. **sales-assistant.ts** - Needs Update
14. **social-media-manager.ts** - Needs Update
15. **data-analyst.ts** - Needs Update
16. **project-manager.ts** - Needs Update
17. **trading-bot.ts** - Needs Major Update (115 linting errors)

## Required Updates for Remaining Templates

### For Each Template:

#### 1. Update Features Forms
```typescript
forms: [{
  formId: 'unique-id',
  formName: 'Display Name',
  formType: 'new' | 'edit',  // ← ADD THIS
  whenToUse: 'Description...',  // ← ADD THIS
  modelName: 'ModelName',
  fields: [...],
  scheduleId: 'optional-schedule-id'  // ← OPTIONAL
}]
```

#### 2. Update Features Schedules
```typescript
schedules: [{
  scheduleId: 'unique-id',  // ← ADD THIS
  name: 'Schedule Name',
  description: '...',
  mode: 'once' | 'recurring',
  actionIds: ['action-id'],  // ← ADD THIS
  steps: [{
    modelName: 'ModelName',
    actionId: 'action-id',  // ← ADD THIS
    actionName: 'actionName',
    query: '...',
    order: 1
  }]
}]
```

#### 3. Update Models Actions
```typescript
actions: [{
  name: 'actionName',
  title: 'Display Title',
  emoji: '🎯',
  description: '...',
  modelName: 'ModelName',
  inputFields: [...],
  outputFields: [...],
  steps: [  // ← ADD COMPLETE STEPS
    {
      name: 'stepName',
      type: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation',
      order: '1',
      config: {
        prompt: '...',
        inputFields: [...],
        outputFields: [...],
        model: 'gpt-4o',
        temperature: 0.3
      }
    }
  ]
}]
```

#### 4. Update Top-Level Schedules
```typescript
schedules: [{
  id: 'unique-schedule-id',  // ← ADD THIS
  name: 'Schedule Name',
  description: '...',
  mode: 'once' | 'recurring',
  intervalHours: 24,  // For recurring
  actionIds: ['action-id']  // ← ADD THIS
}]
```

#### 5. Update Model Forms
```typescript
forms: [{
  id: 'form-id',
  name: 'Form Name',
  description: '...',
  icon: '📝',
  formType: 'new' | 'edit',  // ← ADD THIS
  whenToUse: '...',  // ← ADD THIS
  modelName: 'ModelName',
  fields: [...]
}]
```

## Priority Order for Updates

1. ✅ customer-support-analyzer.ts (DONE)
2. 🔄 instagram-analyzer.ts (IN PROGRESS)
3. 🔄 price-tracker.ts (IN PROGRESS)
4. ⏳ shopify-order-tracker.ts
5. ⏳ social-media-calendar.ts
6. ⏳ content-creator.ts (Large template)
7. ⏳ sales-assistant.ts (Large template)
8. ⏳ social-media-manager.ts (Large template)
9. ⏳ data-analyst.ts (Large template)
10. ⏳ project-manager.ts (Large template)
11. ⏳ trading-bot.ts (Largest - 115 errors)

## Notes

- All "new" forms should generally have scheduleId if they trigger automation
- All "edit" forms are typically manual (no scheduleId unless needed)
- Every action MUST have at least one step with complete config
- Every schedule MUST have an id and actionIds array
- Schedule steps MUST reference actions via actionId

