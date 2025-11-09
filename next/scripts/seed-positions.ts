import { prisma } from '../lib/db'

// Sample positions data
const samplePositions = [
  // Agent-created positions
  {
    symbol: 'BTC',
    type: 'long' as const,
    leverage: 10,
    entryPrice: 43200,
    currentPrice: 44500,
    quantity: 0.5,
    stopLoss: 42000,
    takeProfit: 46000,
    source: 'agent' as const,
  },
  {
    symbol: 'ETH',
    type: 'short' as const,
    leverage: 20,
    entryPrice: 2800,
    currentPrice: 2650,
    quantity: 2.5,
    stopLoss: 2950,
    takeProfit: 2500,
    source: 'agent' as const,
  },
  {
    symbol: 'SOL',
    type: 'long' as const,
    leverage: 5,
    entryPrice: 98.5,
    currentPrice: 102.3,
    quantity: 50,
    stopLoss: 95.0,
    takeProfit: 110.0,
    source: 'agent' as const,
  },
  // Market-purchased positions
  {
    symbol: 'BTC',
    type: 'long' as const,
    leverage: 10,
    entryPrice: 43200,
    currentPrice: 44800,
    quantity: 0.8,
    stopLoss: 41500,
    takeProfit: 47000,
    source: 'market' as const,
    marketPrice: 45000,
    marketDiscount: 12,
  },
  {
    symbol: 'ETH',
    type: 'short' as const,
    leverage: 15,
    entryPrice: 2750,
    currentPrice: 2680,
    quantity: 3.0,
    stopLoss: 2900,
    takeProfit: 2550,
    source: 'market' as const,
    marketPrice: 2800,
    marketDiscount: 18,
  },
  {
    symbol: 'AVAX',
    type: 'long' as const,
    leverage: 15,
    entryPrice: 35.2,
    currentPrice: 36.8,
    quantity: 100,
    stopLoss: 33.5,
    takeProfit: 40.0,
    source: 'market' as const,
    marketPrice: 37.5,
    marketDiscount: 20,
  },
]

async function seedPositions(userEmail: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`User with email ${userEmail} not found`)
      process.exit(1)
    }

    console.log(`Seeding positions for user: ${user.email} (${user.id})`)

    // Find user's agents
    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      take: 3,
    })

    // Create positions
    for (const positionData of samplePositions) {
      // Calculate PnL
      const pnlMultiplier = positionData.type === 'long' ? 1 : -1
      const pnl = pnlMultiplier * (positionData.currentPrice - positionData.entryPrice) * positionData.quantity * positionData.leverage
      const pnlPercent = ((positionData.currentPrice - positionData.entryPrice) / positionData.entryPrice) * 100 * pnlMultiplier * positionData.leverage

      // For agent positions, assign to a random agent if available
      const agentId = positionData.source === 'agent' && agents.length > 0
        ? agents[Math.floor(Math.random() * agents.length)].id
        : undefined

      const position = await prisma.position.create({
        data: {
          userId: user.id,
          agentId,
          symbol: positionData.symbol,
          type: positionData.type,
          leverage: positionData.leverage,
          entryPrice: positionData.entryPrice,
          currentPrice: positionData.currentPrice,
          quantity: positionData.quantity,
          stopLoss: positionData.stopLoss,
          takeProfit: positionData.takeProfit,
          pnl,
          pnlPercent,
          source: positionData.source,
          marketPrice: positionData.marketPrice,
          marketDiscount: positionData.marketDiscount,
        },
      })

      console.log(`✓ Created ${positionData.source} position: ${position.symbol} ${position.type.toUpperCase()} ${position.leverage}x`)
    }

    console.log(`\n✓ Successfully created ${samplePositions.length} positions`)
  } catch (error) {
    console.error('Error seeding positions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const userEmail = process.argv[2]

if (!userEmail) {
  console.error('Usage: ts-node scripts/seed-positions.ts <user-email>')
  process.exit(1)
}

seedPositions(userEmail)


