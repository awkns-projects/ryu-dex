# Ryu Documentation

Welcome to Ryu - the first position marketplace on Hyperliquid L1. Build AI trading agents, trade positions as assets, and earn from your trading logic.

## What is Ryu?

Ryu introduces three revolutionary features for perpetual futures trading:

### 1. AI Agent Builder
- **Prompt-Based Creation** - Describe your strategy in natural language
- **Complete Logic Generation** - AI generates entry, exit, position sizing, risk rules
- **Hyperliquid Native** - Deploy directly on Hyperliquid L1 perpetual futures
- **Full Transparency** - Every decision includes AI reasoning

### 2. Agent Marketplace
- **List for Sale** - Earn recurring revenue from your trading strategies
- **Subscription Model** - Traders pay monthly to use your agent
- **Reputation System** - Build trust through performance history
- **Royalty Earnings** - 5% royalties when others continue your positions

### 3. Continuation Trading (The Innovation)
- **Positions as Assets** - Leveraged positions become tradable after stop-loss
- **Discounted Entries** - Buy positions others exited at 10-20% discounts
- **Leverage Inheritance** - Continue trades with original leverage intact
- **AI Context Included** - Full reasoning and strategy logic embedded
- **Multi-Trader Lifecycle** - Positions can evolve across multiple owners

## Quick Navigation

### Getting Started
- [Introduction](./01-introduction.md) - Platform overview and key benefits
- [Quick Start Guide](./02-quick-start.md) - Get up and running in minutes
- [Core Concepts](./03-core-concepts.md) - Essential terminology and architecture

### Core Components
- [Agents](./04-agents.md) - Understanding and managing agents
- [Workspaces](./05-workspaces.md) - Organizing your automation environment
- [Models & Sheets](./06-models-and-sheets.md) - Structuring your data
- [Fields & Records](./07-fields-and-records.md) - Working with data

### Features
- [Forms](./08-forms.md) - Creating user input interfaces
- [Actions](./09-actions.md) - Building AI-powered workflows
- [Action Steps](./10-action-steps.md) - Configuring multi-step processes
- [API Connections](./11-api-connections.md) - Integrating external services
- [Scheduling](./12-scheduling.md) - Automating recurring tasks

### Advanced Topics
- [Data Flow & Relationships](./13-data-flow.md) - Understanding input/output patterns
- [Best Practices](./14-best-practices.md) - Tips for optimal usage
- [Use Cases & Examples](./15-use-cases.md) - Real-world scenarios
- [Troubleshooting](./16-troubleshooting.md) - Common issues and solutions

## Key Features at a Glance

### 🤖 Intelligent Agents
Create multiple agents, each with their own workspaces, models, and automation workflows.

### 📊 Flexible Data Models
Structure your data with sheets that behave like databases, with customizable fields and unlimited records.

### 📝 Dynamic Forms
Build forms for human data input that automatically create records in your sheets.

### ⚡ Powerful Actions
Configure multi-step AI actions that can:
- Perform AI reasoning and analysis
- Generate images with AI
- Execute API calls to external services
- Store results back into your sheets

### 🔗 API Integrations
Connect to external services (Facebook, Threads, and more) with OAuth authentication. Each workspace can have one connection per service type.

### ⏰ Smart Scheduling
Set up automated schedules to process entire tables, running actions on each row at specified intervals.

## System Architecture

```
Agent
  └── Workspace (multiple)
       ├── Models (multiple)
       │    ├── Sheet (fields + records)
       │    ├── Forms (multiple)
       │    └── Actions (multiple)
       │         └── Steps (multiple)
       │              ├── AI Reasoning
       │              ├── AI Image Generation
       │              └── API Execution
       └── API Connections (one per type)
            └── OAuth Configuration
```

## Who Should Use This Platform?

- **Business Analysts** - Automate data processing and analysis
- **Marketing Teams** - Manage campaigns across multiple platforms
- **Operations Teams** - Streamline workflow automation
- **Product Managers** - Build prototypes and MVPs quickly
- **Anyone** - Looking to leverage AI without coding

## Next Steps

1. Start with the [Introduction](./01-introduction.md) to understand the platform philosophy
2. Follow the [Quick Start Guide](./02-quick-start.md) to build your first agent
3. Explore [Core Concepts](./03-core-concepts.md) to deepen your understanding
4. Check out [Use Cases & Examples](./15-use-cases.md) for inspiration

## Need Help?

- Review the [Troubleshooting Guide](./16-troubleshooting.md)
- Check the [Best Practices](./14-best-practices.md)
- Explore real-world [Use Cases](./15-use-cases.md)

---

**Version:** 1.0  
**Last Updated:** October 2025


