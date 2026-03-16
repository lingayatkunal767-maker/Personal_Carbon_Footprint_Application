import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';

<<<<<<< HEAD
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password.');
        }
=======
// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

console.log('🔐 Google Auth Configuration:');
console.log('   Client ID:', GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 30) + '...' : 'NOT SET');
console.log('   API URL:', API_BASE_URL);

const FACTS = [
  "Global ocean temperatures have risen by 0.13°F per decade since 1901.",
  "Home energy efficiency improvements can cut emissions by 25-30%.",
  "A single roundtrip transatlantic flight emits ~1.6 tons of CO₂ per passenger.",
  "Producing 1kg of beef generates 60kg of greenhouse gases (21x more than beans).",
  "Fashion industry accounts for 10% of global carbon emissions annually.",
  "One mature tree absorbs ~48 pounds of CO₂ per year.",
  "Recycling aluminum saves 95% of the energy needed to make new aluminum.",
  "Biking instead of driving for short trips can save 0.9kg CO₂ per mile."
];

const STATS = [
  { value: "4.7T", label: "Average CO₂ tons per person per year" },
  { value: "28%", label: "Of global emissions from transport" },
  { value: "1.5T", label: "CO₂ saved annually by going plant-based" },
  { value: "45%", label: "Emissions reduction needed by 2030" }
];

const FEATURES = [
  "Daily carbon footprint tracker",
  "Personalized reduction tips & goals",
  "Transport, diet & energy breakdowns",
  "Monthly progress reports & insights"
];

const LEAVES = [
  { size: 24, left: '12%', top: '15%', delay: 0 },
  { size: 32, left: '78%', top: '25%', delay: 3 },
  { size: 20, left: '25%', top: '65%', delay: 6 },
  { size: 28, left: '85%', top: '70%', delay: 9 },
  { size: 26, left: '45%', top: '35%', delay: 12 }
];

// ═══════════════════════════════════════════════════════════════════
// GOOGLE ICON COMPONENT
// ═══════════════════════════════════════════════════════════════════
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.737 7.396 3.977 10 3.977z" fill="#EA4335"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN LOGIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState('Continue with Google');
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimerRef = useRef(null);
  
  // Email/Password login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    console.log('📦 Loading Google Identity Services...');
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Identity Services loaded');
      
      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
        console.error('❌ Google Client ID not configured!');
        console.error('   Please add VITE_GOOGLE_CLIENT_ID to your .env file');
        showToast('⚠️ Google Sign-In not configured. Please check setup.');
        return;
      }
      
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          console.log('✅ Google One Tap initialized');
        } catch (error) {
          console.error('❌ Failed to initialize Google One Tap:', error);
          showToast('⚠️ Google authentication setup error');
        }
      } else {
        console.error('❌ Google Identity Services API not available');
      }
>>>>>>> f092aa54cae86847b29efb6ddd014aa7928cd220
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Identity Services script');
      showToast('⚠️ Failed to load Google Sign-In. Check your internet connection.');
    };
    
    document.body.appendChild(script);

