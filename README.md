# AI Trading Agent with LunarCrush Social Analytics

An AI-powered trading agent that analyzes social sentiment using LunarCrush's unique metrics: mentions, interactions, creators, and AltRank.

## Quick Start

1. Clone and install:
```bash
git clone [your-repo-url]
cd ai-trading-agent-mcp
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. Start development:
```bash
npm run dev
# In another terminal:
npm run inngest:dev
```

## Environment Variables

- `LUNARCRUSH_API_KEY` - Get from https://lunarcrush.com/developers
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` - From your Supabase project
- `INNGEST_EVENT_KEY` & `INNGEST_SIGNING_KEY` - From Inngest dashboard
- `OPENAI_API_KEY` - For AI signal analysis

## Architecture

- **Next.js 15** - Modern React framework with app directory
- **LunarCrush API** - Social analytics focusing on key differentiators
- **Inngest** - Background job processing for signal analysis
- **Supabase** - Database for storing signals and metrics
- **OpenAI** - AI agent for trading signal generation
- **MCP** - Model Context Protocol for AI agent communication

## Key Metrics

This project focuses on LunarCrush's unique advantages:
- **Mentions** (posts_active) - Social post volume
- **Interactions** - Total social engagement
- **Creators** (contributors_active) - Unique content creators
- **AltRank** - Proprietary market + social ranking

These metrics provide insights unavailable elsewhere!
