# Scheduling

## Overview

Schedules enable automated execution of actions on records at specified intervals. They process entire tables by looping through rows and applying actions, turning manual workflows into automated systems.

## What is a Schedule?

A **schedule** is:
- An automated timer that triggers actions
- Operates at the table/model level
- Processes records row by row
- Can filter which records to process
- Runs at specified intervals

Think of schedules as "cron jobs" for your data automation.

## Schedule Architecture

```
Schedule: Daily Instagram Posting

Configuration:
  Model: Social Posts
  Frequency: Every day at 9:00 AM
  Filter: status = "Ready" AND platform = "Instagram"
  Action: Post to Instagram
  
Execution Flow:
  1. Schedule triggers at 9:00 AM
  2. Finds all matching records (status="Ready", platform="Instagram")
  3. For each record:
     a. Execute "Post to Instagram" action
     b. Process steps (generate, post, update)
     c. Move to next record
  4. Complete when all records processed
```

## Creating a Schedule

### Basic Setup

**Required Information**:
- **Schedule Name**: Descriptive identifier
- **Target Model**: Which model's records to process
- **Action**: Which action to execute
- **Frequency**: When and how often to run

**Example**:
```
Name: Daily Social Media Posting
Model: Social Posts
Action: Generate and Post Content
Frequency: Every day at 9:00 AM
Timezone: America/New_York
```

### Frequency Options

#### Daily
```
Run Every Day:
  Time: 9:00 AM
  Timezone: America/New_York
  
  Executes: Every day at 9:00 AM EST
```

#### Weekly
```
Run Every Week:
  Day: Monday
  Time: 8:00 AM
  Timezone: UTC
  
  Executes: Every Monday at 8:00 AM UTC
```

#### Monthly
```
Run Every Month:
  Day of Month: 1st
  Time: 12:00 PM
  Timezone: America/Los_Angeles
  
  Executes: First day of each month at noon PST
```

#### Hourly
```
Run Every Hour:
  Minutes: :00
  Hours: All hours
  
  Executes: Every hour on the hour (1:00, 2:00, 3:00...)
```

#### Custom Interval
```
Run Every:
  Interval: 30 minutes
  
  Executes: Every 30 minutes, 24/7
```

#### Cron Expression
```
Advanced users:
  Cron: 0 9 * * MON-FRI
  
  Executes: 9:00 AM on weekdays only
```

### Timezone Settings

```
Important: Always specify timezone

Options:
  - UTC (Universal)
  - America/New_York (EST/EDT)
  - America/Los_Angeles (PST/PDT)
  - Europe/London (GMT/BST)
  - Asia/Tokyo (JST)
  - And more...

Example:
  Schedule: 9:00 AM
  Timezone: America/New_York
  
  In UTC: 14:00 (EST) or 13:00 (EDT)
  In Tokyo: 23:00 or 22:00
```

## Filtering Records

### Basic Filters

```
Filter Configuration:
  Field: status
  Condition: Equals
  Value: "Ready"

Result: Only processes records where status = "Ready"
```

### Multiple Filters

```
AND Logic:
  status = "Ready"
  AND platform = "Instagram"
  AND scheduledDate <= Today
  
  Processes records matching ALL conditions
```

```
OR Logic:
  priority = "High"
  OR dueDate < Today
  
  Processes records matching ANY condition
```

### Complex Filters

```
Combined Logic:
  (status = "Ready" OR status = "Pending")
  AND platform = "Instagram"
  AND (scheduledDate <= Today OR priority = "High")
  
  Processes records matching complex criteria
```

### Filter Operators

```
Text Fields:
  - Equals
  - Not equals
  - Contains
  - Does not contain
  - Starts with
  - Ends with
  - Is empty
  - Is not empty

Number Fields:
  - Equals (=)
  - Not equals (≠)
  - Greater than (>)
  - Less than (<)
  - Greater than or equal (≥)
  - Less than or equal (≤)
  - Between

Date Fields:
  - Equals
  - Before
  - After
  - Between
  - Is today
  - Is this week
  - Is this month
  - Is in the past
  - Is in the future

Boolean Fields:
  - Is true
  - Is false

Relationship Fields:
  - Has relationship
  - Does not have relationship
  - Related record matches...
```

