// Core LunarCrush Social Metrics (The Key Differentiators)
export interface SocialMetrics {
  symbol: string;
  name: string;
  
  // Key LunarCrush Metrics - These are what differentiate us from competitors
  mentions: number;           // posts_active - Number of social posts mentioning the asset
  interactions: number;       // Total social engagements (likes, comments, shares, views)
  creators: number;          // contributors_active - Number of unique creators posting
  altRank: number;           // Proprietary ranking combining market + social data
  
  // Supporting metrics
  galaxyScore?: number;      // Secondary proprietary score
  sentiment?: number;        // Percentage positive (not our key differentiator)
  socialDominance?: number;  // Share of voice in category
  
  // Market data for context
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  
  // Metadata
  timestamp: number;
  lastUpdated: string;
}

// AI-generated trading signal
export interface TradingSignal {
  id: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;        // 0-100 confidence score
  reasoning: string;         // AI explanation of the signal
  
  // The social metrics that drove this signal
  triggerMetrics: {
    mentionsChange: number;      // % change in mentions
    interactionsChange: number;  // % change in interactions  
    creatorsChange: number;      // % change in unique creators
    altRankChange: number;       // Change in AltRank position
  };
  
  currentMetrics: SocialMetrics;
  previousMetrics?: SocialMetrics;
  
  // Signal metadata
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  timeframe: '1h' | '4h' | '24h';
  createdAt: string;
  expiresAt: string;
}

// Add other interfaces as needed...
export interface SignalJobData {
  symbols?: string[];
  userId?: string;
  analysisType: 'MOMENTUM' | 'BREAKOUT' | 'SOCIAL_SENTIMENT' | 'COMPREHENSIVE';
  webhookUrl?: string;
}
