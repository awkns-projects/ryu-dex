import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getFullAgentWithModelsAndActions } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';
import { getTemplateById } from '@/lib/agent-templates';

// GET endpoint - get single agent by ID from path parameter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    console.log('🔍 Fetching agent with ID:', agentId);
    const agent = await getFullAgentWithModelsAndActions(agentId);

    if (!agent) {
      console.log('❌ Agent not found:', agentId);
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
      actionNames: agent.actions.map((a: any) => a.name)
    });

    // Fetch template data if templateId exists
    let templateData = null;
    if (agent.agent.templateId) {
      templateData = getTemplateById(agent.agent.templateId);
      console.log('📋 Template data loaded:', {
        templateId: agent.agent.templateId,
        hasConnections: !!templateData?.connections,
        hasFeatures: !!templateData?.features,
        hasSchedules: !!templateData?.schedules,
      });
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
      schedulesCount: responseData.schedules?.length || 0,
    });

    return Response.json(responseData);

  } catch (error) {
    console.error('Error fetching agent:', error);
    return Response.json(
      {
        code: 'internal_error:agent',
        message: 'An error occurred while fetching the agent.'
      },
      { status: 500 }
    );
  }
}

