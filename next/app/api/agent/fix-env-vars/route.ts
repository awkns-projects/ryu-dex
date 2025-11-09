import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getFullAgentWithModelsAndActions, updateAgentStep } from '@/lib/db/agent-queries';
import { detectRequiredOAuthTokens } from '@/lib/oauth-constants';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { agentId } = await request.json();

    if (!agentId) {
      return new Response('Agent ID is required', { status: 400 });
    }

    console.log(`🔍 Scanning agent ${agentId} for missing OAuth tokens...`);

    // Get the full agent with actions
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent) {
      return new Response('Agent not found', { status: 404 });
    }

    let updatedCount = 0;

    for (const action of agent.actions) {
      for (const step of action.steps) {
        if (step.type !== 'custom') continue;

        const config = step.config as any;
        const searchText = `${config?.description || ''} ${step.name}`;

        // Detect required OAuth tokens using standardized detection
        const detectedEnvVars = new Set<string>(config?.envVars || []);
        let hasChanges = false;

        // Use shared OAuth detection logic
        const requiredOAuthTokens = detectRequiredOAuthTokens(searchText);
        for (const token of requiredOAuthTokens) {
          if (!detectedEnvVars.has(token)) {
            console.log(`✅ Adding ${token} to step: ${step.name}`);
            detectedEnvVars.add(token);
            hasChanges = true;
          }
        }

        // Update the step if changes were made
        if (hasChanges) {
          const updatedConfig = {
            ...config,
            envVars: Array.from(detectedEnvVars)
          };

          await updateAgentStep(step.id, { config: updatedConfig });

          updatedCount++;
        }
      }
    }

    console.log(`✅ Updated ${updatedCount} steps with OAuth tokens`);

    return Response.json({
      success: true,
      updatedCount,
      message: updatedCount > 0
        ? `Fixed ${updatedCount} step(s) with missing OAuth tokens`
        : 'No steps needed updating'
    });

  } catch (error) {
    console.error('❌ Failed to fix environment variables:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
} 