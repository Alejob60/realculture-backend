# Test gallery endpoint with login
# Replace with valid user credentials
$email = "test@example.com"
$password = "your-password-here"

# Login to get JWT token
$loginUrl = "http://localhost:3001/api/auth/login"
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

Write-Host "Logging in..."
try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "Login successful. Token received."
} catch {
    Write-Host "Login failed:"
    Write-Host $_.Exception.Message
    Write-Host $_.ErrorDetails.Message
    exit
}

# Make the API call to gallery endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$galleryUrl = "http://localhost:3001/api/gallery"

Write-Host "Testing gallery endpoint: $galleryUrl"
try {
    $response = Invoke-RestMethod -Uri $galleryUrl -Method GET -Headers $headers
    Write-Host "Gallery Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred accessing gallery:"
    Write-Host $_.Exception.Message
    Write-Host $_.ErrorDetails.Message
}