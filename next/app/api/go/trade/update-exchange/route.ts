import { NextRequest, NextResponse } from 'next/server'
import { updateExchangeConfig } from '@/lib/go-crypto'

// Use GO_API_URL for server-side requests (Docker service name), fallback to NEXT_PUBLIC_API_URL for client-side
const BACKEND_URL = process.env.GO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function PUT(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { exchangeId, enabled, api_key, secret_key, testnet, hyperliquid_wallet_addr } = body

    if (!exchangeId) {
      return NextResponse.json(
        { error: 'exchangeId is required' },
        { status: 400 }
      )
    }

    // Auto-set testnet based on exchange ID: hyperliquid-testnet = true, hyperliquid = false
    // Ignore any testnet value from request body to prevent manual changes
    const autoTestnet = exchangeId === 'hyperliquid-testnet'
    console.log(`🔄 [API Route] Updating exchange: ${exchangeId} (testnet auto-set to: ${autoTestnet} based on ID)`)

    // Use the go-crypto helper to encrypt and send the update
    await updateExchangeConfig(authHeader, exchangeId, {
      enabled: enabled !== undefined ? enabled : true,
      api_key: api_key || '',
      secret_key: secret_key || '',
      testnet: autoTestnet, // Always auto-set based on exchange ID
      hyperliquid_wallet_addr: hyperliquid_wallet_addr || '',
    })

    console.log(`✅ [API Route] Exchange ${exchangeId} updated successfully`)

    return NextResponse.json({
      success: true,
      message: 'Exchange updated successfully',
    })

  } catch (error) {
    console.error('❌ [API Route] Failed to update exchange:', error)
    return NextResponse.json(
      {
        error: 'Failed to update exchange',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

