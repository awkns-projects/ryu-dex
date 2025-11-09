"use client"

import { useState } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"
import { Brain, Zap, Globe as GlobeIcon, Clock, MessageCircle, FileText, Sparkles, Monitor } from "lucide-react"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import { Globe } from "@/registry/magicui/globe"
import { APIIcons } from "@/components/api-icons-export"

export function FeaturesTabs() {
  const t = useTranslations()
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState("chat")
  const { ref, isInView } = useInView({ threshold: 0.2, triggerOnce: true })

  const tabs = [
    {
      id: "chat",
      title: t('easyInterface.methods.chat.title'),
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      id: "form",
      title: t('easyInterface.methods.form.title'),
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "actions",
      title: t('easyInterface.methods.actions.title'),
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: "reasoning",
      title: t('aiCapabilities.tabTitle'),
      icon: <Brain className="w-5 h-5" />,
    },
    {
      id: "connections",
      title: t('apiConnections.tabTitle'),
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: "global",
      title: t('globalIntelligence.tabTitle'),
      icon: <GlobeIcon className="w-5 h-5" />,
    },
    {
      id: "autopilot",
      title: t('aiScheduler.tabTitle'),
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: "public",
      title: t('publicDisplay.tabTitle'),
      icon: <Monitor className="w-5 h-5" />,
    },
  ]

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/50 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('easyInterface.badge')}</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block">{t('easyInterface.title.line1')}</span>
            <span className="block text-primary">{t('easyInterface.title.line2')}</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('easyInterface.description')}
          </p>
        </div>

        {/* Tabs Navigation - 2 Rows */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 justify-items-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${activeTab === tab.id
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                  }`}
              >
                <div className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"}>
                  {tab.icon}
                </div>
                <span className="font-semibold text-sm">{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "chat" && <ChatContent isInView={isInView} />}
          {activeTab === "form" && <FormContent isInView={isInView} />}
          {activeTab === "actions" && <ActionsContent isInView={isInView} />}
          {activeTab === "reasoning" && <ReasoningContent />}
          {activeTab === "connections" && <ConnectionsContent isInView={isInView} />}
          {activeTab === "global" && <GlobalContent isInView={isInView} />}
          {activeTab === "autopilot" && <AutopilotContent />}
          {activeTab === "public" && <PublicDisplayContent isInView={isInView} />}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 shadow-lg" asChild>
            <Link href={`/${locale}/pilot`}>
              {t('easyInterface.ctaButton')}
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">{t('easyInterface.ctaSubtext')}</p>
        </div>
      </div>
    </section>
  )
}

function ChatContent({ isInView }: { isInView: boolean }) {
  const t = useTranslations('easyInterface')

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className={`space-y-4 transition-all duration-500 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="w-7 h-7" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold">{t('methods.chat.title')}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">{t('methods.chat.description')}</p>
      </div>

      <div className={`transition-all duration-500 delay-100 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative bg-background rounded-2xl border border-border shadow-2xl p-6">
            <div className="space-y-3">
              <div className="flex gap-3 items-start justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                  <p className="text-sm">{t('methods.chat.userMessage')}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-sm">{t('methods.chat.aiResponse1')}</p>
                  <p className="text-sm">{t('methods.chat.aiResponse2')}</p>
                  <p className="text-sm">{t('methods.chat.aiResponse3')}</p>
                  <p className="text-xs mt-2 opacity-80">{t('methods.chat.aiResponse4')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormContent({ isInView }: { isInView: boolean }) {
  const t = useTranslations('easyInterface')

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className={`space-y-4 transition-all duration-500 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold">{t('methods.form.title')}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">{t('methods.form.description')}</p>
      </div>

      <div className={`transition-all duration-500 delay-100 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative bg-background rounded-2xl border border-border shadow-2xl p-6">
            <div className="bg-card rounded-xl border border-border shadow-lg p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('methods.form.taskLabel')}</label>
                <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                  {t('methods.form.taskValue')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('methods.form.toneLabel')}</label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('methods.form.toneValue')}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('methods.form.audienceLabel')}</label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('methods.form.audienceValue')}
                  </div>
                </div>
              </div>
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-md">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('methods.form.executeButton')}
                </span>
              </Button>
              <div className="text-xs text-muted-foreground text-center">{t('methods.form.resultsNote')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionsContent({ isInView }: { isInView: boolean }) {
  const t = useTranslations('easyInterface')

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className={`space-y-4 transition-all duration-500 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold">{t('methods.actions.title')}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">{t('methods.actions.description')}</p>
      </div>

      <div className={`transition-all duration-500 delay-100 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative bg-background rounded-2xl border border-border shadow-2xl p-6">
            <div className="space-y-3">
              <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{t('methods.actions.action1Title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('methods.actions.action1Desc')}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{t('methods.actions.action2Title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('methods.actions.action2Desc')}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{t('methods.actions.action3Title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('methods.actions.action3Desc')}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReasoningContent() {
  const t = useTranslations('aiCapabilities')
  const [activeExample, setActiveExample] = useState("sentiment")

  const examples = [
    { id: "sentiment", label: "Customer Sentiment", icon: "💬" },
    { id: "trading", label: "Trading Decisions", icon: "📈" },
    { id: "images", label: "Image Generation", icon: "🎨" },
    { id: "research", label: "Research Insights", icon: "🔬" }
  ]

  const sentimentRecords = [
    {
      id: 1,
      customer: "Sarah Chen",
      review: "Product quality is amazing but shipping was slow",
      sentiment: "Positive",
      reasoning: "Analyzed keywords: 'amazing' (+), 'quality' (+), 'slow' (-). Weighted positive sentiment 70% vs negative 30%. Overall: Positive",
      confidence: "87%"
    },
    {
      id: 2,
      customer: "Mike Johnson",
      review: "Fast delivery! Love the product design",
      sentiment: "Positive",
      reasoning: "Detected enthusiastic tone with 'Love' and '!'. Keywords: 'Fast' (+), 'Love' (+), 'design' (+). No negative indicators. Overall: Positive",
      confidence: "95%"
    },
    {
      id: 3,
      customer: "Emma Wilson",
      review: "Support team was helpful, product needs improvement",
      sentiment: "Mixed",
      reasoning: "Balanced feedback. Positive: 'helpful' for support. Negative: 'needs improvement' for product. Split sentiment 50-50. Overall: Mixed",
      confidence: "78%"
    },
    {
      id: 4,
      customer: "David Lee",
      review: "Disappointed with the quality for this price",
      sentiment: "Negative",
      reasoning: "Strong negative indicator: 'Disappointed'. Price-quality mismatch concern. No positive keywords found. Overall: Negative",
      confidence: "92%"
    }
  ]

  const tradingRecords = [
    {
      id: 1,
      symbol: "AAPL",
      formInput: "Buy if RSI < 30 and price breaks resistance",
      action: "BUY",
      price: "$175.20",
      reasoning: "RSI at 28 (oversold). Price broke $175 resistance with high volume (2.3M). MACD crossover confirmed. Risk/reward ratio 1:3. Executed buy order.",
      result: "+$2,340"
    },
    {
      id: 2,
      symbol: "TSLA",
      formInput: "Sell if price drops below 50-day MA",
      action: "SELL",
      price: "$242.80",
      reasoning: "Price dropped to $242.80, below 50-day MA of $248.50. Bearish trend confirmed. Volume spike indicates selling pressure. Executed sell to protect gains.",
      result: "+$1,890"
    },
    {
      id: 3,
      symbol: "NVDA",
      formInput: "Hold if volatility < 15%",
      action: "HOLD",
      price: "$485.60",
      reasoning: "Volatility at 12.3% (below 15% threshold). Strong support at $480. No clear breakout signal. Maintaining position per strategy.",
      result: "—"
    }
  ]

  const imageRecords = [
    {
      id: 1,
      formInput: "Product: Wireless Headphones, Style: Minimalist, Color: Matte Black",
      prompt: "Modern wireless headphones, minimalist design, matte black finish",
      reasoning: "Extracted key attributes from form. Generated prompt emphasizing clean lines and premium feel. Selected DALL-E 3 for photorealistic output. Aspect ratio 1:1 for product shots.",
      imageUrl: "🎧",
      status: "Generated"
    },
    {
      id: 2,
      formInput: "Product: Coffee Mug, Style: Artistic, Color: Gradient Blue",
      prompt: "Artistic ceramic coffee mug with gradient blue glaze",
      reasoning: "Combined artistic style request with gradient color specification. Added 'ceramic' material for realistic texture. Optimized for e-commerce listing.",
      imageUrl: "☕",
      status: "Generated"
    },
    {
      id: 3,
      formInput: "Product: Yoga Mat, Style: Natural, Color: Forest Green",
      prompt: "Natural eco-friendly yoga mat in forest green tones",
      reasoning: "Interpreted 'Natural' style as eco-friendly aesthetic. Added texture details for yoga mat material. Emphasized sustainability theme in prompt.",
      imageUrl: "🧘",
      status: "Generated"
    }
  ]

  const researchRecords = [
    {
      id: 1,
      formInput: "Research latest AI trends in healthcare 2025",
      topic: "AI in Healthcare",
      reasoning: "Searched 50+ medical journals and tech publications. Identified 3 major trends: diagnostic AI (45% mentions), drug discovery (32%), patient monitoring (23%). Synthesized findings into summary.",
      insight: "AI diagnostics showing 94% accuracy, surpassing human doctors in specific imaging tasks",
      sources: "15"
    },
    {
      id: 2,
      formInput: "Analyze competitor pricing strategies",
      topic: "Competitor Analysis",
      reasoning: "Scraped 8 competitor websites. Compared pricing tiers, features, and value propositions. Calculated average price points and identified market positioning gaps.",
      insight: "Premium tier pricing 30% higher than market average, potential gap in mid-tier offerings",
      sources: "8"
    }
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">{t('advancedReasoning.title')}</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('advancedReasoning.description')}</p>
      </div>

      {/* Example Selector */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => setActiveExample(example.id)}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${activeExample === example.id
              ? "border-primary bg-primary/10 text-primary shadow-lg"
              : "border-border bg-card hover:border-primary/50"
              }`}
          >
            <span className="mr-2">{example.icon}</span>
            {example.label}
          </button>
        ))}
      </div>

      {/* Sentiment Analysis Table */}
      {activeExample === "sentiment" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
            <div className="grid grid-cols-[60px_140px_1fr_120px_2fr_100px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[900px]">
              <div className="p-3 border-r border-border">#</div>
              <div className="p-3 border-r border-border">Customer</div>
              <div className="p-3 border-r border-border">Review (Input)</div>
              <div className="p-3 border-r border-border">Sentiment</div>
              <div className="p-3 border-r border-border flex items-center gap-2">
                <Brain className="w-3 h-3 text-primary" />
                AI Reasoning
              </div>
              <div className="p-3">Confidence</div>
            </div>

            <div className="divide-y divide-border min-w-[900px]">
              {sentimentRecords.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[60px_140px_1fr_120px_2fr_100px] hover:bg-muted/30 transition-colors text-sm"
                >
                  <div className="p-3 border-r border-border text-muted-foreground font-mono">
                    {record.id}
                  </div>
                  <div className="p-3 border-r border-border font-medium">
                    {record.customer}
                  </div>
                  <div className="p-3 border-r border-border text-xs text-muted-foreground">
                    {record.review}
                  </div>
                  <div className="p-3 border-r border-border">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${record.sentiment === 'Positive'
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                      : record.sentiment === 'Negative'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                        : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {record.sentiment === 'Positive' ? '😊' : record.sentiment === 'Negative' ? '😞' : '😐'} {record.sentiment}
                    </span>
                  </div>
                  <div className="p-3 border-r border-border">
                    <div className="flex items-start gap-2">
                      <Brain className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {record.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: record.confidence }}
                        />
                      </div>
                      <span className="text-xs font-medium">{record.confidence}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">2</div>
              <div className="text-xs text-muted-foreground mt-1">Positive Reviews</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">1</div>
              <div className="text-xs text-muted-foreground mt-1">Mixed Reviews</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">1</div>
              <div className="text-xs text-muted-foreground mt-1">Negative Reviews</div>
            </div>
          </div>
        </>
      )}

      {/* Trading Decisions Table */}
      {activeExample === "trading" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
            <div className="grid grid-cols-[60px_100px_1fr_100px_100px_2fr_120px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[900px]">
              <div className="p-3 border-r border-border">#</div>
              <div className="p-3 border-r border-border">Symbol</div>
              <div className="p-3 border-r border-border">Form Input (Strategy)</div>
              <div className="p-3 border-r border-border">Action</div>
              <div className="p-3 border-r border-border">Price</div>
              <div className="p-3 border-r border-border flex items-center gap-2">
                <Brain className="w-3 h-3 text-primary" />
                AI Reasoning
              </div>
              <div className="p-3">Result (P&L)</div>
            </div>

            <div className="divide-y divide-border min-w-[900px]">
              {tradingRecords.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[60px_100px_1fr_100px_100px_2fr_120px] hover:bg-muted/30 transition-colors text-sm"
                >
                  <div className="p-3 border-r border-border text-muted-foreground font-mono">
                    {record.id}
                  </div>
                  <div className="p-3 border-r border-border font-bold">
                    {record.symbol}
                  </div>
                  <div className="p-3 border-r border-border text-xs text-muted-foreground">
                    {record.formInput}
                  </div>
                  <div className="p-3 border-r border-border">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${record.action === 'BUY'
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                      : record.action === 'SELL'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                        : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                      }`}>
                      {record.action}
                    </span>
                  </div>
                  <div className="p-3 border-r border-border font-mono text-xs">
                    {record.price}
                  </div>
                  <div className="p-3 border-r border-border">
                    <div className="flex items-start gap-2">
                      <Brain className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {record.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="p-3">
                    <span className={`font-bold ${record.result.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                      {record.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">+$4,230</div>
              <div className="text-xs text-muted-foreground mt-1">Total Profit</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-muted-foreground mt-1">Trades Executed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">67%</div>
              <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
            </div>
          </div>
        </>
      )}

      {/* Image Generation Table */}
      {activeExample === "images" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
            <div className="grid grid-cols-[60px_1fr_1fr_2fr_120px_120px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[900px]">
              <div className="p-3 border-r border-border">#</div>
              <div className="p-3 border-r border-border">Form Input</div>
              <div className="p-3 border-r border-border">AI Generated Prompt</div>
              <div className="p-3 border-r border-border flex items-center gap-2">
                <Brain className="w-3 h-3 text-primary" />
                AI Reasoning
              </div>
              <div className="p-3 border-r border-border">Preview</div>
              <div className="p-3">Status</div>
            </div>

            <div className="divide-y divide-border min-w-[900px]">
              {imageRecords.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[60px_1fr_1fr_2fr_120px_120px] hover:bg-muted/30 transition-colors text-sm"
                >
                  <div className="p-3 border-r border-border text-muted-foreground font-mono">
                    {record.id}
                  </div>
                  <div className="p-3 border-r border-border text-xs text-muted-foreground">
                    {record.formInput}
                  </div>
                  <div className="p-3 border-r border-border text-xs font-medium">
                    {record.prompt}
                  </div>
                  <div className="p-3 border-r border-border">
                    <div className="flex items-start gap-2">
                      <Brain className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {record.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-r border-border flex justify-center">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-3xl">
                      {record.imageUrl}
                    </div>
                  </div>
                  <div className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400">
                      ✓ {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-muted-foreground mt-1">Images Generated</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
              <div className="text-xs text-muted-foreground mt-1">Success Rate</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8s</div>
              <div className="text-xs text-muted-foreground mt-1">Avg. Time</div>
            </div>
          </div>
        </>
      )}

      {/* Research Insights Table */}
      {activeExample === "research" && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
            <div className="grid grid-cols-[60px_1fr_200px_2fr_200px_100px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[900px]">
              <div className="p-3 border-r border-border">#</div>
              <div className="p-3 border-r border-border">Form Input (Task)</div>
              <div className="p-3 border-r border-border">Topic</div>
              <div className="p-3 border-r border-border flex items-center gap-2">
                <Brain className="w-3 h-3 text-primary" />
                AI Reasoning
              </div>
              <div className="p-3 border-r border-border">Key Insight</div>
              <div className="p-3">Sources</div>
            </div>

            <div className="divide-y divide-border min-w-[900px]">
              {researchRecords.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[60px_1fr_200px_2fr_200px_100px] hover:bg-muted/30 transition-colors text-sm"
                >
                  <div className="p-3 border-r border-border text-muted-foreground font-mono">
                    {record.id}
                  </div>
                  <div className="p-3 border-r border-border text-xs text-muted-foreground">
                    {record.formInput}
                  </div>
                  <div className="p-3 border-r border-border font-medium text-xs">
                    {record.topic}
                  </div>
                  <div className="p-3 border-r border-border">
                    <div className="flex items-start gap-2">
                      <Brain className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {record.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-r border-border text-xs font-medium">
                    {record.insight}
                  </div>
                  <div className="p-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {record.sources}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="text-2xl font-bold">2</div>
              <div className="text-xs text-muted-foreground mt-1">Research Tasks</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23</div>
              <div className="text-xs text-muted-foreground mt-1">Total Sources</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
              <div className="text-xs text-muted-foreground mt-1">Completion Rate</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ConnectionsContent({ isInView }: { isInView: boolean }) {
  const t = useTranslations('apiConnections')

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">{t('title')}</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('description')}</p>
      </div>

      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 shadow-lg">
          <img src="/logo.png" alt="Ryu" className="w-18 h-18 object-contain" />
        </div>

        {isInView && (
          <>
            <OrbitingCircles iconSize={48} radius={120} speed={1.5}>
              <APIIcons.notion />
              <APIIcons.googleDrive />
              <APIIcons.whatsapp />
              <APIIcons.googleDocs />
            </OrbitingCircles>

            <OrbitingCircles iconSize={40} radius={200} reverse speed={1}>
              <APIIcons.zapier />
              <APIIcons.messenger />
              <APIIcons.openai />
            </OrbitingCircles>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4 font-medium">{t('moreComing')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Airtable", "Google Sheets", "Slack", "Discord", "GitHub", "Linear"].map((name) => (
            <div key={name} className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 text-xs font-semibold text-muted-foreground">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GlobalContent({ isInView }: { isInView: boolean }) {
  const t = useTranslations('globalIntelligence')

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">{t('title')}</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('description')}</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="relative flex size-full max-w-[500px] h-[500px] items-center justify-center">
          {isInView && <Globe className="top-0" />}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-2">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <h4 className="font-semibold">{t('languages.title')}</h4>
          <p className="text-sm text-muted-foreground">{t('languages.description')}</p>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 mb-2">
            <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h4 className="font-semibold">{t('countries.title')}</h4>
          <p className="text-sm text-muted-foreground">{t('countries.description')}</p>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 mb-2">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="font-semibold">{t('realtime.title')}</h4>
          <p className="text-sm text-muted-foreground">{t('realtime.description')}</p>
        </div>
      </div>
    </div>
  )
}

function AutopilotContent() {
  const t = useTranslations('aiScheduler')

  const schedules = [
    { time: "06:00", task: t('schedules.task1'), status: "completed" },
    { time: "09:00", task: t('schedules.task2'), status: "completed" },
    { time: "12:00", task: t('schedules.task3'), status: "running" },
    { time: "15:00", task: t('schedules.task4'), status: "scheduled" },
    { time: "18:00", task: t('schedules.task5'), status: "scheduled" },
  ]

  const weekDays = [
    t('weekDays.mon'),
    t('weekDays.tue'),
    t('weekDays.wed'),
    t('weekDays.thu'),
    t('weekDays.fri'),
    t('weekDays.sat'),
    t('weekDays.sun')
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">{t('title')}</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('description')}</p>
      </div>

      {/* Calendar View */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Mini Calendar */}
        <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="border-b border-border px-4 py-3 bg-muted/30">
            <h3 className="text-sm font-semibold">{t('monthYear')}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, i) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 6 + 1
                const isCurrentDay = i === 6 // Monday
                const hasTask = dayNum > 0 && dayNum <= 31
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center text-sm rounded-md transition-all ${isCurrentDay
                      ? "bg-foreground text-background font-semibold shadow-md"
                      : hasTask
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "text-muted-foreground/30"
                      }`}
                  >
                    {dayNum > 0 && dayNum <= 31 ? dayNum : ""}
                    {hasTask && !isCurrentDay && dayNum % 3 === 0 && (
                      <div className="absolute w-1 h-1 rounded-full bg-primary mt-6" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Schedule List for Selected Day */}
        <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="border-b border-border px-6 py-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{t('todaysSchedule')}</h4>
              <div className="text-sm text-muted-foreground">{t('mondayDate')}</div>
            </div>
          </div>

          <div className="p-6 space-y-2">
            {schedules.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-all">
                <div className="flex-shrink-0 w-16 text-sm font-mono text-muted-foreground">{item.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.task}</div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "completed" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">{t('status.done')}</span>
                    </>
                  )}
                  {item.status === "running" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-muted-foreground">{t('status.running')}</span>
                    </>
                  )}
                  {item.status === "scheduled" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      <span className="text-xs text-muted-foreground">{t('status.scheduled')}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-6 py-4 bg-muted/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('totalTasks')}</span>
              <span className="font-semibold">{schedules.length} {t('automatedWorkflows')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PublicDisplayContent({ isInView }: { isInView: boolean }) {
  const t = useTranslations('publicDisplay')

  const strategies = [
    {
      name: "Momentum Breakout",
      status: "active",
      pnl: "+$12,450",
      pnlPercent: "+18.2%",
      trades: 47,
      winRate: "68%",
      trend: "up",
      color: "green"
    },
    {
      name: "Mean Reversion",
      status: "active",
      pnl: "+$8,230",
      pnlPercent: "+12.4%",
      trades: 89,
      winRate: "61%",
      trend: "up",
      color: "emerald"
    },
    {
      name: "Trend Following",
      status: "paused",
      pnl: "-$2,140",
      pnlPercent: "-3.8%",
      trades: 34,
      winRate: "47%",
      trend: "down",
      color: "red"
    }
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">{t('title')}</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('description')}</p>
      </div>

      {/* Live Dashboard Example */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Live Trading Dashboard</span>
          </div>
          <div className="text-xs text-muted-foreground">Updated 2 seconds ago</div>
        </div>

        {/* Overall P&L Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-5">
            <div className="text-xs font-medium text-muted-foreground mb-1">Total P&L</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">+$18,540</div>
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">+8.9%</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="text-xs font-medium text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl font-bold">62.5%</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '62.5%' }} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="text-xs font-medium text-muted-foreground mb-1">Total Trades</div>
            <div className="text-2xl font-bold">170</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 dark:text-green-400 font-medium">106 wins</span> · <span className="text-red-600 dark:text-red-400 font-medium">64 losses</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="text-xs font-medium text-muted-foreground mb-1">Avg. Trade</div>
            <div className="text-2xl font-bold">$109</div>
            <div className="text-xs text-muted-foreground mt-1">Per position</div>
          </div>
        </div>

        {/* Trading Strategies Cards */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Active Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-xl border ${strategy.trend === 'up'
                  ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5'
                  : 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-rose-500/5'
                  } p-5 hover:shadow-lg transition-all`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${strategy.status === 'active'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${strategy.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                    {strategy.status}
                  </span>
                  <div className="text-xs text-muted-foreground">{strategy.trades} trades</div>
                </div>

                {/* Strategy Name */}
                <h5 className="font-semibold text-base mb-3">{strategy.name}</h5>

                {/* P&L Display */}
                <div className="mb-3">
                  <div className={`text-2xl font-bold ${strategy.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {strategy.pnl}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${strategy.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {strategy.trend === 'up' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {strategy.pnlPercent}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Win Rate</div>
                    <div className="text-sm font-semibold">{strategy.winRate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Avg. Profit</div>
                    <div className="text-sm font-semibold">
                      ${Math.round(parseFloat(strategy.pnl.replace(/[^0-9.-]/g, '')) / strategy.trades)}
                    </div>
                  </div>
                </div>

                {/* Mini Chart Visualization */}
                <div className="mt-3 h-12 flex items-end gap-1">
                  {Array.from({ length: 20 }, (_, i) => {
                    const height = strategy.trend === 'up'
                      ? Math.random() * 60 + 40
                      : Math.random() * 40 + 20;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${strategy.trend === 'up'
                          ? 'bg-green-500/40'
                          : 'bg-red-500/40'
                          }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embed Code Preview */}
        <div className="mt-8 p-6 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold">Embed this dashboard anywhere</span>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Copy Code
            </button>
          </div>
          <code className="text-xs text-muted-foreground font-mono block bg-background/50 p-3 rounded-lg overflow-x-auto">
            {`<iframe src="https://ryu.app/embed/trading-dashboard-abc123" width="100%" height="600"></iframe>`}
          </code>
        </div>
      </div>
    </div>
  )
}

