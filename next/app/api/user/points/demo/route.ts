import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { awardPoints } from '@/lib/points';

/**
 * Demo endpoint to award sample points
 * This is just for testing - remove in production or add proper authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Award some demo points
    const activities = [
      { points: 100, activity: 'Welcome Bonus', description: 'Thanks for joining!' },
      { points: 50, activity: 'First Agent Created', description: 'Created your first AI agent' },
      { points: 25, activity: 'Daily Login', description: 'Logged in today' },
      { points: 75, activity: 'Agent Execution', description: 'Successfully ran an agent' },
      { points: 150, activity: 'Premium Subscription', description: 'Subscribed to premium plan' },
    ];

    const results = [];
    for (const activity of activities) {
      const result = await awardPoints({
        userId: session.user.id,
        ...activity,
      });
      results.push(result);
    }

    return NextResponse.json({
      message: 'Demo points awarded!',
      results
    });
  } catch (error) {
    console.error('Error awarding demo points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

