# Models and Sheets

## Overview

Models define the structure of your data, while sheets are the actual database tables that store records. Together, they form the foundation of your data management in Ryu.

## What is a Model?

A **model** is a blueprint that defines:
- What data you want to track
- What fields (columns) your data has
- How the data is organized
- What you can do with the data (forms and actions)

Think of a model like a class in programming or a table definition in a database.

## What is a Sheet?

A **sheet** is the actual data storage for a model:
- Contains all the records (rows)
- Has columns defined by the model's fields
- Displays data in table format
- Supports filtering, sorting, and views

Think of a sheet like a spreadsheet or database table with actual data.

## Model-Sheet Relationship

```
Model: "Customer"                    Sheet: Customer Data
├── Field Definitions                ├── Actual Records
│   ├── Name (Text)                 │   ├── Row 1: John Doe
│   ├── Email (Email)               │   ├── Row 2: Jane Smith
│   └── Status (Select)             │   └── Row 3: Bob Johnson
├── Forms                            ├── Filtered Views
└── Actions                          └── Sort Options

One Model → One Sheet
```

## Creating a Model

### Basic Model Setup

**Required Information**:
- **Model Name**: What you're tracking (e.g., "Products", "Customers", "Orders")
- **Description**: Purpose of the model
- **Icon**: Visual identifier (optional)

**Example**:
```
Name: Blog Articles
Description: Manages blog content from draft to publication
Icon: 📝
Workspace: Content Hub
```

### Field Configuration

Add fields to define your data structure:

```
Blog Articles Model:
  ├── id (Auto-generated)
  ├── title (Text, required)
  ├── content (Long Text, required)
  ├── author (Text)
  ├── category (Select: Tech, Marketing, Product)
  ├── status (Select: Draft, Review, Published)
  ├── publishedDate (Date)
  ├── featuredImage (File Upload)
  ├── views (Number)
  └── tags (Multi-Select)
```

## Field Types and Use Cases

### Text Fields

#### Short Text
- **Use**: Names, titles, short descriptions
- **Max Length**: 255 characters
- **Examples**: Product name, email subject, category

```
Field: Product Name
Type: Text
Required: Yes
Validation: 3-100 characters
Default: ""
```

#### Long Text
- **Use**: Descriptions, content, notes
- **Max Length**: Unlimited
- **Examples**: Blog content, product descriptions, notes

```
Field: Article Content
Type: Long Text
Required: Yes
Rich Text: Enabled
Default: ""
```

#### Email
- **Use**: Email addresses
- **Validation**: Automatic email format checking
- **Examples**: Customer email, contact email

```
Field: Contact Email
Type: Email
Required: Yes
Unique: Yes
```

#### Phone
- **Use**: Phone numbers
- **Validation**: Optional format validation
- **Examples**: Customer phone, support number

```
Field: Phone Number
Type: Phone
Required: No
Format: International
```

#### URL
- **Use**: Web addresses
- **Validation**: Valid URL format
- **Examples**: Website, social profile, image URL

```
Field: Website
Type: URL
Required: No
Auto-Link: Yes
```

### Number Fields

#### Number
- **Use**: Quantities, prices, scores
- **Precision**: Configurable decimals
- **Examples**: Price, quantity, rating

```
Field: Price
Type: Number
Required: Yes
Min: 0
Decimals: 2
Prefix: $
```

#### Currency
- **Use**: Monetary values
- **Format**: Currency-specific formatting
- **Examples**: Revenue, cost, budget

```
Field: Budget
Type: Currency
Currency: USD
Required: Yes
```

### Selection Fields

#### Single Select
- **Use**: Single choice from predefined options
- **Options**: Manually defined
- **Examples**: Status, category, priority

```
Field: Status
Type: Select
Options:
  - Draft (gray)
  - In Review (yellow)
  - Published (green)
  - Archived (red)
Default: Draft
Required: Yes
```

#### Multi-Select
- **Use**: Multiple choices from options
- **Options**: Manually defined
- **Examples**: Tags, skills, features

```
Field: Tags
Type: Multi-Select
Options:
  - AI
  - Marketing
  - Tutorial
  - Case Study
  - Product Update
Max Selections: 5
```

