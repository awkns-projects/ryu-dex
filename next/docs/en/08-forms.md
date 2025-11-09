# Forms

## Overview

Forms are user-friendly interfaces that allow humans to input data and create records in your sheets. Each form maps to a model and determines which fields users can fill.

## What is a Form?

A **form** is:
- A data input interface
- Mapped to a specific model
- Configured with selected fields
- Customizable layout and styling
- Creates records when submitted

Think of forms as the "front door" for data entry into your system.

## Form Types

The platform supports two main types of forms:

### Admin Forms

**Admin forms** are designed for internal use by team members and administrators.

**Characteristics**:
- **Access**: Restricted to workspace members or specific roles
- **Authentication**: Requires user login
- **Purpose**: Internal data entry, team collaboration, content management
- **Permissions**: Can be restricted by user role (admin, editor, etc.)
- **Context**: Used within the Ryu interface

**Use Cases**:
- Content creators entering blog articles
- Team members adding products to catalog
- Admins managing customer records
- Internal task and project management
- Data entry for operational workflows

**Example**:
```
Form: Add New Blog Article (Admin Form)
Access: Workspace editors only
Fields: Title, Content, Author, Category, SEO settings
Purpose: Internal content creation
```

### Member Forms

**Member forms** are designed for external users to submit information.

**Characteristics**:
- **Access**: Public or shared via link
- **Authentication**: Optional (can be public or require signup)
- **Purpose**: Collect information from customers, visitors, or external users
- **Permissions**: Open to specific audiences
- **Context**: Embedded in websites, shared as links, or on landing pages

**Use Cases**:
- Customer contact forms
- Lead generation forms
- Event registration
- Job applications
- Customer feedback surveys
- Support ticket submissions
- Newsletter signups
- Product inquiries

**Example**:
```
Form: Contact Us (Member Form)
Access: Public (anyone with link)
Fields: Name, Email, Message, Company
Purpose: Collect inquiries from website visitors
```

### Comparison

| Feature | Admin Forms | Member Forms |
|---------|-------------|--------------|
| **Access** | Internal team members | External users/public |
| **Authentication** | Required | Optional |
| **Permissions** | Role-based | Public or limited |
| **Use Case** | Data management | Information collection |
| **Branding** | Internal UI | Can be customized/embedded |
| **Fields** | Can include all fields | Usually limited fields |
| **Follow-up** | Direct record editing | Automated workflows |

## Form Structure

```
Form: New Blog Article

Associated Model: Blog Articles

Fields Included:
  ✅ Title (required)
  ✅ Content (required)
  ✅ Author (required)
  ✅ Category (required)
  ⬜ SEO Title (optional)
  ⬜ SEO Description (optional)
  ⬜ Tags (optional)

Fields Excluded:
  ❌ ID (auto-generated)
  ❌ Published Date (set by action)
  ❌ View Count (tracked automatically)
  ❌ Status (defaults to "Draft")
```

## Creating a Form

### Basic Setup

**Required Information**:
- **Form Name**: Descriptive title
- **Target Model**: Which model receives the data
- **Description**: Purpose of the form

**Example**:
```
Name: Submit Blog Article
Model: Blog Articles
Description: For authors to submit new blog content
```

### Field Selection

Choose which model fields to include:

```
Include in Form:
  ✅ User-input fields (title, content, author)
  ✅ Optional metadata (tags, category)
  ✅ File uploads (images, attachments)

Exclude from Form:
  ❌ Auto-generated fields (ID, timestamps)
  ❌ System fields (internal status, processing flags)
  ❌ Computed fields (calculated values)
  ❌ Action output fields (AI-generated content)
```

### Field Configuration

For each field in the form, configure:

```
Field: Article Title
  Label: "Article Title"
  Placeholder: "Enter a compelling title..."
  Required: Yes
  Help Text: "Keep it under 60 characters for best SEO"
  Validation: 10-100 characters
  
Field: Category
  Label: "Content Category"
  Type: Dropdown
  Options: Technology, Marketing, Product, Tutorial
  Required: Yes
  Default: None
  
Field: Tags
  Label: "Tags"
  Type: Multi-select
  Options: AI, Marketing, Tutorial, Case Study
  Required: No
  Max Selections: 5
  Help Text: "Select up to 5 relevant tags"
```

## Form Layout

### Layout Options

