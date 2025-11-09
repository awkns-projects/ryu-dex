# Use Cases & Examples

## Overview

This guide provides real-world examples of how to use Ryu for common automation scenarios. Each use case includes complete setup instructions, data models, actions, and schedules.

## Content Creation & Marketing

### Use Case 1: Blog to Social Media Pipeline

**Goal**: Automatically convert blog articles into social media posts for multiple platforms.

#### Setup

**Agent**: Content Marketing Hub

**Workspace**: Blog Distribution

**Models**:

```
Model 1: Blog Articles
Fields:
  - id (auto)
  - title (Text, required)
  - content (Long Text, required)
  - author (Text)
  - category (Select: Tech, Marketing, Product)
  - publishedDate (Date)
  - featuredImage (File)
  - status (Select: Draft, Published)
  - socialPostsCreated (Checkbox)

Model 2: Social Posts
Fields:
  - id (auto)
  - sourceArticle (Relationship → Blog Articles)
  - platform (Select: Instagram, Twitter, LinkedIn, Facebook)
  - caption (Long Text)
  - imageUrl (URL)
  - status (Select: Draft, Ready, Posted)
  - scheduledTime (DateTime)
  - postedAt (DateTime)
  - externalId (Text)
  - likes (Number)
  - comments (Number)
  - shares (Number)
```

**Form**: New Blog Article

```
Fields:
  - Title
  - Content
  - Author
  - Category
  - Featured Image
```

**Action 1**: Generate Social Posts

```
Location: Blog Articles model
Trigger: Manual or on publish

Step 1: AI Reasoning - Extract Key Points
  Input: Article.content
  Prompt: "Extract 3 key takeaways from: {content}"
  Output: Temp.keyPoints

Step 2: Create Instagram Post
  Type: Create Record
  Model: Social Posts
  Fields:
    sourceArticle: current record
    platform: "Instagram"
    status: "Draft"

Step 3: AI Reasoning - Instagram Caption
  Input: Article.title, Temp.keyPoints
  Prompt: "Create Instagram caption (max 200 chars):
           Title: {title}
           Points: {keyPoints}
           Include relevant hashtags and emojis"
  Output: Social Posts (from Step 2).caption

Step 4: AI Image Generation - Instagram Visual
  Input: Article.title
  Prompt: "Create Instagram square image (1:1):
           Topic: {title}
           Style: Modern, colorful, engaging
           Include text overlay with title"
  Output: Social Posts (from Step 2).imageUrl

Step 5-8: Repeat for Twitter, LinkedIn, Facebook
  (Same pattern with platform-specific prompts)

Step 9: Update Article
  Update: Article.socialPostsCreated = true
```

**Action 2**: Post to Platform

```
Location: Social Posts model
Trigger: Schedule

Step 1: Conditional - Route to Platform
  If platform = "Instagram":
    → Execute Instagram API call
  If platform = "Twitter":
    → Execute Twitter API call
  (etc.)

Step 2: API Execution
  Connection: {platform} connection
  Method: POST
  Endpoint: /create_post
  Body:
    caption: {caption}
    image_url: {imageUrl}
  
  Output:
    response.id → externalId
    response.url → externalUrl

Step 3: Update Status
  Update:
    status: "Posted"
    postedAt: {NOW}
```

**Schedule**: Daily Social Posting

```
Model: Social Posts
Filter: status = "Ready" AND scheduledTime <= NOW
Action: Post to Platform
Frequency: Every hour
Limit: 10 posts per run
```

#### Workflow

1. Author writes blog article
2. Submits via form
3. Manually runs "Generate Social Posts" action
4. Reviews generated posts (edits if needed)
5. Sets status = "Ready" and scheduledTime
6. Schedule automatically posts at specified times
7. Separate schedule fetches analytics daily

#### Results

- One blog article → 4 social posts
- Automated daily posting
- Analytics tracking
- 90% time savings on social media management

---

### Use Case 2: Multi-Platform Content Calendar

**Goal**: Centralized content planning and distribution across all channels.

#### Setup

**Models**:

