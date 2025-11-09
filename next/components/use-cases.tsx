"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Brain, TrendingUp, Image, FileText } from 'lucide-react'

export function UseCases() {
  const t = useTranslations('useCases')
  const [activeCase, setActiveCase] = useState("trading")

  const cases = [
    { id: "trading", title: t('cases.trading.title'), icon: "📈" },
    { id: "imageGen", title: t('cases.imageGen.title'), icon: "🎨" },
    { id: "research", title: t('cases.research.title'), icon: "🔬" },
  ]

  // Trading Records
  const tradingRecords = [
    {
      id: 1,
      symbol: "AAPL",
      action: "BUY",
      price: "$175.20",
      reasoning: t('cases.trading.rows.row1Reasoning'),
      result: "+$2,450"
    },
    {
      id: 2,
      symbol: "TSLA",
      action: "SELL",
      price: "$242.80",
      reasoning: t('cases.trading.rows.row2Reasoning'),
      result: "+$1,820"
    },
    {
      id: 3,
      symbol: "NVDA",
      action: "HOLD",
      price: "$485.60",
      reasoning: t('cases.trading.rows.row3Reasoning'),
      result: "—"
    },
    {
      id: 4,
      symbol: "MSFT",
      action: "BUY",
      price: "$420.15",
      reasoning: t('cases.trading.rows.row4Reasoning'),
      result: "+$980"
    }
  ]

  // Image Generation Records
  const imageRecords = [
    {
      id: 1,
      prompt: "Modern wireless headphones, minimalist design",
      reasoning: t('cases.imageGen.rows.row1Reasoning'),
      preview: "🎧",
      status: "Generated"
    },
    {
      id: 2,
      prompt: "Artistic ceramic mug with gradient blue",
      reasoning: t('cases.imageGen.rows.row2Reasoning'),
      preview: "☕",
      status: "Generated"
    },
    {
      id: 3,
      prompt: "Eco-friendly yoga mat in forest green",
      reasoning: t('cases.imageGen.rows.row3Reasoning'),
      preview: "🧘",
      status: "Generated"
    }
  ]

  // Research Records
  const researchRecords = [
    {
      id: 1,
      topic: "AI in Healthcare",
      reasoning: t('cases.research.rows.row1Reasoning'),
      insight: "AI diagnostics 94% accurate, surpassing humans in imaging",
      sources: "15"
    },
    {
      id: 2,
      topic: "Market Research",
      reasoning: t('cases.research.rows.row2Reasoning'),
      insight: "Premium tier 30% above market, mid-tier opportunity",
      sources: "8"
    },
    {
      id: 3,
      topic: "Consumer Analysis",
      reasoning: t('cases.research.rows.row3Reasoning'),
      insight: "68% prefer sustainability, 52% willing to pay premium",
      sources: "12"
    }
  ]

  return (
    <section className="py-32 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-[0.15]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(var(--primary),0.1),transparent)]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance tracking-tight">
            {t('title')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Use Case Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {cases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => setActiveCase(useCase.id)}
              className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${activeCase === useCase.id
                ? "border-primary bg-primary/10 text-primary shadow-lg"
                : "border-border bg-card hover:border-primary/50"
                }`}
            >
              <span className="mr-2">{useCase.icon}</span>
              {useCase.title}
            </button>
          ))}
        </div>

        {/* Trading Use Case */}
        {activeCase === "trading" && (
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start max-w-7xl mx-auto">
            {/* Left: Form */}
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="border-b border-border px-6 py-4 bg-muted/20">
                <h3 className="text-sm font-semibold">{t('workflowInput')}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.trading.form.symbol')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm font-medium">
                    {t('cases.trading.form.symbolValue')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.trading.form.strategy')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('cases.trading.form.strategyValue')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.trading.form.risk')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('cases.trading.form.riskValue')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Records Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
              <div className="border-b border-border px-6 py-4 bg-muted/20 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('aiReasoningInCells')}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-500">{t('live')}</span>
                </div>
              </div>
              <div className="grid grid-cols-[60px_100px_100px_100px_2fr_120px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[700px]">
                <div className="p-3 border-r border-border">#</div>
                <div className="p-3 border-r border-border">Symbol</div>
                <div className="p-3 border-r border-border">Action</div>
                <div className="p-3 border-r border-border">Price</div>
                <div className="p-3 border-r border-border flex items-center gap-2">
                  <Brain className="w-3 h-3 text-primary" />
                  AI Reasoning
                </div>
                <div className="p-3">P&L</div>
              </div>

              <div className="divide-y divide-border min-w-[700px]">
                {tradingRecords.map((record) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-[60px_100px_100px_100px_2fr_120px] hover:bg-muted/30 transition-colors text-sm"
                  >
                    <div className="p-3 border-r border-border text-muted-foreground font-mono">
                      {record.id}
                    </div>
                    <div className="p-3 border-r border-border font-bold">
                      {record.symbol}
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
          </div>
        )}

        {/* Image Generation Use Case */}
        {activeCase === "imageGen" && (
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start max-w-7xl mx-auto">
            {/* Left: Form */}
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="border-b border-border px-6 py-4 bg-muted/20">
                <h3 className="text-sm font-semibold">{t('workflowInput')}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.imageGen.form.type')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm font-medium">
                    {t('cases.imageGen.form.typeValue')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.imageGen.form.style')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('cases.imageGen.form.styleValue')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.imageGen.form.size')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('cases.imageGen.form.sizeValue')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Records Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
              <div className="border-b border-border px-6 py-4 bg-muted/20 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('aiReasoningInCells')}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-500">{t('live')}</span>
                </div>
              </div>
              <div className="grid grid-cols-[60px_1fr_2fr_120px_120px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[700px]">
                <div className="p-3 border-r border-border">#</div>
                <div className="p-3 border-r border-border">AI Prompt</div>
                <div className="p-3 border-r border-border flex items-center gap-2">
                  <Brain className="w-3 h-3 text-primary" />
                  AI Reasoning
                </div>
                <div className="p-3 border-r border-border">Preview</div>
                <div className="p-3">Status</div>
              </div>

              <div className="divide-y divide-border min-w-[700px]">
                {imageRecords.map((record) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-[60px_1fr_2fr_120px_120px] hover:bg-muted/30 transition-colors text-sm"
                  >
                    <div className="p-3 border-r border-border text-muted-foreground font-mono">
                      {record.id}
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
                        {record.preview}
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
          </div>
        )}

        {/* Research Use Case */}
        {activeCase === "research" && (
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start max-w-7xl mx-auto">
            {/* Left: Form */}
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="border-b border-border px-6 py-4 bg-muted/20">
                <h3 className="text-sm font-semibold">{t('workflowInput')}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.research.form.topic')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm font-medium">
                    {t('cases.research.form.topicValue')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.research.form.sources')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('cases.research.form.sourcesValue')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">
                    {t('cases.research.form.depth')}
                  </label>
                  <div className="h-10 rounded-lg border border-primary/50 bg-primary/5 px-4 flex items-center text-sm">
                    {t('cases.research.form.depthValue')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Records Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl overflow-x-auto">
              <div className="border-b border-border px-6 py-4 bg-muted/20 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('aiReasoningInCells')}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-500">{t('live')}</span>
                </div>
              </div>
              <div className="grid grid-cols-[60px_180px_2fr_1fr_100px] bg-muted/50 border-b border-border text-xs font-semibold min-w-[700px]">
                <div className="p-3 border-r border-border">#</div>
                <div className="p-3 border-r border-border">Topic</div>
                <div className="p-3 border-r border-border flex items-center gap-2">
                  <Brain className="w-3 h-3 text-primary" />
                  AI Reasoning
                </div>
                <div className="p-3 border-r border-border">Key Insight</div>
                <div className="p-3">Sources</div>
              </div>

              <div className="divide-y divide-border min-w-[700px]">
                {researchRecords.map((record) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-[60px_180px_2fr_1fr_100px] hover:bg-muted/30 transition-colors text-sm"
                  >
                    <div className="p-3 border-r border-border text-muted-foreground font-mono">
                      {record.id}
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
          </div>
        )}
      </div>
    </section>
  )
}
