# ✅ Google Auth - Fixed Issues & Testing Guide

## 🔧 Issues Fixed

### 1. **Port Mismatch** ✅
- **Problem:** Code referenced port 3000, but Vite runs on port 5173
- **Fixed:** Updated all references to use port 5173
- **Files changed:** README.md, improved error messages

### 2. **Missing Error Handling** ✅
- **Problem:** Poor error messages when Google Auth failed
- **Fixed:** Added detailed logging and user-friendly error messages
- **Files changed:** LoginPage.jsx, SignUpPage.jsx, AuthCallback.jsx

### 3. **Unclear Configuration Instructions** ✅
- **Problem:** No clear guide for Google Cloud Console setup
- **Fixed:** Created GOOGLE_AUTH_SETUP.md with step-by-step instructions
- **Files added:** GOOGLE_AUTH_SETUP.md

### 4. **No Diagnostic Tools** ✅
- **Problem:** Hard to troubleshoot Google Auth issues
- **Fixed:** Created diagnostic script
- **Files added:** src/diagnostics/google-auth-check.js

## 🚀 How to Test Google Auth

### Step 1: Configure Google Cloud Console

**⚠️ CRITICAL:** You must add these exact URLs to Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Under "Authorized JavaScript origins" add:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
4. Under "Authorized redirect URIs" add:
   - `http://localhost:5173/auth/callback`
   - `http://127.0.0.1:5173/auth/callback`
5. Click **SAVE**

### Step 2: Start the Application

```bash
npm run dev
```

The app should start on **http://localhost:5173**

### Step 3: Test Login with Google

1. Open browser to: http://localhost:5173/login
2. Open browser console (F12)
3. Click "Continue with Google" button
4. Watch the console for diagnostic messages:
   - ✅ "Google OAuth Configuration:" - Shows redirect URI and Client ID5. You should see one of:
   - **One Tap popup** - Select your Google account
   - **OR redirect to Google** - Sign in and it redirects back

### Step 4: Verify Success

After signing in, you should:
1. See a success toast: "Welcome back, [Name]! 🌿"
2. Be redirected to /home
3. See console message: "✅ Authentication successful"

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** Redirect URI not configured in Google Cloud Console

**Fix:**
1. Check console for logged redirect URI
2. Copy exact URL (including http://)
3. Add to Google Cloud Console Authorized redirect URIs
4. Click SAVE
5. Wait 1 minute for changes to propagate
6. Try again

### Error: "Origin not allowed"

**Cause:** JavaScript origin not configured

**Fix:**
1. Add `http://localhost:5173` to Authorized JavaScript origins
2. Click SAVE
3. Clear browser cache
4. Try again

### Error: "Google Sign-In loading failed"

**Cause:** Google Identity Services script not loaded

**Fix:**
1. Check browser console for network errors
2. Try refreshing the page (F5)
3. Check if you have ad blockers blocking Google scripts
4. Try in incognito/private window

### Popup is blocked

**Cause:** Browser popup blocker

**Fix:**
1. Allow popups for localhost
2. OR the code will automatically redirect to Google (fallback)

### Still not working?

1. **Clear everything:**
   ```javascript
   localStorage.clear();
   ```
   Then refresh page (F5)

2. **Check console logs:**
   - Look for "🔍 Google OAuth Configuration:"
   - Check if redirect URI matches Google Cloud Console

3. **Try incognito/private window**
   - This rules out browser extension issues

4. **Verify .env file:**
   ```bash
   cat .env
   ```
   Make sure VITE_GOOGLE_CLIENT_ID is set

## 📊 Expected Console Output

When clicking "Continue with Google", you should see:

```
🔍 Google OAuth Configuration:
   Redirect URI: http://localhost:5173/auth/callback
   Client ID: 245883591621-7shq6...
   Origin: http://localhost:5173
One Tap Notification: [object]
```

Then either:
- One Tap shows and you select account
- OR: "One Tap skipped, redirecting to OAuth flow..."
- Followed by: "🔗 Redirecting to: https://accounts.google.com/..."

After callback:
```
🔐 Auth Callback - Processing authentication...
   Current URL: http://localhost:5173/auth/callback#access_token=...
   Hash: #access_token=...
✅ Access token found
📡 Fetching user info from Google...
✅ User info received: your.email@gmail.com
✅ Authentication successful, redirecting to home...
```

## 📝 Testing Checklist

- [ ] Google Cloud Console updated with redirect URIs
- [ ] App starts on port 5173
- [ ] Browser allows popups from localhost
- [ ] Clicked "Continue with Google"
- [ ] One Tap shows OR redirects to Google
- [ ] Successfully signs in
- [ ] Redirects to /home
- [ ] User data stored in localStorage
- [ ] Can navigate app while logged in
- [ ] Can log out and log in again

## 💡 Tips

1. **First time?** Try Sign Up first, then Login
2. **Use the same Google account** for testing
3. **Check browser console** - all steps are logged
4. **Wait 1-2 minutes** after changing Google Cloud Console settings
5. **Clear cache** if you keep seeing old errors

## 🆘 Need More Help?

See the detailed setup guide: [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
