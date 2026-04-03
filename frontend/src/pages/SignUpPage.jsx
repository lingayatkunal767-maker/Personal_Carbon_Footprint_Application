import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "421764128567-r2p83571fkfforlcfms7066e9chbh0cn.apps.googleusercontent.com";
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const FACTS = [
  "Global ocean temperatures rise ~0.13°F per decade since 1901.",
  "Home energy efficiency improvements can cut emissions by 25-30%.",
  "A roundtrip transatlantic flight emits ~1.6 tons CO₂ per passenger.",
  "1 kg of beef generates up to 60 kg of greenhouse gases.",
  "Fashion accounts for ~10% of global annual carbon emissions.",
  "One mature tree absorbs ~48 lbs of CO₂ per year.",
  "Recycling aluminum saves 95% of the energy for new aluminum.",
  "Biking instead of driving saves ~0.9 kg CO₂ per mile.",
];

const PERKS = [
  { icon: '📊', title: 'Real-time tracking', desc: 'Log activities and see your carbon footprint update instantly.' },
  { icon: '🎯', title: 'AI-powered goals', desc: 'Smart targets backed by 1,400+ real behavioral data points.' },
  { icon: '🏆', title: 'Earn eco badges', desc: 'Get rewarded as you build lasting sustainable habits.' },
];

