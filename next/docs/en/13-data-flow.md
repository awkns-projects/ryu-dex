# Data Flow & Relationships

## Overview

Understanding how data flows through Ryu is essential for building effective automation workflows. This guide explains input/output patterns, field relationships, and how data moves between models, actions, and external services.

## Data Flow Fundamentals

### The Basic Flow

```
INPUT → PROCESSING → OUTPUT

Example:
  User Input (Form) → AI Generation (Action) → Stored Result (Field)
```

### Platform Data Flow

```
┌─────────────┐
│ Data Sources│
│  - Forms    │
│  - APIs     │
│  - Manual   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Fields    │ ◄──┐
│  (Storage)  │    │
└──────┬──────┘    │
       │           │
       ▼           │
┌─────────────┐    │
│   Actions   │    │
│ (Processing)│    │
└──────┬──────┘    │
       │           │
       ▼           │
┌─────────────┐    │
│  Outputs    │────┘
│  - Fields   │
│  - APIs     │
│  - Records  │
└─────────────┘
```

## Field-Level Data Flow

### Input Fields

Fields that receive data from external sources:

```
Form Submission:
  User fills form →
  firstName: "John" →
  lastName: "Doe" →
  email: "john@example.com" →
  Stored in Customer record

API Import:
  External API →
  productData: {...} →
  Parsed and mapped →
  Stored in Product fields

Manual Entry:
  User types in sheet →
  title: "New Article" →
  Saved to Article record
```

### Processing Fields

Fields used during action execution:

```
Action: Generate Social Post

Reads:
  - Article.title (input)
  - Article.content (input)
  - Settings.platform (input)

Processes:
  AI generates caption using inputs

Writes:
  - SocialPost.caption (output)
  - SocialPost.generatedAt (metadata)
```

### Output Fields

Fields that store processed results:

```
After Action Execution:

Original State:
  Article.title: "10 AI Tips"
  Article.content: "Lorem ipsum..."
  SocialPost.caption: null

After Processing:
  Article.title: "10 AI Tips" (unchanged)
  Article.content: "Lorem ipsum..." (unchanged)
  SocialPost.caption: "🤖 Discover 10 game-changing AI tips..." (generated)
```

### Intermediate Fields

Temporary fields used during multi-step processes:

```
Multi-Step Action:

Step 1: Generate image prompt
  Input: Article.title
  Output: Temp.imagePrompt

Step 2: Generate image
  Input: Temp.imagePrompt
  Output: Temp.imageUrl

Step 3: Optimize image
  Input: Temp.imageUrl
  Output: Article.imageUrl (final)

Temp fields hold intermediate data
```

## Model-Level Data Flow

### Parent-Child Flow

```
Parent Model: Blog Articles
  id: 1
  title: "How to Use AI"
  content: "..."
  status: "Published"

Action: "Distribute to Social"
  Reads parent article
  Generates social content
  Creates children

Child Records Created:
  
  Social Post 1 (Instagram):
    sourceArticle: 1
    platform: "Instagram"
    caption: "🤖 Learn how to..."
    
  Social Post 2 (Twitter):
    sourceArticle: 1
    platform: "Twitter"
    caption: "AI tips you need..."
    
  Social Post 3 (LinkedIn):
    sourceArticle: 1
    platform: "LinkedIn"
    caption: "Professional AI guide..."

Data flows from parent to children
```

### Sibling Data Flow

```
Model A: Lead Submissions
  id: 101
  email: "prospect@example.com"
  interest: "Enterprise Plan"

Action: "Process Lead"
  
  Creates in Model B (Customers):
    email: "prospect@example.com"
    source: "Website Form"
    status: "New"
  
  Creates in Model C (Tasks):
    title: "Follow up with prospect"
    assignee: "Sales Team"
    dueDate: Tomorrow

One input creates multiple related records
```

### Lookup Data Flow

```
Order Model:
  orderId: 1001
  customerId: 42
  
  Lookup Fields (from Customer):
    customerName: "John Doe" ←─┐
    customerEmail: "john@..."  │
    customerTier: "Premium"  ──┘
                               │
Customer Model: ──────────────┘
  id: 42
  name: "John Doe"
  email: "john@example.com"
  tier: "Premium"

Data flows via relationship lookup
```

## Action Data Flow

### Single Action Flow

```
Action: "Generate Product Description"

┌─────────────────────────┐
│ Input Fields            │
│  - Product.name         │
│  - Product.features     │
│  - Product.category     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Step 1: AI Reasoning    │
│  Generate description   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Step 2: AI Reasoning    │
│  Generate SEO keywords  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Output Fields           │
│  - Product.description  │
│  - Product.seo_keywords │
└─────────────────────────┘
```

### Multi-Step Flow with Dependencies

