import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getFullAgentWithModelsAndActions,
  updateAgentAction,
  deleteAgentStep,
  createAgentStep,
  getAgentStepsByActionId
} from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ actionId: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user?.id) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const { actionId } = await params;
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

    console.log('🔧 Updating action:', { actionId, agentId, name, targetModel, stepsCount: steps.length });

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

    // Verify the action exists and user owns it
    const existingAction = agent.actions.find(a => a.id === actionId);
    if (!existingAction) {
      return Response.json(
        { error: 'Action not found' },
        { status: 404 }
      );
    }

    // Update the action
    const updatedAction = await updateAgentAction(actionId, {
      name,
      title: name, // Use name as title for now
      description: description || '',
      modelId: targetModelData.id,
    });

    console.log('✅ Updated action:', updatedAction.id);

    // Delete existing steps
    const existingSteps = await getAgentStepsByActionId(actionId);
    await Promise.all(
      existingSteps.map(step => deleteAgentStep(step.id))
    );

    console.log('🗑️ Deleted existing steps');

    // Create new steps
    const savedSteps = await Promise.all(
      steps.map(async (step: any, index: number) => {
        console.log('💾 Creating new step:', step.name, 'for action:', actionId);

        const savedStep = await createAgentStep({
          actionId,
          name: step.name,
          type: step.type,
          config: {
            ...step.config,
            inputFields: step.inputFields || [],
            outputFields: step.outputFields || [],
          },
          order: step.order || String(index + 1),
        });

        console.log('✅ Created new step:', savedStep.id);
        return savedStep;
      })
    );

    console.log('🎉 Action updated successfully');

    return Response.json({
      action: updatedAction,
      steps: savedSteps,
      message: `Action "${name}" updated successfully with ${savedSteps.length} steps`
    });

  } catch (error) {
    console.error('❌ Failed to update action:', error);
    return Response.json(
      {
        error: 'Failed to update action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 