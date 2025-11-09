import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getExecutionsByScheduleId } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session using Better Auth API
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const executions = await getExecutionsByScheduleId(id);
    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Failed to fetch schedule executions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch schedule executions' },
      { status: 500 }
    );
  }
} 