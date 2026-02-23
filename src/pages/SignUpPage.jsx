import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com";

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
// MAIN SIGN UP PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SignUpPage() {
  const navigate = useNavigate();
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [btnLabel, setBtnLabel] = useState('Sign up with Google');
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimerRef = useRef(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE") {
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });
      }
    };

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

  const handleCredentialResponse = (response) => {
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const firstName = payload.given_name || 'there';
      const userEmail = payload.email;
      const fullName = payload.name || firstName;
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userExists = existingUsers.some(user => user.email.toLowerCase() === userEmail.toLowerCase());
      
      if (!userExists) {
        // Store new Google user
        const newUser = {
          name: fullName,
          email: userEmail.toLowerCase(),
          provider: 'google',
          createdAt: new Date().toISOString()
        };
        existingUsers.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(existingUsers));
      }
      
      // Set current user session
      localStorage.setItem('current_user', JSON.stringify({ name: fullName, email: userEmail.toLowerCase() }));
      localStorage.setItem('auth_token', 'authenticated');
      
      showToast(`✅ Welcome, ${firstName}! Your account has been created successfully.`);
      
      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } catch (error) {
      console.error('Authentication error:', error);
      showToast('❌ Sign up failed. Please try again.');
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

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }
    
    if (!email.includes('@')) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      showToast('⚠️ Password must be at least 6 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      showToast('⚠️ Passwords do not match. Please try again.');
      return;
    }
    
    setEmailLoading(true);
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userExists = existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (userExists) {
      setEmailLoading(false);
      showToast('⚠️ An account with this email already exists. Please login instead.');
      return;
    }
    
    // Store new user data
    setTimeout(() => {
      const newUser = {
        name: name,
        email: email.toLowerCase(),
        password: password, // In production, hash the password before storing!
        createdAt: new Date().toISOString()
      };
      
      existingUsers.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(existingUsers));
      
      // Set current user session
      localStorage.setItem('current_user', JSON.stringify({ name: name, email: email.toLowerCase() }));
      localStorage.setItem('auth_token', 'authenticated');
      
      setEmailLoading(false);
      showToast(`✅ Welcome, ${name}! Your account has been created successfully.`);
      
      setTimeout(() => {
        navigate('/home');
      }, 1200);
    }, 800);
  };

  const handleGoogleSignUp = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      showToast('⚠️ Google sign-up is not configured yet.');
      return;
    }

    setLoading(true);
    setBtnLabel('Signing you up…');

    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      console.log('🔍 Redirect URI:', redirectUri);
      
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
              `client_id=${GOOGLE_CLIENT_ID}&` +
              `redirect_uri=${encodeURIComponent(redirectUri)}&` +
              `response_type=token&` +
              `scope=openid%20email%20profile`;
            window.location.href = authUrl;
          } else {
            setLoading(false);
            setBtnLabel('Sign up with Google');
          }
        });
      } else {
        setLoading(false);
        setBtnLabel('Sign up with Google');
        showToast('⚠️ Google Sign-In not ready. Please refresh.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setLoading(false);
      setBtnLabel('Sign up with Google');
      showToast('❌ Sign up failed. Please try again.');
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
        /* LAYOUT */
        /* ═══════════════════════════════════════════════════════════════ */
        .signup-container {
          display: flex;
          min-height: 100vh;
        }

        .left-panel {
          display: none;
        }

        .right-panel {
          background: var(--warm-off);
          padding: 4rem 2rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          flex: 1;
          width: 100%;
          min-height: 100vh;
        }

        .top-link {
          position: absolute;
          top: 1.5rem;
          right: 2rem;
          font-size: 0.88rem;
          color: var(--text-med);
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 400;
        }

        .top-link:hover {
          color: var(--sage);
        }

        /* Gradient background animation */
        .left-panel::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(137, 187, 151, 0.15) 0%, transparent 70%);
          animation: meshShift 20s infinite ease-in-out;
        }

        /* Floating leaves */
        .floating-leaf {
          position: absolute;
          font-size: var(--leaf-size);
          animation: floatLeaf 8s infinite ease-in-out;
          animation-delay: var(--leaf-delay);
          opacity: 0.25;
          pointer-events: none;
          filter: blur(0.5px);
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* LEFT PANEL CONTENT */
        /* ═══════════════════════════════════════════════════════════════ */
        .left-content {
          max-width: 480px;
          color: var(--cream);
          z-index: 1;
          text-align: center;
        }

        .logo-section {
          margin-bottom: 3rem;
          animation: cardEntrance 0.8s ease-out;
        }

        .logo-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          display: block;
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }

        .tagline {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--mist);
          font-weight: 500;
        }

        .fact-box {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 2rem;
          margin-top: 2.5rem;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: cardEntrance 0.8s ease-out 0.2s backwards;
        }

        .fact-content {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--cream);
          font-style: italic;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .fact-content.hidden {
          opacity: 0;
          transform: translateY(10px);
        }

        .fact-content.visible {
          opacity: 1;
          transform: translateY(0);
          animation: factFade 0.4s ease;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* RIGHT PANEL - SIGN UP CARD */
        /* ═══════════════════════════════════════════════════════════════ */
        .signup-card-container {
          width: 100%;
          max-width: 520px;
          animation: cardEntrance 0.8s ease-out;
        }

        .signup-card {
          background: linear-gradient(135deg, var(--forest) 0%, var(--moss) 100%);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 20px 60px rgba(26, 61, 43, 0.3);
          position: relative;
          overflow: hidden;
        }

        .card-background-image {
          position: absolute;
          top: 0;
          right: 0;
          width: 400px;
          height: 400px;
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

        .card-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          color: var(--mist);
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--cream);
          line-height: 1.2;
          margin-bottom: 1rem;
        }

        .card-subtitle {
          font-size: 1rem;
          color: var(--mist);
          font-weight: 300;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* FORM STYLES */
        /* ═══════════════════════════════════════════════════════════════ */
        .signup-form {
          margin-bottom: 1.5rem;
        }

        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--mist);
          margin-bottom: 0.5rem;
          text-align: left;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 0.95rem 1.25rem;
          border: 1.5px solid rgba(200, 222, 206, 0.3);
          border-radius: 10px;
          font-size: 1rem;
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

        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-field::placeholder {
          color: var(--text-lt);
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.25rem;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          opacity: 1;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* BUTTON STYLES */
        /* ═══════════════════════════════════════════════════════════════ */
        .email-btn {
          width: 100%;
          background: var(--forest);
          border: none;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
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

        .google-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          border: 1.5px solid rgba(200, 222, 206, 0.3);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1rem;
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
          width: 18px;
          height: 18px;
          border: 2px solid var(--sage);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: absolute;
          left: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .email-btn.loading .spinner,
        .google-btn.loading .spinner {
          opacity: 1;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* DIVIDER */
        /* ═══════════════════════════════════════════════════════════════ */
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.75rem 0;
          font-size: 0.85rem;
          color: var(--mist);
          font-weight: 500;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(200, 222, 206, 0.4);
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* LOGIN LINK */
        /* ═══════════════════════════════════════════════════════════════ */
        .login-link {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(200, 222, 206, 0.3);
          font-size: 0.95rem;
          color: white;
        }

        .login-link a {
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .login-link a:hover {
          color: var(--mist);
          text-decoration: underline;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* TRUST BADGES */
        /* ═══════════════════════════════════════════════════════════════ */
        .trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          margin: 2rem 0 2.5rem;
          padding: 0;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--sage);
        }

        .badge-icon {
          font-size: 1rem;
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
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(26, 61, 43, 0.3);
          font-size: 0.95rem;
          font-weight: 500;
          z-index: 10000;
          animation: toastSlide 0.3s ease;
          max-width: 90%;
          width: auto;
          text-align: center;
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /* RESPONSIVE DESIGN */
        /* ═══════════════════════════════════════════════════════════════ */
        @media (max-width: 860px) {
          .right-panel {
            padding: 3rem 1.5rem 2.5rem;
          }

          .top-link {
            top: 1.25rem;
            right: 1.5rem;
            font-size: 0.85rem;
          }

          .signup-card-container {
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

          .signup-card {
            padding: 2rem 1.5rem;
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

      <div className="signup-container">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Floating leaves */}
          {LEAVES.map((leaf, index) => (
            <span
              key={index}
              className="floating-leaf"
              style={{
                '--leaf-size': `${leaf.size}px`,
                '--leaf-delay': `${leaf.delay}s`,
                left: leaf.left,
                top: leaf.top
              }}
            >
              🍃
            </span>
          ))}

          <div className="left-content">
            <div className="logo-section">
              <span className="logo-icon">🌍</span>
              <h1 className="logo-text">
                Personal Carbon Footprint
              </h1>
              <div className="tagline">
                Track · Reduce · Sustain
              </div>
            </div>

            <div className="fact-box">
              <p className={`fact-content ${factVisible ? 'visible' : 'hidden'}`}>
                💡 {FACTS[factIndex]}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="signup-card-container">
            <div className="signup-card">
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
                marginBottom: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: 'center',
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #89bb97 0%, #c8dece 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  boxShadow: '0 2px 8px rgba(200, 222, 206, 0.2)'
                }}>
                  🌿
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ 
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    color: 'var(--cream)',
                    margin: '0',
                    lineHeight: '1.1'
                  }}>
                    Personal Carbon Footprint
                  </h1>
                  <div style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: 'var(--mist)',
                    marginTop: '5px',
                    fontWeight: '500'
                  }}>
                    Track · Reduce · Sustain
                  </div>
                </div>
              </div>

              <div className="card-label">JOIN US TODAY</div>
              <h2 className="card-title">
                Create your
                <br />
                carbon tracking account
              </h2>
              <p className="card-subtitle">
                Start your journey towards a sustainable lifestyle by tracking and reducing your carbon footprint.
              </p>

              {/* Sign up form */}
              <form className="signup-form" onSubmit={handleEmailSignUp}>
                <div className="input-group">
                  <label className="input-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={emailLoading}
                  />
                </div>

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
                      placeholder="At least 6 characters"
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

                <div className="input-group">
                  <label className="input-label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={emailLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={emailLoading}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Sign up button */}
                <button
                  type="submit"
                  className={`email-btn ${emailLoading ? 'loading' : ''}`}
                  disabled={emailLoading}
                >
                  <div className="spinner"></div>
                  <div className="btn-content">
                    <span>{emailLoading ? 'Creating account…' : 'Sign Up'}</span>
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <div className="divider-line"></div>
                <span>OR</span>
                <div className="divider-line"></div>
              </div>

              {/* Google button */}
              <button
                className={`google-btn ${loading ? 'loading' : ''}`}
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <div className="spinner"></div>
                <div className="btn-content">
                  <GoogleIcon />
                  <span>{btnLabel}</span>
                </div>
              </button>

              {/* Login link */}
              <div className="login-link">
                Already have an account? <a href="/login">Login</a>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="trust-badges">
            <div className="badge">
              <span className="badge-icon">🌱</span>
              <span>Carbon-neutral hosting</span>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-links">
              <a href="#about">About</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#contact">Contact</a>
              <a href="#blog">Sustainability Blog</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="copyright">
              © 2025 Personal Carbon Footprint. Made with ♥ for the planet.
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div className="toast">
          {toast.msg}
        </div>
      )}
    </>
  );
}
