// src/lib/lunarcrush.ts - LunarCrush API Client
import type { SocialMetrics } from '@/types/trading';

const BASE_URL = 'https://lunarcrush.com/api4/public';

const getApiKey = () => {
	const apiKey = process.env.LUNARCRUSH_API_KEY;
	if (!apiKey) {
		throw new Error('LUNARCRUSH_API_KEY environment variable is required');
	}
	return apiKey;
};

const makeRequest = async <T>(endpoint: string): Promise<T> => {
	const url = `${BASE_URL}${endpoint}`;

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${getApiKey()}`,
				'Content-Type': 'application/json',
			},
			signal: AbortSignal.timeout(10000),
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('Invalid API key - check your LunarCrush credentials');
			}
			if (response.status === 429) {
				throw new Error(
					'Rate limit exceeded - upgrade your plan or try again later'
				);
			}
			if (response.status >= 500) {
				throw new Error('LunarCrush API is temporarily unavailable');
			}

			throw new Error(
				`LunarCrush API Error: ${response.status} ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof Error) {
			console.error('LunarCrush API Error:', error.message);
			throw error;
		}
		throw new Error('Unknown error occurred while fetching LunarCrush data');
	}
};

// Response interfaces
interface CoinsListResponse {
	config: { generated: number };
	data: Array<{
		symbol: string;
		name: string;
		alt_rank: number;
		galaxy_score: number;
		price: number;
		market_cap: number;
		percent_change_24h: number;
	}>;
}

interface TopicResponse {
	config: { generated: number };
	data: {
		symbol: string;
		name: string;
		num_posts: number;
		interactions_24h: number;
		num_contributors: number;
		sentiment: number;
		social_score: number;
		price: number;
		market_cap: number;
	};
}

/**
 * Fetch comprehensive social metrics for a symbol
 * Combines coins/list data (altRank, galaxyScore) with topic data (creators, mentions, interactions)
 */
export async function getSocialMetrics(symbol: string): Promise<SocialMetrics> {
	try {
		// Fetch both endpoints in parallel
		const [coinsData, topicData] = await Promise.all([
			fetchCoinsListData(symbol),
			fetchTopicData(symbol),
		]);

		const metrics: SocialMetrics = {
			symbol: symbol.toUpperCase(),
			mentions: topicData.num_posts || 0,
			interactions: topicData.interactions_24h || 0,
			creators: topicData.num_contributors || 0,
			altRank: coinsData.alt_rank || 999,
			galaxyScore: coinsData.galaxy_score || 0,
			timestamp: Date.now(),
		};

		return metrics;
	} catch (error) {
		console.error(`Failed to fetch social metrics for ${symbol}:`, error);
		throw error;
	}
}

/**
 * Fetch data from coins/list endpoint (altRank, galaxyScore)
 */
async function fetchCoinsListData(
	targetSymbol: string
): Promise<{ alt_rank: number; galaxy_score: number }> {
	try {
		const response = await makeRequest<CoinsListResponse>(
			'/coins/list/v1?limit=500&sort=alt_rank'
		);

		// Find the target symbol in the list
		let coinData = response.data.find(
			(coin) => coin.symbol.toUpperCase() === targetSymbol.toUpperCase()
		);

		// Handle Bitcoin variations
		if (!coinData && targetSymbol.toUpperCase() === 'BTC') {
			coinData = response.data.find(
				(coin) =>
					coin.symbol.toUpperCase() === 'BITCOIN' ||
					coin.symbol.toLowerCase() === 'bitcoin' ||
					coin.name?.toLowerCase().includes('bitcoin')
			);
		}

		if (!coinData) {
			console.warn(`Symbol ${targetSymbol} not found in coins list`);
			return { alt_rank: 999, galaxy_score: 0 };
		}

		return {
			alt_rank: coinData.alt_rank,
			galaxy_score: coinData.galaxy_score,
		};
	} catch (error) {
		console.error('Error fetching coins list data:', error);
		return { alt_rank: 999, galaxy_score: 0 };
	}
}

/**
 * Fetch data from topic endpoint (creators, mentions, interactions)
 */
async function fetchTopicData(symbol: string): Promise<{
	num_posts: number;
	interactions_24h: number;
	num_contributors: number;
}> {
	try {
		const response = await makeRequest<TopicResponse>(`/topic/${symbol}/v1`);

		return {
			num_posts: response.data.num_posts || 0,
			interactions_24h: response.data.interactions_24h || 0,
			num_contributors: response.data.num_contributors || 0,
		};
	} catch (error) {
		console.error(`Error fetching topic data for ${symbol}:`, error);
		return {
			num_posts: 0,
			interactions_24h: 0,
			num_contributors: 0,
		};
	}
}

/**
 * Test LunarCrush API integration
 */
export async function testLunarCrushIntegration(): Promise<boolean> {
	try {
		const btcMetrics = await getSocialMetrics('BTC');

		const hasCoinsData = btcMetrics.altRank < 999 && btcMetrics.galaxyScore > 0;
		const hasTopicData = btcMetrics.mentions > 0 && btcMetrics.interactions > 0;

		if (hasCoinsData && hasTopicData) {
			console.log('LunarCrush integration test successful');
			return true;
		} else {
			console.warn('Partial data received from LunarCrush API');
			return false;
		}
	} catch (error) {
		console.error('LunarCrush integration test failed:', error);
		return false;
	}
}
