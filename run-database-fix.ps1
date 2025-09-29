# PowerShell script to run database fix
# Update these variables with your actual database credentials
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "1234"

Write-Host "Running database schema fix..." -ForegroundColor Green

# Check if psql is available
try {
    $psqlVersion = psql --version
    Write-Host "Found psql: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

# Run the manual database fix
Write-Host "Executing manual database fix..." -ForegroundColor Yellow
try {
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "manual-database-fix.sql"
    Write-Host "Manual database fix completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error running manual database fix: $_" -ForegroundColor Red
}

# Optional: Run the complete database fix
Write-Host "Do you want to run the complete database fix? (y/n)" -ForegroundColor Cyan
$choice = Read-Host
if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host "Executing complete database fix..." -ForegroundColor Yellow
    try {
        # Set the PGPASSWORD environment variable for authentication
        $env:PGPASSWORD = $DB_PASSWORD
        psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "complete-manual-database-fix.sql"
        Write-Host "Complete database fix completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error running complete database fix: $_" -ForegroundColor Red
    }
}

Write-Host "Database fix process completed." -ForegroundColor Green