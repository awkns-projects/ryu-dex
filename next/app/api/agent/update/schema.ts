import { z } from 'zod';

// Allowed external service connections
export const ALLOWED_CONNECTIONS = [
  'google',
  'facebook',
  'instagram',
  'threads',
  'x',
  'tiktok',
  'telegram',
  'ccxt'
] as const;

export type AllowedConnection = typeof ALLOWED_CONNECTIONS[number];

export const agentUpdateRequestBodySchema = z.object({
  id: z.string().describe('Unique request ID'),
  agentId: z.string().describe('ID of the agent to update'),
  featureDescription: z.string().describe('Detailed description of the feature to add'),
  connections: z.array(z.enum(ALLOWED_CONNECTIONS)).optional().describe('External service connections for this feature (google, facebook, instagram, threads, x, tiktok, telegram, ccxt)'),
});

export type AgentUpdateRequestBody = z.infer<typeof agentUpdateRequestBodySchema>;

