# 🚨 Production Authentication Fix Guide

## Issue Description
- Users can sign in with Google OAuth
- Entry is registered in Supabase auth.users table
- But user authentication state is not properly established
- Redirection fails or loops back to auth page

## Root Causes Identified

### 1. Environment Variables
**Problem**: Production environment variables not properly set
**Solution**: Ensure these are configured in your hosting platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ygjdvufbiobntseveoia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://urjabandhu.vercel.app
NODE_ENV=production
```

### 2. OAuth Redirect Configuration
**Problem**: Production URLs not configured in Google OAuth Console
**Solution**: Update Google Cloud Console OAuth settings:

**Authorized JavaScript Origins:**
- `https://urjabandhu.vercel.app`
- `https://ygjdvufbiobntseveoia.supabase.co`

**Authorized Redirect URIs:**
- `https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback`

### 3. Session Exchange Timeout
**Problem**: Production networks have higher latency
**Solution**: Implemented retry logic and increased timeouts:
- Exchange timeout: 10 seconds (vs 5 seconds in dev)
- Retry attempts: 3 times in production
- Progressive delay between retries

### 4. Database Connection Issues
**Problem**: RLS policies or connection timeouts in production
**Solution**: Enhanced error handling and fallback mechanisms:
- Longer database query timeouts
- Graceful degradation for new vs existing users
- Production-specific user setup flow

## Files Modified

### 1. `/app/auth/callback/page.tsx`
- ✅ Added production environment detection
- ✅ Implemented retry logic for session exchange
- ✅ Increased timeouts for production networks
- ✅ Enhanced error handling and fallback mechanisms
- ✅ Production-aware database query timeouts

### 2. `/components/auth/AuthProvider.tsx`
- ✅ Environment-aware OAuth redirect URLs
- ✅ Production-specific OAuth parameters
- ✅ Enhanced logging for debugging

### 3. `/lib/supabase.ts`
- ✅ Production-optimized Supabase client configuration
- ✅ Custom fetch with longer timeouts
- ✅ Enhanced auth settings for production

### 4. Environment Configuration
- ✅ Created `.env.production` template
- ✅ Documented required environment variables

## Deployment Checklist

### ✅ Code Changes
- [x] Production-aware authentication flow
- [x] Retry logic for session exchange
- [x] Enhanced error handling
- [x] Extended timeouts for production

### ⚠️ Configuration Required
- [ ] Set environment variables in hosting platform
- [ ] Update Google OAuth Console redirect URLs
- [ ] Verify Supabase RLS policies
- [ ] Test OAuth flow in production

### 🔧 Production URLs to Configure

**In Google Cloud Console:**
```
Authorized JavaScript origins:
- https://urjabandhu.vercel.app

Authorized redirect URIs:
- https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback
```

**In Supabase Dashboard:**
```
Site URL: https://urjabandhu.vercel.app
Redirect URLs: https://urjabandhu.vercel.app/auth/callback
```

## Testing Instructions

1. **Deploy the updated code** to production
2. **Set environment variables** in your hosting platform
3. **Update OAuth settings** in Google Console
4. **Test the flow**: Visit production site → Click "Sign in with Google"
5. **Monitor logs** for any remaining issues

## Debug Commands

### Check Environment Variables
```bash
# In production console/logs
console.log('Environment check:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  nodeEnv: process.env.NODE_ENV
})
```

### Verify Session
```bash
# In browser console after OAuth
supabase.auth.getSession().then(console.log)
```

## Expected Flow After Fix

1. User clicks "Sign in with Google" on production site
2. Redirects to Google OAuth (with correct origins)
3. Google redirects to Supabase callback
4. Supabase processes OAuth and redirects to production callback
5. Production callback page exchanges code for session (with retries)
6. Session is established and user is redirected to dashboard
7. Future visits maintain authentication state

## Monitoring

Watch for these console logs in production:
- `Environment detected: Production`
- `OAuth initiated successfully`
- `Authentication successful for: user@email.com`
- `Existing user - redirecting to chatbot`

If you see retry attempts or timeouts, the network conditions may need further adjustment.
