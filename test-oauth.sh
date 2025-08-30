#!/bin/bash

# OAuth Testing Script for UrjaBandhu
# This script helps test the OAuth flow for new users and verify fixes

echo "🔐 OAuth Testing Script for UrjaBandhu"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script should be run from the project root directory"
    exit 1
fi

echo "📋 Pre-test Checklist:"
echo "----------------------"
echo "1. ✅ Ensure Supabase project is configured"
echo "2. ✅ Google OAuth is enabled in Supabase dashboard"
echo "3. ✅ Redirect URLs are configured correctly:"
echo "   - http://localhost:3000/auth/callback (for local dev)"
echo "   - https://your-domain.com/auth/callback (for production)"
echo "4. ✅ Environment variables are set correctly"
echo ""

echo "🔍 Environment Check:"
echo "--------------------"

# Check for required environment variables
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_URL is missing"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    fi
else
    echo "❌ .env.local file not found"
fi

echo ""
echo "🧪 Testing Steps:"
echo "----------------"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000/oauth-test"
echo "3. Check configuration status on the test page"
echo "4. Test OAuth flow for new users:"
echo "   a. Sign out if already signed in"
echo "   b. Click 'Test Google OAuth'"
echo "   c. Complete Google authentication"
echo "   d. Verify redirect to callback page"
echo "   e. Check if Consumer Setup Modal appears for new users"
echo "   f. Verify final redirect to AI Chatbot"
echo ""

echo "🔧 Diagnostic Tools Available:"
echo "-----------------------------"
echo "- OAuth Test Page: /oauth-test"
echo "- Diagnostic Component: OAuthDiagnostic"
echo "- Browser Console: Check for error messages"
echo "- Network Tab: Monitor API calls and redirects"
echo ""

echo "🐛 Common Issues and Solutions:"
echo "------------------------------"
echo "Issue: OAuth timeout"
echo "Solution: Check internet connection and Supabase status"
echo ""
echo "Issue: Profile creation failed"
echo "Solution: Verify database permissions and table structure"
echo ""
echo "Issue: Redirect loop"
echo "Solution: Clear browser cookies and local storage"
echo ""
echo "Issue: Modal not showing"
echo "Solution: Check browser console for JavaScript errors"
echo ""
echo "Issue: Session not persisting"
echo "Solution: Verify cookies are not blocked"
echo ""

echo "⚡ Recent Optimizations Applied:"
echo "-------------------------------"
echo "🚀 Removed setTimeout delays for instant redirects"
echo "⚡ Streamlined database queries with .single() method"
echo "🔄 Added custom event system for immediate session refresh"
echo "💨 Users no longer need to refresh page after OAuth"
echo "🎯 New users redirect directly to setup modal"
echo "🏃‍♂️ Existing users redirect immediately to AI chatbot"
echo "🔍 Enhanced error handling and retry logic"
echo "📊 Added comprehensive diagnostic tools"
echo ""

echo "📝 Test Results Log:"
echo "-------------------"
echo "After testing, document the following:"
echo "- ✅/❌ OAuth initiation works"
echo "- ✅/❌ Google consent screen appears"
echo "- ✅/❌ Callback handling works"
echo "- ✅/❌ New user profile creation"
echo "- ✅/❌ Consumer Setup Modal shows for new users"
echo "- ✅/❌ Existing user direct redirect"
echo "- ✅/❌ Session persistence"
echo "- ✅/❌ Error handling and retry logic"
echo ""

echo "🚀 Ready to start testing!"
echo "Run: npm run dev"
echo "Then open: http://localhost:3000/oauth-test"
