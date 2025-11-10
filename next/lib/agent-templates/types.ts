/**
 * Static Agent Templates
 * These templates define complete agent configurations including models, actions, schedules, and forms
 * that can be used to create new agents with all necessary database records
 * 
 * Feature Breakdown:
 * Each agent template includes a `features` array that provides structured information about:
 * 1. Forms - Which forms are used, their fields, and the models they create/update
 * 2. Actions - Which AI actions are triggered, their inputs and outputs
 * 3. Models - Which data models and fields are involved in each feature
 * 
 * This structured format enables:
 * - Programmatic access to feature details
 * - Auto-generation of UI components and documentation
 * - Clear mapping between user inputs, AI processing, and data storage
 * - Type-safe feature queries and validation
 */

export interface FieldDefinition {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea' | 'email' | 'url' | 'oauth';
  label: string;
  required?: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  defaultValue?: any;
  // OAuth-specific fields
  oauthProvider?: 'google' | 'facebook' | 'shopify'; // Which OAuth provider
  oauthAction?: string; // Which action to trigger when button is clicked
  oauthScopes?: string[]; // Required OAuth scopes
}

/**
 * FormTemplate - Defines forms for creating and editing records
 * 
 * CRITICAL: formType determines WHERE and WHEN the form appears in the UI:
 * 
 * NEW FORMS (formType: 'new'):
 * - Purpose: Create new records
 * - UI Location: Data list page - appears when clicking "New Record" button
 * - Field Selection: Include only user input fields (exclude AI-generated, auto-fields)
 * - Examples: "New Customer", "Submit Expense", "Create Post Idea"
 * - Note: "New Record" button only shows if there's at least one 'new' form
 * 
 * EDIT FORMS (formType: 'edit'):
 * - Purpose: Update specific fields in existing records
 * - UI Location: Record detail page - appears in "Quick Edit Forms" section
 * - Field Selection: Include ONLY the fields being edited (not all fields)
 * - Examples: "Approve Expense", "Update Status", "Publish Post"
 * - Use Cases: Approval workflows, status updates, publishing actions
 */
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  formType: 'new' | 'edit'; // REQUIRED: 'new' = create records, 'edit' = update specific fields
  whenToUse: string; // Description of when to fill this form
  modelName: string; // Which model this form creates/updates
  fields: string[]; // Field names from the model to include in this form
  scheduleId?: string; // Optional: ID of schedule to trigger when form is submitted
}

export interface ModelTemplate {
  name: string;
  description?: string; // Optional description for marketplace templates
  fields: FieldDefinition[];
  forms?: FormTemplate[]; // Forms for this model (optional for marketplace templates)
  actions?: ActionTemplate[]; // Actions for this model (optional for marketplace templates)
}

/**
 * StepTemplate - Individual steps within an action workflow
 * 
 * CRITICAL: Actions contain an ARRAY of steps that run sequentially
 * 
 * STEP TYPES:
 * 
 * 1. ai_reasoning - Use LLM to analyze, generate, or transform data
 *    - Required config: prompt, inputFields, outputFields, model, temperature
 *    - Example: Analyze sentiment, generate content, extract information
 *    - From templates: extractReceiptData, analyzeTicket, scoreLead
 * 
 * 2. web_search - Search the web for external information
 *    - Required config: searchQuery, inputFields
 *    - outputFields: Usually empty (results available to next step)
 *    - Example: Research company data, find trends, get competitor info
 *    - From templates: searchCompanyData (lead-enrichment.ts), researchTopic (content-creator.ts)
 * 
 * 3. custom - Execute custom code for API calls or data processing
 *    - Required config: description (AI generates code from this)
 *    - Auto-generated: code, dependencies, envVars, deployment
 *    - Example: Post to social media, send email, call webhook
 *    - From templates: Social media posting, email sending
 * 
 * 4. image_generation - Generate images using AI
 *    - Required config: prompt, inputFields, outputFields
 *    - Example: Create featured images, product visuals
 *    - From templates: generateVisual (content-creator.ts)
 * 
 * MULTI-STEP ACTIONS:
 * Actions can have multiple steps for complex workflows:
 * - enrichLead: web_search → ai_reasoning (2 steps, lead-enrichment.ts)
 * - generateContent: web_search → ai_reasoning (2 steps, content-creator.ts)
 * - generateImage: ai_reasoning → image_generation (2 steps, content-creator.ts)
 * 
 * Steps run in order, later steps can use outputs from earlier steps.
 */
export interface StepTemplate {
  name: string;
  type: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation';
  order: string;
  config: {
    prompt?: string;
    inputFields: string[];
    outputFields: string[];
    model?: string;
    temperature?: number;
    searchQuery?: string;
    customCode?: string;
  };
}

export interface ConnectionTemplate {
  id: string;
  name: string;
  title: string;
  provider: 'google' | 'facebook' | 'x' | 'instagram' | 'threads' | 'shopify' | 'linkedin' | 'custom';
  description: string;
  icon: string;
  scopes: string[];
  fieldName: string; // Which field stores the auth data (e.g., 'googleAuth', 'fbAuth', 'xAuth')
  setupAction?: string; // Which action sets up this connection (optional - connections are now separate)
  required?: boolean; // Is this connection required for the agent to function?
  shopName?: string; // For Shopify: the shop name (e.g., 'mystore')
}

