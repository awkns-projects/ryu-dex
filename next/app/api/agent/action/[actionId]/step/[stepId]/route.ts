import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateAgentStep } from '@/lib/db/agent-queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ actionId: string; stepId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stepId } = await params;
    const body = await request.json();

    console.log('📝 Updating step deployment info:', stepId, body.deployment);

    // Update the step - updateAgentStep will merge the config
    // We pass the deployment info and it will be merged with existing config
    const updatedStep = await updateAgentStep(stepId, {
      config: body.deployment ? { deployment: body.deployment } : undefined
    });

    console.log('✅ Step deployment info updated successfully:', updatedStep.id);

    return NextResponse.json({
      success: true,
      step: updatedStep
    });

  } catch (error) {
    console.error('❌ Error updating step:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 