# Fields and Records

## Overview

Fields define what data you capture, and records are individual instances of that data. Understanding how to work with both is essential for building effective automation workflows.

## Fields Deep Dive

### What is a Field?

A **field** is a single data point in your model - one column in your sheet. Fields have:
- **Name**: What the data represents
- **Type**: What kind of data it stores
- **Properties**: Validation, defaults, constraints
- **Purpose**: How it's used (input, output, computed)

### Field Lifecycle

#### 1. Definition
```
Create a field:
  Name: "Email Subject"
  Type: Text
  Required: Yes
  Max Length: 100
  Default: ""
```

#### 2. Input
```
Data enters the field via:
  - User form submission
  - API import
  - Manual entry
  - Action output
```

#### 3. Processing
```
Field value used in:
  - Action inputs
  - Conditional logic
  - Computations
  - API calls
```

#### 4. Output
```
Field value displayed in:
  - Sheet views
  - Form confirmations
  - External integrations
  - Reports
```

### Field Properties

#### Required Fields

```
Field: Customer Email
Required: Yes

Behavior:
  - Form won't submit without it
  - API calls fail if missing
  - Manual record creation blocked
  - Shows red asterisk in UI
```

#### Unique Fields

```
Field: Product SKU
Unique: Yes

Behavior:
  - System checks for duplicates
  - Creation fails if duplicate found
  - Update allowed only to unique value
  - Useful for identifiers
```

#### Default Values

```
Field: Status
Type: Select
Default: "Draft"

Behavior:
  - New records auto-set to "Draft"
  - User can override
  - Saves time in forms
  - Ensures consistency
```

#### Validation Rules

```
Field: Phone Number
Validation:
  Pattern: ^\+?[1-9]\d{1,14}$
  Error: "Please enter a valid phone number"

Behavior:
  - Blocks invalid entries
  - Shows error message
  - Ensures data quality
```

### Field Naming Conventions

#### Best Practices

**Use CamelCase or snake_case**
```
Good:
  - customerEmail
  - publishedDate
  - totalPrice
  
Or:
  - customer_email
  - published_date
  - total_price

Avoid:
  - customeremail
  - PUBLISHEDDATE
  - Total Price
```

**Be Descriptive**
```
Good:
  - articlePublishedDate
  - customerLifetimeValue
  - productStockQuantity

Avoid:
  - date
  - value
  - quantity
```

**Group Related Fields**
```
Good:
  - billing_address
  - billing_city
  - billing_state
  - billing_zip
  
  - shipping_address
  - shipping_city
  - shipping_state
  - shipping_zip

Pattern is clear and consistent
```

## Records Deep Dive

### What is a Record?

A **record** is a single row in your sheet - one complete instance of your model.

Example:
```
Model: Customer

Record 1:
  id: 1
  firstName: "John"
  lastName: "Doe"
  email: "john@example.com"
  status: "Active"
  createdAt: "2025-01-15"
```

### Record Creation

#### Via Forms

```
User fills form:
  First Name: John
  Last Name: Doe
  Email: john@example.com

Result: New record created with:
  - User input values
  - Auto-generated ID
  - Default field values
  - Timestamp
```

#### Via API

```
POST /api/models/customers/records
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}

Result: Record created via API call
```

#### Via Action

```
Action Step: Create Child Record
Parent: Blog Article (id: 5)
Target Model: Social Posts

Create:
  sourceArticle: 5
  platform: "Instagram"
  status: "Draft"

Result: Child record linked to parent
```

#### Manual Entry

```
User clicks "Add Record" in sheet
Fills in fields directly
Saves record

Result: Manual record creation
```

### Record Relationships

#### Parent-Child Relationships

```
Parent Record (Blog Article):
  id: 100
  title: "10 AI Tips"
  content: "..."

Child Records (Social Posts):
  id: 501
  sourceArticle: 100
  platform: "Instagram"
  
  id: 502
  sourceArticle: 100
  platform: "Twitter"
  
  id: 503
  sourceArticle: 100
  platform: "LinkedIn"

One parent → Multiple children
```

#### Cross-Model References

```
Order Record:
  id: 1001
  customer: 5 (→ Customer model)
  product: 42 (→ Product model)
  quantity: 2
  total: $199.98

References link to other records
```

