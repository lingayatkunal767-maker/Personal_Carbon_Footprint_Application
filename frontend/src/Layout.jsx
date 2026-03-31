import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch } from "./utils/api";

function Layout() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiFetch("/api/users/me");
        setUser(data);
      } catch {
        setUser(null);
      }
    }

    loadUser();

    // 🔥 REMOVE WHITE BORDER
    document.body.style.margin = "0";
    document.body.style.background = "#f1f8f4";
  }, []);

  const handleLogout = async () => {
    // For JWT, just clear token client-side
    localStorage.removeItem('token');
    setUser(null);
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/lifestyle-survey", label: "Survey", icon: "📝" },
    { path: "/carbon-history", label: "History", icon: "📈" },
    { path: "/create-goal", label: "Goals", icon: "🎯" },
    { path: "/badges", label: "Badges", icon: "🏅" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { path: "/marketplace", label: "Marketplace", icon: "🛒" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
<<<<<<< HEAD
    { path: "/admin", label: "Admin", icon: "🛡️" },
=======
>>>>>>> 2ab7cdfe86661fd6b09e0f5629355c8d19e6aa92
  ];

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ display: "flex" }}>
      
      {/* 🔥 TOP BAR */}
      <div style={topBar}>
        <button onClick={() => setMobileOpen(true)} style={menuBtn}>☰</button>
        <span style={{ fontWeight: "bold", flex: 1 }}>🌱 CarbonCalc</span>
        {user && (
          <button onClick={handleLogout} style={topLogoutBtn}>
            🚪 Logout
          </button>
        )}
      </div>

      {/* 🔥 SIDEBAR */}
      <div
        style={{
          ...sidebar,
          width: collapsed ? "70px" : "220px",
          left: mobileOpen || !isMobile ? "0" : "-100%",
        }}
      >
        {/* Header */}
        <div style={sidebarHeader}>
          {!collapsed && <h2>🌱 CarbonCalc</h2>}
          <button onClick={() => setCollapsed(!collapsed)} style={collapseBtn}>
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        {/* Menu */}
        <div style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  ...linkStyle,
                  background: isActive ? "#a5d6a7" : "transparent",
                }}
              >
                <span>{item.icon}</span>
                {!collapsed && (
                  <span style={{ marginLeft: "10px" }}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout Section */}
        {user && (
          <div style={userSection}>
            {!collapsed && <p>👤 {user.name}</p>}
            <button onClick={handleLogout} style={logoutBtn}>
              🚪 {!collapsed && "Logout"}
            </button>
          </div>
        )}
      </div> {/* ✅ IMPORTANT: SIDEBAR CLOSED */}

      {/* 🔥 OVERLAY */}
      {mobileOpen && isMobile && (
        <div style={overlay} onClick={() => setMobileOpen(false)}></div>
      )}

      {/* 🔥 MAIN CONTENT */}
      <div
        style={{
          marginLeft: isMobile ? "0" : collapsed ? "70px" : "220px",
          padding: "20px",
          paddingTop: "60px",
          width: "100%",
          background: "#f1f8f4",
          color: "#1b5e20",
          minHeight: "100vh",
          boxSizing: "border-box",
          transition: "0.3s",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

/* 🎨 STYLES */

const sidebar = {
  position: "fixed",
  top: 0,
  height: "100vh",
  width: "220px",
  background: "#e8f5e9",
  color: "#1b5e20",
  padding: "15px",
  transition: "0.3s",
  zIndex: 1000,
  boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
};

const sidebarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const collapseBtn = {
  background: "transparent",
  border: "none",
  color: "#1b5e20",
  cursor: "pointer",
};

const linkStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px",
  margin: "8px 0",
  color: "#1b5e20",
  textDecoration: "none",
  borderRadius: "8px",
  transition: "0.2s",
};

const userSection = {
  marginTop: "auto",
  paddingTop: "10px",
};

const logoutBtn = {
  marginTop: "10px",
  padding: "10px",
  width: "100%",
  background: "#2e7d32",
  border: "none",
  color: "white",
  cursor: "pointer",
  borderRadius: "6px",
};

/* MOBILE */

const topBar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "50px",
  background: "#c8e6c9",
  color: "#1b5e20",
  display: "flex",
  alignItems: "center",
  padding: "0 15px",
  zIndex: 1100,
};

const menuBtn = {
  fontSize: "20px",
  marginRight: "10px",
  background: "transparent",
  border: "none",
  color: "#1b5e20",
};

const topLogoutBtn = {
  padding: "5px 10px",
  background: "#2e7d32",
  border: "none",
  color: "white",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "14px",
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.3)",
  zIndex: 999,
};

export default Layout;