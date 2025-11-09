# Actions

## Overview

Actions are the heart of automation in Ryu. They define workflows that process data using AI, APIs, and custom logic. Actions can reason, generate content, make API calls, and update records.

## What is an Action?

An **action** is:
- A workflow that processes data
- Composed of multiple steps
- Executes on individual records
- Can read and write fields
- Can create child records
- Can be triggered manually or by schedules

Think of actions as "smart recipes" that transform and process your data.

## Action Architecture

```
Action: "Generate and Post Social Content"

Trigger: Manual or Schedule

Input Fields:
  - Article.title
  - Article.content

Steps:
  1. AI Reasoning → Generate caption
  2. AI Image Generation → Create visual
  3. API Execution → Post to Instagram
  4. Data Update → Mark as posted

Output Fields:
  - SocialPost.caption
  - SocialPost.imageUrl
  - SocialPost.postedAt
  - SocialPost.status
```

## Creating an Action

### Basic Setup

**Required Information**:
- **Action Name**: Descriptive identifier
- **Target Model**: Which model records to process
- **Description**: What the action does

**Example**:
```
Name: Generate Social Post from Article
Model: Social Posts
Description: Uses AI to create social media content from blog articles
```

### Action Configuration

```
Action Settings:
  Name: Generate Social Post from Article
  Model: Social Posts
  Trigger Type: Manual, Schedule
  Timeout: 60 seconds
  Retry on Failure: Yes (3 attempts)
  Error Handling: Log and continue
```

## Action Steps

Actions consist of multiple steps that execute sequentially. Each step has a specific purpose.

### Step Types

#### 1. AI Reasoning
```
Purpose: Text analysis, generation, transformation
Uses: Language models to process text
Input: Text fields
Output: Generated text
```

#### 2. AI Image Generation
```
Purpose: Create images from descriptions
Uses: Image generation models
Input: Text prompts
Output: Image URLs
```

#### 3. API Execution
```
Purpose: Interact with external services
Uses: HTTP requests to APIs
Input: Data to send
Output: API response data
```

#### 4. Data Operations
```
Purpose: Update records, create children
Uses: Internal database operations
Input: Field values
Output: Updated records
```

### Step Configuration

Each step requires:
- **Step Name**: Identifier
- **Step Type**: Reasoning, generation, API, etc.
- **Inputs**: Which fields to use
- **Processing**: What to do
- **Outputs**: Where to save results

## AI Reasoning Steps

### What is AI Reasoning?

AI Reasoning uses language models to:
- Analyze text
- Generate content
- Transform data
- Make decisions
- Extract information

### Configuring AI Reasoning

```
Step: Generate Social Caption

Type: AI Reasoning

Input Fields:
  - Article.title
  - Article.content
  - SocialPost.platform

Prompt Template:
  "Create an engaging {platform} post about this article:
   
   Title: {Article.title}
   Content: {Article.content}
   
   Requirements:
   - Under 280 characters for Twitter
   - Include relevant hashtags
   - Engaging hook
   - Call to action"

Model: GPT-4
Temperature: 0.7
Max Tokens: 500

Output Field:
  - SocialPost.caption
```

### Prompt Engineering

**Good Prompts**:
```
Clear:
  "Extract the 3 main points from this article and list them as bullet points"

Specific:
  "Write a professional LinkedIn post (max 200 words) about {topic}. Include:
   1. Attention-grabbing first line
   2. 3 key insights
   3. Question to encourage engagement"

Contextual:
  "You are a marketing expert. Create an Instagram caption for this product:
   Name: {productName}
   Features: {features}
   Target Audience: Young professionals
   Tone: Friendly and inspiring"
```

**Poor Prompts**:
```
Vague:
  "Write something about this"

Too Open:
  "Create a post"

Missing Context:
  "Make it good"
```

### Advanced Reasoning Techniques

#### Chain of Thought
```
Step 1: AI Reasoning - Analyze
  Prompt: "Analyze this article and identify:
           1. Main topic
           2. Target audience
           3. Key takeaways
           Output as JSON"
  Output: Article.analysis

Step 2: AI Reasoning - Generate
  Prompt: "Using this analysis: {Article.analysis}
           Create a social post optimized for {platform}"
  Output: SocialPost.caption
```

#### Few-Shot Learning
```
Prompt: 
  "Create a product description following these examples:
   
   Example 1:
   Input: Laptop, 16GB RAM, 512GB SSD
   Output: Power through your day with 16GB of lightning-fast RAM...
   
   Example 2:
   Input: Headphones, Noise-canceling, 30hr battery
   Output: Immerse yourself in pure sound for 30 hours straight...
   
   Now create a description for:
   Input: {productSpecs}"
```

## AI Image Generation Steps

### What is AI Image Generation?

Creates images from text descriptions using AI models like DALL-E, Midjourney, or Stable Diffusion.

