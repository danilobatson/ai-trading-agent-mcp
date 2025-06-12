// src/types/trading.ts - TypeScript interfaces for trading system

/**
 * LunarCrush social metrics - core data structure
 */
export interface SocialMetrics {
	symbol: string;
	mentions: number; // Number of social posts mentioning the asset
	interactions: number; // Total social engagements (likes, comments, shares)
	creators: number; // Number of unique creators posting about the asset
	altRank: number; // LunarCrush proprietary ranking (lower = better)
	galaxyScore: number; // LunarCrush health indicator (0-100)
	timestamp: number; // When the data was fetched
}

/**
 * AI-generated trading signal
 */
export interface TradingSignal {
	id: string;
	symbol: string;
	signal: 'BUY' | 'SELL' | 'HOLD';
	confidence: number; // 0-100 confidence score
	reasoning: string; // AI explanation of the signal
	metrics: SocialMetrics; // The social metrics that generated this signal
	createdAt: string; // ISO timestamp when signal was created
}

/**
 * Analysis job tracking for real-time progress
 */
export interface AnalysisJob {
	id: string;
	status: 'started' | 'completed' | 'failed';
	current_step: string;
	step_message: string;
	progress_percentage: number;
	event_data: any;
	signals_generated: number;
	alerts_generated: number;
	duration_ms: number | null;
	started_at: string;
	completed_at: string | null;
	updated_at: string;
}

/**
 * API response types
 */
export interface SignalsResponse {
	success: boolean;
	signals: TradingSignal[];
	jobs: AnalysisJob[];
	timestamp: string;
}

export interface TriggerResponse {
	success: boolean;
	jobId: string;
	eventId: string;
	message: string;
}
