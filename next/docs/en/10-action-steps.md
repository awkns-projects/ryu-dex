# Action Steps

## Overview

Action steps are the individual operations that make up an action. Each step performs a specific task: AI reasoning, image generation, API calls, or data operations. This guide provides detailed information on configuring each type of step.

## Step Types

### 1. AI Reasoning
### 2. AI Image Generation  
### 3. API Execution
### 4. Data Operations

## AI Reasoning Steps

### Purpose

AI Reasoning steps use language models to:
- Generate text content
- Analyze and extract information
- Transform data
- Make intelligent decisions
- Classify and categorize

### Configuration

```
Step Configuration:
  Name: Generate Marketing Copy
  Type: AI Reasoning
  Model: GPT-4
  Temperature: 0.7
  Max Tokens: 1000
  Top P: 1.0
  Frequency Penalty: 0.0
  Presence Penalty: 0.0
```

### Model Selection

**GPT-4** (Default)
- Best quality
- Complex reasoning
- Longer context
- Higher cost

**GPT-3.5-Turbo**
- Fast response
- Good quality
- Lower cost
- Shorter context

**Claude**
- Long context
- Detailed analysis
- Balanced cost
- Strong reasoning

### Temperature Setting

```
Temperature: 0.0-0.3 (Focused, Deterministic)
  Use for:
    - Data extraction
    - Classification
    - Structured outputs
    - Fact-based content
  
Temperature: 0.4-0.7 (Balanced)
  Use for:
    - General content
    - Marketing copy
    - Product descriptions
    - Blog posts
  
Temperature: 0.8-1.0 (Creative)
  Use for:
    - Creative writing
    - Brainstorming
    - Artistic content
    - Varied outputs
```

### Prompt Structure

#### Basic Prompt
```
Prompt:
  "Write a blog post about {topic}"

Input Fields:
  - topic: Article.title

Output Field:
  - Article.content
```

#### Detailed Prompt
```
Prompt:
  "You are a professional copywriter specializing in {industry}.
   
   Write a compelling {contentType} about:
   Topic: {topic}
   
   Requirements:
   - Length: {wordCount} words
   - Tone: {tone}
   - Target Audience: {audience}
   - Include: {requirements}
   
   Format:
   - Start with an attention-grabbing hook
   - Include 3-5 main points
   - End with a call to action"

Input Fields:
  - industry: Company.industry
  - contentType: Content.type
  - topic: Content.topic
  - wordCount: Content.targetLength
  - tone: Content.tone
  - audience: Content.targetAudience
  - requirements: Content.requirements

Output Field:
  - Content.generatedText
```

### Prompt Techniques

#### Chain of Thought
```
Prompt:
  "Let's think step by step:
   
   1. First, analyze the article topic: {title}
   2. Identify the target audience
   3. Determine key messages
   4. Craft an engaging social post
   
   Article content: {content}"

Encourages structured reasoning
```

#### Few-Shot Examples
```
Prompt:
  "Create a product tagline following these examples:
   
   Product: Wireless Headphones
   Tagline: 'Freedom in Every Beat'
   
   Product: Smart Watch
   Tagline: 'Time Reimagined'
   
   Product: {productName}
   Features: {features}
   Tagline:"

Guides output style
```

#### Role-Based
```
Prompt:
  "You are an expert social media manager with 10 years of experience.
   Your specialty is creating viral content for {platform}.
   
   Create a post about: {topic}
   
   Remember to:
   - Use platform-specific best practices
   - Include relevant hashtags
   - Optimize for engagement"

Sets context and expertise
```

#### Structured Output
```
Prompt:
  "Analyze this article and provide output in JSON format:
   
   {
     'mainTopic': 'string',
     'targetAudience': 'string',
     'keyPoints': ['string', 'string', 'string'],
     'tone': 'string',
     'wordCount': number
   }
   
   Article: {content}"

Ensures parseable output
```

### Response Handling

```
Step Configuration:
  Parse Response As: Plain Text | JSON | Markdown
  
  Post-Processing:
    - Trim whitespace: Yes
    - Remove unwanted characters: Yes
    - Validate format: Yes
    - Extract specific fields: Yes

Output Mapping:
  Full Response → Content.generated
  Extracted Title → Content.title
  Extracted Summary → Content.summary
```

## AI Image Generation Steps

### Purpose

Generate images from text descriptions using:
- DALL-E 3
- Midjourney
- Stable Diffusion
- Other image generation models

### Configuration

```
Step Configuration:
  Name: Generate Featured Image
  Type: AI Image Generation
  Model: DALL-E 3
  Size: 1792x1024 (16:9)
  Quality: HD | Standard
  Style: Natural | Vivid
  Number of Images: 1-4
```