### Dynamic Filters

```
Using Variables:
  scheduledDate <= {TODAY}
  createdDate >= {TODAY - 7 days}
  expiryDate < {TODAY + 1 month}

Variables:
  {TODAY} - Current date
  {NOW} - Current timestamp
  {CURRENT_USER} - Executing user
  {WORKSPACE_ID} - Current workspace
```

## Execution Behavior

### Row-by-Row Processing

```
Schedules process ONE record at a time:

Table: Social Posts (100 records match filter)

Execution:
  Record 1: Execute action → Complete → Continue
  Record 2: Execute action → Complete → Continue
  Record 3: Execute action → Fail → Log error → Continue
  Record 4: Execute action → Complete → Continue
  ...
  Record 100: Execute action → Complete → Done

Sequential processing ensures:
  - Predictable execution
  - Resource management
  - Clear error tracking
  - Rate limit compliance
```

### Processing Order

```
Default: Order by creation date (oldest first)
  Ensures FIFO processing

Custom Order:
  - By priority (high to low)
  - By scheduled date (earliest first)
  - By custom field
  - Random order

Example:
  Sort By: scheduledDate ASC, priority DESC
  
  Processes:
  1. Earliest scheduled, highest priority
  2. Earliest scheduled, lower priority
  3. Later scheduled, highest priority
  4. ...
```

### Execution Limits

```
Per-Schedule Limits:
  Max records per run: 100
  Max execution time: 30 minutes
  Timeout per action: 60 seconds

Behavior if limits exceeded:
  - Process up to limit
  - Save position
  - Resume on next run

Example:
  Filter matches: 500 records
  Limit: 100 per run
  
  Run 1: Process records 1-100
  Run 2: Process records 101-200
  Run 3: Process records 201-300
  Run 4: Process records 301-400
  Run 5: Process records 401-500
```

## Error Handling

### Action Failures

```
When Action Fails on a Record:

Option 1: Continue (Default)
  - Log error
  - Mark record as failed
  - Continue to next record
  
  Best for: Batch processing where individual failures acceptable

Option 2: Stop
  - Log error
  - Stop schedule
  - Don't process remaining records
  
  Best for: Critical operations where all must succeed

Option 3: Retry
  - Retry failed record 3 times
  - If still fails, log and continue
  
  Best for: Intermittent errors (rate limits, timeouts)
```

### Error Logging

```
Schedule Execution Log:
  Schedule: Daily Instagram Posting
  Run ID: run_20251020_0900
  Started: 2025-10-20 09:00:00
  Status: Completed with errors
  
  Summary:
    Total Records: 50
    Successful: 47
    Failed: 3
    Skipped: 0
    Duration: 8 minutes 23 seconds
  
  Errors:
    Record #12: API timeout - Instagram server slow
    Record #28: Invalid image URL - 404 error
    Record #45: Rate limit - Too many requests

Individual Record Logs:
  Record #12:
    Action: Post to Instagram
    Step Failed: API Execution
    Error: Request timeout after 30s
    Timestamp: 09:03:45
    Retry: Yes (attempt 2/3)
    Resolution: Manual review needed
```

### Notifications

```
Configure Alerts:
  
  On Success:
    - No notification (default)
    - Email summary
    - Webhook trigger
  
  On Partial Success:
    - Email with error details
    - Slack notification
    - Log to monitoring
  
  On Complete Failure:
    - Urgent email
    - SMS alert
    - Webhook + email
  
Example:
  Notification: Email
  Recipients: admin@example.com, ops@example.com
  Condition: When > 10% fail rate
  Message: "Instagram posting schedule failed for 6 out of 50 posts. Review error log."
```

## Schedule Management

### Viewing Schedules

