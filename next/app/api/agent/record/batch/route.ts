import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteAgentRecord } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';

// DELETE endpoint - Batch delete records
export async function DELETE(request: NextRequest) {
  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { recordIds } = body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return Response.json(
        { error: 'Missing or invalid recordIds array' },
        { status: 400 }
      );
    }

    // Filter out null/undefined IDs
    const validRecordIds = recordIds.filter(id => id != null && id !== '');

    if (validRecordIds.length === 0) {
      return Response.json(
        { error: 'No valid record IDs provided' },
        { status: 400 }
      );
    }

    console.log('🗑️ Soft deleting records:', validRecordIds);

    // Soft delete: Set deletedAt instead of actual delete
    // This preserves foreign key relationships for AgentExecution
    const deletePromises = validRecordIds.map(id =>
      deleteAgentRecord(id)
    );
    await Promise.all(deletePromises);

    console.log('✅ Soft deleted', validRecordIds.length, 'records');

    return Response.json({
      success: true,
      deletedCount: validRecordIds.length,
      ids: validRecordIds
    });
  } catch (error) {
    console.error('❌ Failed to batch delete records:', error);
    return Response.json(
      { error: 'Failed to batch delete records', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