### Size Options

```
DALL-E 3 Sizes:
  - 1024x1024 (Square)
  - 1792x1024 (Landscape)
  - 1024x1792 (Portrait)

Stable Diffusion Sizes:
  - 512x512
  - 768x768
  - 512x768
  - 768x512
  - Custom (with limits)

Midjourney Sizes:
  - Aspect ratio based
  - --ar 16:9, --ar 4:3, etc.
```

### Quality Settings

```
HD Quality:
  - Higher resolution
  - More detail
  - Better composition
  - Higher cost
  - Slower generation

Standard Quality:
  - Fast generation
  - Good quality
  - Lower cost
  - Suitable for most uses
```

### Prompt Engineering for Images

#### Effective Image Prompts

```
Basic:
  "A modern office workspace"

Enhanced:
  "Professional photograph of a modern office workspace,
   natural daylight from large windows, minimalist design,
   wooden desk with laptop and coffee, indoor plants,
   shallow depth of field, clean aesthetic, 4k quality"

Expert:
  "Editorial photograph for business magazine, modern startup office,
   golden hour lighting through floor-to-ceiling windows,
   collaboration space with designers working at standing desks,
   MacBooks and sketches visible, potted plants, white walls,
   Scandinavian interior design, shot on Canon EOS R5,
   35mm f/1.4 lens, shallow depth of field, cinematic composition"
```

#### Style Specifications

```
Photography Styles:
  - "Professional product photography, white background, studio lighting"
  - "Editorial fashion photography, high contrast, dramatic lighting"
  - "Street photography style, candid moment, natural light"
  - "Macro photography, extreme close-up, bokeh background"

Illustration Styles:
  - "Flat design illustration, minimal colors, vector art"
  - "Isometric illustration, modern tech startup theme"
  - "Hand-drawn sketch, ink on paper, loose lines"
  - "Watercolor painting, soft colors, artistic brushstrokes"

Digital Art Styles:
  - "3D render, Blender, Octane renderer, photorealistic"
  - "Low poly art style, geometric shapes, vibrant colors"
  - "Pixel art, 16-bit style, retro gaming aesthetic"
  - "Concept art, matte painting, fantasy landscape"
```

#### Composition & Technical Details

```
Composition:
  - "Centered composition, symmetrical"
  - "Rule of thirds, subject in left third"
  - "Bird's eye view, top-down perspective"
  - "Worm's eye view, dramatic low angle"

Lighting:
  - "Golden hour, warm sunset lighting"
  - "Studio lighting, three-point setup"
  - "Dramatic rim lighting, dark background"
  - "Soft diffused light, overcast day"

Camera Settings (for photorealistic):
  - "Shot on Canon EOS R5, 85mm f/1.2 lens"
  - "35mm film photography, Kodak Portra 400"
  - "iPhone photography, Portrait mode"
```

### Dynamic Prompts

```
Prompt Template:
  "Create a {style} image for {contentType}:
   
   Subject: {subject}
   Style: {visualStyle}
   Mood: {mood}
   Colors: {colorPalette}
   
   Technical details:
   - {aspectRatio} aspect ratio
   - {lightingType} lighting
   - {qualityDescriptor}"

Input Fields:
  - style: Content.imageStyle
  - contentType: Content.type
  - subject: Content.topic
  - visualStyle: Content.visualPreference
  - mood: Content.mood
  - colorPalette: Brand.colors
  - aspectRatio: Content.format
  - lightingType: Content.lighting
  - qualityDescriptor: "4k, high detail, professional"

Example Output:
  "Create a professional photograph image for blog header:
   
   Subject: Remote team collaboration
   Style: Modern corporate
   Mood: Inspiring and energetic
   Colors: Blue and white with green accents
   
   Technical details:
   - 16:9 aspect ratio
   - Natural window lighting
   - 4k, high detail, professional"
```

### Image Post-Processing

```
After Generation:
  
  1. Save Image
     URL → Content.imageUrl
     Filename → Content.imageFilename
  
  2. Generate Thumbnail
     Size: 400x400
     URL → Content.thumbnailUrl
  
  3. Extract Metadata
     Width → Content.imageWidth
     Height → Content.imageHeight
     Size → Content.imageSize
  
  4. Optional Optimizations
     - Compress for web
     - Convert format
     - Add watermark
     - Generate multiple sizes
```

## API Execution Steps

### Purpose

Interact with external services:
- Post content to social media
- Fetch data from APIs
- Trigger webhooks
- Sync with external systems
- Update third-party services

### HTTP Methods

