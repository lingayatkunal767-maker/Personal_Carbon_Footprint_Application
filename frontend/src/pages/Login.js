import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import MarketingHeader from "../components/MarketingHeader";
import "./Auth.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oauthEnabled, setOauthEnabled] = useState({ google: true, github: true });
  const [notification, setNotification] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/auth/oauth-enabled`)
      .then((res) => {
        setOauthEnabled(res.data);
      })
      .catch(() => {
        // If the feature flag endpoint is missing or fails,
        // fall back to showing the social buttons.
        setOauthEnabled({ google: true, github: true });
      });
  }, []);

  const handleGoogleLogin = () => {
    localStorage.removeItem("token");
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  };

  const handleGithubLogin = () => {
    localStorage.removeItem("token");
    window.location.href = `${API_BASE}/oauth2/authorization/github`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Always hide the password again when submitting the form
    setShowPassword(false);
    setNotification({ type: "", message: "" });
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      const token = response.data.token;
const role = response.data.role;

localStorage.setItem("token", token);

setNotification({ type: "success", message: "Login successful. Redirecting..." });

setTimeout(() => {
  if (role === "ADMIN") {
    navigate("/admindashboard");
  } else {
    navigate("/dashboard");
  }
}, 800);
    } catch (err) {
      setNotification({ type: "error", message: err.response?.data || "Invalid email or password." });
    }
  };

  return (
    <div className="auth-page">
      <MarketingHeader />
      <div className="auth-page-main">
        <div className="auth-wrapper">
          <div className="auth-box auth-box--split">
            <div className="auth-split">
              <aside className="auth-panel auth-panel--visual">
                <div className="auth-visual-blob auth-visual-blob--a" aria-hidden />
                <div className="auth-visual-blob auth-visual-blob--b" aria-hidden />
                <div className="auth-visual-inner">
                  <div className="top-section">
                    <h1 className="brand">
                      <span className="leaf">🍃</span> Carbon<span>Calc</span>
                    </h1>
                    <p className="subtitle">Track &amp; Start Reducing Your Emissions</p>
                    <hr />
                  </div>
                  <div className="bottom-image" aria-hidden>
                    🌞 🌳 🌿
                  </div>
                </div>
              </aside>

              <div className="auth-panel auth-panel--form">
        <h2>Login to Your Account</h2>

        {notification.message && (
          <div className={`notification ${notification.type}`}>{notification.message}</div>
        )}

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div className="forgot">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit">Login</button>
        </form>

        {(oauthEnabled.google || oauthEnabled.github) && (
          <>
            <div className="social-login">
              <p className="social-or">or continue with</p>
              <div className="social-buttons-row">
                {oauthEnabled.google && (
                  <button
                    type="button"
                    className="social-btn google"
                    onClick={handleGoogleLogin}
                    title="Sign in with Google"
                  >
                    <span className="social-icon" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </span>
                    Google
                  </button>
                )}
                {oauthEnabled.github && (
                  <button
                    type="button"
                    className="social-btn github"
                    onClick={handleGithubLogin}
                    title="Sign in with GitHub"
                  >
                    <span className="social-icon" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </span>
                    GitHub
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <hr className="divider" />

        <p className="bottom-text">
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="auth-footer" style={{ textAlign: "center", padding: "1.5rem", color: "#666", fontSize: "0.875rem", marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <p style={{ fontWeight: 600, color: "#2e7d32", margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span aria-hidden>🌿</span> CarbonCalc
        </p>
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} CarbonCalc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
