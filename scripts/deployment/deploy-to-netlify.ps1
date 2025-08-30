#!/usr/bin/env pwsh
# UrjaBandhu Netlify Deployment Script

Write-Host " UrjaBandhu Netlify Deployment Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host " Git repository not found. Please initialize git first." -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Host " Frontend package.json not found. Are you in the right directory?" -ForegroundColor Red
    exit 1
}

Write-Host " Project structure verified" -ForegroundColor Green

# Test build locally
Write-Host " Testing local build..." -ForegroundColor Yellow
Set-Location "frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host " Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}
Set-Location ".."
Write-Host " Build successful" -ForegroundColor Green

# Stage files for commit
Write-Host " Staging files for commit..." -ForegroundColor Yellow
git add netlify.toml
git add frontend/.env.example
git add frontend/next.config.js
git add NETLIFY_DEPLOYMENT.md

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    # Commit changes
    Write-Host " Committing deployment configuration..." -ForegroundColor Yellow
    git commit -m "Add Netlify deployment configuration

- Add netlify.toml with build settings
- Add environment variables example
- Update Next.js config for production
- Add comprehensive deployment guide"

    # Push to remote
    Write-Host " Pushing to remote repository..." -ForegroundColor Yellow
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Changes pushed successfully" -ForegroundColor Green
    } else {
        Write-Host " Failed to push changes" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ No changes to commit" -ForegroundColor Blue
}

Write-Host ""
Write-Host " Deployment setup complete!" -ForegroundColor Green
Write-Host " Next steps:" -ForegroundColor Yellow
Write-Host "   1. Go to https://app.netlify.com" -ForegroundColor White
Write-Host "   2. Click 'Add new site'  'Import an existing project'" -ForegroundColor White
Write-Host "   3. Select your Git provider and this repository" -ForegroundColor White
Write-Host "   4. Netlify will auto-detect the build settings" -ForegroundColor White
Write-Host "   5. Add environment variables (see .env.example)" -ForegroundColor White
Write-Host "   6. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host " For detailed instructions, see NETLIFY_DEPLOYMENT.md" -ForegroundColor Cyan
