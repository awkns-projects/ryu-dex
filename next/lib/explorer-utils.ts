/**
 * Utility functions for Explorer API data transformations
 */

import type {
  CompetitionTraderData,
  LeaderboardAgent,
  TraderInfo,
  AccountInfo,
  RunningAgent,
  Position,
  ActivePosition,
} from './explorer-types'

// ============================================================================
// ICON MAPPING
// ============================================================================

/**
 * Get emoji icon based on AI model name
 */
export function getModelIcon(model: string): string {
  const lowerModel = model.toLowerCase()

  if (lowerModel.includes('deepseek')) return '🤖'
  if (lowerModel.includes('claude')) return '🧠'
  if (lowerModel.includes('gpt') || lowerModel.includes('openai')) return '✨'
  if (lowerModel.includes('qwen')) return '🔮'
  if (lowerModel.includes('gemini')) return '💎'
  if (lowerModel.includes('llama')) return '🦙'

  return '🎯' // default
}

/**
 * Get exchange display name
 */
export function getExchangeName(exchangeId: string): string {
  const names: Record<string, string> = {
    'binance': 'Binance',
    'hyperliquid': 'Hyperliquid',
    'aster': 'Aster',
    'okx': 'OKX',
    'bybit': 'Bybit',
  }
  return names[exchangeId.toLowerCase()] || exchangeId
}

/**
 * Get model display name
 */
export function getModelDisplayName(model: string): string {
  const lowerModel = model.toLowerCase()

  if (lowerModel.includes('deepseek')) return 'DeepSeek'
  if (lowerModel.includes('claude')) return 'Claude'
  if (lowerModel.includes('gpt')) return 'GPT'
  if (lowerModel.includes('qwen')) return 'Qwen'
  if (lowerModel.includes('gemini')) return 'Gemini'

  return model
}

// ============================================================================
// PRICE FORMATTING
// ============================================================================

/**
 * Format price with $ and commas
 */
export function formatPrice(price: number): string {
  if (price < 1) {
    // For prices less than $1, show 4 decimal places
    return `$${price.toFixed(4)}`
  } else if (price < 100) {
    // For prices $1-$100, show 2 decimal places
    return `$${price.toFixed(2)}`
  } else {
    // For prices over $100, show with commas and 2 decimals
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

/**
 * Format large numbers (for volume, etc)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toFixed(0)
}

/**
 * Format percentage
 */
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

// ============================================================================
// ASSET NAME EXTRACTION
// ============================================================================

/**
 * Extract asset name from trading symbol
 * e.g., "BTCUSDT" -> "BTC", "ETHUSDT-PERP" -> "ETH"
 */
export function extractAssetName(symbol: string): string {
  return symbol
    .replace('USDT', '')
    .replace('PERP', '')
    .replace('USDC', '')
    .replace('-', '')
    .replace('_', '')
    .trim()
}

/**
 * Get asset emoji
 */
export function getAssetIcon(asset: string): string {
  const icons: Record<string, string> = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'SOL': '◎',
    'BNB': '💰',
    'ADA': '♦',
    'MATIC': '⬡',
    'AVAX': '▲',
  }
  return icons[asset.toUpperCase()] || '🪙'
}

// ============================================================================
// DATA TRANSFORMATIONS
// ============================================================================

/**
 * Transform competition trader to leaderboard agent
 */
export function transformToLeaderboardAgent(
  trader: CompetitionTraderData,
  stats?: { trades?: number; winRate?: number; volume?: number }
): LeaderboardAgent {
  return {
    id: trader.trader_id,
    name: trader.trader_name,
    owner: 'User', // TODO: Get from backend
    icon: getModelIcon(trader.ai_model),
    pnl: trader.total_pnl,
    pnlPercent: trader.total_pnl_pct,
    trades: stats?.trades || trader.position_count || 0,
    winRate: stats?.winRate || 0,
    volume: stats?.volume || (trader.total_equity * 10), // Estimate
  }
}

/**
 * Transform trader info + account to running agent
 */
export function transformToRunningAgent(
  trader: TraderInfo,
  account?: AccountInfo
): RunningAgent {
  const modelName = getModelDisplayName(trader.ai_model)
  const exchangeName = getExchangeName(trader.exchange_id || 'unknown')

  return {
    id: trader.trader_id,
    name: trader.trader_name,
    description: `${modelName} trading on ${exchangeName}`,
    icon: getModelIcon(trader.ai_model),
    status: trader.is_running ? 'active' : 'paused',
    deposit: account?.initial_balance || 0,
    pnl: account?.total_pnl || 0,
    pnlPercent: account?.total_pnl_pct || 0,
    trades: account?.position_count || 0,
    model: modelName,
    exchange: exchangeName,
  }
}

/**
 * Transform position to active position
 */
export function transformToActivePosition(
  position: Position,
  traderId: string,
  traderName: string
): ActivePosition {
  const asset = extractAssetName(position.symbol)
  const side = position.side.toUpperCase()

  return {
    id: `${traderId}-${position.symbol}`,
    agentId: traderId,
    agentName: traderName,
    asset: asset,
    type: side === 'BUY' || side === 'LONG' ? 'Long' : 'Short',
    leverage: `${position.leverage}x`,
    entryPrice: formatPrice(position.entry_price),
    currentPrice: formatPrice(position.mark_price),
    pnl: position.unrealized_pnl,
    pnlPercent: position.unrealized_pnl_pct,
  }
}

// ============================================================================
// SORTING & FILTERING
// ============================================================================

/**
 * Sort leaderboard agents
 */
export function sortLeaderboardAgents(
  agents: LeaderboardAgent[],
  sortBy: 'pnl' | 'trades' | 'winRate' | 'volume' = 'pnl'
): LeaderboardAgent[] {
  return [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'pnl':
        return b.pnl - a.pnl
      case 'trades':
        return b.trades - a.trades
      case 'winRate':
        return b.winRate - a.winRate
      case 'volume':
        return b.volume - a.volume
      default:
        return b.pnl - a.pnl
    }
  })
}

