#!/bin/bash
# Script to test the prompt-json endpoint

# Configuration
BASE_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="testpassword123"
NAME="Test User"

echo "Testing prompt-json endpoint..."
echo "Base URL: $BASE_URL"

# Register a new user
echo "\n1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Register response: $REGISTER_RESPONSE"

# Login to get token
echo "\n2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Login response: $LOGIN_RESPONSE"

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to extract token from login response"
  exit 1
fi

echo "\n3. Token extracted successfully"

# Test prompt-json endpoint
echo "\n4. Testing prompt-json endpoint..."
PROMPT="Create a JSON structure for a product catalog with 3 products"
PROMPT_JSON_RESPONSE=$(curl -s -X POST "$BASE_URL/api/prompt-json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"$PROMPT\"}")

echo "Prompt JSON response:"
echo $PROMPT_JSON_RESPONSE | jq '.'

# Check if the response was successful
if echo $PROMPT_JSON_RESPONSE | jq -e '.success' > /dev/null; then
  echo "\n✅ Test passed: prompt-json endpoint is working correctly"
else
  echo "\n❌ Test failed: prompt-json endpoint returned an error"
  echo "Response: $PROMPT_JSON_RESPONSE"
fi