# Troubleshooting

## Overview

This guide helps you diagnose and resolve common issues in Ryu. For each problem, we provide symptoms, causes, and solutions.

## Quick Diagnostic Checklist

Before diving into specific issues, check these common points:

- [ ] Is the agent/workspace enabled?
- [ ] Are API connections authorized?
- [ ] Do forms map to correct fields?
- [ ] Are required fields populated?
- [ ] Is the schedule active?
- [ ] Are filters correct?
- [ ] Check error logs
- [ ] Test in isolation
- [ ] Verify permissions

## Actions & Workflows

### Action Not Executing

**Symptoms**:
- Action doesn't run when triggered
- No error message
- Nothing happens

**Common Causes & Solutions**:

**1. Schedule is Disabled**
```
Check: Schedule status
Fix: Enable the schedule
Navigate to: Schedules → [Your Schedule] → Enable
```

**2. No Records Match Filter**
```
Check: Filter criteria
Fix: Review and adjust filters
Example:
  Filter: status = "Ready"
  Reality: All records have status = "Pending"
  Solution: Change filter or update records
```

**3. Action Not Linked to Trigger**
```
Check: Trigger configuration
Fix: Verify action is selected in schedule/form/webhook
```

**4. Permissions Issue**
```
Check: User role and permissions
Fix: Grant necessary permissions to execute actions
```

### Action Fails Immediately

**Symptoms**:
- Action starts but fails on first step
- Error logged

**Common Causes & Solutions**:

**1. Missing Required Fields**
```
Error: "Field 'title' is required but empty"

Check: Input field has data
Fix: Ensure record has required fields populated before action runs

Add to Action:
  Validation step at start
  If required field empty → Stop and log error
```

**2. Invalid Field References**
```
Error: "Field 'Article.description' not found"

Check: Field name spelling and existence
Fix: Correct field reference in action configuration
```

**3. API Connection Not Authorized**
```
Error: "401 Unauthorized"

Check: API connection status
Fix: 
  Navigate to Connections
  Refresh or re-authorize connection
  Test connection
```

### Action Fails Partway Through

**Symptoms**:
- Some steps complete successfully
- Later steps fail
- Partial data updated

**Common Causes & Solutions**:

**1. API Timeout**
```
Error: "Request timeout after 30s"

Cause: External API too slow
Fix:
  - Increase timeout setting
  - Retry configuration
  - Check external service status
  - Use smaller batches
```

**2. Rate Limit Exceeded**
```
Error: "429 Too Many Requests"

Cause: Too many API calls too quickly
Fix:
  - Implement throttling
  - Reduce schedule frequency
  - Batch requests
  - Wait for rate limit reset
```

**3. Invalid AI Prompt**
```
Error: "AI model returned empty response"

Cause: Prompt too vague or malformed
Fix:
  - Make prompt more specific
  - Add examples
  - Reduce prompt length
  - Check for special characters
```

**4. Data Format Mismatch**
```
Error: "Expected number, got string"

Cause: Field type mismatch
Fix:
  - Validate data types in earlier step
  - Convert/cast data types
  - Fix source data
```

## API Connections

### Connection Won't Authorize

**Symptoms**:
- OAuth redirect fails
- Authorization doesn't complete
- Stuck on loading screen

**Common Causes & Solutions**:

**1. Pop-up Blocked**
```
Cause: Browser blocking OAuth popup
Fix:
  - Allow pop-ups for this site
  - Try different browser
  - Clear browser cache
```

**2. Redirect URI Mismatch**
```
Error: "Redirect URI mismatch"

Cause: OAuth configuration incorrect
Fix:
  - Verify redirect URL in API provider settings
  - Contact support if platform-level issue
```

**3. Insufficient Permissions**
```
Error: "Requested scope not granted"

Cause: Didn't grant all permissions
Fix:
  - Re-authorize
  - Grant all requested permissions
  - Check if account has necessary access level
```

**4. API Service Down**
```
Error: "Cannot connect to [service]"

Cause: External service outage
Fix:
  - Check service status page
  - Wait and retry later
  - Use alternative service if available
```

### API Calls Failing

**Symptoms**:
- Connection authorized but API calls fail
- Consistent errors