#### Lookup Fields

```
Order Record:
  customer: 5
  customer_name: "John Doe" (looked up from Customer.name)
  customer_email: "john@example.com" (looked up from Customer.email)

Automatically pulls data from related record
```

### Record States

#### Active Record
```
status: "Active"
archived: false

Visible in default views
Can be edited
Can be processed by actions
```

#### Archived Record
```
status: "Archived"
archived: true

Hidden from default views
Read-only (usually)
Preserved for history
```

#### Deleted Record
```
Two approaches:

Soft Delete:
  - Record still exists
  - Marked as deleted
  - Hidden from views
  - Can be restored

Hard Delete:
  - Record removed from database
  - Cannot be restored
  - Relationships broken
```

### Working with Records

#### Viewing Records

```
Sheet View:
  - Table of all records
  - Sortable columns
  - Filterable rows
  - Selectable records

Detail View:
  - Single record expanded
  - All fields visible
  - Edit inline
  - View related records
```

#### Editing Records

```
Methods:
1. Click into cell → Edit → Save
2. Open record → Edit fields → Save
3. Bulk edit → Select multiple → Update field → Apply
4. Via action → Process → Auto-update
```

#### Deleting Records

```
Single Delete:
  Select record → Delete → Confirm

Bulk Delete:
  Select multiple → Delete → Confirm

Cascade Delete (optional):
  Delete parent → Also delete children
  
Prevent Delete:
  If record has children
  If referenced elsewhere
```

## Field Usage in Actions

### Input Fields

Fields that provide data to actions:

```
Action: Generate Social Post

Input Fields:
  - Article.title
  - Article.content
  - Article.author
  - Article.category

These values feed into AI processing
```

### Output Fields

Fields that store action results:

```
Action: Generate Social Post

Output Fields:
  - SocialPost.postText (generated caption)
  - SocialPost.imageUrl (generated image)
  - SocialPost.hashtags (extracted tags)

Action writes results to these fields
```

### Intermediate Fields

Fields used during processing but not final outputs:

```
Action: Content Enhancement

Intermediate Fields:
  - processingStatus (tracking progress)
  - tempData (temporary calculations)
  - errorLog (if something fails)

Helper fields for action execution
```

## Global Workspace Fields

### Understanding Global Fields

Within a workspace, **all model fields are accessible** to all actions. This enables powerful cross-model workflows.

### Example: Cross-Model Action

```
Workspace: Content Hub

Model A: Blog Articles
  - id
  - title
  - content
  - author

Model B: Social Posts
  - id
  - platform
  - postText
  - sourceArticle (→ Blog Articles)

Action in Social Posts can access:
  - Local: SocialPosts.platform
  - Global: BlogArticles.title (from related record)
  - Global: BlogArticles.content (from related record)
```

### Using Global Fields

```
Action: "Create Social Post from Article"
Location: Social Posts model

Step 1: AI Reasoning
  Input:
    - BlogArticles.title (global field)
    - BlogArticles.content (global field)
    - SocialPosts.platform (local field)
  
  Prompt: |
    Create a {platform} post about:
    Title: {BlogArticles.title}
    Content: {BlogArticles.content}
  
  Output:
    - SocialPosts.postText (local field)

Step 2: Update Parent
  Output:
    - BlogArticles.socialPostsCount += 1 (global field)
```

### Scope Rules

**Can Access**:
- ✅ Own model fields (local)
- ✅ Related model fields (via relationships)
- ✅ Any workspace model fields (global)

**Cannot Access**:
- ❌ Fields from other workspaces
- ❌ Fields from other agents
- ❌ Deleted or archived model fields

## Advanced Field Techniques

### Computed Fields

```
Field: Full Name
Type: Computed
Formula: {firstName} + " " + {lastName}
Update: Automatic
Read-Only: Yes

User enters:
  firstName: "John"
  lastName: "Doe"

System computes:
  fullName: "John Doe"
```

### Conditional Fields

```
Field: Discount Code
Visible: When {hasDiscount} = true
Required: When visible

Behavior:
  - Hidden if hasDiscount is false
  - Shown and required if hasDiscount is true
  - Dynamic form behavior
```

### Rollup Fields

