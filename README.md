# 🤖 AI Trading Agent with Real-Time Social Sentiment Analysis

> **Transform social media buzz into actionable trading signals using AI-powered analysis**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Inngest](https://img.shields.io/badge/Inngest-3.39.1-purple?style=for-the-badge)](https://www.inngest.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.0-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-0.24.1-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

![AI Trading Agent Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=AI+Trading+Agent+Demo+%E2%80%A2+Real-time+Progress+Tracking)

## 🎯 What This Does

This AI Trading Agent analyzes **real-time social media sentiment** from LunarCrush's API and generates **intelligent trading signals** using Google's Gemini AI. Watch as it processes social data through a **7-step background workflow** with live progress tracking.

### ⚡ **Live Demo**: [Coming Soon - Deploy to Vercel →](https://vercel.com/new/clone?repository-url=https://github.com/danilobatson/ai-trading-agent-mcp)

### 🔥 **Key Features**

- 🚀 **Real-time Progress Tracking** - Watch AI analysis happen step-by-step with live updates
- 🧠 **AI-Powered Signals** - Google Gemini generates BUY/SELL/HOLD recommendations with confidence scores
- 📊 **Social Sentiment Analysis** - LunarCrush social data drives trading decisions using unique metrics
- ⚡ **Background Processing** - Inngest handles complex workflows without blocking the UI
- 💾 **Real-time Database** - Supabase with live subscriptions for instant progress updates
- 🎨 **Beautiful Dashboard** - Professional UI with loading states and animations
- 🔔 **Discord Alerts** - Optional notifications for new trading signals

---

## 🚀 Quick Start (5 Minutes)

**For experienced developers who want to get running fast:**

```bash
# 1. Clone and install
git clone https://github.com/danilobatson/ai-trading-agent-mcp.git
cd ai-trading-agent-mcp
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Add your API keys (see detailed setup below)
# Edit .env.local with your 5 required API keys

# 4. Set up database tables
# Copy SQL schema below → paste in Supabase SQL Editor

# 5. Start development
npm run dev          # Next.js app (localhost:3000)
npm run inngest:dev  # Inngest dev server (localhost:8288)
```

**🎯 Need the detailed setup?** Continue reading for step-by-step instructions with account creation guides. Review our guide on [dev.to](https://www.dev.to) if you need more assistance

---

## 📋 Prerequisites

**You'll Need:**
- Node.js 18+ installed
- Basic knowledge of React/TypeScript
- A code editor (VS Code recommended)
- 20 minutes for complete setup

**5 API Keys Required:**
1. 🌙 **LunarCrush API**  *Subscription required*
2. 🤖 **Google Gemini API** (AI analysis) - *Free tier available*
3. 🗄️ **Supabase** (database & real-time) - *Free tier available*
4. ⚡ **Inngest** (background jobs) - *Free tier available*

---

## 🔧 Detailed Setup Guide

### Step 1: Project Installation

```bash
# Clone the repository
git clone https://github.com/danilobatson/ai-trading-agent-mcp.git
cd ai-trading-agent-mcp

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Step 2: LunarCrush API Setup 🌙

LunarCrush provides real-time social sentiment data for cryptocurrencies with unique metrics like AltRank™ and Galaxy Score™.

1. **Sign up**: Visit [lunarcrush.com/signup](https://lunarcrush.com/signup)
2. **Choose a plan**:
   - **Individual** - Perfect for this project
   - **Builder** - For production apps
3. **[Generate API key](https://lunarcrush.com/developers/api/authentication)**
4. **Add to .env.local**:

```env
LUNARCRUSH_API_KEY=your_api_key_here
```

**💡 Why LunarCrush?** Powers the social sentiment analysis with unique metrics unavailable elsewhere:
- **Mentions**: Social post volume (24h)
- **Interactions**: Total social engagement
- **Creators**: Unique content creators (diversity indicator)
- **AltRank™**: Proprietary market + social ranking
- **Galaxy Score™**: Asset health indicator (0-100)

### Step 3: Google Gemini AI Setup 🤖

Google's Gemini AI generates intelligent trading recommendations based on social patterns.

1. **Get API key**: Visit [aistudio.google.com](https://aistudio.google.com/)
2. **Create new project** or use existing one
3. **Generate API key**: API Keys → Create API Key
4. **Add to .env.local**:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

**💡 Why Gemini?** Excellent reasoning capabilities for financial analysis and trading signal generation with structured outputs.

### Step 4: Supabase Database Setup 🗄️

Supabase provides PostgreSQL database with real-time subscriptions for live progress tracking.

1. **Create account**: Visit [supabase.com](https://supabase.com/) → "Start your project"
2. **Create new project**:
   - Project name: `ai-trading-agent`
   - Database password: (save this securely)
   - Region: Choose closest to you
3. **Get credentials**: Click Project Overview
   - Copy **Project URL** and **anon public key**
4. **Add to .env.local**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**💡 Why Supabase?** Real-time database updates power our live progress tracking without polling.

### Step 5: Database Schema Creation 📊

**In your Supabase dashboard:**

1. Go to **SQL Editor**
2. Click **"New query"**
3. **Copy and paste this entire script**:

```sql
-- AI Trading Agent Database Schema
-- Copy and paste this entire script into your Supabase SQL Editor

-- Table: trading_signals
-- Stores AI-generated trading signals with confidence scores and reasoning
CREATE TABLE trading_signals (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  signal TEXT NOT NULL CHECK (signal IN ('BUY', 'SELL', 'HOLD')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  reasoning TEXT NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for trading_signals table (for performance)
CREATE INDEX idx_trading_signals_symbol ON trading_signals (symbol);
CREATE INDEX idx_trading_signals_created_at ON trading_signals (created_at DESC);
CREATE INDEX idx_trading_signals_signal ON trading_signals (signal);

-- Table: analysis_jobs
-- Tracks background job progress and status for real-time UI updates
CREATE TABLE analysis_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'started',
  current_step TEXT DEFAULT 'Initializing...',
  step_message TEXT DEFAULT 'Starting analysis...',
  progress_percentage INTEGER DEFAULT 0,
  event_data JSONB,
  signals_generated INTEGER DEFAULT 0,
  alerts_generated INTEGER DEFAULT 0,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analysis_jobs table (for performance)
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs (status);
CREATE INDEX analysis_jobs_progress_idx ON analysis_jobs (status, started_at DESC, progress_percentage);
```

4. **Click "Run"** to execute the script
5. **Verify tables**: Go to Table Editor → you should see `trading_signals` and `analysis_jobs` tables

### Step 6: Inngest Background Jobs Setup ⚡

Inngest handles our AI analysis pipeline with real-time progress tracking.

1. **Create account**: Visit [inngest.com](https://www.inngest.com/) → "Sign up"
2. **Create new app**:
   - App name: `ai-trading-agent`
3. **Get keys**: Settings → Keys
   - Copy **Event Key** (starts with `inngest_`)
   - Copy **Signing Key** (starts with `signkey_`)
4. **Add to .env.local**:

```env
INNGEST_EVENT_KEY=inngest_your_event_key_here
INNGEST_SIGNING_KEY=signkey_your_signing_key_here
```

**💡 Why Inngest?** Enables complex multi-step AI workflows with real-time progress tracking without blocking the user interface.


### Step 7: Final Environment Check ✅

Your `.env.local` should look like this:

```env
# LunarCrush API (Required)
LUNARCRUSH_API_KEY=lc_your_key_here

# Google Gemini AI (Required)
GOOGLE_GEMINI_API_KEY=your_gemini_key_here

# Supabase Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Inngest Background Jobs (Required)
INNGEST_EVENT_KEY=inngest_your_event_key_here
INNGEST_SIGNING_KEY=signkey_your_signing_key_here
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Next.js App:**
```bash
npm run dev
```
→ Visit [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Inngest Dev Server:**
```bash
npm run inngest:dev
```
→ Visit [http://localhost:8288](http://localhost:8288) for job monitoring

### Testing the Complete Pipeline

1. **Open the app**: [http://localhost:3000](http://localhost:3000)
2. **Click "Generate Trading Signals"**
3. **Watch real-time progress**: 7-step analysis with live progress tracking
4. **Monitor Inngest**: Check [localhost:8288](http://localhost:8288) for detailed job execution
5. **View results**: Trading signals appear automatically when complete

**Expected Flow:**
```
Initialize Analysis (14%) →
Prepare Symbol List (28%) →
Fetch Social Data (42%) →
AI Signal Generation (57%) →
Save to Database (71%) →
Generate Summary (85%) →
Complete Analysis (100%)
```

---

## 🏗️ Architecture Overview

### Technology Stack

| Component           | Technology                         | Purpose                                       |
| ------------------- | ---------------------------------- | --------------------------------------------- |
| **Frontend**        | Next.js 15 + React 19 + TypeScript | Modern web application with server components |
| **Styling**         | Tailwind CSS v4                    | Responsive, professional UI                   |
| **Background Jobs** | Inngest                            | Multi-step AI workflow processing             |
| **Database**        | Supabase (PostgreSQL)              | Real-time data storage with subscriptions     |
| **AI Analysis**     | Google Gemini                      | Trading signal generation                     |
| **Social Data**     | LunarCrush API                     | Crypto sentiment analysis with unique metrics |

### Data Flow Architecture

```mermaid
    A[User Triggers Analysis] --> B[Inngest Background Job]
    B --> C[LunarCrush API]
    C --> D[Social Metrics]
    D --> E[Google Gemini AI]
    E --> F[Trading Signals]
    F --> G[Supabase Database]
    G --> H[Real-time UI Updates]
```

### Real-Time Progress System

```typescript
// Real-time progress tracking flow
1. User clicks "Generate Trading Signals"
2. Frontend calls /api/trigger → generates jobId
3. Inngest workflow starts → uses consistent jobId
4. Each step updates database → analysis_jobs table
5. Frontend subscribes → Supabase real-time events
6. Progress bar advances → 14% → 28% → ... → 100%
7. Signals appear → when job status = 'completed'
```

### Key Files Structure

```
src/
├── app/
│   ├── api/
│   │   ├── signals/route.ts      # Fetch trading signals & jobs
│   │   ├── trigger/route.ts      # Start analysis pipeline
│   │   ├── job-status/route.ts   # Check job progress
│   │   └── inngest/route.ts      # Inngest webhook endpoint
│   ├── layout.tsx                # App layout with metadata
│   └── page.tsx                  # Main dashboard with real-time UI
├── functions/
│   └── signal-analysis.ts        # 7-step Inngest workflow
├── hooks/
│   └── useJobProgress.ts        # Progress supabase subscription
├── lib/
│   ├── lunarcrush.ts            # LunarCrush API client
│   ├── gemini.ts                # Google AI integration
│   ├── supabase.ts              # Database operations
│   ├── inngest.ts               # Background job client
│   └── signal-generator.ts      # Signal generation logic
├── types/
│   └── trading.ts               # TypeScript interfaces
└── package.json                 # Dependencies & scripts
```

---

## 🧪 Testing & Debugging

### Development Tools

**Inngest Dev Server** ([localhost:8288](http://localhost:8288)) provides:
- ✅ **Job execution status** - See each step complete in real-time
- 📊 **Step-by-step progress** - Monitor the 7-step workflow
- 🐛 **Error logs and debugging** - Detailed error messages
- ⏱️ **Performance metrics** - Track job duration and bottlenecks

**Supabase Dashboard** provides:
- 🔍 **Real-time table data** - View signals and jobs as they're created
- 📈 **Query performance** - Monitor database response times
- 🔄 **Subscription monitoring** - Track real-time connections
- 📊 **API usage metrics** - Monitor database load

### Testing the Pipeline

```bash
# Test individual components
curl http://localhost:3000/api/signals           # Check signal retrieval
curl -X POST http://localhost:3000/api/trigger   # Trigger analysis

# Full integration test
1. Trigger analysis from UI
2. Watch progress in real-time
3. Check Inngest dashboard for detailed logs
4. Verify signals saved in Supabase
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

| Issue                                | Symptoms                                      | Solution                                                                                        |
| ------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Inngest Functions Not Triggering** | Progress stuck at 0%, no job creation         | Verify `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`, ensure `npm run inngest:dev` is running   |
| **Database Connection Errors**       | "Database connection failed"                  | Check Supabase URL/key in `.env.local`, verify tables exist, check network connectivity         |
| **LunarCrush 401 Unauthorized**      | "Invalid API key" error                       | Verify API key format (`lc_...`) and active subscription at lunarcrush.com                      |
| **Gemini AI Errors**                 | "AI analysis failed"                          | Check Google AI API key, verify quota limits at aistudio.google.com                             |
| **Real-time Updates Not Working**    | Progress doesn't update, signals don't appear | Ensure Supabase anon key has correct permissions, check browser console for subscription errors |
| **Rate Limiting (429 Errors)**       | Analysis fails mid-process                    | LunarCrush Individual plan: 10 req/min limit. Add delays or upgrade to Builder plan             |

### Debug Workflow

**If the app isn't working:**

1. ✅ **Check environment variables**: All 5 required keys in `.env.local`
2. ✅ **Verify database tables**: Run the SQL schema in Supabase SQL Editor
3. ✅ **Confirm API subscriptions**: LunarCrush plan active, Gemini quota available
4. ✅ **Test Inngest connection**: Ensure dev server running on localhost:8288
5. ✅ **Check browser console**: Look for JavaScript errors or network failures
6. ✅ **Monitor database activity**: Watch Supabase logs for real-time events
7. ✅ **Restart development servers**: Stop and restart both `npm run dev` and `npm run inngest:dev`

### API Rate Limits

**LunarCrush API Limits:**
- **Individual Plan**: 10 requests/minute, 2,000/day
- **Builder Plan**: 100 requests/minute, 20,000/day

**Google Gemini Limits:**
- **Free Tier**: 15 requests/minute, 1,500/day
- **Paid Tier**: 1,000 requests/minute

**If you hit limits:**
- Analysis will fail gracefully with error messages
- Upgrade your plan for higher limits
- The system includes rate limiting delays to prevent most issues

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danilobatson/ai-trading-agent-mcp)

**Manual Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Configure environment variables in Vercel dashboard
# Add all 5 API keys from your .env.local
```

**Environment Variables in Vercel:**
1. Go to your project dashboard → Settings → Environment Variables
2. Add each variable from your `.env.local`:
   - `LUNARCRUSH_API_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`

### Production Configuration

**Inngest Production Setup:**
1. **Create production app** in Inngest dashboard
2. **Add production URL**: `https://your-app.vercel.app/api/inngest`
3. **Update environment variables** with production keys

**Supabase Production:**
- Database automatically scales
- Consider enabling Row Level Security (RLS) for enhanced security
- Monitor usage in Supabase dashboard

### Alternative Deployment Platforms

- **Netlify**: `npm run build && netlify deploy --prod`
- **Railway**: Connect GitHub repo and configure environment variables
- **AWS/GCP**: Use your preferred containerization strategy

---

## 📈 Performance & Scaling

### Current Performance

- **Initial load**: ~500ms (optimized Next.js with static generation)
- **Real-time updates**: <100ms latency via Supabase subscriptions
- **AI processing**: ~30-45 seconds for complete 5-symbol analysis
- **Background jobs**: Handled efficiently via Inngest with automatic retries

### Scaling Considerations

**For high-volume usage:**

- **LunarCrush API**: Upgrade to Builder plan (100 req/min vs 10 req/min)
- **Database**: Implement connection pooling and read replicas
- **AI processing**: Batch requests and implement response caching
- **Background jobs**: Inngest scales automatically with usage tiers

**Performance Optimizations Included:**
- **Rate limiting**: Built-in delays prevent API quota exhaustion
- **Database indexing**: Optimized queries for fast signal retrieval
- **Real-time subscriptions**: No polling overhead
- **Efficient caching**: Next.js static generation where possible

---

## 🤝 Contributing

**Want to contribute? Here's how:**

1. 🍴 **Fork the repository**
2. 🌿 **Create feature branch**: `git checkout -b feature/amazing-feature`
3. 💾 **Commit changes**: `git commit -m 'Add amazing feature'`
4. 📤 **Push to branch**: `git push origin feature/amazing-feature`
5. 🎯 **Open Pull Request**

**Contribution Ideas:**
- 🤖 Support for other AI providers (Claude, OpenAI)
- 📈 More sophisticated trading strategies and signals
- 🧪 Comprehensive test suite with integration tests
- 📱 Mobile app version using React Native

**Development Guidelines:**
- Follow TypeScript strict mode
- Add tests for new features
- Update documentation
- Maintain performance standards

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

**Built with amazing open-source technologies:**

- 🌙 **[LunarCrush](https://lunarcrush.com/)** - Real-time social sentiment data with unique metrics
- 🤖 **[Google AI](https://ai.google.dev/)** - Gemini AI for intelligent trading analysis
- ⚡ **[Inngest](https://www.inngest.com/)** - Background job processing and workflow orchestration
- 🗄️ **[Supabase](https://supabase.com/)** - Real-time database with subscriptions
- ⚛️ **[Next.js](https://nextjs.org/)** - React framework with server components
- 🎨 **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling framework

---

## 📞 Connect & Support

**Built by [Danilo Batson](https://danilobatson.github.io/)**

[![Portfolio](https://img.shields.io/badge/Portfolio-danilobatson.github.io-blue?style=for-the-badge)](https://danilobatson.github.io/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/danilo-batson)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/danilobatson)

**⭐ Star this repo** if it helped you learn something new!

**Questions?** Open an [issue](https://github.com/danilobatson/ai-trading-agent-mcp/issues) - I respond to every one!

---

## 🚀 Ready to Get Started?

1. **🔥 [Clone the Repository](https://github.com/danilobatson/ai-trading-agent-mcp)**
2. **📚 [Follow the Setup Guide](#detailed-setup-guide)**
3. **🚀 [Deploy to Production](#deployment)**
4. **💬 [Join the Discussion](https://github.com/danilobatson/ai-trading-agent-mcp/discussions)**

---

*"Transform social buzz into trading intelligence with AI-powered analysis"* 🤖📈

**Built for developers who want to:**
- ✅ **Learn modern AI integration patterns**
- ✅ **Build production-ready trading applications**
- ✅ **Understand real-time data processing**
- ✅ **Create impressive portfolio projects**
- ✅ **Interview at top tech companies**

**Start building your AI trading agent today!** 🚀
