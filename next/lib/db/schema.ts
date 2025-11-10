import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  jsonb,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import type { AppUsage } from '../usage';

export const user = pgTable("user", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: varchar("email", { length: 64 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  password: varchar('password', { length: 64 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  lastContext: jsonb('lastContext').$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet', 'agent'] })
      .notNull()
      .default('text'),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

// Agent Builder Schema
export const agent = pgTable('Agent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  title: varchar('title', { length: 255 }), // Template title (e.g., "Customer Support Agent")
  name: varchar('name', { length: 255 }), // User's custom name (e.g., "My Support Bot")
  description: text('description'),
  templateId: varchar('templateId', { length: 255 }), // Reference to original template
  image: varchar('image', { length: 255 }), // Agent avatar image path
  features: jsonb('features'), // Array of feature definitions from template
  connections: jsonb('connections'), // Array of connection definitions from template
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export type Agent = InferSelectModel<typeof agent>;

export const agentModel = pgTable('AgentModel', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  agentId: uuid('agentId')
    .notNull()
    .references(() => agent.id),
  name: varchar('name', { length: 255 }).notNull(),
  fields: jsonb('fields').notNull(), // Array of field definitions
  forms: jsonb('forms'), // Array of form definitions (nullable, will be set during creation)
  createdAt: timestamp('createdAt').notNull(),
});

export type AgentModel = InferSelectModel<typeof agentModel>;

export const agentAction = pgTable('AgentAction', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  agentId: uuid('agentId')
    .notNull()
    .references(() => agent.id),
  modelId: uuid('modelId')
    .notNull()
    .references(() => agentModel.id),
  name: varchar('name', { length: 255 }).notNull(), // Code identifier
  title: varchar('title', { length: 255 }), // UI display name
  emoji: varchar('emoji', { length: 10 }), // Visual emoji representation
  description: text('description'),
  inputFields: jsonb('inputFields').notNull(), // Array of field names from model or previous steps
  outputFields: jsonb('outputFields').notNull(), // Array of field names to save to model
  createdAt: timestamp('createdAt').notNull(),
});

export type AgentAction = InferSelectModel<typeof agentAction>;

export const agentStep = pgTable('AgentStep', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  actionId: uuid('actionId')
    .notNull()
    .references(() => agentAction.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { enum: ['ai_reasoning', 'web_search', 'custom', 'image_generation'] }).notNull(),
  config: jsonb('config').notNull(), // Step-specific configuration (includes inputFields/outputFields)
  order: varchar('order', { length: 10 }).notNull(), // For ordering steps
  createdAt: timestamp('createdAt').notNull(),
});

export type AgentStep = InferSelectModel<typeof agentStep>;

export const agentRecord = pgTable('AgentRecord', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  modelId: uuid('modelId')
    .notNull()
    .references(() => agentModel.id),
  data: jsonb('data').notNull(), // The actual record data based on model fields
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  deletedAt: timestamp('deletedAt'), // Soft delete - null means not deleted
});

export type AgentRecord = InferSelectModel<typeof agentRecord>;

export const agentExecution = pgTable('AgentExecution', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  recordId: uuid('recordId')
    .notNull()
    .references(() => agentRecord.id),
  actionId: uuid('actionId')
    .notNull()
    .references(() => agentAction.id),
  scheduleId: uuid('scheduleId')
    .references(() => agentSchedule.id),
  status: varchar('status', { enum: ['pending', 'running', 'completed', 'failed'] }).notNull().default('pending'),
  result: jsonb('result'), // Results from executing the action
  error: text('error'),
  // Token usage tracking
  totalTokens: integer('totalTokens'),
  inputTokens: integer('inputTokens'),
  outputTokens: integer('outputTokens'),
  // Execution time tracking (in milliseconds)
  executionTimeMs: integer('executionTimeMs'),
  createdAt: timestamp('createdAt').notNull(),
  completedAt: timestamp('completedAt'),
});

export type AgentExecution = InferSelectModel<typeof agentExecution>;

export const agentSchedule = pgTable('AgentSchedule', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  agentId: uuid('agentId')
    .notNull()
    .references(() => agent.id),
  name: varchar('name', { length: 255 }),
  mode: varchar('mode', { enum: ['once', 'recurring'] }).notNull(),
  intervalHours: varchar('intervalHours', { length: 10 }), // For recurring schedules
  status: varchar('status', { enum: ['active', 'paused'] }).notNull().default('active'),
  nextRunAt: timestamp('nextRunAt'), // For recurring schedules
  lastRunAt: timestamp('lastRunAt'), // Track last execution
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export type AgentSchedule = InferSelectModel<typeof agentSchedule>;

export const agentScheduleStep = pgTable('AgentScheduleStep', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  scheduleId: uuid('scheduleId')
    .notNull()
    .references(() => agentSchedule.id),
  modelId: uuid('modelId')
    .notNull()
    .references(() => agentModel.id),
  query: jsonb('query'), // NEW: Structured query object { filters: [...], logic: 'AND' } OR legacy string
  actionId: uuid('actionId')
    .notNull()
    .references(() => agentAction.id),
  order: integer('order').notNull(), // Step execution order
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export type AgentScheduleStep = InferSelectModel<typeof agentScheduleStep>;

// Subscription and Billing Schema
export const subscriptionPlan = pgTable('SubscriptionPlan', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  emoji: varchar('emoji', { length: 10 }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Price in cents/smallest currency unit
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  features: jsonb('features'), // Array of feature strings
  stripePriceId: varchar('stripePriceId', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  isInviteOnly: boolean('isInviteOnly').notNull().default(false),
  isPopular: boolean('isPopular').notNull().default(false),
  orderIndex: integer('orderIndex').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlan>;

export const subscription = pgTable('Subscription', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  planId: uuid('planId')
    .notNull()
    .references(() => subscriptionPlan.id),
  stripeSubscriptionId: varchar('stripeSubscriptionId', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripeCustomerId', { length: 255 }).notNull(),
  status: varchar('status', {
    enum: ['active', 'inactive', 'canceled', 'past_due', 'unpaid', 'trialing', 'expired']
  }).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  cancelDate: timestamp('cancelDate'),
  stoppedDate: timestamp('stoppedDate'),
  active: boolean('active').notNull().default(true),
  autoRenew: boolean('autoRenew').notNull().default(true),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false),
  upgradeInitiated: boolean('upgradeInitiated').notNull().default(false),
  upgradeSessionId: varchar('upgradeSessionId', { length: 255 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Subscription = InferSelectModel<typeof subscription>;

export const payment = pgTable('Payment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  subscriptionId: uuid('subscriptionId')
    .notNull()
    .references(() => subscription.id),
  amount: integer('amount').notNull(), // Amount in cents
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  status: varchar('status', {
    enum: ['pending', 'completed', 'failed', 'refunded']
  }).notNull(),
  paymentStatus: varchar('paymentStatus', {
    enum: ['pending', 'completed', 'failed', 'refunded']
  }).notNull(),
  paymentMethod: varchar('paymentMethod', { length: 50 }).notNull(),
  invoiceId: varchar('invoiceId', { length: 255 }),
  invoiceUrl: text('invoiceUrl'),
  stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deletedAt'),
  deleted: boolean('deleted').default(false),
});

export type Payment = InferSelectModel<typeof payment>;

export const inviteCode = pgTable('InviteCode', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  planId: uuid('planId')
    .notNull()
    .references(() => subscriptionPlan.id),
  userId: text('userId')
    .references(() => user.id, { onDelete: 'set null' }),
  isUsed: boolean('isUsed').notNull().default(false),
  usedAt: timestamp('usedAt'),
  expiresAt: timestamp('expiresAt'),
  paidAt: timestamp('paidAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InviteCode = InferSelectModel<typeof inviteCode>;