const LEAVES = [
  { top: '8%',  left: '80%', dur: '8s',  delay: '0s',  size: '28px' },
  { top: '22%', left: '10%', dur: '9.5s',delay: '2s',  size: '22px' },
  { top: '55%', left: '88%', dur: '7.5s',delay: '5s',  size: '20px' },
  { top: '75%', left: '18%', dur: '10s', delay: '8s',  size: '26px' },
  { top: '40%', left: '52%', dur: '8.5s',delay: '12s', size: '18px' },
];

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'transparent', pct: 0 };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '',            color: 'transparent', pct: 0   },
    { label: 'Weak',        color: '#e55',        pct: 20  },
    { label: 'Fair',        color: '#e9a03b',      pct: 40  },
    { label: 'Good',        color: '#5a8a6a',      pct: 60  },
    { label: 'Strong',      color: '#1e7a40',      pct: 80  },
    { label: 'Very Strong', color: '#155e30',      pct: 100 },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
      <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
      <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z" fill="#FBBC05"/>
      <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.737 7.396 3.977 10 3.977z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [factIndex, setFactIndex]         = useState(0);
  const [factVisible, setFactVisible]     = useState(true);
  const [loading, setLoading]             = useState(false);
  const [emailLoading, setEmailLoading]   = useState(false);
  const [toast, setToast]                 = useState({ msg: '', type: 'default', show: false });
  const toastTimerRef = useRef(null);

  const [name, setName]                           = useState('');
  const [email, setEmail]                         = useState('');
  const [password, setPassword]                   = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const raw   = localStorage.getItem('current_user');
    if (!token || !raw) return;
    try {
      const session = JSON.parse(raw);
      if (!session || session.active === false) return;
      const target = (session.role || 'USER').toUpperCase() === 'ADMIN' ? '/admin/home' : '/home';
      navigate(target, { replace: true });
    } catch { /* ignore */ }
  }, [navigate]);

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
          callback: handleCredentialResponse,
        });
      }
    };
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex((p) => (p + 1) % FACTS.length);
        setFactVisible(true);
      }, 350);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const firstName = payload.given_name || 'there';
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name || firstName,
          email: payload.email,
          googleId: payload.sub,
          profilePicture: payload.picture || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Sign up failed.', 'error');
        return;
      }
      const role   = data.role || 'USER';
      const target = role.toUpperCase() === 'ADMIN' ? '/admin/home' : '/home';
      localStorage.setItem('current_user', JSON.stringify({
        id: data.userId, name: data.name, email: data.email,
        profilePicture: data.profilePicture, role, active: data.active !== false,
      }));
      localStorage.setItem('auth_token', 'authenticated');
      showToast(`Welcome, ${firstName}! Your account is ready. 🌿`, 'success');
      setTimeout(() => navigate(target), 1200);
    } catch {
      showToast('Sign up failed. Please try again.', 'error');
    }
  };

  const showToast = (msg, type = 'default') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type, show: true });
    toastTimerRef.current = setTimeout(() => setToast({ msg: '', type: 'default', show: false }), 3500);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    const normalizedName  = name.trim().replace(/\s+/g, ' ');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      showToast('Please fill in all required fields.', 'warning');  return;
    }
    if (normalizedName.length < 2) {
      showToast('Name must be at least 2 characters.', 'warning'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showToast('Please enter a valid email address.', 'warning'); return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning'); return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'warning'); return;
    }
    setEmailLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: normalizedName, email: normalizedEmail, password }),
      });
      const data = await response.json();
      if (data.success) {
        const role   = data.role || 'USER';
        const target = role.toUpperCase() === 'ADMIN' ? '/admin/home' : '/home';
        localStorage.setItem('current_user', JSON.stringify({
          id: data.userId, name: data.name, email: data.email,
          profilePicture: data.profilePicture, role, active: data.active !== false,
        }));
        localStorage.setItem('auth_token', 'authenticated');
        showToast(data.message || 'Account created! Welcome aboard 🌿', 'success');
        setTimeout(() => navigate(target), 1200);
      } else {
        showToast(data.message || 'Sign up failed. Try again.', 'error');
      }
    } catch (err) {
      const msg = err instanceof TypeError
        ? 'Cannot reach server. Is the backend running?'
        : `Sign up error: ${err.message}`;
      showToast(msg, 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      showToast('Google OAuth not configured.', 'warning'); return;
    }
    if (!window.google) {
      showToast('Google Sign-In failed to load. Please refresh.', 'warning'); return;
    }
    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      if (window.google.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
            window.location.href = authUrl;
          } else {
            setLoading(false);
          }
        });
        setTimeout(() => { if (loading) setLoading(false); }, 3000);
      } else {
        throw new Error('Google Identity Services not initialized');
      }
    } catch {
      setLoading(false);
      showToast('Sign up failed. Please try again or refresh.', 'error');
    }
  };

  const busy = emailLoading || loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --forest: #1a3d2b; --moss: #2e5e42; --sage: #5a8a6a;
          --fern: #89bb97;   --mist: #c8dece; --cream: #f6f1e9;
          --paper: #faf7f2;  --ink: #1c1e1a;  --ink2: #4a5244; --ink3: #8a9884;
        }
        body { font-family: 'DM Sans', sans-serif; }

        /* ── SHELL ── */
        .sp-shell { min-height: 100svh; display: grid; grid-template-columns: 1fr 1fr; }

        /* ── LEFT HERO ── */
        .sp-hero {
          position: relative; overflow: hidden;
          background: linear-gradient(150deg, #152e20 0%, #1e4a30 45%, #2d6644 100%);
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(1.5rem, 3.5vw, 3rem) clamp(1.5rem, 3vw, 2.5rem);
          color: var(--cream);
        }
        .sp-hero::before {
          content: ''; position: absolute; top: -140px; right: -80px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(137,187,151,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .sp-hero::after {
          content: ''; position: absolute; bottom: -120px; left: -60px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,222,206,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        @keyframes sp-float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(8deg); } }
        .sp-leaf {
          position: absolute; opacity: 0.18; pointer-events: none;
          animation: sp-float linear infinite; filter: blur(0.5px); user-select: none;
        }
        .sp-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 1.3rem; position: relative; z-index: 1; }
        .sp-brand-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.13); display: flex; align-items: center;
          justify-content: center; font-size: 20px; backdrop-filter: blur(6px); flex-shrink: 0;
        }
        .sp-brand-name { font-family: 'Playfair Display', serif; font-size: 1.12rem; font-weight: 700; line-height: 1.2; color: var(--cream); }
        .sp-brand-sub  { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 2.2px; color: var(--mist); font-weight: 500; margin-top: 2px; }
        .sp-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.55rem, 2.4vw, 2.1rem); font-weight: 700; line-height: 1.2;
          color: #fff; margin-bottom: 0.6rem; position: relative; z-index: 1;
        }
        .sp-hero-sub {
          font-size: 0.83rem; color: #aacdb5; line-height: 1.6;
          max-width: 380px; margin-bottom: 1.2rem; position: relative; z-index: 1;
        }
        .sp-perks { display: flex; flex-direction: column; gap: 9px; margin-bottom: 1.3rem; position: relative; z-index: 1; }
        .sp-perk { display: flex; align-items: flex-start; gap: 10px; }
        .sp-perk-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); display: flex; align-items: center;
          justify-content: center; font-size: 15px; backdrop-filter: blur(4px);
        }
        .sp-perk-title { font-size: 0.82rem; font-weight: 600; color: #e8f5eb; margin-bottom: 1px; }
        .sp-perk-desc  { font-size: 0.74rem; color: #9cbfa8; line-height: 1.4; }
        .sp-fact {
          background: rgba(255,255,255,0.06); border-left: 3px solid var(--fern);
          border-radius: 0 10px 10px 0; padding: 10px 13px; min-height: 44px;
          display: flex; align-items: center; position: relative; z-index: 1;
        }
        .sp-fact p {
          font-size: 0.79rem; color: #d4eeda; line-height: 1.55; font-style: italic;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .sp-fact p.sp-hidden { opacity: 0; transform: translateY(6px); }
        .sp-fact p.sp-visible { opacity: 1; transform: translateY(0); }

        /* ── RIGHT PANE ── */
        .sp-pane {
          background: var(--paper); display: flex; align-items: center;
          justify-content: center; padding: clamp(1rem, 2vw, 2rem);
          overflow-y: auto;
        }
        @keyframes sp-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp-card {
          width: 100%; max-width: 410px;
          background: #fff; border-radius: 18px;
          border: 1px solid rgba(90,138,106,0.14);
          box-shadow: 0 16px 48px rgba(26,61,43,0.11), 0 4px 14px rgba(26,61,43,0.06);
          padding: clamp(1.3rem, 2vw, 1.8rem);
          animation: sp-slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .sp-card-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #e3f5e8 0%, #cee9d5 100%);
          border: 1px solid #b6dfc2; border-radius: 100px;
          padding: 4px 11px 4px 8px; margin-bottom: 0.85rem;
          font-size: 0.75rem; font-weight: 600; color: var(--forest);
        }
        .sp-card-badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #34a853;
          animation: sp-pulse 2s infinite;
        }
        @keyframes sp-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.3); } }
        .sp-card h2 {
          font-family: 'Playfair Display', serif; font-size: 1.55rem; font-weight: 700;
          color: var(--forest); margin-bottom: 0.2rem; line-height: 1.2;
        }
        .sp-card-sub { font-size: 0.82rem; color: var(--ink2); margin-bottom: 1.1rem; line-height: 1.5; }

        /* Form fields */
        .sp-field { margin-bottom: 0.75rem; }
        .sp-label { display: block; font-size: 0.76rem; font-weight: 600; color: var(--ink2); margin-bottom: 0.3rem; letter-spacing: 0.2px; }
        .sp-input-wrap { position: relative; }
        .sp-input {
          width: 100%; border: 1.5px solid #d6e4da; border-radius: 10px;
          padding: 9px 12px; font-size: 0.87rem; font-family: 'DM Sans', sans-serif;
          color: var(--ink); background: #fdfdfd;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; appearance: none;
        }
        .sp-input:focus { outline: none; border-color: var(--sage); box-shadow: 0 0 0 3.5px rgba(90,138,106,0.13); background: #fff; }
        .sp-input::placeholder { color: #b0bcb4; }
        .sp-input.sp-has-eye { padding-right: 44px; }
        .sp-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .sp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--ink3);
          display: flex; align-items: center; padding: 4px; transition: color 0.2s; border-radius: 6px;
        }
        .sp-eye:hover { color: var(--sage); }

        /* Password strength */
        .sp-strength { margin-top: 6px; }
        .sp-strength-bar-bg { height: 4px; border-radius: 4px; background: #e8eee9; overflow: hidden; }
        .sp-strength-bar { height: 100%; border-radius: 4px; transition: width 0.3s ease, background-color 0.3s ease; }
        .sp-strength-label { font-size: 0.72rem; font-weight: 600; margin-top: 3px; }

        /* Buttons */
        .sp-btn-primary {
          width: 100%; height: 42px; border: none; border-radius: 10px;
          background: linear-gradient(135deg, #1a3d2b 0%, #2e5e42 100%);
          color: #fff; font-size: 0.88rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 0.2rem; letter-spacing: 0.2px;
        }
        .sp-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(26,61,43,0.28); }
        .sp-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .sp-btn-primary:disabled { opacity: 0.62; cursor: not-allowed; }

        .sp-divider {
          display: flex; align-items: center; gap: 12px; margin: 0.7rem 0;
          font-size: 0.74rem; color: var(--ink3); font-weight: 500; letter-spacing: 0.5px;
        }
        .sp-divider-line { flex: 1; height: 1px; background: #e4ede6; }

        .sp-btn-google {
          width: 100%; height: 42px; border: 1.5px solid #d6e4da; border-radius: 10px;
          background: #fff; color: var(--ink); font-size: 0.87rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s;
        }
        .sp-btn-google:hover:not(:disabled) { border-color: var(--fern); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(137,187,151,0.22); }
        .sp-btn-google:disabled { opacity: 0.62; cursor: not-allowed; }

        @keyframes sp-spin { to { transform: rotate(360deg); } }
        .sp-spinner {
          width: 17px; height: 17px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: sp-spin 0.7s linear infinite; flex-shrink: 0;
        }
        .sp-spinner--dark { border-color: rgba(44,90,60,0.25); border-top-color: var(--moss); }

        .sp-login-link {
          text-align: center; margin-top: 0.85rem; padding-top: 0.75rem;
          border-top: 1px solid #edf2ee; font-size: 0.8rem; color: var(--ink2);
        }
        .sp-login-link a { color: var(--moss); text-decoration: none; font-weight: 600; transition: color 0.18s; }
        .sp-login-link a:hover { color: var(--forest); text-decoration: underline; }
        .sp-admin-link { text-align: center; margin-top: 0.3rem; font-size: 0.75rem; color: var(--ink3); }
        .sp-admin-link a { color: var(--ink3); text-decoration: none; font-weight: 500; transition: color 0.18s; }
        .sp-admin-link a:hover { color: var(--sage); text-decoration: underline; }

        /* Toast */
        @keyframes sp-toast-in { from { opacity: 0; transform: translate(-50%, -14px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .sp-toast {
          position: fixed; top: 22px; left: 50%; transform: translateX(-50%);
          padding: 12px 22px; border-radius: 12px; font-size: 0.89rem; font-weight: 500;
          z-index: 9999; max-width: 90vw; box-shadow: 0 14px 34px rgba(0,0,0,0.18);
          animation: sp-toast-in 0.3s ease; white-space: nowrap; font-family: 'DM Sans', sans-serif;
        }
        .sp-toast--default { background: #1a3d2b; color: #e4f5e9; }
        .sp-toast--success { background: #155e30; color: #c0f0cc; }
        .sp-toast--error   { background: #5e1e1e; color: #fcd4d4; }
        .sp-toast--warning { background: #4a3a0e; color: #faeab8; }

        /* Responsive */
        @media (max-width: 860px) {
          .sp-shell { grid-template-columns: 1fr; }
          .sp-hero  { padding: 2rem 1.5rem; }
        }

        @media (orientation: landscape) and (max-height: 430px) and (max-width: 900px) {
          .sp-shell { grid-template-columns: 1fr; }
          .sp-hero { display: none; }
          .sp-pane { padding: 0.8rem 1rem; align-items: flex-start; }
          .sp-card { max-width: 100%; padding: 0.88rem 1rem; border-radius: 12px; }
          .sp-card-badge { margin-bottom: 0.5rem; }
          .sp-card h2 { font-size: 1.08rem; }
          .sp-card-sub { font-size: 0.71rem; margin-bottom: 0.58rem; }
          .sp-field { margin-bottom: 0.45rem; }
          .sp-label { font-size: 0.69rem; margin-bottom: 0.22rem; }
          .sp-input { font-size: 0.77rem; padding: 7px 9px; }
          .sp-strength { margin-top: 4px; }
          .sp-strength-bar-bg { height: 3px; }
          .sp-strength-label { font-size: 0.66rem; margin-top: 2px; }
          .sp-btn-primary,
          .sp-btn-google { height: 34px; font-size: 0.73rem; }
          .sp-divider { gap: 6px; margin: 0.4rem 0; font-size: 0.64rem; }
          .sp-login-link { margin-top: 0.52rem; padding-top: 0.45rem; font-size: 0.69rem; }
          .sp-admin-link { margin-top: 0.2rem; font-size: 0.67rem; }
          .sp-toast {
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
          .sp-hero { display: none; }
          .sp-pane { padding: 1.8rem 0.95rem; align-items: flex-start; padding-top: 2rem; }
          .sp-card { padding: 1.12rem 1rem; border-radius: 14px; }
          .sp-card h2 { font-size: 1.34rem; }
          .sp-card-sub { font-size: 0.78rem; margin-bottom: 0.95rem; }
          .sp-input { font-size: 0.84rem; padding: 8px 10px; }
          .sp-btn-primary,
          .sp-btn-google { height: 40px; font-size: 0.81rem; }
          .sp-login-link,
          .sp-admin-link { font-size: 0.76rem; }
          .sp-toast {
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
          .sp-pane { padding: 1.1rem 0.65rem; padding-top: 1.2rem; }
          .sp-card { padding: 0.92rem 0.8rem; border-radius: 12px; }
          .sp-card-badge { font-size: 0.67rem; padding: 3px 8px; margin-bottom: 0.68rem; }
          .sp-card h2 { font-size: 1.18rem; }
          .sp-card-sub { font-size: 0.74rem; margin-bottom: 0.8rem; }
          .sp-label { font-size: 0.72rem; }
          .sp-input { font-size: 0.8rem; }
          .sp-btn-primary,
          .sp-btn-google { height: 38px; font-size: 0.77rem; }
          .sp-divider { gap: 8px; margin: 0.55rem 0; font-size: 0.68rem; }
          .sp-login-link,
          .sp-admin-link { font-size: 0.72rem; }
        }
      `}</style>

      <div className="sp-shell">
        {/* ── LEFT HERO ── */}
        <aside className="sp-hero">
          {LEAVES.map((l, i) => (
            <span key={i} className="sp-leaf"
              style={{ top: l.top, left: l.left, animationDuration: l.dur, animationDelay: l.delay, fontSize: l.size }}>
              🍃
            </span>
          ))}

          <div className="sp-brand">
            <div className="sp-brand-icon">🌿</div>
            <div>
              <div className="sp-brand-name">Personal Carbon<br/>Footprint</div>
              <div className="sp-brand-sub">Track · Reduce · Sustain</div>
            </div>
          </div>

          <h1 className="sp-headline">
            Start your journey<br/>to a greener life.
          </h1>
          <p className="sp-hero-sub">
            Join thousands tracking and reducing their carbon footprint with personalised,
            data-driven insights.
          </p>

          <div className="sp-perks">
            {PERKS.map((p) => (
              <div className="sp-perk" key={p.title}>
                <div className="sp-perk-icon">{p.icon}</div>
                <div>
                  <div className="sp-perk-title">{p.title}</div>
                  <div className="sp-perk-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sp-fact">
            <p className={factVisible ? 'sp-visible' : 'sp-hidden'}>
              💡 {FACTS[factIndex]}
            </p>
          </div>
        </aside>

        {/* ── RIGHT FORM ── */}
        <main className="sp-pane">
          <div className="sp-card">
            <div className="sp-card-badge">
              <span className="sp-card-badge-dot" />
              Free to join
            </div>

            <h2>Create your account</h2>
            <p className="sp-card-sub">
              Track your carbon footprint and build sustainable habits today.
            </p>

            <form onSubmit={handleEmailSignUp} noValidate>
              <div className="sp-field">
                <label className="sp-label" htmlFor="sp-name">Full name</label>
                <input
                  id="sp-name" type="text" className="sp-input"
                  placeholder="Jane Smith"
                  value={name} onChange={(e) => setName(e.target.value)}
                  disabled={busy} autoComplete="name"
                />
              </div>

              <div className="sp-field">
                <label className="sp-label" htmlFor="sp-email">Email address</label>
                <input
                  id="sp-email" type="email" className="sp-input"
                  placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  disabled={busy} autoComplete="email"
                />
              </div>

              <div className="sp-field">
                <label className="sp-label" htmlFor="sp-pw">Password</label>
                <div className="sp-input-wrap">
                  <input
                    id="sp-pw"
                    type={showPassword ? 'text' : 'password'}
                    className="sp-input sp-has-eye"
                    placeholder="At least 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    disabled={busy} autoComplete="new-password"
                  />
                  <button type="button" className="sp-eye" tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="sp-strength">
                    <div className="sp-strength-bar-bg">
                      <div className="sp-strength-bar" style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
                    </div>
                    <div className="sp-strength-label" style={{ color: strength.color }}>{strength.label}</div>
                  </div>
                )}
              </div>

              <div className="sp-field">
                <label className="sp-label" htmlFor="sp-cpw">Confirm password</label>
                <div className="sp-input-wrap">
                  <input
                    id="sp-cpw"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="sp-input sp-has-eye"
                    placeholder="Re-enter your password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={busy} autoComplete="new-password"
                  />
                  <button type="button" className="sp-eye" tabIndex={-1}
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="sp-btn-primary" disabled={busy}>
                {emailLoading ? (
                  <><span className="sp-spinner" /> Creating account…</>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="sp-divider">
              <div className="sp-divider-line" />
              <span>OR</span>
              <div className="sp-divider-line" />
            </div>

            <button className="sp-btn-google" type="button" onClick={handleGoogleSignUp} disabled={busy}>
              {loading ? (
                <><span className="sp-spinner sp-spinner--dark" /> Opening Google…</>
              ) : (
                <><GoogleIcon />Sign up with Google</>
              )}
            </button>

            <div className="sp-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
            <div className="sp-admin-link">
              Need admin access? <Link to="/admin/signup">Create admin account</Link>
            </div>
          </div>
        </main>
      </div>

      {toast.show && (
        <div className={`sp-toast sp-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
