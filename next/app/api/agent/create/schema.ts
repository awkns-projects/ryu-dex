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

export const createAgentRequestBodySchema = z.object({
  id: z.string().describe('Unique request ID'),
  agentName: z.string().describe('Name of the agent to create'),
  agentDescription: z.string().describe('Detailed description of what the agent should do, what data it works with, and what automation it provides'),
  connections: z.array(z.enum(ALLOWED_CONNECTIONS)).optional().describe('External service connections (google, facebook, instagram, threads, x, tiktok, telegram, ccxt)'),
});

export type CreateAgentRequestBody = z.infer<typeof createAgentRequestBodySchema>;

