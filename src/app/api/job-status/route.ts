// src/app/api/job-status/route.ts - API endpoint to check real job progress
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const jobId = searchParams.get('jobId');

		if (jobId) {
			// Get specific job status by ID
			const { data, error } = await supabase
				.from('analysis_jobs')
				.select('*')
				.eq('id', jobId)
				.single();

			if (error) {
				console.error('Error fetching specific job:', error);
				throw error;
			}

			return NextResponse.json({
				success: true,
				job: data,
				timestamp: new Date().toISOString(),
			});
		} else {
			// Get latest job status (most recent started or completed job)
			const { data, error } = await supabase
				.from('analysis_jobs')
				.select('*')
				.order('started_at', { ascending: false })
				.limit(1);

			if (error) {
				console.error('Error fetching latest job:', error);
				throw error;
			}

			const latestJob = data?.[0] || null;

			return NextResponse.json({
				success: true,
				job: latestJob,
				timestamp: new Date().toISOString(),
			});
		}
	} catch (error) {
		console.error('Error in job-status API:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch job status',
				job: null,
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