### Date and Time Fields

#### Date
- **Use**: Dates without time
- **Format**: Configurable
- **Examples**: Birth date, deadline, published date

```
Field: Published Date
Type: Date
Required: No
Format: MM/DD/YYYY
Default: Today
```

#### Date/Time
- **Use**: Timestamps
- **Timezone**: Aware
- **Examples**: Created at, last updated, scheduled time

```
Field: Scheduled Time
Type: Date/Time
Required: Yes
Timezone: User's timezone
Include Time: Yes
```

### Boolean Fields

#### Checkbox
- **Use**: Yes/no, true/false values
- **Display**: Checkmark or toggle
- **Examples**: Published, active, featured

```
Field: Published
Type: Checkbox
Default: false
```

### File Fields

#### File Upload
- **Use**: Documents, images, media
- **Types**: Configurable file type restrictions
- **Examples**: Images, PDFs, videos

```
Field: Featured Image
Type: File
Accept: Images only (.jpg, .png, .webp)
Max Size: 5 MB
Required: No
```

### Relationship Fields

#### Link to Another Model
- **Use**: Connect records across models
- **Type**: One-to-one, one-to-many, many-to-many
- **Examples**: Customer orders, product categories

```
Field: Author
Type: Relationship
Target Model: Users
Relationship: Many-to-One (many articles, one author)
Display Field: name
```

## Advanced Field Configuration

### Validation Rules

```
Field: Email
Type: Email
Validation:
  - Required: Yes
  - Unique: Yes
  - Format: Email
  - Custom Regex: ^[a-z0-9]+@company\.com$
  - Error Message: "Must be a company email"
```

### Computed Fields

```
Field: Full Name
Type: Computed
Formula: {First Name} + " " + {Last Name}
Read-Only: Yes
```

```
Field: Total Price
Type: Computed
Formula: {Quantity} * {Unit Price}
Update: On any field change
```

### Conditional Fields

```
Field: Discount Code
Type: Text
Visible: When {Has Discount} = true
Required: When visible
```

## Working with Sheets

### Sheet Views

Sheets can display data in multiple ways:

#### Table View (Default)
```
Standard spreadsheet layout
- Rows: Records
- Columns: Fields
- Sorting: Click column headers
- Filtering: Column filters
```

#### Grid View
```
Card-based layout
- Each record is a card
- Visual representation
- Drag and drop
- Good for images
```

#### Calendar View
```
Date-based display
- Requires date field
- Monthly, weekly, daily views
- Drag to reschedule
- Good for schedules
```

#### Kanban View
```
Column-based workflow
- Grouped by select field
- Drag between columns
- Visual workflow
- Good for status tracking
```

### Custom Views

**Custom views** are use-case-specific, beautifully designed interfaces that present your records in a more visually appealing and contextual format than standard table views.

#### What are Custom Views?

Custom views transform raw data into purpose-built interfaces:

- **Contextual Design**: UI optimized for specific use cases
- **Visual Appeal**: Beautiful, modern interfaces instead of spreadsheet layouts
- **Enhanced Readability**: Information organized for easy comprehension
- **User-Friendly**: Intuitive navigation and interaction
- **Professional Presentation**: Polished look for client-facing scenarios

#### Custom View Examples

**Content Calendar View**
```
For: Blog Articles Model

Display:
┌─────────────────────────────────────────────┐
│  📅 October 2025 Content Calendar           │
├─────────────────────────────────────────────┤
│                                             │
│  Monday          Tuesday         Wednesday  │
│  ┌────────────┐  ┌────────────┐ ┌─────────┐│
│  │ 📝 Article │  │            │ │ 📝 Post ││
│  │ 10 AI Tips │  │            │ │ Guide   ││
│  │ Author: J  │  │            │ │ Status: ││
│  │ Status: ✅ │  │            │ │ Draft   ││
│  └────────────┘  └────────────┘ └─────────┘│
│                                             │
└─────────────────────────────────────────────┘

Features:
- Visual calendar layout
- Color-coded by status
- Drag-and-drop rescheduling
- Quick preview on hover
- Author avatars
- Publication status icons
```

