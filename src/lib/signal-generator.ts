// src/lib/signal-generator.ts - Data Aggregation & Signal Generation
import { getSocialMetrics } from '@/lib/lunarcrush';
import { generateTradingSignal } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import type { SocialMetrics, TradingSignal } from '@/types/trading';

/**
 * Generate trading signal for a single symbol
 * Combines LunarCrush data fetching with AI analysis
 */
export async function generateSignalForSymbol(
	symbol: string
): Promise<TradingSignal> {
	try {
		console.log(`🎯 Generating signal for ${symbol}...`);

		// Step 1: Fetch current social metrics from LunarCrush
		const currentMetrics = await getSocialMetrics(symbol);

		// Step 2: Get historical data for trend analysis (optional for now)
		const historicalMetrics = await getHistoricalMetrics(symbol, 5);

		// Step 3: Generate AI-powered trading signal
		const signal = await generateTradingSignal(
			symbol,
			currentMetrics,
			historicalMetrics
		);

		// Step 4: Save signal to database
		await saveSignalToDatabase(signal);

		console.log(
			`✅ Generated ${signal.signal} signal for ${symbol} (${signal.confidence}% confidence)`
		);
		return signal;
	} catch (error) {
		console.error(`Failed to generate signal for ${symbol}:`, error);
		throw error;
	}
}

/**
 * Get historical metrics for trend analysis
 * Returns recent signals for the same symbol
 */
async function getHistoricalMetrics(
	symbol: string,
	limit: number = 5
): Promise<SocialMetrics[]> {
	try {
		const { data, error } = await supabase
			.from('trading_signals')
			.select('metrics')
			.eq('symbol', symbol.toUpperCase())
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) {
			console.warn(`No historical data for ${symbol}:`, error.message);
			return [];
		}

		// Extract metrics from historical signals
		return data?.map((record) => record.metrics as SocialMetrics) || [];
	} catch (error) {
		console.warn(`Failed to fetch historical metrics for ${symbol}:`, error);
		return [];
	}
}

/**
 * Save trading signal to database
 */
async function saveSignalToDatabase(signal: TradingSignal): Promise<void> {
	try {
		const { error } = await supabase.from('trading_signals').insert({
			id: signal.id,
			symbol: signal.symbol,
			signal: signal.signal,
			confidence: signal.confidence,
			reasoning: signal.reasoning,
			metrics: signal.metrics,
			created_at: signal.createdAt,
		});

		if (error) {
			console.error('Database save error:', error);
			throw error;
		}
	} catch (error) {
		console.error('Failed to save signal to database:', error);
		// Don't throw - signal generation should continue even if DB save fails
	}
}

/**
 * Get latest signals for dashboard display
 */
export async function getLatestSignals(
	limit: number = 20
): Promise<TradingSignal[]> {
	try {
		const { data, error } = await supabase
			.from('trading_signals')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw error;

		return data || [];
	} catch (error) {
		console.error('Failed to fetch latest signals:', error);
		return [];
	}
}

/**
 * Test complete data aggregation flow
 */
export async function testDataAggregation(): Promise<boolean> {
	try {
		console.log('🧪 Testing complete data aggregation flow...');

		// Test 1: Single symbol signal generation
		console.log('1. Testing single symbol signal generation...');
		const btcSignal = await generateSignalForSymbol('BTC');

		if (!btcSignal || !btcSignal.metrics) {
			throw new Error('Failed to generate BTC signal');
		}

		// Test 2: Latest signals retrieval
		console.log('2. Testing latest signals retrieval...');
		const latestSignals = await getLatestSignals(5);

		console.log('✅ Data aggregation test complete:', {
			btcSignal: btcSignal.signal,
			confidence: btcSignal.confidence,
			reasoning: btcSignal.reasoning.substring(0, 100) + '...',
			latestCount: latestSignals.length,
		});

		return true;
	} catch (error) {
		console.error('❌ Data aggregation test failed:', error);
		return false;
	}
}
