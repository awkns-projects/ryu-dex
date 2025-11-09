# API Connections

## Overview

API Connections enable your workspace to interact with external services through OAuth authentication and HTTP requests. Each workspace can connect to multiple services, with one connection per service type.

## What is an API Connection?

An **API connection** is:
- OAuth-authenticated access to external services
- Managed at the workspace level
- Used by actions to make API calls
- Automatically refreshes tokens
- Limited to one per service type per workspace

## Supported Services

### Social Media
- **Facebook** - Post, read pages, manage ads
- **Instagram** - Post media, read insights, manage comments
- **Twitter/X** - Tweet, read timeline, manage account
- **LinkedIn** - Post articles, company pages, read analytics
- **TikTok** - Upload videos, read analytics
- **Pinterest** - Create pins, manage boards

### Productivity
- **Google Workspace** - Gmail, Sheets, Docs, Drive, Calendar
- **Microsoft 365** - Outlook, Excel, Word, OneDrive
- **Slack** - Send messages, read channels, manage workspace
- **Notion** - Create pages, update databases
- **Airtable** - Read/write records, manage bases

### E-commerce
- **Shopify** - Product management, orders, inventory
- **WooCommerce** - Products, customers, orders
- **Stripe** - Payments, customers, subscriptions
- **Square** - Payments, inventory, customers

### Marketing
- **Mailchimp** - Email campaigns, lists, automation
- **HubSpot** - CRM, marketing automation, analytics
- **SendGrid** - Transactional emails
- **ActiveCampaign** - Email marketing, automation

### Development
- **GitHub** - Repos, issues, pull requests
- **GitLab** - Projects, issues, pipelines
- **Jira** - Issues, projects, workflows
- **Trello** - Boards, cards, lists

### Custom APIs
- **REST API** - Custom HTTP endpoints
- **GraphQL** - Custom GraphQL endpoints
- **Webhooks** - Receive external events

## Creating a Connection

### OAuth Connection Flow

#### Step 1: Select Service
```
Navigate to: Workspace → Connections → Add Connection
Select: Instagram
```

#### Step 2: Authorize
```
1. Click "Connect Instagram"
2. Redirect to Instagram login
3. Login with Instagram account
4. Review requested permissions
5. Click "Authorize"
6. Redirect back to platform
```

#### Step 3: Configure
```
Connection Settings:
  Service: Instagram
  Account: @mybusiness
  Status: Connected
  Permissions: Post media, Read insights
  Token Expires: Auto-refresh enabled
```

#### Step 4: Test
```
Test Connection:
  Method: GET
  Endpoint: /me
  Expected: Account information
  
  Result: ✓ Connection successful
```

### API Key Connection

For services using API keys instead of OAuth:

```
Service: Custom REST API
Authentication Type: API Key

Configuration:
  API Key: sk_live_abc123...
  Key Location: Header
  Header Name: X-API-Key
  
  Or:
  
  Key Location: Query Parameter
  Parameter Name: api_key
```

### Basic Auth Connection

```
Service: Custom Service
Authentication Type: Basic Auth

Configuration:
  Username: api_user
  Password: ••••••••
  
Automatically encodes as:
  Authorization: Basic base64(username:password)
```

## Connection Constraints

### One Per Service Type

**Important Rule**: Each workspace can have only ONE connection per service type.

**Valid Workspace Configuration**:
```
✓ Instagram (1 account)
✓ Facebook (1 account)
✓ Twitter (1 account)
✓ Google Sheets (1 account)
✓ Mailchimp (1 account)

Total: 5 different services
```

**Invalid Workspace Configuration**:
```
✗ Instagram Account A
✗ Instagram Account B

Error: Only one Instagram connection allowed per workspace
```

### Workaround for Multiple Accounts

If you need multiple accounts of the same service:

**Option 1: Multiple Workspaces**
```
Agent: Social Media Manager

Workspace A: Client A Instagram
  Connection: Instagram (@client_a)

Workspace B: Client B Instagram
  Connection: Instagram (@client_b)

Workspace C: Client C Instagram
  Connection: Instagram (@client_c)
```

**Option 2: Switch Connections**
```
1. Disconnect current Instagram
2. Connect different Instagram account
3. Use for actions
4. Switch back when needed

Note: Not ideal for automation
```

**Option 3: Use Different Workspaces for Different Purposes**
```
Workspace: Personal Social
  Instagram: Personal account

Workspace: Business Social
  Instagram: Business account
```

## Using Connections in Actions

### Selecting a Connection

```
Action Step: Post to Instagram

Configuration:
  Type: API Execution
  Connection: (Select from workspace)
    → Instagram (@mybusiness)
  
  Method: POST
  Endpoint: /media
```

### Connection Available in Steps

