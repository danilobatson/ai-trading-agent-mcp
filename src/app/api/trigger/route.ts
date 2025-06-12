// src/app/api/trigger/route.ts - Fixed to pass jobId correctly
import { inngest } from '@/lib/inngest';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		console.log('🚀 Trigger API called at:', new Date().toISOString());

		const body = await request.json();
		const { symbols } = body;

		// Generate the job ID HERE so we can return it AND pass it to Inngest
		const jobId = `job_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		console.log('📋 Request symbols:', symbols);
		console.log('🔗 Generated job ID:', jobId);

		// CRITICAL: Pass the jobId IN the event data
		const eventData = {
			jobId: jobId, // ← This is what was missing!
			symbols: symbols || ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'],
			symbolCount: 5,
			timestamp: Date.now(),
			triggerType: 'manual',
		};

		console.log('📋 Sending event data:', eventData);

		// Send event to Inngest
		const eventId = await inngest.send({
			name: 'trading.analyze',
			data: eventData,
		});

		console.log('✅ Event sent to Inngest with ID:', eventId);

		return NextResponse.json({
			success: true,
			jobId: jobId, // Return to frontend for tracking
			eventId: eventId,
			message: 'Analysis job queued successfully',
		});
	} catch (error) {
		console.error('❌ Failed to trigger analysis:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to queue processing job',
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		status: 'Trading Analysis API',
		endpoints: {
			POST: 'Trigger new analysis job',
		},
	});
}
