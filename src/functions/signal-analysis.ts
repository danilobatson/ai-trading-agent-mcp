import { inngest } from '@/lib/inngest';
import { generateSignalForSymbol } from '@/lib/signal-generator';
import { getSocialMetrics } from '@/lib/lunarcrush';
import { generateTradingSignal } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import type { TradingSignal } from '@/types/trading';

/**
 * Main trading signal analysis workflow
 * Processes social metrics and generates AI-powered trading signals
 */
export const signalAnalysisWorkflow = inngest.createFunction(
	{ id: 'signal-analysis-workflow' },
	{ event: 'trading.analyze' },
	async ({ event, step }) => {
		const startTime = Date.now();
		const jobId = event.data.jobId;

		if (!jobId) {
			throw new Error('No job ID provided in event data');
		}

		const updateProgress = async (
			stepNumber: number,
			stepName: string,
			stepMessage: string,
			status: string = 'started'
		) => {
			const progressPercentage = Math.round((stepNumber / 7) * 100);

			const updateData = {
				current_step: stepName,
				step_message: stepMessage,
				progress_percentage: progressPercentage,
				status: status,
				updated_at: new Date().toISOString(),
			};

			try {
				const { error } = await supabase
					.from('analysis_jobs')
					.update(updateData)
					.eq('id', jobId)
					.select();

				if (error) {
					console.error(`Failed to update progress for job ${jobId}:`, error);
				}
			} catch (error) {
				console.error('Exception during progress update:', error);
			}
		};

		// Step 1: Initialize analysis job
		await step.run('initialize-job', async () => {
			const jobData = {
				id: jobId,
				status: 'started',
				current_step: 'Initializing Analysis',
				step_message: 'Setting up trading analysis pipeline...',
				progress_percentage: 14,
				event_data: event.data,
				started_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			const { data, error } = await supabase
				.from('analysis_jobs')
				.insert(jobData)
				.select();

			if (error) {
				console.error('Job creation failed:', error);
				throw error;
			}

			return jobId;
		});

		// Step 2: Get symbols to analyze
		const symbolsToAnalyze = await step.run('get-symbols-list', async () => {
			await updateProgress(
				2,
				'Preparing Symbol List',
				'Selecting cryptocurrencies for analysis...'
			);

			const symbolCount = event.data.symbolCount || 5;
			const symbols = event.data.symbols || ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
			const selectedSymbols = symbols.slice(0, symbolCount);

			await updateProgress(
				2,
				'Symbol Selection Complete',
				`Selected ${
					selectedSymbols.length
				} cryptocurrencies: ${selectedSymbols.join(', ')}`
			);

			return selectedSymbols;
		});

		// Step 3: Fetch social metrics
		const socialMetrics = await step.run('fetch-social-metrics', async () => {
			await updateProgress(
				3,
				'Fetching Social Data',
				`Gathering real-time sentiment from LunarCrush for ${symbolsToAnalyze.length} symbols...`
			);

			const results = [];

			for (let i = 0; i < symbolsToAnalyze.length; i++) {
				const symbol = symbolsToAnalyze[i];
				try {
					await updateProgress(
						3,
						'Fetching Social Data',
						`Analyzing social metrics for ${symbol} (${i + 1}/${
							symbolsToAnalyze.length
						})...`
					);

					const metrics = await getSocialMetrics(symbol);
					results.push({ symbol, metrics, success: true });

					// Rate limiting
					await new Promise((resolve) => setTimeout(resolve, 1500));
				} catch (error) {
					console.error(`Failed to fetch social metrics for ${symbol}:`, error);
					results.push({ symbol, metrics: null, success: false });
				}
			}

			const successCount = results.filter((r) => r.success).length;

			await updateProgress(
				3,
				'Social Data Complete',
				`Fetched data for ${successCount}/${symbolsToAnalyze.length} cryptocurrencies`
			);

			return results;
		});

		// Step 4: Generate AI trading signals
		const tradingSignals = await step.run('generate-ai-signals', async () => {
			await updateProgress(
				4,
				'AI Signal Generation',
				'Google Gemini analyzing market sentiment and social patterns...'
			);

			const signals: TradingSignal[] = [];
			const successfulMetrics = socialMetrics.filter(
				(result) => result.success && result.metrics
			);

			for (let i = 0; i < successfulMetrics.length; i++) {
				const result = successfulMetrics[i];
				try {
					await updateProgress(
						4,
						'AI Signal Generation',
						`AI analyzing ${result.symbol} (${i + 1}/${
							successfulMetrics.length
						})...`
					);

					const signal = await generateTradingSignal(
						result.symbol,
						result.metrics!,
						[]
					);

					signals.push(signal);

					// Rate limiting for Gemini
					await new Promise((resolve) => setTimeout(resolve, 3000));
				} catch (error) {
					console.error(`AI analysis failed for ${result.symbol}:`, error);
				}
			}

			await updateProgress(
				4,
				'AI Analysis Complete',
				`Generated ${signals.length} trading signals with confidence scores`
			);

			return signals;
		});

		// Step 5: Save signals to database
		const savedSignals = await step.run('save-to-database', async () => {
			await updateProgress(
				5,
				'Saving Results',
				`Storing ${tradingSignals.length} trading signals in database...`
			);

			const saveResults = [];

			for (let i = 0; i < tradingSignals.length; i++) {
				const signal = tradingSignals[i];
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

					if (error) throw error;

					saveResults.push({ symbol: signal.symbol, success: true });

					await updateProgress(
						5,
						'Saving Results',
						`Saved ${i + 1}/${tradingSignals.length} signals to database...`
					);
				} catch (error) {
					console.error(`Failed to save signal for ${signal.symbol}:`, error);
					saveResults.push({ symbol: signal.symbol, success: false });
				}
			}

			return saveResults;
		});

		// Step 6: Generate analysis summary
		const summary = await step.run('generate-summary', async () => {
			await updateProgress(
				6,
				'Generating Summary',
				'Creating analysis summary and preparing notifications...'
			);

			const highConfidenceSignals = tradingSignals.filter(
				(s) => s.confidence >= 70
			);
			const buySignals = tradingSignals.filter((s) => s.signal === 'BUY');
			const sellSignals = tradingSignals.filter((s) => s.signal === 'SELL');

			const summary = {
				totalAnalyzed: tradingSignals.length,
				highConfidence: highConfidenceSignals.length,
				distribution: {
					BUY: buySignals.length,
					SELL: sellSignals.length,
					HOLD: tradingSignals.filter((s) => s.signal === 'HOLD').length,
				},
				topSignals: tradingSignals
					.sort((a, b) => b.confidence - a.confidence)
					.slice(0, 3)
					.map((s) => ({
						symbol: s.symbol,
						signal: s.signal,
						confidence: s.confidence,
						altRank: s.metrics.altRank,
					})),
			};

			return summary;
		});

		// Step 7: Complete analysis
		await step.run('complete-job', async () => {
			const duration = Date.now() - startTime;

			await updateProgress(
				7,
				'Analysis Complete',
				`Generated ${tradingSignals.length} trading signals in ${Math.round(
					duration / 1000
				)}s`,
				'completed'
			);

			// Update final job statistics
			try {
				const { error } = await supabase
					.from('analysis_jobs')
					.update({
						signals_generated: tradingSignals.length,
						alerts_generated: summary.highConfidence,
						duration_ms: duration,
						completed_at: new Date().toISOString(),
					})
					.eq('id', jobId)
					.select();

				if (error) {
					console.error('Failed to update final job statistics:', error);
				}
			} catch (error) {
				console.error('Exception updating final job statistics:', error);
			}
		});

		return {
			success: true,
			jobId,
			duration: Date.now() - startTime,
			symbolsAnalyzed: tradingSignals.length,
			summary,
		};
	}
);

/**
 * Analyze a single cryptocurrency symbol
 */
export const analyzeSingleSymbol = inngest.createFunction(
	{ id: 'analyze-single-symbol' },
	{ event: 'trading.analyze.symbol' },
	async ({ event, step }) => {
		const { symbol } = event.data;

		const result = await step.run('analyze-symbol', async () => {
			return await generateSignalForSymbol(symbol);
		});

		return result;
	}
);
