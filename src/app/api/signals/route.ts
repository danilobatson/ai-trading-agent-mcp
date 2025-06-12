import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
	try {
		// Fetch latest trading signals
		const { data: signals, error: signalsError } = await supabase
			.from('trading_signals')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(20);

		if (signalsError) {
			console.error('Error fetching signals:', signalsError);
			throw new Error(`Failed to fetch signals: ${signalsError.message}`);
		}

		// Fetch latest analysis jobs
		const { data: jobs, error: jobsError } = await supabase
			.from('analysis_jobs')
			.select('*')
			.order('started_at', { ascending: false })
			.limit(10);

		if (jobsError) {
			console.error('Error fetching jobs:', jobsError);
		}

		return NextResponse.json({
			success: true,
			signals: signals || [],
			jobs: jobs || [],
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error in GET /api/signals:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch trading signals',
				signals: [],
				jobs: [],
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
