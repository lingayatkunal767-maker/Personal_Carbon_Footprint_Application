import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

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
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json();
      if (!data.success) {
        showToast(data.message || 'Admin login failed');
        setLoading(false);
        return;
      }

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
      showToast('Cannot reach backend server');
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
