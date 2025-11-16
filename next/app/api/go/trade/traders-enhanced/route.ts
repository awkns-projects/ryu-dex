import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

// Use GO_API_URL for server-side requests (Docker service name), fallback to NEXT_PUBLIC_API_URL for client-side
const BACKEND_URL = process.env.GO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
// Use SQLITE_DB_PATH for Docker (e.g., /data/config.db), fallback to DATABASE_PATH, then default path
const DB_PATH = process.env.SQLITE_DB_PATH || process.env.DATABASE_PATH || path.join(process.cwd(), '..', 'config.db')

interface EnhancedAgent {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'paused'
  totalActions: number
  createdAt: string
  deposit: number
  assets: string[]
  pnl: string
  pnlPercent: number
  winRate: number
  walletAddress: string
}

export async function GET(request: NextRequest) {
  let db: Database.Database | null = null

  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided', agents: [], totalCount: 0 },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Extract user_id from JWT (simplified - you might need to decode properly)
    // For now, we'll get it from the Go backend

    console.log('🔄 [Enhanced API] Fetching traders with enriched data...')

    // ===========================
    // STEP 1: Get traders from Go backend
    // ===========================
    const tradersResponse = await fetch(`${BACKEND_URL}/api/my-traders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    })

    // Handle authentication errors
    if (tradersResponse.status === 401) {
      console.warn('⚠️ [Enhanced API] Unauthorized request - token may be invalid or expired')
      return NextResponse.json(
        { 
          error: 'Unauthorized - Please log in again', 
          agents: [], 
          totalCount: 0,
          activeCount: 0,
          lastUpdated: new Date().toISOString(),
        },
        { status: 401 }
      )
    }

    if (!tradersResponse.ok) {
      const errorText = await tradersResponse.text().catch(() => 'Unknown error')
      console.error(`❌ [Enhanced API] Backend error: ${tradersResponse.status}`, errorText)
      throw new Error(`Backend error: ${tradersResponse.status} - ${errorText}`)
    }

    const tradersData = await tradersResponse.json()
    const tradersArray = Array.isArray(tradersData) ? tradersData : (tradersData.traders || [])

    if (tradersArray.length === 0) {
      return NextResponse.json({
        agents: [],
        totalCount: 0,
        activeCount: 0,
        lastUpdated: new Date().toISOString(),
      })
    }

    console.log('✅ [Enhanced API] Traders fetched:', tradersArray.length)

    // ===========================
    // STEP 2: Open SQLite database directly
    // ===========================
    db = new Database(DB_PATH, { readonly: true })
    console.log('✅ [Enhanced API] SQLite database opened')

    // Get user_id from first trader (all traders belong to same user)
    const firstTraderId = tradersArray[0].trader_id
    const userIdQuery = db.prepare('SELECT user_id FROM traders WHERE id = ?')
    const userIdRow = userIdQuery.get(firstTraderId) as { user_id: string } | undefined
    const userId = userIdRow?.user_id || 'default'

    console.log('📊 [Enhanced API] User ID:', userId)

    // ===========================
    // STEP 3: Fetch enriched data for each trader
    // ===========================
    const agentsPromises = tradersArray.map(async (trader: any) => {
      const traderId = trader.trader_id
      const deposit = trader.initial_balance || 0

      // Query SQLite for trader config + exchange info (with wallet and testnet)
      // Note: exchanges table has composite primary key (id, user_id), so we must join on both
      const query = `
        SELECT 
          t.id as trader_id,
          t.name as trader_name,
          t.trading_symbols,
          t.exchange_id,
          e.hyperliquid_wallet_addr,
          e.name as exchange_name,
          e.testnet
        FROM traders t
        LEFT JOIN exchanges e ON t.exchange_id = e.id AND t.user_id = e.user_id
        WHERE t.id = ? AND t.user_id = ?
      `

      const row = db!.prepare(query).get(traderId, userId) as any

      // Debug: Log the raw row to see what we're getting
      console.log(`🔍 [Enhanced API] Raw query result for ${traderId}:`, JSON.stringify(row, null, 2))
      console.log(`🔍 [Enhanced API] Trader from Go backend:`, JSON.stringify(trader, null, 2))
      
      if (!row) {
        console.warn(`⚠️ [Enhanced API] No row found for trader ${traderId} with user_id ${userId}`)
      } else {
        console.log(`🔍 [Enhanced API] Row columns:`, Object.keys(row))
        console.log(`🔍 [Enhanced API] t.exchange_id=${row.exchange_id}, trader.exchange_id=${trader.exchange_id}, e.testnet=${row.testnet}`)
      }

      // Parse trading symbols
      let assets: string[] = []
      if (row?.trading_symbols) {
        assets = row.trading_symbols
          .split(',')
          .map((s: string) => s.trim().replace('USDT', '').replace('USDC', ''))
          .filter((s: string) => s.length > 0)
      }

      // Get wallet address
      const walletAddress = row?.hyperliquid_wallet_addr || ''

      // Fetch PnL from Go backend
      let pnlString = '+$0.00'
      let pnlPercent = 0
      let totalActions = 0

      try {
        const accountResponse = await fetch(`${BACKEND_URL}/api/account?trader_id=${traderId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
        })

        if (accountResponse.ok) {
          const account = await accountResponse.json()
          const pnlValue = account.total_pnl || 0
          pnlString = pnlValue >= 0
            ? `+$${pnlValue.toFixed(2)}`
            : `-$${Math.abs(pnlValue).toFixed(2)}`
          pnlPercent = account.total_pnl_pct || 0
          totalActions = account.position_count || 0
        }
      } catch (err) {
        console.warn(`⚠️ [Enhanced API] Failed to fetch account for ${traderId}`)
      }

      // Fetch win rate from Go backend performance endpoint
      let winRate = 0
      try {
        const performanceResponse = await fetch(`${BACKEND_URL}/api/performance?trader_id=${traderId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
        })

        if (performanceResponse.ok) {
          const performance = await performanceResponse.json()
          winRate = performance.win_rate || 0
          console.log(`✅ [Enhanced API] Win rate for ${trader.trader_name}: ${winRate.toFixed(2)}%`)
        }
      } catch (err) {
        console.warn(`⚠️ [Enhanced API] Failed to fetch performance for ${traderId}`)
      }

      // Check if exchange exists for this user
      if (row && row.exchange_id && !row.testnet && row.testnet !== 0) {
        // Exchange JOIN failed - let's query it directly
        console.log(`⚠️ [Enhanced API] Exchange JOIN failed for ${traderId}, querying exchange directly...`)
        const exchangeQuery = db!.prepare('SELECT testnet, hyperliquid_wallet_addr, name FROM exchanges WHERE id = ? AND user_id = ?')
        const exchangeRow = exchangeQuery.get(row.exchange_id, userId) as any
        if (exchangeRow) {
          console.log(`✅ [Enhanced API] Found exchange directly: testnet=${exchangeRow.testnet}`)
          row.testnet = exchangeRow.testnet
          row.hyperliquid_wallet_addr = exchangeRow.hyperliquid_wallet_addr || row.hyperliquid_wallet_addr
          row.exchange_name = exchangeRow.name || row.exchange_name
        } else {
          console.warn(`⚠️ [Enhanced API] Exchange ${row.exchange_id} not found for user ${userId}`)
        }
      }

      // Determine testnet from exchange_id (hyperliquid-testnet = true, hyperliquid = false/mainnet)
      // Priority: row.exchange_id (from DB) > trader.exchange_id (from Go API) > default
      const exchangeId = row?.exchange_id || trader.exchange_id || 'hyperliquid'
      
      console.log(`🔍 [Enhanced API] Exchange ID sources for ${traderId}:`, {
        'row.exchange_id': row?.exchange_id,
        'trader.exchange_id': trader.exchange_id,
        'final exchangeId': exchangeId
      })
      
      // Explicitly check exchange_id first, then fallback to exchange.testnet
      let testnetValue: boolean
      if (exchangeId === 'hyperliquid-testnet') {
        testnetValue = true
        console.log(`✅ [Enhanced API] ${traderId}: Detected TESTNET from exchange_id='hyperliquid-testnet'`)
      } else {
        // hyperliquid (or any other ID) = mainnet (backward compatible)
        testnetValue = false
        console.log(`✅ [Enhanced API] ${traderId}: Detected MAINNET from exchange_id='${exchangeId}'`)
      }
      
      console.log(`🔍 [Enhanced API] Final result for ${traderId}: exchange_id=${exchangeId}, testnet=${testnetValue}`)
      
      return {
        id: traderId,
        name: trader.trader_name || 'Unnamed Trader',
        description: `${trader.ai_model || 'AI'} trading on ${row?.exchange_name || 'exchange'}`,
        icon: '🤖',
        status: trader.is_running === true ? 'active' : 'paused',
        totalActions,
        createdAt: new Date().toISOString(),
        deposit,
        assets,
        pnl: pnlString,
        pnlPercent,
        winRate,
        walletAddress,
        exchange_id: exchangeId, // Include exchange_id for wallet fetching
        testnet: testnetValue, // Include testnet flag (determined from exchange_id: hyperliquid-testnet = true, hyperliquid = false/mainnet)
      } as EnhancedAgent & { exchange_id: string; testnet: boolean }
    })

    const agents = await Promise.all(agentsPromises)

    // Calculate metrics
    const totalCapital = agents.reduce((sum, agent) => sum + agent.deposit, 0)
    const totalPnl = agents.reduce((sum, agent) => {
      const pnlValue = parseFloat(agent.pnl.replace(/[^0-9.-]/g, ''))
      return sum + pnlValue
    }, 0)
    const currentEquity = totalCapital + totalPnl
    const pnlPercent = totalCapital > 0 ? (totalPnl / totalCapital) * 100 : 0
    const activeCount = agents.filter(a => a.status === 'active').length

    console.log('✅ [Enhanced API] Enriched agents:', {
      total: agents.length,
      withWallet: agents.filter(a => a.walletAddress).length,
      withWinRate: agents.filter(a => a.winRate > 0).length,
    })

    return NextResponse.json({
      agents,
      totalCount: agents.length,
      activeCount,
      metrics: {
        totalCapital,
        totalPnl,
        currentEquity,
        pnlPercent,
      },
      lastUpdated: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ [Enhanced API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch traders',
        agents: [],
        totalCount: 0,
        activeCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    )
  } finally {
    // Close database connection
    if (db) {
      db.close()
      console.log('✅ [Enhanced API] SQLite database closed')
    }
  }
}

