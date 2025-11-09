# Trading Positions Feature

## Overview

This feature adds user trading positions to the trade page with clear indicators showing whether each position was created by an AI agent or purchased from the marketplace.

## Database Schema

### Position Model

The `Position` model includes:
- Basic position info: symbol, type (long/short), leverage, quantity
- Pricing: entryPrice, currentPrice, stopLoss, takeProfit
- Performance: pnl, pnlPercent
- Status: open, closed, liquidated
- **Source indicator**: `agent` or `market` (key feature)
- Market info: marketPrice, marketDiscount (for marketplace positions)
- Relationships: userId, optional agentId

## API Endpoints

### GET /api/positions
Fetch all positions for the authenticated user.

**Response:**
```json
{
  "positions": [...],
  "count": 5
}
```

### POST /api/positions
Create a new position.

**Request Body:**
```json
{
  "symbol": "BTC",
  "type": "long",
  "leverage": 10,
  "entryPrice": 43200,
  "currentPrice": 44500,
  "quantity": 0.5,
  "stopLoss": 42000,
  "takeProfit": 46000,
  "source": "agent",
  "agentId": "agent-uuid"
}
```

### PATCH /api/positions/:id
Update position (current price, status, etc.)

### DELETE /api/positions/:id
Delete a position

## UI Features

### Trade Page

The trade page now displays two sections:
1. **Your Agents** - Trading agents
2. **Your Positions** - Trading positions with source indicators

### Position Cards

Each position card shows:
- **Symbol & Leverage** (e.g., "BTC 10x LONG")
- **Source Badge**:
  - 🤖 "AI Agent" (blue) - Created by user's trading agent
  - 🛒 "Marketplace" (purple) - Purchased from marketplace with discount percentage
- **Status Badge**: OPEN, CLOSED, or LIQUIDATED
- **PnL Display**: Unrealized profit/loss with color coding
- **Position Details**:
  - Entry Price
  - Current Price
  - Quantity
  - Stop Loss (if set)
  - Take Profit (if set)

## Testing

### Seed Sample Data

To create sample positions for testing:

```bash
# First, run migrations
npx prisma migrate dev --name add_positions

# Then seed positions for a user
npx ts-node scripts/seed-positions.ts your-email@example.com
```

This will create 6 sample positions:
- 3 agent-created positions (BTC, ETH, SOL)
- 3 marketplace-purchased positions (BTC, ETH, AVAX) with discounts

## Usage Flow

### For AI Agents
When an agent executes a trade, it should create a position via:
```typescript
await api.post('/api/positions', {
  symbol: 'BTC',
  type: 'long',
  leverage: 10,
  entryPrice: 43200,
  currentPrice: 43200,
  quantity: 0.5,
  source: 'agent',
  agentId: agentId,
  stopLoss: 42000,
  takeProfit: 46000,
})
```

### For Marketplace Purchases
When a user purchases a position from the marketplace:
```typescript
await api.post('/api/positions', {
  symbol: 'BTC',
  type: 'long',
  leverage: 10,
  entryPrice: 43200,
  currentPrice: 44500,
  quantity: 0.8,
  source: 'market',
  marketPrice: 45000,
  marketDiscount: 12,
  stopLoss: 41500,
  takeProfit: 47000,
})
```

## Key Features

1. **Clear Source Indicators** - Users can instantly see which positions were created by their AI agents vs purchased from the marketplace
2. **Market Discount Display** - Marketplace positions show the discount percentage
3. **Real-time PnL** - Profit/loss calculated and displayed with color coding
4. **Status Management** - Track open, closed, and liquidated positions
5. **Risk Management** - Display stop-loss and take-profit levels

## Next Steps

- Integrate position creation into AI agent trading logic
- Add marketplace position purchasing flow
- Implement real-time price updates via WebSocket
- Add position management features (close, modify SL/TP)
- Add position history and analytics


