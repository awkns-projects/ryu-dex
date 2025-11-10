import { tool, generateObject } from 'ai';
import { z } from 'zod';
import { generateUUID, formatActionName } from '@/lib/utils';
import type { UIMessageStreamWriter } from 'ai';
import type { ChatMessage } from '@/lib/types';
import { myProvider } from '@/lib/ai/providers';
import { generateCustomStepCode, executeGeneratedCode, generateAndDeployCustomStep } from '@/lib/ai/code-generator';
import {
  createAgent,
  createAgentModel,
  createAgentAction,
  createAgentStep,
  getFullAgentWithModelsAndActions,
  createAgentSchedule,
  createAgentScheduleStep,
  updateAgent
} from '@/lib/db/agent-queries';

interface AgentBuilderProps {
  session: {
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      token: string;
      ipAddress?: string | null;
      userAgent?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  };
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

// Add type definition for field
interface AgentField {
  name: string;
  title: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'reference' | 'enum' | 'image_url';
  required: boolean;
  description?: string;
  referencesModel?: string;
  referencesField?: string;
  referenceType?: 'to_one' | 'to_many';
  enumValues?: string[];
}

// Field definition schema
const fieldSchema = z.object({
  name: z.string().describe('The code-level field name (e.g., careInstructions)'),
  title: z.string().describe('The display name shown in the UI (e.g., Care Instructions)'),
  type: z.enum(['text', 'number', 'boolean', 'date', 'reference', 'enum', 'image_url']),
  required: z.boolean().default(false),
  description: z.string().optional(),
  // For reference fields - which model/field this references
  referencesModel: z.string().optional(),
  referencesField: z.string().optional(),
  // Whether this reference is to-one or to-many
  referenceType: z.enum(['to_one', 'to_many']).optional(),
  // For enum fields - the possible values
  enumValues: z.array(z.string()).optional().describe('For enum fields, the list of possible values (e.g., ["healthy", "needs_review", "sick"])'),
});

// Step configuration schemas
const aiReasoningStepSchema = z.object({
  prompt: z.string(),
  model: z.string().optional().default('chat-model'),
});

const webSearchStepSchema = z.object({
  query: z.string(),
  maxResults: z.number().optional().default(5),
});

const customStepSchema = z.object({
  description: z.string().describe('Description of what this custom step should do (used for code generation)'),
  code: z.string().optional().describe('Generated code for the step (auto-generated if not provided)'),
  language: z.literal('javascript').default('javascript').describe('Language for generated code (Node.js/JavaScript only)'),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    reason: z.string()
  })).optional().describe('Required NPM packages (auto-generated)'),
  envVars: z.array(z.string()).optional().describe('Required environment variables (auto-generated)'),
  deployment: z.object({
    url: z.string(),
    deploymentId: z.string(),
    projectId: z.string(),
    deploymentUrl: z.string(),
    deployedAt: z.string(),
    status: z.literal('deployed')
  }).optional().describe('Deployment information (auto-generated when deployed)'),
  autodeploy: z.boolean().default(true).describe('Whether to automatically deploy this custom step'),
  deploymentReady: z.boolean().optional().describe('Whether the step is ready for deployment (has generated code)'),
});

const imageGenerationStepSchema = z.object({
  prompt: z.string().describe('The prompt to generate the image'),
  model: z.string().optional().default('openai/dall-e-3').describe('The image generation model to use (e.g., "openai/dall-e-3", "xai/grok-2-image")'),
  size: z.string().optional().describe('Image size (e.g., "1024x1024", "1792x1024", "1024x1792")'),
  aspectRatio: z.string().optional().describe('Aspect ratio (e.g., "16:9", "1:1", "9:16")'),
  n: z.number().optional().default(1).describe('Number of images to generate'),
  seed: z.number().optional().describe('Seed for reproducible generation'),
});

const stepConfigSchema = z.union([
  aiReasoningStepSchema,
  webSearchStepSchema,
  customStepSchema,
  imageGenerationStepSchema,
]);

// Main schemas
// Update the model schema to include displayFields
const modelSchema = z.object({
  name: z.string().describe('The human-readable model name that serves as both code identifier and UI display name (e.g., "Post Ideas", "Customer Records")'),
  fields: z.array(fieldSchema),
  displayFields: z.array(z.string()).describe('CRITICAL: Field names to show in dropdowns when this model is referenced. MUST match actual field names in the fields array. Use descriptive fields like title, name, description.').optional().default(['name']), // Fields to show when this model is referenced
});

// Fetch record step configuration
const fetchRecordStepSchema = z.object({
  model: z.string(),
  recordId: z.string(),
});

const stepSchema = z.object({
  name: z.string(),
  type: z.enum(['ai_reasoning', 'web_search', 'custom', 'image_generation']),
  config: stepConfigSchema,
  order: z.string(),
  inputFields: z.array(z.string()), // Required - fields from row that step reads
  outputFields: z.array(z.string()), // Required - fields that step generates
});

// Add filter and query schemas
const scheduleFilterSchema = z.object({
  field: z.string().describe('Field name to filter on'),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'starts_with', 'ends_with', 'in', 'not_in']).describe('Comparison operator'),
  value: z.any().describe('Value to compare against (use null for is_empty/is_not_empty)'),
});

const scheduleQuerySchema = z.object({
  filters: z.array(scheduleFilterSchema).describe('Array of filter conditions'),
  logic: z.enum(['AND', 'OR']).default('AND').describe('How to combine filters: AND (all must match) or OR (at least one must match)'),
});

// Add schedule step schema
const scheduleStepSchema = z.object({
  modelName: z.string().describe('Name of the model to query (e.g., "PostIdea", "Pet")'),
  query: z.union([scheduleQuerySchema, z.string()]).describe('Structured query object with filters and logic, or legacy string query. Use structured format: { filters: [{field, operator, value}], logic: "AND" }'),
  actionName: z.string().describe('Name of the action to execute (e.g., "generatePost", "analyzeHealth")'),
  order: z.number(),
});

// Add schedule schema
const scheduleSchema = z.object({
  name: z.string(),
  mode: z.enum(['once', 'recurring']),
  intervalHours: z.string().optional(),
  status: z.enum(['active', 'paused']).default('active'),
  nextRunAt: z.string().optional(), // timestamp
  steps: z.array(scheduleStepSchema),
});

const actionSchema = z.object({
  name: z.string().describe('Code-level action identifier (e.g., createPost, analyzeHealth)'),
  title: z.string().describe('Human-readable display name (e.g., Create New Post, Analyze Pet Health)'),
  emoji: z.string().describe('Single emoji that represents this action (e.g., ✨ for generation, 🔍 for analysis, 📊 for reporting, 🚀 for automation)'),
  description: z.string().optional(),
  // Actions are workflows that operate on existing rows
  targetModel: z.string(), // Which model this action operates on
  steps: z.array(stepSchema), // Steps define their own input/output fields
});

const agentSchema = z.object({
  name: z.string().describe('The human-readable agent name that serves as both code identifier and UI display name (e.g., "Blog Post Generator", "Customer Manager")'),
  description: z.string().optional(),
  rootModel: z.string().describe('The root model that users interact with first'),
  models: z.array(modelSchema),
  actions: z.array(actionSchema),
  schedules: z.array(scheduleSchema).optional(), // Add schedules to agent schema
});

export const agentBuilder = ({ session, dataStream }: AgentBuilderProps) =>
  tool({
    description: `ALWAYS USE THIS TOOL for creating AI-powered data models with intelligent relationships, AI enhancement capabilities, and automated schedules.

This tool supports TWO creation approaches:

APPROACH 1: FEATURE-ORIENTED CREATION (New - for non-technical users)
Use when you have high-level feature descriptions from users. Provide:
- name: Agent name
- description: What the agent does
- useCase: Primary use case
- featureInputs: Array of {description, userProvides, aiShould}
- pilotFeatures: Original features for database storage (optional)

The tool will automatically:
1. Analyze feature descriptions
2. Design appropriate data models and fields
3. Create AI-powered actions and steps
4. Set up automation schedules if needed
5. Store original features for reference

Feature Input Format:
- description: "What feature to build" (e.g., "Track customer support tickets")
- userProvides: "What data user gives" (e.g., "Customer name, email, issue description")
- aiShould: "What operations to perform" - can include:
  * AI Processing: analyze sentiment, generate content, classify data, extract information
  * API Operations: send via Gmail API, post to X/Twitter, fetch from Shopify, call webhook
  * Data Operations: calculate totals, transform formats, aggregate metrics
  * Automation: schedule checks, monitor conditions, send alerts

Example Feature-Oriented Input:
{
  name: "Support Ticket Manager",
  useCase: "Automate customer support",
  featureInputs: [
    {
      description: "Track support tickets",
      userProvides: "Customer name, email, issue description",
      aiShould: "Analyze sentiment, categorize issue type, generate suggested response, and send notification via Slack API"
    }
  ]
}

APPROACH 2: TRADITIONAL CREATION (Existing - for technical/template use)
Use when you have complete agent specifications. Provide:
- name, description, rootModel
- models: Complete model definitions with fields
- actions: Complete action definitions with steps
- schedules: Complete schedule definitions

This is the original approach used by templates and provides full control.

The tool automatically detects which approach based on input and processes accordingly.

CRITICAL: FACTORY PATTERN & INITIAL MODEL CONCEPT:

1. INITIAL/PARENT MODEL - THE STARTING POINT:
   Every agent needs an INITIAL MODEL that users interact with FIRST. This is the "parent" or "factory" model.
   
   FACTORY PATTERN WORKFLOW:
   1. User creates records in the INITIAL/PARENT model (e.g., PostIdea, ProductTemplate, TaskTemplate)
   2. Parent model contains templates, ideas, or configurations
   3. AI automatically generates CHILD records from parent templates (e.g., Post, Product, Task)
   4. Parent tracks generation history and controls child creation
   
   EXAMPLES OF INITIAL/PARENT MODELS:
   - PostIdea → generates Post records (content creation)
   - ProductTemplate → generates Product records (product catalog)
   - TaskTemplate → generates Task records (task management)
   - CampaignIdea → generates Campaign records (marketing)
   - PetTemplate → generates Pet records (pet management)
   - PatientTemplate → generates Patient records (healthcare)
   
   CRITICAL: The INITIAL MODEL is what users see and interact with FIRST in the UI!

2. PARENT-CHILD RELATIONSHIP STRUCTURE:
   
   PARENT MODEL (Initial/Template Model):
   - Contains templates, ideas, configurations
   - Has to_many relationship to child records
   - Tracks generation frequency, timing, status
   - Includes template fields (template, frequency, category, etc.)
   - Has tracking fields (last_generated, created_count, etc.)
   - displayFields should show the most descriptive template info
   
   CHILD MODEL (Generated Records):
   - Contains actual generated content/data
   - Has to_one reference back to parent
   - Gets AI-generated fields from actions
   - Represents the final output/product
   - displayFields should show generated content info

2.1 FORM TYPES - NEW vs EDIT (CRITICAL):
   
   Every form MUST have a formType field that determines when and where it appears:
   
   NEW FORMS (formType: 'new'):
   - Used to CREATE new records
   - Appear on the data list page when clicking "New Record" button
   - Include only input fields that users fill to create a record
   - Exclude auto-generated fields (AI-generated, timestamps, IDs)
   - Example: "New Customer", "Add Product", "Create Ticket"
   
   EDIT FORMS (formType: 'edit'):
   - Used to UPDATE existing records
   - Appear ONLY on the detail/edit page in "Quick Edit Forms" section
   - Include only the specific fields being edited (not all fields)
   - Used for workflows like approval, status updates, publishing
   - Example: "Approve Expense", "Update Status", "Publish Post"
   
   FORM TYPE SELECTION RULES:
   - Creating new data → formType: 'new'
   - Updating existing data → formType: 'edit'
   - The "New Record" button only shows if there's at least one 'new' form
   - The "Quick Edit Forms" section only shows 'edit' forms
   
   REAL-WORLD EXAMPLES FROM TEMPLATES:
   
   Example 1 - Expense Report (from expense-report.ts):
   
   NEW FORM (creates new expenses):
   {
     formId: 'new-expense-form',
     formName: 'New Expense',
     formType: 'new',
     whenToUse: 'Fill this form when submitting a new expense report. Upload your receipt and provide basic details like vendor, amount, and date.',
     modelName: 'ExpenseReport',
     fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
     scheduleId: 'extract-receipt-schedule'  // Links to schedule that auto-processes receipt
   }
   
   EDIT FORM (approves/rejects expenses):
   {
     formId: 'approve-expense-form',
     formName: 'Approve/Reject Expense',
     formType: 'edit',
     whenToUse: 'Use this form to approve or reject an existing expense report. Toggle the approval status and optionally add notes explaining your decision.',
     modelName: 'ExpenseReport',
     fields: ['status', 'approvalNotes', 'approvedBy', 'approvedAt']
   }
   
   Example 2 - Lead Enrichment (from lead-enrichment.ts):
   
   NEW FORM (creates leads):
   {
     formId: 'new-lead-form',
     formName: 'New Lead',
     formType: 'new',
     whenToUse: 'Use this form to add a new lead to your pipeline. Enter basic contact information including name, email, and company name.',
     modelName: 'Lead',
     fields: ['firstName', 'lastName', 'email', 'phone', 'companyName', 'source'],
     scheduleId: 'enrich-lead-schedule'  // Auto-enriches after creation
   }
   
   EDIT FORM (qualifies leads):
   {
     formId: 'edit-lead-qualification',
     formName: 'Qualify Lead',
     formType: 'edit',
     whenToUse: 'Use this form after reviewing a lead to mark them as qualified or unqualified. Add notes explaining your decision.',
     modelName: 'Lead',
     fields: ['status', 'notes', 'assignedTo']
   }
   
   Example 3 - Support Tickets (from customer-support-analyzer.ts):
   
   NEW FORM (creates tickets):
   {
     formId: 'new-ticket-form',
     formName: 'New Support Ticket',
     formType: 'new',
     whenToUse: 'Fill this form when submitting a NEW support ticket. Provide customer name, email, subject, and issue description.',
     modelName: 'SupportTicket',
     fields: ['customerName', 'email', 'subject', 'description'],
     scheduleId: 'analyze-ticket-schedule'  // Auto-analyzes sentiment & priority
   }
   
   EDIT FORM (updates ticket status):
   {
     formId: 'edit-ticket-status',
     formName: 'Update Ticket',
     formType: 'edit',
     whenToUse: 'Use this form to update an EXISTING ticket\'s status or assign it to a team member.',
     modelName: 'SupportTicket',
     fields: ['status', 'assignedTo', 'updatedAt']
   }

3. REQUIRED PARENT MODEL FIELDS:
   Every parent/initial model MUST include:
   - Template/configuration fields (template, prompt, instructions)
   - Frequency/timing fields (frequency, interval, schedule)
   - Category/classification fields (category, type, tags)
   - Status tracking fields (status, active, enabled)
   - Generation tracking (last_generated, next_generation, created_count)
   - Relationship field to children (posts, products, tasks, etc.)

4. REQUIRED CHILD MODEL FIELDS:
   Every child model MUST include:
   - Generated content fields (title, content, description)
   - Status fields (status, published, active)
   - Timestamp fields (created_date, published_date)
   - Reference back to parent (post_idea, product_template, etc.)

KEY CONCEPTS:
1. SMART RELATIONSHIPS & DISPLAY:
   - Models are connected through intelligent references
   - Each reference can be:
     * to_one: Single relationship (e.g., Pet → Owner)
     * to_many: Multiple relationships (e.g., Owner → Pets)
   - Every relationship enables AI to understand context across models
   
   CRITICAL: DISPLAY FIELDS determine what users see in dropdowns and references!
   - displayFields: Array of field names shown when this model is referenced
   - MUST use fields that actually exist in the model
   - Common display fields: title, name, label, description, category
   - Example: PostIdea model with "title" field should have displayFields: ["title"]
   - NEVER use displayFields: ["name"] if the model has no "name" field!

2. AI-POWERED FIELDS:
   - Actions generate AI-enhanced fields automatically
   - Generated fields are added back to the model schema
   - Example: description, personality, analysis fields

3. AUTOMATED SCHEDULES - CRITICAL STRUCTURE:
   ALWAYS USE THIS PATTERN FOR AUTOMATION:
   
   Schedule Structure:
   - Each schedule contains multiple STEPS that run in sequence
   - Each STEP has: Model + Structured Query + Action
   - The schedule loops through matching records and applies actions
   
   REQUIRED STEP PATTERN WITH STRUCTURED QUERIES:
   Step 1: 
   - Model: [TargetModel] 
   - Query: { filters: [{field, operator, value}], logic: "AND" }
   - Action: [UpdateAction] (processes each matching record)
   
   Step 2: 
   - Model: [AnotherModel]
   - Query: { filters: [{field, operator, value}], logic: "AND" }
   - Action: [AnotherAction] (processes each matching record)
   
   Query Filter Operators:
   - equals, not_equals: Exact match (status equals "active")
   - contains, not_contains: String search (description contains "urgent")
   - is_empty, is_not_empty: Check for null/empty (assignedTo is empty)
   - greater_than, less_than: Number comparison (score > 70)
   - in, not_in: Array membership (status in ["active", "pending"])
   
   How It Works:
   1. Schedule runs at defined interval (once/recurring)
   2. For each step:
      a) Query the specified model using structured filters
      b) Find all records matching the filter criteria
      c) Apply the specified action to EACH matching record
      d) Move to next step
   3. Repeat for all steps in sequence
   
   Schedule Modes:
   - once: Run one time after trigger
   - recurring: Run repeatedly at specified interval (hours)
   
   Schedule Status:
   - active: Schedule is running
   - paused: Schedule is temporarily stopped

4. SCHEDULE PATTERNS:

   A) TEMPLATE-TO-RECORD GENERATION (Ideas → Actual Content):
   Use when you have template/idea records that automatically generate actual records through relationships.
   Also known as: Content Generation, Template Expansion, Idea-to-Output workflow
   
   COMPLETE Content Creation Example:
   * PostIdea Model (INITIAL/PARENT MODEL - USER STARTS HERE):
     - title (text): "Daily Tech Tips"
     - category (text): "Technology" 
     - template (text): "Share a practical tech tip about {topic}"
     - frequency (text): "daily"
     - status (enum): ["active", "paused", "draft"]
     - last_generated (date): tracks when last post was created
     - created_count (number): how many posts generated
     - posts (to_many reference to Post) ← FACTORY CREATES THESE
     - displayFields: ["title", "category"] ← SHOWS "Daily Tech Tips - Technology" in dropdowns
   
   * Post Model (CHILD MODEL - GENERATED FROM PARENT):
     - title (text): AI-generated from template
     - content (AI-generated): Full post content
     - published_date (date): When post was created
     - status (text): "draft", "published", "scheduled"
     - post_idea (to_one reference to PostIdea) ← LINKS BACK TO FACTORY
     - displayFields: ["title", "status"] ← SHOWS "Generated Title - draft" in dropdowns

   * REQUIRED ACTIONS for Template-to-Record Generation:
     1. Action: name: "createPost", title: "Create New Post" (targetModel: "PostIdea"):
        - SINGLE STEP that outputs: posts, last_generated, created_count
        - Input Fields: title, template, category, frequency
        - Output Fields: posts (CREATES NEW RECORD), last_generated, created_count
        - The "posts" field generates a complete Post record object
        - Updates: last_generated field and created_count in PostIdea
     
     2. Action: name: "generateContent", title: "Generate Post Content" (targetModel: "Post"):
        - Input Fields: title, post_idea reference
        - Output Fields: content, status
        - Generates: content field from template
        - Updates: status from "draft" to "published"
        
   CRITICAL: The createPost action must have ONE step that outputs "posts" field, NOT multiple steps for individual fields!
   
   * TEMPLATE GENERATION Schedule - "Daily Content Generator":
     - Mode: recurring, every 24 hours
     - Step 1:
       * modelName: "PostIdea"
       * query: { filters: [{ field: "status", operator: "equals", value: "active" }, { field: "frequency", operator: "equals", value: "daily" }], logic: "AND" }
       * actionName: "createPost"
       * order: 1
     - Step 2:
       * modelName: "Post"  
       * query: { filters: [{ field: "status", operator: "equals", value: "draft" }, { field: "content", operator: "is_empty", value: null }], logic: "AND" }
       * actionName: "generateContent"
       * order: 2

   B) UPDATE PATTERN (Direct Record Processing):
   Use for processing existing records without creating new ones.
   
   Pet Store Example:
   * Pet Model: name (text), species (text), health_status (enum: ["healthy", "needs_review", "sick"]), last_checkup (date)
   * Action: name: "analyzeHealth", title: "Analyze Pet Health" (targetModel: "Pet")
   
       * UPDATE Schedule Example - "Pet Health Monitor":
      - Mode: recurring, every 24 hours
      - Step 1:
        * modelName: "Pet"
        * query: { filters: [{ field: "health_status", operator: "equals", value: "needs_review" }], logic: "OR" }
        * actionName: "analyzeHealth" (MUST match the actual action name above)
        * order: 1

5. AI CAPABILITIES:
   - Content Generation: Descriptions, summaries, analysis
   - Image Generation: AI-generated images from text prompts
   - Pattern Recognition: Across related models
   - Smart Recommendations: Using relationship context
   - Automated Insights: Based on connected data
   - Scheduled Analysis: Regular data processing and updates

6. SOCIAL MEDIA IMAGE POSTING (X/Twitter, Facebook, Instagram, etc.):

   CRITICAL: For agents that post images to social media, you MUST create BOTH steps:
   
   **STEP 1: Image Generation Step** (type: image_generation)
   - Generates the image using AI
   - No OAuth required (uses built-in AI image generation)
   - Output field type: image_url
   
   **STEP 2: Custom Posting Step** (type: custom)
   - Posts the generated image to the social platform
   - REQUIRES OAuth authentication
   - Description MUST include platform keywords to trigger OAuth detection:
     * X/Twitter: Use "post to X", "post to Twitter", "tweet", "publish to X"
     * Facebook: Use "post to Facebook", "publish to Facebook"
     * Instagram: Use "post to Instagram", "publish to Instagram"
     * Threads: Use "post to Threads", "publish to Threads"
   
   **COMPLETE X/TWITTER IMAGE POST EXAMPLE:**
   
   * PostIdea Model (INITIAL/PARENT MODEL):
     - title (text): "Daily AI Art"
     - imagePrompt (text): "Generate a futuristic cityscape"
     - tweetText (text): "Check out today's AI-generated art!"
     - frequency (enum): ["daily", "weekly"]
     - status (enum): ["active", "paused"]
     - last_posted (date)
     - posts (to_many reference to XPost)
   
   * XPost Model (CHILD MODEL - GENERATED POSTS):
     - generatedImage (image_url): AI-generated image
     - caption (text): Tweet text
     - tweetUrl (text): URL to posted tweet
     - postedAt (date): When tweet was published
     - status (enum): ["pending", "posted", "failed"]
     - post_idea (to_one reference to PostIdea)
   
   * Action 1: "createXPost" (targetModel: "PostIdea")
     - Step 1 (image_generation):
       * name: "Generate Image"
       * type: image_generation
       * config.prompt: "Create an image based on: {imagePrompt}"
       * inputFields: ["imagePrompt"]
       * outputFields: ["generatedImage"]
     
     - Step 2 (custom):
       * name: "Post to X"
       * type: custom
       * config.description: "Post the generated image to X/Twitter with the caption from tweetText"
       * inputFields: ["generatedImage", "tweetText"]
       * outputFields: ["tweetUrl", "postedAt"]
       * NOTE: Description includes "X/Twitter" which triggers X_ACCESS_TOKEN OAuth
   
   **WHY BOTH STEPS ARE REQUIRED:**
   - image_generation step: Creates the image (no OAuth needed)
   - custom step: Publishes to social platform (OAuth required for API access)
   - Without the custom posting step, images are generated but never published
   - Without OAuth-triggering keywords, onboarding won't show OAuth connection
   
   **OAUTH DETECTION KEYWORDS (CRITICAL):**
   The custom step description MUST include these exact keywords to trigger OAuth:
   - X/Twitter: "post to X", "post to Twitter", "tweet", "publish to X", "X/Twitter"
   - Facebook: "post to Facebook", "publish to Facebook", "Facebook post"
   - Instagram: "post to Instagram", "publish to Instagram", "Instagram post"
   - Threads: "post to Threads", "publish to Threads", "Threads post"
   
   If these keywords are missing from the custom step description, OAuth won't be detected!

CRITICAL REQUIREMENTS:
- ALWAYS identify the INITIAL/PARENT MODEL that users interact with first
- ALWAYS include AI-generated fields in your models
- Use relationships to enable smarter AI analysis
- Think about how AI can enhance the connected data
- FOR TEMPLATE-TO-RECORD GENERATION: Create TWO actions - one targeting template model, one targeting output model

INITIAL MODEL IDENTIFICATION REQUIREMENTS (MANDATORY):
- EVERY agent must have a clear INITIAL/PARENT model that users start with
- The initial model should be the "factory" or "template" model
- Users create records in the initial model FIRST
- The initial model then generates child records automatically
- Examples:
  * Blog Agent: PostIdea (initial) → Post (generated)
  * E-commerce Agent: ProductTemplate (initial) → Product (generated)
  * Task Management: TaskTemplate (initial) → Task (generated)
  * Pet Care: PetTemplate (initial) → Pet (generated)
- The initial model should contain configuration/template fields
- The initial model should have tracking fields for generation history

DISPLAY FIELDS REQUIREMENTS (MANDATORY):
- EVERY model MUST have correct displayFields that match actual field names
- displayFields determine what users see in relationship dropdowns
- Use the most descriptive fields available: title > name > description > category
- VERIFY that displayFields reference fields that actually exist in the model
- Examples:
  * PostIdea model with "title" field → displayFields: ["title"]
  * Customer model with "name" field → displayFields: ["name"] 
  * Product model with "name", "category" → displayFields: ["name", "category"]
- WRONG: displayFields: ["name"] when model only has "title" field
- RIGHT: displayFields: ["title"] when model has "title" field

NAMING REQUIREMENTS (MANDATORY):

AGENT NAMING:
- Agent name serves as both code identifier and UI display name
- Use descriptive, human-readable names (e.g., "Blog Post Generator", "Customer Manager")
- Avoid technical jargon or camelCase for agent names

MODEL NAMING:
- Model name serves as both code identifier and UI display name
- Use descriptive, human-readable names (e.g., "Post Ideas", "Customer Records")
- Avoid technical jargon or camelCase for model names

FIELD NAMING REQUIREMENTS:
- EVERY field MUST have both name and title
- name: Code-level field identifier (e.g., "careInstructions", "lastCheckup")
- title: Human-readable display name (e.g., "Care Instructions", "Last Checkup")
- Use camelCase for name, Title Case for title
- Examples:
  * name: "patientId", title: "Patient ID"
  * name: "medicalHistory", title: "Medical History"
  * name: "nextCheckupDate", title: "Next Checkup Date"

ACTION NAMING REQUIREMENTS:
- EVERY action MUST have name, title, and emoji fields
- name: Code identifier for API/schedule use (e.g., "createPost", "analyzeHealth")
- title: Human-readable display name for UI (e.g., "Create New Post", "Analyze Pet Health")
- emoji: Single emoji representing the action's purpose (e.g., ✨ for generation, 🔍 for analysis, 📊 for reporting, 🚀 for automation, 💊 for health, 📝 for content creation, 🔄 for updates)
- Use camelCase for name, Title Case for title
- Examples:
  * name: "createPost", title: "Create New Post", emoji: "✨"
  * name: "generateContent", title: "Generate Post Content", emoji: "📝"
  * name: "analyzeHealthStatus", title: "Analyze Health Status", emoji: "🔍"
  * name: "updateInventory", title: "Update Inventory", emoji: "📦"
  * name: "sendNotification", title: "Send Notification", emoji: "📧"

SCHEDULE REQUIREMENTS (MANDATORY):
- EVERY schedule must use the modelName + query + actionName pattern
- Each schedule step MUST specify: modelName, query, actionName, order
- Query should be descriptive semantic search (e.g., "pets needing checkup", "post ideas ready for content creation")
- CRITICAL: actionName MUST match an action that is actually defined in the actions array
- Actions should read existing fields and generate new AI-enhanced fields
- Schedule steps run in sequence, each processing ALL matching records
- Use meaningful intervals: 24 hours (daily), 168 hours (weekly), 720 hours (monthly)
- VALIDATION: Before creating schedules, verify that all referenced actionName values exist in the actions array

RELATIONSHIP CREATION REQUIREMENTS:
- To create new records in a relationship field (e.g., posts in PostIdea), include the relationship field name in outputFields
- Example: outputFields: ["posts", "last_generated"] will create new Post records and update last_generated
- The relationship field must be a to_many reference type for record creation
- Always update tracking fields (like last_generated) when creating relationship records

TEMPLATE-TO-RECORD GENERATION REQUIREMENTS:
- Use Template-to-Record Generation when you need to automatically create multiple records from templates/ideas
- Template Model (e.g., PostIdea): Contains templates/ideas, has to_many relationship to generated records
- Output Model (e.g., Post): Contains actual generated content, has to_one reference back to template

CRITICAL: Template-to-Record Generation requires TWO separate actions:
1. CREATION ACTION (targets Template Model): 
   - targetModel: "PostIdea" (or other template model)
   - Purpose: Creates new records in the output model and updates template tracking
   - MUST have ONE STEP with the relationship field in outputFields (e.g., "posts")
   - This tells the system to create new records in that relationship
   - Example: createPost action with ONE step outputting: ["posts", "last_generated"]
   - DO NOT split into multiple steps for individual fields!
   
2. ENHANCEMENT ACTION (targets Output Model):
   - targetModel: "Post" (or other output model) 
   - Purpose: Enhances newly created records with AI-generated content
   - Example: generateContent action targeting Post model with outputFields: ["content", "status"]

WRONG PATTERN: Multiple steps outputting individual fields (title, content, etc.)
RIGHT PATTERN: Single step outputting relationship field (posts) + tracking field (last_generated)

- Template Generation Schedule Step 1: modelName: "TemplateModel", query: "templates ready for generation", actionName: "createRecords" (MUST exist in actions array)
- Template Generation Schedule Step 2: modelName: "OutputModel", query: "newly created records needing enhancement", actionName: "enhanceRecords" (MUST exist in actions array)
- Always include frequency/timing fields in template models (e.g., "daily", "weekly", "monthly")
- Include status tracking in both template and output models

CRITICAL VALIDATION RULE:
- EVERY schedule step's actionName MUST exactly match an action.name from the actions array
- The system will validate this and throw an error if any actionName doesn't exist
- Example: If you define action with name: "analyzeHealth", then schedule must use actionName: "analyzeHealth"
- NO hardcoded or assumed action names - only use actions that are actually defined

DISPLAY FIELD VALIDATION:
- Before setting displayFields, CHECK that each field name exists in the model's fields array
- If model has "title" field, use displayFields: ["title"], NOT ["name"]
- If model has "name" field, use displayFields: ["name"]
- For models with multiple descriptive fields, combine them: ["title", "category"]
- Test: Can you find each displayField name in the model's fields array? If not, fix it!

COMMON TEMPLATE-TO-RECORD PATTERNS:
- PostIdea → Post (content creation from ideas)
- ProductTemplate → Product (product generation from templates)  
- CampaignIdea → Campaign (campaign creation from concepts)
- TaskTemplate → Task (task generation from templates)
- EventIdea → Event (event creation from ideas)

FACTORY PATTERN USER WORKFLOW:
1. User opens agent and sees the INITIAL/PARENT model first (e.g., PostIdea)
2. User creates their first record in the parent model (e.g., "Daily Tech Tips" PostIdea)
3. User sets up template, frequency, and configuration in the parent record
4. AI automatically generates child records based on parent configuration
5. User can view and manage both parent templates and generated child records
6. Schedules run automatically to create new child records from active parent templates

CRITICAL: Always return the INITIAL/PARENT model as the primary model users interact with first!`,
    inputSchema: enhancedAgentSchema,
    execute: async ({ name, description, rootModel, models, actions, schedules, useCase, featureInputs, pilotFeatures, connections }) => {
      console.log('�� Agent Builder Tool Called!', { name, description, modelsCount: models?.length, actionsCount: actions?.length });

      if (!session.user?.id) {
        console.error('❌ User not authenticated');
        throw new Error('User must be authenticated to create agents');
      }

      console.log('✅ User authenticated:', session.user.id);

      // FEATURE-ORIENTED APPROACH: Generate complete agent from description
      // This applies when we have featureInputs OR when we have useCase with connections (pilot mode)
      const isFeatureOrientedMode = featureInputs?.length || (useCase && !models?.length);

      if (isFeatureOrientedMode) {
        console.log('🎨 Using feature-oriented approach - AI will imagine all features...');

        // Store pilot description for reference
        const storedPilotData = pilotFeatures || {
          description: description || useCase,
          connections: connections || [],
          mode: featureInputs ? 'detailed' : 'description-only',
        };

        // Use AI to imagine complete agent specification from description
        // This leverages the existing agent builder patterns while allowing natural language input
        const { object: agentSpec } = await generateObject({
          model: myProvider.languageModel('chat-model'),
          schema: agentSchema,
          system: `You are an expert AI agent builder. Analyze the agent description and imagine ALL features, forms, actions, and schedules needed.

CRITICAL RULES - IMAGINE COMPLETE WORKFLOWS:
1. Read the description and identify ALL features needed
2. For EACH feature, think about:
   - What FORMS users fill to input data (new/edit forms)
   - What AI ACTIONS process that data
   - What API OPERATIONS are needed (from selected connections ONLY)
   - What SCHEDULES automate the workflow
3. Create specific, purposeful features (no generic placeholders)
4. Design complete data models with all necessary fields
5. Link forms → schedules → actions for automated workflows

FEATURE PURPOSE REQUIREMENT:
Every feature MUST have a clear purpose. Examples:
✅ GOOD: "Collect customer feedback forms and analyze sentiment"
✅ GOOD: "Generate daily social posts and auto-publish to X"
✅ GOOD: "Monitor inventory levels and send low-stock alerts"
❌ BAD: "Manage data" (too vague)
❌ BAD: "Process items" (what items? how?)
❌ BAD: "General automation" (not specific)

NAMING CONVENTIONS:
- Models: PascalCase singular (SupportTicket, BlogPost, InventoryItem)
- Fields: camelCase (customerName, postContent, stockLevel)
- Actions: camelCase verbs (analyzeTicket, generatePost, checkInventory)
- Titles: Title Case with spaces ("Analyze Ticket", "Generate Post")

WORKFLOW DESIGN:
Think about the complete user journey:
1. User fills form → creates record
2. Schedule triggers → finds records needing processing
3. AI action runs → analyzes/generates/processes
4. API calls → sends to external services
5. Updates records → marks as complete

WORKSPACE PATTERN (CRITICAL):
NEVER create a 'new' form for Workspace model!
- Default workspace record is ALWAYS created automatically when agent is created
- ONLY create an 'edit' form for Workspace IF connections exist
- Workspace 'edit' form is for configuring OAuth connections only
- Example: If agent uses Google/X/Instagram APIs, create workspace 'edit' form for those connections

Workspace Form Pattern (only if connections exist):
{
  formId: 'workspace-connections',
  formName: 'Workspace Connections',
  formType: 'edit',
  whenToUse: 'Use this form to configure your workspace OAuth connections for external services.',
  modelName: 'Workspace',
  fields: ['googleAuth', 'xAuth', 'instagramAuth']  // Only OAuth connection fields
}

FORM DESIGN (CRITICAL - formType Required):
Every form MUST follow these patterns from production templates:

NEW FORMS (formType: 'new') - User creates new records:
Structure:
{
  formId: 'unique-id',
  formName: 'Display Name',
  formType: 'new',
  whenToUse: 'Fill this form when [creating/submitting/adding] a NEW [record type]. [Specific instructions].',
  modelName: 'ModelName',
  fields: ['field1', 'field2'],  // Only user input fields
  scheduleId: 'optional-schedule-id'  // If needs auto-processing after creation
}

IMPORTANT: Never create 'new' forms for Workspace model - workspace is auto-created!

UI Behavior:
- Shown on data list page when clicking "New Record" button
- "New Record" button only appears if at least one 'new' form exists
- Clicking the form opens create modal immediately

Real Examples:
- "New Expense" → creates expense, triggers receipt extraction schedule
- "New Lead" → creates lead, triggers enrichment schedule  
- "New Support Ticket" → creates ticket, triggers sentiment analysis schedule
- "New Product" → creates product, triggers description generation schedule

EDIT FORMS (formType: 'edit') - User updates existing records:
Structure:
{
  formId: 'unique-id',
  formName: 'Display Name',
  formType: 'edit',
  whenToUse: 'Use this form to [approve/update/change] an EXISTING [record]. [Specific instructions].',
  modelName: 'ModelName',
  fields: ['status', 'notes'],  // Only fields being edited (not all fields!)
  scheduleId: 'optional-schedule-id'  // Rarely used for edit forms
}

UI Behavior:
- Shown ONLY on record detail page in "Quick Edit Forms" section
- Clicking the form shows record selector → user picks record → form opens with pre-filled data

Real Examples:
- "Approve/Reject Expense" → updates status, approvalNotes, approvedBy
- "Qualify Lead" → updates status, notes, assignedTo
- "Update Ticket" → updates status, assignedTo, updatedAt
- "Update Product Status" → updates status, updatedAt

SCHEDULE LINKING PATTERN:
For NEW forms with scheduleId, create matching schedule:
{
  scheduleId: 'extract-receipt-schedule',  // Matches form's scheduleId
  name: 'Extract Receipt Data',
  description: 'Automatically process receipt after submission',
  mode: 'once',  // Runs once after form submission (not 'recurring')
  actionIds: ['extract-receipt-action'],
  steps: [{
    modelName: 'ExpenseReport',
    actionId: 'extract-receipt-action',
    actionName: 'extractReceiptData',
    actionTitle: 'Extract Receipt Data',
    query: 'status equals "Pending"',  // Finds newly created records
    order: 1
  }]
}

COMPLETE FEATURE STRUCTURE (from templates):
Each feature should include forms, actions, models, and optionally schedules:

Feature Example from expense-report.ts:
{
  icon: '⚡',
  title: 'Quick Expense Entry',
  description: {
    feature: 'Allow employees to quickly submit expense reports with receipt photos',
    data: 'Receipt image, vendor name, amount, date, and expense category',
    action: 'Create a new expense record with unique ID and timestamp, set initial status to "Pending"'
  },
  forms: [{
    formId: 'new-expense-form',
    formName: 'New Expense',
    formType: 'new',
    whenToUse: 'Fill this form when submitting a new expense report. Upload your receipt and provide basic details like vendor, amount, and date.',
    modelName: 'ExpenseReport',
    fields: ['receiptImage', 'vendor', 'amount', 'date', 'category', 'description'],
    scheduleId: 'extract-receipt-schedule'
  }],
  models: [{
    modelName: 'ExpenseReport',
    fields: ['expenseId', 'receiptImage', 'vendor', 'amount', 'date', 'category', 'status', 'createdAt']
  }],
  schedules: [{
    scheduleId: 'extract-receipt-schedule',
    name: 'Extract Receipt Data',
    description: 'Automatically process receipt after submission',
    mode: 'once',
    actionIds: ['extract-receipt-action'],
    steps: [{
      modelName: 'ExpenseReport',
      actionId: 'extract-receipt-action',
      actionName: 'extractReceiptData',
      actionTitle: 'Extract Receipt Data',
      query: {
        filters: [{ field: 'status', operator: 'equals', value: 'Pending' }],
        logic: 'AND'
      },
      order: 1
    }]
  }]
}

Feature Example for EDIT workflow from lead-enrichment.ts:
{
  icon: '👤',
  title: 'Qualify Lead',
  description: {
    feature: 'Mark leads as qualified or unqualified',
    data: 'Qualification status and notes',
    action: 'Update status to Qualified or Unqualified with qualification notes'
  },
  forms: [{
    formId: 'edit-lead-qualification',
    formName: 'Qualify Lead',
    formType: 'edit',
    whenToUse: 'Use this form after reviewing a lead to mark them as qualified or unqualified. Add notes explaining your decision.',
    modelName: 'Lead',
    fields: ['status', 'notes', 'assignedTo']
  }],
  models: [{
    modelName: 'Lead',
    fields: ['status', 'notes', 'assignedTo']
  }]
  // No schedules - this is manual approval
}

UNDERSTANDING "aiShould" OPERATIONS:
The "aiShould" field describes ALL operations to perform, not just AI processing:

1. AI PROCESSING OPERATIONS:
   - "analyze sentiment" → sentiment analysis step
   - "generate content" → AI content generation
   - "classify/categorize" → AI classification
   - "extract information" → AI data extraction
   - "summarize" → AI summarization

2. API/INTEGRATION OPERATIONS (ONLY USE ALLOWED CONNECTIONS):
   User has selected these connections: ${connections?.join(', ') || 'none'}
   
   CRITICAL: Only create API integrations for services in the connections list above!
   - If "google" in connections: Gmail API, Google Calendar API, Google Drive API
   - If "facebook" in connections: Facebook Posts API, Facebook Pages API
   - If "instagram" in connections: Instagram Posts API, Instagram Insights API
   - If "threads" in connections: Threads Posts API
   - If "x" in connections: X/Twitter Posts API, X DMs API
   - If "tiktok" in connections: TikTok Videos API
   - If "telegram" in connections: Telegram Bot API
   - If "ccxt" in connections: Cryptocurrency Exchange APIs
   
   DO NOT create custom steps for services not in the connections list!
   For other API needs, use generic webhook/HTTP requests.

3. DATA OPERATIONS:
   - "calculate totals" → number field with calculation
   - "transform format" → data transformation step
   - "aggregate metrics" → aggregation logic

4. AUTOMATION OPERATIONS:
   - "schedule daily checks" → recurring schedule
   - "monitor conditions" → schedule with query
   - "send alerts when" → conditional automation

FIELD TYPE SELECTION:
- Names, titles, descriptions → text
- Numbers, scores, quantities → number
- Dates, timestamps → date
- Status, category, sentiment → enum with appropriate values
- Yes/no questions → boolean
- References to other models → reference

ACTION DESIGN (from templates):
Each action should read existing fields (inputFields) and generate new fields (outputFields).

Real Action Examples from Templates:

1. Data Extraction (from expense-report.ts):
{
  actionId: 'extract-receipt-action',
  actionName: 'extractReceiptData',
  actionTitle: 'Extract Receipt Data',
  modelName: 'ExpenseReport',
  inputFields: ['receiptImage'],
  outputFields: ['vendor', 'date', 'amount', 'currency', 'category']
}

2. Lead Enrichment (from lead-enrichment.ts):
{
  actionId: 'enrich-lead-action',
  actionName: 'enrichLead',
  actionTitle: 'Enrich Lead',
  modelName: 'Lead',
  inputFields: ['email', 'companyName'],
  outputFields: ['companySize', 'industry', 'revenue', 'linkedinUrl']
}

3. Sentiment Analysis (from customer-support-analyzer.ts):
{
  actionId: 'analyze-ticket-action',
  actionName: 'analyzeTicket',
  actionTitle: 'Analyze Ticket',
  modelName: 'SupportTicket',
  inputFields: ['subject', 'description', 'customerName'],
  outputFields: ['priority', 'category', 'sentiment']
}

4. Content Generation (from product-descriptions.ts):
{
  actionId: 'generate-description-action',
  actionName: 'generateDescription',
  actionTitle: 'Generate Description',
  modelName: 'Product',
  inputFields: ['productName', 'specifications', 'features', 'targetKeywords', 'tone', 'language'],
  outputFields: ['description', 'status']
}

Step Type Selection:
- AI analysis/generation → ai_reasoning
- Web research/data lookup → web_search
- API calls to external services → custom
- Image creation → image_generation

MULTI-STEP ACTIONS (CRITICAL - Actions can have MULTIPLE steps):

Example 1 - Web Search → AI Analysis (from lead-enrichment.ts):
{
  actionId: 'enrich-lead-action',
  actionName: 'enrichLead',
  actionTitle: 'Enrich Lead',
  modelName: 'Lead',
  inputFields: ['email', 'companyName'],
  outputFields: ['companySize', 'industry', 'revenue', 'jobTitle', 'emailValidated'],
  steps: [
    {
      name: 'searchCompanyData',
      type: 'web_search',  // STEP 1: Search the web
      order: '1',
      config: {
        searchQuery: 'Search for company size, industry, revenue, and job title information',
        inputFields: ['email', 'companyName'],
        outputFields: []
      }
    },
    {
      name: 'extractEnrichmentData',
      type: 'ai_reasoning',  // STEP 2: Analyze search results
      order: '2',
      config: {
        prompt: 'Based on the email domain and company name, extract and structure company information...',
        inputFields: ['email', 'companyName'],
        outputFields: ['companySize', 'industry', 'revenue', 'jobTitle', 'emailValidated'],
        model: 'gpt-4o',
        temperature: 0.2
      }
    }
  ]
}

Example 2 - AI Prompt → Image Generation (from content-creator.ts):
{
  actionId: 'generate-image-action',
  actionName: 'generateImage',
  actionTitle: 'Generate Featured Image',
  modelName: 'ContentPiece',
  inputFields: ['title', 'topic', 'type', 'content'],
  outputFields: ['imagePrompt', 'imageUrl', 'status'],
  steps: [
    {
      name: 'createImagePrompt',
      type: 'ai_reasoning',  // STEP 1: Create image description
      order: '1',
      config: {
        prompt: 'Create a detailed image generation prompt for a featured image that complements this content...',
        inputFields: ['title', 'topic', 'type', 'content'],
        outputFields: ['imagePrompt'],
        model: 'gpt-4o',
        temperature: 0.7
      }
    },
    {
      name: 'generateVisual',
      type: 'image_generation',  // STEP 2: Generate the image
      order: '2',
      config: {
        prompt: 'Use the generated image prompt to create a featured image',
        inputFields: ['imagePrompt'],
        outputFields: ['imageUrl']
      }
    }
  ]
}

Example 3 - Research → Write Content (from content-creator.ts):
{
  actionId: 'generate-content-action',
  actionName: 'generateContent',
  actionTitle: 'Generate Content',
  modelName: 'ContentPiece',
  inputFields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform'],
  outputFields: ['content', 'status'],
  steps: [
    {
      name: 'researchTopic',
      type: 'web_search',  // STEP 1: Research the topic
      order: '1',
      config: {
        searchQuery: 'Research the topic and gather relevant information, trends, and insights',
        inputFields: ['topic', 'keywords'],
        outputFields: []
      }
    },
    {
      name: 'writeContent',
      type: 'ai_reasoning',  // STEP 2: Write based on research
      order: '2',
      config: {
        prompt: 'Generate high-quality content based on the provided information. Consider the content type, platform requirements, target audience, tone...',
        inputFields: ['title', 'type', 'topic', 'keywords', 'tone', 'targetAudience', 'brief', 'platform'],
        outputFields: ['content', 'status'],
        model: 'gpt-4o',
        temperature: 0.8
      }
    }
  ]
}

KEY RULES FOR MULTI-STEP ACTIONS:
- Actions can and should have MULTIPLE steps for complex workflows
- Each action has steps: z.array(stepSchema) - an ARRAY of steps
- Steps run sequentially in order (order: '1', '2', '3', etc.)
- Later steps can access outputs from earlier steps
- web_search typically has empty outputFields (results available to next step)
- Common patterns:
  * web_search → ai_reasoning (research then analyze)
  * ai_reasoning → image_generation (describe then create)
  * ai_reasoning → custom (analyze then API call)
  * ai_reasoning → ai_reasoning (multi-stage processing)

STEP TYPE REFERENCE (CRITICAL):

1. ai_reasoning - Use LLM to analyze, generate, or transform data
   Required config: prompt, inputFields, outputFields, model, temperature
   Example: Analyze sentiment, generate text, extract information

2. web_search - Search the web for external information
   Required config: searchQuery, inputFields
   outputFields: Usually empty (results available to next step)
   Example: Research company data, find product info, get market trends

3. custom - Execute custom code (API calls, data processing, integrations)
   Required config: description (AI generates code from this)
   Auto-generated: code, dependencies, envVars, deployment
   Example: Post to social media, send email, call webhook, process data

4. image_generation - Generate images using AI
   Required config: prompt, inputFields, outputFields
   Example: Create featured images, product visuals, social media graphics

WHEN TO USE MULTIPLE STEPS:
- Need web research before AI generation → web_search + ai_reasoning
- Need to describe image before creating → ai_reasoning + image_generation
- Need to process data before API call → ai_reasoning + custom
- Need multi-stage analysis → ai_reasoning + ai_reasoning
- Simple workflows → 1 step is fine

SCHEDULE DESIGN (from templates):
Three main patterns:

1. ONCE mode (after form submission):
{
  scheduleId: 'extract-receipt-schedule',
  name: 'Extract Receipt Data',
  mode: 'once',  // Runs immediately after form submission
  actionIds: ['extract-receipt-action'],
  steps: [{
    modelName: 'ExpenseReport',
    actionId: 'extract-receipt-action',
    actionName: 'extractReceiptData',
    query: {
      filters: [{ field: 'status', operator: 'equals', value: 'Pending' }],
      logic: 'AND'
    },
    order: 1
  }]
}

2. RECURRING mode (periodic automation):
{
  scheduleId: 'daily-lead-enrichment',
  name: 'Daily Lead Enrichment',
  mode: 'recurring',
  intervalHours: 24,
  actionIds: ['enrich-lead-action', 'score-lead-action'],
  steps: [{
    modelName: 'Lead',
    actionId: 'enrich-lead-action',
    actionName: 'enrichLead',
    query: {
      filters: [{ field: 'status', operator: 'equals', value: 'New' }],
      logic: 'AND'
    },
    order: 1
  }, {
    modelName: 'Lead',
    actionId: 'score-lead-action',
    actionName: 'scoreLead',
    query: {
      filters: [{ field: 'status', operator: 'equals', value: 'New' }],
      logic: 'AND'
    },
    order: 2
  }]
}

3. Multi-step processing (from SEO example):
{
  scheduleId: 'research-keywords-schedule',
  name: 'Research Keywords',
  mode: 'once',
  actionIds: ['research-keywords-action', 'analyze-competitors-action'],
  steps: [{
    modelName: 'SEOContent',
    actionId: 'research-keywords-action',
    actionName: 'researchKeywords',
    query: {
      filters: [{ field: 'status', operator: 'equals', value: 'Research' }],
      logic: 'AND'
    },
    order: 1
  }, {
    modelName: 'SEOContent',
    actionId: 'analyze-competitors-action',
    actionName: 'analyzeCompetitors',
    query: {
      filters: [{ field: 'status', operator: 'equals', value: 'Research' }],
      logic: 'AND'
    },
    order: 2
  }]
}`,
          prompt: `Create a complete agent specification for:

Agent Name: ${name}
Full Description: ${description || useCase}

Selected External Service Connections: ${connections && connections.length > 0 ? connections.join(', ') : 'none'}

CRITICAL CONNECTION RULES:
- ONLY create API integration steps for services listed above
- If description implies an API not in connections, skip that API or use generic webhook
- For selected connections, imagine what API operations make sense

${featureInputs && featureInputs.length > 0 ? `
User Provided Features (analyze these):
${featureInputs.map((f, idx) => `
Feature ${idx + 1}:
- Description: ${f.description}
- User Provides: ${f.userProvides}
- Operations: ${f.aiShould}
`).join('\n')}
` : `
IMAGINE ALL FEATURES from the description above. Think about:
- What data needs to be collected? → Create FORMS
- What processing is needed? → Create ACTIONS
- What should run automatically? → Create SCHEDULES
- What APIs to use? → Create CUSTOM STEPS (only from selected connections)

Be comprehensive and thoughtful. Every feature should add real value.
`}

Generate a complete agent with:
1. ALL necessary features (imagine comprehensively)
2. Data models for all data storage needs
3. Forms for user data entry (MUST include formType and whenToUse)
4. AI-powered actions for intelligent processing
5. API integration steps ONLY for selected connections
6. Automated schedules for recurring workflows
7. Proper relationships and displayFields
8. Human-readable names throughout

CRITICAL - Follow Template Pattern Exactly:
Study these REAL examples from production templates:

Expense Report Pattern (expense-report.ts):
- NEW form: "New Expense" (formType: 'new', scheduleId: 'extract-receipt-schedule')
- EDIT form: "Approve/Reject Expense" (formType: 'edit', fields: ['status', 'approvalNotes'])
- Schedule: mode: 'once', query: { filters: [{ field: "status", operator: "equals", value: "Pending" }], logic: "AND" }
- Action: extractReceiptData with 1 step (ai_reasoning to extract data)

Lead Enrichment Pattern (lead-enrichment.ts):
- NEW form: "New Lead" (formType: 'new', scheduleId: 'enrich-lead-schedule')
- EDIT form: "Qualify Lead" (formType: 'edit', fields: ['status', 'notes'])
- Schedule: mode: 'once', two schedule steps (enrich → score)
- Action: enrichLead with 2 steps (web_search → ai_reasoning)
- Action: scoreLead with 1 step (ai_reasoning)

Content Creator Pattern (content-creator.ts):
- Action: generateContent with 2 steps (web_search → ai_reasoning)
- Action: generateImage with 2 steps (ai_reasoning → image_generation)
- Shows multi-step actions for complex workflows

Support Ticket Pattern (customer-support-analyzer.ts):
- NEW form: "New Support Ticket" (formType: 'new', scheduleId: 'analyze-ticket-schedule')
- EDIT form: "Update Ticket" (formType: 'edit', fields: ['status', 'assignedTo'])
- Schedule: mode: 'once', query: { filters: [{ field: "status", operator: "equals", value: "New" }], logic: "AND" }
- Action: analyzeTicket (inputFields: ['subject', 'description'], outputFields: ['priority', 'category', 'sentiment'])

Product Description Pattern (product-descriptions.ts):
- NEW form: "New Product" (formType: 'new', scheduleId: 'generate-description-schedule')
- EDIT form: "Update Product Status" (formType: 'edit', fields: ['status'])
- EDIT form: "Edit Tone & Language" (formType: 'edit', fields: ['tone', 'language'], scheduleId: 'regenerate-description-schedule')
- Schedule: mode: 'once', query: { filters: [{ field: "status", operator: "equals", value: "Draft" }], logic: "AND" }
- Action: generateDescription (inputFields: ['productName', 'specifications'], outputFields: ['description'])

REQUIREMENTS:
- Every NEW form must have formType: 'new' and whenToUse
- Every EDIT form must have formType: 'edit' and whenToUse
- NEW forms typically have scheduleId for auto-processing
- EDIT forms usually don't have scheduleId (manual updates)
- Schedules linked to forms use mode: 'once' (not 'recurring')
- Each feature should be self-contained with its forms, models, actions, schedules
- Actions MUST have steps array - can be 1 or multiple steps
- Use multiple steps for complex workflows (research → analyze, describe → create image)
- Each step must specify: name, type, order, config with inputFields/outputFields

COMPLETE TEMPLATE STRUCTURE (How Features Work Together):

Typical Template Pattern (4-6 features):
1. Feature with NEW form + linked schedule + action (user creates, AI processes)
2. Feature with EDIT form (user updates status/settings)
3. Feature with AI action only (background processing)
4. Feature with EDIT form (user approves/publishes)
5. Optional: Feature with recurring schedule (periodic automation)

Example from expense-report.ts:
features: [
  // Simple overview features
  { icon: '📸', title: 'Receipt Scanning', description: 'AI extracts data from receipt images' },
  { icon: '🏷️', title: 'Auto Categorization', description: 'Smart expense category assignment' },
  
  // Detailed form-based feature (NEW)
  {
    icon: '⚡',
    title: 'Quick Expense Entry',
    description: { feature: '...', data: '...', action: '...' },
    forms: [{ formType: 'new', scheduleId: 'extract-receipt-schedule', ... }],
    models: [{ modelName: 'ExpenseReport', ... }],
    schedules: [{ scheduleId: 'extract-receipt-schedule', mode: 'once', ... }]
  },
  
  // Detailed form-based feature (EDIT - approval)
  {
    icon: '✏️',
    title: 'Expense Approval Workflow',
    description: { feature: '...', data: '...', action: '...' },
    forms: [{ formType: 'edit', fields: ['status', 'approvalNotes'], ... }],
    models: [{ modelName: 'ExpenseReport', ... }]
  },
  
  // Detailed form-based feature (EDIT - publishing)
  {
    icon: '🔄',
    title: 'Publish to Accounting',
    description: { feature: '...', data: '...', action: '...' },
    forms: [{ formType: 'edit', fields: ['published', 'publishedAt'], ... }],
    models: [{ modelName: 'ExpenseReport', ... }]
  },
  
  // AI action feature (no forms - background processing)
  {
    icon: '🤖',
    title: 'AI Receipt Data Extraction',
    description: { feature: '...', data: '...', action: '...' },
    actions: [{ actionId: 'extract-receipt-action', ... }],
    models: [{ modelName: 'ExpenseReport', ... }]
  }
]

KEY INSIGHTS:
- Mix simple features (icon, title, description string) with detailed features (forms, actions, schedules)
- NEW forms should link to schedules for auto-processing
- EDIT forms for different stages (approval, publishing, status updates)
- AI action features show what happens in the background
- All features reference same models, building complete workflows

Make it production-ready and fully functional.`,
        });

        console.log('✅ Agent spec generated from features:', {
          modelsCount: agentSpec.models.length,
          actionsCount: agentSpec.actions.length,
          schedulesCount: agentSpec.schedules?.length || 0,
        });

        // ALWAYS create a Workspace model with connection fields
        const connectionFieldMap: Record<string, any> = {
          google: {
            name: 'googleAuth',
            type: 'oauth' as const,
            label: 'Google Connection',
            required: false,
            oauthProvider: 'google',
            oauthScopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/calendar'],
          },
          facebook: {
            name: 'fbAuth',
            type: 'oauth' as const,
            label: 'Facebook Connection',
            required: false,
            oauthProvider: 'facebook',
            oauthScopes: ['email', 'public_profile', 'pages_manage_posts'],
          },
          instagram: {
            name: 'instagramAuth',
            type: 'oauth' as const,
            label: 'Instagram Connection',
            required: false,
            oauthProvider: 'instagram',
            oauthScopes: ['instagram_basic', 'instagram_content_publish'],
          },
          threads: {
            name: 'threadsAuth',
            type: 'oauth' as const,
            label: 'Threads Connection',
            required: false,
            oauthProvider: 'threads',
            oauthScopes: ['threads_basic', 'threads_content_publish'],
          },
          x: {
            name: 'xAuth',
            type: 'oauth' as const,
            label: 'X (Twitter) Connection',
            required: false,
            oauthProvider: 'x',
            oauthScopes: ['tweet.read', 'tweet.write', 'users.read'],
          },
          tiktok: {
            name: 'tiktokAuth',
            type: 'oauth' as const,
            label: 'TikTok Connection',
            required: false,
            oauthProvider: 'tiktok',
            oauthScopes: ['user.info.basic', 'video.list', 'video.upload'],
          },
          telegram: {
            name: 'telegramAuth',
            type: 'oauth' as const,
            label: 'Telegram Connection',
            required: false,
            oauthProvider: 'telegram',
            oauthScopes: ['bot'],
          },
          ccxt: {
            name: 'ccxtAuth',
            type: 'oauth' as const,
            label: 'CCXT Connection',
            required: false,
            oauthProvider: 'ccxt',
            oauthScopes: ['trade', 'read'],
          },
        };

        // Build workspace OAuth fields from selected connections
        const workspaceConnectionFields = (connections || []).map(conn => connectionFieldMap[conn]).filter(Boolean);

        // ALWAYS create Workspace model (even without connections)
        const workspaceModel = {
          name: 'Workspace',
          fields: [
            { name: 'name', type: 'text', title: 'Workspace Name', required: true },
            { name: 'description', type: 'text', title: 'Description', required: false },
            ...workspaceConnectionFields,
          ],
          displayFields: ['name'],
        };

        // Check if Workspace model already exists in generated spec
        const existingWorkspaceIndex = agentSpec.models.findIndex(m => m.name === 'Workspace');
        if (existingWorkspaceIndex >= 0) {
          // Merge connection fields into existing Workspace
          const existingWorkspace = agentSpec.models[existingWorkspaceIndex];
          agentSpec.models[existingWorkspaceIndex] = {
            ...existingWorkspace,
            fields: [
              ...existingWorkspace.fields.filter((ef: any) =>
                ef.name === 'name' || ef.name === 'description' || !workspaceConnectionFields.some((wf: any) => wf.name === ef.name)
              ),
              ...workspaceConnectionFields,
            ],
          };
          console.log('✅ Merged connection fields into existing Workspace model');
        } else {
          // Add Workspace model at the beginning
          agentSpec.models.unshift(workspaceModel as any);
          console.log('✅ Created new Workspace model');
        }

        console.log('📋 Workspace connection fields:', workspaceConnectionFields.map((f: any) => f.name).join(', ') || 'none');

        // Use the generated spec for the rest of the agent creation
        models = agentSpec.models;
        actions = agentSpec.actions;
        schedules = agentSpec.schedules;
        rootModel = agentSpec.rootModel || 'Workspace'; // Default to Workspace if not set
        description = description || agentSpec.description;
      }

      // TRADITIONAL APPROACH: Continue with standard agent creation
      // Create the agent in the database first
      console.log('💾 Creating agent in database...');

      // Generate rich feature metadata and connections for template-like structure
      let richFeatures: any[] = [];
      let connectionsMetadata: any[] | undefined;

      // Generate connections metadata (works for both approaches)
      if (connections && connections.length > 0) {
        const connectionMap: Record<string, any> = {
          google: {
            id: 'google-connection',
            name: 'google',
            title: 'Google Connection',
            provider: 'google' as const,
            description: 'Connect to Google services for Gmail, Calendar, and Drive',
            icon: '🔍',
            scopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/calendar'],
            fieldName: 'googleAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('gmail') ||
              s.config?.description?.toLowerCase().includes('google')
            )) || false,
          },
          facebook: {
            id: 'facebook-connection',
            name: 'facebook',
            title: 'Facebook Connection',
            provider: 'facebook' as const,
            description: 'Connect to Facebook for posts, pages, and ads',
            icon: '📘',
            scopes: ['email', 'public_profile', 'pages_manage_posts'],
            fieldName: 'fbAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('facebook')
            )) || false,
          },
          instagram: {
            id: 'instagram-connection',
            name: 'instagram',
            title: 'Instagram Connection',
            provider: 'instagram' as const,
            description: 'Connect to Instagram for posts, stories, and insights',
            icon: '📸',
            scopes: ['instagram_basic', 'instagram_content_publish'],
            fieldName: 'instagramAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('instagram')
            )) || false,
          },
          threads: {
            id: 'threads-connection',
            name: 'threads',
            title: 'Threads Connection',
            provider: 'threads' as const,
            description: 'Connect to Threads for posts and replies',
            icon: '🧵',
            scopes: ['threads_basic', 'threads_content_publish'],
            fieldName: 'threadsAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('threads')
            )) || false,
          },
          x: {
            id: 'x-connection',
            name: 'x',
            title: 'X (Twitter) Connection',
            provider: 'x' as const,
            description: 'Connect to X/Twitter for tweets, DMs, and analytics',
            icon: '𝕏',
            scopes: ['tweet.read', 'tweet.write', 'users.read'],
            fieldName: 'xAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('twitter') ||
              s.config?.description?.toLowerCase().includes('x/')
            )) || false,
          },
          tiktok: {
            id: 'tiktok-connection',
            name: 'tiktok',
            title: 'TikTok Connection',
            provider: 'tiktok' as const,
            description: 'Connect to TikTok for videos and analytics',
            icon: '🎵',
            scopes: ['user.info.basic', 'video.list', 'video.upload'],
            fieldName: 'tiktokAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('tiktok')
            )) || false,
          },
          telegram: {
            id: 'telegram-connection',
            name: 'telegram',
            title: 'Telegram Connection',
            provider: 'telegram' as const,
            description: 'Connect to Telegram for messages and bots',
            icon: '✈️',
            scopes: ['bot'],
            fieldName: 'telegramAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('telegram')
            )) || false,
          },
          ccxt: {
            id: 'ccxt-connection',
            name: 'ccxt',
            title: 'CCXT Connection',
            provider: 'ccxt' as const,
            description: 'Connect to cryptocurrency exchanges via CCXT',
            icon: '₿',
            scopes: ['trade', 'read'],
            fieldName: 'ccxtAuth',
            required: actions?.some(a => a.steps.some((s: any) =>
              s.config?.description?.toLowerCase().includes('crypto') ||
              s.config?.description?.toLowerCase().includes('exchange') ||
              s.config?.description?.toLowerCase().includes('ccxt')
            )) || false,
          },
        };

        connectionsMetadata = connections.map(conn => connectionMap[conn]).filter(Boolean);
        console.log('✅ Connections metadata generated:', connectionsMetadata.length);
      }

      // Generate rich features (works for both approaches)
      if (isFeatureOrientedMode) {
        console.log('📝 Generating rich feature structure from AI-generated spec...');

        // Get workspace connection fields for feature generation
        const connectionFieldMap: Record<string, any> = {
          google: { name: 'googleAuth', type: 'oauth' as const, label: 'Google Connection', oauthProvider: 'google' },
          facebook: { name: 'fbAuth', type: 'oauth' as const, label: 'Facebook Connection', oauthProvider: 'facebook' },
          instagram: { name: 'instagramAuth', type: 'oauth' as const, label: 'Instagram Connection', oauthProvider: 'instagram' },
          threads: { name: 'threadsAuth', type: 'oauth' as const, label: 'Threads Connection', oauthProvider: 'threads' },
          x: { name: 'xAuth', type: 'oauth' as const, label: 'X Connection', oauthProvider: 'x' },
          tiktok: { name: 'tiktokAuth', type: 'oauth' as const, label: 'TikTok Connection', oauthProvider: 'tiktok' },
          telegram: { name: 'telegramAuth', type: 'oauth' as const, label: 'Telegram Connection', oauthProvider: 'telegram' },
          ccxt: { name: 'ccxtAuth', type: 'oauth' as const, label: 'CCXT Connection', oauthProvider: 'ccxt' },
        };
        const workspaceConnectionFields = (connections || []).map(conn => connectionFieldMap[conn]).filter(Boolean);

        // Generate rich feature structure
        // Group models and actions into logical features based on their relationships
        richFeatures = [];

        // Create feature for each non-Workspace model
        models?.forEach((model, idx) => {
          if (model.name === 'Workspace') return; // Skip workspace, handled separately

          const modelActions = actions?.filter(a => a.targetModel === model.name) || [];
          const relatedSchedules = schedules?.filter(s =>
            s.steps?.some(step => modelActions.some(a => a.name === step.actionName))
          ) || [];

          const feature = {
            icon: ['⚡', '🤖', '📊', '🔄', '✨', '🎯', '📝', '🔍', '💡', '🚀'][idx % 10],
            title: model.name.replace(/([A-Z])/g, ' $1').trim(), // Convert PascalCase to Title Case
            description: {
              feature: `Manage ${model.name} records`,
              data: model.fields.filter((f: any) => !f.name.includes('generated')).map((f: any) => f.title || f.name).join(', '),
              action: modelActions.map(a => a.title).join(', ') || 'Process and store data',
            },
            models: [{
              modelName: model.name,
              fields: model.fields.map((f: any) => f.name),
            }],
            actions: modelActions.map(a => ({
              actionId: `${a.name}-action`,
              actionName: a.name,
              actionTitle: a.title,
              modelName: a.targetModel,
              inputFields: a.steps.flatMap((s: any) => s.inputFields || []),
              outputFields: a.steps.flatMap((s: any) => s.outputFields || []),
            })),
            schedules: relatedSchedules.map(s => ({
              scheduleId: s.name.toLowerCase().replace(/\s+/g, '-'),
              name: s.name,
              description: `Automated processing for ${model.name}`,
              mode: s.mode,
              intervalHours: s.intervalHours ? Number(s.intervalHours) : undefined,
              actionIds: modelActions.map(a => `${a.name}-action`),
              steps: s.steps?.map((step: any, order: number) => ({
                modelName: step.modelName,
                actionId: `${step.actionName}-action`,
                actionName: step.actionName,
                actionTitle: modelActions.find(a => a.name === step.actionName)?.title || step.actionName,
                query: step.query,
                order: order + 1,
              })) || [],
            })),
            forms: (() => {
              const forms: any[] = [];

              // Always create a NEW form for creating records
              const newFormFields = model.fields.filter((f: any) =>
                !f.name.includes('generated') &&
                !f.name.includes('Auth') &&
                !f.name.includes('status') &&  // Status often set by edit forms
                !f.name.includes('approved') &&
                !f.name.includes('published') &&
                f.required !== false
              ).map((f: any) => f.name);

              if (newFormFields.length > 0) {
                forms.push({
                  formId: `new-${model.name.toLowerCase()}`,
                  formName: `New ${model.name}`,
                  formType: 'new' as const,
                  whenToUse: `Use this form to create a new ${model.name} record`,
                  modelName: model.name,
                  fields: newFormFields,
                  scheduleId: relatedSchedules[0]?.name.toLowerCase().replace(/\s+/g, '-'),
                });
              }

              // Create EDIT forms for status/approval workflows if applicable
              const statusFields = model.fields.filter((f: any) =>
                f.type === 'enum' &&
                (f.name.includes('status') || f.name.includes('approved') || f.name.includes('published'))
              );

              if (statusFields.length > 0) {
                // Create an edit form for updating status/approval
                const editFormFields = statusFields.map((f: any) => f.name);
                const hasApprovalField = statusFields.some((f: any) => f.name.includes('approval') || f.name.includes('approved'));

                forms.push({
                  formId: `edit-${model.name.toLowerCase()}-status`,
                  formName: hasApprovalField ? `Approve/Update ${model.name}` : `Update ${model.name} Status`,
                  formType: 'edit' as const,
                  whenToUse: `Use this form to update the status or approval of an existing ${model.name}`,
                  modelName: model.name,
                  fields: editFormFields,
                });
              }

              return forms;
            })(),
          };

          richFeatures.push(feature);
        });

        // ALWAYS add Workspace feature at the beginning
        // CRITICAL: Default workspace record is created automatically - NO 'new' form!
        // Only create 'edit' form if connections exist
        const workspaceForms = workspaceConnectionFields.length > 0 ? [{
          formId: 'workspace-connections',
          formName: 'Workspace Connections',
          formType: 'edit' as const,
          whenToUse: 'Use this form to configure your workspace OAuth connections for external services. This allows your agent to interact with external platforms.',
          modelName: 'Workspace',
          fields: workspaceConnectionFields.map((f: any) => f.name),
        }] : [];

        const workspaceFeature = {
          icon: '⚙️',
          title: 'Workspace Setup',
          description: {
            feature: workspaceConnectionFields.length > 0
              ? 'Configure workspace and connect external services via OAuth'
              : 'Workspace is automatically configured for your agent',
            data: workspaceConnectionFields.length > 0
              ? `OAuth connections (${(connections || []).join(', ')})`
              : 'Default workspace configuration',
            action: workspaceConnectionFields.length > 0
              ? 'Edit workspace to authenticate with selected services'
              : 'Default workspace record is created automatically',
          },
          models: [{
            modelName: 'Workspace',
            fields: ['name', 'description', ...workspaceConnectionFields.map((f: any) => f.name)],
          }],
          forms: workspaceForms, // Only 'edit' form if connections exist
          actions: [],
          schedules: [],
        };

        // Add workspace feature at the beginning
        richFeatures.unshift(workspaceFeature);
        console.log(`✅ Added Workspace feature (${workspaceForms.length > 0 ? 'with edit form for connections' : 'no forms - auto-created'})`);
      } else {
        // Traditional approach - use simple pilot features if provided
        richFeatures = pilotFeatures || [];
      }

      const savedAgent = await createAgent({
        title: name,
        name,
        description: description || '',
        userId: session.user.id,
        features: richFeatures, // Store rich feature structure
        connections: connectionsMetadata, // Store connections metadata
      });

      const agentId = savedAgent.id;
      console.log('📝 Agent saved to database with ID:', agentId);

      // Notify the UI that we're creating an agent
      dataStream.write({
        type: 'data-kind',
        data: 'agent',
        transient: true,
      });

      // Set agent ID so it can be fetched later
      dataStream.write({
        type: 'data-id',
        data: agentId,
        transient: true,
      });

      dataStream.write({
        type: 'data-title',
        data: name,
        transient: true,
      });

      // Set default displayFields for models if not specified
      const processModelDisplayFields = (models: any[]) => {
        return models.map(model => {
          // If displayFields already set, use them
          if (model.displayFields && model.displayFields.length > 0) {
            return model;
          }

          // Otherwise, intelligently choose display fields based on model structure
          const displayFields = [];

          // Always include name or title field if it exists
          const nameField = model.fields.find((f: AgentField) =>
            f.name.toLowerCase().includes('name') || f.name.toLowerCase().includes('title')
          );
          if (nameField) {
            displayFields.push(nameField.name);
          }

          // Add descriptive text fields that would be good for display
          const descriptiveFields = model.fields.filter((f: AgentField) =>
            f.type === 'text' &&
            !f.name.toLowerCase().includes('name') &&
            ['title', 'label', 'description', 'species', 'type', 'category'].some(term =>
              f.name.toLowerCase().includes(term)
            )
          );
          displayFields.push(...descriptiveFields.map((f: AgentField) => f.name));

          // If no good display fields found, use the first text field
          if (displayFields.length === 0) {
            const firstTextField = model.fields.find((f: AgentField) => f.type === 'text');
            if (firstTextField) {
              displayFields.push(firstTextField.name);
            }
          }

          return {
            ...model,
            displayFields: displayFields.length > 0 ? displayFields : ['id']
          };
        });
      };






      // Process display fields for models
      console.log('🔄 Processing model display fields...');
      const processedModels = processModelDisplayFields(models);
      console.log('✅ Model display fields processed');

      // STEP 1: Save models to database (first, needed by actions)
      console.log('💾 Saving models to database...', processedModels.length, 'models');
      dataStream.write({
        type: 'data-status',
        data: { step: 'models', message: `Creating ${processedModels.length} data models...`, progress: 25 },
        transient: false,
      });

      const savedModels = await Promise.all(
        processedModels.map(async (model, index) => {
          console.log(`📝 Creating model ${index + 1}/${processedModels.length}: ${model.name}`);
          // Find all actions that target this model
          const modelActions = actions.filter(action => action.targetModel === model.name);

          // Collect all output fields from the actions' steps without duplicates
          const aiGeneratedFields = new Map(); // Use Map to prevent duplicates by field name
          modelActions.forEach(action =>
            action.steps.forEach(step =>
              step.outputFields.forEach(fieldName => {
                if (!aiGeneratedFields.has(fieldName) && !model.fields.some((f: AgentField) => f.name === fieldName)) {
                  aiGeneratedFields.set(fieldName, {
                    name: fieldName,
                    title: formatActionName(fieldName), // Generate proper title from field name
                    type: 'text', // AI-generated fields are typically text
                    required: false,
                    description: `AI-generated field from step "${step.name}" in action "${action.name}"`,
                  });
                }
              })
            )
          );

          // Add unique AI-generated fields to the model's fields
          const enrichedFields = [
            ...model.fields,
            ...Array.from(aiGeneratedFields.values())
          ];

          console.log(`📊 Model ${model.name} fields:`, {
            original: model.fields.length,
            aiGenerated: aiGeneratedFields.size,
            total: enrichedFields.length
          });

          // Generate forms for this model from rich features
          const modelForms = richFeatures
            ?.flatMap((feature: any) => feature.forms || [])
            ?.filter((form: any) => form.modelName === model.name) || [];

          const savedModel = await createAgentModel({
            agentId,
            name: model.name,
            fields: enrichedFields,
            forms: modelForms.length > 0 ? modelForms : undefined,
          });

          console.log(`📝 Model ${model.name} forms:`, modelForms.length);

          // No records are generated during agent creation
          return {
            ...savedModel,
            records: [] // Empty records array - records will be generated separately
          };
        })
      );

      // STEP 2: Save actions to database (after models, before schedules)
      console.log('💾 Saving actions to database...', actions.length, 'actions');
      dataStream.write({
        type: 'data-status',
        data: { step: 'actions', message: `Creating ${actions.length} AI actions...`, progress: 50 },
        transient: false,
      });

      const savedActions = await Promise.all(
        actions.map(async (action, index) => {
          console.log(`⚡ Creating action ${index + 1}/${actions.length}: ${action.name}`);
          const targetModel = savedModels.find(m => m.name === action.targetModel);

          console.log('📝 Creating action:', action.name, 'for model:', targetModel?.name);

          const savedAction = await createAgentAction({
            agentId,
            modelId: targetModel?.id || '',
            name: action.name,
            title: action.title,
            emoji: action.emoji,
            description: action.description || '',
            inputFields: [], // Actions don't have input fields
            outputFields: [], // Actions don't have output fields
          });

          console.log('✅ Created action:', savedAction.id);

          // Save steps to database
          const savedSteps = await Promise.all(
            action.steps.map(async (step, stepIndex: number) => {
              console.log('💾 Creating step:', step.name, 'for action:', savedAction.id);

              // Generate code for custom steps (NO DEPLOYMENT - code runs directly)
              let stepConfig = { ...step.config };
              if (step.type === 'custom' && 'description' in step.config && step.config.description && !step.config.code) {
                console.log('🤖 Generating code for custom step:', step.name);
                try {
                  // Generate the code (no deployment)
                  const codeGenResult = await generateCustomStepCode({
                    description: step.config.description,
                    stepName: step.name,
                    inputFields: step.inputFields || [],
                    outputFields: step.outputFields || [],
                    targetModel: action.targetModel,
                  });

                  // Save generated code for direct execution (no deployment)
                  stepConfig = {
                    ...stepConfig,
                    code: codeGenResult.code,
                    dependencies: codeGenResult.dependencies,
                    envVars: codeGenResult.envVars,
                    executionReady: true, // Code ready for direct execution
                  };

                  console.log('✅ Code generated for direct execution:', step.name);
                  console.log('📦 Dependencies:', codeGenResult.dependencies.map(d => d.name).join(', '));
                  if (codeGenResult.envVars.length > 0) {
                    console.log('🔑 Requires env vars:', codeGenResult.envVars.join(', '));
                  }
                } catch (error) {
                  console.error('❌ CRITICAL: Failed to generate code for step:', step.name, error);
                  console.error('⚠️ This step will require on-demand code generation during first execution');
                  // Continue with empty stepConfig - on-demand generation will be attempted during execution
                }
              }

              const savedStep = await createAgentStep({
                actionId: savedAction.id,
                name: step.name,
                type: step.type,
                config: {
                  ...stepConfig,
                  inputFields: step.inputFields || [], // Store in config for now
                  outputFields: step.outputFields || [], // Store in config for now
                },
                order: String(stepIndex),
              });

              console.log('✅ Created step:', savedStep.id);
              return savedStep;
            })
          );

          return { savedAction, savedSteps };
        })
      );

      // Validate schedules before saving
      if (schedules) {
        console.log('🔍 Validating schedule action references...');
        for (const schedule of schedules) {
          for (const step of schedule.steps) {
            const actionExists = actions.find(a => a.name === step.actionName);
            if (!actionExists) {
              console.error(`❌ Schedule "${schedule.name}" references non-existent action "${step.actionName}"`);
              console.log('Available actions:', actions.map(a => a.name));
              throw new Error(`Schedule "${schedule.name}" step ${step.order} references action "${step.actionName}" which doesn't exist. Available actions: ${actions.map(a => a.name).join(', ')}`);
            }
          }
        }
        console.log('✅ All schedule action references validated');
      }

      // STEP 3: Save schedules to database (last, after actions are available)
      console.log('💾 Saving schedules to database...', schedules?.length || 0, 'schedules');
      dataStream.write({
        type: 'data-status',
        data: { step: 'schedules', message: `Creating ${schedules?.length || 0} automation schedules...`, progress: 75 },
        transient: false,
      });

      const savedSchedules = schedules ? await Promise.all(
        schedules.map(async (schedule) => {
          const savedSchedule = await createAgentSchedule({
            agentId,
            name: schedule.name,
            mode: schedule.mode,
            intervalHours: schedule.intervalHours,
            status: schedule.status,
            nextRunAt: schedule.nextRunAt ? new Date(schedule.nextRunAt) : undefined,
          });

          // Save schedule steps
          const savedScheduleSteps = await Promise.all(
            schedule.steps.map(async (step) => {
              // Resolve model name to model ID
              const targetModel = savedModels.find(m => m.name === step.modelName);
              if (!targetModel) {
                throw new Error(`Model "${step.modelName}" not found for schedule step`);
              }

              // Resolve action name to action ID
              const targetAction = savedActions.find(({ savedAction }) => savedAction.name === step.actionName);
              if (!targetAction) {
                throw new Error(`Action "${step.actionName}" not found for schedule step`);
              }

              return await createAgentScheduleStep({
                scheduleId: savedSchedule.id,
                modelId: targetModel.id,
                query: step.query,
                actionId: targetAction.savedAction.id,
                order: step.order,
              });
            })
          );

          return {
            savedSchedule,
            savedScheduleSteps,
          };
        })
      ) : [];

      // Create agent object for UI
      const agentObject = {
        id: agentId,
        name,
        description: description || '',
        rootModel, // Add rootModel to the agent object
        userId: session.user.id,
        features: richFeatures, // Include rich feature structure
        connections: connectionsMetadata, // Include connections metadata
        models: savedModels.map(savedModel => {
          return {
            ...savedModel,
            records: [] // No records generated during agent creation
          };
        }),
        actions: savedActions.map(({ savedAction, savedSteps }) => {
          const originalAction = actions.find(a => a.name === savedAction.name);
          const targetModel = savedModels.find(m => m.name === originalAction?.targetModel);

          return {
            id: savedAction.id,
            name: savedAction.name,
            description: savedAction.description,
            emoji: originalAction?.emoji || '',
            targetModel: originalAction?.targetModel || '',
            targetModelId: targetModel?.id || null,
            agentId,
            steps: savedSteps.map((step, index) => {
              const originalStep = originalAction?.steps[index];
              return {
                id: step.id,
                name: step.name,
                type: step.type,
                config: originalStep?.config || {},
                order: step.order,
                inputFields: originalStep?.inputFields || [],
                outputFields: originalStep?.outputFields || [],
                actionId: savedAction.id,
              };
            }),
          };
        }),
        schedules: savedSchedules.map(({ savedSchedule, savedScheduleSteps }) => ({
          ...savedSchedule,
          steps: savedScheduleSteps
        })),
        createdAt: savedAgent.createdAt,
        updatedAt: savedAgent.updatedAt,
      };

      console.log('✅ Complete agent object prepared with database IDs');

      // Stream completion status
      dataStream.write({
        type: 'data-status',
        data: { step: 'complete', message: 'Agent created successfully!', progress: 100 },
        transient: false,
      });

      // Stream the agent data for UI display
      console.log('📤 Streaming agent data:', agentObject);
      dataStream.write({
        type: 'data-agentData',
        data: agentObject,
        transient: false,
      });

      // Small delay to ensure data is processed before finishing
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🏁 Agent data streamed, sending finish signal');
      dataStream.write({
        type: 'data-finish',
        data: null,
        transient: true,
      });

      console.log('✅ Stream completion signal sent');

      return {
        id: agentId,
        name,
        description,
        modelsCount: models.length,
        actionsCount: actions.length,
        stepsCount: actions.reduce((sum: number, action: any) => sum + action.steps.length, 0),
        message: `Agent "${name}" created successfully with ${models.length} models and ${actions.length} AI-powered actions.`,
      };
    },
  });

