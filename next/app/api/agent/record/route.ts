import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { createAgentRecord } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { agentId, modelId, data } = body;

    if (!agentId || !modelId || !data) {
      return Response.json(
        { error: 'Missing required fields: agentId, modelId, data' },
        { status: 400 }
      );
    }

    console.log('💾 Creating record:', { agentId, modelId, data });

    // Create the record
    const record = await createAgentRecord({
      modelId,
      data,
    });

    console.log('✅ Record created:', record);

    return Response.json({ record });
  } catch (error) {
    console.error('❌ Failed to create record:', error);
    return Response.json(
      { error: 'Failed to create record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 