#### Single Column
```
+---------------------------+
| Field 1                   |
| Field 2                   |
| Field 3                   |
| Field 4                   |
| [Submit Button]           |
+---------------------------+

Good for: Simple forms, mobile-first design
```

#### Two Column
```
+-------------+-------------+
| Field 1     | Field 2     |
| Field 3     | Field 4     |
| Field 5 (full width)      |
| [Submit Button]           |
+---------------------------+

Good for: Related fields side-by-side
```

#### Sections
```
+---------------------------+
| === Section 1 ===         |
| Field 1                   |
| Field 2                   |
|                           |
| === Section 2 ===         |
| Field 3                   |
| Field 4                   |
| [Submit Button]           |
+---------------------------+

Good for: Organizing many fields
```

#### Wizard/Multi-Step
```
Step 1: Basic Information
  - Title
  - Description
  [Next →]

Step 2: Content Details
  - Content
  - Category
  - Tags
  [← Back] [Next →]

Step 3: Media
  - Featured Image
  - Gallery Images
  [← Back] [Submit]

Good for: Complex forms, progressive disclosure
```

### Responsive Design

```
Desktop:
  Two-column layout
  Full field labels
  Inline validation

Mobile:
  Single-column layout
  Abbreviated labels
  Touch-friendly inputs
  Mobile keyboard optimization
```

## Form Features

### Field Types in Forms

#### Text Input
```
<input type="text" 
       name="title" 
       placeholder="Article title..." 
       required 
       maxlength="100" />
```

#### Text Area
```
<textarea name="content" 
          rows="10" 
          placeholder="Write your article content..."
          required>
</textarea>
```

#### Select Dropdown
```
<select name="category" required>
  <option value="">Select a category...</option>
  <option value="tech">Technology</option>
  <option value="marketing">Marketing</option>
  <option value="product">Product</option>
</select>
```

#### Radio Buttons
```
<input type="radio" name="priority" value="low"> Low
<input type="radio" name="priority" value="medium"> Medium
<input type="radio" name="priority" value="high"> High
```

#### Checkboxes
```
<input type="checkbox" name="featured"> Featured Post
<input type="checkbox" name="newsletter"> Include in Newsletter
```

#### Multi-Select
```
<select name="tags" multiple>
  <option value="ai">AI</option>
  <option value="marketing">Marketing</option>
  <option value="tutorial">Tutorial</option>
</select>
```

#### Date Picker
```
<input type="date" 
       name="publishDate" 
       min="2025-01-01" 
       max="2025-12-31" />
```

#### File Upload
```
<input type="file" 
       name="featuredImage" 
       accept="image/png, image/jpeg" 
       max-size="5MB" />
```

### Validation

#### Client-Side Validation

```
Field: Email
  Type: Email
  Required: Yes
  Pattern: Valid email format
  
Behavior:
  - Validates on blur (when user leaves field)
  - Shows inline error message
  - Prevents submission if invalid
  - Instant feedback
```

#### Server-Side Validation

```
After form submission:
  1. Verify all required fields present
  2. Check field type matches
  3. Validate against business rules
  4. Check for duplicates (unique fields)
  5. Return errors if any
  
Ensures data integrity even if client validation bypassed
```

#### Custom Validation Rules

```
Field: Password
  Min Length: 8 characters
  Must contain: 
    - One uppercase letter
    - One lowercase letter
    - One number
    - One special character
  Custom Error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
```

### Conditional Logic

#### Show/Hide Fields

```
Condition: If "Has Discount" is checked
  Then: Show "Discount Code" field
  Else: Hide "Discount Code" field

Dynamic form behavior based on user input
```

```
Example Configuration:
  Field: Has Discount (Checkbox)
  
  Field: Discount Code (Text)
    Visible When: hasDiscount = true
    Required When: hasDiscount = true
```

#### Field Dependencies

```
Condition: If "Country" = "United States"
  Then: Show "State" dropdown
  Else: Show "Province/Region" text field

Adapts to user's selection
```

### Default Values

```
Field: Status
  Default: "Draft"
  
Field: Created Date
  Default: Today's date
  
Field: Author
  Default: Current user
  
Pre-populates fields to save time
```

### Auto-Fill and Suggestions

```
Field: City
  Type: Text with autocomplete
  Source: Database of cities
  Behavior: Suggests matches as user types
  
Field: Tags
  Type: Multi-select with search
  Source: Existing tags in system
  Behavior: Suggests popular tags
```

