import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

// Use SQLITE_DB_PATH for Docker (e.g., /data/config.db), fallback to DATABASE_PATH, then default path
const DB_PATH = process.env.SQLITE_DB_PATH || process.env.DATABASE_PATH || path.join(process.cwd(), '..', 'config.db')

/**
 * Check if a trader is using testnet or mainnet
 * GET /api/go/trade/check-trader-network?trader_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const traderId = searchParams.get('trader_id')

    if (!traderId) {
      return NextResponse.json(
        { error: 'trader_id parameter is required' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Decode JWT to get user_id
    const token = authHeader.substring(7)
    let userId: string

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      userId = payload.user_id || payload.sub

      if (!userId) {
        throw new Error('No user_id in token')
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Open database connection
    const db = new Database(DB_PATH, { readonly: true, fileMustExist: true })

    // Query trader and exchange info
    const query = `
      SELECT 
        t.id as trader_id,
        t.name as trader_name,
        t.exchange_id,
        t.user_id,
        e.id as exchange_id_from_exchange,
        e.testnet,
        e.name as exchange_name,
        e.hyperliquid_wallet_addr
      FROM traders t
      LEFT JOIN exchanges e ON t.exchange_id = e.id AND t.user_id = e.user_id
      WHERE t.id = ? AND t.user_id = ?
    `

    const row = db.prepare(query).get(traderId, userId) as any

    db.close()

    if (!row) {
      return NextResponse.json(
        { error: 'Trader not found' },
        { status: 404 }
      )
    }

    const isTestnet = row.testnet === 1 || row.testnet === true

    return NextResponse.json({
      trader_id: row.trader_id,
      trader_name: row.trader_name,
      exchange_id: row.exchange_id,
      network: isTestnet ? 'testnet' : 'mainnet',
      testnet: isTestnet,
      exchange_name: row.exchange_name || 'Unknown',
      wallet_address: row.hyperliquid_wallet_addr || null,
      // Debug info
      raw_testnet_value: row.testnet,
      exchange_found: !!row.exchange_id_from_exchange,
    })

  } catch (error: any) {
    console.error('❌ [Check Network API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check trader network',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

