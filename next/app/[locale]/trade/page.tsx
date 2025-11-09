"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import MarketplaceHeader from '@/components/marketplace-header'
import { Plus, ChevronRight, ChevronLeft, Loader2, TrendingUp, Wallet, Settings, Trash2, Activity, DollarSign, Check, FileText, Star, Users, Bot, ShoppingCart, ArrowUpRight, ArrowDownRight, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/authenticated-fetch"
import { marketplaceTemplates } from "@/lib/agent-templates"
import Image from 'next/image'

// Type for agent
interface Agent {
  id: string
  name: string
  description: string
  icon?: string
  status?: "active" | "paused"
  totalActions?: number
  createdAt: Date
  templateId?: string
  deposit?: number
  assets?: string[]
  pnl?: string
  pnlPercent?: number
}

// Type for position
interface Position {
  id: string
  symbol: string
  type: "long" | "short"
  leverage: number
  entryPrice: number
  currentPrice: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  pnl: number
  pnlPercent: number
  status: "open" | "closed" | "liquidated"
  source: "agent" | "market"
  agentId?: string
  marketPrice?: number
  marketDiscount?: number
  createdAt: Date
}

// Crypto assets
const cryptoAssets = [
  { id: "BTC", name: "Bitcoin", symbol: "₿" },
  { id: "ETH", name: "Ethereum", symbol: "Ξ" },
  { id: "SOL", name: "Solana", symbol: "◎" },
  { id: "MATIC", name: "Polygon", symbol: "⬡" },
  { id: "BNB", name: "BNB", symbol: "⬡" },
  { id: "ADA", name: "Cardano", symbol: "₳" },
  { id: "DOT", name: "Polkadot", symbol: "●" },
  { id: "AVAX", name: "Avalanche", symbol: "▲" },
  { id: "LINK", name: "Chainlink", symbol: "⬢" },
  { id: "UNI", name: "Uniswap", symbol: "🦄" },
]

export default function TradePage() {
  const t = useTranslations('tradePage')
  const locale = useLocale()
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const [agents, setAgents] = useState<Agent[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create agent modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  // Templates modal state
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [purchasedTemplates, setPurchasedTemplates] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // Form data
  const [agentName, setAgentName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [customPrompt, setCustomPrompt] = useState("")
  const [useTemplate, setUseTemplate] = useState(true)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [deposit, setDeposit] = useState("")

  const totalSteps = 4

  // Fetch agents and positions
  useEffect(() => {
    const fetchData = async () => {
      if (isPending) return

      if (!session) {
        setIsLoading(false)
        router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/trade`)}`)
        return
      }

      try {
        setIsLoading(true)

        // Fetch agents
        const agentsResponse = await api.get<{ agents: any[]; count: number }>('/api/agent', {
          requireAuth: true,
        })

        const mappedAgents: Agent[] = agentsResponse.agents.map((summary: any) => {
          const dbAgent = summary.agent
          return {
            id: dbAgent.id,
            name: dbAgent.name || dbAgent.title || 'Unnamed Agent',
            description: dbAgent.description || 'No description',
            icon: '🤖',
            status: 'active' as const,
            totalActions: summary.totalSteps || 0,
            createdAt: new Date(dbAgent.createdAt || Date.now()),
            templateId: dbAgent.templateId,
            deposit: 1000 + Math.random() * 9000, // Mock data
            assets: ['BTC', 'ETH'], // Mock data
            pnl: '+$234.50', // Mock data
            pnlPercent: 2.5 + Math.random() * 10, // Mock data
          }
        })

        setAgents(mappedAgents)

        // Fetch positions
        const positionsResponse = await api.get<{ positions: any[]; count: number }>('/api/positions', {
          requireAuth: true,
        })

        const mappedPositions: Position[] = positionsResponse.positions.map((pos: any) => ({
          id: pos.id,
          symbol: pos.symbol,
          type: pos.type,
          leverage: pos.leverage,
          entryPrice: pos.entryPrice,
          currentPrice: pos.currentPrice,
          quantity: pos.quantity,
          stopLoss: pos.stopLoss,
          takeProfit: pos.takeProfit,
          pnl: pos.pnl,
          pnlPercent: pos.pnlPercent,
          status: pos.status,
          source: pos.source,
          agentId: pos.agentId,
          marketPrice: pos.marketPrice,
          marketDiscount: pos.marketDiscount,
          createdAt: new Date(pos.createdAt),
        }))

        setPositions(mappedPositions)
        setError(null)
      } catch (err: any) {
        console.error('❌ Error fetching data:', err)
        setError(err.message || 'Failed to load data')

        if (err.message?.includes('log in') || err.message?.includes('Authentication')) {
          router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/trade`)}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, isPending, router, locale])

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm(t('confirmDelete'))) return

    try {
      await api.delete(`/api/agent/${agentId}`)
      setAgents(agents.filter(a => a.id !== agentId))
    } catch (err: any) {
      console.error('❌ Failed to delete agent:', err)
      alert('Failed to delete agent. Please try again.')
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setAgentName("")
    setSelectedTemplate(null)
    setCustomPrompt("")
    setUseTemplate(true)
    setSelectedAssets([])
    setDeposit("")
  }

  const handleCreateAgent = async () => {
    if (!session) return

    setIsCreating(true)
    try {
      let response

      if (useTemplate && selectedTemplate) {
        // Create from template
        response = await api.post('/api/agent/from-template', {
          templateId: selectedTemplate.id,
          title: selectedTemplate.title,
          name: agentName,
          description: selectedTemplate.description,
        })
      } else {
        // Create from custom prompt (using the AI agent builder)
        response = await api.post('/api/agent/create', {
          agentName: agentName,
          agentDescription: customPrompt,
          connections: [],
        })
      }

      console.log('✅ Agent created:', response)

      // Refresh agents list
      const updatedResponse = await api.get<{ agents: any[]; count: number }>('/api/agent', {
        requireAuth: true,
      })

      const mappedAgents: Agent[] = updatedResponse.agents.map((summary: any) => {
        const dbAgent = summary.agent
        return {
          id: dbAgent.id,
          name: dbAgent.name || dbAgent.title || 'Unnamed Agent',
          description: dbAgent.description || 'No description',
          icon: '🤖',
          status: 'active' as const,
          totalActions: summary.totalSteps || 0,
          createdAt: new Date(dbAgent.createdAt || Date.now()),
          templateId: dbAgent.templateId,
          deposit: parseFloat(deposit) || 0,
          assets: selectedAssets,
          pnl: '$0.00',
          pnlPercent: 0,
        }
      })

      setAgents(mappedAgents)
      setIsCreateModalOpen(false)
      resetForm()
    } catch (err: any) {
      console.error('❌ Failed to create agent:', err)
      alert('Failed to create agent. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return agentName.trim().length > 0
      case 2:
        return useTemplate ? selectedTemplate !== null : customPrompt.trim().length > 0
      case 3:
        return selectedAssets.length > 0
      case 4:
        return deposit.trim().length > 0 && parseFloat(deposit) > 0
      default:
        return false
    }
  }

  const fetchPurchasedTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      // For now, showing all trading templates as "purchased"
      // In production, this would fetch from an API endpoint that returns user's purchased templates
      const tradingTemplates = marketplaceTemplates.filter(t => t.category === 'trading' || t.id === 'trading-bot')
      setPurchasedTemplates(tradingTemplates)
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleTemplatesClick = () => {
    setIsTemplatesModalOpen(true)
    fetchPurchasedTemplates()
  }

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template)
    setUseTemplate(true)
    setIsTemplatesModalOpen(false)
    setIsCreateModalOpen(true)
    setCurrentStep(2)
  }

  // Show loading state
  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // If no session, don't render
  if (!session) return null

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      {/* Sticky Header */}
      <MarketplaceHeader locale={locale} activeTab="trade" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-3 tracking-tight">
              {t('title')} <span className="font-semibold instrument">{t('titleHighlight')}</span>
            </h1>
            <p className="text-xs md:text-sm text-white/60 max-w-2xl mx-auto mb-6 px-4">
              {t('description')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={handleTemplatesClick}
                className="bg-white/[0.03] text-white hover:bg-white/[0.05] border border-white/[0.08] gap-2 backdrop-blur-sm h-9 px-4 text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('templates')}
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-black hover:bg-white/90 gap-2 shadow-lg h-9 px-4 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('createAgent')}
              </Button>
            </div>
          </div>

          {/* Account Equity Dashboard */}
          {agents.length > 0 && (() => {
            const totalCapital = agents.reduce((sum, a) => sum + (a.deposit || 0), 0)
            const totalPnl = agents.reduce((sum, a) => sum + parseFloat(a.pnl || '0'), 0)

            // Use mock data if no real capital exists
            const useMockData = totalCapital === 0
            const baseCapital = useMockData ? 10000 : totalCapital
            const basePnl = useMockData ? 827 : totalPnl

            const currentEquity = baseCapital + basePnl
            const pnlPercent = baseCapital > 0 ? (basePnl / baseCapital) * 100 : 0
            const isPositive = basePnl >= 0

            // Generate equity curve data
            const generateEquityCurve = () => {
              const points = 60
              const data: { time: number; value: number }[] = []
              let currentValue = baseCapital
              const now = Date.now()
              const interval = (4 * 60 * 60 * 1000) / points // 4 hours spread

              for (let i = 0; i < points; i++) {
                const progress = i / points
                const targetChange = basePnl * progress
                const volatility = useMockData ? 150 : (baseCapital * 0.02)
                const noise = (Math.random() - 0.5) * volatility
                currentValue = baseCapital + targetChange + noise

                data.push({
                  time: now - (points - i) * interval,
                  value: Math.max(currentValue, baseCapital * 0.85)
                })
              }

              return data
            }

            const equityData = generateEquityCurve()
            const values = equityData.map(d => d.value).filter(v => !isNaN(v) && isFinite(v))
            const maxValue = values.length > 0 ? Math.max(...values, baseCapital) : baseCapital * 1.1
            const minValue = values.length > 0 ? Math.min(...values, baseCapital) : baseCapital * 0.9
            const range = Math.max(maxValue - minValue, 1) // Ensure range is always positive

            // Safe y-coordinate calculator
            const getY = (value: number) => {
              const y = 250 - ((value - minValue) / range) * 250
              return isNaN(y) || !isFinite(y) ? 125 : Math.max(0, Math.min(250, y))
            }

            return (
              <div className="max-w-7xl mx-auto">
                {/* Main Equity Card */}
                <div className="p-4 md:p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl mb-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Account Equity Curve</h2>
                      <div className="flex items-baseline gap-3 mb-2">
                        <div className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                          {currentEquity.toFixed(2)}
                          <span className="text-xl text-white/40 ml-2">USD</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold",
                          isPositive
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                          <TrendingUp className={cn("w-4 h-4", !isPositive && "rotate-180")} />
                          {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </div>
                        <span className="text-sm text-white/40">
                          ({isPositive ? '+' : ''}{basePnl.toFixed(2)} USD)
                        </span>
                      </div>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-yellow-500/30 transition-all">
                        <DollarSign className="w-3 h-3" />
                        USD
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/60 text-xs font-semibold hover:bg-white/[0.05] transition-all">
                        <Activity className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Equity Curve Chart */}
                  <div className="relative h-64 mb-6">
                    <svg className="w-full h-full" viewBox="0 0 1000 250" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <line x1="0" y1="62.5" x2="1000" y2="62.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="125" x2="1000" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="0" y1="187.5" x2="1000" y2="187.5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                      {/* Initial balance reference line */}
                      <line
                        x1="0"
                        y1={getY(baseCapital)}
                        x2="1000"
                        y2={getY(baseCapital)}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text
                        x="950"
                        y={getY(baseCapital) - 5}
                        fill="rgba(255,255,255,0.4)"
                        fontSize="10"
                        textAnchor="end"
                      >
                        Initial
                      </text>

                      {/* Equity curve */}
                      {(() => {
                        const points = equityData.map((point, i) => {
                          const x = (i / (equityData.length - 1)) * 1000
                          const y = getY(point.value)
                          return `${x},${y}`
                        }).join(' ')

                        const areaPoints = `0,250 ${points} 1000,250`

                        return (
                          <>
                            <defs>
                              <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={isPositive ? "rgb(234, 179, 8)" : "rgb(239, 68, 68)"} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={isPositive ? "rgb(234, 179, 8)" : "rgb(239, 68, 68)"} stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <polygon points={areaPoints} fill="url(#equityGradient)" />
                            <polyline
                              points={points}
                              fill="none"
                              stroke={isPositive ? "rgb(234, 179, 8)" : "rgb(239, 68, 68)"}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        )
                      })()}
                    </svg>

                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 text-[10px] text-white/30 tabular-nums">
                      <span>${maxValue.toFixed(0)}</span>
                      <span>${((maxValue + minValue) / 2).toFixed(0)}</span>
                      <span>${minValue.toFixed(0)}</span>
                    </div>

                    {/* X-axis time labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 text-[10px] text-white/30 tabular-nums">
                      {[0, 15, 30, 45, 60].map(i => {
                        const time = new Date(equityData[Math.floor((i / 60) * (equityData.length - 1))]?.time || Date.now())
                        return (
                          <span key={i}>
                            {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bottom Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-6 border-t border-white/[0.06]">
                    <div className="p-3 rounded-lg bg-white/[0.02]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Initial Balance</div>
                      <div className="text-lg font-bold text-white tabular-nums">{baseCapital.toFixed(2)} <span className="text-xs text-white/40">USD</span></div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Current Equity</div>
                      <div className="text-lg font-bold text-white tabular-nums">{currentEquity.toFixed(2)} <span className="text-xs text-white/40">USD</span></div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Active Agents</div>
                      <div className="text-lg font-bold text-green-400 tabular-nums">{agents.filter(a => a.status === 'active').length} <span className="text-xs text-white/40">/ {agents.length}</span></div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Display Range</div>
                      <div className="text-lg font-bold text-white">Last 4H</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Agents Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{t('yourAgents')}</h2>
            {agents.length > 0 && (
              <div className="text-xs text-white/40">
                {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
              </div>
            )}
          </div>

          {error && (
            <div className="p-6 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {agents.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('noAgents')}</h3>
              <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">{t('noAgentsDescription')}</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-black hover:bg-white/90 gap-2 shadow-lg h-9 px-4 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('createFirstAgent')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 cursor-pointer group backdrop-blur-sm overflow-hidden"
                  onClick={() => router.push(`/${locale}/agent/${agent.id}`)}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{agent.icon}</div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white hover:bg-white/[0.05]"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 hover:bg-white/[0.05]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAgent(agent.id)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">{agent.name}</h3>
                        <p className="text-xs text-white/50 line-clamp-2">{agent.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1",
                          agent.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        )}>
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            agent.status === "active" ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                          )}></div>
                          {agent.status === "active" ? t('statusActive') : t('statusPaused')}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40 flex items-center gap-1.5">
                            <Wallet className="w-3 h-3" />
                            {t('deposit')}
                          </span>
                          <span className="font-semibold text-white tabular-nums">${agent.deposit?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40 flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" />
                            {t('pnl')}
                          </span>
                          <div className="text-right">
                            <div className={cn(
                              "font-semibold tabular-nums",
                              (agent.pnlPercent || 0) >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {agent.pnl}
                            </div>
                            <div className={cn(
                              "text-[10px] tabular-nums",
                              (agent.pnlPercent || 0) >= 0 ? "text-green-400/70" : "text-red-400/70"
                            )}>
                              {(agent.pnlPercent || 0) >= 0 ? '+' : ''}{(agent.pnlPercent || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" />
                            {t('assets')}
                          </span>
                          <span className="font-medium text-white text-[10px]">{agent.assets?.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <ChevronRight className="absolute right-3 bottom-3 w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Positions Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Your Positions</h2>
            {positions.length > 0 && (
              <div className="text-xs text-white/40">
                {positions.filter(p => p.status === 'open').length} open / {positions.length} total
              </div>
            )}
          </div>

          {positions.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Positions Yet</h3>
              <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
                Your trading positions will appear here. Create an agent to start trading or purchase positions from the marketplace.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={() => router.push(`/${locale}/marketplace`)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Button>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((position) => {
                const isPositive = position.pnl >= 0
                const isLong = position.type === 'long'

                return (
                  <div
                    key={position.id}
                    className={cn(
                      "relative p-5 rounded-xl border hover:border-white/[0.15] transition-all duration-300 backdrop-blur-sm overflow-hidden group",
                      position.status === 'open'
                        ? "bg-white/[0.02] border-white/[0.08]"
                        : "bg-white/[0.01] border-white/[0.05] opacity-60"
                    )}
                  >
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white">{position.symbol}</h3>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1",
                              isLong
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            )}>
                              {isLong ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {position.leverage}x {position.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Source Indicator */}
                            {position.source === 'agent' ? (
                              <span className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                                <Bot className="w-3 h-3" />
                                AI Agent
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                                <ShoppingCart className="w-3 h-3" />
                                Marketplace
                                {position.marketDiscount && (
                                  <span className="text-yellow-400">-{position.marketDiscount}%</span>
                                )}
                              </span>
                            )}
                            {/* Status Badge */}
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                              position.status === "open"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : position.status === "liquidated"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            )}>
                              {position.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* PnL Display */}
                      <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="text-xs text-white/40 mb-1">Unrealized PnL</div>
                        <div className="flex items-baseline gap-2">
                          <div className={cn(
                            "text-2xl font-bold tabular-nums",
                            isPositive ? "text-green-400" : "text-red-400"
                          )}>
                            {isPositive ? '+' : ''}${position.pnl.toFixed(2)}
                          </div>
                          <div className={cn(
                            "text-sm font-semibold tabular-nums",
                            isPositive ? "text-green-400/70" : "text-red-400/70"
                          )}>
                            ({isPositive ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>

                      {/* Position Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Entry Price</span>
                          <span className="font-semibold text-white tabular-nums">${position.entryPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Current Price</span>
                          <span className="font-semibold text-white tabular-nums">${position.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">Quantity</span>
                          <span className="font-semibold text-white tabular-nums">{position.quantity.toFixed(4)}</span>
                        </div>
                        {position.stopLoss && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Stop Loss
                            </span>
                            <span className="font-semibold text-red-400 tabular-nums">${position.stopLoss.toFixed(2)}</span>
                          </div>
                        )}
                        {position.takeProfit && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Take Profit
                            </span>
                            <span className="font-semibold text-green-400 tabular-nums">${position.takeProfit.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Agent Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        setIsCreateModalOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('createNewAgent')}</DialogTitle>
            <DialogDescription>
              {t('createAgentDescription')}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  currentStep >= step
                    ? "bg-black text-white"
                    : "bg-black/10 text-black/40"
                )}>
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={cn(
                    "flex-1 h-1 mx-2 transition-all",
                    currentStep > step ? "bg-black" : "bg-black/10"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {/* Step 1: Agent Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('step1Title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('step1Description')}</p>
                </div>
                <Input
                  placeholder={t('agentNamePlaceholder')}
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="text-lg p-6"
                />
              </div>
            )}

            {/* Step 2: Template or Prompt */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('step2Title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('step2Description')}</p>
                </div>

                {/* Toggle between template and custom */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={useTemplate ? "default" : "outline"}
                    onClick={() => setUseTemplate(true)}
                    className="flex-1"
                  >
                    {t('useTemplate')}
                  </Button>
                  <Button
                    variant={!useTemplate ? "default" : "outline"}
                    onClick={() => setUseTemplate(false)}
                    className="flex-1"
                  >
                    {t('customPrompt')}
                  </Button>
                </div>

                {useTemplate ? (
                  <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    {marketplaceTemplates.filter(t => t.category === 'trading' || t.id === 'trading-bot').map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all",
                          selectedTemplate?.id === template.id
                            ? "border-2 border-black bg-black/5"
                            : "border border-black/10 hover:border-black/30"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start gap-3">
                          {template.image ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center">
                              <Image
                                src={template.image}
                                alt={template.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="text-3xl">{template.icon}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 truncate">{template.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                            {template.price > 0 && (
                              <div className="text-xs font-medium text-black mt-2">${template.price}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    placeholder={t('customPromptPlaceholder')}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full h-48 p-4 rounded-lg border-2 border-black/10 focus:border-black/30 transition-all outline-none resize-none"
                  />
                )}
              </div>
            )}

            {/* Step 3: Assets */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('step3Title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('step3Description')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {cryptoAssets.map((asset) => {
                    const isSelected = selectedAssets.includes(asset.id)
                    return (
                      <div
                        key={asset.id}
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all",
                          isSelected
                            ? "border-2 border-black bg-black text-white"
                            : "border border-black/10 hover:border-black/30"
                        )}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAssets(selectedAssets.filter(id => id !== asset.id))
                          } else {
                            setSelectedAssets([...selectedAssets, asset.id])
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{asset.symbol}</span>
                          <div>
                            <div className="font-medium">{asset.id}</div>
                            <div className={cn(
                              "text-xs",
                              isSelected ? "text-white/70" : "text-black/50"
                            )}>
                              {asset.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Deposit */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('step4Title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('step4Description')}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                    <Input
                      type="number"
                      placeholder="1000"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="text-lg p-6 pl-12"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setDeposit(amount.toString())}
                        className="text-sm"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-6 rounded-xl bg-black/5 border border-black/10">
                    <h4 className="font-semibold mb-3">{t('summary')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-black/60">{t('agentName')}:</span>
                        <span className="font-medium">{agentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/60">{t('template')}:</span>
                        <span className="font-medium">
                          {useTemplate ? selectedTemplate?.title : t('customStrategy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/60">{t('assets')}:</span>
                        <span className="font-medium">{selectedAssets.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/60">{t('initialDeposit')}:</span>
                        <span className="font-medium">${deposit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('previous')}
            </Button>

            <div className="text-sm text-muted-foreground">
              {t('stepIndicator', { current: currentStep, total: totalSteps })}
            </div>

            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2 bg-black text-white hover:bg-black/90"
              >
                {t('next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateAgent}
                disabled={!canProceed() || isCreating}
                className="gap-2 bg-black text-white hover:bg-black/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t('createAgent')}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Modal */}
      <Dialog open={isTemplatesModalOpen} onOpenChange={setIsTemplatesModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">{t('purchasedTemplates')}</DialogTitle>
            <DialogDescription className="text-white/60">
              {t('purchasedTemplatesDescription')}
            </DialogDescription>
          </DialogHeader>

          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            </div>
          ) : purchasedTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('noTemplates')}</h3>
              <p className="text-white/60 mb-6">{t('noTemplatesDescription')}</p>
              <Button
                onClick={() => {
                  setIsTemplatesModalOpen(false)
                  router.push(`/${locale}/marketplace`)
                }}
                className="bg-white text-black hover:bg-white/90"
              >
                {t('browseMarketplace')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {/* Template Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {template.image ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={template.image}
                          alt={template.title}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                        {template.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 line-clamp-1">
                        {template.title}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Template Stats */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{template.rating || '4.8'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{template.usageCount || '1.2k'}</span>
                    </div>
                    {template.price > 0 && (
                      <div className="ml-auto text-white/70 font-medium">
                        ${template.price}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70 border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full bg-white text-black hover:bg-white/90 transition-all"
                    size="sm"
                  >
                    {t('useTemplate')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

