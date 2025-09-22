#!/bin/bash

# Test script for gallery endpoint
echo "Testing Gallery Endpoint"

# First, login to get a token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }')

echo "Login response:"
echo $LOGIN_RESPONSE | jq .

# Extract the token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ]; then
  echo "Failed to get token. Exiting."
  exit 1
fi

echo "2. Token obtained: $TOKEN"

# Now test the gallery endpoint
echo "3. Calling gallery endpoint..."
GALLERY_RESPONSE=$(curl -s -X GET http://localhost:3001/api/gallery \
  -H "Authorization: Bearer $TOKEN")

echo "Gallery response:"
echo $GALLERY_RESPONSE | jq .

echo "4. Done."