## Form Submission

### Submission Flow

```
1. User fills form
2. Client-side validation
3. User clicks "Submit"
4. Data sent to server
5. Server-side validation
6. Record created in model's sheet
7. Confirmation shown to user
8. Optional: Trigger action on new record
```

### Success Handling

```
Options after successful submission:

1. Show success message
   "Your article has been submitted successfully!"

2. Redirect to record
   → Take user to newly created record

3. Redirect to list
   → Take user back to sheet view

4. Clear form for another submission
   → Reset all fields, stay on form

5. Custom redirect
   → Go to specific URL
```

### Error Handling

```
If submission fails:

1. Display error messages
   - Field-specific errors (highlight field)
   - General errors (top of form)
   
2. Preserve user input
   - Don't clear the form
   - Keep all entered values
   
3. Suggest corrections
   - "Email already exists"
   - "Please fill in required fields"
   
4. Allow retry
   - User can fix and resubmit
```

### Partial Saves (Drafts)

```
Feature: Save progress without submitting

Behavior:
  - "Save Draft" button
  - Stores partial data
  - Can resume later
  - Not validated until final submit

Use Case:
  Long forms where users need time
  Complex data entry
  Multiple sessions
```

## Form Customization

### Styling

```
Form Theme:
  - Brand colors
  - Custom fonts
  - Button styles
  - Input styling
  - Error message colors
  - Success message styling

Fully customizable to match your brand
```

### Labels and Help Text

```
Field Configuration:
  Label: "Email Address"
  Placeholder: "you@example.com"
  Help Text: "We'll never share your email with anyone"
  Required Indicator: "*"
  
Clear, helpful guidance for users
```

### Button Customization

```
Submit Button:
  Text: "Create Article"
  Color: Brand primary
  Size: Large
  Icon: ✓
  Loading State: "Creating..."
  
Cancel Button:
  Text: "Cancel"
  Color: Gray
  Size: Medium
  Action: Clear form or go back
```

## Advanced Form Features

### Multi-Step Forms

```
Step 1: Basic Info
  Fields: Title, Category
  Validation: Required fields
  Progress: 33%
  
Step 2: Content
  Fields: Content, Tags, Image
  Validation: Content length, image size
  Progress: 66%
  
Step 3: SEO & Publishing
  Fields: SEO Title, SEO Description, Publish Date
  Validation: Optional
  Progress: 100%

Benefits:
  - Less overwhelming
  - Better UX for complex forms
  - Progressive disclosure
  - Clear progress indication
```

### Form Logic/Calculations

```
Example: Order Form

Field: Quantity (Number)
Field: Unit Price (Currency, read-only)
Field: Subtotal (Currency, computed)
  Formula: Quantity × Unit Price
  
Field: Tax Rate (%, read-only)
Field: Tax Amount (Currency, computed)
  Formula: Subtotal × Tax Rate
  
Field: Total (Currency, computed)
  Formula: Subtotal + Tax Amount

Real-time calculations as user types
```

### Repeating Sections

```
Form: Order Form

Product Line Items (Repeatable):
  - Product Name
  - Quantity
  - Unit Price
  [+ Add Another Product]
  [− Remove]

Allows multiple instances of same fields
```

### File Upload Enhancements

```
Features:
  - Drag and drop
  - Multiple files
  - Preview before upload
  - Progress indicator
  - File size validation
  - File type restrictions
  - Image optimization
  - Thumbnail generation
```

## Form Sharing and Embedding

### Admin Form Access

**Admin forms** are accessed within the platform:

```
Settings:
  Access: Workspace members only
  Authentication: Required
  Location: Within platform interface
  
Use Cases:
  - Internal data entry
  - Team collaboration
  - Content management
  - Administrative tasks
  
Permissions:
  - Admin: Full access to all fields
  - Editor: Access to most fields
  - Viewer: Read-only (no form access)
```

### Member Form - Public Access

**Member forms** can be shared publicly:

```
Settings:
  Access: Public (anyone with link)
  URL: https://app.example.com/forms/contact-us
  
Use Cases:
  - Customer submissions
  - Contact forms
  - Job applications
  - Event registrations
  - Lead capture
  - Feedback collection
```

### Member Form - Embedded