```
Model 1: Content Calendar
Fields:
  - title (Text)
  - type (Select: Blog, Video, Podcast, Infographic)
  - theme (Text)
  - targetDate (Date)
  - status (Select: Ideation, In Progress, Ready, Published)
  - assignedTo (Text)

Model 2: Platform Posts
Fields:
  - contentItem (Relationship → Content Calendar)
  - platform (Select)
  - postText (Long Text)
  - media (File)
  - scheduled (DateTime)
  - status (Select)
```

**Action**: Distribute Content

```
Creates platform-specific versions of content item
Adapts message for each platform
Schedules based on optimal posting times
```

**Schedule**: Rolling 30-Day Calendar

```
Weekly review of upcoming content
Auto-creates draft posts 7 days before target
Sends reminder if content not ready 3 days before
```

---

## E-commerce Automation

### Use Case 3: Product Catalog Management

**Goal**: Sync products with Shopify, generate descriptions with AI, manage inventory.

#### Setup

**Models**:

```
Model: Products
Fields:
  - sku (Text, unique)
  - name (Text)
  - rawSpecs (Text)
  - generatedDescription (Long Text)
  - price (Currency)
  - inventory (Number)
  - shopifyId (Text)
  - lastSynced (DateTime)
  - needsSync (Checkbox)
```

**Action**: Generate Product Description

```
Step 1: AI Reasoning
  Input: rawSpecs
  Prompt: "Create compelling product description:
           Specs: {rawSpecs}
           Format: 2 paragraphs, 100-150 words
           Tone: Persuasive, highlighting benefits
           Include SEO keywords"
  Output: generatedDescription

Step 2: AI Reasoning - Extract Keywords
  Input: generatedDescription
  Output: seoKeywords
```

**Action**: Sync to Shopify

```
Step 1: Check if product exists
  API: GET /products
  Search by SKU

Step 2: Create or Update
  If exists:
    API: PUT /products/{id}
  If not:
    API: POST /products
  
  Body:
    title: {name}
    description: {generatedDescription}
    price: {price}
    inventory: {inventory}

Step 3: Update sync status
  lastSynced: NOW
  needsSync: false
  shopifyId: response.id
```

**Schedule**: Hourly Sync

```
Filter: needsSync = true
Action: Sync to Shopify
Frequency: Every hour
```

#### Workflow

1. New products added to spreadsheet
2. Import to Products model
3. Action generates descriptions
4. Review and approve
5. Mark needsSync = true
6. Schedule syncs to Shopify hourly
7. Inventory updates sync back from Shopify

---

### Use Case 4: Order Processing Automation

**Goal**: Process orders, send confirmations, create shipping tasks.

#### Setup

**Models**:

```
Model 1: Orders
Fields:
  - orderId (Text)
  - customerEmail (Email)
  - items (Long Text)
  - total (Currency)
  - status (Select: New, Processing, Shipped, Delivered)
  - confirmationSent (Checkbox)

Model 2: Shipping Tasks
Fields:
  - order (Relationship → Orders)
  - address (Text)
  - carrier (Select)
  - trackingNumber (Text)
  - status (Select)
```

**Action**: Process New Order

```
Step 1: Send Confirmation Email
  API: SendGrid
  Template: order_confirmation
  Data: order details

Step 2: Create Shipping Task
  Create Record: Shipping Tasks
  Fields: order reference, address, status = "Pending"

Step 3: Update Order
  status: "Processing"
  confirmationSent: true
```

**Webhook**: Shopify Order Created

```
Trigger: When Shopify sends webhook
Action: Create order record → Process New Order
```

---

## Customer Engagement

### Use Case 5: Lead Nurturing Campaign

**Goal**: Automated follow-up sequence for new leads with AI personalization.

#### Setup

**Models**:

```
Model 1: Leads
Fields:
  - name (Text)
  - email (Email)
  - company (Text)
  - interests (Multi-Select)
  - stage (Select: New, Contacted, Engaged, Qualified)
  - lastContactDate (Date)

Model 2: Communications
Fields:
  - lead (Relationship → Leads)
  - type (Select: Email, Call, Meeting)
  - content (Long Text)
  - sentAt (DateTime)
  - response (Long Text)
```

**Action**: Generate Personalized Email

