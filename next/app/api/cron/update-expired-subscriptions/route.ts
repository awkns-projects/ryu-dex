import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update expired subscriptions
    const now = new Date();
    const result = await prisma.subscription.updateMany({
      where: {
        endDate: {
          lt: now // End date is before now
        },
        status: {
          not: 'expired' // Not already expired
        },
        active: true // Still active
      },
      data: {
        status: 'expired',
        active: false,
        updatedAt: now,
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to update expired subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