**Member forms** can be embedded in external websites:

```html
Embed Code:
<iframe src="https://app.example.com/forms/embed/contact-us" 
        width="100%" 
        height="800px" 
        frameborder="0">
</iframe>

Embed in:
  - Your company website
  - Blog posts
  - Landing pages
  - Product pages
  - Marketing campaigns
```

**Embedding Best Practices**:
- Use member forms for public-facing pages
- Customize styling to match your brand
- Keep form fields minimal for better conversion
- Add clear privacy policy links
- Test on mobile devices

### Form Security

**Admin Forms**:
```
Security:
  - Authentication required
  - Role-based access control
  - Audit logging enabled
  - Internal network only (optional)
  
Protection:
  - Only authorized users can submit
  - All changes tracked
  - Data encrypted at rest
```

**Member Forms**:
```
Security:
  - CAPTCHA protection (optional)
  - Rate limiting
  - Spam filtering
  - Email verification (optional)
  
Protection:
  - Prevent bot submissions
  - Limit submission frequency
  - Validate all inputs
  - GDPR compliant
```

## Form Analytics

### Submission Metrics

```
Form Performance:
  - Total views: 1,234
  - Started: 856 (69%)
  - Completed: 623 (50%)
  - Abandoned: 233 (19%)
  - Conversion rate: 72.7%

Identify drop-off points
```

### Field Analytics

```
Field: Email
  - Validation errors: 45
  - Average time to fill: 8 seconds
  
Field: Content
  - Validation errors: 12
  - Average time to fill: 120 seconds
  - Most common issue: Too short
  
Optimize based on data
```

## Form Templates

### Common Form Patterns

#### Contact Form
```
Fields:
  - Name (Text, required)
  - Email (Email, required)
  - Subject (Text, required)
  - Message (Long Text, required)
  - Phone (Phone, optional)
```

#### Registration Form
```
Fields:
  - First Name (Text, required)
  - Last Name (Text, required)
  - Email (Email, required, unique)
  - Password (Password, required)
  - Confirm Password (Password, required)
  - Agree to Terms (Checkbox, required)
```

#### Application Form
```
Sections:
  1. Personal Information
  2. Education
  3. Work Experience
  4. Skills
  5. References
  6. Additional Information
  
Multiple steps, file uploads, repeating sections
```

#### Survey Form
```
Question Types:
  - Multiple choice
  - Rating scale
  - Yes/No
  - Text response
  - Matrix questions
```

## Best Practices

### Form Design

**Keep It Simple**
```
Good:
  - 5-7 fields maximum
  - Clear labels
  - Logical order
  - Single column on mobile

Avoid:
  - Too many fields
  - Confusing labels
  - Random field order
  - Tiny inputs on mobile
```

**Use Appropriate Field Types**
```
Good:
  - Dropdown for < 10 options
  - Radio buttons for 2-5 options
  - Autocomplete for many options
  - Date picker for dates

Avoid:
  - Text field for everything
```

**Provide Clear Feedback**
```
- Show validation errors immediately
- Highlight which fields have errors
- Explain what's wrong
- Show success clearly
- Indicate required fields upfront
```

### User Experience

**Reduce Friction**
```
- Minimize required fields
- Use smart defaults
- Enable auto-fill
- Save progress
- Make submission easy
```

**Be Mobile-Friendly**
```
- Large touch targets
- Appropriate keyboards (email, number, phone)
- Single column layout
- Clear labels
- Easy scrolling
```

**Accessibility**
```
- Proper label associations
- Keyboard navigation
- Screen reader support
- Color contrast
- Error announcements
```

## Troubleshooting

### Common Issues

**Issue**: Form not submitting  
**Solution**: Check validation errors, verify all required fields, check browser console

**Issue**: Data not appearing in sheet  
**Solution**: Verify form is mapped to correct model, check field mappings

**Issue**: Validation too strict  
**Solution**: Review validation rules, adjust constraints, test thoroughly

**Issue**: Form broken on mobile  
**Solution**: Test responsive design, adjust layout for mobile, check input types

## Next Steps

- [Actions](./09-actions.md) - Process form submissions with AI
- [Fields & Records](./07-fields-and-records.md) - Understand the data forms create
- [Use Cases](./15-use-cases.md) - See forms in real-world scenarios
- [Best Practices](./14-best-practices.md) - Optimize your forms

