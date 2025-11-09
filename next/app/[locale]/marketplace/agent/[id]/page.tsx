"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import MarketplaceHeader from '@/components/marketplace-header'

type Agent = {
  id: string
  name: string
  description: string
  price: number
  rating: number
  users: number
  icon: string
  category: string
  tags: string[]
  longDescription: string
  features: string[]
  requirements: string[]
  changelog: { version: string; date: string; changes: string[] }[]
}

const AGENTS: Record<string, Agent> = {
  "momentum-master": {
    id: "momentum-master",
    name: "Momentum Master",
    description: "High-frequency trading strategy using advanced momentum indicators and machine learning",
    longDescription: "Momentum Master is a sophisticated AI-powered trading agent that leverages cutting-edge machine learning algorithms to identify and capitalize on market momentum. With advanced technical indicators and real-time analysis, this agent executes high-frequency trades to maximize profit potential while managing risk effectively.",
    price: 299,
    rating: 4.8,
    users: 1243,
    icon: "/images/agents/2.png",
    category: "Trading Bot",
    tags: ["Momentum", "High-Frequency", "ML"],
    features: [
      "Real-time momentum analysis using multiple timeframes",
      "Machine learning-powered signal generation",
      "Advanced risk management with dynamic position sizing",
      "Automated trade execution with millisecond precision",
      "Comprehensive backtesting and performance analytics",
      "Integration with major exchanges and trading platforms"
    ],
    requirements: [
      "API keys from supported exchanges",
      "Minimum account balance of $1,000",
      "Stable internet connection for 24/7 operation"
    ],
    changelog: [
      {
        version: "2.1.0",
        date: "2024-01-15",
        changes: [
          "Improved ML model accuracy by 15%",
          "Added support for Binance Futures",
          "Enhanced risk management algorithms"
        ]
      },
      {
        version: "2.0.0",
        date: "2023-12-01",
        changes: [
          "Complete ML model overhaul",
          "New multi-timeframe analysis",
          "Performance optimizations"
        ]
      }
    ]
  },
  "volatility-hunter": {
    id: "volatility-hunter",
    name: "Volatility Hunter",
    description: "Capitalize on market volatility with AI-powered risk management and dynamic position sizing",
    longDescription: "Volatility Hunter specializes in identifying and exploiting market volatility patterns. Using advanced statistical analysis and AI, this agent detects volatility spikes and executes strategic trades with sophisticated risk management to protect your capital while maximizing returns.",
    price: 199,
    rating: 4.6,
    users: 892,
    icon: "/images/agents/5.png",
    category: "Trading Bot",
    tags: ["Volatility", "Risk Management", "AI"],
    features: [
      "Real-time volatility detection and analysis",
      "AI-powered pattern recognition",
      "Dynamic position sizing based on market conditions",
      "Advanced stop-loss and take-profit strategies",
      "Multi-asset volatility arbitrage",
      "24/7 automated monitoring and execution"
    ],
    requirements: [
      "Exchange API access",
      "Minimum $500 starting capital",
      "Consistent uptime for optimal performance"
    ],
    changelog: [
      {
        version: "1.8.0",
        date: "2024-01-10",
        changes: [
          "Enhanced volatility prediction model",
          "Added support for options trading",
          "Improved risk management parameters"
        ]
      }
    ]
  },
  "dca-smart-bot": {
    id: "dca-smart-bot",
    name: "DCA Smart Bot",
    description: "Dollar-cost averaging strategy optimized by AI for maximum long-term gains",
    longDescription: "DCA Smart Bot revolutionizes the traditional dollar-cost averaging strategy with AI optimization. Instead of blind periodic purchases, this agent analyzes market conditions, sentiment, and technical indicators to determine the optimal timing and sizing for your DCA investments.",
    price: 149,
    rating: 4.9,
    users: 2156,
    icon: "/images/agents/7.png",
    category: "Investment",
    tags: ["DCA", "Long-term", "Passive"],
    features: [
      "AI-optimized DCA timing and amounts",
      "Multi-asset portfolio management",
      "Market sentiment analysis",
      "Automated rebalancing",
      "Tax-loss harvesting capabilities",
      "Detailed performance tracking and reporting"
    ],
    requirements: [
      "Exchange account with recurring buy support",
      "Minimum $100 monthly investment",
      "Long-term investment horizon recommended"
    ],
    changelog: [
      {
        version: "3.0.0",
        date: "2024-01-20",
        changes: [
          "Complete AI model redesign",
          "Added portfolio rebalancing",
          "New tax optimization features"
        ]
      }
    ]
  },
  "swing-trader-pro": {
    id: "swing-trader-pro",
    name: "Swing Trader Pro",
    description: "Multi-timeframe swing trading with AI sentiment analysis and technical indicators",
    longDescription: "Swing Trader Pro is designed for traders who want to capture medium-term price movements. Using multi-timeframe analysis, AI-powered sentiment detection, and comprehensive technical indicators, this agent identifies high-probability swing trading opportunities and manages positions from entry to exit.",
    price: 249,
    rating: 4.7,
    users: 1087,
    icon: "/images/agents/3.png",
    category: "Trading Bot",
    tags: ["Swing Trading", "Multi-timeframe", "Sentiment"],
    features: [
      "Multi-timeframe trend analysis",
      "AI-powered sentiment analysis from social media and news",
      "Comprehensive technical indicator suite",
      "Smart entry and exit optimization",
      "Position management with trailing stops",
      "Real-time alerts and notifications"
    ],
    requirements: [
      "Trading account with margin support",
      "Minimum $2,000 account balance",
      "Understanding of swing trading principles"
    ],
    changelog: [
      {
        version: "2.5.0",
        date: "2024-01-12",
        changes: [
          "Improved sentiment analysis accuracy",
          "Added support for crypto derivatives",
          "Enhanced notification system"
        ]
      }
    ]
  }
}