**Common Causes & Solutions**:

**1. Expired Token**
```
Error: "401 Unauthorized"

Check: Token expiration
Fix:
  - Click "Refresh Connection"
  - Enable auto-refresh
  - Re-authorize if needed
```

**2. Invalid Endpoint**
```
Error: "404 Not Found"

Check: Endpoint URL
Fix:
  - Verify endpoint in API documentation
  - Check API version
  - Update endpoint path
```

**3. Malformed Request**
```
Error: "400 Bad Request"

Check: Request body format
Fix:
  - Validate JSON structure
  - Check required fields
  - Verify data types
  - Review API documentation
```

**4. Rate Limiting**
```
Error: "429 Too Many Requests"

Check: API usage
Fix:
  - Slow down requests
  - Implement queuing
  - Upgrade API plan
  - Cache responses
```

## Forms

### Form Not Submitting

**Symptoms**:
- Submit button does nothing
- No error message shown
- Page doesn't redirect

**Common Causes & Solutions**:

**1. Validation Errors**
```
Check: Look for red error messages near fields
Fix:
  - Fill all required fields
  - Fix format errors (email, phone, etc.)
  - Check character limits
```

**2. JavaScript Error**
```
Check: Browser console (F12)
Fix:
  - Clear browser cache
  - Try different browser
  - Disable browser extensions
  - Report to support
```

**3. Form Not Connected to Model**
```
Check: Form configuration
Fix:
  - Verify form maps to correct model
  - Check field mappings
  - Ensure model exists
```

### Form Submits But No Record Created

**Symptoms**:
- Success message shown
- No record appears in sheet

**Common Causes & Solutions**:

**1. Wrong Model Target**
```
Check: Form settings
Fix: Update form to target correct model
```

**2. View Filter Hiding Record**
```
Check: Sheet filters
Fix: Clear all filters or check "All Records" view
```

**3. Permissions Issue**
```
Check: User permissions
Fix: Grant record creation permissions
```

**4. Field Mapping Incorrect**
```
Check: Form field mappings
Fix: Map form fields to correct model fields
```

### Form Validation Too Strict

**Symptoms**:
- Users can't submit valid data
- Error messages unclear

**Common Causes & Solutions**:

**1. Regex Pattern Too Restrictive**
```
Check: Field validation rules
Fix:
  - Review regex pattern
  - Test with various inputs
  - Relax constraints if appropriate
```

**2. Character Limit Too Low**
```
Check: Max length settings
Fix: Increase character limit to reasonable value
```

## Schedules

### Schedule Not Running

**Symptoms**:
- Expected run time passes
- No execution logged
- No records processed

**Common Causes & Solutions**:

**1. Schedule Disabled**
```
Check: Schedule status
Fix: Enable schedule
```

**2. No Matching Records**
```
Check: Filter results
Fix:
  - Review filter criteria
  - Check if records exist that should match
  - Temporarily remove filters to test
```

**3. Incorrect Timezone**
```
Check: Schedule timezone setting
Fix:
  - Set to correct timezone
  - Account for daylight saving time
  Example:
    Set for 9:00 AM EST
    Currently PST (wrong)
    Fix: Change timezone to America/New_York
```

**4. Frequency Misconfigured**
```
Check: Cron expression or frequency setting
Fix: Correct frequency configuration
Example:
  Want: Daily at 9 AM
  Have: 0 21 * * * (9 PM, not AM)
  Fix: 0 9 * * *
```

### Schedule Running But Failing

**Symptoms**:
- Schedule executes
- All records fail
- Error logs show failures

**Common Causes & Solutions**:

**1. Action Configuration Error**
```
Check: Action works when run manually?
Fix: 
  - Test action on single record manually
  - Fix action errors first
  - Then re-enable schedule
```

**2. Bulk Processing Issues**
```
Check: Error logs
Fix:
  - Reduce records per run limit
  - Add delays between actions
  - Implement better error handling
```

**3. API Rate Limits**
```
Error: "Rate limit exceeded"
Fix:
  - Reduce frequency
  - Process fewer records per run
  - Add throttling
```

### Some Records Fail, Others Succeed

**Symptoms**:
- Schedule completes
- Partial success rate
- Specific records consistently fail

