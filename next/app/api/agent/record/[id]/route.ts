import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { updateAgentRecord, getAgentRecordById, deleteAgentRecord } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';

// PATCH endpoint - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { data } = body;
    const { id: recordId } = await params;

    if (!data) {
      return Response.json(
        { error: 'Missing required field: data' },
        { status: 400 }
      );
    }

    console.log('📝 Updating record:', recordId);

    // Get existing record to verify ownership
    const existingRecord = await getAgentRecordById(recordId);
    if (!existingRecord) {
      return Response.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Update the record
    const updatedRecord = await updateAgentRecord(recordId, data);

    console.log('✅ Record updated:', updatedRecord);

    return Response.json({ record: updatedRecord });
  } catch (error) {
    console.error('❌ Failed to update record:', error);
    return Response.json(
      { error: 'Failed to update record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const { id: recordId } = await params;

    console.log('🗑️ Soft deleting record:', recordId);

    // Get existing record to verify ownership
    const existingRecord = await getAgentRecordById(recordId);
    if (!existingRecord) {
      return Response.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Soft delete: Set deletedAt instead of actual delete
    // This preserves foreign key relationships for AgentExecution
    await deleteAgentRecord(recordId);

    console.log('✅ Record soft deleted:', recordId);

    return Response.json({ success: true, id: recordId });
  } catch (error) {
    console.error('❌ Failed to delete record:', error);
    return Response.json(
      { error: 'Failed to delete record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

