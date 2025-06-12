#!/bin/bash
# LunarCrush API Testing Script
# Run this FIRST to understand the actual data structure!

# Check if API key is set
if [ -z "$LUNARCRUSH_API_KEY" ]; then
    echo "❌ Please set your LUNARCRUSH_API_KEY environment variable"
    echo "   export LUNARCRUSH_API_KEY=your_api_key_here"
    exit 1
fi

echo "🧪 Testing LunarCrush API endpoints..."
echo "======================================"

# Test the most important endpoints
curl -H "Authorization: Bearer $LUNARCRUSH_API_KEY" \
  "https://lunarcrush.com/api4/public/coins/list/v1?sort=alt_rank&desc=false&limit=10" \
  | jq '.' > test_responses/coins_list.json

curl -H "Authorization: Bearer $LUNARCRUSH_API_KEY" \
  "https://lunarcrush.com/api4/public/topic/bitcoin/v1" \
  | jq '.' > test_responses/topic_bitcoin.json

echo "✅ API test complete! Check test_responses/ folder"
echo "🔍 Review the JSON files to see actual data structure"