```
Step 1: AI Reasoning
  Input: Lead.name, Lead.company, Lead.interests
  Prompt: "Write personalized outreach email:
           Recipient: {name} at {company}
           Interests: {interests}
           Tone: Professional but friendly
           Length: 3 short paragraphs
           Include relevant value proposition
           End with specific call to action"
  Output: emailContent

Step 2: Send Email
  API: SendGrid
  To: {email}
  Subject: AI-generated
  Body: {emailContent}

Step 3: Create Communication Record
  Create Record: Communications
  Fields: lead, type, content, sentAt

Step 4: Update Lead
  lastContactDate: TODAY
  stage: "Contacted"
```

**Schedule**: Daily Lead Outreach

```
Filter: stage = "New" AND createdDate <= TODAY - 1 day
Action: Generate Personalized Email
Frequency: Daily at 9:00 AM
Limit: 20 leads per day
```

---

### Use Case 6: Customer Support Ticket Routing

**Goal**: AI analyzes tickets, categorizes, assigns to right team.

#### Setup

**Models**:

```
Model: Support Tickets
Fields:
  - ticketId (Text)
  - customerName (Text)
  - subject (Text)
  - description (Long Text)
  - category (Select: Technical, Billing, General)
  - priority (Select: Low, Medium, High, Urgent)
  - assignedTo (Select: Team A, Team B, Team C)
  - status (Select: New, In Progress, Resolved)
```

**Action**: Analyze and Route Ticket

```
Step 1: AI Reasoning - Categorize
  Input: subject, description
  Prompt: "Analyze this support ticket:
           Subject: {subject}
           Description: {description}
           
           Output JSON:
           {
             'category': 'Technical|Billing|General',
             'priority': 'Low|Medium|High|Urgent',
             'suggestedTeam': 'Team A|Team B|Team C',
             'summary': 'one sentence'
           }"
  Output: Parse JSON to fields

Step 2: Update Ticket
  category: from AI
  priority: from AI
  assignedTo: from AI

Step 3: Send Notification
  API: Slack
  Channel: #{assignedTo}
  Message: "New {priority} {category} ticket: {summary}"
```

**Trigger**: Form submission creates ticket → Auto-runs action

---

## Operations & Productivity

### Use Case 7: Meeting Notes to Action Items

**Goal**: Convert meeting transcripts into organized tasks and summaries.

#### Setup

**Models**:

```
Model 1: Meetings
Fields:
  - title (Text)
  - date (Date)
  - attendees (Text)
  - transcript (Long Text)
  - summary (Long Text)
  - actionItemsGenerated (Checkbox)

Model 2: Tasks
Fields:
  - title (Text)
  - description (Long Text)
  - assignee (Text)
  - dueDate (Date)
  - sourceMeeting (Relationship → Meetings)
  - status (Select: To Do, In Progress, Done)
```

**Action**: Process Meeting Notes

```
Step 1: AI Reasoning - Generate Summary
  Input: transcript
  Prompt: "Summarize this meeting transcript in 3 paragraphs:
           1. Key decisions made
           2. Important discussions
           3. Next steps
           Transcript: {transcript}"
  Output: summary

Step 2: AI Reasoning - Extract Action Items
  Input: transcript
  Prompt: "Extract action items from meeting.
           For each item, provide:
           - Task title
           - Assignee (from attendees)
           - Suggested due date
           
           Output as JSON array"
  Output: Temp.actionItems

Step 3: Create Task Records
  For each item in actionItems:
    Create Record: Tasks
    Parse JSON to fields

Step 4: Update Meeting
  actionItemsGenerated: true
```

---

### Use Case 8: Invoice Generation and Tracking

**Goal**: Generate invoices from time sheets, send to clients, track payments.

#### Setup

**Models**:

```
Model 1: Time Entries
Fields:
  - client (Text)
  - project (Text)
  - date (Date)
  - hours (Number)
  - rate (Currency)
  - description (Text)
  - invoiced (Checkbox)

Model 2: Invoices
Fields:
  - invoiceNumber (Text, auto)
  - client (Text)
  - items (Long Text)
  - subtotal (Currency)
  - tax (Currency)
  - total (Currency)
  - sentDate (Date)
  - paidDate (Date)
  - status (Select: Draft, Sent, Paid, Overdue)
```

**Action**: Generate Invoice