**Common Causes & Solutions**:

**1. Data Quality Issues**
```
Check: Failed records for missing/invalid data
Fix:
  - Add data validation
  - Clean up problematic records
  - Add fallback logic in action
```

**2. Record-Specific Errors**
```
Check: Error logs for patterns
Example:
  Records with empty image URLs failing
  Records with special characters in title failing

Fix: Add validation and handling for edge cases
```

## AI Generation

### AI Generates Poor Quality Output

**Symptoms**:
- Output doesn't match expectations
- Inconsistent results
- Generic or irrelevant content

**Common Causes & Solutions**:

**1. Vague Prompt**
```
Bad:
  "Write something about this product"

Good:
  "Write a 100-word product description for {product_name}.
   Highlight these features: {features}.
   Target audience: {audience}.
   Tone: {tone}.
   Include call to action."

Fix: Make prompts more specific and detailed
```

**2. Temperature Too High**
```
Check: Temperature setting
Fix:
  Current: 1.0 (too creative, inconsistent)
  Change to: 0.7 (balanced)
  For factual content: 0.3 (more consistent)
```

**3. Insufficient Context**
```
Bad:
  Input: Just product name

Good:
  Input: Product name, features, benefits, target audience, competitors

Fix: Provide more context in inputs
```

**4. Wrong Model Selected**
```
Check: AI model choice
Fix:
  For complex tasks: GPT-4
  For simple tasks: GPT-3.5-Turbo
  For analysis: Claude
```

### AI Response Empty or Truncated

**Symptoms**:
- AI generates nothing
- Response cuts off mid-sentence
- Incomplete output

**Common Causes & Solutions**:

**1. Token Limit Exceeded**
```
Check: Max tokens setting
Fix:
  - Increase max tokens
  - Shorten input
  - Simplify task
  Example:
    Current: 100 tokens (too few)
    Change to: 500-1000 tokens
```

**2. Prompt Issues**
```
Check: Prompt for errors
Fix:
  - Remove special characters
  - Fix template variable syntax
  - Ensure all variables have values
```

**3. API Timeout**
```
Error: "Request timeout"
Fix:
  - Increase timeout
  - Reduce complexity
  - Try again (may be service issue)
```

### AI Image Generation Fails

**Symptoms**:
- Image not generated
- Error during generation
- Invalid image URL

**Common Causes & Solutions**:

**1. Prompt Violates Content Policy**
```
Error: "Content policy violation"
Fix:
  - Review prompt for prohibited content
  - Make prompt more general
  - Avoid brand names/copyrighted content
```

**2. Prompt Too Long**
```
Error: "Prompt exceeds maximum length"
Fix:
  - Shorten prompt
  - Remove unnecessary details
  - Focus on key visual elements
```

**3. Invalid Size Requested**
```
Error: "Unsupported image size"
Fix:
  - Use supported sizes (1024x1024, 1792x1024, etc.)
  - Check model documentation
```

## Data & Records

### Records Not Appearing in Sheet

**Symptoms**:
- Record created (confirmed)
- Not visible in sheet view

**Common Causes & Solutions**:

**1. View Filters Active**
```
Check: Filter settings on sheet
Fix:
  - Clear all filters
  - Check "All Records" view
  - Create new view without filters
```

**2. Permissions**
```
Check: User permissions
Fix: Verify user can view all records in model
```

**3. Archived Records**
```
Check: Record status/archived field
Fix: Include archived in view or unarchive records
```

### Cannot Edit Record

**Symptoms**:
- Fields appear read-only
- Save button disabled
- Changes don't persist

**Common Causes & Solutions**:

**1. Permissions**
```
Check: User role
Fix: Grant edit permissions
```

**2. Record Locked**
```
Check: Lock status or status field
Fix: Unlock record or change status to editable
```

**3. Computed Fields**
```
Check: Is field computed/formula?
Fix: Computed fields are read-only, edit source fields instead
```

### Duplicate Records Created

**Symptoms**:
- Same record appears multiple times
- Duplicate form submissions
- Action creates multiple children

**Common Causes & Solutions**:

**1. Double Form Submission**
```
Cause: User clicks submit multiple times
Fix:
  - Disable submit button after click
  - Add unique constraint on identifying field
```