### Configuring Image Generation

```
Step: Generate Featured Image

Type: AI Image Generation

Input Fields:
  - Article.title
  - Article.category

Prompt Template:
  "Create a professional blog header image for:
   Title: {Article.title}
   Category: {Article.category}
   
   Style: Modern, clean, minimal
   Colors: Brand colors (blue and white)
   Format: 16:9 landscape"

Model: DALL-E 3
Size: 1792x1024
Quality: HD
Style: Natural

Output Field:
  - Article.featuredImageUrl
```

### Image Prompt Best Practices

**Effective Prompts**:
```
Detailed:
  "A professional photograph of a modern office workspace,
   natural lighting, minimalist desk setup, laptop and coffee,
   shallow depth of field, clean aesthetic, 4k quality"

Style-Specific:
  "Illustration in flat design style, pastel colors,
   showing team collaboration, simple shapes,
   business people working together, vector art"

Composition:
  "Product photo of {productName} on white background,
   centered composition, soft shadows, studio lighting,
   high-end commercial photography style"
```

## API Execution Steps

### What is API Execution?

Makes HTTP requests to external services to:
- Post content
- Fetch data
- Trigger webhooks
- Sync information

### Configuring API Execution

```
Step: Post to Instagram

Type: API Execution

Connection: Instagram (from workspace)

Request Configuration:
  Method: POST
  Endpoint: /media
  Headers:
    Content-Type: application/json
    Authorization: Bearer {oauth_token}
  
Body:
  {
    "image_url": "{SocialPost.imageUrl}",
    "caption": "{SocialPost.caption}",
    "location_id": "12345"
  }

Response Handling:
  Success Field: data.id
  Save to: SocialPost.externalId
  
  Error Handling:
    On 429 (Rate Limit): Retry after 60s
    On 401 (Auth): Log error, mark failed
    On 500: Retry 3 times
```

### API Step Examples

#### GET Request
```
Step: Fetch Analytics

Method: GET
Endpoint: /insights
Query Parameters:
  metric: engagement
  period: day
  
Response Mapping:
  response.data.likes → SocialPost.likes
  response.data.comments → SocialPost.comments
  response.data.shares → SocialPost.shares
```

#### POST Request
```
Step: Create Tweet

Method: POST
Endpoint: /tweets
Body:
  {
    "text": "{SocialPost.caption}",
    "media": {
      "media_ids": ["{SocialPost.mediaId}"]
    }
  }
  
Response:
  data.id → SocialPost.tweetId
  data.created_at → SocialPost.postedAt
```

#### PUT Request
```
Step: Update Record

Method: PUT
Endpoint: /records/{recordId}
Body:
  {
    "status": "completed",
    "updated_at": "{currentTimestamp}"
  }
```

## Data Operation Steps

### Creating Child Records

```
Step: Create Social Posts for Platforms

Type: Create Child Records

Parent Record: Current Article

Target Model: Social Posts

For Each Platform: [Instagram, Twitter, LinkedIn]
  Create Record:
    sourceArticle: {current record ID}
    platform: {current platform}
    status: "Draft"
    createdFrom: "Auto-generated"

Result: 3 new Social Post records created
```

### Updating Records

```
Step: Mark as Processed

Type: Update Record

Target: Current record

Updates:
  status: "Completed"
  processedAt: {currentTimestamp}
  processedBy: "Action: {actionName}"
```

### Conditional Operations

```
Step: Conditional Update

Type: Conditional Data Operation

Condition: If {SocialPost.likes} > 100
  Then:
    Update Article:
      trending: true
      trendingDate: {currentTimestamp}
  Else:
    Update Article:
      trending: false
```

## Input and Output Fields

### Using Input Fields

Actions can read from:
- **Local Model Fields**: Fields in the current record
- **Global Workspace Fields**: Fields from any workspace model
- **Related Record Fields**: Fields from linked records

```
Example Action in Social Posts model:

Can Access:
  ✅ SocialPost.platform (local)
  ✅ SocialPost.caption (local)
  ✅ Article.title (global, via relationship)
  ✅ Article.content (global, via relationship)
  ✅ Author.name (global, via Article relationship)
```

### Writing to Output Fields

Actions can write to:
- **Current Record**: Update fields in the record being processed
- **Related Records**: Update parent or linked records
- **New Records**: Create children in other models

```
Example Outputs:

Current Record:
  SocialPost.caption ← Generated caption
  SocialPost.imageUrl ← Generated image
  SocialPost.status ← "Processed"

Parent Record:
  Article.socialPostsCount ← Increment by 1
  Article.lastProcessed ← Current timestamp

New Records:
  Create Analytics record
    source: SocialPost ID
    processedDate: Today
```

## Field Scope in Actions

### Local vs. Global Fields

