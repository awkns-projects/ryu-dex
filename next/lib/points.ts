import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AwardPointsOptions {
  userId: string;
  points: number;
  activity: string;
  description?: string;
}

/**
 * Award points to a user and create an activity record
 * @param options - The options for awarding points
 * @returns The created activity and the user's new total points
 */
export async function awardPoints(options: AwardPointsOptions) {
  const { userId, points, activity, description } = options;

  try {
    const result = await prisma.$transaction([
      // Create the activity record
      prisma.pointsActivity.create({
        data: {
          userId,
          points,
          activity,
          description,
        },
      }),
      // Update the user's total points
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: points } },
        select: { points: true },
      }),
    ]);

    return {
      activity: result[0],
      totalPoints: result[1].points,
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Get a user's total points
 */
export async function getUserPoints(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });

  return user?.points ?? 0;
}

/**
 * Get a user's points activity history
 */
export async function getPointsActivity(userId: string, limit = 50) {
  return await prisma.pointsActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

