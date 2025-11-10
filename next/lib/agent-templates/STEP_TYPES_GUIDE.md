# Action Step Types - Complete Guide

This guide explains the 4 step types available for actions, with real examples from production templates.

## Overview

**CRITICAL**: Actions contain a `steps` array (StepTemplate[]) that can have 1 or multiple steps.

```typescript
actionSchema = {
  name: string,
  title: string,
  emoji: string,
  targetModel: string,
  steps: StepTemplate[]  // ← ARRAY of steps (1 or more)
}

stepSchema = {
  name: string,
  type: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation',
  order: string,  // '1', '2', '3', etc.
  config: { ... },
  inputFields: string[],
  outputFields: string[]
}
```

## The 4 Step Types

### 1. ai_reasoning

**Purpose**: Use LLM to analyze, generate, or transform data

**Required Config:**
- `prompt`: Detailed instructions for the AI
- `inputFields`: Fields to read from record
- `outputFields`: Fields to write back
- `model`: 'gpt-4o', 'gpt-4o-mini', etc.
- `temperature`: 0.1-0.3 for factual, 0.5-0.8 for creative

**Real Examples:**

**From expense-report.ts:**
```typescript
{
  name: 'analyzeReceipt',
  type: 'ai_reasoning',
  order: '1',
  config: {
    prompt: 'Analyze the receipt image and extract: vendor name, date, total amount, currency, and suggest an appropriate expense category',
    inputFields: ['receiptImage'],
    outputFields: ['vendor', 'date', 'amount', 'currency', 'category'],
    model: 'gpt-4o',
    temperature: 0.1
  }
}
```

**From customer-support-analyzer.ts:**
```typescript
{
  name: 'analyzeSentiment',
  type: 'ai_reasoning',
  order: '1',
  config: {
    prompt: 'Analyze the support ticket and determine priority, category, and customer sentiment',
    inputFields: ['subject', 'description', 'customerName'],
    outputFields: ['priority', 'category', 'sentiment'],
    model: 'gpt-4o',
    temperature: 0.2
  }
}
```

**From lead-enrichment.ts:**
```typescript
{
  name: 'scoreLead',
  type: 'ai_reasoning',
  order: '1',
  config: {
    prompt: 'Score this lead from 0-100 based on company size, industry fit, and engagement indicators',
    inputFields: ['companySize', 'industry', 'revenue', 'emailValidated'],
    outputFields: ['leadScore', 'scoreReason'],
    model: 'gpt-4o',
    temperature: 0.3
  }
}
```

---

### 2. web_search

**Purpose**: Search the web for external information

**Required Config:**
- `searchQuery`: Semantic description of what to search for
- `inputFields`: Fields to use in search (e.g., company name, topic)
- `outputFields`: Usually `[]` (empty - results available to next step)

**Real Examples:**

**From lead-enrichment.ts:**
```typescript
{
  name: 'searchCompanyData',
  type: 'web_search',
  order: '1',
  config: {
    searchQuery: 'Search for company size, industry, revenue, and job title information',
    inputFields: ['email', 'companyName'],
    outputFields: []  // Results available to next step
  }
}
```

**From content-creator.ts:**
```typescript
{
  name: 'researchTopic',
  type: 'web_search',
  order: '1',
  config: {
    searchQuery: 'Research the topic and gather relevant information, trends, and insights',
    inputFields: ['topic', 'keywords'],
    outputFields: []  // Next step will analyze the results
  }
}
```

**From seo-optimizer.ts:**
```typescript
{
  name: 'searchCompetitors',
  type: 'web_search',
  order: '1',
  config: {
    searchQuery: 'Search for top-ranking pages for the primary keyword',
    inputFields: ['primaryKeyword'],
    outputFields: []
  }
}
```

**Note**: web_search results are automatically available to subsequent steps via the execution context.

---

### 3. custom

**Purpose**: Execute custom code for API calls, data processing, or integrations

**Required Config:**
- `description`: Natural language description (AI generates code from this)
- `inputFields`: Fields to use as inputs
- `outputFields`: Fields to write results to

**Auto-Generated:**
- `code`: JavaScript/Node.js code
- `dependencies`: NPM packages needed
- `envVars`: Environment variables required
- `deployment`: Vercel deployment info

**Real Examples:**

**Social Media Posting:**
```typescript
{
  name: 'postToX',
  type: 'custom',
  order: '2',  // Often after ai_reasoning or image_generation
  config: {
    description: 'Post the generated content and image to X/Twitter using the API. Include hashtags and track the tweet URL.',
    inputFields: ['content', 'imageUrl', 'hashtags'],
    outputFields: ['tweetUrl', 'postedAt']
  }
}
```

**Email Sending:**
```typescript
{
  name: 'sendNotification',
  type: 'custom',
  order: '1',
  config: {
    description: 'Send email notification via Gmail API with the generated response content',
    inputFields: ['email', 'response'],
    outputFields: ['emailSent', 'sentAt']
  }
}
```

