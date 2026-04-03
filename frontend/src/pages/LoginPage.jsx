import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const FACTS = [
  'Global ocean temperatures have risen ~0.13°F per decade since 1901.',
  'Home efficiency upgrades can cut household emissions by 25–30%.',
  'A roundtrip transatlantic flight emits ~1.6 tons of CO₂ per passenger.',
  'Producing 1 kg of beef generates up to 60 kg of greenhouse gases.',
  'The fashion industry accounts for ~10% of global annual emissions.',
  'One mature tree absorbs ~48 pounds of CO₂ per year.',
  'Recycling aluminum saves 95% of the energy needed for new aluminum.',
  'Biking instead of driving saves ~0.9 kg CO₂ per mile.',
];

const STATS = [
  { value: '4.7T', label: 'Avg yearly CO₂ per person' },
  { value: '28%', label: 'Emissions from transport' },
  { value: '45%', label: 'Reduction needed by 2030' },
];

const LEAVES = [
  { top: '7%',  left: '80%', dur: '8s',  delay: '0s',  size: '28px' },
  { top: '20%', left: '10%', dur: '9.5s',delay: '2s',  size: '22px' },
  { top: '55%', left: '88%', dur: '7.5s',delay: '5s',  size: '20px' },
  { top: '75%', left: '18%', dur: '10s', delay: '8s',  size: '26px' },
  { top: '40%', left: '52%', dur: '8.5s',delay: '12s', size: '18px' },
];

function EyeOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
      <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05" />
      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.737 7.396 3.977 10 3.977z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [toast, setToast] = useState({ text: '', type: 'default', visible: false });

  const toastTimerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('current_user');
    if (!token || !raw) return;

    try {
      const session = JSON.parse(raw);
      if (!session || session.active === false) return;
      const target = (session.role || 'USER').toUpperCase() === 'ADMIN' ? '/admin/home' : '/home';
      navigate(target, { replace: true });
    } catch {
      // Keep user on login page if session payload is malformed.
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % FACTS.length);
        setFactVisible(true);
      }, 350);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.google?.accounts?.id) {
        showToast('Google Sign-In is unavailable right now.');
        return;
      }

      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        showToast('Google OAuth is not configured.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    };

    script.onerror = () => {
      showToast('Failed to load Google Sign-In. Check internet connection.');
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (text, type = 'default') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, type, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast({ text: '', type: 'default', visible: false });
    }, 3500);
  };

  const setSessionAndNavigate = (data) => {
    const session = {
      id: data.userId,
      name: data.name,
      email: data.email,
      profilePicture: data.profilePicture,
      role: data.role || 'USER',
      active: data.active !== false
    };

    localStorage.setItem('current_user', JSON.stringify(session));
    localStorage.setItem('auth_token', 'authenticated');

    const target = (session.role || 'USER').toUpperCase() === 'ADMIN' ? '/admin/home' : '/home';
    navigate(target, { replace: true });
  };

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      showToast('Authentication failed. No Google credential received.');
      return;
    }

    setGoogleLoading(true);

    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const result = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name || payload.given_name || 'Google User',
          email: payload.email,
          googleId: payload.sub,
          profilePicture: payload.picture || null
        })
      });

      const data = await result.json();
      if (!result.ok || !data.success) {
        throw new Error(data.message || 'Google login failed');
      }

      showToast(`Welcome back, ${data.name || 'there'}! 🌿`, 'success');
      setTimeout(() => setSessionAndNavigate(data), 600);
    } catch (error) {
      showToast(`Google login failed: ${error.message}`, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      showToast('Google Sign-In is still loading. Try again in a moment.', 'warning');
      return;
    }

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      showToast('Google OAuth is not configured.', 'warning');
      return;
    }

    setGoogleLoading(true);
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
        showToast('Google One Tap was not shown. Please use email login.', 'warning');
      } else {
        setGoogleLoading(false);
      }
    });
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setEmailLoading(true);

    try {
      const result = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password
        })
      });

      const data = await result.json();
      if (!result.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      showToast(data.message || 'Welcome back! 🌿', 'success');
      setTimeout(() => setSessionAndNavigate(data), 600);
    } catch (error) {
      const message = String(error?.message || '');
      const isNetworkFailure = /failed to fetch|networkerror|load failed/i.test(message);
      if (isNetworkFailure) {
        showToast('Cannot reach backend server. Start backend and try again.', 'error');
      } else {
        showToast(error.message || 'Login failed. Please try again.', 'error');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const busy = emailLoading || googleLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --forest: #1a3d2b;
          --moss:   #2e5e42;
          --sage:   #5a8a6a;
          --fern:   #89bb97;
          --mist:   #c8dece;
          --cream:  #f6f1e9;
          --paper:  #faf7f2;
          --ink:    #1c1e1a;
          --ink2:   #4a5244;
          --ink3:   #8a9884;
        }

        body { font-family: 'DM Sans', sans-serif; }

        /* ── SHELL ── */
        .lp-shell {
          min-height: 100svh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── LEFT HERO ── */
        .lp-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(150deg, #152e20 0%, #1e4a30 45%, #2d6644 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(1.5rem, 3.5vw, 3rem) clamp(1.5rem, 3vw, 2.5rem);
          color: var(--cream);
        }

        .lp-hero::before {
          content: '';
          position: absolute;
          top: -140px; right: -80px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(137,187,151,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .lp-hero::after {
          content: '';
          position: absolute;
          bottom: -120px; left: -60px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,222,206,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes lp-float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
        .lp-leaf {
          position: absolute;
          opacity: 0.18;
          pointer-events: none;
          animation: lp-float linear infinite;
          filter: blur(0.5px);
          user-select: none;
        }

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }
        .lp-brand-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.13);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          backdrop-filter: blur(6px);
          flex-shrink: 0;
        }
        .lp-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.12rem;
          font-weight: 700;
          line-height: 1.2;
          color: var(--cream);
        }
        .lp-brand-sub {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 2.2px;
          color: var(--mist);
          font-weight: 500;
          margin-top: 2px;
        }

        .lp-hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.55rem, 2.4vw, 2.1rem);
          font-weight: 700;
          line-height: 1.2;
          color: #fff;
          margin-bottom: 0.65rem;
          position: relative;
          z-index: 1;
        }
        .lp-hero-sub {
          font-size: 0.86rem;
          color: #aacdb5;
          line-height: 1.6;
          max-width: 380px;
          margin-bottom: 1.2rem;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }

        .lp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 1.1rem;
          position: relative;
          z-index: 1;
        }
        .lp-stat {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(200,222,206,0.18);
          border-radius: 10px;
          padding: 9px 8px;
          text-align: center;
          backdrop-filter: blur(4px);
        }
        .lp-stat-v {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e9f6ec;
          display: block;
        }
        .lp-stat-l {
          font-size: 0.65rem;
          color: #9cbfa8;
          margin-top: 2px;
          line-height: 1.3;
          display: block;
        }

        .lp-fact {
          background: rgba(255,255,255,0.06);
          border-left: 3px solid var(--fern);
          border-radius: 0 10px 10px 0;
          padding: 10px 13px;
          min-height: 46px;
          display: flex;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .lp-fact p {
          font-size: 0.81rem;
          color: #d4eeda;
          line-height: 1.6;
          font-style: italic;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .lp-fact p.lp-hidden { opacity: 0; transform: translateY(6px); }
        .lp-fact p.lp-visible { opacity: 1; transform: translateY(0); }

        /* ── RIGHT PANE ── */
        .lp-pane {
          background: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 2vw, 2rem);
        }

        @keyframes lp-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(90,138,106,0.14);
          box-shadow: 0 16px 48px rgba(26,61,43,0.11), 0 4px 14px rgba(26,61,43,0.06);
          padding: clamp(1.4rem, 2.5vw, 1.9rem);
          animation: lp-slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .lp-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #e3f5e8 0%, #cee9d5 100%);
          border: 1px solid #b6dfc2;
          border-radius: 100px;
          padding: 4px 11px 4px 8px;
          margin-bottom: 0.9rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--forest);
        }
        .lp-card-badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #34a853;
          animation: lp-pulse 2s infinite;
        }
        @keyframes lp-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }

        .lp-card h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: var(--forest);
          margin-bottom: 0.25rem;
          line-height: 1.2;
        }
        .lp-card-sub {
          font-size: 0.83rem;
          color: var(--ink2);
          margin-bottom: 1.15rem;
          line-height: 1.5;
        }

        .lp-field { margin-bottom: 0.8rem; }
        .lp-label {
          display: block;
          font-size: 0.77rem;
          font-weight: 600;
          color: var(--ink2);
          margin-bottom: 0.3rem;
          letter-spacing: 0.2px;
        }
        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%;
          border: 1.5px solid #d6e4da;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 0.91rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          background: #fdfdfd;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          appearance: none;
        }
        .lp-input:focus {
          outline: none;
          border-color: var(--sage);
          box-shadow: 0 0 0 3.5px rgba(90,138,106,0.13);
          background: #fff;
        }
        .lp-input::placeholder { color: #b0bcb4; }
        .lp-input.lp-has-eye { padding-right: 46px; }

        .lp-eye {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--ink3); display: flex; align-items: center;
          padding: 4px; transition: color 0.2s; border-radius: 6px;
        }
        .lp-eye:hover { color: var(--sage); }

        .lp-btn-primary {
          width: 100%; height: 42px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #1a3d2b 0%, #2e5e42 100%);
          color: #fff;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 0.2rem;
          letter-spacing: 0.2px;
        }
        .lp-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(26,61,43,0.28);
        }
        .lp-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .lp-btn-primary:disabled { opacity: 0.62; cursor: not-allowed; }

        .lp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 0.75rem 0; font-size: 0.74rem;
          color: var(--ink3); font-weight: 500; letter-spacing: 0.5px;
        }
        .lp-divider-line { flex: 1; height: 1px; background: #e4ede6; }

        .lp-btn-google {
          width: 100%; height: 42px;
          border: 1.5px solid #d6e4da;
          border-radius: 10px;
          background: #fff;
          color: var(--ink);
          font-size: 0.86rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s;
        }
        .lp-btn-google:hover:not(:disabled) {
          border-color: var(--fern);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(137,187,151,0.22);
        }
        .lp-btn-google:disabled { opacity: 0.62; cursor: not-allowed; }

        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .lp-spinner--dark {
          border-color: rgba(44,90,60,0.25);
          border-top-color: var(--moss);
        }

        .lp-links {
          display: flex; justify-content: space-between;
          margin-top: 0.85rem; padding-top: 0.75rem;
          border-top: 1px solid #edf2ee;
          font-size: 0.8rem;
        }
        .lp-links a {
          color: var(--moss); text-decoration: none;
          font-weight: 600; transition: color 0.18s;
        }
        .lp-links a:hover { color: var(--forest); text-decoration: underline; }

        @keyframes lp-toast-in {
          from { opacity: 0; transform: translate(-50%, -14px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .lp-toast {
          position: fixed; top: 22px; left: 50%;
          transform: translateX(-50%);
          padding: 12px 22px; border-radius: 12px;
          font-size: 0.89rem; font-weight: 500;
          z-index: 9999; max-width: 90vw;
          box-shadow: 0 14px 34px rgba(0,0,0,0.18);
          animation: lp-toast-in 0.3s ease;
          white-space: nowrap; font-family: 'DM Sans', sans-serif;
        }
        .lp-toast--default { background: #1a3d2b; color: #e4f5e9; }
        .lp-toast--success { background: #155e30; color: #c0f0cc; }
        .lp-toast--error   { background: #5e1e1e; color: #fcd4d4; }
        .lp-toast--warning { background: #4a3a0e; color: #faeab8; }

        @media (max-width: 860px) {
          .lp-shell { grid-template-columns: 1fr; }
          .lp-hero { padding: 2rem 1.5rem; }
        }

        @media (orientation: landscape) and (max-height: 430px) and (max-width: 900px) {
          .lp-shell { grid-template-columns: 1fr; }
          .lp-hero { display: none; }
          .lp-pane { padding: 0.8rem 1rem; align-items: flex-start; }
          .lp-card { max-width: 100%; padding: 0.9rem 1rem; border-radius: 12px; }
          .lp-card-badge { margin-bottom: 0.5rem; }
          .lp-card h2 { font-size: 1.1rem; }
          .lp-card-sub { font-size: 0.72rem; margin-bottom: 0.65rem; }
          .lp-field { margin-bottom: 0.5rem; }
          .lp-label { font-size: 0.7rem; }
          .lp-input { font-size: 0.78rem; padding: 7px 9px; }
          .lp-btn-primary,
          .lp-btn-google { height: 34px; font-size: 0.74rem; }
          .lp-divider { gap: 6px; margin: 0.45rem 0; font-size: 0.65rem; }
          .lp-links {
            margin-top: 0.55rem;
            padding-top: 0.5rem;
            font-size: 0.7rem;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 0.4rem;
          }
          .lp-toast {
            top: 8px;
            left: 10px;
            right: 10px;
            transform: none;
            white-space: normal;
            text-align: center;
            font-size: 0.72rem;
            padding: 8px 10px;
          }
        }
        @media (max-width: 560px) {
          .lp-hero { display: none; }
          .lp-pane { padding: 1.8rem 0.95rem; align-items: flex-start; padding-top: 2rem; }
          .lp-card { padding: 1.15rem 1rem; border-radius: 14px; }
          .lp-card h2 { font-size: 1.35rem; }
          .lp-card-sub { font-size: 0.79rem; margin-bottom: 1rem; }
          .lp-input { font-size: 0.86rem; padding: 8px 10px; }
          .lp-btn-primary,
          .lp-btn-google { height: 40px; font-size: 0.82rem; }
          .lp-links { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .lp-toast {
            left: 12px;
            right: 12px;
            transform: none;
            max-width: none;
            white-space: normal;
            text-align: center;
            font-size: 0.8rem;
            padding: 10px 12px;
          }
        }

        @media (max-width: 375px) {
          .lp-pane { padding: 1.1rem 0.65rem; padding-top: 1.2rem; }
          .lp-card { padding: 0.95rem 0.8rem; border-radius: 12px; }
          .lp-card-badge { font-size: 0.68rem; padding: 3px 8px; margin-bottom: 0.7rem; }
          .lp-card h2 { font-size: 1.2rem; }
          .lp-card-sub { font-size: 0.75rem; margin-bottom: 0.85rem; }
          .lp-label { font-size: 0.73rem; }
          .lp-input { font-size: 0.82rem; }
          .lp-btn-primary,
          .lp-btn-google { height: 38px; font-size: 0.78rem; }
          .lp-divider { gap: 8px; margin: 0.6rem 0; font-size: 0.68rem; }
          .lp-links { font-size: 0.74rem; }
        }
      `}</style>

      <div className="lp-shell">
        {/* ── LEFT HERO ── */}
        <aside className="lp-hero">
          {LEAVES.map((l, i) => (
            <span key={i} className="lp-leaf"
              style={{ top: l.top, left: l.left, animationDuration: l.dur, animationDelay: l.delay, fontSize: l.size }}>
              🍃
            </span>
          ))}

          <div className="lp-brand">
            <div className="lp-brand-icon">🌿</div>
            <div>
              <div className="lp-brand-name">Personal Carbon<br/>Footprint</div>
              <div className="lp-brand-sub">Track · Reduce · Sustain</div>
            </div>
          </div>

          <h1 className="lp-hero-headline">
            Track your footprint.<br/>
            Build cleaner habits.
          </h1>
          <p className="lp-hero-sub">
            Monitor daily emissions, set measurable goals, and see real progress from your
            transport, food, and home energy choices — powered by real behavioral data.
          </p>

          <div className="lp-stats">
            {STATS.map((s) => (
              <div className="lp-stat" key={s.label}>
                <span className="lp-stat-v">{s.value}</span>
                <span className="lp-stat-l">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="lp-fact">
            <p className={factVisible ? 'lp-visible' : 'lp-hidden'}>
              💡 {FACTS[factIndex]}
            </p>
          </div>
        </aside>

        {/* ── RIGHT FORM ── */}
        <main className="lp-pane">
          <div className="lp-card">
            <div className="lp-card-badge">
              <span className="lp-card-badge-dot" />
              Secure Login
            </div>

            <h2>Welcome back</h2>
            <p className="lp-card-sub">Sign in to continue to your carbon dashboard.</p>

            <form onSubmit={handleEmailLogin} noValidate>
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-email">Email address</label>
                <input
                  id="lp-email"
                  className="lp-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-pw">Password</label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-pw"
                    className="lp-input lp-has-eye"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-btn-primary" disabled={busy}>
                {emailLoading ? (
                  <><span className="lp-spinner" /> Signing in…</>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span>OR</span>
              <div className="lp-divider-line" />
            </div>

            <button className="lp-btn-google" type="button" onClick={handleGoogleLogin} disabled={busy}>
              {googleLoading ? (
                <><span className="lp-spinner lp-spinner--dark" /> Opening Google…</>
              ) : (
                <><GoogleIcon />Continue with Google</>
              )}
            </button>

            <div className="lp-links">
              <Link to="/signup">Create account</Link>
              <Link to="/admin/login">Admin login</Link>
            </div>
          </div>
        </main>
      </div>

      {toast.visible && (
        <div className={`lp-toast lp-toast--${toast.type}`}>{toast.text}</div>
      )}
    </>
  );
}