```
Step 1: Create Post
  Connection: Instagram
  Creates media object

Step 2: Publish Post
  Connection: Instagram
  Publishes media

Step 3: Fetch Analytics
  Connection: Instagram
  Retrieves insights

All steps use the same workspace connection
```

### Dynamic Endpoints

```
Action Step: Fetch User Profile

Connection: Instagram
Method: GET
Endpoint: /users/{userId}

Variables:
  userId: From field {SocialPost.targetUserId}
  
Final URL:
  https://graph.instagram.com/v18.0/users/12345
```

## Service-Specific Guides

### Instagram

**Permissions Needed**:
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`

**Common Endpoints**:
```
POST /media
  Creates a media object (doesn't publish yet)
  Body: { image_url, caption }

POST /media_publish
  Publishes a created media object
  Body: { creation_id }

GET /insights
  Retrieves analytics
  Params: { metric, period }
```

**Example Action**:
```
Step 1: Create Media
  POST /media
  Body:
    image_url: {SocialPost.imageUrl}
    caption: {SocialPost.caption}
  
  Response → media.id → Temp.mediaId

Step 2: Publish Media
  POST /media_publish
  Body:
    creation_id: {Temp.mediaId}
  
  Response → id → SocialPost.instagramId
```

### Facebook

**Permissions Needed**:
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_manage_metadata`

**Common Endpoints**:
```
POST /{page-id}/feed
  Publishes a post
  Body: { message, link, picture }

GET /{page-id}/insights
  Retrieves page analytics

GET /{post-id}/insights
  Retrieves post analytics
```

### Twitter/X

**API Version**: v2

**Common Endpoints**:
```
POST /tweets
  Creates a tweet
  Body: { text, media }

GET /users/:id/tweets
  Retrieves user's tweets

POST /users/:id/likes
  Likes a tweet
```

### Google Sheets

**Scopes Needed**:
- `https://www.googleapis.com/auth/spreadsheets`

**Common Operations**:
```
Read Range:
  GET /spreadsheets/{spreadsheetId}/values/{range}
  
Write Range:
  POST /spreadsheets/{spreadsheetId}/values/{range}
  Body: { values: [[row1], [row2]] }

Append:
  POST /spreadsheets/{spreadsheetId}/values/{range}:append
  Body: { values: [[new_row]] }
```

### Mailchimp

**Common Endpoints**:
```
POST /lists/{list_id}/members
  Adds subscriber
  Body: { email_address, status, merge_fields }

POST /campaigns
  Creates email campaign
  Body: { type, recipients, settings }

POST /campaigns/{campaign_id}/actions/send
  Sends campaign
```

## Connection Management

### Viewing Connection Status

```
Connection Dashboard:
  Service: Instagram
  Account: @mybusiness
  Status: ● Connected
  Last Used: 2025-10-20 10:30 AM
  Token Expires: Auto-refresh
  API Calls (24h): 145 / 5000
  Success Rate: 98.5%
```

### Testing Connections

```
Test Connection:
  Method: GET
  Endpoint: /me
  Headers: Auto-added (OAuth)
  
  Execute Test →
  
  Result:
  ✓ Success
  Response Time: 234ms
  Status: 200 OK
  Data: { id: "12345", username: "mybusiness" }
```

### Refreshing Tokens

```
OAuth Token Lifecycle:

Initial Authorization:
  Access Token: Valid for 60 days
  Refresh Token: Valid for 90 days

Automatic Refresh:
  Platform monitors expiration
  Refreshes 7 days before expiry
  Updates stored credentials
  No action needed from user

Manual Refresh:
  Click "Refresh Connection"
  Re-authorizes if needed
  Updates tokens
```

### Disconnecting

```
Disconnect Process:
  1. Click "Disconnect"
  2. Confirm action
  3. OAuth token revoked
  4. Connection removed
  
  Impact:
  - All actions using this connection will fail
  - Scheduled jobs will error
  - Can reconnect anytime
  
  Warning shown if:
  - Active schedules exist
  - Recent actions used connection
```

## Rate Limiting

### Understanding Rate Limits

```
Service: Instagram
Rate Limit: 200 calls per hour per user

Platform Handling:
  - Tracks calls automatically
  - Pauses when limit approached
  - Queues requests
  - Resumes when window resets
```

### Rate Limit Strategies

```
Strategy 1: Throttling
  Max calls per minute: 10
  Wait between calls: 6 seconds
  Prevents hitting limit

Strategy 2: Batching
  Group multiple operations
  Single API call
  More efficient

Strategy 3: Caching
  Cache responses for X minutes
  Reduce redundant calls
  Faster performance

Strategy 4: Queueing
  Queue requests
  Process at optimal rate
  Never exceed limit
```

### Handling Rate Limit Errors

```
Error: 429 Too Many Requests

Response Headers:
  X-RateLimit-Limit: 200
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1634567890
  Retry-After: 3600

Platform Behavior:
  - Parse Retry-After header
  - Wait specified time
  - Automatically retry
  - Log delay
```

## Error Handling

### Common API Errors

#### 400 Bad Request
```
Cause: Invalid request data

Solution:
  - Check request body format
  - Verify required fields
  - Validate field types
  - Review API documentation

Example Fix:
  Wrong:
    { caption: 123 }
  
  Right:
    { caption: "Product launch!" }
```

#### 401 Unauthorized
```
Cause: Invalid or expired token

Solution:
  - Refresh OAuth token
  - Re-authorize connection
  - Check permissions

Platform Action:
  - Automatically refreshes token
  - Retries request
  - Notifies if re-auth needed
```

#### 403 Forbidden
```
Cause: Insufficient permissions

Solution:
  - Review OAuth scopes
  - Request additional permissions
  - Reconnect with proper scope

Example:
  Need: instagram_manage_insights
  Have: instagram_basic
  Action: Reconnect with full permissions
```

#### 404 Not Found
```
Cause: Resource doesn't exist

Solution:
  - Verify IDs
  - Check if resource was deleted
  - Ensure correct endpoint

Example:
  Endpoint: /posts/12345
  Error: Post 12345 not found
  Fix: Verify post ID is correct
```

#### 429 Rate Limit
```
Cause: Too many requests

Solution:
  - Wait for rate limit reset
  - Implement throttling
  - Reduce request frequency

Platform handles automatically
```

#### 500 Server Error
```
Cause: External service error

Solution:
  - Retry request
  - Wait and try again
  - Contact service support if persists

Platform Action:
  - Retries with exponential backoff
  - Logs error
  - Notifies after multiple failures
```

### Error Logging

```
Error Log Entry:
  Timestamp: 2025-10-20 10:30:45
  Service: Instagram
  Endpoint: POST /media
  Status Code: 400
  Error Message: "Invalid image URL format"
  Request ID: req_abc123
  Action: Generate Social Post
  Record ID: 1234
  
  Retry Attempt: 1/3
  Next Retry: In 30 seconds
```

## Security Best Practices

### Token Storage

```
Security Measures:
  - Encrypted at rest
  - Encrypted in transit (HTTPS)
  - Never exposed in UI
  - Automatic rotation
  - Secure key management
```

### Permissions

```
Principle of Least Privilege:
  - Request only needed permissions
  - Review scope regularly
  - Revoke unused permissions
  - Audit access periodically

Example:
  Need to post only:
  ✓ Request: instagram_content_publish
  ✗ Don't request: instagram_manage_messages (not needed)
```

### Access Control

```
Workspace Level:
  - Only admins can add connections
  - Editors can use existing connections
  - Viewers cannot access connection settings

Audit Trail:
  - Log all connection changes
  - Track API usage
  - Monitor for unusual activity
```

## Troubleshooting

### Connection Won't Authorize

**Issue**: OAuth redirect fails

**Solutions**:
1. Check redirect URL configuration
2. Verify service is accepting connections
3. Try different browser
4. Clear cookies/cache
5. Ensure pop-ups are allowed

### API Calls Failing

**Issue**: All requests return errors

**Solutions**:
1. Test connection
2. Refresh OAuth token
3. Check service status
4. Review error messages
5. Verify endpoint URLs

### Token Expired

**Issue**: 401 Unauthorized errors

**Solutions**:
1. Click "Refresh Connection"
2. Re-authorize if prompted
3. Check token expiration settings
4. Enable auto-refresh

### Rate Limits

**Issue**: 429 errors frequently

**Solutions**:
1. Reduce request frequency
2. Implement caching
3. Use batching where possible
4. Upgrade API plan if available

## Advanced Topics

### Webhook Connections

```
Receive External Events:

Setup:
  1. Create webhook endpoint
  2. Register with service
  3. Configure event types
  4. Verify webhook signature

Example:
  Service sends webhook when:
  - New Instagram comment
  - Facebook post published
  - Shopify order created
  
  Platform receives event:
  - Verifies signature
  - Parses payload
  - Creates/updates record
  - Triggers action
```

### Custom API Connections

```
Connect to any REST API:

Configuration:
  Base URL: https://api.custom.com/v1
  Auth Type: API Key
  Key Header: X-API-Key
  API Key: secret_key_123

Usage in Actions:
  Endpoint: /resources
  Method: POST
  Body: { custom data }
  
  Full URL: https://api.custom.com/v1/resources
```

## Next Steps

- [Actions](./09-actions.md) - Use connections in workflows
- [Action Steps](./10-action-steps.md) - Configure API execution steps
- [Scheduling](./12-scheduling.md) - Automate API interactions
- [Use Cases](./15-use-cases.md) - Real-world integration examples

