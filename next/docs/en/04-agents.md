# Agents

## Overview

Agents are the top-level organizational units in Ryu. Each agent represents a complete automation project with its own workspaces, models, and workflows.

## What is an Agent?

An **agent** is a container that holds everything needed for a specific automation domain:
- Multiple workspaces
- Shared configurations
- User permissions
- Resource limits
- Billing/usage tracking

Think of an agent as a complete "application" built with Ryu.

## Agent Structure

```
Agent: Content Marketing Hub
  ├── Workspace: Blog Production
  ├── Workspace: Social Media
  ├── Workspace: Email Campaigns
  └── Workspace: Analytics
```

## Creating an Agent

### Basic Setup

**Required Information**:
- **Name**: Descriptive identifier for the agent
- **Description**: Purpose and scope of the agent
- **Icon/Avatar**: Visual identifier (optional)

**Example**:
```
Name: E-commerce Automation Agent
Description: Manages product listings, inventory updates, and customer communications
Icon: 🛍️
```

### Configuration Options

**Settings**:
- **Timezone**: Default timezone for schedules and timestamps
- **Locale**: Language and regional settings
- **Permissions**: Who can access and modify
- **Limits**: Resource quotas (API calls, storage, etc.)

## Agent Use Cases

### By Business Function

#### Marketing Agent
```
Purpose: Manage all marketing automation
Workspaces:
  - Content Creation
  - Campaign Management
  - Social Media
  - Analytics & Reporting
```

#### Sales Agent
```
Purpose: Automate sales processes
Workspaces:
  - Lead Management
  - Pipeline Tracking
  - Proposal Generation
  - Customer Onboarding
```

#### Operations Agent
```
Purpose: Streamline operational workflows
Workspaces:
  - Task Management
  - Inventory Tracking
  - Vendor Management
  - Compliance Monitoring
```

#### Customer Support Agent
```
Purpose: Handle customer service automation
Workspaces:
  - Ticket Management
  - Knowledge Base
  - Customer Communications
  - Feedback Analysis
```

### By Project Type

#### Multi-Client Agency
```
Agent per Client:
  - Client A Agent
  - Client B Agent
  - Client C Agent
  
Each with workspaces for different services offered
```

#### SaaS Product
```
Agent: Product Name
Workspaces:
  - Production Environment
  - Staging Environment
  - Development Environment
  - Customer Data
```

## Agent Capabilities

### What Agents Can Do

1. **Organize Workspaces**
   - Create multiple isolated environments
   - Separate concerns logically
   - Manage different projects

2. **Manage Resources**
   - Allocate API usage across workspaces
   - Track data storage limits
   - Monitor execution quotas

3. **Control Access**
   - Define user roles and permissions
   - Share with team members
   - Restrict sensitive operations

4. **Track Usage**
   - Monitor API calls
   - Review action executions
   - Analyze performance metrics

### What Agents Cannot Do

- Agents **cannot** directly share data between each other
- Agents **cannot** inherit configurations from other agents
- Agents **cannot** execute actions across agent boundaries

## Agent Best Practices

### Naming Conventions

**Good Names**:
- Content Marketing Automation
- Customer Onboarding System
- E-commerce Product Manager
- HR Recruitment Pipeline

**Poor Names**:
- Agent 1
- Test
- My Agent
- Untitled

### Organization Strategies

#### Strategy 1: By Function
```
One agent per business function
- Marketing Agent
- Sales Agent
- Support Agent
```

**Pros**: Clear separation, easy to manage permissions  
**Cons**: May need to duplicate some models

#### Strategy 2: By Project
```
One agent per project or client
- Client A Projects
- Client B Projects
- Internal Tools
```

**Pros**: Complete isolation, easy billing  
**Cons**: Harder to share learnings

#### Strategy 3: By Environment
```
One agent per deployment environment
- Production Agent
- Staging Agent
- Development Agent
```

**Pros**: Mirrors traditional deployment  
**Cons**: May duplicate configurations

#### Strategy 4: Hybrid
```
Combine approaches based on needs
- Production Marketing Agent
- Production Sales Agent
- Development Agent (all functions)
```

**Pros**: Flexible, scalable  
**Cons**: Requires planning

## Managing Multiple Agents

