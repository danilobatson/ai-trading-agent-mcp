import { inngest } from '@/lib/inngest';
import { generateSignalForSymbol } from '@/lib/signal-generator';
import { getSocialMetrics } from '@/lib/lunarcrush';
import { generateTradingSignal } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import type { TradingSignal } from '@/types/trading';

/**
 * MAIN WORKFLOW - Fixed to use consistent job ID across all steps
 */
export const signalAnalysisWorkflow = inngest.createFunction(
	{ id: 'signal-analysis-workflow' },
	{ event: 'trading.analyze' },
	async ({ event, step }) => {
		const startTime = Date.now();

		// CRITICAL: Extract job ID from event data at the START
		const jobId = event.data.jobId;

		console.log('🚀 STARTING SIGNAL ANALYSIS WORKFLOW');
		console.log('🔗 Job ID from event:', jobId);
		console.log('📋 Full event data:', JSON.stringify(event.data, null, 2));

		// Validate we have a job ID
		if (!jobId) {
			console.error('❌ CRITICAL: No job ID provided in event data!');
			throw new Error('No job ID provided in event data');
		}

		// Enhanced progress update function - no more job ID generation
		const updateProgress = async (
			stepNumber: number,
			stepName: string,
			stepMessage: string,
			status: string = 'started'
		) => {
			const progressPercentage = Math.round((stepNumber / 7) * 100);

			console.log(
				`📊 UPDATING PROGRESS: Job ${jobId} - Step ${stepNumber}/7 (${progressPercentage}%) - ${stepName}`
			);

			const updateData = {
				current_step: stepName,
				step_message: stepMessage,
				progress_percentage: progressPercentage,
				status: status,
				updated_at: new Date().toISOString(),
			};

			try {
				const { data, error } = await supabase
					.from('analysis_jobs')
					.update(updateData)
					.eq('id', jobId)
					.select();

				if (error) {
					console.error('❌ Failed to update progress:', error);
					console.error('❌ Job ID:', jobId);
					console.error('❌ Update data was:', updateData);
				} else {
					console.log('✅ Progress updated successfully for job:', jobId);
				}
			} catch (error) {
				console.error('❌ Exception during progress update:', error);
			}
		};

		// Step 1: Initialize analysis job - use the SAME job ID
		await step.run('initialize-job', async () => {
			console.log('=== STEP 1: INITIALIZE JOB ===');

			const jobData = {
				id: jobId, // Use the job ID from event data
				status: 'started',
				current_step: 'Initializing Analysis',
				step_message: 'Setting up trading analysis pipeline...',
				progress_percentage: 14,
				event_data: event.data,
				started_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			console.log('💾 CREATING JOB RECORD with ID:', jobId);

			const { data, error } = await supabase
				.from('analysis_jobs')
				.insert(jobData)
				.select();

			if (error) {
				console.error('❌ JOB CREATION FAILED:', error);
				throw error;
			}

			console.log('✅ JOB CREATED SUCCESSFULLY:', data);
			return jobId;
		});

		// Step 2: Get symbols with progress update
		const symbolsToAnalyze = await step.run('get-symbols-list', async () => {
			console.log('=== STEP 2: GET SYMBOLS ===');
			console.log('📋 Using job ID:', jobId); // Log to confirm same ID

			await updateProgress(
				2,
				'Preparing Symbol List',
				'Selecting cryptocurrencies for analysis...'
			);

			const symbolCount = event.data.symbolCount || 5;
			const symbols = event.data.symbols || ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
			const selectedSymbols = symbols.slice(0, symbolCount);

			console.log(`✅ SELECTED SYMBOLS:`, selectedSymbols);

			await updateProgress(
				2,
				'Symbol Selection Complete',
				`Selected ${
					selectedSymbols.length
				} cryptocurrencies: ${selectedSymbols.join(', ')}`
			);

			return selectedSymbols;
		});

		// Step 3: Fetch social metrics with progress updates
		const socialMetrics = await step.run('fetch-social-metrics', async () => {
			console.log('=== STEP 3: FETCH SOCIAL METRICS ===');
			console.log('📋 Using job ID:', jobId); // Log to confirm same ID

			await updateProgress(
				3,
				'Fetching Social Data',
				`Gathering real-time sentiment from LunarCrush for ${symbolsToAnalyze.length} symbols...`
			);

			const results = [];

			for (let i = 0; i < symbolsToAnalyze.length; i++) {
				const symbol = symbolsToAnalyze[i];
				try {
					// Update progress for each symbol
					await updateProgress(
						3,
						'Fetching Social Data',
						`Analyzing social metrics for ${symbol} (${i + 1}/${
							symbolsToAnalyze.length
						})...`
					);

					const metrics = await getSocialMetrics(symbol);
					results.push({ symbol, metrics, success: true });

					console.log(
						`✅ ${symbol}: ${metrics.mentions.toLocaleString()} mentions, ${metrics.creators.toLocaleString()} creators, AltRank ${
							metrics.altRank
						}`
					);

					// Rate limiting
					await new Promise((resolve) => setTimeout(resolve, 1500));
				} catch (error) {
					console.error(`❌ Failed to fetch ${symbol}:`, error);
					results.push({ symbol, metrics: null, success: false });
				}
			}

			const successCount = results.filter((r) => r.success).length;
			console.log(
				`✅ SOCIAL DATA COMPLETE: ${successCount}/${symbolsToAnalyze.length} successful`
			);

			await updateProgress(
				3,
				'Social Data Complete',
				`Fetched data for ${successCount}/${symbolsToAnalyze.length} cryptocurrencies`
			);

			return results;
		});

		// Step 4: AI signals with progress updates
		const tradingSignals = await step.run('generate-ai-signals', async () => {
			console.log('=== STEP 4: AI SIGNAL GENERATION ===');
			console.log('📋 Using job ID:', jobId); // Log to confirm same ID

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
					// Update progress for each AI analysis
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
					console.log(
						`✅ ${result.symbol}: ${signal.signal} signal, ${signal.confidence}% confidence`
					);

					// Rate limiting for Gemini
					await new Promise((resolve) => setTimeout(resolve, 3000));
				} catch (error) {
					console.error(`❌ AI analysis failed for ${result.symbol}:`, error);
				}
			}

			console.log(
				`🎯 AI ANALYSIS COMPLETE: Generated ${signals.length} trading signals`
			);

			await updateProgress(
				4,
				'AI Analysis Complete',
				`Generated ${signals.length} trading signals with confidence scores`
			);

			return signals;
		});

		// Step 5: Save signals with progress updates
		const savedSignals = await step.run('save-to-database', async () => {
			console.log('=== STEP 5: SAVE TO DATABASE ===');
			console.log('📋 Using job ID:', jobId); // Log to confirm same ID

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
					console.log(`✅ SAVED ${signal.symbol} signal to database`);

					// Update progress for each save
					await updateProgress(
						5,
						'Saving Results',
						`Saved ${i + 1}/${tradingSignals.length} signals to database...`
					);
				} catch (error) {
					console.error(`❌ Failed to save ${signal.symbol}:`, error);
					saveResults.push({ symbol: signal.symbol, success: false });
				}
			}

			const successfulSaves = saveResults.filter((r) => r.success).length;
			console.log(
				`💾 DATABASE SAVE COMPLETE: ${successfulSaves}/${tradingSignals.length} saved`
			);

			return saveResults;
		});

		// Step 6: Generate summary
		const summary = await step.run('generate-summary', async () => {
			console.log('=== STEP 6: GENERATE SUMMARY ===');
			console.log('📋 Using job ID:', jobId); // Log to confirm same ID

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

			console.log('📊 ANALYSIS SUMMARY:', summary);
			return summary;
		});

		// Step 7: Complete job
		await step.run('complete-job', async () => {
			console.log('=== STEP 7: COMPLETE JOB ===');
			console.log('📋 Using job ID:', jobId); // Log to confirm same ID

			const duration = Date.now() - startTime;

			console.log('🏁 WORKFLOW COMPLETED!');
			console.log(
				`⏱️  Total duration: ${(duration / 1000).toFixed(1)} seconds`
			);
			console.log(`📈 Signals generated: ${tradingSignals.length}`);
			console.log(`🎯 High confidence: ${summary.highConfidence}`);

			// CRITICAL: Final progress update with completion status
			await updateProgress(
				7,
				'Analysis Complete',
				`Generated ${tradingSignals.length} trading signals in ${Math.round(
					duration / 1000
				)}s`,
				'completed'
			);

			// Also update other job fields
			try {
				console.log('💾 UPDATING FINAL JOB STATS...');
				const { data, error } = await supabase
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
					console.error('❌ FINAL STATS UPDATE FAILED:', error);
				} else {
					console.log('✅ FINAL STATS UPDATED:', data);
				}
			} catch (error) {
				console.error('❌ EXCEPTION UPDATING FINAL STATS:', error);
			}
		});

		console.log('🎉 WORKFLOW FULLY COMPLETED!');
		return {
			success: true,
			jobId,
			duration: Date.now() - startTime,
			symbolsAnalyzed: tradingSignals.length,
			summary,
		};
	}
);

export const analyzeSingleSymbol = inngest.createFunction(
	{ id: 'analyze-single-symbol' },
	{ event: 'trading.analyze.symbol' },
	async ({ event, step }) => {
		const { symbol } = event.data;

		const result = await step.run('analyze-symbol', async () => {
			console.log(`🎯 SINGLE SYMBOL ANALYSIS: ${symbol}`);
			return await generateSignalForSymbol(symbol);
		});

		console.log(
			`✅ SINGLE ANALYSIS COMPLETE: ${symbol} → ${result.signal} (${result.confidence}%)`
		);
		return result;
	}
);
