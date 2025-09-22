# Test gallery endpoint
# Replace with your actual JWT token
$token = "your-jwt-token-here"

# Make the API call
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$url = "http://localhost:3001/api/gallery"

Write-Host "Testing gallery endpoint: $url"
try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:"
    Write-Host $_.Exception.Message
    Write-Host $_.ErrorDetails.Message
}