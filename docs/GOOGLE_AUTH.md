# 🔐 Google OAuth 2.0 Setup & Troubleshooting

## Initial Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### 2. Create OAuth Credentials
1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Configure OAuth consent screen (if prompted)
4. Application type: **Web application**

### 3. Configure Authorized Origins & Redirects

**⚠️ IMPORTANT**: Your app runs on port **5173** (not 3000)

#### Authorized JavaScript origins
Add these **EXACT** URLs:
```
http://localhost:5173
http://127.0.0.1:5173
```

#### Authorized redirect URIs
Add these **EXACT** URLs:
```
http://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
```

### 4. Save Client ID
1. Click **Create**
2. Copy your **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
3. Add to `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

---

## Common Issues & Solutions

### ❌ Error: "origin_mismatch"
**Cause**: Your app's URL doesn't match Google Cloud Console settings

**Solution**:
1. Verify URLs in Google Cloud Console:
   - Must be **exact**: `http://localhost:5173` (no trailing slash)
   - Use `http://` not `https://`
   - Include port `:5173`
2. Wait 1-2 minutes after saving changes
3. Clear browser cache or use incognito mode

### ❌ Error: "redirect_uri_mismatch"
**Cause**: Callback URL doesn't match configured redirect URI

**Solution**:
1. Check redirect URI in Google Cloud Console:
   - Must be: `http://localhost:5173/auth/callback`
2. Verify your app redirects to the same URL
3. Clear browser cache

### ❌ Error: "popup_blocked"
**Cause**: Browser blocking Google Sign-In popup

**Solution**:
1. Allow popups for `localhost` in browser settings
2. Or use redirect flow instead of popup

### ❌ Error: "invalid_client"
**Cause**: Client ID mismatch or invalid

**Solution**:
1. Double-check Client ID in `.env` matches Google Cloud Console
2. Ensure no extra spaces or quotes
3. Restart development server after changing `.env`

---

## Testing Checklist

- [ ] PostgreSQL database running
- [ ] Backend running on port 8081
- [ ] Frontend running on port 5173
- [ ] Google OAuth credentials configured
- [ ] `.env` file has correct Client ID
- [ ] Browser allows popups from localhost
- [ ] Using latest Chrome/Firefox/Edge

---

## Verification Steps

### 1. Check Configuration
```bash
# Frontend should output:
npm run dev
# Look for: "Local: http://localhost:5173"

# Backend should output:
cd backend && mvn spring-boot:run
# Look for: "Tomcat started on port(s): 8081"
```

### 2. Test Google Sign-In
1. Open http://localhost:5173/login
2. Open browser console (F12)
3. Click "Continue with Google"
4. Check console for these logs:
   ```
   📦 Loading Google Identity Services...
   ✅ Google Identity Services loaded
   ✅ Google One Tap initialized
   ```

### 3. Successful Login Flow
1. Google sign-in popup appears
2. Select your Google account
3. App redirects to `/auth/callback`
4. Then redirects to dashboard at `/`
5. You should see your profile info

---

## Debug Tips

### Enable Verbose Logging
The `LoginPage.jsx` already has console logging. Check browser console for:
- `🔐 Google Auth Configuration:` - Shows Client ID
- `📦 Loading Google Identity Services...` - Script loading
- `✅ Google One Tap initialized` - Successful init
- `📥 Received Google credential response` - Login attempt
- `✅ Backend response:` - API response

### Common Mistakes
- ❌ Using `https://` instead of `http://` for localhost
- ❌ Adding trailing slash: `http://localhost:5173/`
- ❌ Wrong port (3000 instead of 5173)
- ❌ Not saving changes in Google Cloud Console
- ❌ Not restarting dev server after `.env` changes

---

## Current Configuration

**Client ID**: `245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com`  
**Frontend Port**: `5173`  
**Backend Port**: `8081`  
**Callback URL**: `http://localhost:5173/auth/callback`

---

## Need More Help?

1. Check browser console for errors (F12 → Console tab)
2. Check network tab for failed requests (F12 → Network tab)
3. Verify backend is receiving requests in terminal output
4. Try in incognito/private window to rule out cache issues
