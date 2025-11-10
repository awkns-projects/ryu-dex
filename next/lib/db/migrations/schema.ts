import { pgTable, text, boolean, timestamp, jsonb, uuid, varchar, json, unique, integer, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const suggestion = pgTable("Suggestion", {
	id: text().notNull(),
	documentId: text(),
	originalText: text(),
	suggestedText: text(),
	description: text(),
	isResolved: boolean().default(false),
	userId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
});

export const document = pgTable("Document", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	title: text(),
	content: text(),
	kind: text().default('text'),
	userId: text(),
});

export const stream = pgTable("Stream", {
	id: text().primaryKey().notNull(),
	chatId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
});

export const agent = pgTable("Agent", {
	id: text().primaryKey().notNull(),
	name: text(),
	description: text(),
	userId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }),
});

export const agentModel = pgTable("AgentModel", {
	id: text().primaryKey().notNull(),
	agentId: text(),
	name: text(),
	emoji: text(),
	cardComponent: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
});

export const vote = pgTable("Vote", {
	id: text().primaryKey().notNull(),
	chatId: text(),
	messageId: text(),
	isUpvoted: boolean(),
});

export const agentStep = pgTable("AgentStep", {
	id: text().primaryKey().notNull(),
	actionId: text(),
	name: text(),
	type: text(),
	config: jsonb(),
	order: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
});

export const agentAction = pgTable("AgentAction", {
	id: text().primaryKey().notNull(),
	agentId: text(),
	modelId: text(),
	name: text(),
	title: text(),
	emoji: text(),
	description: text(),
	inputFields: jsonb(),
	outputFields: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
});

export const messageV2 = pgTable("Message_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	parts: json().notNull(),
	attachments: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	unique("session_token_unique").on(table.token),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: varchar({ length: 64 }).notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	password: varchar({ length: 64 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chat = pgTable("Chat", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	title: text(),
	userId: text(),
	visibility: text().default('private'),
	lastContext: jsonb(),
});

export const agentRecord = pgTable("AgentRecord", {
	id: text().primaryKey().notNull(),
	modelId: text(),
	data: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }),
});

export const agentExecution = pgTable("AgentExecution", {
	id: text().primaryKey().notNull(),
	recordId: text(),
	actionId: text(),
	scheduleId: text(),
	status: text().default('pending'),
	result: jsonb(),
	error: text(),
	totalTokens: integer(),
	inputTokens: integer(),
	outputTokens: integer(),
	executionTimeMs: integer(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	completedAt: timestamp({ precision: 3, mode: 'string' }),
});

export const agentSchedule = pgTable("AgentSchedule", {
	id: text().primaryKey().notNull(),
	agentId: text(),
	name: text(),
	mode: text(),
	intervalHours: text(),
	status: text().default('active'),
	nextRunAt: timestamp({ precision: 3, mode: 'string' }),
	lastRunAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }),
});

export const agentScheduleStep = pgTable("AgentScheduleStep", {
	id: text().primaryKey().notNull(),
	scheduleId: text(),
	modelId: text(),
	query: text(),
	actionId: text(),
	order: integer(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }),
});

export const message = pgTable("Message", {
	id: text().primaryKey().notNull(),
	chatId: text(),
	role: text(),
	parts: jsonb(),
	attachments: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }),
});

export const voteV2 = pgTable("Vote_v2", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
}, (table) => [
	primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_v2_chatId_messageId_pk"}),
]);
