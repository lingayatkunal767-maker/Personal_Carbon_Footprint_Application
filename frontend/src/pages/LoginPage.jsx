import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '245883591621-7shq6c72ddodeq09k62pk034jogjtbtt.apps.googleusercontent.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const FACTS = [
  'Global ocean temperatures have risen by about 0.13 F per decade since 1901.',
  'Home efficiency improvements can reduce household emissions by 25 to 30 percent.',
  'A single roundtrip transatlantic flight can emit about 1.6 tons of CO2 per passenger.',
  'Producing 1 kg of beef can create about 60 kg of greenhouse gas emissions.',
  'The fashion industry contributes close to 10 percent of global emissions.',
  'One mature tree can absorb about 48 pounds of CO2 per year.',
  'Recycling aluminum saves up to 95 percent of the energy used to produce new aluminum.',
  'Biking instead of driving short trips can save about 0.9 kg CO2 per mile.'
];

const STATS = [
  { value: '4.7T', label: 'Average yearly CO2 footprint per person' },
  { value: '28%', label: 'Of global emissions from transport' },
  { value: '45%', label: 'Reduction needed by 2030' }
];

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
  const [toast, setToast] = useState({ text: '', visible: false });

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
      setFactIndex((prev) => (prev + 1) % FACTS.length);
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

  const showToast = (text) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ text, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast({ text: '', visible: false });
    }, 3000);
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

      showToast(`Welcome, ${data.name || 'user'}.`);
      setTimeout(() => setSessionAndNavigate(data), 500);
    } catch (error) {
      showToast(`Google login failed: ${error.message}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      showToast('Google Sign-In is still loading. Try again in a moment.');
      return;
    }

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      showToast('Google OAuth is not configured.');
      return;
    }

    setGoogleLoading(true);
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
        showToast('Google One Tap was not shown. Please use email login.');
      } else {
        setGoogleLoading(false);
      }
    });
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      showToast('Please enter both email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      showToast('Please enter a valid email address.');
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

      showToast(data.message || 'Login successful.');
      setTimeout(() => setSessionAndNavigate(data), 500);
    } catch (error) {
      showToast(error.message || 'Cannot reach backend server.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');

        :root {
          --forest: #1a3d2b;
          --moss: #2e5e42;
          --sage: #5a8a6a;
          --mint: #89bb97;
          --mist: #c8dece;
          --cream: #f6f1e9;
          --paper: #faf7f2;
          --ink: #1c1e1a;
          --ink-soft: #4a5244;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          background:
            radial-gradient(circle at 8% 10%, rgba(137, 187, 151, 0.22), transparent 40%),
            radial-gradient(circle at 92% 85%, rgba(200, 222, 206, 0.28), transparent 45%),
            linear-gradient(135deg, #f9f5ed 0%, #f3efe6 100%);
        }

        .login-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
        }

        .hero {
          padding: clamp(24px, 4vw, 48px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(145deg, rgba(26, 61, 43, 0.95), rgba(46, 94, 66, 0.9));
          color: var(--cream);
        }

        .hero h1 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.15;
        }

        .hero p {
          margin-top: 14px;
          font-size: 1rem;
          color: var(--mist);
          max-width: 540px;
        }

        .stat-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .stat-card {
          border: 1px solid rgba(200, 222, 206, 0.25);
          border-radius: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.07);
        }

        .stat-value {
          font-weight: 700;
          font-size: 1.1rem;
          color: #e7f5ea;
        }

        .stat-label {
          margin-top: 4px;
          font-size: 0.8rem;
          color: #c9dfcf;
        }

        .fact-strip {
          margin-top: 18px;
          border-left: 4px solid var(--mint);
          background: rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px;
          min-height: 64px;
          display: grid;
          align-content: center;
        }

        .fact-strip p {
          margin: 0;
          color: #e1f0e5;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .auth-panel {
          display: grid;
          place-items: center;
          padding: clamp(20px, 4vw, 48px);
        }

        .auth-card {
          width: 100%;
          max-width: 430px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          border: 1px solid rgba(90, 138, 106, 0.2);
          box-shadow: 0 22px 55px rgba(26, 61, 43, 0.18);
          padding: 24px;
        }

        .auth-card h2 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          color: var(--forest);
        }

        .auth-card p {
          margin-top: 8px;
          color: var(--ink-soft);
          font-size: 0.92rem;
        }

        .auth-form {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .label {
          font-size: 0.82rem;
          color: #51604f;
          margin-bottom: 4px;
          display: block;
        }

        .input {
          width: 100%;
          border: 1px solid rgba(90, 138, 106, 0.35);
          border-radius: 10px;
          padding: 11px 12px;
          font-size: 0.93rem;
          background: #fff;
          color: var(--ink);
        }

        .input:focus {
          outline: none;
          border-color: var(--sage);
          box-shadow: 0 0 0 3px rgba(137, 187, 151, 0.25);
        }

        .password-row {
          display: flex;
          gap: 8px;
        }

        .toggle-btn {
          border: none;
          border-radius: 10px;
          padding: 0 12px;
          background: #eef6ef;
          color: #2e5e42;
          font-weight: 600;
          cursor: pointer;
        }

        .primary-btn,
        .google-btn {
          width: 100%;
          border: none;
          border-radius: 10px;
          height: 44px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .email-btn.loading .btn-content {
          opacity: 0.5;
        }

        .google-btn {
          margin-top: 6px;
          border: 1px solid rgba(90, 138, 106, 0.35);
          background: #fff;
          color: #254a33;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .primary-btn:hover,
        .google-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(26, 61, 43, 0.16);
        }

        .primary-btn:disabled,
        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .auth-links {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
        }

        .auth-links a {
          color: #2e5e42;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-links a:hover {
          text-decoration: underline;
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          max-width: 360px;
          border-radius: 10px;
          padding: 10px 14px;
          background: #1f4d33;
          color: #fff;
          font-size: 0.88rem;
          z-index: 1000;
          box-shadow: 0 12px 28px rgba(17, 39, 27, 0.28);
        }

        @media (max-width: 960px) {
          .login-shell {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 20px;
          }

          .stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .auth-panel {
            padding-top: 6px;
          }
        }

        @media (max-width: 640px) {
          .hero {
            display: none;
          }

          .auth-card {
            padding: 20px;
          }

          .auth-links {
            gap: 10px;
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="login-shell">
        <section className="hero">
          <h1>Track your footprint. Build cleaner habits.</h1>
          <p>
            Sign in to monitor daily emissions, set measurable goals, and see progress from your transport,
            food, and home energy choices.
          </p>

          <div className="stat-grid">
            {STATS.map((item) => (
              <div className="stat-card" key={item.label}>
                <div className="stat-value">{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="fact-strip">
            <p>{FACTS[factIndex]}</p>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your carbon dashboard.</p>

            <form className="auth-form" onSubmit={handleEmailLogin}>
              <div>
                <label className="label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={emailLoading || googleLoading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label" htmlFor="login-password">Password</label>
                <div className="password-row">
                  <input
                    id="login-password"
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={emailLoading || googleLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={emailLoading || googleLoading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button className="primary-btn" type="submit" disabled={emailLoading || googleLoading}>
                {emailLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <button className="google-btn" type="button" onClick={handleGoogleLogin} disabled={emailLoading || googleLoading}>
              <GoogleIcon />
              {googleLoading ? 'Opening Google...' : 'Continue with Google'}
            </button>

            <div className="auth-links">
              <Link to="/signup">Create account</Link>
              <Link to="/admin/login">Admin login</Link>
            </div>
          </div>
        </section>
      </div>

      {toast.visible && <div className="toast">{toast.text}</div>}
    </>
  );
}
