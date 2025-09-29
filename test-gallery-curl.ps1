# Test gallery endpoint with a simple curl command
Write-Host "Testing gallery endpoint with curl..."

# First, let's try to get a valid token by registering a user
Write-Host "Registering test user..."
$registerBody = @{
    email = "curl-test-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPassword123!"
    name = "Curl Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "Registration successful"
    Write-Host "Token: $($registerData.token)"
    
    # Now test the gallery endpoint
    Write-Host "Testing gallery endpoint..."
    $galleryResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/gallery" -Method GET -Headers @{
        "Authorization" = "Bearer $($registerData.token)"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Gallery response status: $($galleryResponse.StatusCode)"
    Write-Host "Gallery response data:"
    Write-Host $galleryResponse.Content
    
} catch {
    Write-Host "Error occurred:"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Message: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}