# Introduction

## What is Ryu?

Ryu is the first position marketplace on Hyperliquid L1, where AI trading agents and leveraged positions become tradable assets. Build strategies by prompt, list agents for sale, and trade positions that don't die—they evolve.

## Core Innovation: Continuation Trading

**The Problem**: In traditional trading, stop-loss = wasted opportunity. Position closes, liquidity evaporates, AI logic disappears.

**The Solution**: Positions become tradable assets with embedded AI reasoning. When you exit, someone else can continue your trade at a discount.

### Why This Matters

1. **New Asset Class**: "AI-reasoned leveraged positions" - positions WITH context
2. **Dynamic Pricing**: Market decides value based on conviction and AI logic
3. **Smarter Liquidity**: Converts stop-losses into new entry opportunities
4. **Creator Economy**: Original AI creators earn royalties on continuations

## Three Core Features

### 1. **Build AI Agents**
Create trading strategies using natural language prompts. AI generates complete logic, deploys on Hyperliquid perps.

### 2. **Sell Your Agents**
List agents on marketplace. Earn subscriptions + 5% continuation royalties. Build reputation through performance.

### 3. **Trade Positions**
Buy leveraged positions others exited. Get discounts, inherit leverage, access full AI reasoning. Positions don't die—they become opportunities.

## Key Benefits

### For Retail Traders
- **No Coding Required** - Build trading strategies through intuitive interfaces
- **Visual Portfolio Management** - See your holdings and performance at a glance
- **Automated Monitoring** - AI watches markets 24/7 so you don't have to
- **AI-Powered Analysis** - Get intelligent market insights and trade suggestions

### For Professional Traders
- **Advanced Strategies** - Build complex multi-indicator strategies
- **Multi-Exchange Support** - Trade across all major exchanges from one platform
- **Risk Management** - Built-in position sizing and risk controls
- **Backtesting** - Test strategies against historical data with AI analysis

## What Can You Build?

Ryu supports a wide range of use cases:

### Content Creation & Management
- Generate social media content from templates
- Create personalized emails at scale
- Produce product descriptions automatically
- Design marketing materials with AI

### Data Processing & Analysis
- Analyze customer feedback and sentiment
- Process forms and extract insights
- Categorize and tag content automatically
- Generate reports from raw data

### Marketing Automation
- Post content across multiple platforms
- Track campaign performance
- Manage influencer relationships
- Automate lead nurturing

### Operations & Workflows
- Process applications and submissions
- Route tasks based on AI analysis
- Generate documents from templates
- Sync data across multiple systems

## How It Works

### The Big Picture

1. **Create an Agent** - Your automation workspace container
2. **Set Up Workspaces** - Organize different projects or environments
3. **Define Models** - Structure your data with custom fields
4. **Build Forms** - Allow users to input data easily
5. **Create Actions** - Define AI-powered processing steps
6. **Connect APIs** - Integrate external services
7. **Schedule Tasks** - Automate execution across your data

### Data Flow Example

```
User fills Form → Record created in Sheet → Schedule triggers Action
  → AI processes data → API posts to external service → Results saved to Sheet
    → Child records created in related tables → Process repeats
```

## Key Components Overview

### Agents
Top-level entities that contain all your automation resources. Think of an agent as a complete automation project.

### Workspaces
Organizational containers within agents. Each workspace is a self-contained environment with its own models and API connections.

### Models
Data structures that define what information you track. Each model has a sheet (table) for storing records.

### Sheets
Database-like tables with fields (columns) and records (rows). Your structured data lives here.

### Forms
User-friendly interfaces for creating new records in your sheets. Forms map to model fields.

### Actions
AI-powered workflows that process data. Actions can reason, generate content, call APIs, and update records.

### API Connections
OAuth-authenticated connections to external services like Facebook, Threads, Google, etc.

### Schedules
Automated timers that execute actions on table rows at specified intervals.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                           AGENT                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     WORKSPACE 1                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Model A    │  │   Model B    │  │ Connections │ │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │ ┌─────────┐ │ │  │
│  │  │  │ Sheet  │  │  │  │ Sheet  │  │  │ │Facebook │ │ │  │
│  │  │  │ Fields │  │  │  │ Fields │  │  │ │ Threads │ │ │  │
│  │  │  │ Records│  │  │  │ Records│  │  │ │  Gmail  │ │ │  │
│  │  │  └────────┘  │  │  └────────┘  │  │ └─────────┘ │ │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  └─────────────┘ │  │
│  │  │  │ Forms  │  │  │  │ Forms  │  │                   │  │
│  │  │  └────────┘  │  │  └────────┘  │                   │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │                   │  │
│  │  │  │Actions │  │  │  │Actions │  │                   │  │
│  │  │  └────────┘  │  │  └────────┘  │                   │  │
│  │  └──────────────┘  └──────────────┘                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     WORKSPACE 2                        │  │
│  │                        ...                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

Ready to dive in? Proceed to the [Quick Start Guide](./02-quick-start.md) to build your first agent and automation workflow.

## Documentation Structure

This documentation is organized to guide you from basic concepts to advanced usage:

1. **Getting Started** (Docs 1-3) - Introduction and quick start
2. **Core Components** (Docs 4-7) - Understanding the building blocks
3. **Features** (Docs 8-12) - Working with forms, actions, and integrations
4. **Advanced** (Docs 13-16) - Deep dives and best practices

Navigate through the documentation sequentially for a comprehensive understanding, or jump to specific topics as needed.

