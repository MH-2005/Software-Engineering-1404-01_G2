# Deploy Frontend Script for Team4
# This script builds the frontend and deploys it to Django static/templates

Write-Host "🚀 Starting Team4 Frontend Deployment..." -ForegroundColor Cyan

# Change to frontend directory
Set-Location "$PSScriptRoot\front"

# Build the frontend
Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Remove old static files
Write-Host "`n🧹 Cleaning old static files..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\static\assets") {
    Remove-Item "$PSScriptRoot\static\assets" -Recurse -Force
}

# Create static/assets directory
New-Item -ItemType Directory -Path "$PSScriptRoot\static\assets" -Force | Out-Null

# Copy assets folder contents
Write-Host "`n📂 Copying assets to static folder..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\front\dist\assets") {
    Copy-Item "$PSScriptRoot\front\dist\assets\*" -Destination "$PSScriptRoot\static\assets\" -Recurse -Force
    Write-Host "✅ Assets subfolder copied" -ForegroundColor Green
}

# Copy JS and CSS files from dist root
Copy-Item "$PSScriptRoot\front\dist\*.js" -Destination "$PSScriptRoot\static\assets\" -Force -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\front\dist\*.css" -Destination "$PSScriptRoot\static\assets\" -Force -ErrorAction SilentlyContinue
Write-Host "✅ JS/CSS files copied to static/assets/" -ForegroundColor Green

# Copy index.html to templates
Write-Host "`n📄 Copying index.html to templates..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\front\dist\index.html") {
    # Read index.html
    $indexContent = Get-Content "$PSScriptRoot\front\dist\index.html" -Raw
    
    # Replace /assets/ with {% static 'assets/' %} for Django static files
    $indexContent = $indexContent -replace '"/assets/', '"{% static ''assets/'
    $indexContent = $indexContent -replace '\.js"', '.js'' %}"'
    $indexContent = $indexContent -replace '\.css"', '.css'' %}"'
    
    # Add {% load static %} at the top
    $indexContent = "{% load static %}`n" + $indexContent
    
    # Ensure templates directory exists
    if (-not (Test-Path "$PSScriptRoot\templates\team4")) {
        New-Item -ItemType Directory -Path "$PSScriptRoot\templates\team4" -Force | Out-Null
    }
    
    # Save to templates
    $indexContent | Set-Content "$PSScriptRoot\templates\team4\index.html" -Encoding UTF8
    Write-Host "✅ index.html copied to templates/team4/" -ForegroundColor Green
} else {
    Write-Host "❌ index.html not found in dist!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Deployment completed successfully!" -ForegroundColor Green
Write-Host "   You can now run Django server to see changes at http://localhost:8000/team4/" -ForegroundColor Cyan
