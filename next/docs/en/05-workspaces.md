# Workspaces

## Overview

Workspaces are organizational containers within agents that group related models and manage API connections. Each workspace provides a self-contained environment for a specific project, campaign, or functional area.

## What is a Workspace?

A **workspace** is:
- A collection of related models
- A container for API connections
- A scope for data relationships
- An organizational boundary within an agent

Think of a workspace as a "sub-project" or "environment" within your larger agent.

## Workspace Architecture

```
Workspace: Social Media Campaign
  ├── Models
  │    ├── Content Calendar
  │    ├── Social Posts
  │    ├── Analytics
  │    └── Hashtags
  ├── API Connections
  │    ├── Facebook
  │    ├── Instagram
  │    ├── Twitter
  │    └── LinkedIn
  └── Shared Resources
       ├── Global Fields
       └── Cross-Model Actions
```

## Creating a Workspace

### Basic Setup

**Required Information**:
- **Name**: Descriptive identifier
- **Description**: Purpose and scope
- **Parent Agent**: Which agent it belongs to

**Example**:
```
Name: Q4 Holiday Campaign
Description: Manages all content and automation for Q4 holiday marketing
Agent: Marketing Automation Agent
```

### Configuration Options

**Settings**:
- **Default Timezone**: For schedules and dates
- **Default Currency**: For financial fields
- **Archival Policy**: How long to keep old records
- **Access Control**: Who can view/edit

## Workspace vs. Agent

### When to Use a Workspace

Use a new workspace for:
- ✅ Different campaigns (Q1 Campaign, Q2 Campaign)
- ✅ Different environments (Production, Staging)
- ✅ Different clients (within same business)
- ✅ Different projects (Project A, Project B)
- ✅ Related but separate workflows

### When to Use a New Agent

Use a new agent for:
- ✅ Completely different business functions
- ✅ Strict data isolation requirements
- ✅ Different permission structures
- ✅ Separate products or services

## Workspace Components

### 1. Models

Models define the data structures within your workspace.

**Example Models in Marketing Workspace**:
```
- Blog Posts
- Social Media Posts
- Email Campaigns
- Lead Lists
- Analytics Reports
```

### 2. API Connections

Each workspace manages its own API connections with an important constraint:

**One Connection Per API Type**

You can have:
- ✅ One Facebook connection
- ✅ One Instagram connection
- ✅ One Google Sheets connection
- ✅ One Airtable connection

You cannot have:
- ❌ Two Facebook connections
- ❌ Multiple Instagram accounts
- ❌ Different Google accounts for different models

**Why This Limitation?**

This ensures:
- Clear ownership of connections
- Simplified OAuth management
- Predictable data flow
- Reduced configuration complexity

**Workaround for Multiple Accounts**:

If you need multiple accounts of the same service:
```
Create separate workspaces:
  - Workspace 1: Facebook Account A
  - Workspace 2: Facebook Account B
```

### 3. Global Fields Concept

Within a workspace, all model fields are accessible to all actions. This is what we call "global workspace fields."

**Example**:
```
Workspace: Content Hub

Model A: Articles
  - Title
  - Content
  - Author

Model B: Social Posts
  - Platform
  - Post Text
  - Image URL

Action in Model B can use:
  - Model B fields (Platform, Post Text, Image URL)
  - Model A fields (Title, Content, Author)
  
This makes Model A fields "global" within the workspace
```

## Workspace Use Cases

### By Environment

#### Production Workspace
```
Purpose: Live, customer-facing automation
Configuration:
  - Real API connections
  - Production data
  - Full error handling
  - Monitoring enabled
```

#### Staging Workspace
```
Purpose: Testing before production
Configuration:
  - Test API connections
  - Sample data
  - Verbose logging
  - Experimentation allowed
```

#### Development Workspace
```
Purpose: Building and testing new features
Configuration:
  - Mock API connections
  - Synthetic data
  - Rapid iteration
  - Breaking changes OK
```

### By Campaign

#### Q1 Campaign Workspace
```
Models:
  - Campaign Content
  - Ad Creatives
  - Performance Metrics
  - Budget Tracking

Timeline: Jan 1 - Mar 31
Status: Completed (Archived)
```

