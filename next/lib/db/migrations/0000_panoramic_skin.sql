-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "Suggestion" (
	"id" text NOT NULL,
	"documentId" text,
	"originalText" text,
	"suggestedText" text,
	"description" text,
	"isResolved" boolean DEFAULT false,
	"userId" text,
	"createdAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Document" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3),
	"title" text,
	"content" text,
	"kind" text DEFAULT 'text',
	"userId" text
);
--> statement-breakpoint
CREATE TABLE "Stream" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text,
	"createdAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Agent" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"userId" text,
	"createdAt" timestamp(3),
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "AgentModel" (
	"id" text PRIMARY KEY NOT NULL,
	"agentId" text,
	"name" text,
	"emoji" text,
	"cardComponent" text,
	"createdAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Vote" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text,
	"messageId" text,
	"isUpvoted" boolean
);
--> statement-breakpoint
CREATE TABLE "AgentStep" (
	"id" text PRIMARY KEY NOT NULL,
	"actionId" text,
	"name" text,
	"type" text,
	"config" jsonb,
	"order" text,
	"createdAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "AgentAction" (
	"id" text PRIMARY KEY NOT NULL,
	"agentId" text,
	"modelId" text,
	"name" text,
	"title" text,
	"emoji" text,
	"description" text,
	"inputFields" jsonb,
	"outputFields" jsonb,
	"createdAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Message_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(64) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"password" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Chat" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3),
	"title" text,
	"userId" text,
	"visibility" text DEFAULT 'private',
	"lastContext" jsonb
);
--> statement-breakpoint
CREATE TABLE "AgentRecord" (
	"id" text PRIMARY KEY NOT NULL,
	"modelId" text,
	"data" jsonb,
	"createdAt" timestamp(3),
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "AgentExecution" (
	"id" text PRIMARY KEY NOT NULL,
	"recordId" text,
	"actionId" text,
	"scheduleId" text,
	"status" text DEFAULT 'pending',
	"result" jsonb,
	"error" text,
	"totalTokens" integer,
	"inputTokens" integer,
	"outputTokens" integer,
	"executionTimeMs" integer,
	"createdAt" timestamp(3),
	"completedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "AgentSchedule" (
	"id" text PRIMARY KEY NOT NULL,
	"agentId" text,
	"name" text,
	"mode" text,
	"intervalHours" text,
	"status" text DEFAULT 'active',
	"nextRunAt" timestamp(3),
	"lastRunAt" timestamp(3),
	"createdAt" timestamp(3),
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "AgentScheduleStep" (
	"id" text PRIMARY KEY NOT NULL,
	"scheduleId" text,
	"modelId" text,
	"query" text,
	"actionId" text,
	"order" integer,
	"createdAt" timestamp(3),
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Message" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text,
	"role" text,
	"parts" jsonb,
	"attachments" jsonb,
	"createdAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "Vote_v2" (
	"chatId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"isUpvoted" boolean NOT NULL,
	CONSTRAINT "Vote_v2_chatId_messageId_pk" PRIMARY KEY("chatId","messageId")
);

*/