**API Integration:**
```typescript
{
  name: 'syncToCRM',
  type: 'custom',
  order: '2',
  config: {
    description: 'Update CRM system via webhook with enriched lead data',
    inputFields: ['leadId', 'companySize', 'industry', 'leadScore'],
    outputFields: ['crmSynced', 'syncedAt']
  }
}
```

---

### 4. image_generation

**Purpose**: Generate images using AI (DALL-E, Stable Diffusion, etc.)

**Required Config:**
- `prompt`: Image generation prompt (can use field values)
- `inputFields`: Fields to use in prompt
- `outputFields`: Usually ['imageUrl']

**Real Examples:**

**From content-creator.ts:**
```typescript
{
  name: 'generateVisual',
  type: 'image_generation',
  order: '2',  // After ai_reasoning creates the prompt
  config: {
    prompt: 'Use the generated image prompt to create a featured image',
    inputFields: ['imagePrompt'],
    outputFields: ['imageUrl']
  }
}
```

**Product Image:**
```typescript
{
  name: 'createProductImage',
  type: 'image_generation',
  order: '1',
  config: {
    prompt: 'Create a professional product image showing {productName} with {style} aesthetic',
    inputFields: ['productName', 'style', 'category'],
    outputFields: ['productImageUrl']
  }
}
```

---

## Multi-Step Action Patterns

### Pattern 1: Web Research → AI Analysis

**Use Case**: Need external data before processing

**Template**: lead-enrichment.ts - `enrichLead` action

```typescript
{
  actionName: 'enrichLead',
  steps: [
    {
      name: 'searchCompanyData',
      type: 'web_search',
      order: '1',
      config: {
        searchQuery: 'Search for company information',
        inputFields: ['companyName'],
        outputFields: []
      }
    },
    {
      name: 'extractData',
      type: 'ai_reasoning',
      order: '2',
      config: {
        prompt: 'Extract company size, industry, revenue from search results',
        inputFields: ['companyName'],
        outputFields: ['companySize', 'industry', 'revenue'],
        model: 'gpt-4o',
        temperature: 0.2
      }
    }
  ]
}
```

**Flow**: Search → Get results → AI analyzes → Write to fields

---

### Pattern 2: AI Description → Image Generation

**Use Case**: Need to describe image before creating it

**Template**: content-creator.ts - `generateImage` action

```typescript
{
  actionName: 'generateImage',
  steps: [
    {
      name: 'createImagePrompt',
      type: 'ai_reasoning',
      order: '1',
      config: {
        prompt: 'Create a detailed image prompt for: {title}',
        inputFields: ['title', 'topic', 'content'],
        outputFields: ['imagePrompt'],
        model: 'gpt-4o',
        temperature: 0.7
      }
    },
    {
      name: 'generateVisual',
      type: 'image_generation',
      order: '2',
      config: {
        prompt: '{imagePrompt}',
        inputFields: ['imagePrompt'],
        outputFields: ['imageUrl']
      }
    }
  ]
}
```

**Flow**: AI creates detailed description → Image generator creates visual

---

### Pattern 3: AI Analysis → Custom API Call

**Use Case**: Process data then send to external service

**Example**: Social Media Posting

```typescript
{
  actionName: 'createAndPostContent',
  steps: [
    {
      name: 'optimizeForPlatform',
      type: 'ai_reasoning',
      order: '1',
      config: {
        prompt: 'Optimize content for Twitter (280 chars, hashtags, emojis)',
        inputFields: ['content', 'topic'],
        outputFields: ['optimizedContent', 'hashtags'],
        model: 'gpt-4o',
        temperature: 0.6
      }
    },
    {
      name: 'postToTwitter',
      type: 'custom',
      order: '2',
      config: {
        description: 'Post to X/Twitter using the API',
        inputFields: ['optimizedContent', 'hashtags', 'imageUrl'],
        outputFields: ['tweetUrl', 'postedAt']
      }
    }
  ]
}
```

**Flow**: AI optimizes content → Custom code posts via API

---

### Pattern 4: Multi-stage AI Processing

**Use Case**: Complex analysis requiring multiple AI calls

**Example**: Content with SEO

```typescript
{
  actionName: 'generateSEOContent',
  steps: [
    {
      name: 'writeInitialDraft',
      type: 'ai_reasoning',
      order: '1',
      config: {
        prompt: 'Write initial content draft',
        inputFields: ['title', 'topic', 'brief'],
        outputFields: ['draftContent'],
        model: 'gpt-4o',
        temperature: 0.8
      }
    },
    {
      name: 'optimizeForSEO',
      type: 'ai_reasoning',
      order: '2',
      config: {
        prompt: 'Optimize the draft for SEO by adding keywords naturally',
        inputFields: ['draftContent', 'targetKeywords'],
        outputFields: ['content', 'seoScore'],
        model: 'gpt-4o',
        temperature: 0.3
      }
    }
  ]
}
```

**Flow**: Write draft → Optimize for SEO

---

## Key Concepts

### Step Execution Flow

1. Steps run in `order` sequence ('1', '2', '3', ...)
2. Each step has access to:
   - Original record fields
   - Outputs from ALL previous steps
   - Search results from web_search steps
