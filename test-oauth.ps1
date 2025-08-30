# OAuth Testing Script for UrjaBandhu (PowerShell)
# This script helps test the OAuth flow for new users and verify fixes

Write-Host "🔐 OAuth Testing Script for UrjaBandhu" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: This script should be run from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pre-test Checklist:" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow
Write-Host "1. ✅ Ensure Supabase project is configured"
Write-Host "2. ✅ Google OAuth is enabled in Supabase dashboard"
Write-Host "3. ✅ Redirect URLs are configured correctly:"
Write-Host "   - http://localhost:3000/auth/callback (for local dev)"
Write-Host "   - https://your-domain.com/auth/callback (for production)"
Write-Host "4. ✅ Environment variables are set correctly"
Write-Host ""

Write-Host "🔍 Environment Check:" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Cyan

# Check for required environment variables
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "✅ NEXT_PUBLIC_SUPABASE_URL is set" -ForegroundColor Green
    } else {
        Write-Host "❌ NEXT_PUBLIC_SUPABASE_URL is missing" -ForegroundColor Red
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set" -ForegroundColor Green
    } else {
        Write-Host "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 Testing Steps:" -ForegroundColor Magenta
Write-Host "----------------" -ForegroundColor Magenta
Write-Host "1. Start the development server: npm run dev"
Write-Host "2. Open http://localhost:3000/oauth-test"
Write-Host "3. Check configuration status on the test page"
Write-Host "4. Test OAuth flow for new users:"
Write-Host "   a. Sign out if already signed in"
Write-Host "   b. Click 'Test Google OAuth'"
Write-Host "   c. Complete Google authentication"
Write-Host "   d. Verify redirect to callback page"
Write-Host "   e. Check if Consumer Setup Modal appears for new users"
Write-Host "   f. Verify final redirect to AI Chatbot"
Write-Host ""

Write-Host "🔧 Diagnostic Tools Available:" -ForegroundColor Blue
Write-Host "-----------------------------" -ForegroundColor Blue
Write-Host "- OAuth Test Page: /oauth-test"
Write-Host "- Diagnostic Component: OAuthDiagnostic"
Write-Host "- Browser Console: Check for error messages"
Write-Host "- Network Tab: Monitor API calls and redirects"
Write-Host ""

Write-Host "🐛 Common Issues and Solutions:" -ForegroundColor DarkYellow
Write-Host "------------------------------" -ForegroundColor DarkYellow
Write-Host "Issue: OAuth timeout"
Write-Host "Solution: Check internet connection and Supabase status"
Write-Host ""
Write-Host "Issue: Profile creation failed"
Write-Host "Solution: Verify database permissions and table structure"
Write-Host ""
Write-Host "Issue: Redirect loop"
Write-Host "Solution: Clear browser cookies and local storage"
Write-Host ""
Write-Host "Issue: Modal not showing"
Write-Host "Solution: Check browser console for JavaScript errors"
Write-Host ""
Write-Host "Issue: Session not persisting"
Write-Host "Solution: Verify cookies are not blocked"
Write-Host ""

Write-Host "⚡ Recent Optimizations Applied:" -ForegroundColor Green
Write-Host "-------------------------------" -ForegroundColor Green
Write-Host "🚀 Removed setTimeout delays for instant redirects"
Write-Host "⚡ Streamlined database queries with .single() method"
Write-Host "🔄 Added custom event system for immediate session refresh"
Write-Host "💨 Users no longer need to refresh page after OAuth"
Write-Host "🎯 New users redirect directly to setup modal"
Write-Host "🏃‍♂️ Existing users redirect immediately to AI chatbot"
Write-Host "🔍 Enhanced error handling and retry logic"
Write-Host "📊 Added comprehensive diagnostic tools"
Write-Host ""

Write-Host "📝 Test Results Log:" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
Write-Host "After testing, document the following:"
Write-Host "- ✅/❌ OAuth initiation works"
Write-Host "- ✅/❌ Google consent screen appears"
Write-Host "- ✅/❌ Callback handling works"
Write-Host "- ✅/❌ New user profile creation"
Write-Host "- ✅/❌ Consumer Setup Modal shows for new users"
Write-Host "- ✅/❌ Existing user direct redirect"
Write-Host "- ✅/❌ Session persistence"
Write-Host "- ✅/❌ Error handling and retry logic"
Write-Host ""

Write-Host "🚀 Ready to start testing!" -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Yellow
Write-Host "Then open: http://localhost:3000/oauth-test" -ForegroundColor Yellow

# Optionally start the dev server
$startServer = Read-Host "`nWould you like to start the development server now? (y/n)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host "Starting development server..." -ForegroundColor Green
    npm run dev
}
