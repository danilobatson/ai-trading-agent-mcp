// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	serverExternalPackages: ['@google/generative-ai'],
	experimental: {
		// Remove any deprecated options
	},
};

export default nextConfig;
