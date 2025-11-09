import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

type RouteParams = {
  params: {
    id: string
  }
}

// GET /api/positions/:id - Get a specific position
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = params

    const position = await prisma.position.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        agent: true,
      },
    })

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(position)
  } catch (error: any) {
    console.error('Error fetching position:', error)
    return NextResponse.json(
      { error: 'Failed to fetch position', message: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/positions/:id - Update a position
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = params
    const body = await req.json()

    // Check if position exists and belongs to user
    const existingPosition = await prisma.position.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPosition) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    // Update position
    const { currentPrice, status, stopLoss, takeProfit } = body

    // Recalculate PnL if current price is updated
    let pnl = existingPosition.pnl
    let pnlPercent = existingPosition.pnlPercent

    if (currentPrice !== undefined) {
      const pnlMultiplier = existingPosition.type === 'long' ? 1 : -1
      pnl = pnlMultiplier * (currentPrice - existingPosition.entryPrice) * existingPosition.quantity * existingPosition.leverage
      pnlPercent = ((currentPrice - existingPosition.entryPrice) / existingPosition.entryPrice) * 100 * pnlMultiplier * existingPosition.leverage
    }

    const position = await prisma.position.update({
      where: { id },
      data: {
        currentPrice: currentPrice ?? existingPosition.currentPrice,
        status: status ?? existingPosition.status,
        stopLoss: stopLoss ?? existingPosition.stopLoss,
        takeProfit: takeProfit ?? existingPosition.takeProfit,
        pnl,
        pnlPercent,
        closedAt: status === 'closed' || status === 'liquidated' ? new Date() : existingPosition.closedAt,
      },
    })

    return NextResponse.json(position)
  } catch (error: any) {
    console.error('Error updating position:', error)
    return NextResponse.json(
      { error: 'Failed to update position', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/positions/:id - Delete a position
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = params

    // Check if position exists and belongs to user
    const existingPosition = await prisma.position.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPosition) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      )
    }

    await prisma.position.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting position:', error)
    return NextResponse.json(
      { error: 'Failed to delete position', message: error.message },
      { status: 500 }
    )
  }
}


