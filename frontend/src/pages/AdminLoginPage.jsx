import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, extractApiErrorMessage } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

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
      // Ignore malformed session data and keep admin login visible.
    }
  }, [navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail || !password) {
      showToast('Please enter email and password');
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      showToast('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.adminLogin({ email: normalizedEmail, password });

      const session = {
        id: data.userId,
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture,
        role: data.role || 'ADMIN',
        active: data.active !== false,
      };

      localStorage.setItem('auth_token', 'authenticated');
      localStorage.setItem('current_user', JSON.stringify(session));
      showToast('Welcome admin');

      setTimeout(() => navigate('/admin/home'), 700);
    } catch (error) {
      showToast(extractApiErrorMessage(error, 'Admin login failed'));
    } finally {
      setLoading(false);
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
          --mist: #c8dece;
          --cream: #f6f1e9;
          --warm: #faf7f2;
          --ink: #1c1e1a;
        }

        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: 'DM Sans', sans-serif;
          background: radial-gradient(circle at 10% 10%, rgba(200, 222, 206, 0.5), transparent 45%),
                      linear-gradient(120deg, #f9f5ed 0%, #f3efe6 100%);
        }

        .admin-auth-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
        }

        .admin-auth-card {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, var(--forest), var(--moss));
          border-radius: 18px;
          padding: 24px;
          color: var(--cream);
          box-shadow: 0 24px 60px rgba(26, 61, 43, 0.28);
          border: 1px solid rgba(200, 222, 206, 0.2);
        }

        .admin-auth-title {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem;
          line-height: 1.2;
        }

        .admin-auth-sub {
          margin-top: 8px;
          color: var(--mist);
          font-size: 0.9rem;
        }

        .admin-auth-form {
          margin-top: 16px;
          display: grid;
          gap: 12px;
        }

        .admin-auth-label {
          font-size: 0.8rem;
          color: var(--mist);
          margin-bottom: 4px;
          display: block;
        }

        .admin-auth-input {
          width: 100%;
          border: 1px solid rgba(200, 222, 206, 0.35);
          background: rgba(255, 255, 255, 0.95);
          color: var(--ink);
          border-radius: 10px;
          padding: 11px 12px;
          font-size: 0.9rem;
        }

        .admin-auth-input:focus {
          outline: none;
          border-color: #89bb97;
          box-shadow: 0 0 0 3px rgba(137, 187, 151, 0.25);
        }

        .admin-auth-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .admin-auth-toggle {
          border: none;
          border-radius: 10px;
          padding: 0 10px;
          height: 42px;
          background: rgba(255, 255, 255, 0.14);
          color: var(--cream);
          cursor: pointer;
        }

        .admin-auth-btn {
          margin-top: 8px;
          width: 100%;
          border: none;
          border-radius: 10px;
          height: 44px;
          background: linear-gradient(120deg, #9ad5aa 0%, #d9f2de 100%);
          color: #163522;
          font-weight: 700;
          cursor: pointer;
        }

        .admin-auth-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-auth-links {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
        }

        .admin-auth-links a {
          color: #e4f5e8;
          text-decoration: none;
        }

        .admin-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #1f4d33;
          color: #fff;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          z-index: 999;
        }

        @media (orientation: landscape) and (max-height: 430px) and (max-width: 900px) {
          .admin-auth-shell {
            padding: 10px;
            place-items: start center;
          }

          .admin-auth-card {
            max-width: 680px;
            padding: 12px 14px;
            border-radius: 12px;
          }

          .admin-auth-title {
            font-size: 1.1rem;
          }

          .admin-auth-sub {
            font-size: 0.74rem;
            margin-top: 4px;
          }

          .admin-auth-form {
            margin-top: 10px;
            gap: 8px;
          }

          .admin-auth-label {
            font-size: 0.72rem;
            margin-bottom: 3px;
          }

          .admin-auth-input {
            font-size: 0.8rem;
            padding: 8px 9px;
          }

          .admin-auth-row {
            gap: 6px;
          }

          .admin-auth-toggle {
            height: 34px;
            font-size: 0.72rem;
          }

          .admin-auth-btn {
            margin-top: 4px;
            height: 36px;
            font-size: 0.78rem;
          }

          .admin-auth-links {
            margin-top: 8px;
            font-size: 0.72rem;
            gap: 8px;
          }

          .admin-toast {
            top: 8px;
            left: 10px;
            right: 10px;
            transform: none;
            text-align: center;
            white-space: normal;
            font-size: 0.74rem;
            padding: 8px 10px;
          }
        }

        @media (max-width: 560px) {
          .admin-auth-shell {
            padding: 14px;
          }

          .admin-auth-card {
            padding: 18px;
            border-radius: 14px;
          }

          .admin-auth-title {
            font-size: 1.35rem;
          }

          .admin-auth-sub {
            font-size: 0.82rem;
          }

          .admin-auth-form {
            gap: 10px;
          }

          .admin-auth-input {
            padding: 10px;
            font-size: 0.85rem;
          }

          .admin-auth-toggle {
            height: 40px;
            padding: 0 8px;
            font-size: 0.78rem;
          }

          .admin-auth-btn {
            height: 42px;
            font-size: 0.84rem;
          }

          .admin-auth-links {
            flex-direction: column;
            align-items: flex-start;
            gap: 7px;
            font-size: 0.78rem;
          }

          .admin-toast {
            left: 12px;
            right: 12px;
            transform: none;
            text-align: center;
            font-size: 0.8rem;
            padding: 9px 12px;
          }
        }

        @media (max-width: 375px) {
          .admin-auth-shell {
            padding: 10px;
          }

          .admin-auth-card {
            padding: 14px;
            border-radius: 12px;
          }

          .admin-auth-title {
            font-size: 1.18rem;
          }

          .admin-auth-sub {
            font-size: 0.76rem;
          }

          .admin-auth-label {
            font-size: 0.73rem;
          }

          .admin-auth-input {
            font-size: 0.8rem;
          }

          .admin-auth-btn {
            font-size: 0.8rem;
          }

          .admin-auth-links {
            font-size: 0.74rem;
          }
        }
      `}</style>

      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <h1 className="admin-auth-title">Admin Panel Login</h1>
          <p className="admin-auth-sub">Manage users, surveys, emissions, analytics, and badges.</p>

          <form className="admin-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="admin-auth-label" htmlFor="admin-email">Admin Email</label>
              <input
                id="admin-email"
                className="admin-auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="admin-auth-label" htmlFor="admin-password">Password</label>
              <div className="admin-auth-row">
                <input
                  id="admin-password"
                  className="admin-auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="admin-auth-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button className="admin-auth-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="admin-auth-links">
            <Link to="/admin/signup">Create admin account</Link>
            <Link to="/login">User login</Link>
          </div>
        </div>
      </div>

      {toast && <div className="admin-toast">{toast}</div>}
    </>
  );
}
