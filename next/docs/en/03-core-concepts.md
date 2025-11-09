# Core Concepts

Understanding these core concepts will help you build effective automation workflows with Ryu.

## Hierarchy Overview

Ryu uses a hierarchical structure to organize your automation resources:

```
Agent
  └── Workspace
       ├── Model
       │    ├── Sheet (Fields + Records)
       │    ├── Forms
       │    └── Actions
       └── API Connections
```

## Agents

### What is an Agent?

An **agent** is the highest-level organizational unit in Ryu. Think of it as a complete automation project or business function.

### Characteristics
- Contains multiple workspaces
- Represents a broad automation domain
- Isolates resources from other agents
- Can be managed and shared independently

### Examples
- Marketing Automation Agent
- Customer Support Agent
- Content Creation Agent
- Sales Pipeline Agent
- HR Onboarding Agent

### When to Create Multiple Agents
Create separate agents when:
- Working on completely different business functions
- Needing strict separation of data and permissions
- Managing different clients or departments
- Building distinct products or services

## Workspaces

### What is a Workspace?

A **workspace** is a top-level organizational container within an agent. It groups related models and manages API connections.

### Key Properties
- Belongs to exactly one agent
- Contains multiple models
- Has its own set of API connections
- Provides isolation for different projects or environments

### The Global Workspace Concept

Each workspace acts as a "global scope" for its models:
- Models within a workspace can reference each other
- Actions can access fields from any model in the workspace
- API connections are shared across all models
- Forms can create records in any workspace model

### Examples
- Production Environment
- Testing Environment
- Campaign A
- Campaign B
- Q1 Projects
- Client Projects

### Workspace Limits
- **One connection per API type** - You can have one Facebook connection, one Instagram connection, etc., but not multiple of the same type
- Models are scoped to the workspace
- Schedules operate within workspace boundaries

## Models

### What is a Model?

A **model** defines a data structure - what information you want to track and how it's organized.

### Components of a Model
1. **Schema Definition** - Field types and properties
2. **Sheet** - The actual data table (records and values)
3. **Forms** - Input interfaces for creating records
4. **Actions** - Processing workflows for the data

### Model Examples

#### E-commerce Product Model
```
Fields:
- Product Name (Text)
- Description (Long Text)
- Price (Number)
- Stock Count (Number)
- Category (Select)
- Images (File Upload)
- Published (Checkbox)
```

#### Customer Model
```
Fields:
- Name (Text)
- Email (Email)
- Phone (Phone)
- Company (Text)
- Status (Select: Lead, Active, Churned)
- Last Contact (Date)
- Notes (Long Text)
```

### Relationships Between Models

Models can reference each other:
- **One-to-Many**: One customer has many orders
- **Many-to-Many**: Products can have multiple tags, tags apply to multiple products
- **Parent-Child**: Actions can create child records in related models

## Sheets

### What is a Sheet?

A **sheet** is the database table that stores your actual data. Each model has exactly one sheet.

### Sheet Structure
- **Fields** (Columns) - Define what data to capture
- **Records** (Rows) - Individual entries in the table
- **Views** - Different ways to display and filter the data

### Field Types

| Type | Description | Example |
|------|-------------|---------|
| Text | Short text strings | Product name |
| Long Text | Multi-line text | Descriptions, notes |
| Number | Numeric values | Price, quantity |
| Checkbox | Boolean true/false | Published, active |
| Select | Predefined options | Status, category |
| Date | Date values | Created date |
| Date/Time | Date with time | Last updated |
| Email | Email addresses | Contact email |
| Phone | Phone numbers | Customer phone |
| URL | Web addresses | Website link |
| File | File uploads | Images, documents |
| Relationship | Link to other models | Customer ID |

### Working with Records

Each record represents a single entity:
- Created via forms or API
- Processed by actions
- Updated manually or automatically
- Linked to other records via relationships

## Fields

### What are Fields?

**Fields** are the columns in your sheets - they define what data each record contains.

### Field Properties
- **Name**: Human-readable identifier
- **Type**: Data type (text, number, date, etc.)
- **Required**: Whether the field must have a value
- **Default Value**: Pre-populated value for new records
- **Validation Rules**: Constraints on acceptable values