```
Schedules Dashboard:

Active Schedules:
  ✓ Daily Instagram Posting
    Next run: Today at 9:00 AM (in 2 hours)
    Last run: Yesterday at 9:00 AM (Success: 48/50)
  
  ✓ Weekly Newsletter Generation
    Next run: Monday at 8:00 AM (in 4 days)
    Last run: Last Monday (Success: 100/100)
  
  ✓ Hourly Analytics Sync
    Next run: In 23 minutes
    Last run: 37 minutes ago (Success: 12/12)

Paused Schedules:
  ⏸ Monthly Report Generation
    Paused: 2025-10-15
    Reason: Under maintenance
  
Inactive Schedules:
  ⏹ Old Campaign Automation
    Disabled: 2025-09-01
    Reason: Campaign ended
```

### Schedule History

```
Execution History:
  
  2025-10-20 09:00:00 - Success (48/50)
  2025-10-19 09:00:00 - Success (50/50)
  2025-10-18 09:00:00 - Partial (45/50)
  2025-10-17 09:00:00 - Success (47/50)
  2025-10-16 09:00:00 - Success (50/50)
  
  Click for details →
  
  Details for 2025-10-20:
    Duration: 8m 23s
    Records processed: 48
    Records failed: 2
    Average time per record: 10.2s
    Errors: [View log]
```

### Enabling/Disabling Schedules

```
Enable Schedule:
  Status: Active
  Next Run: Calculated based on frequency
  Notification: Schedule enabled

Disable Schedule:
  Status: Inactive
  Next Run: None
  Impact: Will not execute until re-enabled
  
Pause Schedule:
  Status: Paused
  Next Run: Pending resume
  Can resume anytime
```

### Editing Schedules

```
Editable Properties:
  - Name
  - Description
  - Frequency
  - Timezone
  - Filters
  - Processing limit
  - Error handling
  - Notifications

Non-Editable:
  - Target model (create new schedule instead)
  - Action (must select different action)

Impact of Changes:
  - Takes effect on next run
  - Current execution not affected
  - History preserved
```

## Advanced Scheduling

### Conditional Execution

```
Smart Schedule:
  Run: Every day at 9:00 AM
  But only if:
    - Matching records exist (count > 0)
    - Business hours (9 AM - 5 PM)
    - Not a holiday
    - System load < 80%

Example:
  Run Daily at 9 AM
  Skip if: No records match filter
  Result: No wasted executions
```

### Cascading Schedules

```
Schedule Chain:

Schedule 1: Generate Content (8:00 AM)
  Creates records in Social Posts table
  Status: "Generated"

Schedule 2: Review Content (10:00 AM)
  Processes records with status = "Generated"
  AI reviews quality
  Updates status: "Approved" or "Needs Work"

Schedule 3: Publish Content (2:00 PM)
  Processes records with status = "Approved"
  Posts to platforms
  Updates status: "Published"

Each schedule builds on previous results
```

### Parallel Schedules

```
Multiple Schedules on Same Model:

Schedule A: Instagram Posts (9:00 AM)
  Filter: platform = "Instagram" AND status = "Ready"
  Action: Post to Instagram

Schedule B: Twitter Posts (10:00 AM)
  Filter: platform = "Twitter" AND status = "Ready"
  Action: Post to Twitter

Schedule C: LinkedIn Posts (11:00 AM)
  Filter: platform = "LinkedIn" AND status = "Ready"
  Action: Post to LinkedIn

Different filters ensure no overlap
```

### Dynamic Scheduling

```
Adjust frequency based on data:

High Volume:
  If pending records > 100:
    Run every hour

Medium Volume:
  If pending records 20-100:
    Run every 4 hours

Low Volume:
  If pending records < 20:
    Run daily

Optimizes resource usage
```

## Use Cases

### Content Publishing

```
Schedule: Automated Blog Publishing
Model: Blog Articles
Filter: status = "Scheduled" AND publishDate <= TODAY
Action: Publish Article
Frequency: Every hour

Workflow:
  - Authors write articles
  - Set status = "Scheduled"
  - Set publishDate
  - Schedule auto-publishes at right time
```

