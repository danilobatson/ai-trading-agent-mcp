// src/app/page.tsx - Fixed Dashboard with Large Progress Overlay
'use client';

import React, { useState, useEffect } from 'react';
import {
	ChevronUp,
	ChevronDown,
	Minus,
	Activity,
	TrendingUp,
	Users,
	MessageSquare,
	Zap,
	Clock,
	Check,
	AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Interfaces
interface TradingSignal {
	id: string;
	symbol: string;
	signal: 'BUY' | 'SELL' | 'HOLD';
	confidence: number;
	reasoning: string;
	metrics: {
		mentions: number;
		interactions: number;
		creators: number;
		altRank: number;
		galaxyScore: number;
	};
	created_at: string;
}

interface AnalysisJob {
	id: string;
	status: string;
	current_step: string;
	step_message: string;
	progress_percentage: number;
	signals_generated: number;
	duration_ms: number;
	started_at: string;
	completed_at: string | null;
}

// Enhanced Real-time Progress Hook with Better Debugging
function useJobProgress(jobId: string | null) {
	const [progress, setProgress] = useState({
		currentStep: '',
		stepMessage: '',
		progressPercentage: 0,
		status: 'started',
		isLoading: false,
		isComplete: false,
		error: null as string | null,
	});

	useEffect(() => {
		if (!jobId) {
			setProgress((prev) => ({ ...prev, isLoading: false, isComplete: false }));
			return;
		}

		console.log(`🔄 Starting real-time progress tracking for job: ${jobId}`);
		setProgress((prev) => ({ ...prev, isLoading: true, error: null }));

		// Set up real-time subscription with enhanced debugging
		const channel = supabase
			.channel(`job-progress-${jobId}`)
			.on(
				'postgres_changes',
				{
					event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
					schema: 'public',
					table: 'analysis_jobs',
					filter: `id=eq.${jobId}`,
				},
				(payload) => {
					console.log('📊 Real-time update received:', payload);
					console.log('📊 Event type:', payload.eventType);
					console.log('📊 New data:', payload.new);

					if (payload.new) {
						const job = payload.new as any;
						console.log('📊 Updating progress state:', {
							currentStep: job.current_step,
							stepMessage: job.step_message,
							progressPercentage: job.progress_percentage,
							status: job.status,
						});

						setProgress({
							currentStep: job.current_step || '',
							stepMessage: job.step_message || '',
							progressPercentage: job.progress_percentage || 0,
							status: job.status || 'started',
							isLoading: job.status === 'started',
							isComplete: job.status === 'completed',
							error: job.status === 'failed' ? job.step_message : null,
						});
					}
				}
			)
			.subscribe((status, err) => {
				console.log('📡 Subscription status:', status);
				if (err) {
					console.error('📡 Subscription error:', err);
				}
			});

		// Enhanced initial fetch with better error handling
		fetchCurrentProgress();

		async function fetchCurrentProgress() {
			try {
				console.log(`🔍 Fetching current progress for job: ${jobId}`);

				const { data, error } = await supabase
					.from('analysis_jobs')
					.select('*')
					.eq('id', jobId)
					.single();

				if (error) {
					console.error('❌ Error fetching job progress:', error);
					if (error.code === 'PGRST116') {
						console.log('Job not found yet, waiting for real-time updates...');
						return;
					}
					throw error;
				}

				if (data) {
					console.log('✅ Initial job data:', data);
					setProgress({
						currentStep: data.current_step || '',
						stepMessage: data.step_message || '',
						progressPercentage: data.progress_percentage || 0,
						status: data.status || 'started',
						isLoading: data.status === 'started',
						isComplete: data.status === 'completed',
						error: data.status === 'failed' ? data.step_message : null,
					});
				}
			} catch (error) {
				console.error('❌ Failed to fetch job progress:', error);
				setProgress((prev) => ({
					...prev,
					error: error.message,
					isLoading: false,
				}));
			}
		}

		// Enhanced polling as backup to real-time
		const pollInterval = setInterval(() => {
			console.log('🔄 Polling for progress updates...');
			fetchCurrentProgress();
		}, 3000); // Poll every 3 seconds as backup

		// Cleanup subscription and polling
		return () => {
			console.log(`🔄 Cleaning up subscription and polling for job: ${jobId}`);
			supabase.removeChannel(channel);
			clearInterval(pollInterval);
		};
	}, [jobId]);

	return progress;
}

// Signal Card Component (unchanged)
const SignalCard: React.FC<{ signal: TradingSignal }> = ({ signal }) => {
	const getSignalColor = (signalType: string) => {
		switch (signalType) {
			case 'BUY':
				return 'bg-green-500/10 border-green-500/20 text-green-400';
			case 'SELL':
				return 'bg-red-500/10 border-red-500/20 text-red-400';
			case 'HOLD':
				return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
			default:
				return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
		}
	};

	const getSignalIcon = (signalType: string) => {
		switch (signalType) {
			case 'BUY':
				return <ChevronUp className='h-5 w-5' />;
			case 'SELL':
				return <ChevronDown className='h-5 w-5' />;
			case 'HOLD':
				return <Minus className='h-5 w-5' />;
			default:
				return <Activity className='h-5 w-5' />;
		}
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleString();
	};

	return (
		<div className='bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-900/70'>
			{/* Header */}
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center space-x-3'>
					<div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
						<span className='text-blue-400 font-bold text-sm'>
							{signal.symbol}
						</span>
					</div>
					<div>
						<h3 className='text-white font-semibold text-lg'>
							${signal.symbol}
						</h3>
						<p className='text-gray-400 text-sm'>
							{formatTime(signal.created_at)}
						</p>
					</div>
				</div>

				<div
					className={`px-3 py-1.5 rounded-full border flex items-center space-x-2 ${getSignalColor(
						signal.signal
					)}`}>
					{getSignalIcon(signal.signal)}
					<span className='font-semibold text-sm'>{signal.signal}</span>
				</div>
			</div>

			{/* Confidence Score */}
			<div className='mb-4'>
				<div className='flex items-center justify-between mb-2'>
					<span className='text-gray-300 text-sm'>AI Confidence</span>
					<span className='text-white font-semibold'>{signal.confidence}%</span>
				</div>
				<div className='w-full bg-gray-700/50 rounded-full h-2'>
					<div
						className={`h-2 rounded-full transition-all duration-500 ${
							signal.confidence >= 80
								? 'bg-green-500'
								: signal.confidence >= 60
								? 'bg-yellow-500'
								: 'bg-red-500'
						}`}
						style={{ width: `${signal.confidence}%` }}
					/>
				</div>
			</div>

			{/* LunarCrush Metrics */}
			<div className='grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
				<div className='bg-gray-800/50 rounded-lg p-3'>
					<div className='flex items-center space-x-2 mb-1'>
						<MessageSquare className='h-4 w-4 text-blue-400' />
						<span className='text-gray-400 text-xs'>Mentions</span>
					</div>
					<span className='text-white font-semibold'>
						{formatNumber(signal.metrics.mentions)}
					</span>
				</div>

				<div className='bg-gray-800/50 rounded-lg p-3'>
					<div className='flex items-center space-x-2 mb-1'>
						<Zap className='h-4 w-4 text-purple-400' />
						<span className='text-gray-400 text-xs'>Interactions</span>
					</div>
					<span className='text-white font-semibold'>
						{formatNumber(signal.metrics.interactions)}
					</span>
				</div>

				<div className='bg-gray-800/50 rounded-lg p-3'>
					<div className='flex items-center space-x-2 mb-1'>
						<Users className='h-4 w-4 text-green-400' />
						<span className='text-gray-400 text-xs'>Creators</span>
					</div>
					<span className='text-white font-semibold'>
						{signal.metrics.creators}
					</span>
				</div>

				<div className='bg-gray-800/50 rounded-lg p-3'>
					<div className='flex items-center space-x-2 mb-1'>
						<TrendingUp className='h-4 w-4 text-orange-400' />
						<span className='text-gray-400 text-xs'>AltRank</span>
					</div>
					<span className='text-white font-semibold'>
						#{signal.metrics.altRank}
					</span>
				</div>

				<div className='bg-gray-800/50 rounded-lg p-3 lg:col-span-2'>
					<div className='flex items-center space-x-2 mb-1'>
						<Activity className='h-4 w-4 text-pink-400' />
						<span className='text-gray-400 text-xs'>Galaxy Score</span>
					</div>
					<div className='flex items-center space-x-2'>
						<span className='text-white font-semibold'>
							{signal.metrics.galaxyScore}/100
						</span>
						<div className='flex-1 bg-gray-700/50 rounded-full h-1.5'>
							<div
								className='h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500'
								style={{ width: `${signal.metrics.galaxyScore}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* AI Reasoning */}
			<div className='bg-gray-800/30 rounded-lg p-4'>
				<h4 className='text-gray-300 text-sm font-medium mb-2'>AI Analysis</h4>
				<p className='text-gray-300 text-sm leading-relaxed'>
					{signal.reasoning}
				</p>
			</div>
		</div>
	);
};

// Large Progress Overlay Component
const ProgressOverlay: React.FC<{
	progress: {
		currentStep: string;
		stepMessage: string;
		progressPercentage: number;
		isLoading: boolean;
		isComplete: boolean;
		error: string | null;
	};
}> = ({ progress }) => {
	return (
		<div className='bg-gray-900/50 border border-gray-700/50 rounded-xl p-12 text-center'>
			{progress.error ? (
				// Error State
				<div>
					<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-6' />
					<h3 className='text-xl font-semibold text-red-400 mb-4'>
						Analysis Failed
					</h3>
					<p className='text-gray-400 mb-6 max-w-md mx-auto'>
						{progress.error}
					</p>
					<p className='text-gray-500 text-sm'>
						Please try again or check the console for more details.
					</p>
				</div>
			) : progress.isComplete ? (
				// Completion State
				<div>
					<div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
						<Check className='h-8 w-8 text-green-400' />
					</div>
					<h3 className='text-xl font-semibold text-green-400 mb-4'>
						{progress.currentStep}
					</h3>
					<p className='text-gray-400 mb-6 max-w-md mx-auto'>
						{progress.stepMessage}
					</p>
					<p className='text-gray-500 text-sm'>
						New signals will appear shortly...
					</p>
				</div>
			) : (
				// Loading State
				<div>
					<div className='w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
						<div className='w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
					</div>

					<h3 className='text-2xl font-bold text-white mb-2'>
						{progress.currentStep}
					</h3>
					<p className='text-gray-400 mb-6 max-w-md mx-auto'>
						{progress.stepMessage}
					</p>

					{/* Large Progress Bar */}
					<div className='max-w-md mx-auto mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Progress</span>
							<span className='text-sm text-blue-400 font-medium'>
								{progress.progressPercentage}%
							</span>
						</div>
						<div className='w-full bg-gray-700/50 rounded-full h-3'>
							<div
								className='h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out'
								style={{ width: `${progress.progressPercentage}%` }}
							/>
						</div>
					</div>

					{/* Step Details */}
					<div className='max-w-lg mx-auto'>
						<div className='bg-gray-800/30 rounded-lg p-6'>
							<h4 className='text-gray-300 font-medium mb-3'>
								Analysis Pipeline
							</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
								<div
									className={`flex items-center space-x-2 ${
										progress.progressPercentage >= 14
											? 'text-green-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 14 ? (
										<Check className='h-4 w-4' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>Initialize Analysis</span>
								</div>
								<div
									className={`flex items-center space-x-2 ${
										progress.progressPercentage >= 28
											? 'text-green-400'
											: progress.progressPercentage >= 14
											? 'text-blue-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 28 ? (
										<Check className='h-4 w-4' />
									) : progress.progressPercentage >= 14 ? (
										<div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>Prepare Symbol List</span>
								</div>
								<div
									className={`flex items-center space-x-2 ${
										progress.progressPercentage >= 42
											? 'text-green-400'
											: progress.progressPercentage >= 28
											? 'text-blue-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 42 ? (
										<Check className='h-4 w-4' />
									) : progress.progressPercentage >= 28 ? (
										<div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>Fetch Social Data</span>
								</div>
								<div
									className={`flex items-center space-x-2 ${
										progress.progressPercentage >= 57
											? 'text-green-400'
											: progress.progressPercentage >= 42
											? 'text-blue-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 57 ? (
										<Check className='h-4 w-4' />
									) : progress.progressPercentage >= 42 ? (
										<div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>AI Signal Generation</span>
								</div>
								<div
									className={`flex items-center space-x-2 ${
										progress.progressPercentage >= 71
											? 'text-green-400'
											: progress.progressPercentage >= 57
											? 'text-blue-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 71 ? (
										<Check className='h-4 w-4' />
									) : progress.progressPercentage >= 57 ? (
										<div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>Save to Database</span>
								</div>
								<div
									className={`flex items-center space-x-2 ${
										progress.progressPercentage >= 85
											? 'text-green-400'
											: progress.progressPercentage >= 71
											? 'text-blue-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 85 ? (
										<Check className='h-4 w-4' />
									) : progress.progressPercentage >= 71 ? (
										<div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>Generate Summary</span>
								</div>
								<div
									className={`flex items-center space-x-2 md:col-span-2 justify-center ${
										progress.progressPercentage >= 100
											? 'text-green-400'
											: progress.progressPercentage >= 85
											? 'text-blue-400'
											: 'text-gray-500'
									}`}>
									{progress.progressPercentage >= 100 ? (
										<Check className='h-4 w-4' />
									) : progress.progressPercentage >= 85 ? (
										<div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
									) : (
										<div className='w-4 h-4 rounded-full border border-gray-500' />
									)}
									<span>Complete Analysis</span>
								</div>
							</div>
						</div>
					</div>

					<p className='text-gray-500 text-sm mt-6'>
						This process typically takes 30-60 seconds depending on API response
						times.
					</p>
				</div>
			)}
		</div>
	);
};

// Simplified Trigger Panel Component
const TriggerPanel: React.FC<{
	onTrigger: () => void;
	isLoading: boolean;
}> = ({ onTrigger, isLoading }) => {
	return (
		<div className='bg-gray-900/50 border border-gray-700/50 rounded-xl p-6'>
			<div className='flex items-center justify-between mb-4'>
				<div>
					<h3 className='text-white font-semibold text-lg mb-2'>
						Generate Trading Signals
					</h3>
					<p className='text-gray-400 text-sm'>
						Get BUY/SELL/HOLD recommendations based on social data
					</p>
				</div>
				<Activity className='h-6 w-6 text-blue-400' />
			</div>

			<div className='space-y-4'>
				{/* What gets analyzed */}
				<div className='bg-gray-800/30 rounded-lg p-4'>
					<h4 className='text-gray-300 text-sm font-medium mb-3'>
						How Signals Are Generated:
					</h4>
					<div className='space-y-2 text-xs text-gray-400'>
						<div className='flex items-start space-x-2'>
							<span className='text-blue-400 font-bold'>1.</span>
							<span>
								<strong>5 Cryptocurrencies:</strong> Analyzes BTC, ETH, SOL,
								ADA, DOT (one signal per coin)
							</span>
						</div>
						<div className='flex items-start space-x-2'>
							<span className='text-purple-400 font-bold'>2.</span>
							<span>
								<strong>Social Data:</strong> Gets real-time mentions,
								engagement, creator diversity from LunarCrush
							</span>
						</div>
						<div className='flex items-start space-x-2'>
							<span className='text-green-400 font-bold'>3.</span>
							<span>
								<strong>AI Analysis:</strong> Google Gemini processes social
								patterns → BUY/SELL/HOLD + confidence
							</span>
						</div>
						<div className='flex items-start space-x-2'>
							<span className='text-orange-400 font-bold'>4.</span>
							<span>
								<strong>Database Storage:</strong> New signals saved and
								displayed with historical signals for comparison
							</span>
						</div>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-4 text-sm'>
					<div className='flex items-center space-x-2'>
						<Check className='h-4 w-4 text-green-400' />
						<span className='text-gray-300'>LunarCrush Data</span>
					</div>
					<div className='flex items-center space-x-2'>
						<Check className='h-4 w-4 text-green-400' />
						<span className='text-gray-300'>Google Gemini AI</span>
					</div>
					<div className='flex items-center space-x-2'>
						<Check className='h-4 w-4 text-green-400' />
						<span className='text-gray-300'>Real-time Processing</span>
					</div>
					<div className='flex items-center space-x-2'>
						<Check className='h-4 w-4 text-green-400' />
						<span className='text-gray-300'>Confidence Scoring</span>
					</div>
				</div>

				<button
					onClick={onTrigger}
					disabled={isLoading}
					className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2'>
					{isLoading ? (
						<>
							<div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
							<span>Processing...</span>
						</>
					) : (
						<>
							<Zap className='h-4 w-4' />
							<span>Generate Trading Signals</span>
						</>
					)}
				</button>
			</div>
		</div>
	);
};

// Main Dashboard Component
export default function AITradingDashboard() {
	const [signals, setSignals] = useState<TradingSignal[]>([]);
	const [jobs, setJobs] = useState<AnalysisJob[]>([]);
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
	const [currentJobId, setCurrentJobId] = useState<string | null>(null);

	// Real-time progress tracking
	const progress = useJobProgress(currentJobId);

	// When analysis completes, refresh signals and clear job tracking
	useEffect(() => {
		if (progress.isComplete) {
			console.log('🎉 Analysis completed, refreshing signals...');
			fetchSignals();
			// Clear job tracking after showing completion for a bit
			setTimeout(() => setCurrentJobId(null), 5000);
		}
	}, [progress.isComplete]);

	// Fetch latest signals from your existing API
	const fetchSignals = async () => {
		try {
			console.log('🔄 Fetching signals from API...');
			const response = await fetch('/api/signals', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log('✅ Received data:', data);
				setSignals(data.signals || []);
				setJobs(data.jobs || []);
				setLastUpdate(new Date());
			} else {
				const errorText = await response.text();
				console.error('❌ API response not ok:', response.status, errorText);
			}
		} catch (error) {
			console.error('❌ Error fetching signals:', error);
		}
	};

	// Trigger new analysis with enhanced job tracking
	const triggerAnalysis = async () => {
		try {
			console.log('🚀 Triggering new analysis...');
			const response = await fetch('/api/trigger', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ symbols: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'] }),
			});

			if (response.ok) {
				const result = await response.json();
				console.log('✅ Analysis triggered:', result);

				// Enhanced job tracking
				if (result.jobId) {
					console.log('🔗 Setting job ID from response:', result.jobId);
					setCurrentJobId(result.jobId);
				} else {
					console.log('🔍 No direct job ID, polling for latest job...');
					// Poll for the latest job after a short delay
					setTimeout(() => {
						pollForLatestJob();
					}, 2000);
				}
			} else {
				console.error('❌ Failed to trigger analysis:', response.status);
			}
		} catch (error) {
			console.error('❌ Error triggering analysis:', error);
		}
	};

	// Enhanced polling for latest job
	const pollForLatestJob = async () => {
		try {
			console.log('🔍 Polling for latest job...');
			const { data, error } = await supabase
				.from('analysis_jobs')
				.select('*')
				.order('started_at', { ascending: false })
				.limit(1)
				.single();

			if (error) {
				console.error('❌ Failed to get latest job:', error);
				return;
			}

			if (data && data.status === 'started') {
				console.log('✅ Found latest job:', data.id);
				setCurrentJobId(data.id);
			} else {
				console.log('🔄 No active job found, retrying in 2 seconds...');
				setTimeout(pollForLatestJob, 2000);
			}
		} catch (error) {
			console.error('❌ Error polling for latest job:', error);
		}
	};

	// Auto-refresh and manage explanation visibility
	useEffect(() => {
		fetchSignals();
		const interval = setInterval(fetchSignals, 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
			{/* Header */}
			<div className='border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						<div className='flex items-center space-x-4'>
							<div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
								<Activity className='h-6 w-6 text-white' />
							</div>
							<div>
								<h1 className='text-xl font-bold text-white'>
									AI Trading Agent
								</h1>
								<p className='text-sm text-gray-400'>
									Powered by LunarCrush & Google Gemini
								</p>
							</div>
						</div>

						<div className='flex items-center space-x-4'>
							<div className='text-right'>
								<div className='text-sm text-gray-300'>
									{signals.length} Active Signals
								</div>
								<div className='text-xs text-gray-500'>
									Updated:{' '}
									{lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}
								</div>
							</div>
							<div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
					{/* Trigger Panel */}
					<div className='lg:col-span-1'>
						<TriggerPanel
							onTrigger={triggerAnalysis}
							isLoading={progress.isLoading}
						/>

						{/* Metrics Explanation */}
						<div className='mt-6 bg-gray-900/50 border border-gray-700/50 rounded-xl p-6'>
							<h3 className='text-white font-semibold mb-4'>
								LunarCrush Metrics Explained
							</h3>
							<div className='space-y-3 text-sm'>
								<div>
									<span className='text-blue-400 font-medium'>Mentions:</span>
									<span className='text-gray-400 ml-2'>
										Number of total posts that mention specific assets over the
										last 24-hour timeframe
									</span>
								</div>
								<div>
									<span className='text-purple-400 font-medium'>
										Engagements:
									</span>
									<span className='text-gray-400 ml-2'>
										Social engagements including views, likes, comments,
										retweets, and upvotes
									</span>
								</div>
								<div>
									<span className='text-green-400 font-medium'>Creators:</span>
									<span className='text-gray-400 ml-2'>
										Unique number of creators that have posts that are active
										and have received engagements
									</span>
								</div>
								<div>
									<span className='text-orange-400 font-medium'>AltRank™:</span>
									<span className='text-gray-400 ml-2'>
										Evaluates both market and social data, assessing price
										movement alongside social activity indicators
									</span>
								</div>
								<div>
									<span className='text-pink-400 font-medium'>
										Galaxy Score™:
									</span>
									<span className='text-gray-400 ml-2'>
										Assesses the health of an asset against itself by analyzing
										market and social indicators (0-100)
									</span>
								</div>
							</div>
						</div>

					</div>

					{/* Main Content Area */}
					<div className='lg:col-span-3'>
						{/* Beat the Market Section - Always Visible */}
						<div className='bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 mb-6'>
							<div className='text-center mb-6'>
								<h2 className='text-2xl font-bold text-white mb-2'>
									Beat the Market with Social Intelligence
								</h2>
								<p className='text-gray-400'>
									Get trading signals before price movements happen by analyzing
									social sentiment data
								</p>
							</div>

							<div className='grid md:grid-cols-3 gap-6'>
								<div className='text-center'>
									<div className='w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
										<MessageSquare className='h-6 w-6 text-blue-400' />
									</div>
									<h3 className='text-white font-semibold mb-2'>
										Social Sentiment First
									</h3>
									<p className='text-gray-400 text-sm'>
										Track real conversations, mentions, and engagement across
										social platforms. Social buzz often happens{' '}
										<strong>before</strong> price movements, giving you an early
										advantage.
									</p>
								</div>

								<div className='text-center'>
									<div className='w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
										<Activity className='h-6 w-6 text-purple-400' />
									</div>
									<h3 className='text-white font-semibold mb-2'>
										AI-Powered Decisions
									</h3>
									<p className='text-gray-400 text-sm'>
										Google Gemini AI analyzes complex social patterns and
										generates clear BUY/SELL/HOLD recommendations with
										confidence scores, so you know exactly what to do.
									</p>
								</div>

								<div className='text-center'>
									<div className='w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
										<TrendingUp className='h-6 w-6 text-green-400' />
									</div>
									<h3 className='text-white font-semibold mb-2'>
										Exclusive Data Edge
									</h3>
									<p className='text-gray-400 text-sm'>
										Use LunarCrush's proprietary AltRank™ and Galaxy Score™
										metrics that most traders don't have access to. Creator
										diversity data helps avoid manipulation.
									</p>
								</div>
							</div>
						</div>

						{/* Dynamic Content Area - Progress or Signals */}
						{progress.isLoading || progress.error || progress.isComplete ? (
							<ProgressOverlay progress={progress} />
						) : signals.length === 0 ? (
							// First time user - show call to action
							<div className='bg-gray-900/50 border border-gray-700/50 rounded-xl p-12 text-center'>
								<AlertCircle className='h-12 w-12 text-gray-500 mx-auto mb-4' />
								<h3 className='text-xl font-semibold text-gray-300 mb-2'>
									Ready to Generate Your First Trading Signals?
								</h3>
								<p className='text-gray-500 mb-6'>
									Get AI-powered BUY/SELL/HOLD recommendations based on real
									social sentiment data from LunarCrush. These signals help you
									make informed trading decisions by analyzing social buzz
									before it affects prices.
								</p>
								<button
									onClick={triggerAnalysis}
									disabled={progress.isLoading}
									className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200'>
									Start Analysis
								</button>
							</div>
						) : (
							// Signals Display
							<div>
								<div className='flex items-center justify-between mb-6'>
									<div>
										<h2 className='text-xl font-bold text-white'>
											Latest Trading Signals
										</h2>
										<p className='text-gray-400 text-sm'>
											Showing {Math.min(signals.length, 10)} most recent signals
											from database
											{lastUpdate &&
												` • Last updated: ${lastUpdate.toLocaleTimeString()}`}
										</p>
									</div>
								</div>

								<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
									{signals.slice(0, 10).map((signal) => (
										<SignalCard key={signal.id} signal={signal} />
									))}
								</div>

							</div>
						)}
					</div>
				</div>
			</div>

			{/* Technology Attribution Footer */}
			<footer className='border-t border-gray-700/50 bg-gray-900/80 mt-16'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
						{/* Project Info */}
						<div>
							<h3 className='text-lg font-semibold text-white mb-4'>
								AI Trading Agent
							</h3>
							<p className='text-gray-400 text-sm mb-4'>
								Intelligent trading signals powered by social sentiment analysis
								and Google Gemini AI.
							</p>
							<a
								href='https://github.com/danilobatson/ai-trading-agent'
								target='_blank'
								rel='noopener noreferrer'
								className='inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors'>
								<svg
									className='h-5 w-5'
									fill='currentColor'
									viewBox='0 0 24 24'>
									<path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
								</svg>
								<span>View Source Code</span>
							</a>
						</div>

						{/* Built With */}
						<div>
							<h4 className='text-white font-semibold mb-4'>Built With</h4>
							<ul className='space-y-2 text-sm'>
								<li>
									<a
										href='https://nextjs.org'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Next.js - React Framework
									</a>
								</li>
								<li>
									<a
										href='https://www.typescriptlang.org'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										TypeScript - Type Safety
									</a>
								</li>
								<li>
									<a
										href='https://tailwindcss.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Tailwind CSS - Styling
									</a>
								</li>
								<li>
									<a
										href='https://inngest.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Inngest - Background Jobs
									</a>
								</li>
							</ul>
						</div>

						{/* Powered By */}
						<div>
							<h4 className='text-white font-semibold mb-4'>Powered By</h4>
							<ul className='space-y-2 text-sm'>
								<li>
									<a
										href='https://lunarcrush.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										LunarCrush - Social Analytics
									</a>
								</li>
								<li>
									<a
										href='https://ai.google.dev'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Google Gemini - AI Analysis
									</a>
								</li>
								<li>
									<a
										href='https://supabase.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Supabase - Database
									</a>
								</li>
								<li>
									<a
										href='https://vercel.com'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Vercel - Deployment
									</a>
								</li>
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h4 className='text-white font-semibold mb-4'>Resources</h4>
							<ul className='space-y-2 text-sm'>
								<li>
									<a
										href='https://lunarcrush.com/developers/api/endpoints'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										LunarCrush API Docs
									</a>
								</li>
								<li>
									<a
										href='https://inngest.com/docs'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Inngest Documentation
									</a>
								</li>
								<li>
									<a
										href='https://supabase.com/docs'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Supabase Docs
									</a>
								</li>
								<li>
									<a
										href='https://danilobatson.github.io'
										target='_blank'
										rel='noopener noreferrer'
										className='text-gray-400 hover:text-white transition-colors'>
										Developer Portfolio
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className='border-t border-gray-700/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between'>
						<p className='text-gray-500 text-sm'>
							© 2025 AI Trading Agent. Built for demonstration purposes.
						</p>
						<div className='flex items-center space-x-4 mt-4 md:mt-0'>
							<span className='text-gray-500 text-sm'>Powered by:</span>
							<div className='flex items-center space-x-3'>
								<a
									href='https://lunarcrush.com'
									className='text-blue-400 hover:text-blue-300'>
									LunarCrush
								</a>
								<span className='text-gray-600'>•</span>
								<a
									href='https://inngest.com'
									className='text-purple-400 hover:text-purple-300'>
									Inngest
								</a>
								<span className='text-gray-600'>•</span>
								<a
									href='https://ai.google.dev'
									target='_blank'
									rel='noopener noreferrer'
									className='text-green-400 hover:text-green-300'>
									Gemini AI
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
