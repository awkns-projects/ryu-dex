import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    const activities = await prisma.pointsActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 activities
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching points activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { points, activity, description } = await request.json();

    if (typeof points !== 'number' || !activity) {
      return NextResponse.json(
        { error: 'Invalid activity data' },
        { status: 400 }
      );
    }

    // Create activity record and update user points in a transaction
    const result = await prisma.$transaction([
      prisma.pointsActivity.create({
        data: {
          userId: session.user.id,
          points,
          activity,
          description,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { points: { increment: points } },
        select: { points: true },
      }),
    ]);

    return NextResponse.json({
      activity: result[0],
      totalPoints: result[1].points
    });
  } catch (error) {
    console.error('Error creating points activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

