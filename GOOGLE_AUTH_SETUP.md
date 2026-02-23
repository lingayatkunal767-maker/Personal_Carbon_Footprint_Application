# 🔐 Google OAuth Setup Guide

## ⚠️ IMPORTANT: Configure Google Cloud Console

Your app is configured with Google Client ID but you need to set up the redirect URIs in Google Cloud Console.

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### Step 2: Select Your OAuth 2.0 Client ID
Click on the client ID: `245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com`

### Step 3: Add Authorized JavaScript Origins
Add these URLs (EXACTLY as shown):
```
http://localhost:5173
http://127.0.0.1:5173
```

### Step 4: Add Authorized Redirect URIs
Add these URLs (EXACTLY as shown):
```
http://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
```

### Step 5: Save Changes
Click **SAVE** in Google Cloud Console

### Step 6: Test the Application
1. Run: `npm run dev`
2. Navigate to: http://localhost:5173/login
3. Click "Continue with Google"
4. Sign in with your Google account

---

## 🔧 Common Issues & Solutions

### Issue: "redirect_uri_mismatch" error
**Solution:** Make sure the redirect URIs in Google Cloud Console EXACTLY match:
- `http://localhost:5173/auth/callback`

### Issue: "popup blocked" or "Origin not allowed"
**Solution:** Add `http://localhost:5173` to Authorized JavaScript origins

### Issue: "invalid_client" error
**Solution:** Check that your Client ID in `.env` matches the one in Google Cloud Console

---

## ✅ Verification Checklist

- [ ] Google Cloud Console updated with redirect URIs
- [ ] Authorized origins include `http://localhost:5173`
- [ ] `.env` file has correct `VITE_GOOGLE_CLIENT_ID`
- [ ] App is running on port 5173 (check terminal output)
- [ ] Browser allows popups from localhost
- [ ] Using latest Chrome/Firefox/Edge browser

---

## 📝 Current Configuration

**App Port:** 5173 (configured in vite.config.js)
**Redirect URI:** http://localhost:5173/auth/callback
**Client ID:** 245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com

---

## 🆘 Still Having Issues?

1. Clear browser cache and cookies for localhost
2. Try in an incognito/private window
3. Check browser console for errors (F12 → Console)
4. Verify you're using the correct Google account
5. Make sure OAuth consent screen is configured in Google Cloud Console