```
Action: "Complete Content Pipeline"

Step 1: Extract Key Points
  Input: Article.content
  Output: Temp.keyPoints

Step 2: Generate Social Caption
  Input: Article.title + Temp.keyPoints
  Output: SocialPost.caption

Step 3: Generate Image Prompt
  Input: Article.title + Temp.keyPoints
  Output: Temp.imagePrompt

Step 4: Generate Image
  Input: Temp.imagePrompt
  Output: SocialPost.imageUrl

Step 5: Post to Instagram
  Input: SocialPost.caption + SocialPost.imageUrl
  Output: SocialPost.externalId

Step 6: Update Status
  Input: SocialPost.externalId
  Output: SocialPost.status = "Published"

Data flows sequentially through steps
```

### Conditional Flow

```
Action: "Smart Content Distribution"

Read: Article.category

If category = "Technical":
  → Post to LinkedIn
  → Post to Dev.to
  → Skip Instagram

If category = "Marketing":
  → Post to Instagram
  → Post to Facebook
  → Skip Dev.to

If category = "General":
  → Post to all platforms

Different paths based on data
```

## Workspace-Level Data Flow

### Global Field Access

```
Workspace: Content Hub

Model A: Blog Articles
  - title
  - content
  - author

Model B: Newsletter
  - edition
  - featured_articles

Model C: Social Posts
  - platform
  - caption

Action in Model C can access:
  ✓ SocialPosts.platform (local)
  ✓ Articles.title (global, workspace)
  ✓ Articles.content (global, workspace)
  ✓ Newsletter.edition (global, workspace)

All workspace fields available
```

### Cross-Model Updates

```
Action: "Publish Article"
Location: Blog Articles model

Step 1: Update current article
  Articles.status = "Published"
  Articles.publishedAt = NOW

Step 2: Create social posts (Model B)
  For each platform:
    Create SocialPost with sourceArticle

Step 3: Update newsletter (Model C)
  Newsletter.latestArticle = current article
  Newsletter.articleCount += 1

One action updates multiple models
```

## External Data Flow

### Incoming Data (APIs → Platform)

```
External API → Webhook → Platform

Example: Shopify Order

1. Customer places order in Shopify
2. Shopify sends webhook
3. Platform receives webhook
4. Parse order data
5. Create record in Orders model:
   - orderId: external ID
   - customerEmail: from payload
   - total: from payload
   - items: from payload
6. Trigger action "Process New Order"
7. Action creates shipping task
8. Action sends confirmation email

External data triggers internal workflow
```

### Outgoing Data (Platform → APIs)

```
Platform → API Call → External Service

Example: Post to Instagram

1. User creates social post in platform
2. Fills caption and image
3. Action "Post to Instagram" executes
4. Step 1: Upload image to Instagram
   - API: POST /media
   - Body: {image_url, caption}
   - Response: {media_id}
5. Step 2: Publish media
   - API: POST /media_publish
   - Body: {creation_id: media_id}
   - Response: {id, permalink}
6. Save response data:
   - SocialPost.externalId = id
   - SocialPost.url = permalink
   - SocialPost.status = "Published"

Internal data pushes to external service
```

### Bidirectional Sync

```
Platform ↔ External Service

Example: Google Sheets Sync

1. User updates record in platform
   Field: Product.price = $99.99

2. Action triggers on update
   "Sync to Google Sheets"

3. Action updates Google Sheet:
   API: PUT spreadsheet/values
   Cell: B5 = 99.99

4. Google Sheet formula calculates tax
   Cell: C5 = B5 * 1.08 = 107.99

5. Schedule fetches data hourly
   API: GET spreadsheet/values
   Reads: C5 = 107.99

6. Updates platform:
   Product.priceWithTax = $107.99

Continuous two-way sync
```

## Data Transformation Flow

### Simple Transformation

```
Input → Transform → Output

Example: Name Formatting

Input:
  firstName: "john"
  lastName: "DOE"

Transform (Action):
  Capitalize first letter of each word

Output:
  firstName: "John"
  lastName: "Doe"
```

### Complex Transformation

```
Multiple Inputs → AI Processing → Structured Output

Input:
  Product.rawData: "Laptop, 16GB RAM, 512GB SSD, Intel i7"

Action: "Parse Product Specs"
  AI extracts structured data

Output:
  Product.type: "Laptop"
  Product.ram: "16GB"
  Product.storage: "512GB"
  Product.processor: "Intel i7"

Unstructured → Structured
```

### Aggregation Flow

```
Multiple Records → Aggregate → Summary

Input (50 Social Posts):
  Post 1: likes: 120, comments: 15
  Post 2: likes: 95, comments: 8
  ...
  Post 50: likes: 203, comments: 34

Action: "Calculate Campaign Performance"
  Aggregate all posts

Output (Campaign Summary):
  totalLikes: 6,432
  totalComments: 891
  avgEngagement: 14.6%
  topPost: Post 50
  
Many → One
```

## Reusability Patterns

### Reusing Generated Content

```
Step 1: Generate content once
  Input: Article.title, Article.content
  AI generates: Summary
  Output: Article.summary

Step 2: Use in multiple places
  - Email subject (from Article.summary)
  - Social caption (from Article.summary)
  - Meta description (from Article.summary)
  - Newsletter intro (from Article.summary)

Generate once, use many times
```

### Template-Based Flow

```
Template Model:
  id: 1
  name: "Product Launch Template"
  structure: {
    intro: "Introducing {product}...",
    features: "Key features: {features}...",
    cta: "Get {product} today!"
  }

Input Record:
  product: "SuperWidget 3000"
  features: "Fast, Reliable, Affordable"

Action: "Generate from Template"
  Merges template + data

Output:
  generatedContent: "Introducing SuperWidget 3000...
                     Key features: Fast, Reliable, Affordable...
                     Get SuperWidget 3000 today!"

Reusable structure + dynamic data
```

## Performance & Optimization

### Batch Processing Flow

```
Inefficient:
  For each of 100 products:
    - Fetch category from API
    - Process product
    - Update product
  
  Result: 100 API calls

Efficient:
  - Fetch all categories once (1 API call)
  - For each of 100 products:
      - Lookup category from cache
      - Process product
      - Queue update
  - Batch update all products
  
  Result: 2 API calls
```

### Caching Flow

```
First Request:
  User requests: Product details
  Check cache: Not found
  Fetch from API: Product data
  Store in cache: 5 minute TTL
  Return: Product data
  
Subsequent Requests (within 5 min):
  User requests: Product details
  Check cache: Found
  Return: Cached data (no API call)

After 5 minutes:
  Cache expires
  Next request fetches fresh data
  
Reduces API calls, improves speed
```

## Data Integrity

### Validation Flow

```
Input Validation:
  Form submission:
    email: "notanemail"
  
  Validation:
    ✗ Invalid email format
    Error: "Please enter valid email"
    Block submission

Processing Validation:
  Before API call:
    imageUrl: field is empty
  
  Validation:
    ✗ Required field missing
    Skip API step
    Log error

Output Validation:
  After AI generation:
    caption: 350 characters
    
  Validation:
    ✗ Exceeds platform limit (280)
    Truncate or regenerate
    Log warning

Validate at each stage
```

### Error Recovery Flow

```
Action: "Post to Instagram"

Step 1: Generate caption
  ✓ Success
  caption: "Check out our new product..."

Step 2: Generate image
  ✗ Failed (API timeout)
  
  Recovery:
    - Retry 3 times
    - Still failing
    - Use fallback image
    - Continue to next step

Step 3: Post to Instagram
  ✓ Success (with fallback image)
  externalId: "12345"

Step 4: Update status
  ✓ Success
  status: "Published (fallback image)"

Graceful degradation
```

## Monitoring Data Flow

### Flow Tracing

```
Trace ID: trace_abc123

1. Form submission (09:00:00)
   Record created: Customer #456
   Fields: name, email, company

2. Action triggered (09:00:01)
   Action: "Process New Customer"
   Input: Customer #456

3. Step 1 executed (09:00:02)
   AI Reasoning: Generate welcome email
   Output: Email template populated

4. Step 2 executed (09:00:05)
   API Call: Send email via SendGrid
   Response: Message ID msg_xyz789

5. Step 3 executed (09:00:06)
   Update: Customer.welcomeEmailSent = true

6. Complete (09:00:06)
   Duration: 6 seconds
   Status: Success

Track data through entire flow
```

### Flow Analytics

```
Metrics per Flow:
  - Total records processed: 1,234
  - Average duration: 8.5 seconds
  - Success rate: 98.2%
  - Most common errors: API timeout (1.5%)
  - Busiest time: 9-10 AM
  - Peak throughput: 45 records/minute

Optimize based on metrics
```

## Best Practices

### Design Principles

**Single Source of Truth**
```
Good:
  Product.name stored once
  Other models reference via relationship

Avoid:
  Duplicating Product.name across multiple models
```

**Clear Data Direction**
```
Good:
  Form → Field → Action → Output → API
  Clear flow, easy to trace

Avoid:
  Circular dependencies
  Unclear data origins
```

**Minimize Transformations**
```
Good:
  Store data in usable format
  Transform only when necessary

Avoid:
  Repeated transformations
  Lossy conversions
```

### Documentation

```
Document your flows:

Flow: Blog to Social
  Source: Blog Articles model
  Trigger: Article published
  Steps:
    1. Extract key points (AI)
    2. Generate captions (AI)
    3. Create social posts (Data)
    4. Schedule posting (Data)
  Output: Social Posts ready to publish
  Dependencies: OpenAI API
  SLA: < 30 seconds
```

## Next Steps

- [Actions](./09-actions.md) - Build data processing workflows
- [Action Steps](./10-action-steps.md) - Configure flow steps
- [Models & Sheets](./06-models-and-sheets.md) - Structure your data
- [Best Practices](./14-best-practices.md) - Optimization techniques

