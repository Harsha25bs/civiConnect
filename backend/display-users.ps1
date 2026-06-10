# PowerShell script to display all registered users in the civiCConnect application
Write-Host "civiCConnect - Display All Registered Users" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Get the directory of the current script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if the display-users.js script exists
$jsScriptPath = Join-Path -Path $scriptPath -ChildPath "display-users.js"
if (-not (Test-Path $jsScriptPath)) {
    Write-Host "Error: display-users.js script not found at $jsScriptPath" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
$envFilePath = Join-Path -Path $scriptPath -ChildPath ".env"
if (-not (Test-Path $envFilePath)) {
    Write-Host "Warning: .env file not found at $envFilePath" -ForegroundColor Yellow
    Write-Host "The script may fail if MONGODB_URI is not defined in the environment." -ForegroundColor Yellow
}

Write-Host "Fetching user data from MongoDB..." -ForegroundColor Cyan

# Run the Node.js script
try {
    # Change to the script directory to ensure relative paths work correctly
    Push-Location $scriptPath
    
    # Execute the Node.js script
    node display-users.js
    
    # Return to the original directory
    Pop-Location
    
    Write-Host "Operation completed successfully." -ForegroundColor Green
} catch {
    Write-Host "Error executing the script: $_" -ForegroundColor Red
}

# Pause to keep the PowerShell window open
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
