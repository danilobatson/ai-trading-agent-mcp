// src/app/api/signals/route.ts - Create this new file
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Use your existing supabase client

export async function GET(request: NextRequest) {
	try {
		console.log('📊 Fetching signals from database...');

		// Fetch latest trading signals using your existing supabase setup
		const { data: signals, error: signalsError } = await supabase
			.from('trading_signals')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(20);

		if (signalsError) {
			console.error('❌ Error fetching signals:', signalsError);
			throw new Error(`Failed to fetch signals: ${signalsError.message}`);
		}

		// Fetch latest analysis jobs using your existing supabase setup
		const { data: jobs, error: jobsError } = await supabase
			.from('analysis_jobs')
			.select('*')
			.order('started_at', { ascending: false })
			.limit(10);

		if (jobsError) {
			console.error('❌ Error fetching jobs:', jobsError);
			// Don't throw error for jobs - signals are more important
			console.warn('Jobs fetch failed, continuing with signals only');
		}

		console.log(
			`✅ Found ${signals?.length || 0} signals and ${jobs?.length || 0} jobs`
		);

		return NextResponse.json({
			success: true,
			signals: signals || [],
			jobs: jobs || [],
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('❌ Error in GET /api/signals:', error);
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
