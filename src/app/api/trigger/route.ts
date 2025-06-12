import { inngest } from '@/lib/inngest';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { symbols } = body;

		// Generate unique job ID
		const jobId = `job_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		// Prepare event data for Inngest
		const eventData = {
			jobId: jobId,
			symbols: symbols || ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'],
			symbolCount: 5,
			timestamp: Date.now(),
			triggerType: 'manual',
		};

		// Send event to Inngest
		const eventId = await inngest.send({
			name: 'trading.analyze',
			data: eventData,
		});

		return NextResponse.json({
			success: true,
			jobId: jobId,
			eventId: eventId,
			message: 'Analysis job queued successfully',
		});
	} catch (error) {
		console.error('Failed to trigger analysis:', error);
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
