// src/lib/gemini.ts - Google Gemini AI Client for Trading Signals
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SocialMetrics, TradingSignal } from '@/types/trading';

const getGeminiClient = () => {
	const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
	}
	return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate trading signal using Google Gemini AI based on LunarCrush social metrics
 */
export async function generateTradingSignal(
	symbol: string,
	currentMetrics: SocialMetrics,
	historicalMetrics?: SocialMetrics[]
): Promise<TradingSignal> {
	try {
		const genAI = getGeminiClient();
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		const prompt = createAnalysisPrompt(
			symbol,
			currentMetrics,
			historicalMetrics
		);

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const analysis = response.text();

		const signal = parseSignalResponse(analysis, symbol, currentMetrics);

		return signal;
	} catch (error) {
		console.error('Gemini AI Error:', error);
		return createFallbackSignal(symbol, currentMetrics);
	}
}

/**
 * Create analysis prompt focusing on LunarCrush's unique metrics
 */
function createAnalysisPrompt(
	symbol: string,
	current: SocialMetrics,
	historical?: SocialMetrics[]
): string {
	const historicalContext = historical?.length
		? `\n\nHistorical Context (last ${historical.length} data points):
${historical
	.map(
		(h, i) => `
${
	i + 1
}. mentions: ${h.mentions.toLocaleString()}, interactions: ${h.interactions.toLocaleString()}, creators: ${h.creators.toLocaleString()}, altRank: ${
			h.altRank
		}`
	)
	.join('')}`
		: '';

	return `You are a crypto trading analyst specializing in social data signals. Analyze the following LunarCrush social metrics for ${symbol} and provide a trading signal.

FOCUS ON THESE UNIQUE LUNARCRUSH DIFFERENTIATORS (not sentiment - everyone has that):

Current Metrics for ${symbol}:
- Social Mentions: ${current.mentions.toLocaleString()} posts in 24h
- Total Interactions: ${current.interactions.toLocaleString()} engagements
- Unique Creators: ${current.creators.toLocaleString()} content creators
- AltRank: ${current.altRank} (lower = better, proprietary ranking)
- Galaxy Score: ${
		current.galaxyScore
	}/100 (LunarCrush health indicator)${historicalContext}

ANALYSIS FRAMEWORK:
1. **Social Volume Surge**: High mentions + interactions = increased attention
2. **Creator Diversity**: More unique creators = broader interest, less manipulation
3. **AltRank Position**: Lower rank = stronger market + social performance
4. **Galaxy Score Health**: Higher score = better ecosystem health
5. **Engagement Quality**: Interactions per mention ratio (quality vs quantity)

Generate a trading signal with this EXACT format:
SIGNAL: [BUY/SELL/HOLD]
CONFIDENCE: [0-100]
REASONING: [2-3 sentences explaining the decision focusing on the metrics above]

Keep reasoning concise and focus on what makes LunarCrush data unique vs other APIs.`;
}

/**
 * Parse AI response into structured trading signal
 */
function parseSignalResponse(
	aiResponse: string,
	symbol: string,
	metrics: SocialMetrics
): TradingSignal {
	try {
		const signalMatch = aiResponse.match(/SIGNAL:\s*(BUY|SELL|HOLD)/i);
		const confidenceMatch = aiResponse.match(/CONFIDENCE:\s*(\d+)/i);
		const reasoningMatch = aiResponse.match(
			/REASONING:\s*(.+?)(?=\n\n|\n$|$)/s
		);

		const signal =
			(signalMatch?.[1]?.toUpperCase() as 'BUY' | 'SELL' | 'HOLD') || 'HOLD';
		const confidence = parseInt(confidenceMatch?.[1] || '50');
		const reasoning =
			reasoningMatch?.[1]?.trim() || 'Analysis based on social metrics';

		return {
			id: `${symbol}-${Date.now()}`,
			symbol,
			signal,
			confidence: Math.max(0, Math.min(100, confidence)),
			reasoning,
			metrics,
			createdAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error('Error parsing AI response:', error);
		return createFallbackSignal(symbol, metrics);
	}
}

/**
 * Fallback rule-based signal if AI fails
 */
function createFallbackSignal(
	symbol: string,
	metrics: SocialMetrics
): TradingSignal {
	let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
	let confidence = 50;
	let reasoning = 'Fallback analysis based on social metrics';

	const engagementRatio = metrics.interactions / Math.max(metrics.mentions, 1);
	const isHighEngagement = engagementRatio > 100;
	const isGoodRank = metrics.altRank < 100;
	const isHealthy = metrics.galaxyScore > 70;
	const hasGoodCreators = metrics.creators > 1000;

	const positiveSignals = [
		isHighEngagement,
		isGoodRank,
		isHealthy,
		hasGoodCreators,
	].filter(Boolean).length;

	if (positiveSignals >= 3) {
		signal = 'BUY';
		confidence = 60 + positiveSignals * 10;
		reasoning = `Strong social signals: ${positiveSignals}/4 indicators positive. High engagement ratio (${engagementRatio.toFixed(
			1
		)}), AltRank ${
			metrics.altRank
		}, ${metrics.creators.toLocaleString()} creators.`;
	} else if (positiveSignals <= 1) {
		signal = 'SELL';
		confidence = 60;
		reasoning = `Weak social signals: only ${positiveSignals}/4 indicators positive. Low engagement or poor rankings.`;
	}

	return {
		id: `${symbol}-${Date.now()}`,
		symbol,
		signal,
		confidence,
		reasoning,
		metrics,
		createdAt: new Date().toISOString(),
	};
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<boolean> {
	try {
		const genAI = getGeminiClient();
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		const result = await model.generateContent(
			'Hello, this is a test. Please respond with "Connection successful!"'
		);
		const response = await result.response;
		const text = response.text();

		return (
			text.includes('successful') || text.includes('working') || text.length > 0
		);
	} catch (error) {
		console.error('Gemini test failed:', error);
		return false;
	}
}