```
Field: Total Order Value
Type: Rollup
Source: Related Orders
Operation: SUM(orders.total)

Customer record shows:
  totalOrderValue: $5,432.18
  
Automatically calculated from all related orders
```

### Lookup Fields

```
Field: Customer Email
Type: Lookup
Source: Related Customer
Field: email

Order record automatically displays:
  customerEmail: "john@example.com"
  
Pulled from related customer record
```

## Record Operations

### Bulk Operations

#### Bulk Update

```
Select multiple records:
  - Filter by status = "Draft"
  - Select all 50 records
  
Update:
  - Set status = "Published"
  - Set publishedDate = Today
  
Apply to all selected records at once
```

#### Bulk Delete

```
Select records to delete:
  - Filter by createdDate < 2024-01-01
  - Review matches
  - Delete all (with confirmation)
```

#### Bulk Import

```
Import CSV file:
  - Map columns to fields
  - Validate data
  - Choose conflict resolution
  - Import 1,000 records
```

#### Bulk Export

```
Export filtered records:
  - Apply filters
  - Select fields to export
  - Choose format (CSV, JSON, Excel)
  - Download file
```

### Record Versioning

```
Track changes to records:

Version 1 (Created):
  title: "How to Use AI"
  status: "Draft"
  createdBy: "john@example.com"
  createdAt: "2025-10-01 10:00 AM"

Version 2 (Updated):
  title: "How to Use AI in Marketing"
  status: "Review"
  updatedBy: "jane@example.com"
  updatedAt: "2025-10-05 2:30 PM"

Version 3 (Published):
  status: "Published"
  publishedBy: "admin@example.com"
  publishedAt: "2025-10-10 9:00 AM"

Full history maintained
```

## Data Quality

### Validation

```
Field: Email
Validation:
  - Format: Valid email address
  - Required: Yes
  - Unique: Yes
  - Domain whitelist: ["company.com", "example.com"]

Ensures data quality at entry
```

### Deduplication

```
Strategy:
1. Identify duplicate field (e.g., email)
2. Find records with same value
3. Review duplicates
4. Merge or delete
5. Set unique constraint

Maintains data integrity
```

### Data Cleaning

```
Common cleaning actions:
- Trim whitespace
- Standardize formatting
- Normalize values
- Remove invalid characters
- Validate formats
```

## Best Practices

### Field Design

**Start Simple**
```
Begin with essential fields:
  - Identifier (name, SKU, email)
  - Core data (description, content)
  - Status (active, draft, published)
  - Timestamps (created, updated)

Add more fields as needed
```

**Use Appropriate Types**
```
Email → Email field (not Text)
Price → Currency field (not Number)
Status → Select field (not Text)

Proper types enable better validation and UX
```

**Plan for Growth**
```
Consider future needs:
  - Room for additional statuses
  - Flexible field naming
  - Scalable relationships
  - Extensible structure
```

### Record Management

**Keep Records Clean**
```
- Archive old records
- Delete duplicates
- Validate regularly
- Backup important data
```

**Use Relationships**
```
Link related data:
  - Don't duplicate
  - Reference instead
  - Maintain integrity
  - Enable powerful queries
```

**Document Field Purpose**
```
Add field descriptions:
  Field: internalNotes
  Description: "Internal team notes, not visible to customers"
  
Helps team understand usage
```

## Troubleshooting

### Common Field Issues

**Issue**: Cannot create record (required field)  
**Solution**: Fill all required fields or update field to optional

**Issue**: Unique constraint violation  
**Solution**: Change value to be unique or remove unique constraint

**Issue**: Invalid field type  
**Solution**: Verify data matches field type (number vs text, etc.)

### Common Record Issues

**Issue**: Record not appearing in sheet  
**Solution**: Check filters, verify creation, check permissions

**Issue**: Cannot edit record  
**Solution**: Check permissions, verify record isn't locked

**Issue**: Relationship not linking  
**Solution**: Verify related record exists, check relationship config

## Next Steps

- [Forms](./08-forms.md) - Create interfaces for entering field data
- [Actions](./09-actions.md) - Build workflows that process records
- [Data Flow](./13-data-flow.md) - Understand how data moves through the system
- [Best Practices](./14-best-practices.md) - Optimize your data design

