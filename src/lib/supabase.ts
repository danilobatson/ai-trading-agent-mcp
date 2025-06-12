import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save trading signal to database
 */
export const saveSignal = async (signal: any): Promise<void> => {
	const { error } = await supabase.from('trading_signals').insert([signal]);

	if (error) {
		console.error('Failed to save signal:', error);
		throw new Error(`Failed to save signal: ${error.message}`);
	}
};