```
Step 1: Aggregate Time Entries
  Filter: client = {currentClient} AND invoiced = false
  Calculate: Sum of hours * rate

Step 2: AI Reasoning - Format Invoice
  Input: time entries
  Output: Formatted invoice items

Step 3: Create Invoice Record
  Generate invoice number
  Calculate totals
  status: "Draft"

Step 4: Generate PDF (External Service)
  API: PDF generation service
  Template: invoice_template
  Data: invoice details

Step 5: Send Email
  API: Email service
  To: client
  Attach: PDF
  Update: status = "Sent", sentDate = TODAY

Step 6: Mark Time Entries
  Update all: invoiced = true
```

**Schedule**: Monthly Invoice Generation

```
Runs: Last day of each month
Filter: Clients with uninvoiced time
Action: Generate Invoice
```

---

## Analytics & Reporting

### Use Case 9: Social Media Performance Dashboard

**Goal**: Aggregate metrics from all platforms, generate insights.

#### Setup

**Models**:

```
Model: Social Analytics
Fields:
  - date (Date)
  - platform (Select)
  - posts (Number)
  - totalLikes (Number)
  - totalComments (Number)
  - totalShares (Number)
  - engagement_rate (Number)
  - insights (Long Text)
```

**Action**: Fetch Daily Analytics

```
For each platform:
  Step 1: API Call - Fetch Metrics
    Connection: Platform API
    Endpoint: /insights
    Period: Yesterday
  
  Step 2: Create Analytics Record
    Parse API response
    Store metrics
  
  Step 3: AI Reasoning - Generate Insights
    Input: metrics
    Prompt: "Analyze these social media metrics:
             {metrics}
             Provide:
             - Performance summary
             - Notable trends
             - Recommendations"
    Output: insights
```

**Schedule**: Daily at 11:00 PM

```
Action: Fetch Daily Analytics
Generates yesterday's analytics report
```

---

### Use Case 10: Weekly Performance Email

**Goal**: AI-generated weekly summary sent to stakeholders.

#### Setup

**Action**: Generate Weekly Report

```
Step 1: Query Last Week's Data
  Aggregate metrics from all models

Step 2: AI Reasoning - Write Report
  Input: Weekly data
  Prompt: "Create executive summary of this week's performance:
           {data}
           Include:
           - Key highlights
           - Metrics comparison to last week
           - Notable achievements
           - Areas for improvement
           Format as professional email"
  Output: reportContent

Step 3: Send Email
  API: SendGrid
  To: stakeholders@company.com
  Subject: "Weekly Performance Report - [Week]"
  Body: {reportContent}
```

**Schedule**: Every Monday at 8:00 AM

```
Action: Generate Weekly Report
Summarizes previous week
```

---

## Integration Workflows

### Use Case 11: CRM to Platform Sync

**Goal**: Bidirectional sync between Salesforce and platform.

#### Setup

**Webhook Incoming**: Salesforce → Platform

```
When: Contact created in Salesforce
Then: Create record in Contacts model
Trigger: Welcome sequence action
```

**Schedule Outgoing**: Platform → Salesforce

```
Filter: Contacts where lastUpdated > lastSynced
Action: Sync to Salesforce
Frequency: Every 30 minutes
```

---

## Best Practices from Use Cases

### Key Patterns

1. **Modular Actions**: Break complex workflows into smaller actions
2. **Error Handling**: Always include fallbacks and retries
3. **Scheduling**: Use schedules for batch processing
4. **AI Enhancement**: Use AI for content generation and analysis
5. **API Integration**: Connect external services for extended functionality
6. **Child Records**: Create related records to maintain relationships
7. **Status Tracking**: Use status fields to control flow
8. **Filtering**: Use precise filters in schedules
9. **Notifications**: Keep stakeholders informed
10. **Analytics**: Track and analyze performance

### Common Components

- **Forms**: User data entry
- **Actions**: Processing workflows
- **Schedules**: Automated execution
- **API Connections**: External integrations
- **Relationships**: Link related data
- **AI Steps**: Generation and analysis

## Next Steps

- [Best Practices](./14-best-practices.md) - Optimization techniques
- [Troubleshooting](./16-troubleshooting.md) - Solve common problems
- [Actions](./09-actions.md) - Build your own workflows

