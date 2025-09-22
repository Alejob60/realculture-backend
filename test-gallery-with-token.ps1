# Test gallery endpoint with a valid JWT token
# Replace YOUR_JWT_TOKEN_HERE with a valid JWT token

$token = "YOUR_JWT_TOKEN_HERE"

# Make the API call
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$url = "http://localhost:3001/api/gallery"

Write-Host "Testing gallery endpoint: $url"
try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Gallery Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}