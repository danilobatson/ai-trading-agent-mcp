// src/hooks/useJobProgress.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface JobProgress {
	currentStep: string;
	stepMessage: string;
	progressPercentage: number;
	status: string;
	isLoading: boolean;
	isComplete: boolean;
	error: string | null;
}

export function useJobProgress(jobId: string | null): JobProgress {
	const [progress, setProgress] = useState<JobProgress>({
		currentStep: '',
		stepMessage: '',
		progressPercentage: 0,
		status: 'started',
		isLoading: false,
		isComplete: false,
		error: null,
	});

	useEffect(() => {
		if (!jobId) {
			setProgress((prev) => ({ ...prev, isLoading: false, isComplete: false }));
			return;
		}

		console.log(`🔄 Starting real-time progress tracking for job: ${jobId}`);
		setProgress((prev) => ({ ...prev, isLoading: true, error: null }));

		// Set up real-time subscription
		const channel = supabase
			.channel(`job-progress-${jobId}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'analysis_jobs',
					filter: `id=eq.${jobId}`,
				},
				(payload) => {
					console.log('📊 Real-time job update:', payload.new);

					if (payload.new) {
						const job = payload.new as any;
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
			.subscribe((status) => {
				console.log('📡 Subscription status:', status);
			});

		// Initial fetch
		fetchCurrentProgress();

		async function fetchCurrentProgress() {
			try {
				const { data, error } = await supabase
					.from('analysis_jobs')
					.select('current_step, step_message, progress_percentage, status')
					.eq('id', jobId)
					.single();

				if (error) {
					if (error.code === 'PGRST116') {
						// Job not found yet - this is normal for new jobs
						console.log('Job not found yet, waiting for real-time updates...');
						return;
					}
					throw error;
				}

				if (data) {
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
				console.error('Failed to fetch job progress:', error);
				setProgress((prev) => ({
					...prev,
					error: error.message,
					isLoading: false,
				}));
			}
		}

		// Cleanup subscription
		return () => {
			console.log(`🔄 Cleaning up subscription for job: ${jobId}`);
			supabase.removeChannel(channel);
		};
	}, [jobId]);

	return progress;
}
