/**
 * Type definitions for Explorer page API responses
 * These types bridge the gap between Go backend APIs and the Explorer UI
 */

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export interface LeaderboardAgent {
  id: string                // trader_id
  name: string              // trader_name
  owner: string             // owner username or "Anonymous"
  icon: string              // emoji or avatar (derived from ai_model)
  pnl: number              // total_pnl (in USDT)
  pnlPercent: number       // total_pnl_pct
  trades: number           // total trade count (from statistics)
  winRate: number          // win rate percentage (from statistics)
  volume: number           // total trading volume (from statistics)
}

export interface LeaderboardResponse {
  agents: LeaderboardAgent[]
  totalCount: number
  lastUpdated: string      // ISO timestamp
  stats: {
    totalAgents: number
    totalVolume: number
    avgWinRate: string
    totalTrades: number
  }
}

export interface LeaderboardParams {
  limit?: number
  sortBy?: 'pnl' | 'trades' | 'winRate' | 'volume'
  minWinRate?: number
  minVolume?: number
}

// ============================================================================
// RUNNING AGENTS TYPES
// ============================================================================

export interface RunningAgent {
  id: string               // trader_id
  name: string             // trader_name
  description: string      // Generated from ai_model + exchange + strategy
  icon: string             // emoji based on ai_model
  status: "active" | "paused"  // from is_running
  deposit: number          // initial_balance from account
  pnl: number             // total_pnl
  pnlPercent: number      // total_pnl_pct
  trades: number          // position count or trade count
  model: string           // ai_model (e.g., "deepseek", "claude")
  exchange: string        // exchange name
}

export interface RunningAgentsResponse {
  agents: RunningAgent[]
  totalCount: number
  activeCount: number
  pausedCount: number
  lastUpdated: string
  stats: {
    totalAgents: number
    activeAgents: number
    totalCapital: number
    totalPnl: number
  }
}

export interface AgentsParams {
  limit?: number
  sortBy?: 'pnl' | 'deposit' | 'trades'
  status?: 'all' | 'active' | 'paused'
  minDeposit?: number
}

// ============================================================================
// ACTIVE POSITIONS TYPES
// ============================================================================

export interface ActivePosition {
  id: string                // generated: `${trader_id}-${symbol}`
  agentId: string          // trader_id
  agentName: string        // trader_name
  asset: string            // symbol without USDT (e.g., "BTC", "ETH")
  type: "Long" | "Short"   // from side
  leverage: string         // leverage as string (e.g., "10x")
  entryPrice: string       // formatted entry_price with $ and commas
  currentPrice: string     // formatted mark_price
  pnl: number             // unrealized_pnl
  pnlPercent: number      // unrealized_pnl_pct
}

export interface ActivePositionsResponse {
  positions: ActivePosition[]
  totalCount: number
  longCount: number
  shortCount: number
  totalPnl: number
  avgRoi: number
  lastUpdated: string
  stats: {
    totalPositions: number
    longPositions: number
    shortPositions: number
    totalPnl: number
    avgRoi: string
  }
}

export interface PositionsParams {
  limit?: number
  sortBy?: 'pnl' | 'pnlPercent'
  type?: 'all' | 'Long' | 'Short'
  pnl?: 'all' | 'profit' | 'loss'
}

// ============================================================================
// TEMPLATES TYPES (Future Feature)
// ============================================================================

export interface Template {
  id: string
  title: string
  description: string
  icon: string
  image?: string
  price: number
  rating: number
  usageCount: number
  agentsCreated: number
  category: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface TemplatesResponse {
  templates: Template[]
  totalCount: number
  categories: string[]
  lastUpdated: string
  stats: {
    totalTemplates: number
    avgRating: string
    totalUsers: number
    totalAgentsCreated: number
  }
}

export interface TemplatesParams {
  limit?: number
  sortBy?: 'rating' | 'usage' | 'price'
  category?: string
  minRating?: number
  maxPrice?: number
}

// ============================================================================
// BACKEND API TYPES (from Go backend)
// ============================================================================

export interface CompetitionTraderData {
  trader_id: string
  trader_name: string
  ai_model: string
  exchange: string
  total_equity: number
  total_pnl: number
  total_pnl_pct: number
  position_count: number
  margin_used_pct: number
  is_running: boolean
}

export interface CompetitionData {
  traders: CompetitionTraderData[]
  count: number
}

export interface TraderInfo {
  trader_id: string
  trader_name: string
  ai_model: string
  exchange_id?: string
  is_running?: boolean
  custom_prompt?: string
  use_coin_pool?: boolean
  use_oi_top?: boolean
}

export interface AccountInfo {
  total_equity: number
  wallet_balance: number
  unrealized_profit: number
  available_balance: number
  total_pnl: number
  total_pnl_pct: number
  total_unrealized_pnl: number
  initial_balance: number
  daily_pnl: number
  position_count: number
  margin_used: number
  margin_used_pct: number
}

export interface Position {
  symbol: string
  side: string
  entry_price: number
  mark_price: number
  quantity: number
  leverage: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  liquidation_price: number
  margin_used: number
}

export interface Statistics {
  total_cycles: number
  successful_cycles: number
  failed_cycles: number
  total_open_positions: number
  total_close_positions: number
  // Additional fields that might be needed:
  win_rate?: number
  total_volume?: number
  avg_trade_size?: number
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface APIError {
  error: string
  message?: string
  details?: any
  timestamp?: string
}

export interface APIMetadata {
  cached: boolean
  cacheAge?: number
  requestDuration?: number
}

// ============================================================================
// HELPER FUNCTIONS TYPES
// ============================================================================

export type ModelIconMapper = (model: string) => string
export type ExchangeNameMapper = (exchangeId: string) => string
export type PriceFormatter = (price: number) => string

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface ExplorerConfig {
  refreshIntervals: {
    leaderboard: number
    agents: number
    positions: number
    templates: number
  }
  limits: {
    maxTraders: number
    maxPositions: number
    maxTemplates: number
  }
  cache: {
    ttl: number
    staleWhileRevalidate: number
  }
}

export const DEFAULT_EXPLORER_CONFIG: ExplorerConfig = {
  refreshIntervals: {
    leaderboard: 30000,  // 30 seconds
    agents: 15000,       // 15 seconds
    positions: 10000,    // 10 seconds
    templates: 300000,   // 5 minutes
  },
  limits: {
    maxTraders: 100,
    maxPositions: 100,
    maxTemplates: 50,
  },
  cache: {
    ttl: 30,
    staleWhileRevalidate: 60,
  },
}

// ============================================================================
// API CLIENT INTERFACE
// ============================================================================

export interface ExplorerAPI {
  getLeaderboard: (params?: LeaderboardParams) => Promise<LeaderboardResponse>
  getAgents: (params?: AgentsParams) => Promise<RunningAgentsResponse>
  getPositions: (params?: PositionsParams) => Promise<ActivePositionsResponse>
  getTemplates: (params?: TemplatesParams) => Promise<TemplatesResponse>
}

