import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getExecutionsByActionId } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { actionId } = await params;
    const executions = await getExecutionsByActionId(actionId);
    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Failed to fetch action executions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch action executions' },
      { status: 500 }
    );
  }
} 