import 'server-only';

import { prisma } from './prisma';
import type { Agent } from '@prisma/client';

/**
 * Get pilot features stored with an agent
 * Returns the original feature descriptions submitted during pilot creation
 */
export async function getAgentFeatures(agentId: string): Promise<any[] | null> {
  const agentData = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { features: true }
  });

  return agentData?.features as any[] | null;
}

/**
 * Update agent features
 * Useful for versioning or tracking feature evolution
 */
export async function updateAgentFeatures(agentId: string, features: any[]): Promise<void> {
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      features,
      updatedAt: new Date(),
    }
  });
}

/**
 * Get all agents with their features for analytics
 * Returns agents with non-null features (pilot-created agents)
 */
export async function getPilotCreatedAgents(userId?: string): Promise<Agent[]> {
  const agents = await prisma.agent.findMany({
    where: userId ? { userId } : undefined
  });

  // Filter to only agents with features (pilot-created)
  return agents.filter(a => a.features !== null && a.features !== undefined);
}

/**
 * Analyze feature patterns across all pilot-created agents
 * Useful for understanding common use cases and patterns
 */
export async function analyzeFeaturePatterns(): Promise<{
  totalAgents: number;
  totalFeatures: number;
  commonPatterns: { pattern: string; count: number }[];
}> {
  const pilotAgents = await getPilotCreatedAgents();

  const totalFeatures = pilotAgents.reduce((sum, agent) => {
    const features = agent.features as any[];
    return sum + (features?.length || 0);
  }, 0);

  // Extract common patterns from feature descriptions
  const descriptions = pilotAgents.flatMap(agent => {
    const features = agent.features as any[];
    return features?.map((f: any) => f.description?.toLowerCase()) || [];
  });

  const patternCounts = new Map<string, number>();

  // Count common keywords
  const keywords = ['track', 'analyze', 'generate', 'manage', 'monitor', 'send', 'create', 'update'];
  keywords.forEach(keyword => {
    const count = descriptions.filter(d => d?.includes(keyword)).length;
    if (count > 0) {
      patternCounts.set(keyword, count);
    }
  });

  const commonPatterns = Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalAgents: pilotAgents.length,
    totalFeatures,
    commonPatterns,
  };
}

/**
 * Example usage:
 * 
 * // Get features for a specific agent
 * const features = await getAgentFeatures('agent-id-123');
 * console.log('Original pilot features:', features);
 * 
 * // Get all pilot-created agents for a user
 * const userAgents = await getPilotCreatedAgents('user-id-456');
 * console.log(`User has ${userAgents.length} pilot-created agents`);
 * 
 * // Analyze feature patterns across all users
 * const analytics = await analyzeFeaturePatterns();
 * console.log('Most common feature types:', analytics.commonPatterns);
 */