### Special Field Uses

#### Input Fields
Fields that store raw data entered by users or received from APIs:
```
- Title
- Description
- User Email
- Raw Content
```

#### Output Fields
Fields that store results from AI processing or API responses:
```
- Generated Caption
- Image URL
- API Response
- Processed Status
```

#### Computed Fields
Fields used in action logic but may not be directly visible:
```
- Internal IDs
- Processing Flags
- Temporary Values
```

### Global Fields

In the context of actions, "global workspace fields" refers to fields from any model in the workspace that can be used as inputs or outputs.

**Example**:
```
Workspace: Marketing Hub
  Model A: Blog Posts
    - Title
    - Content
  
  Model B: Social Posts
    - Platform
    - Post Text
    
Action in Model B can use Model A's Title and Content as inputs
```

## Records

### What is a Record?

A **record** is a single row in a sheet - one instance of your model.

### Record Lifecycle

1. **Creation**
   - Via form submission
   - Via API
   - Via action (child record creation)
   - Manual entry

2. **Processing**
   - Actions execute on individual records
   - AI analyzes and generates content
   - API calls send/receive data
   - Fields get updated

3. **Relationships**
   - Parent-child links
   - Cross-model references
   - Hierarchical structures

4. **Archival/Deletion**
   - Soft delete (marked inactive)
   - Hard delete (removed)
   - Exported for backup

### Record Context in Actions

When an action executes on a record:
- It has access to all fields in that record
- It can read fields from related records
- It can update fields in the current record
- It can create new records in other models

## Data Flow Principles

### Input → Process → Output

All automation follows this pattern:

```
INPUT FIELDS → ACTION STEPS → OUTPUT FIELDS
```

**Example**:
```
{Product Name, Description} → AI Enhancement → {Enhanced Description, Keywords}
```

### Reusability

Data stored in fields can be:
- Used multiple times across different actions
- Referenced by other models
- Scheduled for periodic processing
- Exported or integrated with external systems

### Global vs. Local Scope

**Local Scope** (Model Level):
- Fields within the model
- Records in the model's sheet
- Forms specific to the model
- Actions defined for the model

**Global Scope** (Workspace Level):
- All models in the workspace
- All workspace API connections
- Cross-model references
- Shared data access

## Relationships and Data Connections

### Parent-Child Relationships

Actions can create child records:

```
Blog Article (Parent)
  └── Social Post 1 (Child)
  └── Social Post 2 (Child)
  └── Social Post 3 (Child)
```

### Cross-Model References

Models can reference each other:

```
Order Model:
  - Customer (→ Customer Model)
  - Products (→ Product Model, multiple)
  - Shipping (→ Shipping Model)
```

### Data Inheritance

Child records can inherit data from parents:

```
Parent: Campaign
  - Name: "Summer Sale"
  - Budget: $10,000
  
Child: Ad Creative
  - Campaign Name: "Summer Sale" (inherited)
  - Budget Allocated: $2,000 (derived)
```

## Key Principles

### 1. Separation of Concerns
- **Models** define structure
- **Forms** handle input
- **Actions** process data
- **Sheets** store data
- **Schedules** automate execution

### 2. Composability
- Combine simple components to build complex workflows
- Reuse models across different actions
- Share data between models via relationships

### 3. Flexibility
- Fields can serve multiple purposes
- Actions can chain together
- Data flows in multiple directions

### 4. Scalability
- Add models as needs grow
- Create additional workspaces for organization
- Scale horizontally with multiple agents

## Next Steps

Now that you understand the core concepts, explore the detailed documentation for each component:

- [Agents](./04-agents.md) - Deep dive into agent management
- [Workspaces](./05-workspaces.md) - Organizing your environment
- [Models & Sheets](./06-models-and-sheets.md) - Structuring your data
- [Fields & Records](./07-fields-and-records.md) - Working with data

Or continue to specific features:
- [Forms](./08-forms.md) - Building input interfaces
- [Actions](./09-actions.md) - Creating workflows
- [API Connections](./11-api-connections.md) - Integrating services

