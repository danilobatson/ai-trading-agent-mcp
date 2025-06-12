// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import {
	signalAnalysisWorkflow,
	analyzeSingleSymbol,
} from '@/functions/signal-analysis';

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [signalAnalysisWorkflow, analyzeSingleSymbol],
});