**Product Catalog View**
```
For: Products Model

Display:
┌─────────────────────────────────────────────┐
│  🛍️ Product Catalog                         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │       │
│  │        │  │        │  │        │       │
│  │ Laptop │  │ Mouse  │  │ Desk   │       │
│  │ $999   │  │ $29    │  │ $399   │       │
│  │ ⭐⭐⭐⭐⭐ │  │ ⭐⭐⭐⭐  │  │ ⭐⭐⭐⭐⭐ │       │
│  │ 📦 50  │  │ 📦 200 │  │ 📦 15  │       │
│  └────────┘  └────────┘  └────────┘       │
│                                             │
└─────────────────────────────────────────────┘

Features:
- Grid layout with product images
- Price prominently displayed
- Star ratings visualization
- Stock level indicators
- Quick actions (edit, duplicate)
- Filter by category/price
```

**Contact Management View**
```
For: Customers Model

Display:
┌─────────────────────────────────────────────┐
│  👥 Customer Directory                      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────┐           │
│  │ 👤 John Doe                 │           │
│  │ john@acme.com               │           │
│  │ Acme Corp · CEO             │           │
│  │ 📞 (555) 123-4567           │           │
│  │ 💰 Lifetime Value: $50,000  │           │
│  │ 📅 Last Contact: 2 days ago │           │
│  │ [📧 Email] [📞 Call] [✏️ Edit]│           │
│  └─────────────────────────────┘           │
│                                             │
│  ┌─────────────────────────────┐           │
│  │ 👤 Jane Smith               │           │
│  │ jane@techco.io              │           │
│  │ TechCo · CTO                │           │
│  │ ...                         │           │
│  └─────────────────────────────┘           │
│                                             │
└─────────────────────────────────────────────┘

Features:
- Card-based contact layout
- Profile pictures
- One-click communication
- Key metrics at a glance
- Status indicators
- Recent activity timeline
```

**Project Dashboard View**
```
For: Projects Model

Display:
┌─────────────────────────────────────────────┐
│  📊 Project Dashboard                       │
├─────────────────────────────────────────────┤
│                                             │
│  Website Redesign                          │
│  ████████░░ 80% Complete                   │
│  👥 5 members · 📅 Due in 5 days           │
│  🔴 3 blockers · ✅ 24/30 tasks            │
│                                             │
│  Mobile App Launch                         │
│  ████░░░░░░ 40% Complete                   │
│  👥 8 members · 📅 Due in 14 days          │
│  🟢 On track · ✅ 12/30 tasks              │
│                                             │
└─────────────────────────────────────────────┘

Features:
- Progress bars
- Team member avatars
- Status indicators
- Key metrics
- Quick actions
- Priority highlighting
```

**Gallery View**
```
For: Portfolio / Media Model

Display:
┌─────────────────────────────────────────────┐
│  🎨 Portfolio Gallery                       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ [IMG]  │ │ [IMG]  │ │ [IMG]  │         │
│  │ Large  │ │ Large  │ │ Large  │         │
│  │        │ │        │ │        │         │
│  │ Project│ │ Design │ │ Photo  │         │
│  │ Alpha  │ │ Work   │ │ Series │         │
│  └────────┘ └────────┘ └────────┘         │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │     │
│  │Small │ │Small │ │Small │ │Small │     │
│  └──────┘ └──────┘ └──────┘ └──────┘     │
│                                             │
└─────────────────────────────────────────────┘

Features:
- Masonry layout
- Lightbox preview
- Image optimization
- Lazy loading
- Filtering by tags
- Sort by date/views
```

**Analytics Dashboard View**
```
For: Metrics / Analytics Model

Display:
┌─────────────────────────────────────────────┐
│  📈 Analytics Overview                      │
├─────────────────────────────────────────────┤
│                                             │
│  Total Views        Engagement Rate        │
│  ┌─────────┐       ┌─────────┐            │
│  │ 45,231  │       │  8.5%   │            │
│  │ ↑ 12%   │       │  ↑ 2.1% │            │
│  └─────────┘       └─────────┘            │
│                                             │
│  📊 Trends                                  │
│  ┌───────────────────────────────┐         │
│  │        ╱╲    ╱╲               │         │
│  │   ╱╲  ╱  ╲  ╱  ╲              │         │
│  │  ╱  ╲╱    ╲╱    ╲             │         │
│  └───────────────────────────────┘         │
│                                             │
└─────────────────────────────────────────────┘

Features:
- Real-time metrics
- Interactive charts
- Trend indicators
- Period comparisons
- Export functionality
- Customizable widgets
```

