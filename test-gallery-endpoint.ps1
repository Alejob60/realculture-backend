# PowerShell script to test the gallery endpoint
Write-Host "Testing Gallery Endpoint Fix" -ForegroundColor Green

# Login and get token (you'll need to use valid credentials)
Write-Host "1. Logging in..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body @{
        email = "test@example.com"
        password = "testpassword"
    } -ContentType "application/json"
    
    $token = $loginResponse.access_token
    Write-Host "Login successful!" -ForegroundColor Green
    
    # Call the gallery endpoint
    Write-Host "2. Calling gallery endpoint..." -ForegroundColor Yellow
    $galleryResponse = Invoke-RestMethod -Uri "http://localhost:3001/gallery" -Method Get -Headers @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "Gallery response:" -ForegroundColor Cyan
    $galleryResponse | ConvertTo-Json -Depth 10 | Write-Host
    
    # Check if any items have SAS URLs
    $itemsWithSasUrls = $galleryResponse | Where-Object { $_.sasUrl -ne $null }
    if ($itemsWithSasUrls.Count -gt 0) {
        Write-Host "✅ SUCCESS: Found $($itemsWithSasUrls.Count) items with SAS URLs!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No items with SAS URLs found. This might be expected if there's no content with valid blob paths." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails -ForegroundColor Red
    }
}