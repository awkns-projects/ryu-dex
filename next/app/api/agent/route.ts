import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getFullAgentWithModelsAndActions, getAgentsByUserId, getAgentSummary } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';
import { getTemplateById } from '@/lib/agent-templates';

// GET endpoint - list all user's agents or get single agent by ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    // If ID is provided, fetch single agent with full details
    if (id) {
      console.log('🔍 Fetching agent with ID:', id);
      const agent = await getFullAgentWithModelsAndActions(id);

      if (!agent) {
        console.log('❌ Agent not found:', id);
        return Response.json(
          {
            code: 'not_found:agent',
            message: 'The requested agent was not found. Please check the agent ID and try again.'
          },
          { status: 404 }
        );
      }

      // Check if user owns this agent
      if (agent.agent.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }

      console.log('✅ Agent found and authorized:', agent.agent.name);
      console.log('📊 Agent data structure:', {
        agent: agent.agent.name,
        models: agent.models.length,
        actions: agent.actions.length,
        actionNames: agent.actions.map((a: any) => a.name),
        features: Array.isArray(agent.features) ? agent.features.length : 0,
      });

      // Fetch template data if templateId exists (for fallback)
      let templateData = null;
      if (agent.agent.templateId) {
        templateData = getTemplateById(agent.agent.templateId);
      }

      // Use features and connections from agent record (stored during creation)
      // Fall back to template data only if agent record doesn't have them
      const responseData = {
        ...agent,
        connections: agent.connections || templateData?.connections || [],
        features: agent.features || templateData?.features || [],
        // Only use database schedules (they were created from template during agent creation)
        // Don't include template schedules to avoid duplicates with non-UUID IDs
        schedules: agent.schedules || [],
      };

      console.log('📦 Returning agent data:', {
        featuresCount: responseData.features?.length || 0,
        connectionsCount: responseData.connections?.length || 0,
      });

      return Response.json(responseData);
    }

    // Otherwise, list all user's agents with summary data (lightweight)
    console.log('📋 Fetching all agents for user:', session.user.id);
    const basicAgents = await getAgentsByUserId(session.user.id);
    console.log('✅ Found', basicAgents.length, 'agents');

    // Fetch lightweight summary for each agent (no records data)
    const agentSummaries = await Promise.all(
      basicAgents.map(async (agent) => {
        const summary = await getAgentSummary(agent.id);
        return summary;
      })
    );

    return Response.json({
      agents: agentSummaries,
      count: agentSummaries.length
    });

  } catch (error) {
    console.error('Error fetching agent(s):', error);
    return Response.json(
      {
        code: 'internal_error:agent',
        message: 'An error occurred while fetching the agent(s).'
      },
      { status: 500 }
    );
  }
} 