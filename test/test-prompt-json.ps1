# Script to test the prompt-json endpoint on Windows with PowerShell

# Configuration
$BASE_URL = "http://localhost:3001"
$EMAIL = "test@example.com"
$PASSWORD = "testpassword123"
$NAME = "Test User"

Write-Host "Testing prompt-json endpoint..." -ForegroundColor Green
Write-Host "Base URL: $BASE_URL" -ForegroundColor Gray

# Register a new user
Write-Host "`n1. Registering user..." -ForegroundColor Yellow
$registerBody = @{
    name = $NAME
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "Register response: $($registerResponse | ConvertTo-Json -Depth 10)" -ForegroundColor Gray
} catch {
    Write-Host "Register error: $($_.Exception.Message)" -ForegroundColor Red
    # Continue anyway as user might already exist
}

# Login to get token
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful" -ForegroundColor Green
    $token = $loginResponse.token
} catch {
    Write-Host "Login error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if (-not $token) {
    Write-Host "Failed to extract token from login response" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Token extracted successfully" -ForegroundColor Green

# Test prompt-json endpoint
Write-Host "`n4. Testing prompt-json endpoint..." -ForegroundColor Yellow
$prompt = "Create a JSON structure for a product catalog with 3 products"
$promptJsonBody = @{
    prompt = $prompt
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $promptJsonResponse = Invoke-RestMethod -Uri "$BASE_URL/api/prompt-json" -Method POST -Body $promptJsonBody -Headers $headers
    Write-Host "Prompt JSON response:" -ForegroundColor Gray
    Write-Host ($promptJsonResponse | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
    
    if ($promptJsonResponse.success) {
        Write-Host "`n✅ Test passed: prompt-json endpoint is working correctly" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Test failed: prompt-json endpoint returned success=false" -ForegroundColor Red
    }
} catch {
    Write-Host "Prompt JSON error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error response body: $responseBody" -ForegroundColor Red
    }
    Write-Host "`n❌ Test failed: prompt-json endpoint returned an error" -ForegroundColor Red
}