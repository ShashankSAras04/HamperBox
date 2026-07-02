# =========================================================================
# HamperBox Supabase Deployment Script
# =========================================================================

# Ensure we're in the correct directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       HamperBox Supabase Schema Deployer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Get Project Ref
$ProjectRef = Read-Host "Enter your Supabase Project Reference ID (e.g. abcdefghijklmnop)"
if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
    Write-Error "Project Reference ID is required."
    exit 1
}

# Get Database Password
$DbPassword = Read-Host "Enter your Supabase Database Password" -AsSecureString
if ($null -eq $DbPassword) {
    Write-Error "Database password is required."
    exit 1
}

# Convert Secure String to Plain Text for connection string
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Formulate Connection String (Supabase uses port 5432 for Postgres direct connection)
$ConnectionString = "postgresql://postgres:$($PlainPassword)@db.$($ProjectRef).supabase.co:5432/postgres"

Write-Host ""
Write-Host "Testing/Installing Supabase CLI..." -ForegroundColor Yellow

# Try running supabase db push via npx
try {
    Write-Host "Running migrations via Supabase CLI..." -ForegroundColor Yellow
    # We use npx to run supabase CLI dynamically without global installation
    npx -y supabase db push --db-url "$ConnectionString"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✔ Database migration successfully applied to Supabase!" -ForegroundColor Green
        Write-Host ""
        Write-Host "--------------------------------------------------" -ForegroundColor Cyan
        Write-Host "Next Step: Add Sample Seed Data" -ForegroundColor Cyan
        Write-Host "--------------------------------------------------" -ForegroundColor Cyan
        Write-Host "Since seed data is for testing and should be applied carefully, please:"
        Write-Host "1. Open the Supabase Dashboard SQL Editor for your project:"
        Write-Host "   https://supabase.com/dashboard/project/$($ProjectRef)/sql/new" -ForegroundColor Green
        Write-Host "2. Copy and paste the contents of the local file:"
        Write-Host "   supabase/seed.sql" -ForegroundColor Green
        Write-Host "3. Run the query to insert categories, gifts, items, and test users."
        Write-Host ""
    } else {
        Write-Host "❌ Deployment failed. Check your password or project reference ID." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running Supabase CLI via npx. Please ensure Node.js and npm are installed." -ForegroundColor Red
    Write-Host $_
}
