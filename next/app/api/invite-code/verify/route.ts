import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, planId, email } = await request.json();

    console.log('Verifying invite code:', { code, planId, email });

    if (!code || !planId || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find the invite code
    const inviteCodeResult = await prisma.inviteCode.findFirst({
      where: {
        code,
        planId,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!inviteCodeResult) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Find user
    const userResult = await prisma.user.findUnique({
      where: { email }
    });

    if (!userResult) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has already used an invite code for this plan
    const usedInviteCode = await prisma.inviteCode.findFirst({
      where: {
        planId,
        userId: userResult.id,
        isUsed: true
      }
    });

    if (usedInviteCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have already used an invite code for this plan',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invite code verified successfully',
      inviteCodeId: inviteCodeResult.id,
    });
  } catch (error) {
    console.error('Verify invite code error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify invite code' },
      { status: 500 }
    );
  }
}