### When to Create a New Agent

Create a new agent when:
- ✅ Starting a completely different business function
- ✅ Needing strict data separation (different clients)
- ✅ Requiring different permission structures
- ✅ Building a distinct product or service
- ✅ Deploying to different environments

Use a new workspace instead when:
- ❌ Just organizing different campaigns
- ❌ Separating different content types
- ❌ Testing new features
- ❌ Creating temporary projects

### Agent Communication

Since agents cannot directly share data, you can:

**Option 1: Use External APIs**
```
Agent A → Export to API → Agent B imports
```

**Option 2: Shared Database**
```
Both agents connect to the same external database
```

**Option 3: File Export/Import**
```
Agent A → Export CSV → Agent B imports CSV
```

**Option 4: Webhook Integration**
```
Agent A triggers webhook → Agent B receives and processes
```

## Agent Settings & Configuration

### General Settings

```
Name: Customer Success Agent
Description: Automates customer onboarding and support workflows
Timezone: America/New_York
Locale: en-US
Status: Active
Created: 2025-01-15
Last Modified: 2025-10-20
```

### Resource Limits

```
API Calls: 10,000 per month
Storage: 5 GB
Actions Executions: 50,000 per month
Scheduled Jobs: 100 active schedules
```

### Permissions & Access Control

**Roles**:
- **Owner**: Full access, can delete agent
- **Admin**: Manage all resources, cannot delete agent
- **Editor**: Create and modify resources
- **Viewer**: Read-only access
- **Runner**: Can execute actions, limited editing

**Example Permission Matrix**:

| Role | View | Create | Edit | Delete | Execute | Manage Users |
|------|------|--------|------|--------|---------|--------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Runner | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

## Agent Monitoring & Analytics

### Key Metrics

**Usage Metrics**:
- Total workspaces
- Total models
- Total records across all sheets
- Total actions executed (last 30 days)
- API calls made (last 30 days)

**Performance Metrics**:
- Average action execution time
- Success vs. failure rate
- Most used models
- Most executed actions

**Resource Metrics**:
- Storage used
- API quota remaining
- Schedule execution count
- Active vs. inactive resources

### Activity Log

Track all changes and executions:
```
2025-10-20 10:30 AM - User@email.com created workspace "Q4 Campaign"
2025-10-20 10:45 AM - System executed action "Generate Social Posts" on 15 records
2025-10-20 11:00 AM - User@email.com connected Instagram API
2025-10-20 11:30 AM - Schedule "Daily Posting" completed successfully
```

## Migrating Between Agents

### Export from Source Agent
1. Select resources to export (models, forms, actions)
2. Export as JSON or CSV
3. Include configuration files

### Import to Target Agent
1. Create corresponding workspace
2. Import model schemas
3. Import data (if needed)
4. Reconfigure API connections
5. Update action references
6. Test thoroughly

### Important Notes
- API connections must be re-authorized
- Schedules must be recreated
- Record IDs will change
- Test in a staging environment first

## Agent Templates

### Pre-built Agent Templates

The platform may offer templates for common use cases:

**Content Marketing Template**
```
Includes:
- Blog management workspace
- Social media workspace
- Pre-configured models for posts, campaigns, analytics
- Sample forms and actions
```

**E-commerce Template**
```
Includes:
- Product management workspace
- Order processing workspace
- Customer management workspace
- Pre-configured integrations with Shopify, etc.
```

### Creating Custom Templates

Save your agent configuration as a template:
1. Build and test your agent
2. Export as template
3. Remove sensitive data (API keys, customer data)
4. Share with team or community

## Troubleshooting

### Common Issues

**Issue**: Cannot create workspace  
**Solution**: Check agent limits, ensure you have proper permissions

**Issue**: API quota exceeded  
**Solution**: Review usage, upgrade plan, or optimize action efficiency

**Issue**: Actions failing across all workspaces  
**Solution**: Check agent-level API connections, review system status

**Issue**: Permission denied errors  
**Solution**: Verify user role, check agent access settings

## Next Steps

- [Workspaces](./05-workspaces.md) - Learn about organizing within agents
- [Models & Sheets](./06-models-and-sheets.md) - Structure your data
- [Best Practices](./14-best-practices.md) - Optimize your agent design

