import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleSchedule } from '@/lib/db/queries';

export async function POST(
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
    const schedule = await toggleSchedule(id);
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Failed to toggle schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle schedule' },
      { status: 500 }
    );
  }
} 