3. Final step's outputFields are written back to the record

### OutputFields Rules

- **ai_reasoning**: Always has outputFields (what AI generates)
- **web_search**: Usually empty outputFields (results in context)
- **custom**: Has outputFields (what API returns)
- **image_generation**: Always has outputFields (image URL)

### When to Use Single vs Multiple Steps

**Single Step (Simple):**
- Extract data from one source
- Analyze existing fields
- Generate based on available data
- Simple transformations

**Multiple Steps (Complex):**
- Need external data first (web_search → ai_reasoning)
- Need to describe before creating (ai_reasoning → image_generation)
- Need to analyze before calling API (ai_reasoning → custom)
- Multi-stage processing (ai_reasoning → ai_reasoning)

## Template Examples Summary

| Template | Action | Steps | Pattern |
|----------|--------|-------|---------|
| expense-report.ts | extractReceiptData | 1 | ai_reasoning only |
| lead-enrichment.ts | enrichLead | 2 | web_search → ai_reasoning |
| lead-enrichment.ts | scoreLead | 1 | ai_reasoning only |
| content-creator.ts | generateContent | 2 | web_search → ai_reasoning |
| content-creator.ts | generateImage | 2 | ai_reasoning → image_generation |
| customer-support-analyzer.ts | analyzeTicket | 1 | ai_reasoning only |
| customer-support-analyzer.ts | generateResponse | 2 | web_search → ai_reasoning |
| product-descriptions.ts | generateDescription | 1 | ai_reasoning only |
| seo-optimizer.ts | researchKeywords | 2 | web_search → ai_reasoning |

## Best Practices

### ✅ DO:
- Use multiple steps for complex workflows
- Put web_search first when you need external data
- Put image_generation last after creating the prompt
- Put custom steps last after preparing data with AI
- Use descriptive step names
- Specify clear inputFields and outputFields
- Set appropriate temperature for each step

### ❌ DON'T:
- Create single-step actions when multiple steps would be clearer
- Put web_search after ai_reasoning (search needs to be first)
- Put image_generation before creating a good prompt
- Forget to specify order correctly
- Use vague prompts or descriptions
- Mix different concerns in one step

## Common Mistakes

### ❌ Wrong: Trying to do everything in one step
```typescript
{
  name: 'processLead',
  type: 'ai_reasoning',
  config: {
    prompt: 'Search for company data, analyze it, score the lead, and send notification',
    // TOO MUCH IN ONE STEP!
  }
}
```

### ✅ Right: Break into logical steps
```typescript
steps: [
  {
    name: 'searchCompanyData',
    type: 'web_search',
    order: '1',
    config: {
      searchQuery: 'Find company information',
      inputFields: ['companyName'],
      outputFields: []
    }
  },
  {
    name: 'analyzeLead',
    type: 'ai_reasoning',
    order: '2',
    config: {
      prompt: 'Analyze company data and score lead',
      inputFields: ['companyName', 'email'],
      outputFields: ['leadScore', 'industry'],
      model: 'gpt-4o',
      temperature: 0.2
    }
  },
  {
    name: 'sendNotification',
    type: 'custom',
    order: '3',
    config: {
      description: 'Send notification via Slack webhook',
      inputFields: ['leadScore', 'companyName'],
      outputFields: ['notificationSent']
    }
  }
]
```

## Temperature Guidelines

| Task Type | Temperature | Example |
|-----------|-------------|---------|
| Data Extraction | 0.1 - 0.2 | Extract receipt data, parse information |
| Analysis | 0.2 - 0.3 | Sentiment analysis, lead scoring, categorization |
| Balanced | 0.5 - 0.6 | General content generation |
| Creative | 0.7 - 0.9 | Marketing copy, creative writing, image prompts |

## Quick Reference

```typescript
// Simple action (1 step)
{
  actionName: 'extractData',
  steps: [{
    type: 'ai_reasoning',
    // ...
  }]
}

// Research workflow (2 steps)
{
  actionName: 'enrichData',
  steps: [
    { type: 'web_search', order: '1' },
    { type: 'ai_reasoning', order: '2' }
  ]
}

// Image creation workflow (2 steps)
{
  actionName: 'createVisual',
  steps: [
    { type: 'ai_reasoning', order: '1' },      // Create prompt
    { type: 'image_generation', order: '2' }  // Generate image
  ]
}

// Social media workflow (3 steps)
{
  actionName: 'postContent',
  steps: [
    { type: 'web_search', order: '1' },       // Research trends
    { type: 'ai_reasoning', order: '2' },     // Create content
    { type: 'custom', order: '3' }            // Post via API
  ]
}
```

## See Also

- `lib/agent-templates/lead-enrichment.ts` - Best example of multi-step actions
- `lib/agent-templates/content-creator.ts` - Image generation workflow
- `lib/agent-templates/customer-support-analyzer.ts` - AI analysis workflows
- `lib/ai/tools/agent-builder.ts` - Lines 1019-1160 for complete documentation
- `lib/agent-templates/types.ts` - Lines 72-122 for step type definitions