### Social Media Management

```
Schedule: Multi-Platform Posting
Model: Social Posts
Filter: scheduled = true AND scheduledTime <= NOW
Action: Post to Platform
Frequency: Every 15 minutes

Workflow:
  - Content team creates posts
  - Sets scheduled time
  - Schedule posts automatically
  - Respects rate limits
```

### Data Sync

```
Schedule: Hourly Shopify Sync
Model: Products
Filter: syncRequired = true
Action: Sync with Shopify
Frequency: Every hour

Workflow:
  - Products updated in system
  - Mark syncRequired = true
  - Schedule syncs to Shopify
  - Updates external records
```

### Analytics Collection

```
Schedule: Daily Analytics Fetch
Model: Social Posts
Filter: posted = true AND analyticsLastFetched < TODAY
Action: Fetch Analytics
Frequency: Daily at 11:00 PM

Workflow:
  - Posts published during day
  - End of day, fetch analytics
  - Update engagement metrics
  - Track performance
```

### Maintenance Tasks

```
Schedule: Weekly Cleanup
Model: Temporary Files
Filter: createdDate < TODAY - 7 days
Action: Archive and Delete
Frequency: Every Sunday at 2:00 AM

Workflow:
  - Old temp files accumulate
  - Weekly cleanup runs
  - Archives important data
  - Deletes old records
```

## Best Practices

### Scheduling Strategy

**Avoid Overlapping Runs**
```
Good:
  Schedule A: 9:00 AM (takes 15 minutes)
  Schedule B: 10:00 AM (safe gap)

Avoid:
  Schedule A: 9:00 AM (takes 30 minutes)
  Schedule B: 9:15 AM (overlap possible)
```

**Use Appropriate Frequency**
```
Real-time needs: Every 5-15 minutes
Regular processing: Hourly
Daily batches: Once per day
Weekly tasks: Once per week

Don't over-schedule (wastes resources)
Don't under-schedule (delays processing)
```

**Set Reasonable Limits**
```
Limit records per run:
  - Prevents timeouts
  - Manages API rate limits
  - Ensures reliability

Example:
  1000 records to process:
  Limit: 100 per run
  Frequency: Every hour
  Result: All processed in 10 hours
```

### Filter Optimization

**Use Specific Filters**
```
Good:
  status = "Ready" AND platform = "Instagram"
  Only processes exactly what's needed

Avoid:
  status != "Completed"
  May process unintended records
```

**Add Safety Checks**
```
Include conditions:
  - Date boundaries
  - Status checks
  - Validation flags

Example:
  status = "Ready"
  AND validationPassed = true
  AND createdDate >= TODAY - 30 days
```

### Monitoring

**Track Performance**
```
Monitor:
  - Execution time trends
  - Success/failure rates
  - Records processed per run
  - API usage patterns

Alert if:
  - Execution time increases significantly
  - Failure rate > 10%
  - No records being processed
  - Schedule missed multiple runs
```

**Review Logs Regularly**
```
Weekly review:
  - Check for patterns in errors
  - Identify optimization opportunities
  - Verify schedules still needed
  - Update filters if needed
```

## Troubleshooting

### Schedule Not Running

**Check**:
- Schedule is enabled
- Frequency is correct
- Timezone is correct
- Records match filter
- Action is properly configured

### All Records Failing

**Check**:
- Action works when run manually
- API connections are valid
- Required fields have data
- Rate limits not exceeded

### Some Records Failing

**Review**:
- Error logs for specific records
- Data quality in those records
- Pattern in failures
- External service status

### Schedule Taking Too Long

**Optimize**:
- Reduce records per run
- Optimize action steps
- Increase frequency (process smaller batches more often)
- Review API call efficiency

## Next Steps

- [Actions](./09-actions.md) - Configure actions for schedules
- [Use Cases](./15-use-cases.md) - Real-world scheduling scenarios
- [Best Practices](./14-best-practices.md) - Optimization tips
- [Troubleshooting](./16-troubleshooting.md) - Common issues and solutions

