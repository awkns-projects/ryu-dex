import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreateScheduleRequest } from '@/lib/types';
import { createSchedule, getSchedulesByAgentId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Get session using Better Auth API
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
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

export async function POST(request: NextRequest) {
  try {
    // Get session using Better Auth API
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as CreateScheduleRequest;
    console.log('Received schedule request:', body);

    const { agentId, name, mode, intervalHours, steps } = body;

    if (!agentId || !steps?.length || !mode) {
      console.log('Missing required fields:', { agentId, steps, mode });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (mode === 'recurring' && !intervalHours) {
      console.log('Missing intervalHours for recurring schedule');
      return NextResponse.json(
        { error: 'intervalHours required for recurring schedules' },
        { status: 400 }
      );
    }

    const schedule = await createSchedule({
      agentId,
      name,
      mode,
      intervalHours,
      steps,
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schedule' },
      { status: 500 }
    );
  }
} 