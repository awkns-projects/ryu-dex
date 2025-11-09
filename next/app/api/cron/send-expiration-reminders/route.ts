import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendExpirationReminder } from '@/lib/subscription-emails';
import { format } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find subscriptions expiring in 3 days
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: {
          gte: now, // Not yet expired
          lt: threeDaysFromNow // Expires within 3 days
        },
        status: 'active',
        active: true
      },
      include: {
        user: true,
        plan: true
      }
    });

    // Send reminder emails using Resend
    const emailResults = [];
    for (const sub of expiringSubscriptions) {
      try {
        await sendExpirationReminder({
          to: sub.user.email,
          name: sub.user.name || undefined,
          planName: sub.plan.name,
          expiryDate: sub.endDate
            ? format(sub.endDate, 'yyyy-MM-dd')
            : 'soon',
          locale: 'en', // You can get this from user preferences if available
        });

        emailResults.push({
          success: true,
          email: sub.user.email,
        });
      } catch (error) {
        console.error(`Failed to send email to ${sub.user.email}:`, error);
        emailResults.push({
          success: false,
          email: sub.user.email,
        });
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: emailResults.length,
      results: emailResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to send expiration reminders:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