/**
 * Sort running agents
 */
export function sortRunningAgents(
  agents: RunningAgent[],
  sortBy: 'pnl' | 'deposit' | 'trades' = 'pnl'
): RunningAgent[] {
  return [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'pnl':
        return b.pnl - a.pnl
      case 'deposit':
        return b.deposit - a.deposit
      case 'trades':
        return b.trades - a.trades
      default:
        return b.pnl - a.pnl
    }
  })
}

/**
 * Sort active positions
 */
export function sortActivePositions(
  positions: ActivePosition[],
  sortBy: 'pnl' | 'pnlPercent' = 'pnlPercent'
): ActivePosition[] {
  return [...positions].sort((a, b) => {
    switch (sortBy) {
      case 'pnl':
        return b.pnl - a.pnl
      case 'pnlPercent':
        return b.pnlPercent - a.pnlPercent
      default:
        return b.pnlPercent - a.pnlPercent
    }
  })
}

/**
 * Filter leaderboard agents
 */
export function filterLeaderboardAgents(
  agents: LeaderboardAgent[],
  filters: { minWinRate?: number; minVolume?: number }
): LeaderboardAgent[] {
  let filtered = agents

  if (filters.minWinRate) {
    filtered = filtered.filter(a => a.winRate >= filters.minWinRate!)
  }

  if (filters.minVolume) {
    filtered = filtered.filter(a => a.volume >= filters.minVolume!)
  }

  return filtered
}

/**
 * Filter running agents
 */
export function filterRunningAgents(
  agents: RunningAgent[],
  filters: { status?: 'all' | 'active' | 'paused'; minDeposit?: number }
): RunningAgent[] {
  let filtered = agents

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(a => a.status === filters.status)
  }

  if (filters.minDeposit) {
    filtered = filtered.filter(a => a.deposit >= filters.minDeposit!)
  }

  return filtered
}

/**
 * Filter active positions
 */
export function filterActivePositions(
  positions: ActivePosition[],
  filters: { type?: 'all' | 'Long' | 'Short'; pnl?: 'all' | 'profit' | 'loss' }
): ActivePosition[] {
  let filtered = positions

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(p => p.type === filters.type)
  }

  if (filters.pnl === 'profit') {
    filtered = filtered.filter(p => p.pnl > 0)
  } else if (filters.pnl === 'loss') {
    filtered = filtered.filter(p => p.pnl < 0)
  }

  return filtered
}

// ============================================================================
// STATISTICS CALCULATION
// ============================================================================

/**
 * Calculate leaderboard statistics
 */
export function calculateLeaderboardStats(agents: LeaderboardAgent[]) {
  if (agents.length === 0) {
    return {
      totalAgents: 0,
      totalVolume: 0,
      avgWinRate: '0.0',
      totalTrades: 0,
    }
  }

  return {
    totalAgents: agents.length,
    totalVolume: agents.reduce((sum, a) => sum + a.volume, 0),
    avgWinRate: (agents.reduce((sum, a) => sum + a.winRate, 0) / agents.length).toFixed(1),
    totalTrades: agents.reduce((sum, a) => sum + a.trades, 0),
  }
}

/**
 * Calculate running agents statistics
 */
export function calculateAgentsStats(agents: RunningAgent[]) {
  if (agents.length === 0) {
    return {
      totalAgents: 0,
      activeAgents: 0,
      totalCapital: 0,
      totalPnl: 0,
    }
  }

  return {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalCapital: agents.reduce((sum, a) => sum + a.deposit, 0),
    totalPnl: agents.reduce((sum, a) => sum + a.pnl, 0),
  }
}

/**
 * Calculate positions statistics
 */
export function calculatePositionsStats(positions: ActivePosition[]) {
  if (positions.length === 0) {
    return {
      totalPositions: 0,
      longPositions: 0,
      shortPositions: 0,
      totalPnl: 0,
      avgRoi: '0.00',
    }
  }

  const longCount = positions.filter(p => p.type === 'Long').length
  const shortCount = positions.filter(p => p.type === 'Short').length
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0)
  const avgRoi = positions.reduce((sum, p) => sum + p.pnlPercent, 0) / positions.length

  return {
    totalPositions: positions.length,
    longPositions: longCount,
    shortPositions: shortCount,
    totalPnl: totalPnl,
    avgRoi: avgRoi.toFixed(2),
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Create error response
 */
export function createErrorResponse(error: any, context?: string) {
  console.error(`Explorer API error ${context ? `(${context})` : ''}:`, error)

  return {
    error: 'Internal server error',
    message: error?.message || 'Unknown error occurred',
    details: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Safe fetch with timeout
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 5000
): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    return null
  }
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Paginate array
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 50
): T[] {
  const start = (page - 1) * limit
  const end = start + limit
  return items.slice(start, end)
}

/**
 * Get pagination metadata
 */
export function getPaginationMeta(
  totalItems: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

/**
 * Create cache key
 */
export function createCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params) return prefix
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  return `${prefix}:${sortedParams}`
}

/**
 * Get cache control header
 */
export function getCacheControlHeader(maxAge: number = 30, swr: number = 60): string {
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
}