#### Q2 Campaign Workspace
```
Models:
  - Campaign Content
  - Ad Creatives
  - Performance Metrics
  - Budget Tracking

Timeline: Apr 1 - Jun 30
Status: Active
```

### By Client

#### Client A Workspace
```
Purpose: Manage Client A's social media
API Connections:
  - Client A's Facebook
  - Client A's Instagram
  - Client A's LinkedIn

Models:
  - Content Calendar
  - Published Posts
  - Analytics
```

#### Client B Workspace
```
Purpose: Manage Client B's social media
API Connections:
  - Client B's Facebook
  - Client B's Instagram
  - Client B's LinkedIn

Models:
  - Content Calendar
  - Published Posts
  - Analytics
```

## Working with Global Workspace Fields

### Understanding the Scope

**Local Scope (Model Level)**:
```javascript
// Action in "Social Posts" model can directly access:
{
  platform: "Instagram",
  postText: "Check out our new product!",
  imageUrl: "https://..."
}
```

**Global Scope (Workspace Level)**:
```javascript
// Same action can also access fields from "Articles" model:
{
  // From Social Posts (local)
  platform: "Instagram",
  postText: "",
  
  // From Articles model (global workspace fields)
  articleTitle: "10 Tips for Better Marketing",
  articleContent: "Lorem ipsum...",
  articleAuthor: "Jane Doe"
}

// Action can use article fields to generate social post
```

### Practical Example

**Workspace**: Content Production

**Model 1**: Blog Articles
```
Fields:
  - id
  - title
  - content
  - publishedDate
  - author
```

**Model 2**: Social Posts
```
Fields:
  - id
  - sourceArticle (relationship to Blog Articles)
  - platform
  - postText
  - scheduledTime
```

**Action**: "Generate Social Post from Article"
```
Location: Social Posts model

Inputs:
  - Global: Blog Articles.title
  - Global: Blog Articles.content
  - Local: Social Posts.platform

Processing:
  AI Prompt: "Create a {platform} post about '{title}' from this content: {content}"

Outputs:
  - Local: Social Posts.postText
```

## API Connection Management

### Connecting an API

1. **Navigate to Workspace Settings**
2. **Select "Add Connection"**
3. **Choose API Provider**
   - Facebook
   - Instagram
   - Twitter/X
   - LinkedIn
   - Google Sheets
   - Airtable
   - Notion
   - Custom API

4. **Authorize with OAuth**
   - Redirect to provider
   - Grant permissions
   - Return to platform

5. **Configure Settings**
   - Select account (if multiple)
   - Set permissions scope
   - Test connection

### Connection Configuration

```
Connection: Instagram
Type: Social Media
OAuth Status: Connected
Account: @mybusiness
Permissions: 
  - Post content
  - Read analytics
  - Manage comments
Last Used: 2025-10-20 10:30 AM
Status: Active
```

### Using Connections in Actions

When creating an action with API steps:

```
Step: Post to Instagram

Connection: (Select from workspace connections)
  → Instagram (@mybusiness)

Endpoint: POST /media

Data:
  image_url: {Image URL field}
  caption: {Caption field}
```

### Connection Limits

**Per Workspace**:
- One connection per API provider type
- Unlimited total connections (different providers)
- OAuth tokens managed automatically
- Refresh tokens handled by platform

**Example Valid Configuration**:
```
Workspace Connections:
  ✅ Facebook (1)
  ✅ Instagram (1)
  ✅ Twitter (1)
  ✅ LinkedIn (1)
  ✅ Google Sheets (1)
  ✅ Airtable (1)
Total: 6 connections
```

**Example Invalid Configuration**:
```
Workspace Connections:
  ❌ Facebook Account A
  ❌ Facebook Account B
Error: Only one Facebook connection allowed per workspace
```

### Disconnecting APIs

To disconnect an API:
1. Navigate to Workspace Connections
2. Select the connection
3. Click "Disconnect"
4. Confirm action

**Impact**:
- All actions using this connection will fail
- Scheduled jobs will error
- OAuth token is revoked
- Connection can be re-established later

## Cross-Model Relationships

### Linking Models

