import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getExecutionsByModelId } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const executions = await getExecutionsByModelId(id);
    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Failed to fetch model executions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch model executions' },
      { status: 500 }
    );
  }
} 