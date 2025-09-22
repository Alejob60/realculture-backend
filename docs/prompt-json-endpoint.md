# Prompt-JSON Endpoint Documentation

## Overview
The `/api/prompt-json` endpoint generates structured JSON data based on a natural language prompt. This endpoint requires authentication and consumes user credits.

## Endpoint Details
- **URL**: `POST /api/prompt-json`
- **Authentication**: Required (Bearer Token)
- **Content-Type**: application/json

## Request Body
```json
{
  "prompt": "string"
}
```

## Response Format
```json
{
  "success": boolean,
  "message": "string",
  "result": {
    // Generated JSON structure based on the prompt
  },
  "credits": number
}
```

## Example Usage

### cURL
```bash
curl -X POST "http://localhost:3001/api/prompt-json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a JSON structure for a product catalog with 3 products"}'
```

### PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    prompt = "Create a JSON structure for a product catalog with 3 products"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/prompt-json" -Method POST -Headers $headers -Body $body
```

## Credit Consumption
- **FREE plan**: 5 credits per use
- **CREATOR plan**: 10 credits per use
- **PRO plan**: 15 credits per use

## Error Responses
- **400**: Invalid or empty prompt
- **401**: Missing or invalid authentication token
- **403**: Insufficient credits or plan not allowed
- **404**: User not found
- **500**: Internal server error

## Testing
A test script is available at `test/test-prompt-json.ps1` which demonstrates the complete flow:
1. User registration
2. User login to obtain JWT token
3. Calling the prompt-json endpoint with a test prompt