// Add agent updater schema for partial updates
const agentUpdateSchema = z.object({
  id: z.string().describe('The ID of the agent to update'),
  name: z.string().optional(),
  description: z.string().optional(),
  rootModel: z.string().optional(),
  // For updates, these arrays represent additions/modifications, not replacements
  modelsToAdd: z.array(modelSchema).optional().describe('New models to add to the agent'),
  modelsToUpdate: z.array(modelSchema.extend({
    id: z.string().describe('ID of existing model to update')
  })).optional().describe('Existing models to modify'),
  actionsToAdd: z.array(actionSchema).optional().describe('New actions to add to the agent'),
  actionsToUpdate: z.array(actionSchema.extend({
    id: z.string().describe('ID of existing action to update')
  })).optional().describe('Existing actions to modify'),
  schedulesToAdd: z.array(scheduleSchema).optional().describe('New schedules to add to the agent'),
  schedulesToUpdate: z.array(scheduleSchema.extend({
    id: z.string().describe('ID of existing schedule to update')
  })).optional().describe('Existing schedules to modify'),
});

// Feature-oriented input schema (alternative to full agent spec)
const featureInputSchema = z.object({
  description: z.string().describe('What feature you want to build (e.g., "Track customer support tickets", "Generate social media posts")'),
  userProvides: z.string().describe('What data/inputs the user will provide (e.g., "Customer name, email, issue description")'),
  aiShould: z.string().describe('What operations to perform - can include: AI processing (analyze, generate, classify), API calls (send email via Gmail, post to X/Twitter, fetch from Shopify), data operations (calculate, transform, aggregate), or automation (schedule, monitor, alert). Be specific about what should happen.'),
});

