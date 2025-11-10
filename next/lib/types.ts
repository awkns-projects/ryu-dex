// Minimal type definitions for packages/app
// Full type definitions are in apps/next/lib/types.ts

import type { UIMessage, UIMessagePart } from 'ai';

// Generic message type - specific tools defined in consuming apps
export type ChatMessage = UIMessage<any, any, any>;
export type ChatTools = Record<string, any>;
export type CustomUIDataTypes = Record<string, any>;