/**
 * ActionTemplate - Defines AI-powered actions that process records
 * 
 * Actions are workflows that read fields from a record (inputFields),
 * process them through multiple steps, and write results (outputFields).
 * 
 * CRITICAL: Actions contain a steps ARRAY (StepTemplate[])
 * - Simple actions: 1 step (e.g., analyze sentiment)
 * - Complex actions: Multiple steps (e.g., search web → analyze data)
 * 
 * Real Examples:
 * - extractReceiptData: 1 step (ai_reasoning)
 * - enrichLead: 2 steps (web_search → ai_reasoning)
 * - generateContent: 2 steps (web_search → ai_reasoning)  
 * - generateImage: 2 steps (ai_reasoning → image_generation)
 */
export interface ActionTemplate {
  name: string;
  title: string;
  emoji: string;
  description: string;
  modelName: string; // Which model this action operates on
  inputFields: string[]; // Fields read from the record
  outputFields: string[]; // Fields written back to the record
  steps: StepTemplate[]; // ARRAY of steps - can be 1 or multiple steps
  requiresConnection?: string; // ID of connection required to execute this action
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in';

export interface ScheduleFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface ScheduleQuery {
  filters: ScheduleFilter[];
  logic: 'AND' | 'OR';
}

export interface ScheduleTemplate {
  id: string; // Unique identifier for linking with forms
  name: string;
  description?: string; // Optional description for marketplace templates
  mode: 'once' | 'recurring';
  intervalHours?: string | number; // Support both string and number
  actionIds?: string[]; // IDs of actions this schedule contains (stored in field, linked by ID)
  steps?: { // Optional for marketplace templates - sequences of actions to execute
    modelName: string;
    query: ScheduleQuery | string; // NEW: Structured query object OR legacy string
    actionName: string;
    actionId?: string; // ID reference to the action
    order: number;
  }[];
}

export interface Feature {
  icon: string;
  title: string; // Short title for display
  name?: string; // Alternative to title (for backward compatibility with FeatureBreakdown)
  description: string | {
    feature: string; // Answer to: "What feature do you want to build?"
    data: string;    // Answer to: "What data do you need?"
    action: string;  // Answer to: "What should the AI do?"
  };
  // Features contain forms (for humans) and schedules (for AI automation)
  // Forms are categorized by type: 'new' forms create records, 'edit' forms update them
  forms?: {
    formId: string; // ID reference - data stored in field, linked by ID
    formName: string;
    formType: 'new' | 'edit'; // REQUIRED: 'new' = shown on list page, 'edit' = shown on detail page
    whenToUse: string; // Description of when to fill this form
    modelName: string;
    fields: string[]; // For 'new': input fields only, for 'edit': specific fields to update
    scheduleId?: string; // Optional: ID of schedule attached to this form
  }[];
  models?: {
    modelName: string;
    fields: string[];
  }[];
  actions?: {
    actionId: string; // ID reference - data stored in field, linked by ID
    actionName: string;
    actionTitle: string;
    modelName: string;
    inputFields: string[];
    outputFields: string[];
  }[];
  schedules?: {
    scheduleId: string; // ID reference - data stored in field, linked by ID
    name: string;
    description?: string;
    mode: 'once' | 'recurring';
    intervalHours?: number;
    actionIds?: string[]; // IDs of actions this schedule contains
    steps: { // Schedules contain sequence of action steps
      modelName: string;
      actionId: string; // ID reference to the action
      actionName: string;
      actionTitle?: string;
      query?: string; // Semantic where search for filtering records
      order: number;
    }[];
  }[];
}

// Backward compatibility aliases
export type FeatureBreakdown = Feature;
export type SimpleFeature = Feature;

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type PricingTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type TemplateBadge = 'NEW' | 'FEATURED' | 'TRENDING' | 'UPDATED' | 'POPULAR';

export interface HowItWorksStep {
  order: number;
  title: string;
  description: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  order: number;
}

export interface AgentTemplateData {
  // Basic Info
  id: string;
  slug: string; // URL-friendly identifier
  title: string; // Template title (e.g., "Customer Support Agent")
  shortDescription: string; // Brief description for cards
  longDescription: string; // Detailed description for template page
  description?: string; // Optional - for backward compatibility with agent templates

  // Visual Assets
  icon: string;
  thumbnail: string; // Preview image path

  // Categorization
  category: string;
  subcategories?: string[];
  tags: string[];
  useCases: string[];

  // Metadata
  difficulty: DifficultyLevel;
  setupTime: number; // Minutes
  pricingTier: PricingTier;
  version: string;

  // Features & Requirements
  aiFeatures: string[]; // AI capabilities used
  connections?: ConnectionTemplate[]; // OAuth and API connections

  // Content
  features: Feature[]; // Unified features array (can include both simple and detailed features)
  howItWorks: HowItWorksStep[]; // Step-by-step workflow

  // Data & Automation
  models?: ModelTemplate[]; // Optional for some marketplace templates
  schedules?: ScheduleTemplate[];

  // Stats & Engagement
  usageCount: number;
  viewCount: number;
  rating?: number;
  reviewCount?: number;

  // Dates
  createdAt: Date;
  updatedAt: Date;

  // Badges
  badges: TemplateBadge[];
}

// Alias for backward compatibility with marketplace templates
export type Template = AgentTemplateData;