// Allowed external service connections (must match pilot schema)
const ALLOWED_CONNECTIONS = ['google', 'facebook', 'instagram', 'threads', 'x', 'tiktok', 'telegram', 'ccxt'] as const;

// Enhanced agent schema that supports both traditional and feature-oriented approaches
const enhancedAgentSchema = agentSchema.extend({
  // Feature-oriented fields (optional - for pilot/natural language creation)
  useCase: z.string().optional().describe('The primary use case this agent solves'),
  featureInputs: z.array(featureInputSchema).optional().describe('High-level feature descriptions to convert into models/actions'),
  pilotFeatures: z.array(z.any()).optional().describe('Original pilot features for reference (stored in database)'),
  connections: z.array(z.enum(ALLOWED_CONNECTIONS)).optional().describe('External service connections user selected (google, facebook, instagram, threads, x, tiktok, telegram, ccxt)'),
});

export const agentUpdater = ({ session, dataStream }: AgentBuilderProps) =>
  tool({
    description: `Use this tool to UPDATE an existing AI agent with new models, actions, or schedules.
    
CRITICAL: This tool is for UPDATING existing agents, not creating new ones.

PROCESSING ORDER (AUTOMATIC):
The tool automatically processes updates in the correct dependency order:
1. Models first (actions need models to exist)
2. Actions second (schedules need actions to exist)  
3. Schedules last (schedules reference both models and actions)

This means you can safely add actions and schedules in the same update - the actions will be created first and available when the schedules are processed.

When updating an agent:
1. Always provide the agent ID
2. Use modelsToAdd for completely new models
3. Use modelsToUpdate for modifying existing models (provide the model ID)
4. Use actionsToAdd for completely new actions  
5. Use actionsToUpdate for modifying existing actions (provide the action ID)
6. Use schedulesToAdd for completely new schedules
7. Use schedulesToUpdate for modifying existing schedules (provide the schedule ID)

The tool will:
- Preserve existing data that isn't being updated
- Add new models/actions/schedules as specified in the correct order
- Update existing models/actions/schedules with new configurations
- Maintain all relationships and references
- Validate that all references exist after processing

SOCIAL MEDIA IMAGE POSTING (CRITICAL FOR X/Twitter, Facebook, Instagram):
When adding actions for social media image posting, you MUST include BOTH steps:
1. image_generation step - creates the image (no OAuth)
2. custom step - posts to platform (requires OAuth)

The custom step description MUST include platform keywords:
- X/Twitter: "post to X", "post to Twitter", "tweet", "publish to X"
- Facebook: "post to Facebook", "publish to Facebook"
- Instagram: "post to Instagram", "publish to Instagram"  
- Threads: "post to Threads", "publish to Threads"

Without these keywords in the custom step description, OAuth won't be detected and users can't connect their accounts!

VALIDATION REQUIREMENTS:
- All field naming, display field, and relationship requirements from agentBuilder apply
- Schedule action references will be validated after actions are created
- Model references in actions will be validated after models are created
- Maintain data integrity across all relationships`,
    inputSchema: agentUpdateSchema,
    execute: async ({
      id,
      name,
      description,
      rootModel,
      modelsToAdd,
      modelsToUpdate,
      actionsToAdd,
      actionsToUpdate,
      schedulesToAdd,
      schedulesToUpdate
    }) => {
      // Add timeout wrapper for the entire operation
      return Promise.race([
        (async () => {
          console.log('🔄 Agent Updater Tool Called!', { id, name, description });

          /* 
           * IMPORTANT: Processing Order
           * 1. Models first (actions need models)
           * 2. Actions second (schedules need actions) 
           * 3. Schedules last (schedules reference actions and models)
           * 
           * This ensures that all dependencies exist before they are referenced.
           */
          console.log('📊 Update scope:', {
            modelsToAdd: modelsToAdd?.length || 0,
            modelsToUpdate: modelsToUpdate?.length || 0,
            actionsToAdd: actionsToAdd?.length || 0,
            actionsToUpdate: actionsToUpdate?.length || 0,
            schedulesToAdd: schedulesToAdd?.length || 0,
            schedulesToUpdate: schedulesToUpdate?.length || 0
          });

          if (!session.user?.id) {
            console.error('❌ User not authenticated');
            throw new Error('User must be authenticated to update agents');
          }

          // Get existing agent with timeout
          console.log('📖 Fetching existing agent...');
          let existingAgent;
          try {
            existingAgent = await Promise.race([
              getFullAgentWithModelsAndActions(id),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Agent fetch timeout after 10 seconds')), 10000)
              )
            ]) as Awaited<ReturnType<typeof getFullAgentWithModelsAndActions>>;
          } catch (error) {
            console.error('❌ Failed to fetch existing agent:', error);
            throw error;
          }

          if (!existingAgent || existingAgent.agent.userId !== session.user.id) {
            throw new Error('Agent not found or access denied');
          }

          console.log('✅ Agent found, proceeding with update...');

          // Update basic agent properties
          if (name || description) {
            console.log('📝 Updating agent basic properties...');
            await updateAgent(id, {
              ...(name && { name }),
              ...(description && { description }),
            });
          }

          // Notify the UI that we're updating an agent
          dataStream.write({
            type: 'data-kind',
            data: 'agent',
            transient: true,
          });

          dataStream.write({
            type: 'data-id',
            data: id,
            transient: true,
          });

          dataStream.write({
            type: 'data-title',
            data: name || existingAgent.agent.name || 'Unnamed Agent',
            transient: true,
          });

          // STEP 1: Process model additions first (models are needed for actions)
          let updatedModels = [...existingAgent.models];
          console.log('📝 STEP 1: Processing model updates...');
          if (modelsToAdd && modelsToAdd.length > 0) {
            console.log(`➕ Adding ${modelsToAdd.length} new models...`);

            for (const model of modelsToAdd) {
              const savedModel = await createAgentModel({
                agentId: id,
                name: model.name,
                fields: model.fields,
              });
              updatedModels.push({
                ...savedModel,
                records: [] // Add empty records array
              });
            }
          }

          // Process model updates
          if (modelsToUpdate && modelsToUpdate.length > 0) {
            console.log('🔄 Updating existing models...');
            // Implementation would go here - updating existing models
            // This would require additional database functions for updating models
          }

          // STEP 2: Process action additions (actions are needed for schedules)
          let updatedActions = [...existingAgent.actions];
          console.log('📝 STEP 2: Processing action updates...');
          if (actionsToAdd && actionsToAdd.length > 0) {
            console.log(`➕ Adding ${actionsToAdd.length} new actions...`);

            for (const action of actionsToAdd) {
              const targetModel = updatedModels.find(m => m.name === action.targetModel);
              if (!targetModel) {
                throw new Error(`Target model "${action.targetModel}" not found for action "${action.name}"`);
              }

              const savedAction = await createAgentAction({
                agentId: id,
                modelId: targetModel.id,
                name: action.name,
                title: action.title,
                emoji: action.emoji,
                description: action.description || '',
                inputFields: [],
                outputFields: [],
              });

              // Save steps
              const savedSteps = await Promise.all(
                action.steps.map(async (step, stepIndex: number) => {
                  console.log('💾 Creating step:', step.name, 'for action:', savedAction.id);

                  // Generate code for custom steps (NO DEPLOYMENT - code runs directly)
                  let stepConfig = { ...step.config };
                  if (step.type === 'custom' && 'description' in step.config && step.config.description && !step.config.code) {
                    console.log('🤖 Generating code for custom step:', step.name);
                    try {
                      // Generate the code (no deployment)
                      const codeGenResult = await generateCustomStepCode({
                        description: step.config.description,
                        stepName: step.name,
                        inputFields: step.inputFields || [],
                        outputFields: step.outputFields || [],
                        targetModel: action.targetModel,
                      });

                      // Save generated code for direct execution (no deployment)
                      stepConfig = {
                        ...stepConfig,
                        code: codeGenResult.code,
                        dependencies: codeGenResult.dependencies,
                        envVars: codeGenResult.envVars,
                        executionReady: true, // Code ready for direct execution
                      };

                      console.log('✅ Code generated for direct execution:', step.name);
                      console.log('📦 Dependencies:', codeGenResult.dependencies.map(d => d.name).join(', '));
                      if (codeGenResult.envVars.length > 0) {
                        console.log('🔑 Requires env vars:', codeGenResult.envVars.join(', '));
                      }
                    } catch (error) {
                      console.error('❌ CRITICAL: Failed to generate code for step:', step.name, error);
                      console.error('⚠️ This step will require on-demand code generation during first execution');
                      // Continue with empty stepConfig - on-demand generation will be attempted during execution
                    }
                  }

                  return await createAgentStep({
                    actionId: savedAction.id,
                    name: step.name,
                    type: step.type,
                    config: {
                      ...stepConfig,
                      inputFields: step.inputFields || [],
                      outputFields: step.outputFields || [],
                    },
                    order: String(stepIndex),
                  });
                })
              );

              updatedActions.push({
                ...savedAction,
                targetModel: action.targetModel,
                steps: savedSteps.map(step => ({
                  ...step,
                  inputFields: (step.config as any)?.inputFields || [],
                  outputFields: (step.config as any)?.outputFields || []
                }))
              });

              console.log(`✅ Added action "${savedAction.name}" with ID ${savedAction.id}`);
            }
          }

          // STEP 3: Process schedule additions last (schedules reference actions and models)
          let updatedSchedules = [...(existingAgent.schedules || [])];
          console.log('📝 STEP 3: Processing schedule updates...');
          if (schedulesToAdd && schedulesToAdd.length > 0) {
            console.log(`➕ Adding ${schedulesToAdd.length} new schedules...`);

            // Validate schedule action references (simplified since actions are always created first)
            console.log(`🔍 Validating ${schedulesToAdd.length} schedules against ${updatedActions.length} available actions`);
            console.log('📋 Available actions:', updatedActions.map(a => a.name).join(', '));

            for (const schedule of schedulesToAdd) {
              for (const step of schedule.steps) {
                const actionExists = updatedActions.find(a => a.name === step.actionName);
                if (!actionExists) {
                  // This should rarely happen now since actions are created first
                  const availableActions = updatedActions.map(a => a.name).join(', ');
                  throw new Error(`Schedule "${schedule.name}" references action "${step.actionName}" which doesn't exist. Available actions: ${availableActions}. Make sure to include the action in actionsToAdd when adding both actions and schedules together.`);
                }
                console.log(`✅ Schedule "${schedule.name}" step references action "${step.actionName}" - OK`);
              }
            }

            for (const schedule of schedulesToAdd) {
              const savedSchedule = await createAgentSchedule({
                agentId: id,
                name: schedule.name,
                mode: schedule.mode,
                intervalHours: schedule.intervalHours,
                status: schedule.status,
                nextRunAt: schedule.nextRunAt ? new Date(schedule.nextRunAt) : undefined,
              });

              // Save schedule steps
              const savedScheduleSteps = await Promise.all(
                schedule.steps.map(async (step) => {
                  const targetModel = updatedModels.find(m => m.name === step.modelName);
                  const targetAction = updatedActions.find(a => a.name === step.actionName);

                  if (!targetModel) {
                    throw new Error(`Model "${step.modelName}" not found for schedule step`);
                  }
                  if (!targetAction) {
                    throw new Error(`Action "${step.actionName}" not found for schedule step`);
                  }

                  const savedStep = await createAgentScheduleStep({
                    scheduleId: savedSchedule.id,
                    modelId: targetModel.id,
                    query: step.query,
                    actionId: targetAction.id,
                    order: step.order,
                  });

                  // Enrich with model and action names for UI display
                  return {
                    ...savedStep,
                    modelName: targetModel.name,
                    actionName: targetAction.name,
                  };
                })
              );

              updatedSchedules.push({
                ...savedSchedule,
                steps: savedScheduleSteps,
              });
            }
          }

          // Create updated agent object for UI
          const updatedAgentObject = {
            id,
            name: name || existingAgent.agent.name,
            description: description || existingAgent.agent.description,
            rootModel: rootModel || 'defaultModel',
            userId: session.user.id,
            models: updatedModels,
            actions: updatedActions,
            schedules: updatedSchedules,
            createdAt: existingAgent.agent.createdAt,
            updatedAt: new Date(),
          };

          console.log('✅ Agent update completed');

          // Stream the updated agent data
          dataStream.write({
            type: 'data-agentData',
            data: updatedAgentObject,
            transient: false,
          });

          await new Promise(resolve => setTimeout(resolve, 100));

          dataStream.write({
            type: 'data-finish',
            data: null,
            transient: true,
          });

          return {
            id,
            name: updatedAgentObject.name,
            description: updatedAgentObject.description,
            message: `Agent "${updatedAgentObject.name}" updated successfully.`,
            modelsAdded: modelsToAdd?.length || 0,
            actionsAdded: actionsToAdd?.length || 0,
            schedulesAdded: schedulesToAdd?.length || 0,
          };
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Agent update timeout after 30 seconds')), 30000)
        )
      ]);
    },
  }); 