import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/positions - Get all positions for the authenticated user
export async function GET(req: NextRequest) {
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

    // Fetch all positions for the user
    const positions = await prisma.position.findMany({
      where: {
        userId,
      },
      include: {
        agent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ positions, count: positions.length })
  } catch (error: any) {
    console.error('Error fetching positions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions', message: error.message },
      { status: 500 }
    )
  }
}

// POST /api/positions - Create a new position
export async function POST(req: NextRequest) {
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
    const body = await req.json()

    const {
      agentId,
      symbol,
      type,
      leverage,
      entryPrice,
      currentPrice,
      quantity,
      stopLoss,
      takeProfit,
      source,
      marketPrice,
      marketDiscount,
    } = body

    // Validate required fields
    if (!symbol || !type || !entryPrice || !currentPrice || !quantity || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate PnL
    const pnlMultiplier = type === 'long' ? 1 : -1
    const pnl = pnlMultiplier * (currentPrice - entryPrice) * quantity * leverage
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100 * pnlMultiplier * leverage

    // Create the position
    const position = await prisma.position.create({
      data: {
        userId,
        agentId,
        symbol,
        type,
        leverage: leverage || 1,
        entryPrice,
        currentPrice,
        quantity,
        stopLoss,
        takeProfit,
        pnl,
        pnlPercent,
        source,
        marketPrice,
        marketDiscount,
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error: any) {
    console.error('Error creating position:', error)
    return NextResponse.json(
      { error: 'Failed to create position', message: error.message },
      { status: 500 }
    )
  }
}


