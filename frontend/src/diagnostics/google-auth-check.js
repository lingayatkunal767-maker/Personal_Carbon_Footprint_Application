// 🔧 Google Auth Troubleshooting Script
// Run this in your browser console (F12) to diagnose Google Auth issues

console.log('🔍 Google Auth Diagnostic Tool');
console.log('================================\n');

// 1. Check environment variables
console.log('1️⃣ Environment Configuration:');
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (clientId) {
  console.log('   ✅ VITE_GOOGLE_CLIENT_ID is set');
  console.log('   Client ID:', clientId.substring(0, 20) + '...');
} else {
  console.error('   ❌ VITE_GOOGLE_CLIENT_ID is NOT set');
  console.log('   → Check your .env file');
}
console.log('');

// 2. Check current URL and port
console.log('2️⃣ Application URL:');
console.log('   Current Origin:', window.location.origin);
console.log('   Expected Redirect URI:', `${window.location.origin}/auth/callback`);
console.log('   Port:', window.location.port || '(default)');
console.log('');

// 3. Check Google library
console.log('3️⃣ Google Identity Services:');
if (typeof google !== 'undefined') {
  console.log('   ✅ Google library loaded');
  if (google.accounts && google.accounts.id) {
    console.log('   ✅ Google Accounts ID API available');
  } else {
    console.error('   ❌ Google Accounts ID API not available');
  }
} else {
  console.error('   ❌ Google library NOT loaded');
  console.log('   → Check if the script tag is loading correctly');
  console.log('   → Look for network errors in the Network tab');
}
console.log('');

// 4. Check localStorage
console.log('4️⃣ Local Storage:');
const authToken = localStorage.getItem('auth_token');
const currentUser = localStorage.getItem('current_user');
const registeredUsers = localStorage.getItem('registered_users');

if (authToken) {
  console.log('   ✅ Auth token exists');
} else {
  console.log('   ℹ️ No auth token (not logged in)');
}

if (currentUser) {
  console.log('   ✅ Current user:', JSON.parse(currentUser).email);
} else {
  console.log('   ℹ️ No current user (not logged in)');
}

if (registeredUsers) {
  const users = JSON.parse(registeredUsers);
  console.log(`   ✅ ${users.length} registered user(s)`);
} else {
  console.log('   ℹ️ No registered users');
}
console.log('');

// 5. Required Google Cloud Console Configuration
console.log('5️⃣ Required Google Cloud Console Settings:');
console.log('   Authorized JavaScript origins:');
console.log('   → http://localhost:5173');
console.log('   → http://127.0.0.1:5173');
console.log('');
console.log('   Authorized redirect URIs:');
console.log('   → http://localhost:5173/auth/callback');
console.log('   → http://127.0.0.1:5173/auth/callback');
console.log('');

// 6. Common fixes
console.log('6️⃣ Quick Fixes:');
console.log('   • Clear browser cache and cookies');
console.log('   • Try incognito/private window');
console.log('   • Check browser console for errors');
console.log('   • Verify Google Cloud Console settings');
console.log('   • Make sure app is running on port 5173');
console.log('');

console.log('📚 For detailed setup instructions, see GOOGLE_AUTH_SETUP.md');
console.log('================================\n');

export {};
