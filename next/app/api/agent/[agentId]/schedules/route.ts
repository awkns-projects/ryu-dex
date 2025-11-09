import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSchedulesByAgentId } from '@/lib/db/queries';
import { getFullAgentWithModelsAndActions } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  try {
    // Get session using Better Auth API
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // Verify agent exists and user owns it
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.agent.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    const schedules = await getSchedulesByAgentId(agentId);
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

