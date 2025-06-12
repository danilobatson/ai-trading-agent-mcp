# LunarCrush API Endpoints

## Key Differentiator Metrics
Focus on these unique LunarCrush metrics:
- **mentions** (posts_active) - Volume of social posts
- **interactions** (interactions_24h) - Total social engagement  
- **creators** (contributors_active) - Unique content creators
- **altRank** (alt_rank) - Proprietary ranking (lower = better)
- **galaxyScore** (galaxy_score) - Proprietary health score

❌ Avoid sentiment - too subjective, everyone has this

## Testing Instructions
1. Get API key from https://lunarcrush.com/developers
2. Set environment: `export LUNARCRUSH_API_KEY=your_key`
3. Run: `./test_api.sh`
4. Review responses in test_responses/ folder
5. Build TypeScript interfaces based on real data

## Individual Plan vs Builder Plan
- Individual: $24-30/month, hourly updates, 10 req/min
- Builder: $240-300/month, real-time, 100 req/min

For tutorial: Start with Individual plan, show upgrade path to Builder.