Models within a workspace can reference each other:

```
Model: Blog Articles
  id: 1
  title: "How to Use AI"
  content: "..."

Model: Social Posts
  id: 101
  sourceArticle: 1 (→ Blog Articles)
  platform: "Instagram"
  postText: "Check out our article..."
```

### Creating Child Records

Actions can create records in related models:

```
Action: "Distribute Article to Social"

Location: Blog Articles model

Steps:
  1. Extract title and summary
  2. Create Instagram Post (child record in Social Posts model)
  3. Create Twitter Post (child record in Social Posts model)
  4. Create LinkedIn Post (child record in Social Posts model)

Result:
  One blog article → Three social posts
```

### Referencing Global Fields

Actions can read and write to any model in the workspace:

```
Action: "Update Analytics"

Location: Social Posts model

Inputs:
  - Social Posts.platform
  - Social Posts.sourceArticle.title (from Blog Articles)
  
Processing:
  Fetch analytics from API
  
Outputs:
  - Blog Articles.totalShares (update parent record)
  - Social Posts.likes (update current record)
```

## Workspace Organization Best Practices

### Naming Conventions

**Good Workspace Names**:
- Q4 2025 Holiday Campaign
- Production Environment
- Client Services - Acme Corp
- Instagram Content Hub
- Email Automation System

**Poor Workspace Names**:
- Workspace 1
- Test
- New
- Untitled

### Structuring Models

**Option 1: Flat Structure**
```
All related models in one workspace
- Customers
- Orders
- Products
- Invoices
- Support Tickets
```

**Option 2: Hierarchical Thinking**
```
Organize models by data flow
- Input Models (Forms)
- Processing Models (Work in progress)
- Output Models (Final results)
```

**Option 3: Functional Grouping**
```
Group by business function
- Content Models (Articles, Posts)
- Distribution Models (Schedules, Campaigns)
- Analytics Models (Metrics, Reports)
```

### Managing Complexity

**When a workspace gets too large**:
- Consider splitting into multiple workspaces
- Archive old data
- Create new workspaces for new campaigns
- Use relationships to maintain connections

**Signs a workspace needs splitting**:
- More than 15-20 models
- Unrelated workflows
- Different teams managing different parts
- Performance degradation

## Workspace Settings

### General Settings

```
Name: Social Media Automation
Description: Manages all social media posting and analytics
Created: 2025-01-15
Last Modified: 2025-10-20
Status: Active
Agent: Marketing Agent
```

### Access Control

```
Permissions:
  - Owner: user@example.com
  - Editors: team@example.com
  - Viewers: stakeholder@example.com
```

### Integration Settings

```
Default API Timeout: 30 seconds
Retry Failed Actions: Yes (3 attempts)
Error Notifications: email@example.com
Webhook URL: https://api.example.com/webhooks
```

## Monitoring & Analytics

### Workspace Metrics

```
Models: 8
Total Records: 15,234
API Connections: 4
Active Schedules: 12
Actions Executed (30 days): 45,678
Success Rate: 98.5%
```

### Activity Log

```
Recent Activity:
  - 10:30 AM: Action "Post to Instagram" executed successfully
  - 10:25 AM: New record created in "Social Posts" model
  - 10:20 AM: Schedule "Daily Posting" triggered
  - 10:15 AM: API connection "Instagram" refreshed
```

## Advanced Workspace Features

### Workspace Templates

Save workspace configuration as template:
- Model structures
- Form layouts
- Action definitions
- (Exclude actual data and API credentials)

### Workspace Cloning

Duplicate workspace for new campaign:
1. Select "Clone Workspace"
2. Choose what to copy (models, actions, schedules)
3. Exclude data (optional)
4. Name new workspace
5. Reconfigure API connections

### Workspace Export/Import

Export for backup or migration:
- JSON format
- Includes schema definitions
- Optionally includes data
- Excludes API credentials (security)

## Next Steps

- [Models & Sheets](./06-models-and-sheets.md) - Define your data structures
- [API Connections](./11-api-connections.md) - Deep dive into integrations
- [Actions](./09-actions.md) - Build workflows with global fields
- [Best Practices](./14-best-practices.md) - Optimize workspace design