#### Benefits of Custom Views

**Enhanced User Experience**:
- Intuitive interfaces tailored to specific workflows
- Reduced cognitive load with contextual information
- Faster data comprehension

**Professional Presentation**:
- Client-facing displays that look polished
- Team dashboards that inspire confidence
- Presentation-ready views

**Improved Productivity**:
- Quick access to relevant information
- Visual indicators for status and priority
- One-click actions from the view

**Better Decision Making**:
- Data visualizations aid understanding
- Key metrics prominently displayed
- Trends and patterns easily identifiable

#### Creating Custom Views

**Use Case-Based Generation**:
```
1. Select your model
2. Choose "Create Custom View"
3. Select use case:
   - Content Calendar
   - Product Catalog
   - Contact Directory
   - Project Dashboard
   - Gallery
   - Analytics
   - Task Board
   - Timeline
4. Customize:
   - Choose which fields to display
   - Set visual preferences
   - Configure interactions
5. Preview and save
```

**Customization Options**:
- Layout style (cards, grid, list)
- Color schemes
- Display density (compact, comfortable, spacious)
- Featured fields
- Quick action buttons
- Sorting and filtering defaults

#### Custom Views vs. Standard Views

| Feature | Standard Table | Custom View |
|---------|---------------|-------------|
| **Layout** | Rows and columns | Contextual design |
| **Visual Appeal** | Functional | Beautiful |
| **Use Case** | Generic | Specific |
| **Information Density** | High | Optimized |
| **Learning Curve** | Familiar | Intuitive |
| **Customization** | Limited | Extensive |
| **Client-Facing** | Basic | Professional |

#### When to Use Custom Views

**Use Custom Views When**:
- Presenting data to clients or stakeholders
- Need visual appeal matters
- Context-specific information display required
- Managing media/images
- Tracking projects or tasks
- Creating dashboards
- Showing portfolios

**Use Standard Table When**:
- Bulk data entry needed
- Detailed editing required
- Complex filtering/sorting
- Data export/analysis
- Quick scanning of many records

### Sheet Operations

#### Sorting

```
Sort By:
  Primary: Published Date (Descending)
  Secondary: Views (Descending)
  
Result: Newest, most popular articles first
```

#### Filtering

```
Filters:
  Status = "Published"
  AND Category = "Marketing"
  AND Published Date > 2025-01-01
  
Result: Recent published marketing articles
```

#### Grouping

```
Group By: Category
  
Result:
  Technology (15 articles)
  Marketing (22 articles)
  Product (8 articles)
```

### Sheet Permissions

```
View Permissions:
  - Public: Anyone can view
  - Workspace: Workspace members only
  - Private: Model owners only

Edit Permissions:
  - All workspace members
  - Specific roles only
  - Owner only
```

## Model Relationships

### One-to-Many

One record in Model A relates to many records in Model B.

```
Customer Model (One)
  id: 1
  name: "Acme Corp"
  
Order Model (Many)
  id: 101, customer_id: 1
  id: 102, customer_id: 1
  id: 103, customer_id: 1
  
One customer has many orders
```

### Many-to-One

Many records in Model A relate to one record in Model B.

```
Article Model (Many)
  id: 1, author_id: 10
  id: 2, author_id: 10
  id: 3, author_id: 10
  
Author Model (One)
  id: 10
  name: "Jane Doe"
  
Many articles by one author
```

### Many-to-Many

Records in both models can relate to multiple records in the other.

```
Product Model
  id: 1, name: "Laptop"
  id: 2, name: "Mouse"
  
Tag Model
  id: 101, name: "Electronics"
  id: 102, name: "Accessories"
  
Product-Tag Relationships:
  Product 1 → Tag 101
  Product 1 → Tag 102
  Product 2 → Tag 102
  
Laptop has tags: Electronics, Accessories
Mouse has tags: Accessories
```

