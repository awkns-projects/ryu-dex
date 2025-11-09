-- Create enums for positions
CREATE TYPE "PositionSource" AS ENUM ('agent', 'market');
CREATE TYPE "PositionStatus" AS ENUM ('open', 'closed', 'liquidated');
CREATE TYPE "PositionType" AS ENUM ('long', 'short');

-- Create Position table
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "symbol" TEXT NOT NULL,
    "type" "PositionType" NOT NULL,
    "leverage" INTEGER NOT NULL DEFAULT 1,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pnlPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PositionStatus" NOT NULL DEFAULT 'open',
    "source" "PositionSource" NOT NULL,
    "marketPrice" DOUBLE PRECISION,
    "marketDiscount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Position_userId_status_idx" ON "Position"("userId", "status");
CREATE INDEX "Position_agentId_idx" ON "Position"("agentId");

-- Note: Foreign key constraints are not added because the database may not have
-- the User or Agent tables yet. These should be added manually if needed:
-- ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Position" ADD CONSTRAINT "Position_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;


