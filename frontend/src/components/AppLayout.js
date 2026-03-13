import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AppLayout.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [user, setUser] = useState({ name: "", role: "User", avatar: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data) {
            setUser({
              name: res.data.name || "User",
              role: res.data.role || "User",
              avatar: res.data.avatar || null,
            });
          }
        })
        .catch(() => setUser((u) => ({ ...u, name: u.name || "User" })));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <span className="app-sidebar-logo-icon" aria-hidden>🌿</span>
          <span className="app-sidebar-logo-text">CarbonCalc</span>
        </div>
        <nav className="app-sidebar-nav">
          <NavLink to="/dashboard" className="app-nav-item" end>
            <span className="app-nav-icon">◉</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/survey" className="app-nav-item">
            <span className="app-nav-icon">📋</span>
            <span>Lifestyle Survey</span>
          </NavLink>
          <NavLink to="/carbon-history" className="app-nav-item">
            <span className="app-nav-icon">🕐</span>
            <span>Carbon History</span>
          </NavLink>
          <NavLink to="/badges" className="app-nav-item">
            <span className="app-nav-icon">🏅</span>
            <span>Badges</span>
          </NavLink>
          <NavLink to="/leaderboard" className="app-nav-item">
            <span className="app-nav-icon">🏆</span>
            <span>Leaderboard</span>
          </NavLink>
        </nav>
        <div className="app-sidebar-footer">
          {/* <a href="#settings" className="app-nav-item app-nav-item-util">
            <span className="app-nav-icon">⚙</span>
            <span>Settings</span>
          </a> */}
          <button type="button" className="app-nav-item app-nav-item-util app-nav-logout" onClick={handleLogout}>
            <span className="app-nav-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <p className="app-header-welcome">
            Welcome back, <strong>{user.name || "User"}</strong>
          </p>
          <div className="app-header-actions">
            <div className="app-header-profile-wrap" ref={profileRef}>
              <button
                type="button"
                className="app-header-profile-trigger"
                onClick={() => setProfileOpen((o) => !o)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="Open profile menu"
              >
                <div className="app-header-avatar">
                  {user.avatar ? <img src={user.avatar} alt="" /> : <span>{(user.name || "U").charAt(0)}</span>}
                </div>
                <div className="app-header-user-text">
                  <span className="app-header-user-name">{user.name || "User"}</span>
                  <span className="app-header-user-role">{user.role}</span>
                </div>
                <span className="app-header-profile-chevron" aria-hidden>▾</span>
              </button>
              {profileOpen && (
                <div className="app-header-profile-dropdown" role="menu">
                  <button type="button" className="app-header-dropdown-item" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                    Profile
                  </button>
                  <button type="button" className="app-header-dropdown-item app-header-dropdown-item-logout" role="menuitem" onClick={() => { setProfileOpen(false); handleLogout(); }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>

        <footer className="app-footer">
          <span>© 2024 CarbonCalc – Environmentally Conscious Tracking</span>
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;