#### GET Request
```
Step: Fetch User Data

Method: GET
URL: https://api.example.com/users/{userId}
Headers:
  Authorization: Bearer {oauth_token}
  Content-Type: application/json

Query Parameters:
  include: profile,settings
  format: json

Response Mapping:
  response.data.name → User.name
  response.data.email → User.email
  response.data.created_at → User.signupDate
```

#### POST Request
```
Step: Create Social Post

Method: POST
URL: https://api.instagram.com/v1/media
Headers:
  Authorization: Bearer {oauth_token}
  Content-Type: application/json

Body:
  {
    "caption": "{SocialPost.caption}",
    "image_url": "{SocialPost.imageUrl}",
    "location_id": "{SocialPost.locationId}"
  }

Response Mapping:
  response.id → SocialPost.externalId
  response.permalink → SocialPost.url
  response.timestamp → SocialPost.postedAt
```

#### PUT Request
```
Step: Update Product

Method: PUT
URL: https://api.shop.com/products/{productId}
Body:
  {
    "title": "{Product.name}",
    "price": {Product.price},
    "inventory": {Product.stock}
  }

Response:
  Success → Product.syncStatus = "Synced"
```

#### DELETE Request
```
Step: Remove External Record

Method: DELETE
URL: https://api.example.com/records/{externalId}

Response:
  Success → Record.externalId = null
  Success → Record.synced = false
```

### Authentication

#### OAuth 2.0
```
Connection: Use workspace connection
Provider: Instagram
Auth Type: OAuth 2.0

Automatic:
  - Token refresh
  - Header injection
  - Credential management
```

#### API Key
```
Headers:
  X-API-Key: {apiKey}

Configuration:
  API Key Source: Workspace settings
  Key Field: api_key
```

#### Bearer Token
```
Headers:
  Authorization: Bearer {token}

Token Source: 
  - Workspace connection
  - Environment variable
  - Static configuration
```

### Request Configuration

#### Headers
```
Headers:
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer {token}
  X-Custom-Header: {customValue}
  User-Agent: AutomationPlatform/1.0
```

#### Query Parameters
```
URL: https://api.example.com/search

Parameters:
  q: {searchQuery}
  limit: 100
  offset: {pageOffset}
  sort: created_at
  order: desc

Final URL:
  https://api.example.com/search?q=automation&limit=100&offset=0&sort=created_at&order=desc
```

#### Request Body
```
JSON Body:
  {
    "title": "{Post.title}",
    "content": "{Post.content}",
    "author": {
      "id": "{Author.id}",
      "name": "{Author.name}"
    },
    "tags": ["{Tag1}", "{Tag2}", "{Tag3}"],
    "metadata": {
      "source": "automation",
      "version": "1.0"
    }
  }

Form Data:
  Key: value pairs
  file: {File.upload}
  description: {File.description}

URL Encoded:
  param1=value1&param2=value2
```

### Response Handling

#### Success Response
```
Response Status: 200-299

Body:
  {
    "success": true,
    "data": {
      "id": "12345",
      "url": "https://...",
      "created_at": "2025-10-20T10:30:00Z"
    }
  }

Mapping:
  response.data.id → Record.externalId
  response.data.url → Record.externalUrl
  response.data.created_at → Record.publishedAt
```

#### Error Response
```
Response Status: 400-599

Error Handling:
  400 (Bad Request):
    Log error
    Save error message to Record.errorLog
    Mark Record.status = "Failed"
  
  401 (Unauthorized):
    Refresh OAuth token
    Retry request
  
  429 (Rate Limit):
    Wait {retry_after} seconds
    Retry request
  
  500 (Server Error):
    Retry 3 times with exponential backoff
    If still failing, mark as failed
```

#### Response Parsing
```
JSON Response:
  Parse automatically
  Extract nested fields
  Handle arrays

Example:
  response.data.items[0].title → Field1
  response.data.items[1].title → Field2
  response.data.meta.total → TotalCount
```

### Rate Limiting

```
Configuration:
  Max Requests Per Minute: 60
  Backoff Strategy: Exponential
  Retry After: Read from response header

Behavior:
  - Track request count
  - Pause when limit reached
  - Resume when window resets
  - Respect Retry-After header
```

## Data Operation Steps

### Creating Records

#### Create Single Record
```
Step: Create Child Post

Type: Create Record
Target Model: Social Posts

Field Values:
  sourceArticle: {current record ID}
  platform: "Instagram"
  status: "Draft"
  createdBy: "Automation"
  createdAt: {currentTimestamp}

Output:
  New record ID → Article.lastChildId
```

