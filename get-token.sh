#!/bin/bash

# Simple script to get a bearer token quickly
# Usage: ./get-token.sh

SERVER_URL="${PDF_SERVER_URL:-http://localhost:3001}"

# Check if server is running
if ! curl -s "${SERVER_URL}/api/health" > /dev/null 2>&1; then
    echo "❌ Error: Server is not running at ${SERVER_URL}"
    echo "Start the server with: npm run dev"
    exit 1
fi

# Generate token
RESPONSE=$(curl -s -X POST "${SERVER_URL}/api/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

# Check if request was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate token"
    exit 1
fi

# Extract token
TOKEN=$(echo "$RESPONSE" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Error: Failed to extract token from response"
    echo "Response: $RESPONSE"
    exit 1
fi

# Output token
echo "✅ Bearer Token Generated Successfully!"
echo ""
echo "Token:"
echo "$TOKEN"
echo ""
echo "Use in requests as:"
echo "Authorization: Bearer $TOKEN"
echo ""
echo "Or export for easy use:"
echo "export PDF_TOKEN=\"$TOKEN\""





