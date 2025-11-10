# Factory Pattern / Template-to-Record Generation Guide

## Overview

The **Factory Pattern** (also called Template-to-Record Generation) allows one model to automatically create child records in another model. This enables powerful automation where users create templates once, and AI generates multiple output records from each template.

## Real-World Example: Blog Post Generator

### Use Case
User wants to publish daily tech tips. Instead of writing each post manually:
1. User creates ONE "PostIdea" template
2. AI automatically generates a new "Post" every day from that template
3. Each Post is tracked and linked back to its source PostIdea

## Pattern Structure

### 1. Parent/Template Model (Factory)
This model contains the templates/ideas that generate child records.

**Required Fields:**
```typescript
{
  name: 'PostIdea',  // Parent model
  fields: [
    // Template configuration
    { name: 'title', type: 'text' },
    { name: 'template', type: 'textarea' },
    { name: 'frequency', type: 'enum', enumValues: ['daily', 'weekly'] },
    
    // Generation tracking
    { name: 'last_generated', type: 'date' },
    { name: 'created_count', type: 'number' },
    { name: 'status', type: 'enum', enumValues: ['active', 'paused'] },
    
    // CRITICAL: to_many relationship to children
    { 
      name: 'posts', 
      type: 'reference', 
      referenceType: 'to_many',
      referencesModel: 'Post',
      referencesField: 'title'
    }
  ],
  displayFields: ['title', 'category']
}
```

### 2. Child/Output Model (Generated Records)
This model contains the actual generated content/data.

**Required Fields:**
```typescript
{
  name: 'Post',  // Child model
  fields: [
    // Generated content
    { name: 'title', type: 'text' },
    { name: 'content', type: 'textarea' },
    { name: 'status', type: 'enum', enumValues: ['draft', 'published'] },
    { name: 'published_date', type: 'date' },
    
    // CRITICAL: to_one relationship back to parent
    {
      name: 'post_idea',
      type: 'reference',
      referenceType: 'to_one',
      referencesModel: 'PostIdea',
      referencesField: 'title'
    }
  ],
  displayFields: ['title', 'status']
}
```

### 3. Creation Action (Targets Parent Model)
This action creates new child records.

**CRITICAL:** Must output to the relationship field!

```typescript
{
  name: 'createPost',
  title: 'Create Post from Idea',
  emoji: '✨',
  modelName: 'PostIdea',  // Targets PARENT model
  inputFields: ['title', 'template', 'category'],
  outputFields: ['posts', 'last_generated', 'created_count'],  // 'posts' creates child!
  steps: [
    {
      name: 'generatePostRecord',
      type: 'ai_reasoning',
      order: '1',
      config: {
        prompt: 'Create a new Post record from the template. Update generation tracking.',
        inputFields: ['title', 'template', 'category'],
        outputFields: ['posts', 'last_generated', 'created_count'],
        model: 'gpt-4o',
        temperature: 0.7
      }
    }
  ]
}
```

**Why ONE step?** The system interprets outputting to a to_many relationship field as "create new record in that relationship".

### 4. Enhancement Action (Targets Child Model)
This action enhances the created child records.

```typescript
{
  name: 'generateContent',
  title: 'Generate Post Content',
  emoji: '📝',
  modelName: 'Post',  // Targets CHILD model
  inputFields: ['title', 'post_idea'],  // Can read parent via reference
  outputFields: ['content', 'excerpt', 'status'],
  steps: [
    {
      name: 'writeContent',
      type: 'ai_reasoning',
      order: '1',
      config: {
        prompt: 'Write full blog content based on title and template from parent PostIdea',
        inputFields: ['title', 'post_idea'],
        outputFields: ['content', 'excerpt', 'status'],
        model: 'gpt-4o',
        temperature: 0.7
      }
    }
  ]
}
```

## Automation Flow

### Step 1: User Creates Template
```
User fills "New Content Idea" form:
  - title: "Daily Tech Tips"
  - template: "Share a practical tip about {topic}"
  - category: "Technology"
  - frequency: "daily"
  - status: "active"
  ↓
PostIdea record created
```

### Step 2: Schedule Generates First Post
```
Schedule: "Generate First Post" (ONCE)
  ↓
Query: PostIdea where status="active" AND created_count=0
  ↓
Action: createPost (targets PostIdea)
  ↓
Outputs to 'posts' field → Creates new Post record:
  - title: "Tech Tip: VS Code Shortcuts"
  - status: "draft"
  - post_idea: (link to parent PostIdea)
  ↓
Updates PostIdea:
  - last_generated: now()
  - created_count: 1
```

### Step 3: Schedule Generates Content
```
Schedule: "Generate Post Content" (RECURRING every 2h)
  ↓
Query: Post where status="draft" AND content is empty
  ↓
Action: generateContent (targets Post)
  ↓
Generates:
  - content: (full blog post)
  - excerpt: (summary)
  - status: "published"
```

### Step 4: Daily Generation Continues
```
Schedule: "Daily Post Generation" (RECURRING every 24h)
  ↓
Query: PostIdea where status="active" AND frequency="daily"
  ↓
Action: createPost (creates another Post)
  ↓
New Post created, content generated by step 3
```

## Key Patterns

### Pattern: Daily Content Factory
```
PostIdea (daily) → Post (created daily) → Content (generated in 2h)
```

### Pattern: Product Catalog
```
ProductTemplate → Product (bulk generated) → Descriptions (AI written)
```

### Pattern: Social Campaign
```
CampaignIdea → SocialPost (scheduled) → Published (at optimal time)
```

## Example Template: blog-post-generator.ts

See `blog-post-generator.ts` for a complete working example.

**What it demonstrates:**
- ✅ Parent model (PostIdea) with to_many relationship
- ✅ Child model (Post) with to_one relationship back
- ✅ Creation action that outputs to relationship field
- ✅ Enhancement action that processes children
- ✅ Schedules linking everything together
- ✅ Tracking fields (last_generated, created_count)

## Common Patterns for Other Use Cases

### Content Creation
- **BlogIdea → BlogPost**
- **VideoScript → VideoContent**
- **NewsletterTemplate → NewsletterIssue**

### E-commerce
- **ProductTemplate → Product**
- **CampaignIdea → MarketingCampaign**
- **PromotionPlan → DailyDeals**

### Social Media
- **ContentPillar → SocialPosts**
- **CampaignTheme → DailyPosts**
- **SeriesIdea → EpisodePosts**

### Project Management
- **ProjectTemplate → Task**
- **SprintPlan → DailyStandups**
- **ChecklistTemplate → ChecklistItems**

## Testing the Pattern

Use `blog-post-generator.ts` to test:
1. Clone the template
2. Create a PostIdea with frequency="daily"
3. Wait for first post generation
4. Verify Post record created with link to PostIdea
5. Wait for content generation
6. Verify Post has content filled
7. Check PostIdea tracking (last_generated, created_count)

## Benefits

✅ **Create Once, Generate Many** - One template creates unlimited outputs
✅ **Track Generation History** - Parent tracks when and how many generated
✅ **Maintain Relationships** - Children link back to source template
✅ **Flexible Automation** - Control frequency and conditions
✅ **Scalable** - Works for 1 or 1000 child records