<<<<<<< HEAD
    return (
        <div>
            <h2>Login to CarbonCalc</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
=======
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Rotating facts ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    console.log('📥 Received Google credential response');
    
    if (!response.credential) {
      console.error('❌ No credential in response');
      showToast('⚠️ Authentication failed: No credential received');
      return;
    }
    
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('✅ Decoded JWT payload:', {
        email: payload.email,
        name: payload.name,
        sub: payload.sub
      });
      
      const firstName = payload.given_name || 'there';
      const userEmail = payload.email;
      const fullName = payload.name || firstName;
      const profilePicture = payload.picture || null;

      console.log('📡 Sending to backend:', `${API_BASE_URL}/auth/google`);
      
      // Call backend — upserts user (creates if new, logs in if existing)
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: userEmail,
          googleId: payload.sub,
          profilePicture,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('✅ Backend response:', { success: data.success, message: data.message });

      if (!data.success) {
        showToast(`⚠️ ${data.message}`);
        return;
      }

      // Set current user session
      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture,
      };
      
      localStorage.setItem('current_user', JSON.stringify(userData));
      localStorage.setItem('auth_token', 'authenticated');
      
      console.log('✅ User session created:', userData);

      showToast(`Welcome back, ${firstName}! 🌿`);
      setTimeout(() => {
        console.log('➡️ Redirecting to /home');
        window.location.href = '/home';
      }, 1200);
    } catch (error) {
      console.error('❌ Authentication error:', error);
      showToast(`⚠️ Authentication failed: ${error.message}`);
    }
  };

  const showToast = (msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ msg, show: true });
    toastTimerRef.current = setTimeout(() => {
      setToast({ msg: '', show: false });
    }, 3000);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      showToast('⚠️ Please enter both email and password');
      return;
    }
    
    if (!email.includes('@')) {
      showToast('⚠️ Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      showToast('⚠️ Password must be at least 6 characters');
      return;
    }
    
    setEmailLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save session info
        localStorage.setItem('current_user', JSON.stringify({
          id: data.userId,
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture
        }));
        localStorage.setItem('auth_token', 'authenticated');
        setEmailLoading(false);
        showToast(`${data.message} 🌿`);
        setTimeout(() => { window.location.href = '/home'; }, 1200);
      } else {
        setEmailLoading(false);
        showToast(`⚠️ ${data.message}`);
      }
    } catch (err) {
      setEmailLoading(false);
      const msg = err instanceof TypeError
        ? '⚠️ Cannot reach backend (port 8081). Is Spring Boot running?'
        : `⚠️ Login error: ${err.message}`;
      showToast(msg);
      console.error('Login error:', err);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      showToast('⚠️ Google OAuth not configured. Check GOOGLE_AUTH_SETUP.md');
      console.error('Missing VITE_GOOGLE_CLIENT_ID in .env file');
      return;
    }

    if (!window.google) {
      console.error('❌ Google Identity Services library not loaded');
      showToast('⚠️ Google Sign-In loading failed. Please refresh the page.');
      return;
    }

    setLoading(true);
    setBtnLabel('Opening Google Sign-In…');

    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      console.log('🔍 Google OAuth Configuration:');
      console.log('   Redirect URI:', redirectUri);
      console.log('   Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
      console.log('   Origin:', window.location.origin);
      
      if (window.google.accounts && window.google.accounts.id) {
        // Try Google One Tap first
        window.google.accounts.id.prompt((notification) => {
          console.log('One Tap Notification:', notification);
          
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One Tap skipped, redirecting to OAuth flow...');
            // Fallback to OAuth redirect flow
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
              `client_id=${GOOGLE_CLIENT_ID}&` +
              `redirect_uri=${encodeURIComponent(redirectUri)}&` +
              `response_type=token&` +
              `scope=openid%20email%20profile&` +
              `prompt=select_account`;
            
            console.log('🔗 Redirecting to:', authUrl);
            window.location.href = authUrl;
          } else {
            // One Tap displayed successfully
            setLoading(false);
            setBtnLabel('Continue with Google');
          }
        });
        
        // Set timeout in case prompt doesn't respond
        setTimeout(() => {
          if (loading) {
            setLoading(false);
            setBtnLabel('Continue with Google');
          }
        }, 3000);
      } else {
        console.error('Google accounts.id not available');
        throw new Error('Google Identity Services not initialized');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoading(false);
      setBtnLabel('Continue with Google');
      showToast('❌ Login failed. Please try again.');
    }
  };

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════════════════════════ */
        /* GOOGLE FONTS IMPORT */
        /* ═══════════════════════════════════════════════════════════════ */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        /* ═══════════════════════════════════════════════════════════════ */
        /* CSS VARIABLES */
        /* ═══════════════════════════════════════════════════════════════ */
        :root {
          --forest: #1a3d2b;
          --moss: #2e5e42;
          --sage: #5a8a6a;
          --fern: #89bb97;
          --mist: #c8dece;
          --cream: #f6f1e9;
          --warm-off: #faf7f2;
          --charcoal: #1c1e1a;
          --text-med: #4a5244;
          --text-lt: #7a8a74;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* GLOBAL RESET */
        /* ═══════════════════════════════════════════════════════════════ */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* Grain texture overlay */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.03;
          pointer-events: none;
          z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* KEYFRAME ANIMATIONS */
        /* ═══════════════════════════════════════════════════════════════ */
        @keyframes meshShift {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50% { transform: translate(3%, 4%) scale(1.05); }
        }

        @keyframes floatLeaf {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes cardEntrance {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes factFade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes toastSlide {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* LAYOUT CONTAINER */
        /* ═══════════════════════════════════════════════════════════════ */
        .login-container {
          display: flex;
          min-height: 100svh;
          width: 100%;
          align-items: stretch;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* LEFT PANEL - HIDDEN */
        /* ═══════════════════════════════════════════════════════════════ */
        .left-panel {
          display: none;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* RIGHT PANEL - FULL WIDTH */
        /* ═══════════════════════════════════════════════════════════════ */
        .right-panel {
          background: var(--warm-off);
          padding: clamp(0.7rem, 1.2vw, 1.1rem) clamp(0.8rem, 1.2vw, 1rem) clamp(0.7rem, 1.2vw, 1rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          flex: 1;
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
          gap: 0.55rem;
        }

        .top-link {
          position: absolute;
          top: 0.75rem;
          right: 1rem;
          font-size: 0.76rem;
          color: var(--text-med);
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 400;
        }

        .top-link:hover {
          color: var(--sage);
        }

        /* Dark green card container */
        .dark-green-card {
          background: linear-gradient(135deg, var(--forest) 0%, var(--moss) 100%);
          border-radius: 16px;
          padding: clamp(0.85rem, 1.1vw, 1.05rem) clamp(0.8rem, 1vw, 0.95rem);
          box-shadow: 0 20px 60px rgba(26, 61, 43, 0.3);
          max-width: 390px;
          width: 100%;
          animation: cardEntrance 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          position: relative;
          overflow: hidden;
        }

        .card-background-image {
          position: absolute;
          top: 0;
          right: 0;
          width: 280px;
          height: 280px;
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
          transform: translate(25%, -25%) rotate(15deg);
          filter: blur(1px) brightness(1.2);
          animation: floatImage 20s ease-in-out infinite;
        }

        @keyframes floatImage {
          0%, 100% {
            transform: translate(25%, -25%) rotate(15deg) scale(1);
          }
          50% {
            transform: translate(30%, -20%) rotate(18deg) scale(1.05);
          }
        }

        /* Login card */
        .login-card {
          width: 100%;
          text-align: left;
        }

        .card-label {
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 1.6px;
          color: var(--mist);
          font-weight: 500;
          margin-bottom: 0.45rem;
          text-align: left;
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.58rem;
          line-height: 1.15;
          color: var(--cream);
          font-weight: 700;
          margin-bottom: 0.55rem;
          text-align: left;
        }

        .card-subtitle {
          font-size: 0.78rem;
          color: var(--mist);
          font-weight: 300;
          line-height: 1.33;
          margin-bottom: 0.95rem;
          text-align: left;
        }

        /* Form inputs */
        .login-form {
          margin-bottom: 0.7rem;
        }

        .input-group {
          margin-bottom: 0.58rem;
        }

        .input-label {
          display: block;
          font-size: 0.74rem;
          font-weight: 500;
          color: var(--mist);
          margin-bottom: 0.25rem;
          text-align: left;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 0.58rem 0.72rem;
          border: 1.5px solid rgba(200, 222, 206, 0.3);
          border-radius: 8px;
          font-size: 0.82rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--charcoal);
          background: rgba(255, 255, 255, 0.95);
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--fern);
          box-shadow: 0 0 0 3px rgba(137, 187, 151, 0.2);
          background: white;
        }

        .input-field::placeholder {
          color: var(--text-lt);
        }

        .password-toggle {
          position: absolute;
          right: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.6;
          transition: opacity 0.3s ease;
          padding: 0.15rem;
        }

        .password-toggle:hover {
          opacity: 1;
        }

        /* Email login button */
        .email-btn {
          width: 100%;
          background: var(--forest);
          border: none;
          border-radius: 10px;
          padding: 0.6rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-size: 0.83rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }

        .email-btn:hover:not(:disabled) {
          background: var(--moss);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(26, 61, 43, 0.25);
        }

        .email-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .email-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .email-btn.loading .btn-content {
          opacity: 0.5;
        }

        .email-btn .spinner {
          border-color: white;
          border-top-color: transparent;
        }

        /* Google button */
        .google-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid rgba(200, 222, 206, 0.3);
          border-radius: 10px;
          padding: 0.6rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-size: 0.83rem;
          font-weight: 500;
          color: var(--charcoal);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
        }

        .google-btn:hover:not(:disabled) {
          border-color: var(--fern);
          background: white;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(137, 187, 151, 0.3);
        }

        .google-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .google-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: opacity 0.3s ease;
        }

        .google-btn.loading .btn-content {
          opacity: 0.5;
        }

        .spinner {
          width: 15px;
          height: 15px;
          border: 2px solid var(--sage);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: absolute;
          left: 0.85rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .google-btn.loading .spinner {
          opacity: 1;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin: 0.75rem 0;
          font-size: 0.72rem;
          color: var(--mist);
          font-weight: 500;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(200, 222, 206, 0.3);
        }

        /* Sign up link */
        .signup-link {
          text-align: center;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(200, 222, 206, 0.3);
          font-size: 0.8rem;
          color: white;
        }

        .signup-link a {
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .signup-link a:hover {
          color: var(--mist);
          text-decoration: underline;
        }

        /* Trust badges */
        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          justify-content: center;
          margin: 0;
          padding: 0;
          position: absolute;
          bottom: 3.1rem;
          left: 0;
          right: 0;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: var(--sage);
        }

        .badge-icon {
          font-size: 0.85rem;
        }

        /* Features preview */
        .features-box {
          background: linear-gradient(135deg, rgba(200, 222, 206, 0.2) 0%, rgba(137, 187, 151, 0.15) 100%);
          border: 1px solid rgba(90, 138, 106, 0.2);
          border-radius: 14px;
          padding: 1.75rem;
        }

        .features-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--sage);
          font-weight: 500;
          margin-bottom: 1rem;
          text-align: left;
        }

        .features-list {
          list-style: none;
        }

        .features-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-med);
          margin-bottom: 0.85rem;
          line-height: 1.6;
          text-align: left;
        }

        .features-list li:last-child {
          margin-bottom: 0;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          background: var(--sage);
          border-radius: 50%;
          margin-top: 0.5rem;
          flex-shrink: 0;
        }

        /* Footer */
        .footer {
          position: absolute;
          bottom: 0.4rem;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.68rem;
          color: var(--text-lt);
          padding: 0 1rem;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: center;
          margin-bottom: 0.3rem;
        }

        .footer-links a {
          color: var(--text-lt);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: var(--sage);
        }

        .copyright {
          font-size: 0.64rem;
        }

        @media (max-height: 1000px) and (min-width: 861px) {
          .right-panel {
            padding: 0.7rem 0.8rem 0.9rem;
          }

          .dark-green-card {
            max-width: 370px;
            padding: 0.78rem 0.75rem;
          }

          .card-title {
            font-size: 1.45rem;
          }

          .trust-badges,
          .footer {
            display: none;
          }
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* TOAST NOTIFICATION */
        /* ═══════════════════════════════════════════════════════════════ */
        .toast {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--forest);
          color: var(--cream);
          padding: 1rem 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          font-size: 0.95rem;
          font-weight: 500;
          z-index: 10000;
          animation: toastSlide 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          white-space: nowrap;
        }

        .toast.hidden {
          display: none;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* RESPONSIVE DESIGN */
        /* ═══════════════════════════════════════════════════════════════ */
        @media (max-height: 760px) {
          .right-panel {
            justify-content: flex-start;
          }

          .trust-badges {
            margin: 1.25rem 0 1.5rem;
          }

          .footer {
            position: relative;
            bottom: auto;
            margin-top: 2rem;
          }
        }

        @media (max-width: 860px) {
          .right-panel {
            padding: 3rem 1.5rem 2.5rem;
          }

          .top-link {
            top: 1.25rem;
            right: 1.5rem;
            font-size: 0.85rem;
          }

          .trust-badges {
            position: relative;
            bottom: auto;
            margin: 1rem 0 1.25rem;
          }

          .top-link {
            top: 1.25rem;
            right: 1.5rem;
            font-size: 0.85rem;
          }

          .login-card {
            max-width: 100%;
          }

          .card-title {
            font-size: 2rem;
          }

          .footer {
            position: relative;
            bottom: auto;
            margin-top: 3rem;
            padding: 0 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .right-panel {
            padding: 2.5rem 1.25rem 2rem;
          }

          .login-card {
            max-width: 100%;
          }

          .card-title {
            font-size: 1.75rem;
          }

          .top-link {
            position: relative;
            top: auto;
            right: auto;
            text-align: center;
            margin-bottom: 1.5rem;
            display: block;
          }

          .trust-badges {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RIGHT PANEL */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="right-panel">
          <a href="#learn" className="top-link">
            New to sustainability? Learn more →
          </a>

          <div className="dark-green-card">
            {/* Decorative background image */}
            <img 
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80" 
              alt="" 
              className="card-background-image"
              loading="lazy"
            />
            
            {/* Logo/Brand at top */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
            }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                background: 'linear-gradient(135deg, #89bb97 0%, #c8dece 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(200, 222, 206, 0.2)'
              }}>
                🌿
              </div>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ 
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.12rem',
                  fontWeight: '700',
                  color: 'var(--cream)',
                  margin: '0',
                  lineHeight: '1.1'
                }}>
                  Personal Carbon Footprint
                </h1>
                <div style={{
                  fontSize: '0.56rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1.1px',
                  color: 'var(--mist)',
                  marginTop: '2px',
                  fontWeight: '500'
                }}>
                  Track · Reduce · Sustain
                </div>
              </div>
            </div>

            <div className="login-card">
            <div className="card-label">WELCOME BACK</div>
            <h2 className="card-title">
              Login to your
              <br />
              footprint dashboard
            </h2>
            <p className="card-subtitle">
              Access your personalized carbon tracking dashboard and continue your journey toward a sustainable lifestyle.
            </p>

            {/* Email/Password login form */}
            <form className="login-form" onSubmit={handleEmailLogin}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailLoading}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={emailLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={emailLoading}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Email login button */}
              <button
                type="submit"
                className={`email-btn ${emailLoading ? 'loading' : ''}`}
                disabled={emailLoading}
              >
                <div className="spinner"></div>
                <div className="btn-content">
                  <span>{emailLoading ? 'Logging in…' : 'Login'}</span>
                </div>
              </button>
>>>>>>> f092aa54cae86847b29efb6ddd014aa7928cd220
            </form>
            <p>No account? <Link to="/register">Sign Up</Link></p>
        </div>
    );
};

export default LoginPage;