// Buying Section Component
const BuyingSection = ({
  agent,
  t,
  isMinimized = false
}: {
  agent: Agent
  t: any
  isMinimized?: boolean
}) => {
  if (isMinimized) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Price</div>
          <div className="text-xl font-bold text-white tabular-nums">${agent.price}</div>
        </div>
        <button className="px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold transition-all duration-200 hover:bg-white/90 active:scale-95 shadow-lg whitespace-nowrap">
          Buy Now
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
      <div className="mb-6">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
          Price
        </div>
        <div className="text-4xl font-bold text-white mb-3 tabular-nums">
          ${agent.price}
        </div>
        <div className="text-xs text-white/50">
          One-time purchase for lifetime access
        </div>
      </div>

      <button className="w-full px-6 py-3 rounded-lg bg-white text-black text-sm font-semibold transition-all duration-200 hover:bg-white/90 active:scale-95 shadow-lg mb-4">
        Buy Now - ${agent.price}
      </button>

      <div className="pt-4 border-t border-white/[0.06] space-y-2 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Instant access after purchase</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Lifetime updates included</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Full documentation & support</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  )
}

export default function MarketplaceAgentPage() {
  const t = useTranslations('agentPage')
  const params = useParams()
  const router = useRouter()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showMinimized, setShowMinimized] = useState(false)
  const currentLocale = useLocale()
  const buyingSectionRef = useRef<HTMLDivElement>(null)

  const agentId = params.id as string
  const locale = params.locale as string || 'en'
  const agent = AGENTS[agentId]

  // Trigger entrance animation
  useEffect(() => {
    setTimeout(() => {
      setIsPageLoaded(true)
    }, 50)
  }, [])

  // Handle scroll for mobile buying section
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024) return // Only on mobile

      const buyingSection = buyingSectionRef.current
      if (!buyingSection) return

      const rect = buyingSection.getBoundingClientRect()
      const hasScrolledPast = rect.bottom < window.innerHeight / 2

      setShowMinimized(hasScrolledPast)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  if (!agent) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <MarketplaceHeader locale={locale} activeTab="marketplace" />

        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 73px)" }}>
          <div className="text-center">
            <h1 className="text-2xl font-medium text-white mb-4">{t('notFound')}</h1>
            <button
              onClick={() => router.push(`/${locale}/marketplace`)}
              className="px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90"
            >
              {t('goBack')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-black pb-20 md:pb-0 transition-all duration-700 ${isPageLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-50 bg-black/95 backdrop-blur-xl transition-all duration-700 delay-100 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
        <MarketplaceHeader locale={locale} activeTab="marketplace" />

        {/* Mobile Sticky Buying Section - Shows when scrolled */}
        <div className={`lg:hidden border-b border-white/[0.08] transition-all duration-300 overflow-hidden ${showMinimized ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="px-4 py-3">
            <BuyingSection
              agent={agent}
              t={t}
              isMinimized={true}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 transition-all duration-700 delay-200 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
        {/* Back Button */}
        <button
          onClick={() => router.push(`/${locale}/marketplace`)}
          className={`flex items-center gap-1.5 text-white/50 hover:text-white transition-all mb-6 group duration-700 delay-300 ${isPageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
            }`}
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium">{t('backToMarketplace')}</span>
        </button>

        {/* Educational Section */}
        <div className={`text-center mb-6 transition-all duration-700 delay-350 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
          }`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-3 tracking-tight">
            {t('pageTitle')} <span className="font-semibold instrument">{t('pageTitleHighlight')}</span>
          </h1>
          <p className="text-xs md:text-sm text-white/60 max-w-2xl mx-auto px-4">
            {t('pageDescription')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
          {/* Left Column - Agent Details */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
            }`}>
            <div className="rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
              {/* Agent Header */}
              <div className="flex items-start gap-4 mb-5">
                {agent.icon.includes('.png') ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm flex items-center justify-center border border-white/[0.08]">
                    <Image
                      src={agent.icon}
                      alt={agent.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm flex items-center justify-center border border-white/[0.08] text-4xl">
                    {agent.icon}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-semibold text-white">{agent.name}</h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/[0.05] text-white/60 border border-white/[0.08]">
                      {agent.category}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-3">{agent.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-white tabular-nums">{agent.rating}</span>
                    </div>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-white/60 tabular-nums">{agent.users.toLocaleString()} users</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {agent.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] text-white/60 border border-white/[0.08]">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Mobile Buying Section - Shows below tags on mobile only */}
              <div
                ref={buyingSectionRef}
                className={`lg:hidden mt-5 transition-all duration-700 delay-550 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
                  }`}
              >
                <BuyingSection
                  agent={agent}
                  t={t}
                />
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-white/[0.06]"></div>

              {/* Description */}
              <div>
                <h2 className="text-base font-semibold text-white mb-3">About This Agent</h2>
                <p className="text-sm text-white/60 leading-relaxed">{agent.longDescription}</p>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-white/[0.06]"></div>

              {/* Features */}
              <div>
                <h2 className="text-base font-semibold text-white mb-3">{t('keyFeatures')}</h2>
                <div className="space-y-2">
                  {agent.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-white/60">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-white/[0.06]"></div>

              {/* Requirements */}
              <div>
                <h2 className="text-base font-semibold text-white mb-3">{t('systemRequirements')}</h2>
                <div className="space-y-2">
                  {agent.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-white/60">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-white/[0.06]"></div>

              {/* Changelog */}
              <div>
                <h2 className="text-base font-semibold text-white mb-3">{t('updateHistory')}</h2>
                <div className="space-y-4">
                  {agent.changelog.map((version, index) => (
                    <div key={index} className="border-l-2 border-white/[0.08] pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.05] text-white">
                          v{version.version}
                        </span>
                        <span className="text-[10px] text-white/40">{version.date}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {version.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="text-xs text-white/50 flex items-start gap-1.5">
                            <span className="text-white/20">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-white/[0.06]"></div>

              {/* Stats */}
              <div>
                <h2 className="text-base font-semibold text-white mb-3">Performance Statistics</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-white/40 mb-1 text-[10px] uppercase tracking-wider font-semibold">Avg Win Rate</div>
                    <div className="font-bold text-white text-lg tabular-nums">68.5%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-white/40 mb-1 text-[10px] uppercase tracking-wider font-semibold">Monthly ROI</div>
                    <div className="font-bold text-green-400 text-lg tabular-nums">+12.3%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-white/40 mb-1 text-[10px] uppercase tracking-wider font-semibold">Max Drawdown</div>
                    <div className="font-bold text-red-400 text-lg tabular-nums">-8.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Desktop Buying Section (hidden on mobile) */}
          <div className={`hidden lg:block lg:col-span-1 transition-all duration-700 delay-600 ${isPageLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
            }`}>
            <div className="sticky top-24">
              <BuyingSection
                agent={agent}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

