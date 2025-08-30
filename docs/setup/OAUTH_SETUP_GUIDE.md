# 🔐 OAuth Setup Guide for UrjaBandhu

## Current Status ✅
- ✅ **Frontend Code**: OAuth implementation complete
- ✅ **Callback Route**: `/auth/callback` created
- ✅ **Environment Variables**: Configured
- ⚠️ **Supabase Configuration**: Needs manual setup (see below)

## 🚀 Quick Test
Your app is running at: **http://localhost:3001**
- Visit: http://localhost:3001/auth
- Click "Continue with Google" to test

## 📋 Supabase Dashboard Configuration

### Step 1: Enable Google Provider
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ygjdvufbiobntseveoia`
3. Navigate to: **Authentication** → **Settings** → **Auth Providers**
4. Find **Google** and toggle it **ON**

### Step 2: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** (or Google Identity)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add these **Authorized JavaScript origins**:
   ```
   http://localhost:3001
   https://ygjdvufbiobntseveoia.supabase.co
   ```
7. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3001/auth/callback
   https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback
   ```

### Step 3: Configure Supabase
1. Copy **Client ID** and **Client Secret** from Google Console
2. In Supabase Dashboard → Authentication → Settings → Auth Providers → Google:
   - **Enabled**: ✅ ON
   - **Client ID**: [Paste from Google Console]
   - **Client Secret**: [Paste from Google Console]
   - **Redirect URL**: `https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback`

### Step 4: Test OAuth Flow
1. Visit: http://localhost:3001/auth
2. Click **"Continue with Google"**
3. Should redirect to Google OAuth consent screen
4. After approval, should redirect back to your app dashboard

## 🐛 Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**
   - Check Google Console redirect URIs match exactly
   - Ensure no trailing slashes

2. **"Invalid OAuth provider"**
   - Verify Google provider is enabled in Supabase
   - Check Client ID/Secret are correct

3. **"CORS Error"**
   - Verify JavaScript origins in Google Console
   - Check Supabase URL is correct

4. **OAuth works but user not created**
   - Check if profiles table exists
   - Verify RLS policies allow INSERT

### Debug Steps:
1. Open Browser DevTools → Console
2. Click Google OAuth button
3. Check for error messages
4. Verify network requests in Network tab

## 📱 What Happens When OAuth Works:
1. User clicks "Continue with Google"
2. Redirects to Google OAuth consent screen
3. User approves permissions
4. Google redirects to: `https://ygjdvufbiobntseveoia.supabase.co/auth/v1/callback`
5. Supabase processes the callback
6. Supabase redirects to: `http://localhost:3001/auth/callback`
7. Our callback page processes the session
8. User is redirected to dashboard: `http://localhost:3001/dashboard`

## 🔍 Current Configuration:
- **Supabase URL**: `https://ygjdvufbiobntseveoia.supabase.co`
- **Local App**: `http://localhost:3001`
- **Auth Callback**: `http://localhost:3001/auth/callback`
- **OAuth Provider**: Google
- **Redirect Flow**: Google → Supabase → Your App → Dashboard

## ✅ Verification Checklist:
- [ ] Google Cloud Console project created
- [ ] Google+ API enabled
- [ ] OAuth Client ID/Secret generated
- [ ] JavaScript origins configured
- [ ] Redirect URIs configured
- [ ] Supabase Google provider enabled
- [ ] Client ID/Secret added to Supabase
- [ ] Test OAuth flow successfully

---

**Need help?** The auth implementation is complete on the frontend. The only remaining step is configuring the Google OAuth credentials in both Google Cloud Console and your Supabase dashboard.
