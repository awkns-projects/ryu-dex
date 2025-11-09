import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createAgentAction, createAgentStep, getFullAgentWithModelsAndActions } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user?.id) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { agentId, action } = body;

    if (!agentId || !action) {
      return Response.json(
        { error: 'Missing required fields: agentId, action' },
        { status: 400 }
      );
    }

    const { name, description, targetModel, steps } = action;

    if (!name || !targetModel || !steps?.length) {
      return Response.json(
        { error: 'Missing required action fields: name, targetModel, steps' },
        { status: 400 }
      );
    }

    console.log('🔧 Creating action:', { agentId, name, targetModel, stepsCount: steps.length });

    // Get agent and verify ownership
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Find the target model
    const targetModelData = agent.models.find(m => m.name === targetModel);
    if (!targetModelData) {
      return Response.json(
        { error: `Target model "${targetModel}" not found` },
        { status: 400 }
      );
    }

    // Create the action
    const savedAction = await createAgentAction({
      agentId,
      modelId: targetModelData.id,
      name,
      title: name, // Use name as title for now
      description: description || '',
      inputFields: [], // Actions don't have input fields, steps do
      outputFields: [], // Actions don't have output fields, steps do
    });

    console.log('✅ Created action:', savedAction.id);

    // Create the steps
    const savedSteps = await Promise.all(
      steps.map(async (step: any, index: number) => {
        console.log('💾 Creating step:', step.name, 'for action:', savedAction.id);

        const savedStep = await createAgentStep({
          actionId: savedAction.id,
          name: step.name,
          type: step.type,
          config: {
            ...step.config,
            inputFields: step.inputFields || [],
            outputFields: step.outputFields || [],
          },
          order: step.order || String(index + 1),
        });

        console.log('✅ Created step:', savedStep.id);
        return savedStep;
      })
    );

    console.log('🎉 Action and steps created successfully');

    return Response.json({
      action: savedAction,
      steps: savedSteps,
      message: `Action "${name}" created successfully with ${savedSteps.length} steps`
    });

  } catch (error) {
    console.error('❌ Failed to create action:', error);
    return Response.json(
      {
        error: 'Failed to create action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 