#### Create Multiple Records
```
Step: Create Posts for All Platforms

Type: Create Multiple Records
Target Model: Social Posts

For Each: ["Instagram", "Twitter", "LinkedIn", "Facebook"]
  Create Record:
    sourceArticle: {current record ID}
    platform: {current platform}
    status: "Draft"

Output:
  Created count → Article.childPostsCount
```

### Updating Records

#### Update Current Record
```
Step: Mark as Processed

Type: Update Record
Target: Current record

Updates:
  status: "Completed"
  processedAt: {currentTimestamp}
  processedBy: "Action: {actionName}"
  version: {currentVersion + 1}
```

#### Update Related Records
```
Step: Update Parent Article

Type: Update Record
Target: Related record (sourceArticle)

Updates:
  lastPostedAt: {currentTimestamp}
  totalPosts: {currentValue + 1}
  status: "Active"
```

#### Conditional Update
```
Step: Update If Threshold Met

Type: Conditional Update

Condition: If {SocialPost.likes} > 100
  Then Update Article:
    trending: true
    trendingDate: {currentTimestamp}
    featured: true

Condition: If {SocialPost.likes} < 10
  Then Update Article:
    performanceFlag: "Low engagement"
```

### Deleting Records

```
Step: Clean Up Old Drafts

Type: Delete Records
Target Model: Social Posts

Condition:
  status = "Draft"
  AND createdAt < 30 days ago

Safety:
  Confirm Before Delete: Yes
  Max Delete Count: 100
  Soft Delete: Yes (move to archive)
```

### Batch Operations

```
Step: Bulk Update Status

Type: Batch Update
Target: Multiple records

Filter:
  status = "Pending"
  AND assignedTo = {currentUser}

Update All:
  status: "In Progress"
  startedAt: {currentTimestamp}

Limit: 50 records per execution
```

## Step Chaining and Dependencies

### Sequential Steps

```
Action: Complete Content Pipeline

Step 1: AI Reasoning
  Generate social caption
  Output → caption field

Step 2: AI Image Generation  
  Uses → caption as inspiration
  Output → imageUrl field

Step 3: API Execution
  Uses → caption and imageUrl
  Posts to Instagram
  Output → externalId

Step 4: Data Update
  Uses → externalId
  Updates → status = "Posted"

Each step uses outputs from previous steps
```

### Conditional Steps

```
Action: Smart Content Publishing

Step 1: Analyze Content
  AI evaluates quality
  Output → qualityScore

Step 2a: If qualityScore > 8
  → Publish immediately
  → Mark as featured

Step 2b: If qualityScore 5-8
  → Send for review
  → Notify editor

Step 2c: If qualityScore < 5
  → Save as draft
  → Flag for revision

Different paths based on results
```

### Parallel Steps (Future Feature)

```
Action: Multi-Platform Publishing

Execute in Parallel:
  - Step A: Post to Instagram
  - Step B: Post to Twitter  
  - Step C: Post to LinkedIn
  - Step D: Update analytics

Wait for all to complete
Then: Mark as fully published

Faster execution for independent operations
```

## Error Handling

### Step-Level Errors

```
Step Configuration:
  On Error:
    - Continue to next step
    - Stop entire action
    - Execute fallback step
    - Retry N times

  Error Logging:
    - Log to field: Record.errorLog
    - Send notification: email@example.com
    - Trigger webhook: https://...
```

### Retry Configuration

```
Step: API Post to Instagram

Retry Settings:
  Max Retries: 3
  Initial Delay: 5 seconds
  Backoff Multiplier: 2x
  Max Delay: 60 seconds

Execution:
  Attempt 1: Execute immediately
  Fail → Wait 5s
  Attempt 2: Execute
  Fail → Wait 10s
  Attempt 3: Execute
  Fail → Wait 20s
  Attempt 4: Execute
  Fail → Mark as failed, log error
```

## Best Practices

### AI Steps

- Use specific, detailed prompts
- Include examples for consistency
- Set appropriate temperature
- Validate outputs
- Handle edge cases

### Image Generation

- Be descriptive with prompts
- Specify style and composition
- Include technical details
- Choose appropriate size
- Consider generation time

### API Steps

- Handle authentication properly
- Implement retry logic
- Respect rate limits
- Parse responses carefully
- Log errors comprehensively

### Data Operations

- Validate before updating
- Use transactions when possible
- Implement rollback on errors
- Maintain data integrity
- Archive rather than delete

## Next Steps

- [Actions](./09-actions.md) - Understanding action workflows
- [API Connections](./11-api-connections.md) - Setting up integrations
- [Scheduling](./12-scheduling.md) - Automating step execution
- [Best Practices](./14-best-practices.md) - Optimization techniques