### Parent-Child

Hierarchical relationship within the same model or across models.

```
Blog Article (Parent)
  id: 1
  title: "How to Use AI"
  
Social Posts (Children)
  id: 201, parent_article: 1, platform: "Instagram"
  id: 202, parent_article: 1, platform: "Twitter"
  id: 203, parent_article: 1, platform: "LinkedIn"
  
One article generates multiple social posts
```

## Model Templates

### Common Model Patterns

#### Content Model
```
Name: Blog Posts
Fields:
  - title (Text)
  - slug (Text, unique)
  - content (Long Text)
  - author (Relationship → Users)
  - category (Select)
  - tags (Multi-Select)
  - status (Select)
  - publishedDate (Date)
  - featuredImage (File)
  - seo_title (Text)
  - seo_description (Text)
```

#### Customer Model
```
Name: Customers
Fields:
  - firstName (Text)
  - lastName (Text)
  - email (Email, unique)
  - phone (Phone)
  - company (Text)
  - status (Select: Lead, Active, Churned)
  - source (Select: Website, Referral, Ad)
  - lifetime_value (Currency)
  - created_at (Date/Time)
  - notes (Long Text)
```

#### Product Model
```
Name: Products
Fields:
  - sku (Text, unique)
  - name (Text)
  - description (Long Text)
  - category (Select)
  - price (Currency)
  - cost (Currency)
  - stock_quantity (Number)
  - images (File, multiple)
  - active (Checkbox)
  - tags (Multi-Select)
```

#### Task Model
```
Name: Tasks
Fields:
  - title (Text)
  - description (Long Text)
  - assignee (Relationship → Users)
  - status (Select: To Do, In Progress, Done)
  - priority (Select: Low, Medium, High)
  - due_date (Date)
  - created_at (Date/Time)
  - completed_at (Date/Time)
  - tags (Multi-Select)
```

## Best Practices

### Model Design

**Keep Models Focused**
```
Good:
  - Customers
  - Orders
  - Products

Avoid:
  - Everything (single model for all data)
```

**Use Relationships**
```
Good:
  Orders model links to Customers model
  
Avoid:
  Duplicating customer data in every order
```

**Choose Appropriate Field Types**
```
Good:
  - Price: Currency field
  - Email: Email field
  - Status: Select field

Avoid:
  - Everything as Text field
```

### Field Naming

**Use Clear Names**
```
Good:
  - publishedDate
  - firstName
  - totalPrice

Avoid:
  - date
  - name
  - price
```

**Be Consistent**
```
Good:
  - createdAt, updatedAt, publishedAt
  
Avoid:
  - created_date, update_time, published
```

**Use Prefixes for Related Fields**
```
Good:
  - seo_title, seo_description, seo_keywords
  - billing_address, billing_city, billing_zip
  
Avoid:
  - title, meta, search_title
```

### Sheet Organization

**Create Multiple Views**
```
- All Records (default)
- Published Only
- Needs Review
- By Author
- By Category
```

**Use Filters Effectively**
```
Save common filters as views:
  - "This Week's Posts"
  - "Pending Approval"
  - "High Priority"
```

**Archive Old Data**
```
Instead of deleting:
  - Add "archived" checkbox
  - Filter out archived by default
  - Keep for historical reference
```

## Troubleshooting

### Common Issues

**Issue**: Too many fields in one model  
**Solution**: Split into related models, use relationships

**Issue**: Records not appearing in sheet  
**Solution**: Check view filters, verify record creation, check permissions

**Issue**: Cannot delete model  
**Solution**: Remove all records first, check for dependencies

**Issue**: Relationship field not working  
**Solution**: Verify target model exists, check relationship configuration

## Next Steps

- [Fields & Records](./07-fields-and-records.md) - Deep dive into working with data
- [Forms](./08-forms.md) - Create input interfaces for your models
- [Actions](./09-actions.md) - Build workflows that process your data
- [Data Flow](./13-data-flow.md) - Understand how data moves through the system