```
Action Location: Social Posts model

LOCAL FIELDS (direct access):
  - SocialPost.id
  - SocialPost.platform
  - SocialPost.caption
  - SocialPost.imageUrl
  - SocialPost.status

GLOBAL FIELDS (via relationships or workspace access):
  - Article.title (if relationship exists)
  - Article.content (if relationship exists)
  - User.name (if relationship exists)
  - Any other workspace model fields
```

### Accessing Global Fields

```
Method 1: Through Relationships
  SocialPost.sourceArticle.title
  SocialPost.sourceArticle.content

Method 2: Direct Workspace Access
  Use any field from workspace models
  Reference by Model.fieldName
  Available in action configuration

Example in Prompt:
  "Create a social post about:
   {Article.title}
   
   From this content:
   {Article.content}
   
   For platform:
   {SocialPost.platform}"
```

## Action Triggers

### Manual Trigger

```
User selects record(s)
Clicks "Run Action"
Chooses action to execute
Confirms execution
Action runs on selected record(s)

Use Cases:
  - One-off processing
  - Review before execution
  - Testing actions
```

### Schedule Trigger

```
Schedule: Daily at 9:00 AM
Filter: status = "Draft"
Action: Generate and Post
Behavior: Process all matching records

Use Cases:
  - Batch processing
  - Automated workflows
  - Recurring tasks
```

### Form Submission Trigger

```
When: New record created via form
Then: Automatically run action
Example: New customer → Send welcome email

Use Cases:
  - Immediate processing
  - Real-time automation
  - Event-driven workflows
```

### Webhook Trigger

```
External system sends webhook
Platform receives data
Creates/updates record
Triggers action

Use Cases:
  - Integration workflows
  - External event handling
  - Real-time sync
```

## Error Handling

### Retry Logic

```
Action Configuration:
  Retry on Failure: Yes
  Max Retries: 3
  Retry Delay: 30 seconds (exponential backoff)

Behavior:
  Attempt 1: Execute
  Fail → Wait 30s
  Attempt 2: Execute
  Fail → Wait 60s
  Attempt 3: Execute
  Fail → Wait 120s
  Attempt 4: Execute
  Fail → Mark as failed, log error
```

### Error Logging

```
Error Log Entry:
  Timestamp: 2025-10-20 10:30:45
  Action: Generate Social Post
  Record ID: 1234
  Step: AI Image Generation
  Error: API timeout after 30s
  Retry Attempt: 2/3
  Status: Retrying
```

### Fallback Actions

```
Primary Action: Post to Instagram
  If fails:
    Fallback: Save as draft
    Notify: Admin email
    Update: status = "Failed - Review Needed"
```

## Action Chaining

### Sequential Actions

```
Action 1: Generate Content
  Creates: Draft social posts

Action 2: Review Content
  Triggered: When Action 1 completes
  Updates: Adds review notes

Action 3: Publish Content
  Triggered: When approved = true
  Executes: Posts to platforms
```

### Conditional Chains

```
Main Action: Process Article

If Article.hasImages = true:
  → Run: "Optimize Images" action
Else:
  → Run: "Generate Featured Image" action

Then:
  → Run: "Create Social Posts" action
```

## Best Practices

### Action Design

**Keep Actions Focused**
```
Good:
  - One action per workflow
  - Clear purpose
  - Specific inputs/outputs

Avoid:
  - Do-everything actions
  - Too many steps
  - Unclear purpose
```

**Use Descriptive Names**
```
Good:
  - "Generate Social Post from Article"
  - "Post to Instagram and Track Analytics"
  - "Send Welcome Email to New Customer"

Avoid:
  - "Action 1"
  - "Process"
  - "Do Thing"
```

**Handle Errors Gracefully**
```
- Implement retries
- Log errors clearly
- Provide fallbacks
- Notify on critical failures
```

### Performance

**Optimize Step Order**
```
Good:
  1. Fast validation checks
  2. Quick data lookups
  3. AI processing (slower)
  4. API calls (slowest)

Efficient: Fail fast if possible
```

**Batch When Possible**
```
Instead of:
  - Loop 100 times, API call each time

Do:
  - Collect data in one step
  - Single batch API call
  - Process results
```

## Troubleshooting

### Common Issues

**Issue**: Action times out  
**Solution**: Reduce step complexity, increase timeout, optimize prompts

**Issue**: AI generates inconsistent results  
**Solution**: Improve prompt specificity, add examples, adjust temperature

**Issue**: API calls failing  
**Solution**: Check connection, verify OAuth, check rate limits

**Issue**: Fields not updating  
**Solution**: Verify field mapping, check permissions, review error logs

## Next Steps

- [Action Steps](./10-action-steps.md) - Detailed guide to each step type
- [Scheduling](./12-scheduling.md) - Automate action execution
- [API Connections](./11-api-connections.md) - Configure external services
- [Use Cases](./15-use-cases.md) - Real-world action examples

