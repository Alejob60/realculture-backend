# Detailed test script for gallery endpoint with logging
Write-Host "=== Gallery Endpoint Detailed Test ==="

# First, login to get a token
Write-Host "`n1. Logging in..."
$loginBody = @{
    email = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!"
    
    # Extract the token
    $token = $loginResponse.token
    
    if ([string]::IsNullOrEmpty($token)) {
        Write-Host "ERROR: Failed to get token. Exiting."
        exit 1
    }
    
    Write-Host "Token obtained (first 20 chars): $($token.Substring(0, [Math]::Min(20, $token.Length)))..."
    
    # Now test the gallery endpoint
    Write-Host "`n2. Calling gallery endpoint..."
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $galleryResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/gallery" -Method GET -Headers $headers
    
    Write-Host "Gallery endpoint called successfully!"
    Write-Host "Response type: $($galleryResponse.GetType().Name)"
    
    # Check if response is an array
    if ($galleryResponse -is [array]) {
        Write-Host "Number of items in gallery: $($galleryResponse.Count)"
        
        if ($galleryResponse.Count -gt 0) {
            Write-Host "`nFirst item details:"
            $galleryResponse[0] | ConvertTo-Json -Depth 10 | Write-Host
            
            Write-Host "`nAll item types:"
            $galleryResponse | ForEach-Object { $_.type } | Sort-Object -Unique | Write-Host
        } else {
            Write-Host "Gallery is empty."
        }
    } else {
        Write-Host "Response is not an array. Full response:"
        $galleryResponse | ConvertTo-Json -Depth 10 | Write-Host
    }
    
    Write-Host "`n=== Test Complete ==="
} catch {
    Write-Host "ERROR occurred: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Host "Response Headers:"
        $_.Exception.Response.Headers | Format-List
    }
    
    # Try to read the response body if available
    try {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    } catch {
        Write-Host "Could not read response body: $($_.Exception.Message)"
    }
}