**2. Schedule Running Multiple Times**
```
Check: Schedule execution logs
Fix:
  - Check for overlapping schedules
  - Add "processing" status flag
  - Filter out already-processed records
```

**3. Action Loop**
```
Check: Action creates record that triggers same action
Fix:
  - Add condition to prevent loop
  - Use status flags
  - Review trigger conditions
```

## Performance Issues

### Actions Running Slowly

**Symptoms**:
- Actions timeout
- Very long execution time
- Inconsistent performance

**Common Causes & Solutions**:

**1. Complex AI Prompts**
```
Check: Prompt length and complexity
Fix:
  - Simplify prompts
  - Reduce max tokens
  - Split into multiple smaller steps
```

**2. Too Many API Calls**
```
Check: Number of API calls in action
Fix:
  - Batch requests
  - Cache responses
  - Reduce external calls
```

**3. Large Data Processing**
```
Check: Amount of data being processed
Fix:
  - Process in smaller batches
  - Use pagination
  - Optimize queries
```

### Platform Feels Slow

**Symptoms**:
- Pages load slowly
- Lag when clicking
- Timeouts

**Common Causes & Solutions**:

**1. Too Many Records**
```
Check: Record count in models
Fix:
  - Archive old records
  - Implement pagination
  - Use filters to reduce displayed records
```

**2. Complex Views**
```
Check: View complexity (many fields, calculations)
Fix:
  - Simplify views
  - Remove unnecessary fields
  - Use simpler view types
```

**3. Browser Issues**
```
Check: Browser performance
Fix:
  - Clear cache
  - Close unnecessary tabs
  - Try different browser
  - Disable extensions
```

## Getting Help

### Before Contacting Support

1. **Check Error Logs**
   - Review detailed error messages
   - Note error codes
   - Capture screenshots

2. **Try to Reproduce**
   - Can you reproduce the issue?
   - Does it happen every time?
   - In what specific scenarios?

3. **Isolate the Problem**
   - Test individual components
   - Try in different workspace
   - Test with different data

4. **Gather Information**
   - Agent name
   - Workspace name
   - Model name
   - Action name
   - Timestamp of error
   - What you expected vs. what happened

### Support Request Template

```
Subject: [Issue Type] - [Brief Description]

Environment:
- Agent: [Name]
- Workspace: [Name]
- Model: [Name]

Issue Description:
[What happened]

Expected Behavior:
[What should have happened]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [Third step]

Error Messages:
[Copy exact error messages]

What I've Tried:
- [Troubleshooting steps attempted]

Screenshots:
[Attach relevant screenshots]

Additional Context:
[Any other relevant information]
```

## Common Error Codes

```
400 - Bad Request
  Cause: Invalid data sent to API
  Fix: Check request format and data

401 - Unauthorized
  Cause: Invalid or expired credentials
  Fix: Re-authorize connection

403 - Forbidden
  Cause: Insufficient permissions
  Fix: Check user permissions or API scopes

404 - Not Found
  Cause: Resource doesn't exist
  Fix: Verify IDs and endpoints

429 - Rate Limit Exceeded
  Cause: Too many requests
  Fix: Slow down, implement throttling

500 - Server Error
  Cause: External service error
  Fix: Retry, check service status

503 - Service Unavailable
  Cause: Service temporarily down
  Fix: Wait and retry
```

## Prevention Tips

### Avoid Common Issues

1. **Test in Development First**
   - Always test new actions in dev workspace
   - Use sample data
   - Verify before moving to production

2. **Implement Error Handling**
   - Add retry logic
   - Include fallbacks
   - Log errors comprehensively

3. **Monitor Regularly**
   - Check execution logs
   - Review performance metrics
   - Set up alerts

4. **Document Everything**
   - Document action purposes
   - Note field dependencies
   - Keep configuration records

5. **Use Version Control**
   - Track changes
   - Test before deploying
   - Keep rollback plans

## Next Steps

- [Best Practices](./14-best-practices.md) - Prevent issues before they occur
- [Use Cases](./15-use-cases.md) - See working examples
- [Actions](./09-actions.md) - Understand action configuration

