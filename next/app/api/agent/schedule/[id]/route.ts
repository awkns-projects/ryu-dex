import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteSchedule, updateSchedule } from '@/lib/db/queries';

export async function DELETE(
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
    const schedule = await deleteSchedule(id);
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while executing a database query.',
        details: 'Failed to delete schedule and related records'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();
    const { name, mode, intervalHours, steps } = body;

    if (!mode || !steps?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (mode === 'recurring' && !intervalHours) {
      return NextResponse.json(
        { error: 'intervalHours required for recurring schedules' },
        { status: 400 }
      );
    }

    const schedule = await updateSchedule({
      id,
      name,
      mode,
      intervalHours,
      steps,
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update schedule' },
      { status: 500 }
    );
  }
} 