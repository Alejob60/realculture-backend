#!/bin/bash
# Test gallery endpoint with curl
# Replace YOUR_JWT_TOKEN_HERE with a valid JWT token

echo "Testing gallery endpoint with curl"
curl -X GET \
  http://localhost:3001/api/gallery \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -v