# Quick Start Guide

This guide will walk you through creating your first agent, setting up a workspace, defining a model, and creating an automated workflow.

## Prerequisites

- Access to Ryu
- Basic understanding of spreadsheets/databases
- (Optional) API credentials for external services

## Step 1: Create Your First Agent

An agent is the top-level container for all your automation resources.

### What to Consider
- **Agent Name**: Choose a descriptive name (e.g., "Content Marketing Agent", "Customer Support Agent")
- **Purpose**: Define what this agent will automate

### Example
```
Agent Name: Social Media Manager
Description: Automates content creation and posting across social platforms
```

## Step 2: Set Up a Workspace

Workspaces organize your models and API connections within an agent.

### Creating a Workspace
1. Navigate to your agent
2. Create a new workspace
3. Name it descriptively (e.g., "Instagram Campaign", "Blog Production")

### Example
```
Workspace Name: Instagram Content Hub
Description: Manages Instagram posts, captions, and scheduling
```

## Step 3: Define Your First Model

Models are data structures that represent the information you want to track.

### Model Structure
1. **Model Name**: What you're tracking (e.g., "Instagram Posts")
2. **Fields**: The data points you need (e.g., "Caption", "Image URL", "Posted At")

### Example: Instagram Post Model

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Title | Text | Post title/topic |
| Caption | Long Text | Full Instagram caption |
| Image Prompt | Text | Description for AI image generation |
| Image URL | Text | Generated/uploaded image location |
| Posted | Checkbox | Whether the post has been published |
| Posted At | Date/Time | When it was posted |
| Likes Count | Number | Number of likes received |

## Step 4: Create a Form

Forms allow users (or you) to easily input data that creates records in your sheet.

### Form Setup
1. Navigate to your model
2. Create a new form
3. Select which fields to include
4. Arrange fields in logical order

### Example: New Post Form
```
Form Fields:
- Title (required)
- Caption (required)
- Image Prompt (required)
- Tags (optional)
```

When someone fills this form, a new record is created in the Instagram Posts sheet.

## Step 5: Build Your First Action

Actions are where the AI magic happens. Let's create an action that generates an image and posts to Instagram.

### Action Configuration

**Action Name**: Generate and Post to Instagram

**Trigger**: Manual or Scheduled

**Steps**:

#### Step 1: AI Image Generation
- **Type**: AI Image Generation
- **Input**: Use the "Image Prompt" field from the record
- **Output**: Save to "Image URL" field

#### Step 2: AI Caption Enhancement
- **Type**: AI Reasoning
- **Input**: Original "Caption" field
- **Prompt**: "Enhance this Instagram caption with emojis and hashtags: {Caption}"
- **Output**: Update "Caption" field

#### Step 3: Post to Instagram
- **Type**: API Execution
- **Connection**: Instagram API
- **Endpoint**: POST /media
- **Data**: 
  - image_url: {Image URL}
  - caption: {Caption}
- **Output**: Save response to "Posted" (set to true) and "Posted At" (current timestamp)

## Step 6: Connect an API

To post to Instagram, you need to connect the Instagram API to your workspace.

### API Connection Setup
1. Navigate to Workspace Connections
2. Select "Add Connection"
3. Choose the API provider (e.g., Instagram, Facebook)
4. Authorize with OAuth
5. Configure permissions

### Important
Each workspace can have **one connection per API type**. You can't have multiple Instagram connections in the same workspace, but you can have Instagram, Facebook, and Twitter connections simultaneously.

## Step 7: Set Up a Schedule

Schedules automate the execution of actions across your data.

### Schedule Configuration

**Schedule Name**: Daily Instagram Posting

**Target Model**: Instagram Posts

**Frequency**: Every day at 9:00 AM

**Filter**: Where "Posted" = false

**Action**: Generate and Post to Instagram

**Behavior**: 
- Process one row at a time
- Stop if action fails
- Mark as complete when done

### How It Works
Every day at 9:00 AM, the schedule:
1. Finds all Instagram Posts where "Posted" = false
2. Takes the first record
3. Runs the "Generate and Post to Instagram" action
4. Moves to the next record
5. Continues until all matching records are processed

## Step 8: Test Your Workflow

### Testing Process

1. **Create a Test Record**
   - Use your form to create a new Instagram Post
   - Fill in: Title, Caption, Image Prompt

2. **Manually Run the Action**
   - Open the record
   - Click "Run Action"
   - Select "Generate and Post to Instagram"
   - Watch the steps execute

3. **Verify Results**
   - Check that "Image URL" was populated
   - Verify "Caption" was enhanced
   - Confirm "Posted" is true
   - Check Instagram to see the post

4. **Enable the Schedule**
   - Once testing is complete
   - Activate your schedule
   - Monitor execution logs

## Complete Example Workflow

Let's put it all together with a complete use case:

### Use Case: Automated Blog to Instagram Pipeline

**Goal**: Convert blog articles into Instagram posts with AI-generated images

#### Setup

1. **Agent**: Content Repurposing Agent
2. **Workspace**: Blog to Social
3. **Models**:
   - Blog Articles (source data)
   - Instagram Posts (output)

#### Blog Articles Model
```
Fields:
- Title (Text)
- Content (Long Text)
- Author (Text)
- Published Date (Date)
- Processed (Checkbox)
```

#### Instagram Posts Model
```
Fields:
- Source Article (Relationship to Blog Articles)
- Caption (Long Text)
- Image Prompt (Text)
- Image URL (Text)
- Posted (Checkbox)
- Posted At (Date/Time)
```

#### Action: Convert Blog to Instagram

**Step 1: Extract Key Points** (AI Reasoning)
- Input: Blog Article Content
- Prompt: "Extract 3 key points from this blog article and write an engaging Instagram caption"
- Output: Instagram Posts → Caption

**Step 2: Generate Image Prompt** (AI Reasoning)
- Input: Blog Article Title
- Prompt: "Create a visual description for an Instagram post about: {Title}"
- Output: Instagram Posts → Image Prompt

**Step 3: Generate Image** (AI Image Generation)
- Input: Image Prompt
- Output: Instagram Posts → Image URL

**Step 4: Create Child Record** (Data Operation)
- Create new record in Instagram Posts
- Link to source Blog Article
- Mark Blog Article as Processed

#### Schedule: Daily Blog Processing
- Runs daily at 8:00 AM
- Targets Blog Articles where Processed = false
- Executes "Convert Blog to Instagram" action
- Creates queue of Instagram posts ready to publish

#### Schedule: Hourly Instagram Posting
- Runs every hour
- Targets Instagram Posts where Posted = false
- Executes "Post to Instagram" action
- Publishes one post per hour

## What You've Learned

✅ How to create an agent  
✅ How to set up workspaces  
✅ How to define models with fields  
✅ How to build forms for data input  
✅ How to create multi-step actions  
✅ How to connect external APIs  
✅ How to schedule automated tasks  
✅ How to build complete automation workflows  

## Next Steps

- Read [Core Concepts](./03-core-concepts.md) for deeper understanding
- Explore [Actions](./09-actions.md) to learn advanced action patterns
- Check [Use Cases & Examples](./15-use-cases.md) for more inspiration
- Review [Best Practices](./14-best-practices.md) for optimization tips

## Common Quick Start Issues

### Issue: Action fails to execute
**Solution**: Check that all required fields have data and API connections are authorized

### Issue: Schedule doesn't run
**Solution**: Verify schedule is enabled, check filter conditions, ensure action is configured

### Issue: API connection fails
**Solution**: Re-authorize OAuth, check API permissions, verify workspace limits

See [Troubleshooting](./16-troubleshooting.md) for more help.

