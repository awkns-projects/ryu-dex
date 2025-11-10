/**
 * AI Trading Bot Template
 * Comprehensive trading automation with strategy management, signal detection, and automated execution
 */

import type { Template } from './types'

export const TRADING_BOT_TEMPLATE: Template = {
  id: 'trading-bot',
  slug: 'ai-trading-bot',
  title: 'AI Trading Bot',
  shortDescription: 'Automate trading strategies with AI-powered market analysis, signal detection, and risk management.',
  longDescription: 'Transform your trading with AI automation. This advanced trading bot monitors markets 24/7, detects trading signals based on your strategies, executes trades automatically, manages portfolio risk, and provides comprehensive performance analytics. Perfect for active traders who want to automate their strategies while maintaining full control.',
  description: 'Automated trading with AI-powered strategy execution and risk management',
  category: 'finance',
  subcategories: ['trading', 'investment', 'automation'],
  tags: ['Trading', 'Investment', 'Automation', 'AI', 'Market Analysis', 'Risk Management'],
  useCases: ['Algorithmic Trading', 'Portfolio Management', 'Market Analysis', 'Risk Management'],
  thumbnail: '/templates/trading-bot.png',
  icon: '📈',
  difficulty: 'advanced',
  setupTime: 45,
  pricingTier: 'enterprise',
  version: '1.0',
  aiFeatures: ['Market Analysis', 'Signal Detection', 'Risk Assessment', 'Trade Recommendations', 'Performance Analytics'],

  // Trading platform and data connections
  connections: [
    {
      id: 'trading-platform',
      name: 'tradingPlatform',
      title: 'Trading Platform',
      provider: 'custom',
      description: 'Connect to your trading platform API (Interactive Brokers, TD Ameritrade, Alpaca, etc.)',
      icon: '💹',
      scopes: ['trade', 'account', 'market_data'],
      fieldName: 'tradingAuth',
      required: true,
    },
    {
      id: 'market-data',
      name: 'marketData',
      title: 'Market Data Provider',
      provider: 'custom',
      description: 'Real-time market data feed (Alpha Vantage, IEX Cloud, Polygon.io, etc.)',
      icon: '📊',
      scopes: ['quotes', 'historical', 'fundamentals'],
      fieldName: 'marketDataAuth',
      required: true,
    },
    {
      id: 'news-feed',
      name: 'newsFeed',
      title: 'Financial News Feed',
      provider: 'custom',
      description: 'News and sentiment data (NewsAPI, Benzinga, Twitter API)',
      icon: '📰',
      scopes: ['news', 'sentiment'],
      fieldName: 'newsAuth',
      required: false,
    },
  ],

  features: [
    // All features have proper implementations below
    {
      icon: '⚡',
      title: 'Quick Strategy Setup',
      description: {
        feature: 'Quickly create a trading strategy with basic parameters',
        data: 'Strategy name, trading symbol/ticker, strategy type (Trend Following, Mean Reversion, Breakout, etc.), and simple entry/exit rules',
        action: 'Create a new trading strategy with unique ID, set initial status to Draft, assign default risk parameters (2% max loss per trade), initialize performance tracking metrics (total P&L = 0, win rate = 0)',
      },
      forms: [
        {
          formId: 'quick-strategy',
          formName: 'Quick Strategy Setup',
          modelName: 'TradingStrategy',
          fields: ['name', 'symbols', 'strategyType', 'entryCondition', 'exitCondition'],
        },
        {
          formId: 'strategy-edit',
          formName: 'Edit Strategy',
          modelName: 'TradingStrategy',
          fields: ['name', 'symbols', 'entryCondition', 'exitCondition', 'status'],
        },
      ],
      models: [
        {
          modelName: 'TradingStrategy',
          fields: ['strategyId', 'name', 'symbols', 'strategyType', 'entryCondition', 'exitCondition', 'status', 'maxLossPercent', 'totalPnl', 'winRate', 'createdAt'],
        },
      ],
      schedules: [
        {
          name: 'Validate New Draft Strategies',
          description: 'Review and validate newly created draft strategies',
          mode: 'recurring',
          intervalHours: 12,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'validateStrategy', actionTitle: 'Validate Strategy', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'calculateBacktest', actionTitle: 'Calculate Backtest', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'activateIfValid', actionTitle: 'Activate If Valid', order: 3 },
          ],
        },
        {
          name: 'Archive Inactive Strategies',
          description: 'Archive strategies that have not been used in 30 days',
          mode: 'recurring',
          intervalHours: 168,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'checkLastUsage', actionTitle: 'Check Last Usage', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'notifyOwner', actionTitle: 'Notify Owner', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'archiveStrategy', actionTitle: 'Archive Strategy', order: 3 },
          ],
        },
      ],
    },

    // Feature 2: Advanced Strategy Configuration
    {
      icon: '🎯',
      title: 'Advanced Strategy Configuration',
      description: {
        feature: 'Configure a comprehensive trading strategy with detailed parameters and risk controls',
        data: 'Strategy name and type, multiple symbols/tickers, timeframe (1m/5m/15m/1h/4h/1d), technical indicators (RSI, MACD, Bollinger Bands, Moving Averages), entry conditions with thresholds, exit conditions, stop-loss percentage, take-profit targets, position sizing rules, max position size, and trading hours',
        action: 'Create detailed strategy specification with all parameters, validate indicator combinations, set up multi-condition entry/exit logic, configure risk management rules, calculate position sizes based on account size, initialize backtest settings',
      },
      forms: [
        {
          formId: 'advanced-strategy',
          formName: 'Advanced Strategy',
          modelName: 'TradingStrategy',
          fields: ['name', 'symbols', 'strategyType', 'timeframe', 'indicators', 'entryCondition', 'exitCondition', 'stopLossPercent', 'takeProfitPercent', 'positionSizePercent', 'maxPositionSize', 'tradingHours'],
        },
        {
          formId: 'strategy-risk-settings',
          formName: 'Risk Settings',
          modelName: 'TradingStrategy',
          fields: ['stopLossPercent', 'takeProfitPercent', 'positionSizePercent', 'maxPositionSize'],
        },
        {
          formId: 'strategy-indicators',
          formName: 'Technical Indicators',
          modelName: 'TradingStrategy',
          fields: ['timeframe', 'indicators', 'entryCondition', 'exitCondition'],
        },
      ],
      models: [
        {
          modelName: 'TradingStrategy',
          fields: ['strategyId', 'name', 'symbols', 'strategyType', 'timeframe', 'indicators', 'entryCondition', 'exitCondition', 'stopLossPercent', 'takeProfitPercent', 'positionSizePercent', 'maxPositionSize', 'tradingHours', 'status', 'createdAt'],
        },
      ],
      schedules: [
        {
          name: 'Backtest Advanced Strategies',
          description: 'Run backtests on configured strategies with historical data',
          mode: 'recurring',
          intervalHours: 24,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'fetchHistoricalData', actionTitle: 'Fetch Historical Data', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'runBacktest', actionTitle: 'Run Backtest', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'generateBacktestReport', actionTitle: 'Generate Backtest Report', order: 3 },
            { modelName: 'TradingStrategy', actionName: 'updateStrategyMetrics', actionTitle: 'Update Strategy Metrics', order: 4 },
          ],
        },
        {
          name: 'Optimize Strategy Parameters',
          description: 'Use AI to find optimal indicator thresholds',
          mode: 'recurring',
          intervalHours: 168,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'analyzePerformance', actionTitle: 'Analyze Performance', query: 'status is Active', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'generateOptimizations', actionTitle: 'Generate Optimizations', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'testOptimizations', actionTitle: 'Test Optimizations', order: 3 },
            { modelName: 'TradingStrategy', actionName: 'applyBestParameters', actionTitle: 'Apply Best Parameters', order: 4 },
          ],
        },
      ],
    },

    // Feature 3: Manual Trade Entry
    {
      icon: '✍️',
      title: 'Manual Trade Entry',
      description: {
        feature: 'Manually enter a trade with full control over parameters',
        data: 'Symbol, trade direction (Long/Short), entry price, quantity, order type (Market/Limit), stop-loss price, take-profit price, strategy reference',
        action: 'Create trade record with unique ID, set status to Pending, calculate risk/reward ratio, validate against account balance and risk limits, prepare order for execution',
      },
      forms: [
        {
          formId: 'manual-trade',
          formName: 'Manual Trade Entry',
          modelName: 'Trade',
          fields: ['symbol', 'direction', 'entryPrice', 'quantity', 'orderType', 'stopLoss', 'takeProfit', 'strategyId'],
        },
        {
          formId: 'quick-trade',
          formName: 'Quick Trade',
          modelName: 'Trade',
          fields: ['symbol', 'direction', 'quantity', 'orderType'],
        },
        {
          formId: 'trade-modification',
          formName: 'Modify Trade',
          modelName: 'Trade',
          fields: ['stopLoss', 'takeProfit', 'quantity'],
        },
      ],
      models: [
        {
          modelName: 'Trade',
          fields: ['tradeId', 'symbol', 'direction', 'entryPrice', 'quantity', 'orderType', 'stopLoss', 'takeProfit', 'strategyId', 'status', 'riskRewardRatio', 'createdAt'],
        },
      ],
      schedules: [
        {
          name: 'Process Pending Manual Trades',
          description: 'Review and execute pending manual trades',
          mode: 'recurring',
          intervalHours: 1,
          steps: [
            { modelName: 'Trade', actionName: 'validateTrade', actionTitle: 'Validate Trade', query: 'status is Pending', order: 1 },
            { modelName: 'Trade', actionName: 'checkMarketConditions', actionTitle: 'Check Market Conditions', order: 2 },
            { modelName: 'Trade', actionName: 'executeTrade', actionTitle: 'Execute Trade', order: 3 },
            { modelName: 'Trade', actionName: 'confirmExecution', actionTitle: 'Confirm Execution', order: 4 },
          ],
        },
        {
          name: 'Update Trade Status',
          description: 'Sync trade status with broker platform',
          mode: 'recurring',
          intervalHours: 0.5,
          steps: [
            { modelName: 'Trade', actionName: 'fetchOrderStatus', actionTitle: 'Fetch Order Status', order: 1 },
            { modelName: 'Trade', actionName: 'updateTradeRecord', actionTitle: 'Update Trade Record', order: 2 },
            { modelName: 'Trade', actionName: 'notifyChanges', actionTitle: 'Notify Changes', order: 3 },
          ],
        },
      ],
    },

    // Feature 4: Market Signal Recording
    {
      icon: '🔔',
      title: 'Market Signal Recording',
      description: {
        feature: 'Record detected market signals for analysis and potential trade execution',
        data: 'Symbol, signal type (Entry/Exit), signal strength (Weak/Medium/Strong), timeframe, trigger price, indicator values, timestamp',
        action: 'Create signal record with unique ID, capture current market conditions and indicator readings, calculate signal confidence score, link to relevant strategy if applicable, set expiration time for signal validity',
      },
      forms: [
        {
          formId: 'signal-entry',
          formName: 'Market Signal',
          modelName: 'MarketSignal',
          fields: ['symbol', 'signalType', 'strength', 'timeframe', 'triggerPrice', 'indicators', 'strategyId'],
        },
        {
          formId: 'signal-review',
          formName: 'Review Signal',
          modelName: 'MarketSignal',
          fields: ['signalType', 'strength', 'confidenceScore', 'indicators'],
        },
      ],
      models: [
        {
          modelName: 'MarketSignal',
          fields: ['signalId', 'symbol', 'signalType', 'strength', 'timeframe', 'triggerPrice', 'indicators', 'strategyId', 'confidenceScore', 'expiresAt', 'createdAt'],
        },
      ],
      schedules: [
        {
          name: 'Scan Markets for Signals',
          description: 'Continuously scan markets and record new signals',
          mode: 'recurring',
          intervalHours: 0.5,
          steps: [
            { modelName: 'MarketSignal', actionName: 'fetchMarketData', actionTitle: 'Fetch Market Data', order: 1 },
            { modelName: 'MarketSignal', actionName: 'calculateIndicators', actionTitle: 'Calculate Indicators', order: 2 },
            { modelName: 'MarketSignal', actionName: 'detectSignals', actionTitle: 'Detect Signals', order: 3 },
            { modelName: 'MarketSignal', actionName: 'recordSignals', actionTitle: 'Record Signals', order: 4 },
          ],
        },
        {
          name: 'Clean Up Expired Signals',
          description: 'Remove signals past expiration time',
          mode: 'recurring',
          intervalHours: 6,
          steps: [
            { modelName: 'MarketSignal', actionName: 'identifyExpired', actionTitle: 'Identify Expired', query: 'expiresAt < now()', order: 1 },
            { modelName: 'MarketSignal', actionName: 'archiveSignals', actionTitle: 'Archive Signals', order: 2 },
            { modelName: 'MarketSignal', actionName: 'generateSummary', actionTitle: 'Generate Summary', order: 3 },
          ],
        },
      ],
    },

    // Feature 5: AI Market Analysis
    {
      icon: '🤖',
      title: 'AI Market Analysis',
      description: {
        feature: 'Use AI to analyze market conditions and generate trading signals',
        data: 'Symbol, timeframe, current price, technical indicator values, recent price history, volume data',
        action: 'Analyze current market conditions using AI: evaluate technical indicators, identify chart patterns, assess momentum and volatility, determine trend direction, calculate signal strength and confidence, generate actionable entry/exit recommendations with specific price targets and reasoning',
      },
      forms: [
        {
          formId: 'analysis-request',
          formName: 'Request Market Analysis',
          modelName: 'MarketSignal',
          fields: ['symbol', 'timeframe', 'indicators'],
        },
        {
          formId: 'bulk-analysis',
          formName: 'Bulk Symbol Analysis',
          modelName: 'MarketSignal',
          fields: ['symbol', 'timeframe'],
        },
      ],
      models: [
        {
          modelName: 'MarketSignal',
          fields: ['symbol', 'timeframe', 'triggerPrice', 'indicators', 'signalType', 'strength', 'confidenceScore', 'analysis', 'recommendation', 'createdAt'],
        },
      ],
      schedules: [
        {
          name: 'Real-time Market Analysis',
          description: 'Perform AI analysis on active symbols',
          mode: 'recurring',
          intervalHours: 0.25,
          steps: [
            { modelName: 'MarketSignal', actionName: 'fetchLatestData', actionTitle: 'Fetch Latest Data', order: 1 },
            { modelName: 'MarketSignal', actionName: 'analyzeMarket', actionTitle: 'Run AI Analysis', order: 2 },
            { modelName: 'MarketSignal', actionName: 'generateSignals', actionTitle: 'Generate Signals', order: 3 },
            { modelName: 'MarketSignal', actionName: 'alertHighConfidence', actionTitle: 'Alert High Confidence', query: 'confidenceScore > 70', order: 4 },
          ],
        },
        {
          name: 'Deep Market Research',
          description: 'In-depth multi-timeframe analysis',
          mode: 'recurring',
          intervalHours: 4,
          steps: [
            { modelName: 'MarketSignal', actionName: 'analyzeMultipleTimeframes', actionTitle: 'Analyze Multiple Timeframes', order: 1 },
            { modelName: 'MarketSignal', actionName: 'correlationAnalysis', actionTitle: 'Correlation Analysis', order: 2 },
            { modelName: 'MarketSignal', actionName: 'sentimentAnalysis', actionTitle: 'Sentiment Analysis', order: 3 },
            { modelName: 'MarketSignal', actionName: 'generateReport', actionTitle: 'Generate Report', order: 4 },
          ],
        },
      ],
    },

    // Feature 6: AI Strategy Optimization
    {
      icon: '🧠',
      title: 'AI Strategy Optimization',
      description: {
        feature: 'Optimize trading strategy parameters based on historical performance',
        data: 'Strategy ID, historical trades, performance metrics, market conditions',
        action: 'Use AI to analyze strategy performance: review past trades and outcomes, identify what parameters worked best, calculate optimal indicator thresholds, suggest improved entry/exit conditions, recommend risk management adjustments, provide backtested projections for suggested changes',
      },
      forms: [
        {
          formId: 'optimization-settings',
          formName: 'Optimization Settings',
          modelName: 'TradingStrategy',
          fields: ['name', 'indicators', 'totalPnl', 'winRate'],
        },
        {
          formId: 'apply-optimizations',
          formName: 'Apply Optimizations',
          modelName: 'TradingStrategy',
          fields: ['optimizedParameters', 'projectedPerformance'],
        },
      ],
      models: [
        {
          modelName: 'TradingStrategy',
          fields: ['strategyId', 'name', 'strategyType', 'indicators', 'totalPnl', 'winRate', 'avgRiskReward', 'optimizedParameters', 'suggestions', 'projectedPerformance'],
        },
      ],
      schedules: [
        {
          name: 'Weekly Strategy Optimization',
          description: 'Optimize all active strategies weekly',
          mode: 'recurring',
          intervalHours: 168,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'gatherPerformanceData', actionTitle: 'Gather Performance Data', query: 'status is Active', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'optimizeStrategy', actionTitle: 'Run Optimization', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'backtestOptimizations', actionTitle: 'Backtest Optimizations', order: 3 },
            { modelName: 'TradingStrategy', actionName: 'notifyRecommendations', actionTitle: 'Notify Recommendations', order: 4 },
          ],
        },
        {
          name: 'Emergency Optimization',
          description: 'Optimize underperforming strategies immediately',
          mode: 'recurring',
          intervalHours: 24,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'identifyUnderperformers', actionTitle: 'Identify Underperformers', query: 'winRate < 40', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'prioritizeOptimization', actionTitle: 'Prioritize Optimization', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'applyQuickFixes', actionTitle: 'Apply Quick Fixes', order: 3 },
            { modelName: 'TradingStrategy', actionName: 'alertUser', actionTitle: 'Alert User', order: 4 },
          ],
        },
      ],
    },

    // Feature 7: AI Trade Validation
    {
      icon: '✅',
      title: 'AI Trade Validation',
      description: {
        feature: 'Validate trade setup before execution to ensure it meets risk criteria',
        data: 'Trade details (symbol, direction, price, quantity, stop-loss, take-profit), current account balance, open positions, strategy rules',
        action: 'Use AI to validate the trade: check if it follows strategy rules, verify position size is appropriate for account, confirm risk/reward ratio meets minimum threshold (>1:2), ensure stop-loss is placed correctly, check for correlation with existing positions, validate against daily loss limits, provide approval or rejection with detailed reasoning',
      },
      forms: [
        {
          formId: 'validation-request',
          formName: 'Request Trade Validation',
          modelName: 'Trade',
          fields: ['symbol', 'direction', 'entryPrice', 'quantity', 'stopLoss', 'takeProfit'],
        },
        {
          formId: 'validation-override',
          formName: 'Override Validation',
          modelName: 'Trade',
          fields: ['validationStatus', 'validationNotes', 'approved'],
        },
      ],
      models: [
        {
          modelName: 'Trade',
          fields: ['tradeId', 'symbol', 'direction', 'entryPrice', 'quantity', 'stopLoss', 'takeProfit', 'strategyId', 'validationStatus', 'riskScore', 'validationNotes', 'approved'],
        },
      ],
      schedules: [
        {
          name: 'Auto-Validate Pending Trades',
          description: 'Automatically validate all pending trades',
          mode: 'recurring',
          intervalHours: 0.5,
          steps: [
            { modelName: 'Trade', actionName: 'validateTrade', actionTitle: 'Run Validation', query: 'status is Pending', order: 1 },
            { modelName: 'Trade', actionName: 'updateTradeStatus', actionTitle: 'Update Trade Status', order: 2 },
            { modelName: 'Trade', actionName: 'notifyResults', actionTitle: 'Notify Results', order: 3 },
          ],
        },
        {
          name: 'Re-validate Rejected Trades',
          description: 'Re-check rejected trades if market conditions improve',
          mode: 'recurring',
          intervalHours: 4,
          steps: [
            { modelName: 'Trade', actionName: 'checkConditions', actionTitle: 'Check Conditions', query: 'status is Rejected', order: 1 },
            { modelName: 'Trade', actionName: 'validateTrade', actionTitle: 'Revalidate', order: 2 },
            { modelName: 'Trade', actionName: 'approveIfValid', actionTitle: 'Approve If Valid', order: 3 },
          ],
        },
      ],
    },

    // Feature 8: AI Risk Assessment
    {
      icon: '🛡️',
      title: 'AI Risk Assessment',
      description: {
        feature: 'Continuously assess portfolio risk and suggest adjustments',
        data: 'All open positions, account balance, total exposure, correlation between positions, market volatility',
        action: 'Use AI to evaluate portfolio risk: calculate total risk exposure across all positions, identify concentration risk in specific symbols or sectors, assess correlation between positions, evaluate if current volatility requires position reduction, suggest which positions to close or hedge, recommend maximum additional risk capacity',
      },
      forms: [
        {
          formId: 'risk-assessment',
          formName: 'Risk Assessment',
          modelName: 'PortfolioPosition',
          fields: ['symbol', 'quantity', 'currentPrice', 'unrealizedPnl'],
        },
        {
          formId: 'risk-limits',
          formName: 'Set Risk Limits',
          modelName: 'PortfolioPosition',
          fields: ['riskLevel', 'maxAdditionalExposure'],
        },
      ],
      models: [
        {
          modelName: 'PortfolioPosition',
          fields: ['positionId', 'symbol', 'quantity', 'entryPrice', 'currentPrice', 'stopLoss', 'unrealizedPnl', 'riskScore', 'riskLevel', 'suggestions', 'maxAdditionalExposure'],
        },
      ],
      schedules: [
        {
          name: 'Continuous Risk Monitoring',
          description: 'Monitor portfolio risk in real-time',
          mode: 'recurring',
          intervalHours: 1,
          steps: [
            { modelName: 'PortfolioPosition', actionName: 'calculatePortfolioRisk', actionTitle: 'Calculate Portfolio Risk', order: 1 },
            { modelName: 'PortfolioPosition', actionName: 'assessRisk', actionTitle: 'Assess Correlations', order: 2 },
            { modelName: 'PortfolioPosition', actionName: 'identifyRisks', actionTitle: 'Identify Risks', query: 'riskLevel is High or riskLevel is Critical', order: 3 },
            { modelName: 'PortfolioPosition', actionName: 'generateAlerts', actionTitle: 'Generate Alerts', order: 4 },
          ],
        },
        {
          name: 'Daily Risk Report',
          description: 'Generate comprehensive daily risk report',
          mode: 'recurring',
          intervalHours: 24,
          steps: [
            { modelName: 'PortfolioPosition', actionName: 'aggregateRiskData', actionTitle: 'Aggregate Risk Data', order: 1 },
            { modelName: 'PortfolioPosition', actionName: 'analyzeExposure', actionTitle: 'Analyze Exposure', order: 2 },
            { modelName: 'PortfolioPosition', actionName: 'generateReport', actionTitle: 'Generate Report', order: 3 },
            { modelName: 'PortfolioPosition', actionName: 'emailReport', actionTitle: 'Email Report', order: 4 },
          ],
        },
      ],
    },

    // Feature 9: AI Trade Execution
    {
      icon: '⚡',
      title: 'AI Trade Execution',
      description: {
        feature: 'Execute trades through trading platform API',
        data: 'Validated trade details, trading platform credentials, current market price',
        action: 'Execute the trade through the connected trading platform: prepare order payload with all parameters, submit order via API, receive order confirmation and fill details, update trade status to Executed, record actual fill price and quantity, set up stop-loss and take-profit orders, update portfolio positions',
      },
      forms: [
        {
          formId: 'execution-settings',
          formName: 'Execution Settings',
          modelName: 'Trade',
          fields: ['orderType', 'entryPrice', 'quantity'],
        },
        {
          formId: 'execution-confirm',
          formName: 'Confirm Execution',
          modelName: 'Trade',
          fields: ['symbol', 'direction', 'quantity', 'orderType', 'approved'],
        },
      ],
      models: [
        {
          modelName: 'Trade',
          fields: ['tradeId', 'symbol', 'direction', 'entryPrice', 'quantity', 'orderType', 'stopLoss', 'takeProfit', 'approved', 'status', 'executedAt', 'fillPrice', 'fillQuantity', 'orderId', 'commission'],
        },
      ],
      schedules: [
        {
          name: 'Execute Validated Trades',
          description: 'Automatically execute all validated and approved trades',
          mode: 'recurring',
          intervalHours: 0.25,
          steps: [
            { modelName: 'Trade', actionName: 'checkMarketHours', actionTitle: 'Check Market Hours', query: 'status is Validated and approved is true', order: 1 },
            { modelName: 'Trade', actionName: 'executeTrade', actionTitle: 'Execute Trade', order: 2 },
            { modelName: 'Trade', actionName: 'confirmExecution', actionTitle: 'Confirm Execution', order: 3 },
          ],
        },
        {
          name: 'Retry Failed Executions',
          description: 'Retry trades that failed to execute',
          mode: 'recurring',
          intervalHours: 1,
          steps: [
            { modelName: 'Trade', actionName: 'analyzeFailureReason', actionTitle: 'Analyze Failure Reason', query: 'status is Failed', order: 1 },
            { modelName: 'Trade', actionName: 'executeTrade', actionTitle: 'Retry Execution', order: 2 },
            { modelName: 'Trade', actionName: 'notifyStatus', actionTitle: 'Notify Status', order: 3 },
          ],
        },
      ],
    },

    // Feature 10: AI Position Management
    {
      icon: '📊',
      title: 'AI Position Management',
      description: {
        feature: 'Monitor and manage open positions with AI-driven adjustments',
        data: 'Position details, current market price, unrealized P&L, time in position, market conditions',
        action: 'Use AI to manage the position: evaluate if stop-loss should be moved to breakeven, assess if take-profit should be adjusted based on momentum, determine if position should be partially closed to lock profits, check for trailing stop-loss opportunities, identify if market conditions warrant early exit, provide specific management recommendations',
      },
      forms: [
        {
          formId: 'position-adjustment',
          formName: 'Adjust Position',
          modelName: 'PortfolioPosition',
          fields: ['stopLoss', 'takeProfit', 'quantity'],
        },
        {
          formId: 'position-close',
          formName: 'Close Position',
          modelName: 'PortfolioPosition',
          fields: ['symbol', 'quantity', 'currentPrice'],
        },
        {
          formId: 'trailing-stop',
          formName: 'Set Trailing Stop',
          modelName: 'PortfolioPosition',
          fields: ['symbol', 'stopLoss', 'adjustedStopLoss'],
        },
      ],
      models: [
        {
          modelName: 'PortfolioPosition',
          fields: ['positionId', 'symbol', 'direction', 'quantity', 'entryPrice', 'currentPrice', 'stopLoss', 'takeProfit', 'unrealizedPnl', 'holdingMinutes', 'recommendation', 'adjustedStopLoss', 'adjustedTakeProfit', 'suggestedAction'],
        },
      ],
      schedules: [
        {
          name: 'Monitor Open Positions',
          description: 'Monitor all open positions for management opportunities',
          mode: 'recurring',
          intervalHours: 0.5,
          steps: [
            { modelName: 'PortfolioPosition', actionName: 'updatePrices', actionTitle: 'Update Prices', order: 1 },
            { modelName: 'PortfolioPosition', actionName: 'managePosition', actionTitle: 'Analyze Positions', query: 'unrealizedPnlPercent > 5', order: 2 },
            { modelName: 'PortfolioPosition', actionName: 'generateRecommendations', actionTitle: 'Generate Recommendations', order: 3 },
          ],
        },
        {
          name: 'Auto-Adjust Positions',
          description: 'Automatically adjust stop-loss and take-profit levels',
          mode: 'recurring',
          intervalHours: 2,
          steps: [
            { modelName: 'PortfolioPosition', actionName: 'identifyAdjustments', actionTitle: 'Identify Adjustments', order: 1 },
            { modelName: 'PortfolioPosition', actionName: 'validateAdjustments', actionTitle: 'Validate Adjustments', order: 2 },
            { modelName: 'PortfolioPosition', actionName: 'executeAdjustments', actionTitle: 'Execute Adjustments', order: 3 },
            { modelName: 'PortfolioPosition', actionName: 'confirmChanges', actionTitle: 'Confirm Changes', order: 4 },
          ],
        },
      ],
    },

    // Feature 11: AI Performance Analytics
    {
      icon: '📈',
      title: 'AI Performance Analytics',
      description: {
        feature: 'Generate comprehensive performance reports with AI insights',
        data: 'All trades (open and closed), strategies used, time periods, account balance history',
        action: 'Use AI to analyze trading performance: calculate key metrics (total P&L, win rate, average R:R, max drawdown, Sharpe ratio), identify best and worst performing strategies, analyze which timeframes and symbols worked best, determine patterns in winning vs losing trades, provide actionable insights to improve performance, generate detailed performance summary with recommendations',
      },
      forms: [
        {
          formId: 'performance-request',
          formName: 'Request Performance Analysis',
          modelName: 'TradingStrategy',
          fields: ['name', 'totalPnl', 'winRate', 'totalTrades'],
        },
        {
          formId: 'custom-report',
          formName: 'Custom Performance Report',
          modelName: 'TradingStrategy',
          fields: ['name', 'totalPnl', 'winRate', 'avgRiskReward', 'maxDrawdown'],
        },
      ],
      models: [
        {
          modelName: 'TradingStrategy',
          fields: ['strategyId', 'name', 'totalPnl', 'winRate', 'totalTrades', 'avgRiskReward', 'maxDrawdown', 'performanceReport', 'insights', 'strengthsWeaknesses', 'recommendations'],
        },
      ],
      schedules: [
        {
          name: 'Daily Performance Summary',
          description: 'Generate daily performance summary for all strategies',
          mode: 'recurring',
          intervalHours: 24,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'collectDailyData', actionTitle: 'Collect Daily Data', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'calculateMetrics', actionTitle: 'Calculate Metrics', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'analyzePerformance', actionTitle: 'Generate Summary', query: 'status is Active', order: 3 },
            { modelName: 'TradingStrategy', actionName: 'emailReport', actionTitle: 'Email Report', order: 4 },
          ],
        },
        {
          name: 'Weekly Deep Analysis',
          description: 'Comprehensive weekly performance analysis',
          mode: 'recurring',
          intervalHours: 168,
          steps: [
            { modelName: 'TradingStrategy', actionName: 'aggregateWeeklyData', actionTitle: 'Aggregate Weekly Data', query: 'status is Active', order: 1 },
            { modelName: 'TradingStrategy', actionName: 'analyzePerformance', actionTitle: 'Run Deep Analysis', order: 2 },
            { modelName: 'TradingStrategy', actionName: 'identifyTrends', actionTitle: 'Identify Trends', order: 3 },
            { modelName: 'TradingStrategy', actionName: 'generateInsights', actionTitle: 'Generate Insights', order: 4 },
            { modelName: 'TradingStrategy', actionName: 'createRecommendations', actionTitle: 'Create Recommendations', order: 5 },
          ],
        },
      ],
    },
  ],

  howItWorks: [
    { order: 1, title: 'Configure Strategies', description: 'Set up trading strategies with your rules and risk parameters' },
    { order: 2, title: 'AI Monitors Markets', description: 'Bot continuously scans markets for signals matching your strategies' },
    { order: 3, title: 'Validate & Execute', description: 'AI validates setups and executes trades automatically' },
    { order: 4, title: 'Manage Positions', description: 'AI monitors positions and adjusts stops/targets dynamically' },
    { order: 5, title: 'Track Performance', description: 'Receive detailed analytics and optimization suggestions' },
  ],

  models: [
    {
      name: 'Workspace',
      fields: [
        { name: 'name', type: 'text', label: 'Workspace Name', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'accountBalance', type: 'number', label: 'Trading Account Balance', required: true },
        { name: 'baseCurrency', type: 'select', label: 'Base Currency', options: ['USD', 'EUR', 'GBP', 'JPY'], defaultValue: 'USD' },
        { name: 'maxDailyLossPercent', type: 'number', label: 'Max Daily Loss %', defaultValue: 5 },
        { name: 'maxOpenPositions', type: 'number', label: 'Max Open Positions', defaultValue: 5 },
        { name: 'tradingAuth', type: 'text', label: 'Trading Platform API Key' },
        { name: 'marketDataAuth', type: 'text', label: 'Market Data API Key' },
        { name: 'newsAuth', type: 'text', label: 'News Feed API Key' },
      ],
      // CRITICAL: Default workspace is auto-created. This 'edit' form configures trading parameters and API keys.
      forms: [
        {
          id: 'trading-configuration',
          name: 'Trading Configuration',
          description: 'Configure trading parameters, risk limits, and API credentials',
          icon: '⚙️',
          formType: 'edit',
          whenToUse: 'Use this form to configure your trading account balance, risk parameters (max loss %, max positions), and API keys for trading platform and market data.',
          modelName: 'Workspace',
          fields: ['accountBalance', 'baseCurrency', 'maxDailyLossPercent', 'maxOpenPositions', 'tradingAuth', 'marketDataAuth', 'newsAuth'],
        },
      ],
      actions: [],
    },
    {
      name: 'TradingStrategy',
      description: 'Complete trading strategy with entry/exit rules and risk management',
      fields: [
        { name: 'strategyId', type: 'text', label: 'Strategy ID', required: true },
        { name: 'name', type: 'text', label: 'Strategy Name', required: true },
        { name: 'symbols', type: 'text', label: 'Symbols (comma-separated)', required: true },
        { name: 'strategyType', type: 'select', label: 'Strategy Type', options: ['Trend Following', 'Mean Reversion', 'Breakout', 'Momentum', 'Scalping', 'Swing Trading', 'Custom'], required: true },
        { name: 'timeframe', type: 'select', label: 'Timeframe', options: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'], required: true },
        { name: 'indicators', type: 'text', label: 'Technical Indicators', placeholder: 'RSI, MACD, SMA20, etc.' },
        { name: 'entryCondition', type: 'textarea', label: 'Entry Conditions', required: true },
        { name: 'exitCondition', type: 'textarea', label: 'Exit Conditions', required: true },
        { name: 'stopLossPercent', type: 'number', label: 'Stop Loss %', defaultValue: 2 },
        { name: 'takeProfitPercent', type: 'number', label: 'Take Profit %', defaultValue: 4 },
        { name: 'positionSizePercent', type: 'number', label: 'Position Size % of Account', defaultValue: 2 },
        { name: 'maxPositionSize', type: 'number', label: 'Max Position Size ($)' },
        { name: 'tradingHours', type: 'text', label: 'Trading Hours', placeholder: '09:30-16:00 EST' },
        { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Active', 'Paused', 'Archived'], defaultValue: 'Draft' },
        { name: 'totalPnl', type: 'number', label: 'Total P&L ($)', defaultValue: 0 },
        { name: 'winRate', type: 'number', label: 'Win Rate %', defaultValue: 0 },
        { name: 'totalTrades', type: 'number', label: 'Total Trades', defaultValue: 0 },
        { name: 'avgRiskReward', type: 'number', label: 'Avg Risk:Reward Ratio' },
        { name: 'maxDrawdown', type: 'number', label: 'Max Drawdown %' },
        { name: 'optimizedParameters', type: 'textarea', label: 'Optimized Parameters' },
        { name: 'suggestions', type: 'textarea', label: 'AI Suggestions' },
        { name: 'projectedPerformance', type: 'textarea', label: 'Projected Performance' },
        { name: 'performanceReport', type: 'textarea', label: 'Performance Report' },
        { name: 'insights', type: 'textarea', label: 'AI Insights' },
        { name: 'strengthsWeaknesses', type: 'textarea', label: 'Strengths & Weaknesses' },
        { name: 'recommendations', type: 'textarea', label: 'Recommendations' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      forms: [
        {
          id: 'quick-strategy',
          name: 'Quick Strategy Setup',
          description: 'Create a simple trading strategy',
          icon: '⚡',
          modelName: 'TradingStrategy',
          fields: ['name', 'symbols', 'strategyType', 'entryCondition', 'exitCondition'],
        },
        {
          id: 'advanced-strategy',
          name: 'Advanced Strategy',
          description: 'Configure detailed strategy with all parameters',
          icon: '🎯',
          modelName: 'TradingStrategy',
          fields: ['name', 'symbols', 'strategyType', 'timeframe', 'indicators', 'entryCondition', 'exitCondition', 'stopLossPercent', 'takeProfitPercent', 'positionSizePercent', 'maxPositionSize', 'tradingHours'],
        },
      ],
      actions: [
        {
          name: 'optimizeStrategy',
          title: 'Optimize Strategy',
          emoji: '🧠',
          description: 'Use AI to optimize strategy parameters',
          modelName: 'TradingStrategy',
          inputFields: ['strategyId', 'name', 'strategyType', 'indicators', 'totalPnl', 'winRate', 'avgRiskReward'],
          outputFields: ['optimizedParameters', 'suggestions', 'projectedPerformance'],
          steps: [
            {
              name: 'analyzeAndOptimize',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the trading strategy performance data and suggest optimizations. Review the strategy type, indicators used, current P&L, win rate, and risk:reward ratio. Identify areas for improvement in entry/exit conditions, indicator parameters, and risk management. Provide specific optimized parameters and projected performance improvements.',
                inputFields: ['name', 'strategyType', 'indicators', 'totalPnl', 'winRate', 'avgRiskReward'],
                outputFields: ['optimizedParameters', 'suggestions', 'projectedPerformance'],
                model: 'gpt-4o',
                temperature: 0.5,
              },
            },
          ],
        },
        {
          name: 'analyzePerformance',
          title: 'Analyze Performance',
          emoji: '📈',
          description: 'Generate comprehensive performance analytics',
          modelName: 'TradingStrategy',
          inputFields: ['strategyId', 'name', 'totalPnl', 'winRate', 'totalTrades', 'avgRiskReward', 'maxDrawdown'],
          outputFields: ['performanceReport', 'insights', 'strengthsWeaknesses', 'recommendations'],
          steps: [
            {
              name: 'generateReport',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Generate a comprehensive performance analysis report for this trading strategy. Analyze total P&L, win rate, total trades, average risk:reward ratio, and maximum drawdown. Identify key insights, strengths, and weaknesses. Provide specific, actionable recommendations to improve performance. Include statistical analysis and risk metrics.',
                inputFields: ['name', 'totalPnl', 'winRate', 'totalTrades', 'avgRiskReward', 'maxDrawdown'],
                outputFields: ['performanceReport', 'insights', 'strengthsWeaknesses', 'recommendations'],
                model: 'gpt-4o',
                temperature: 0.4,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'Trade',
      description: 'Individual trade execution with full lifecycle tracking',
      fields: [
        { name: 'tradeId', type: 'text', label: 'Trade ID', required: true },
        { name: 'symbol', type: 'text', label: 'Symbol', required: true },
        { name: 'direction', type: 'select', label: 'Direction', options: ['Long', 'Short'], required: true },
        { name: 'entryPrice', type: 'number', label: 'Entry Price', required: true },
        { name: 'quantity', type: 'number', label: 'Quantity', required: true },
        { name: 'orderType', type: 'select', label: 'Order Type', options: ['Market', 'Limit', 'Stop', 'Stop Limit'], defaultValue: 'Market' },
        { name: 'stopLoss', type: 'number', label: 'Stop Loss Price', required: true },
        { name: 'takeProfit', type: 'number', label: 'Take Profit Price', required: true },
        { name: 'strategyId', type: 'text', label: 'Strategy ID' },
        { name: 'status', type: 'select', label: 'Status', options: ['Pending', 'Validated', 'Rejected', 'Submitted', 'Filled', 'Partial', 'Closed', 'Cancelled'], defaultValue: 'Pending' },
        { name: 'riskRewardRatio', type: 'number', label: 'Risk:Reward Ratio' },
        { name: 'validationStatus', type: 'text', label: 'Validation Status' },
        { name: 'riskScore', type: 'number', label: 'Risk Score' },
        { name: 'validationNotes', type: 'textarea', label: 'Validation Notes' },
        { name: 'approved', type: 'boolean', label: 'Approved', defaultValue: false },
        { name: 'executedAt', type: 'date', label: 'Executed At' },
        { name: 'fillPrice', type: 'number', label: 'Fill Price' },
        { name: 'fillQuantity', type: 'number', label: 'Fill Quantity' },
        { name: 'orderId', type: 'text', label: 'Broker Order ID' },
        { name: 'commission', type: 'number', label: 'Commission' },
        { name: 'exitPrice', type: 'number', label: 'Exit Price' },
        { name: 'exitedAt', type: 'date', label: 'Exited At' },
        { name: 'realizedPnl', type: 'number', label: 'Realized P&L' },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      forms: [
        {
          id: 'manual-trade',
          name: 'Manual Trade Entry',
          description: 'Manually enter a trade',
          icon: '✍️',
          modelName: 'Trade',
          fields: ['symbol', 'direction', 'entryPrice', 'quantity', 'orderType', 'stopLoss', 'takeProfit', 'strategyId'],
        },
      ],
      actions: [
        {
          name: 'validateTrade',
          title: 'Validate Trade',
          emoji: '✅',
          description: 'Validate trade setup before execution',
          modelName: 'Trade',
          inputFields: ['symbol', 'direction', 'entryPrice', 'quantity', 'stopLoss', 'takeProfit', 'strategyId'],
          outputFields: ['validationStatus', 'riskScore', 'validationNotes', 'approved', 'riskRewardRatio'],
          steps: [
            {
              name: 'performValidation',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Validate this trade setup comprehensively. Calculate the risk:reward ratio from entry, stop-loss, and take-profit levels. Assess if position size is appropriate. Check if stop-loss placement is logical. Evaluate overall risk score (0-100). Determine if the trade should be approved for execution. Provide detailed validation notes explaining the decision.',
                inputFields: ['symbol', 'direction', 'entryPrice', 'quantity', 'stopLoss', 'takeProfit'],
                outputFields: ['validationStatus', 'riskScore', 'validationNotes', 'approved', 'riskRewardRatio'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'executeTrade',
          title: 'Execute Trade',
          emoji: '⚡',
          description: 'Execute trade via trading platform',
          modelName: 'Trade',
          inputFields: ['symbol', 'direction', 'entryPrice', 'quantity', 'orderType', 'stopLoss', 'takeProfit', 'approved'],
          outputFields: ['status', 'executedAt', 'fillPrice', 'fillQuantity', 'orderId', 'commission'],
          requiresConnection: 'trading-platform',
          steps: [
            {
              name: 'submitOrder',
              type: 'custom',
              order: '1',
              config: {
                prompt: 'Execute the trade order through the trading platform API',
                inputFields: ['symbol', 'direction', 'quantity', 'orderType', 'entryPrice'],
                outputFields: ['status', 'executedAt', 'fillPrice', 'fillQuantity', 'orderId', 'commission'],
                customCode: `// Execute trade via trading platform API
const authData = JSON.parse(tradingAuth);
const accessToken = authData.accessToken;

// Prepare order payload
const orderPayload = {
  symbol: symbol,
  side: direction.toLowerCase(),
  type: orderType.toLowerCase(),
  quantity: quantity,
  price: orderType === 'Market' ? undefined : entryPrice,
};

// Submit order
const response = await fetch(authData.apiUrl + '/orders', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderPayload)
});

const result = await response.json();

// Submit stop-loss order
const slOrderPayload = {
  symbol: symbol,
  side: direction === 'Long' ? 'sell' : 'buy',
  type: 'stop',
  quantity: quantity,
  stopPrice: stopLoss,
};

await fetch(authData.apiUrl + '/orders', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(slOrderPayload)
});

// Submit take-profit order
const tpOrderPayload = {
  symbol: symbol,
  side: direction === 'Long' ? 'sell' : 'buy',
  type: 'limit',
  quantity: quantity,
  price: takeProfit,
};

await fetch(authData.apiUrl + '/orders', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(tpOrderPayload)
});

return {
  status: 'Filled',
  executedAt: new Date().toISOString(),
  fillPrice: result.fillPrice || entryPrice,
  fillQuantity: result.filledQty || quantity,
  orderId: result.orderId,
  commission: result.commission || 0,
};`,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'MarketSignal',
      description: 'Trading signals detected by AI analysis',
      fields: [
        { name: 'signalId', type: 'text', label: 'Signal ID', required: true },
        { name: 'symbol', type: 'text', label: 'Symbol', required: true },
        { name: 'signalType', type: 'select', label: 'Signal Type', options: ['Entry Long', 'Entry Short', 'Exit Long', 'Exit Short', 'Take Profit', 'Stop Loss'], required: true },
        { name: 'strength', type: 'select', label: 'Strength', options: ['Weak', 'Medium', 'Strong'], required: true },
        { name: 'timeframe', type: 'select', label: 'Timeframe', options: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'], required: true },
        { name: 'triggerPrice', type: 'number', label: 'Trigger Price', required: true },
        { name: 'indicators', type: 'textarea', label: 'Indicator Values' },
        { name: 'strategyId', type: 'text', label: 'Strategy ID' },
        { name: 'confidenceScore', type: 'number', label: 'Confidence Score (0-100)' },
        { name: 'analysis', type: 'textarea', label: 'AI Analysis' },
        { name: 'recommendation', type: 'textarea', label: 'Recommendation' },
        { name: 'expiresAt', type: 'date', label: 'Expires At' },
        { name: 'actedOn', type: 'boolean', label: 'Acted On', defaultValue: false },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'createdAt', type: 'date', label: 'Created At' },
      ],
      forms: [
        {
          id: 'signal-entry',
          name: 'Market Signal',
          description: 'Record a market signal',
          icon: '🔔',
          modelName: 'MarketSignal',
          fields: ['symbol', 'signalType', 'strength', 'timeframe', 'triggerPrice', 'indicators', 'strategyId'],
        },
      ],
      actions: [
        {
          name: 'analyzeMarket',
          title: 'Analyze Market',
          emoji: '🤖',
          description: 'AI analyzes market conditions and generates signals',
          modelName: 'MarketSignal',
          inputFields: ['symbol', 'timeframe', 'triggerPrice', 'indicators'],
          outputFields: ['signalType', 'strength', 'confidenceScore', 'analysis', 'recommendation'],
          requiresConnection: 'market-data',
          steps: [
            {
              name: 'performMarketAnalysis',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze the current market conditions for this symbol. Review the price, technical indicator values, and timeframe. Identify if there is a clear entry or exit signal. Determine the signal type (Entry Long/Short, Exit, etc.), strength (Weak/Medium/Strong), and confidence score (0-100). Provide detailed analysis explaining the market structure, momentum, and why this signal is valid. Give specific recommendations including suggested entry price, stop-loss, and take-profit levels.',
                inputFields: ['symbol', 'timeframe', 'triggerPrice', 'indicators'],
                outputFields: ['signalType', 'strength', 'confidenceScore', 'analysis', 'recommendation'],
                model: 'gpt-4o',
                temperature: 0.4,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'PortfolioPosition',
      description: 'Active positions in the trading portfolio',
      fields: [
        { name: 'positionId', type: 'text', label: 'Position ID', required: true },
        { name: 'symbol', type: 'text', label: 'Symbol', required: true },
        { name: 'direction', type: 'select', label: 'Direction', options: ['Long', 'Short'], required: true },
        { name: 'quantity', type: 'number', label: 'Quantity', required: true },
        { name: 'entryPrice', type: 'number', label: 'Entry Price', required: true },
        { name: 'currentPrice', type: 'number', label: 'Current Price', required: true },
        { name: 'stopLoss', type: 'number', label: 'Stop Loss', required: true },
        { name: 'takeProfit', type: 'number', label: 'Take Profit', required: true },
        { name: 'unrealizedPnl', type: 'number', label: 'Unrealized P&L' },
        { name: 'unrealizedPnlPercent', type: 'number', label: 'Unrealized P&L %' },
        { name: 'holdingMinutes', type: 'number', label: 'Holding Time (minutes)' },
        { name: 'tradeId', type: 'text', label: 'Trade ID' },
        { name: 'strategyId', type: 'text', label: 'Strategy ID' },
        { name: 'riskScore', type: 'number', label: 'Risk Score' },
        { name: 'riskLevel', type: 'select', label: 'Risk Level', options: ['Low', 'Medium', 'High', 'Critical'] },
        { name: 'suggestions', type: 'textarea', label: 'AI Suggestions' },
        { name: 'maxAdditionalExposure', type: 'number', label: 'Max Additional Exposure' },
        { name: 'recommendation', type: 'textarea', label: 'Position Management Recommendation' },
        { name: 'adjustedStopLoss', type: 'number', label: 'Adjusted Stop Loss' },
        { name: 'adjustedTakeProfit', type: 'number', label: 'Adjusted Take Profit' },
        { name: 'suggestedAction', type: 'select', label: 'Suggested Action', options: ['Hold', 'Move SL to Breakeven', 'Take Partial Profit', 'Close Position', 'Adjust TP', 'Trail Stop'] },
        { name: 'workspaceId', type: 'text', label: 'Workspace ID' },
        { name: 'openedAt', type: 'date', label: 'Opened At' },
        { name: 'updatedAt', type: 'date', label: 'Updated At' },
      ],
      forms: [],
      actions: [
        {
          name: 'assessRisk',
          title: 'Assess Portfolio Risk',
          emoji: '🛡️',
          description: 'Evaluate overall portfolio risk',
          modelName: 'PortfolioPosition',
          inputFields: ['symbol', 'quantity', 'entryPrice', 'currentPrice', 'stopLoss', 'unrealizedPnl'],
          outputFields: ['riskScore', 'riskLevel', 'suggestions', 'maxAdditionalExposure'],
          steps: [
            {
              name: 'calculateRisk',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Assess the risk of this portfolio position. Calculate total risk exposure, evaluate position size relative to account, check if unrealized P&L indicates potential danger, determine risk score (0-100) and risk level (Low/Medium/High/Critical). Provide suggestions for risk mitigation. Calculate maximum additional exposure that can be safely taken.',
                inputFields: ['symbol', 'quantity', 'entryPrice', 'currentPrice', 'stopLoss', 'unrealizedPnl'],
                outputFields: ['riskScore', 'riskLevel', 'suggestions', 'maxAdditionalExposure'],
                model: 'gpt-4o',
                temperature: 0.3,
              },
            },
          ],
        },
        {
          name: 'managePosition',
          title: 'Manage Position',
          emoji: '📊',
          description: 'AI-driven position management recommendations',
          modelName: 'PortfolioPosition',
          inputFields: ['symbol', 'direction', 'quantity', 'entryPrice', 'currentPrice', 'stopLoss', 'takeProfit', 'unrealizedPnl', 'holdingMinutes'],
          outputFields: ['recommendation', 'adjustedStopLoss', 'adjustedTakeProfit', 'suggestedAction'],
          steps: [
            {
              name: 'analyzePosition',
              type: 'ai_reasoning',
              order: '1',
              config: {
                prompt: 'Analyze this open position and provide management recommendations. Consider entry price, current price, unrealized P&L, and time held. Evaluate if stop-loss should be moved to breakeven or trailed. Assess if take-profit should be adjusted. Determine if partial profit-taking is warranted. Suggest specific adjusted stop-loss and take-profit levels. Provide clear recommended action (Hold, Move SL to Breakeven, Take Partial Profit, Close Position, etc.) with detailed reasoning.',
                inputFields: ['direction', 'entryPrice', 'currentPrice', 'stopLoss', 'takeProfit', 'unrealizedPnl', 'holdingMinutes'],
                outputFields: ['recommendation', 'adjustedStopLoss', 'adjustedTakeProfit', 'suggestedAction'],
                model: 'gpt-4o',
                temperature: 0.5,
              },
            },
          ],
        },
      ],
    },
  ],

  schedules: [
    {
      id: 'scan-markets-signals',
      name: 'Scan Markets for Signals',
      description: 'Continuously scan markets for trading signals based on active strategies',
      mode: 'recurring',
      intervalHours: 1, // Every hour
      actionIds: ['scan-for-signals-action'],
      steps: [
        {
          modelName: 'TradingStrategy',
          query: 'status is Active',
          actionName: 'scanForSignals',
          actionId: 'scan-for-signals-action',
          order: 1,
        },
      ],
    },
    {
      id: 'analyze-execute-signals',
      name: 'Analyze and Execute Signals',
      description: 'Analyze detected signals and execute valid trades',
      mode: 'recurring',
      intervalHours: 1,
      actionIds: ['analyze-market-action', 'validate-trade-action', 'execute-trade-action'],
      steps: [
        {
          modelName: 'MarketSignal',
          query: 'actedOn is false and strength is Strong and confidenceScore > 70',
          actionName: 'analyzeMarket',
          actionId: 'analyze-market-action',
          order: 1,
        },
        {
          modelName: 'Trade',
          query: 'status is Pending',
          actionName: 'validateTrade',
          actionId: 'validate-trade-action',
          order: 2,
        },
        {
          modelName: 'Trade',
          query: 'status is Validated and approved is true',
          actionName: 'executeTrade',
          actionId: 'execute-trade-action',
          order: 3,
        },
      ],
    },
    {
      id: 'monitor-manage-positions',
      name: 'Monitor and Manage Positions',
      description: 'Monitor open positions and adjust stop-loss/take-profit levels',
      mode: 'recurring',
      intervalHours: 2,
      actionIds: ['assess-risk-action', 'manage-position-action'],
      steps: [
        {
          modelName: 'PortfolioPosition',
          query: 'riskLevel is High or riskLevel is Critical',
          actionName: 'assessRisk',
          actionId: 'assess-risk-action',
          order: 1,
        },
        {
          modelName: 'PortfolioPosition',
          query: 'unrealizedPnlPercent > 5',
          actionName: 'managePosition',
          actionId: 'manage-position-action',
          order: 2,
        },
      ],
    },
    {
      id: 'daily-performance-analysis',
      name: 'Daily Performance Analysis',
      description: 'Analyze trading performance and optimize strategies daily',
      mode: 'recurring',
      intervalHours: 24, // Daily
      actionIds: ['analyze-performance-action', 'optimize-strategy-action'],
      steps: [
        {
          modelName: 'TradingStrategy',
          query: 'status is Active and totalTrades > 10',
          actionId: 'analyze-performance-action',
          actionName: 'analyzePerformance',
          order: 1,
        },
        {
          modelName: 'TradingStrategy',
          query: 'totalTrades > 20 and winRate < 50',
          actionName: 'optimizeStrategy',
          actionId: 'optimize-strategy-action',
          order: 2,
        },
      ],
    },
    {
      id: 'weekly-strategy-review',
      name: 'Weekly Strategy Review',
      description: 'Comprehensive weekly review of all strategies and portfolio health',
      actionIds: [],
      mode: 'recurring',
      intervalHours: 168, // Weekly (7 days)
      steps: [
        {
          modelName: 'TradingStrategy',
          query: 'status is Active',
          actionName: 'analyzePerformance',
          order: 1,
        },
        {
          modelName: 'PortfolioPosition',
          actionName: 'assessRisk',
          order: 2,
        },
      ],
    },
  ],

  usageCount: 234,
  viewCount: 1523,
  rating: 4.8,
  reviewCount: 17,
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-20'),
  badges: ['NEW', 'FEATURED'],
}

